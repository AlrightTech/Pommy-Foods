import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { updateStock } from './stock-management';
import { updateInvoiceWithReturns } from './invoice-generation';

export interface ReturnItem {
  product_id: string;
  quantity: number;
  batch_number?: string;
  expiry_date?: string;
  reason?: 'expired' | 'damaged' | 'unsold';
  notes?: string;
}

export interface ReturnValidationResult {
  isValid: boolean;
  errors: string[];
  invalidItems: Array<{
    product_id: string;
    product_name: string;
    reason: string;
  }>;
}

/**
 * Validate return items - only expired items are accepted
 */
export async function validateReturnItems(
  deliveryId: string,
  returns: ReturnItem[]
): Promise<ReturnValidationResult> {
  const adminSupabase = getSupabaseAdmin();
  const errors: string[] = [];
  const invalidItems: ReturnValidationResult['invalidItems'] = [];

  // Get delivery with order items
  const { data: delivery, error: deliveryError } = await adminSupabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      orders (
        id,
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
      )
    `)
    .eq('id', deliveryId)
    .single();

  if (deliveryError || !delivery) {
    return {
      isValid: false,
      errors: ['Delivery not found'],
      invalidItems: [],
    };
  }

  const orderItems = (delivery.orders as any)?.order_items || [];
  const orderItemsMap = new Map(
    orderItems.map((item: any) => [item.product_id, item as { product_id: string; quantity: number; products?: any }])
  );

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Validate each return item
  for (const returnItem of returns) {
    const orderItem = orderItemsMap.get(returnItem.product_id);
    
    if (!orderItem) {
      errors.push(`Product ${returnItem.product_id} not found in order`);
      invalidItems.push({
        product_id: returnItem.product_id,
        product_name: 'Unknown',
        reason: 'Product not in order',
      });
      continue;
    }

    // Check if quantity exceeds order quantity
    const orderQuantity = (orderItem as any).quantity || 0;
    if (returnItem.quantity > orderQuantity) {
      errors.push(
        `Return quantity (${returnItem.quantity}) exceeds order quantity (${orderQuantity}) for product ${(orderItem as any).products?.name || returnItem.product_id}`
      );
      invalidItems.push({
        product_id: returnItem.product_id,
        product_name: (orderItem as any).products?.name || 'Unknown',
        reason: 'Quantity exceeds order',
      });
      continue;
    }

    // Validate expiry date if provided
    if (returnItem.expiry_date) {
      const expiryDate = new Date(returnItem.expiry_date);
      expiryDate.setHours(0, 0, 0, 0);

      // Only accept expired items (expiry_date < current_date)
      if (expiryDate >= currentDate) {
        errors.push(
          `Item ${(orderItem as any).products?.name || returnItem.product_id} is not expired. Expiry date: ${returnItem.expiry_date}`
        );
        invalidItems.push({
          product_id: returnItem.product_id,
          product_name: (orderItem as any).products?.name || 'Unknown',
          reason: 'Item not expired',
        });
        continue;
      }
    } else {
      // If no expiry date provided, require reason to be 'expired' and validate
      if (returnItem.reason !== 'expired') {
        errors.push(
          `Expiry date required for product ${(orderItem as any).products?.name || returnItem.product_id}. Only expired items can be returned.`
        );
        invalidItems.push({
          product_id: returnItem.product_id,
          product_name: (orderItem as any).products?.name || 'Unknown',
          reason: 'Expiry date required',
        });
        continue;
      }
    }

    // Validate reason
    if (returnItem.reason && !['expired', 'damaged', 'unsold'].includes(returnItem.reason)) {
      errors.push(`Invalid reason: ${returnItem.reason}. Must be: expired, damaged, or unsold`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    invalidItems,
  };
}

/**
 * Calculate return amount based on original order item prices
 */
export async function calculateReturnAmount(
  orderId: string,
  returns: ReturnItem[]
): Promise<number> {
  const adminSupabase = getSupabaseAdmin();

  // Get order items with prices
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      order_items (
        id,
        product_id,
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
  const orderItemsMap = new Map(
    orderItems.map((item: any) => [item.product_id, item])
  );

  let totalReturnAmount = 0;

  for (const returnItem of returns) {
    const orderItem = orderItemsMap.get(returnItem.product_id);
    if (orderItem) {
      const unitPrice = parseFloat(orderItem.unit_price?.toString() || '0');
      const returnValue = unitPrice * returnItem.quantity;
      totalReturnAmount += returnValue;
    }
  }

  return totalReturnAmount;
}

/**
 * Process returns and update invoice and stock
 */
export async function processReturns(
  deliveryId: string,
  returns: ReturnItem[],
  returnedBy: string
): Promise<{
  returns: any[];
  invoice: any;
  totalReturnAmount: number;
}> {
  const adminSupabase = getSupabaseAdmin();

  // Validate returns
  const validation = await validateReturnItems(deliveryId, returns);
  if (!validation.isValid) {
    throw new Error(`Return validation failed: ${validation.errors.join(', ')}`);
  }

  // Get delivery with order and invoice
  const { data: delivery, error: deliveryError } = await adminSupabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      orders (
        id,
        store_id,
        invoices (
          id,
          invoice_number
        )
      )
    `)
    .eq('id', deliveryId)
    .single();

  if (deliveryError || !delivery) {
    throw new Error('Delivery not found');
  }

  const order = delivery.orders as any;
  const invoice = order?.invoices?.[0];

  if (!invoice) {
    throw new Error('Invoice not found for this order. Please ensure the order has been approved and invoice generated.');
  }

  // Calculate return amount
  const totalReturnAmount = await calculateReturnAmount(order.id, returns);

  // Create return records
  const returnRecords = returns.map((returnItem) => ({
    delivery_id: deliveryId,
    product_id: returnItem.product_id,
    quantity: returnItem.quantity,
    batch_number: returnItem.batch_number || null,
    expiry_date: returnItem.expiry_date || null,
    reason: returnItem.reason || 'expired',
    returned_at: new Date().toISOString(),
    returned_by: returnedBy,
    notes: returnItem.notes || null,
  }));

  const { data: createdReturns, error: returnsError } = await adminSupabase
    .from('returns')
    .insert(returnRecords)
    .select(`
      *,
      products (
        id,
        name,
        sku
      )
    `);

  if (returnsError) {
    throw new Error(`Failed to create return records: ${returnsError.message}`);
  }

  // Update invoice with return amount
  await updateInvoiceWithReturns(invoice.id, totalReturnAmount);

  // Update stock levels (increase stock for returned items)
  for (const returnItem of returns) {
    try {
      await updateStock({
        store_id: order.store_id,
        product_id: returnItem.product_id,
        quantity: returnItem.quantity,
        reason: 'return',
        order_id: order.id,
        notes: `Return: ${returnItem.reason || 'expired'}`,
        updated_by: returnedBy,
      });
    } catch (stockError: any) {
      console.error(`Failed to update stock for product ${returnItem.product_id}:`, stockError);
      // Continue with other items even if one fails
    }
  }

  // Get updated invoice
  const { data: updatedInvoice, error: invoiceError } = await adminSupabase
    .from('invoices')
    .select('*')
    .eq('id', invoice.id)
    .single();

  if (invoiceError) {
    console.error('Failed to fetch updated invoice:', invoiceError);
  }

  return {
    returns: createdReturns || [],
    invoice: updatedInvoice || invoice,
    totalReturnAmount,
  };
}

/**
 * Get returns for a delivery
 */
export async function getReturnsForDelivery(deliveryId: string): Promise<any[]> {
  const adminSupabase = getSupabaseAdmin();

  const { data: returns, error } = await adminSupabase
    .from('returns')
    .select(`
      *,
      products (
        id,
        name,
        sku,
        price
      )
    `)
    .eq('delivery_id', deliveryId)
    .order('returned_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch returns: ${error.message}`);
  }

  return returns || [];
}

