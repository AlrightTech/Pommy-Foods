import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { sendPaymentReminderNotification } from './notifications';

export interface PaymentReminder {
  id: string;
  invoice_id: string;
  store_id: string;
  reminder_sent_at: string;
  reminder_type: 'first' | 'second' | 'final';
}

/**
 * Check for overdue invoices
 */
export async function checkOverdueInvoices(): Promise<Array<{
  invoice_id: string;
  store_id: string;
  invoice_number: string;
  total_amount: number;
  due_date: string;
  days_overdue: number;
}>> {
  const adminSupabase = getSupabaseAdmin();
  const currentDate = new Date().toISOString().split('T')[0];

  const { data: invoices, error } = await adminSupabase
    .from('invoices')
    .select(`
      id,
      invoice_number,
      total_amount,
      due_date,
      payment_status,
      store_id
    `)
    .eq('payment_status', 'pending')
    .lt('due_date', currentDate);

  if (error) {
    throw new Error(`Failed to fetch overdue invoices: ${error.message}`);
  }

  const overdueInvoices: Array<{
    invoice_id: string;
    store_id: string;
    invoice_number: string;
    total_amount: number;
    due_date: string;
    days_overdue: number;
  }> = [];

  (invoices || []).forEach((invoice: any) => {
    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    overdueInvoices.push({
      invoice_id: invoice.id,
      store_id: invoice.store_id,
      invoice_number: invoice.invoice_number,
      total_amount: parseFloat(invoice.total_amount?.toString() || '0'),
      due_date: invoice.due_date,
      days_overdue: daysOverdue,
    });
  });

  return overdueInvoices.sort((a, b) => b.days_overdue - a.days_overdue);
}

/**
 * Send payment reminders for overdue invoices
 */
export async function sendPaymentReminders(): Promise<{
  sent: number;
  failed: number;
  reminders: PaymentReminder[];
}> {
  const overdueInvoices = await checkOverdueInvoices();
  const reminders: PaymentReminder[] = [];
  let sent = 0;
  let failed = 0;

  for (const invoice of overdueInvoices) {
    try {
      // Check if reminder was already sent today
      const adminSupabase = getSupabaseAdmin();
      const today = new Date().toISOString().split('T')[0];

      const { data: existingReminder } = await adminSupabase
        .from('payment_reminders')
        .select('id')
        .eq('invoice_id', invoice.invoice_id)
        .gte('reminder_sent_at', `${today}T00:00:00`)
        .maybeSingle();

      if (existingReminder) {
        continue; // Already sent today
      }

      // Determine reminder type based on days overdue
      let reminderType: 'first' | 'second' | 'final';
      if (invoice.days_overdue <= 7) {
        reminderType = 'first';
      } else if (invoice.days_overdue <= 14) {
        reminderType = 'second';
      } else {
        reminderType = 'final';
      }

      // Send notification
      await sendPaymentReminderNotification(invoice.store_id, invoice.invoice_id);

      // Create reminder record
      const { data: reminder, error: reminderError } = await adminSupabase
        .from('payment_reminders')
        .insert({
          invoice_id: invoice.invoice_id,
          store_id: invoice.store_id,
          reminder_type: reminderType,
          reminder_sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (reminderError) {
        console.error(`Failed to create reminder record for invoice ${invoice.invoice_id}:`, reminderError);
        failed += 1;
      } else {
        reminders.push(reminder as PaymentReminder);
        sent += 1;
      }
    } catch (error: any) {
      console.error(`Failed to send reminder for invoice ${invoice.invoice_id}:`, error);
      failed += 1;
    }
  }

  return { sent, failed, reminders };
}

/**
 * Create payment reminder record
 */
export async function createPaymentReminder(
  invoiceId: string,
  reminderType: 'first' | 'second' | 'final' = 'first'
): Promise<PaymentReminder> {
  const adminSupabase = getSupabaseAdmin();

  // Get invoice to get store_id
  const { data: invoice, error: invoiceError } = await adminSupabase
    .from('invoices')
    .select('store_id')
    .eq('id', invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new Error('Invoice not found');
  }

  const { data: reminder, error } = await adminSupabase
    .from('payment_reminders')
    .insert({
      invoice_id: invoiceId,
      store_id: invoice.store_id,
      reminder_type: reminderType,
      reminder_sent_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment reminder: ${error.message}`);
  }

  return reminder as PaymentReminder;
}

/**
 * Get payment reminder history for an invoice
 */
export async function getPaymentReminderHistory(invoiceId: string): Promise<PaymentReminder[]> {
  const adminSupabase = getSupabaseAdmin();

  const { data: reminders, error } = await adminSupabase
    .from('payment_reminders')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('reminder_sent_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch payment reminders: ${error.message}`);
  }

  return (reminders || []) as PaymentReminder[];
}

