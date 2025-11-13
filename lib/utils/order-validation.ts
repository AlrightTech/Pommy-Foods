import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate order before approval
 * Checks credit limit, order status, and order items
 */
export async function validateOrderForApproval(orderId: string): Promise<ValidationResult> {
  const adminSupabase = getSupabaseAdmin();
  const errors: string[] = [];

  // Get order with store and items
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      status,
      final_amount,
      store_id,
      stores (
        id,
        credit_limit,
        current_balance,
        is_active
      ),
      order_items (
        id,
        product_id,
        quantity,
        products (id, is_active)
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    return {
      isValid: false,
      errors: ['Order not found'],
    };
  }

  // Check order status
  if (order.status !== 'draft' && order.status !== 'pending') {
    errors.push(`Order cannot be approved. Current status: ${order.status}`);
  }

  // Check store is active
  const store = order.stores as any;
  if (!store || !store.is_active) {
    errors.push('Store is not active');
  }

  // Check credit limit
  const creditLimit = parseFloat(store?.credit_limit || '0');
  const currentBalance = parseFloat(store?.current_balance || '0');
  const orderAmount = parseFloat(order.final_amount || '0');
  const newBalance = currentBalance + orderAmount;

  if (creditLimit > 0 && newBalance > creditLimit) {
    errors.push(
      `Order would exceed credit limit. Current balance: ${currentBalance}, Order amount: ${orderAmount}, Credit limit: ${creditLimit}`
    );
  }

  // Check order has items
  const orderItems = order.order_items as any[];
  if (!orderItems || orderItems.length === 0) {
    errors.push('Order has no items');
  }

  // Check all products are active
  const inactiveProducts = orderItems.filter((item: any) => {
    const product = item.products;
    return !product || !product.is_active;
  });

  if (inactiveProducts.length > 0) {
    errors.push('Order contains inactive products');
  }

  // Check quantities are positive
  const invalidQuantities = orderItems.filter((item: any) => item.quantity <= 0);
  if (invalidQuantities.length > 0) {
    errors.push('Order contains items with invalid quantities');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate order items before creation/update
 */
export function validateOrderItems(items: Array<{
  product_id: string;
  quantity: number;
  unit_price?: number;
}>): ValidationResult {
  const errors: string[] = [];

  if (!items || items.length === 0) {
    errors.push('Order must have at least one item');
    return { isValid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.product_id) {
      errors.push(`Item ${index + 1}: Product ID is required`);
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
    }

    if (item.unit_price !== undefined && item.unit_price < 0) {
      errors.push(`Item ${index + 1}: Unit price cannot be negative`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if order can transition to a new status
 */
export function canTransitionStatus(
  currentStatus: string,
  newStatus: string
): { canTransition: boolean; reason?: string } {
  const validTransitions: Record<string, string[]> = {
    draft: ['pending', 'approved', 'rejected', 'cancelled'],
    pending: ['approved', 'rejected', 'cancelled'],
    approved: ['completed', 'cancelled'],
    rejected: [], // Cannot transition from rejected
    completed: [], // Cannot transition from completed
    cancelled: [], // Cannot transition from cancelled
  };

  const allowedStatuses = validTransitions[currentStatus] || [];

  if (!allowedStatuses.includes(newStatus)) {
    return {
      canTransition: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  return { canTransition: true };
}

