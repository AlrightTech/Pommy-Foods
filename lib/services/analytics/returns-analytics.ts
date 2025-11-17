import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ReturnsByProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_value: number;
  return_count: number;
}

export interface ReturnsByStore {
  store_id: string;
  store_name: string;
  total_quantity: number;
  total_value: number;
  return_count: number;
}

export interface WastageTrend {
  date: string;
  quantity: number;
  value: number;
  count: number;
}

/**
 * Get returns grouped by product
 */
export async function getReturnsByProduct(
  startDate?: string,
  endDate?: string
): Promise<ReturnsByProduct[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('returns')
    .select(`
      quantity,
      reason,
      products (
        id,
        name,
        price
      )
    `);

  if (startDate) {
    query = query.gte('returned_at', startDate);
  }
  if (endDate) {
    query = query.lte('returned_at', endDate);
  }

  const { data: returns, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch returns: ${error.message}`);
  }

  const productMap = new Map<string, ReturnsByProduct>();

  (returns || []).forEach((ret: any) => {
    const product = ret.products;
    if (!product) return;

    const productId = product.id;
    const quantity = ret.quantity || 0;
    const price = parseFloat(product.price?.toString() || '0');
    const value = quantity * price;

    if (!productMap.has(productId)) {
      productMap.set(productId, {
        product_id: productId,
        product_name: product.name || 'Unknown',
        total_quantity: 0,
        total_value: 0,
        return_count: 0,
      });
    }

    const existing = productMap.get(productId)!;
    existing.total_quantity += quantity;
    existing.total_value += value;
    existing.return_count += 1;
  });

  return Array.from(productMap.values()).sort((a, b) => b.total_value - a.total_value);
}

/**
 * Get returns grouped by store
 */
export async function getReturnsByStore(
  startDate?: string,
  endDate?: string
): Promise<ReturnsByStore[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get returns with delivery -> order -> store
  let query = adminSupabase
    .from('returns')
    .select(`
      quantity,
      deliveries (
        id,
        orders (
          id,
          store_id,
          stores (
            id,
            name
          )
        )
      ),
      products (
        id,
        price
      )
    `);

  if (startDate) {
    query = query.gte('returned_at', startDate);
  }
  if (endDate) {
    query = query.lte('returned_at', endDate);
  }

  const { data: returns, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch returns: ${error.message}`);
  }

  const storeMap = new Map<string, ReturnsByStore>();

  (returns || []).forEach((ret: any) => {
    const delivery = ret.deliveries;
    const order = delivery?.orders;
    const store = order?.stores;
    const product = ret.products;

    if (!store) return;

    const storeId = store.id;
    const quantity = ret.quantity || 0;
    const price = parseFloat(product?.price?.toString() || '0');
    const value = quantity * price;

    if (!storeMap.has(storeId)) {
      storeMap.set(storeId, {
        store_id: storeId,
        store_name: store.name || 'Unknown Store',
        total_quantity: 0,
        total_value: 0,
        return_count: 0,
      });
    }

    const existing = storeMap.get(storeId)!;
    existing.total_quantity += quantity;
    existing.total_value += value;
    existing.return_count += 1;
  });

  return Array.from(storeMap.values()).sort((a, b) => b.total_value - a.total_value);
}

/**
 * Get wastage trends over time
 */
export async function getWastageTrends(
  period: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<WastageTrend[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('returns')
    .select(`
      quantity,
      returned_at,
      products (
        id,
        price
      )
    `)
    .order('returned_at', { ascending: true });

  if (startDate) {
    query = query.gte('returned_at', startDate);
  }
  if (endDate) {
    query = query.lte('returned_at', endDate);
  }

  const { data: returns, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch returns: ${error.message}`);
  }

  const trendMap = new Map<string, WastageTrend>();

  (returns || []).forEach((ret: any) => {
    const returnedAt = new Date(ret.returned_at);
    let dateKey: string;

    if (period === 'day') {
      dateKey = returnedAt.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekStart = new Date(returnedAt);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      dateKey = weekStart.toISOString().split('T')[0];
    } else {
      dateKey = `${returnedAt.getFullYear()}-${String(returnedAt.getMonth() + 1).padStart(2, '0')}`;
    }

    const quantity = ret.quantity || 0;
    const price = parseFloat(ret.products?.price?.toString() || '0');
    const value = quantity * price;

    if (!trendMap.has(dateKey)) {
      trendMap.set(dateKey, {
        date: dateKey,
        quantity: 0,
        value: 0,
        count: 0,
      });
    }

    const existing = trendMap.get(dateKey)!;
    existing.quantity += quantity;
    existing.value += value;
    existing.count += 1;
  });

  return Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get top wasted products
 */
export async function getTopWastedProducts(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<ReturnsByProduct[]> {
  const products = await getReturnsByProduct(startDate, endDate);
  return products.slice(0, limit);
}

/**
 * Get wastage by reason
 */
export async function getWastageByReason(
  reason?: 'expired' | 'damaged' | 'unsold',
  startDate?: string,
  endDate?: string
): Promise<{
  reason: string;
  quantity: number;
  value: number;
  count: number;
}[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('returns')
    .select(`
      quantity,
      reason,
      products (
        id,
        price
      )
    `);

  if (reason) {
    query = query.eq('reason', reason);
  }
  if (startDate) {
    query = query.gte('returned_at', startDate);
  }
  if (endDate) {
    query = query.lte('returned_at', endDate);
  }

  const { data: returns, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch returns: ${error.message}`);
  }

  const reasonMap = new Map<string, { reason: string; quantity: number; value: number; count: number }>();

  (returns || []).forEach((ret: any) => {
    const retReason = ret.reason || 'expired';
    const quantity = ret.quantity || 0;
    const price = parseFloat(ret.products?.price?.toString() || '0');
    const value = quantity * price;

    if (!reasonMap.has(retReason)) {
      reasonMap.set(retReason, {
        reason: retReason,
        quantity: 0,
        value: 0,
        count: 0,
      });
    }

    const existing = reasonMap.get(retReason)!;
    existing.quantity += quantity;
    existing.value += value;
    existing.count += 1;
  });

  return Array.from(reasonMap.values());
}

