import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ReplenishmentItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock_level: number;
  suggested_quantity: number;
  unit_price: number;
}

export interface ReplenishmentOrder {
  store_id: string;
  store_name: string;
  items: ReplenishmentItem[];
  total_amount: number;
}

/**
 * Check if a store needs replenishment for any products
 * Returns products where current_stock < min_stock_level
 */
export async function checkStoreReplenishmentNeeds(storeId: string): Promise<ReplenishmentItem[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get all products with their stock levels for this store
  const { data: storeStock, error: stockError } = await adminSupabase
    .from('store_stock')
    .select(`
      product_id,
      current_stock,
      products (
        id,
        name,
        sku,
        price,
        min_stock_level,
        is_active
      )
    `)
    .eq('store_id', storeId);

  if (stockError) {
    throw new Error(`Failed to fetch store stock: ${stockError.message}`);
  }

  // Get all active products to check if store has stock record
  const { data: allProducts, error: productsError } = await adminSupabase
    .from('products')
    .select('id, name, sku, price, min_stock_level')
    .eq('is_active', true);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  const replenishmentItems: ReplenishmentItem[] = [];

  // Check products that have stock records
  if (storeStock) {
    for (const stock of storeStock) {
      const product = stock.products as any;
      if (!product || !product.is_active) continue;

      const currentStock = stock.current_stock || 0;
      const minStock = product.min_stock_level || 0;

      if (currentStock < minStock) {
        // Calculate suggested quantity: bring stock to 2x min_stock_level
        const suggestedQuantity = Math.max(
          (minStock * 2) - currentStock,
          minStock // At least bring to min_stock_level
        );

        replenishmentItems.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: currentStock,
          min_stock_level: minStock,
          suggested_quantity: suggestedQuantity,
          unit_price: product.price || 0,
        });
      }
    }
  }

  // Check products that don't have stock records (treat as 0 stock)
  const stockProductIds = new Set(storeStock?.map(s => s.product_id) || []);
  for (const product of allProducts || []) {
    if (!stockProductIds.has(product.id)) {
      const minStock = product.min_stock_level || 0;
      if (minStock > 0) {
        // No stock record means 0 stock, so needs replenishment
        const suggestedQuantity = minStock * 2;

        replenishmentItems.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: 0,
          min_stock_level: minStock,
          suggested_quantity: suggestedQuantity,
          unit_price: product.price || 0,
        });
      }
    }
  }

  return replenishmentItems;
}

/**
 * Check if there's already a draft order for a store/product combination
 */
export async function hasExistingDraftOrder(
  storeId: string,
  productIds: string[]
): Promise<boolean> {
  const adminSupabase = getSupabaseAdmin();

  const { data: existingOrders, error } = await adminSupabase
    .from('orders')
    .select(`
      id,
      order_items (product_id)
    `)
    .eq('store_id', storeId)
    .in('status', ['draft', 'pending']);

  if (error) {
    throw new Error(`Failed to check existing orders: ${error.message}`);
  }

  if (!existingOrders || existingOrders.length === 0) {
    return false;
  }

  // Check if any existing draft order contains any of the products we want to replenish
  for (const order of existingOrders) {
    const orderItems = order.order_items as any[];
    const orderProductIds = orderItems.map((item: any) => item.product_id);
    
    // Check if there's overlap
    const hasOverlap = productIds.some(id => orderProductIds.includes(id));
    if (hasOverlap) {
      return true;
    }
  }

  return false;
}

/**
 * Generate replenishment order for a store
 * Returns the created order or null if no replenishment needed or draft exists
 */
export async function generateReplenishmentOrder(storeId: string): Promise<any | null> {
  const adminSupabase = getSupabaseAdmin();

  // Check replenishment needs
  const replenishmentItems = await checkStoreReplenishmentNeeds(storeId);

  if (replenishmentItems.length === 0) {
    return null; // No replenishment needed
  }

  const productIds = replenishmentItems.map(item => item.product_id);

  // Check if draft order already exists
  const hasDraft = await hasExistingDraftOrder(storeId, productIds);
  if (hasDraft) {
    return null; // Draft order already exists
  }

  // Get store info
  const { data: store, error: storeError } = await adminSupabase
    .from('stores')
    .select('id, name, email')
    .eq('id', storeId)
    .single();

  if (storeError || !store) {
    throw new Error(`Store not found: ${storeId}`);
  }

  // Calculate totals
  const totalAmount = replenishmentItems.reduce((sum, item) => {
    return sum + (item.suggested_quantity * item.unit_price);
  }, 0);

  // Generate order number
  const orderNumber = `REPL-${Date.now()}-${storeId.substring(0, 8)}`;

  // Create order in draft status
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      store_id: storeId,
      status: 'draft',
      total_amount: totalAmount,
      final_amount: totalAmount,
      notes: 'Auto-generated replenishment order',
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(`Failed to create order: ${orderError.message}`);
  }

  // Create order items
  const orderItems = replenishmentItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.suggested_quantity,
    unit_price: item.unit_price,
    total_price: item.suggested_quantity * item.unit_price,
  }));

  const { error: itemsError } = await adminSupabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) {
    // Rollback: delete the order if items insertion fails
    await adminSupabase.from('orders').delete().eq('id', order.id);
    throw new Error(`Failed to create order items: ${itemsError.message}`);
  }

  // Fetch the complete order with items
  const { data: completeOrder, error: fetchError } = await adminSupabase
    .from('orders')
    .select(`
      *,
      stores (id, name, email),
      order_items (
        *,
        products (id, name, sku, price)
      )
    `)
    .eq('id', order.id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch created order: ${fetchError.message}`);
  }

  return completeOrder;
}

/**
 * Check all stores for replenishment needs and generate orders
 * Returns array of generated orders
 */
export async function generateAllReplenishmentOrders(): Promise<any[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get all active stores
  const { data: stores, error: storesError } = await adminSupabase
    .from('stores')
    .select('id, name')
    .eq('is_active', true);

  if (storesError) {
    throw new Error(`Failed to fetch stores: ${storesError.message}`);
  }

  const generatedOrders: any[] = [];

  // Generate replenishment orders for each store
  for (const store of stores || []) {
    try {
      const order = await generateReplenishmentOrder(store.id);
      if (order) {
        generatedOrders.push(order);
      }
    } catch (error) {
      console.error(`Failed to generate order for store ${store.id}:`, error);
      // Continue with other stores even if one fails
    }
  }

  return generatedOrders;
}

