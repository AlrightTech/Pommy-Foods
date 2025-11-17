import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface PaymentCollectionStats {
  total_collected: number;
  cash_collected: number;
  direct_debit_collected: number;
  payment_count: number;
  cash_count: number;
  direct_debit_count: number;
}

export interface PaymentTrend {
  date: string;
  amount: number;
  count: number;
  cash_amount: number;
  direct_debit_amount: number;
}

export interface OverdueAccount {
  store_id: string;
  store_name: string;
  invoice_id: string;
  invoice_number: string;
  total_amount: number;
  days_overdue: number;
  due_date: string;
}

/**
 * Get payment collection statistics
 */
export async function getPaymentCollectionStats(
  period?: { startDate?: string; endDate?: string }
): Promise<PaymentCollectionStats> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('payments')
    .select('amount, payment_method, status')
    .eq('status', 'completed');

  if (period?.startDate) {
    query = query.gte('payment_date', period.startDate);
  }
  if (period?.endDate) {
    query = query.lte('payment_date', period.endDate);
  }

  const { data: payments, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  let totalCollected = 0;
  let cashCollected = 0;
  let directDebitCollected = 0;
  let cashCount = 0;
  let directDebitCount = 0;

  (payments || []).forEach((payment: any) => {
    const amount = parseFloat(payment.amount?.toString() || '0');
    totalCollected += amount;

    if (payment.payment_method === 'cash') {
      cashCollected += amount;
      cashCount += 1;
    } else if (payment.payment_method === 'direct_debit') {
      directDebitCollected += amount;
      directDebitCount += 1;
    }
  });

  return {
    total_collected: totalCollected,
    cash_collected: cashCollected,
    direct_debit_collected: directDebitCollected,
    payment_count: payments?.length || 0,
    cash_count: cashCount,
    direct_debit_count: directDebitCount,
  };
}

/**
 * Get payment trends over time
 */
export async function getPaymentTrends(
  period: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<PaymentTrend[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('payments')
    .select('amount, payment_method, payment_date')
    .eq('status', 'completed')
    .order('payment_date', { ascending: true });

  if (startDate) {
    query = query.gte('payment_date', startDate);
  }
  if (endDate) {
    query = query.lte('payment_date', endDate);
  }

  const { data: payments, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }

  const trendMap = new Map<string, PaymentTrend>();

  (payments || []).forEach((payment: any) => {
    const paymentDate = new Date(payment.payment_date);
    let dateKey: string;

    if (period === 'day') {
      dateKey = paymentDate.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekStart = new Date(paymentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      dateKey = weekStart.toISOString().split('T')[0];
    } else {
      dateKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
    }

    const amount = parseFloat(payment.amount?.toString() || '0');

    if (!trendMap.has(dateKey)) {
      trendMap.set(dateKey, {
        date: dateKey,
        amount: 0,
        count: 0,
        cash_amount: 0,
        direct_debit_amount: 0,
      });
    }

    const existing = trendMap.get(dateKey)!;
    existing.amount += amount;
    existing.count += 1;

    if (payment.payment_method === 'cash') {
      existing.cash_amount += amount;
    } else if (payment.payment_method === 'direct_debit') {
      existing.direct_debit_amount += amount;
    }
  });

  return Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get stores with overdue payments
 */
export async function getOverdueAccounts(): Promise<OverdueAccount[]> {
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
      stores (
        id,
        name
      )
    `)
    .eq('payment_status', 'pending')
    .lt('due_date', currentDate);

  if (error) {
    throw new Error(`Failed to fetch overdue invoices: ${error.message}`);
  }

  const overdueAccounts: OverdueAccount[] = [];

  (invoices || []).forEach((invoice: any) => {
    const store = invoice.stores;
    if (!store) return;

    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    overdueAccounts.push({
      store_id: store.id,
      store_name: store.name || 'Unknown Store',
      invoice_id: invoice.id,
      invoice_number: invoice.invoice_number,
      total_amount: parseFloat(invoice.total_amount?.toString() || '0'),
      days_overdue: daysOverdue,
      due_date: invoice.due_date,
    });
  });

  return overdueAccounts.sort((a, b) => b.days_overdue - a.days_overdue);
}

/**
 * Get payment method distribution
 */
export async function getPaymentMethodDistribution(
  startDate?: string,
  endDate?: string
): Promise<{
  cash: { amount: number; count: number; percentage: number };
  direct_debit: { amount: number; count: number; percentage: number };
}> {
  const stats = await getPaymentCollectionStats({ startDate, endDate });

  const total = stats.total_collected || 1; // Avoid division by zero

  return {
    cash: {
      amount: stats.cash_collected,
      count: stats.cash_count,
      percentage: Math.round((stats.cash_collected / total) * 100),
    },
    direct_debit: {
      amount: stats.direct_debit_collected,
      count: stats.direct_debit_count,
      percentage: Math.round((stats.direct_debit_collected / total) * 100),
    },
  };
}

