import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface InvoiceData {
  invoice_number: string;
  order_id: string;
  store_id: string;
  subtotal: number;
  discount_amount: number;
  return_amount: number;
  total_amount: number;
  due_date: string;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
}

/**
 * Calculate due date (default: 30 days from now)
 */
function calculateDueDate(days: number = 30): string {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  return dueDate.toISOString().split('T')[0];
}

/**
 * Auto-generate invoice after order approval
 */
export async function generateInvoice(
  orderId: string,
  dueDays: number = 30
): Promise<InvoiceData> {
  const adminSupabase = getSupabaseAdmin();

  // Get order with items and store
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .select(`
      id,
      store_id,
      total_amount,
      discount_amount,
      final_amount,
      order_items (
        id,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('id', orderId)
    .single();

  if (orderError || !order) {
    throw new Error('Order not found');
  }

  // Check if invoice already exists
  const { data: existingInvoice } = await adminSupabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .single();

  if (existingInvoice) {
    throw new Error('Invoice already exists for this order');
  }

  // Calculate totals
  const orderItems = order.order_items as any[];
  const subtotal = order.total_amount || 0;
  const discount_amount = order.discount_amount || 0;
  const return_amount = 0; // Will be updated when returns are processed
  const total_amount = order.final_amount || 0;

  // Generate invoice
  const invoiceNumber = generateInvoiceNumber();
  const dueDate = calculateDueDate(dueDays);

  const { data: invoice, error: invoiceError } = await adminSupabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      order_id: orderId,
      store_id: order.store_id,
      subtotal,
      discount_amount,
      return_amount,
      total_amount,
      due_date: dueDate,
      payment_status: 'pending',
    })
    .select()
    .single();

  if (invoiceError) {
    throw new Error(`Failed to create invoice: ${invoiceError.message}`);
  }

  return {
    invoice_number: invoice.invoice_number,
    order_id: invoice.order_id,
    store_id: invoice.store_id,
    subtotal: invoice.subtotal,
    discount_amount: invoice.discount_amount,
    return_amount: invoice.return_amount,
    total_amount: invoice.total_amount,
    due_date: invoice.due_date,
  };
}

/**
 * Update invoice with return amount
 */
export async function updateInvoiceWithReturns(
  invoiceId: string,
  returnAmount: number
): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  // Get current invoice
  const { data: invoice, error: invoiceError } = await adminSupabase
    .from('invoices')
    .select('subtotal, discount_amount, return_amount')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found');
  }

  // Calculate new total
  const subtotalAfterDiscount = parseFloat(invoice.subtotal?.toString() || '0') - parseFloat(invoice.discount_amount?.toString() || '0');
  const newReturnAmount = parseFloat(invoice.return_amount?.toString() || '0') + returnAmount;
  const newTotalAmount = Math.max(0, subtotalAfterDiscount - newReturnAmount);

  // Update invoice
  const { error: updateError } = await adminSupabase
    .from('invoices')
    .update({
      return_amount: newReturnAmount,
      total_amount: newTotalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId);

  if (updateError) {
    throw new Error(`Failed to update invoice: ${updateError.message}`);
  }
}

/**
 * Get invoice by order ID
 */
export async function getInvoiceByOrderId(orderId: string): Promise<any> {
  const adminSupabase = getSupabaseAdmin();

  const { data: invoice, error } = await adminSupabase
    .from('invoices')
    .select(`
      *,
      orders (
        id,
        order_number,
        status
      ),
      stores (
        id,
        name,
        email,
        address,
        city,
        state,
        zip_code
      )
    `)
    .eq('order_id', orderId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return invoice;
}

