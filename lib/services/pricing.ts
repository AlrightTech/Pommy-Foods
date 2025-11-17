import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface PricingRule {
  product_id: string;
  store_id?: string; // If null, applies to all stores
  price: number;
  is_override: boolean; // If true, overrides base price
  valid_from?: string;
  valid_to?: string;
}

/**
 * Get price for a product, considering store-level pricing and overrides
 * Priority: Store override > Store-specific price > Base product price
 */
export async function getProductPrice(
  productId: string,
  storeId?: string
): Promise<number> {
  const adminSupabase = getSupabaseAdmin();

  // First, get base product price
  const { data: product, error: productError } = await adminSupabase
    .from('products')
    .select('id, price')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    throw new Error(`Product not found: ${productId}`);
  }

  let finalPrice = product.price;

  // If store_id is provided, check for store-specific pricing
  if (storeId) {
    // Check for store-specific pricing rules (if they exist in a pricing_rules table)
    // For now, we'll use the base price
    // TODO: Implement pricing_rules table if needed
  }

  return finalPrice;
}

/**
 * Get prices for multiple products
 */
export async function getProductPrices(
  productIds: string[],
  storeId?: string
): Promise<Map<string, number>> {
  const adminSupabase = getSupabaseAdmin();

  const { data: products, error } = await adminSupabase
    .from('products')
    .select('id, price')
    .in('id', productIds);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  const priceMap = new Map<string, number>();
  (products || []).forEach((product: any) => {
    priceMap.set(product.id, product.price);
  });

  // TODO: Apply store-specific pricing rules if storeId is provided

  return priceMap;
}

/**
 * Calculate order totals including discounts and tax
 */
export interface OrderTotals {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  final_amount: number;
}

export function calculateOrderTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  discountAmount: number = 0,
  taxRate: number = 0
): OrderTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const discount_amount = Math.min(discountAmount, subtotal); // Discount can't exceed subtotal
  const subtotalAfterDiscount = subtotal - discount_amount;
  const tax_amount = subtotalAfterDiscount * (taxRate / 100);
  const total_amount = subtotalAfterDiscount + tax_amount;
  const final_amount = Math.max(0, total_amount); // Ensure non-negative

  return {
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    final_amount,
  };
}

/**
 * Recalculate order totals based on current items and discounts
 */
export async function recalculateOrderTotals(
  orderId: string,
  discountAmount?: number,
  taxRate: number = 0
): Promise<OrderTotals> {
  const adminSupabase = getSupabaseAdmin();

  // Get order with items
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      discount_amount,
      order_items (
        id,
        quantity,
        unit_price
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found');
  }

  const orderItems = order.order_items as any[];
  const items = orderItems.map((item: any) => ({
    quantity: item.quantity,
    unit_price: item.unit_price,
  }));

  const discount = discountAmount !== undefined ? discountAmount : (order.discount_amount || 0);
  const totals = calculateOrderTotals(items, discount, taxRate);

  // Update order with new totals
  await adminSupabase
    .from('orders')
    .update({
      total_amount: totals.subtotal,
      discount_amount: totals.discount_amount,
      final_amount: totals.final_amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId);

  return totals;
}

