import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface StockUpdate {
  store_id: string;
  product_id: string;
  quantity: number;
  reason: 'order_approved' | 'order_cancelled' | 'order_modified' | 'manual_adjustment' | 'wastage' | 'return' | 'delivery';
  order_id?: string;
  notes?: string;
  updated_by?: string;
}

export interface StockValidationResult {
  isValid: boolean;
  errors: string[];
  insufficientStock: Array<{
    product_id: string;
    product_name: string;
    required: number;
    available: number;
  }>;
}

/**
 * Update stock levels for products
 * Handles both increases and decreases based on reason
 */
export async function updateStock(update: StockUpdate): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  // Get current stock level
  const { data: currentStock, error: stockError } = await adminSupabase
    .from('store_stock')
    .select('id, current_stock')
    .eq('store_id', update.store_id)
    .eq('product_id', update.product_id)
    .single();

  if (stockError && stockError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch stock: ${stockError.message}`);
  }

  const currentStockLevel = currentStock?.current_stock || 0;
  
  // Determine new stock level based on reason
  let newStockLevel: number;
  
  switch (update.reason) {
    case 'order_approved':
    case 'delivery':
      // Decrease stock when order is approved/delivered
      newStockLevel = currentStockLevel - update.quantity;
      if (newStockLevel < 0) {
        throw new Error(`Insufficient stock. Available: ${currentStockLevel}, Required: ${update.quantity}`);
      }
      break;
    
    case 'order_cancelled':
    case 'return':
      // Increase stock when order is cancelled or items are returned
      newStockLevel = currentStockLevel + update.quantity;
      break;
    
    case 'order_modified':
      // This is handled separately in modifyOrderStock
      throw new Error('Use modifyOrderStock for order modifications');
    
    case 'manual_adjustment':
    case 'wastage':
      // Direct adjustment (can be positive or negative)
      newStockLevel = currentStockLevel + update.quantity;
      if (newStockLevel < 0) {
        throw new Error(`Stock adjustment would result in negative stock. Current: ${currentStockLevel}, Adjustment: ${update.quantity}`);
      }
      break;
    
    default:
      throw new Error(`Unknown stock update reason: ${update.reason}`);
  }

  // Upsert stock record
  const stockData: any = {
    store_id: update.store_id,
    product_id: update.product_id,
    current_stock: newStockLevel,
    last_updated: new Date().toISOString(),
    updated_by: update.updated_by || null,
  };

  if (currentStock) {
    // Update existing stock
    const { error: updateError } = await adminSupabase
      .from('store_stock')
      .update(stockData)
      .eq('id', currentStock.id);

    if (updateError) {
      throw new Error(`Failed to update stock: ${updateError.message}`);
    }
  } else {
    // Create new stock record
    const { error: insertError } = await adminSupabase
      .from('store_stock')
      .insert(stockData);

    if (insertError) {
      throw new Error(`Failed to create stock record: ${insertError.message}`);
    }
  }
}

/**
 * Validate stock availability before order approval
 */
export async function validateStockAvailability(
  orderId: string
): Promise<StockValidationResult> {
  const adminSupabase = getSupabaseAdmin();
  const errors: string[] = [];
  const insufficientStock: StockValidationResult['insufficientStock'] = [];

  // Get order with items
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      store_id,
      status,
      order_items (
        id,
        product_id,
        quantity,
        products (
          id,
          name,
          sku
        )
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return {
      isValid: false,
      errors: ['Order not found'],
      insufficientStock: [],
    };
  }

  // Only validate for draft/pending orders
  if (order.status !== 'draft' && order.status !== 'pending') {
    return {
      isValid: false,
      errors: [`Cannot validate stock for order with status: ${order.status}`],
      insufficientStock: [],
    };
  }

  const orderItems = order.order_items as any[];
  if (!orderItems || orderItems.length === 0) {
    return {
      isValid: false,
      errors: ['Order has no items'],
      insufficientStock: [],
    };
  }

  // Get current stock levels for all products
  const productIds = orderItems.map((item: any) => item.product_id);
  const { data: stockLevels, error: stockError } = await adminSupabase
    .from('store_stock')
    .select('product_id, current_stock')
    .eq('store_id', order.store_id)
    .in('product_id', productIds);

  if (stockError) {
    return {
      isValid: false,
      errors: [`Failed to fetch stock levels: ${stockError.message}`],
      insufficientStock: [],
    };
  }

  // Create a map of current stock levels
  const stockMap = new Map(
    (stockLevels || []).map((s: any) => [s.product_id, s.current_stock])
  );

  // Validate each order item
  for (const item of orderItems) {
    const requiredQuantity = item.quantity;
    const availableStock = stockMap.get(item.product_id) || 0;
    const product = item.products;

    if (availableStock < requiredQuantity) {
      insufficientStock.push({
        product_id: item.product_id,
        product_name: product?.name || 'Unknown Product',
        required: requiredQuantity,
        available: availableStock,
      });

      errors.push(
        `Insufficient stock for ${product?.name || item.product_id}. Required: ${requiredQuantity}, Available: ${availableStock}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    insufficientStock,
  };
}

