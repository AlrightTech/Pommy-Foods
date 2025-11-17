import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { modifyOrderStock } from '@/lib/services/stock-management';
import { recalculateOrderTotals } from '@/lib/services/pricing';

export interface OrderItemUpdate {
  product_id: string;
  quantity: number;
  unit_price?: number; // Optional, will use product price if not provided
}

/**
 * Validate if an order can be modified
 * Only draft or pending orders can be modified
 */
export async function canModifyOrder(orderId: string): Promise<{ canModify: boolean; reason?: string }> {
  const adminSupabase = getSupabaseAdmin();

  const { data: order, error } = await adminSupabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return { canModify: false, reason: 'Order not found' };
  }

  if (order.status === 'approved' || order.status === 'completed') {
    return { canModify: false, reason: 'Cannot modify approved or completed orders' };
  }

  if (order.status === 'rejected' || order.status === 'cancelled') {
    return { canModify: false, reason: 'Cannot modify rejected or cancelled orders' };
  }

  return { canModify: true };
}

/**
 * Modify order items
 * Replaces all existing items with new items and recalculates totals
 */
export async function modifyOrderItems(
  orderId: string,
  items: OrderItemUpdate[]
): Promise<any> {
  const adminSupabase = getSupabaseAdmin();

  // Validate order can be modified
  const { canModify, reason } = await canModifyOrder(orderId);
  if (!canModify) {
    throw new Error(reason || 'Order cannot be modified');
  }

  // Get product prices if unit_price not provided
  const productIds = items.map(item => item.product_id);
  const { data: products, error: productsError } = await adminSupabase
    .from('products')
    .select('id, price')
    .in('id', productIds);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  const productPriceMap = new Map(
    (products || []).map((p: any) => [p.id, p.price])
  );

  // Prepare order items with prices
  const orderItems = items.map(item => {
    const unitPrice = item.unit_price ?? productPriceMap.get(item.product_id) ?? 0;
    return {
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: item.quantity * unitPrice,
    };
  });

  // Calculate new totals
  const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);

  // Use transaction-like approach: delete old items, insert new items, update order
  // Note: Supabase doesn't support transactions directly, so we'll do it sequentially
  // In production, consider using database functions for true transactions

  // Delete existing order items
  const { error: deleteError } = await adminSupabase
    .from('order_items')
    .delete()
    .eq('order_id', orderId);

  if (deleteError) {
    throw new Error(`Failed to delete existing items: ${deleteError.message}`);
  }

  // Insert new order items
  if (orderItems.length > 0) {
    const { error: insertError } = await adminSupabase
      .from('order_items')
      .insert(orderItems);

    if (insertError) {
      throw new Error(`Failed to insert new items: ${insertError.message}`);
    }
  }

  // Get current order items for stock calculation
  const { data: currentOrder, error: currentOrderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      store_id,
      status,
      order_items (
        id,
        product_id,
        quantity
      )
    `)
    .eq('id', orderId)
    .single();

  if (currentOrderError || !currentOrder) {
    throw new Error('Order not found');
  }

  // Update stock if order is approved (stock was already decreased)
  // For draft/pending orders, we don't update stock yet
  if (currentOrder.status === 'approved') {
    const oldItems = (currentOrder.order_items as any[]).map((item: any) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));
    const newItems = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    try {
      await modifyOrderStock(
        orderId,
        oldItems,
        newItems,
        currentOrder.store_id
      );
    } catch (stockError: any) {
      // Log but don't fail the order update if stock update fails
      console.error('Failed to update stock during order modification:', stockError);
    }
  }

  // Recalculate totals with discount
  const { data: orderWithDiscount } = await adminSupabase
    .from('orders')
    .select('discount_amount')
    .eq('id', orderId)
    .single();

  const discountAmount = orderWithDiscount?.discount_amount || 0;
  const totals = await recalculateOrderTotals(orderId, discountAmount);

  // Fetch updated order
  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from('orders')
    .select(`
      *,
      stores (id, name, email),
      order_items (
        *,
        products (id, name, sku, price)
      )
    `)
    .eq('id', orderId)
    .single();

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  return updatedOrder;
}

/**
 * Add items to an existing order
 */
export async function addOrderItems(
  orderId: string,
  items: OrderItemUpdate[]
): Promise<any> {
  const adminSupabase = getSupabaseAdmin();

  // Validate order can be modified
  const { canModify, reason } = await canModifyOrder(orderId);
  if (!canModify) {
    throw new Error(reason || 'Order cannot be modified');
  }

  // Get existing order
  const { data: existingOrder, error: orderError } = await adminSupabase
    .from('orders')
    .select('id, total_amount')
    .eq('id', orderId)
    .single();

  if (orderError || !existingOrder) {
    throw new Error('Order not found');
  }

  // Get product prices
  const productIds = items.map(item => item.product_id);
  const { data: products, error: productsError } = await adminSupabase
    .from('products')
    .select('id, price')
    .in('id', productIds);

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  const productPriceMap = new Map(
    (products || []).map((p: any) => [p.id, p.price])
  );

  // Prepare new order items
  const newOrderItems = items.map(item => {
    const unitPrice = item.unit_price ?? productPriceMap.get(item.product_id) ?? 0;
    return {
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: unitPrice,
      total_price: item.quantity * unitPrice,
    };
  });

  // Calculate additional amount
  const additionalAmount = newOrderItems.reduce((sum, item) => sum + item.total_price, 0);
  const newTotalAmount = (existingOrder.total_amount || 0) + additionalAmount;

  // Insert new items
  const { error: insertError } = await adminSupabase
    .from('order_items')
    .insert(newOrderItems);

  if (insertError) {
    throw new Error(`Failed to add items: ${insertError.message}`);
  }

  // Update order totals
  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from('orders')
    .update({
      total_amount: newTotalAmount,
      final_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select(`
      *,
      stores (id, name, email),
      order_items (
        *,
        products (id, name, sku, price)
      )
    `)
    .single();

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  return updatedOrder;
}

/**
 * Remove items from an order
 */
export async function removeOrderItems(
  orderId: string,
  itemIds: string[]
): Promise<any> {
  const adminSupabase = getSupabaseAdmin();

  // Validate order can be modified
  const { canModify, reason } = await canModifyOrder(orderId);
  if (!canModify) {
    throw new Error(reason || 'Order cannot be modified');
  }

  // Get items to be removed to calculate amount to subtract
  const { data: itemsToRemove, error: itemsError } = await adminSupabase
    .from('order_items')
    .select('total_price')
    .in('id', itemIds)
    .eq('order_id', orderId);

  if (itemsError) {
    throw new Error(`Failed to fetch items: ${itemsError.message}`);
  }

  const amountToSubtract = (itemsToRemove || []).reduce(
    (sum, item) => sum + (item.total_price || 0),
    0
  );

  // Get current order total
  const { data: existingOrder, error: orderError } = await adminSupabase
    .from('orders')
    .select('id, total_amount')
    .eq('id', orderId)
    .single();

  if (orderError || !existingOrder) {
    throw new Error('Order not found');
  }

  // Delete items
  const { error: deleteError } = await adminSupabase
    .from('order_items')
    .delete()
    .in('id', itemIds)
    .eq('order_id', orderId);

  if (deleteError) {
    throw new Error(`Failed to remove items: ${deleteError.message}`);
  }

  // Update order totals
  const newTotalAmount = Math.max(0, (existingOrder.total_amount || 0) - amountToSubtract);

  const { data: updatedOrder, error: updateError } = await adminSupabase
    .from('orders')
    .update({
      total_amount: newTotalAmount,
      final_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select(`
      *,
      stores (id, name, email),
      order_items (
        *,
        products (id, name, sku, price)
      )
    `)
    .single();

  if (updateError) {
    throw new Error(`Failed to update order: ${updateError.message}`);
  }

  return updatedOrder;
}