/**
 * Update stock for order modification
 * Handles the difference between old and new quantities
 */
export async function modifyOrderStock(
  orderId: string,
  oldItems: Array<{ product_id: string; quantity: number }>,
  newItems: Array<{ product_id: string; quantity: number }>,
  storeId: string,
  updatedBy?: string
): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  // Create maps for easy lookup
  const oldItemsMap = new Map(
    oldItems.map(item => [item.product_id, item.quantity])
  );
  const newItemsMap = new Map(
    newItems.map(item => [item.product_id, item.quantity])
  );

  // Get all unique product IDs
  const allProductIds = new Set([
    ...oldItems.map(item => item.product_id),
    ...newItems.map(item => item.product_id),
  ]);

  // Process each product
  for (const productId of allProductIds) {
    const oldQuantity = oldItemsMap.get(productId) || 0;
    const newQuantity = newItemsMap.get(productId) || 0;
    const difference = newQuantity - oldQuantity;

    if (difference === 0) {
      continue; // No change
    }

    // Get current stock
    const { data: currentStock, error: stockError } = await adminSupabase
      .from('store_stock')
      .select('id, current_stock')
      .eq('store_id', storeId)
      .eq('product_id', productId)
      .single();

    const currentStockLevel = currentStock?.current_stock || 0;

    if (difference > 0) {
      // Quantity increased - need to check availability
      if (currentStockLevel < difference) {
        throw new Error(
          `Insufficient stock for product ${productId}. Available: ${currentStockLevel}, Additional required: ${difference}`
        );
      }
    }

    // Calculate new stock level
    // If quantity increased, stock decreases (more items ordered)
    // If quantity decreased, stock increases (fewer items ordered)
    const newStockLevel = currentStockLevel - difference;

    if (newStockLevel < 0) {
      throw new Error(
        `Stock adjustment would result in negative stock for product ${productId}`
      );
    }

    // Update stock
    const stockData: any = {
      store_id: storeId,
      product_id: productId,
      current_stock: newStockLevel,
      last_updated: new Date().toISOString(),
      updated_by: updatedBy || null,
    };

    if (currentStock) {
      const { error: updateError } = await adminSupabase
        .from('store_stock')
        .update(stockData)
        .eq('id', currentStock.id);

      if (updateError) {
        throw new Error(`Failed to update stock: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await adminSupabase
        .from('store_stock')
        .insert(stockData);

      if (insertError) {
        throw new Error(`Failed to create stock record: ${insertError.message}`);
      }
    }
  }
}

/**
 * Get stock level for a specific product at a store
 */
export async function getStockLevel(
  storeId: string,
  productId: string
): Promise<number> {
  const adminSupabase = getSupabaseAdmin();

  const { data: stock, error } = await adminSupabase
    .from('store_stock')
    .select('current_stock')
    .eq('store_id', storeId)
    .eq('product_id', productId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch stock: ${error.message}`);
  }

  return stock?.current_stock || 0;
}

/**
 * Get stock levels for multiple products at a store
 */
export async function getStockLevels(
  storeId: string,
  productIds: string[]
): Promise<Map<string, number>> {
  const adminSupabase = getSupabaseAdmin();

  const { data: stockLevels, error } = await adminSupabase
    .from('store_stock')
    .select('product_id, current_stock')
    .eq('store_id', storeId)
    .in('product_id', productIds);

  if (error) {
    throw new Error(`Failed to fetch stock levels: ${error.message}`);
  }

  const stockMap = new Map<string, number>();
  (stockLevels || []).forEach((stock: any) => {
    stockMap.set(stock.product_id, stock.current_stock);
  });

  // Set 0 for products without stock records
  productIds.forEach(productId => {
    if (!stockMap.has(productId)) {
      stockMap.set(productId, 0);
    }
  });

  return stockMap;
}

