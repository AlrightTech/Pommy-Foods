import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface StockTurnoverRate {
  product_id: string;
  product_name: string;
  sku: string;
  total_sold: number;
  average_stock: number;
  turnover_rate: number; // How many times stock was sold and replenished
}

export interface StockManagementByStore {
  store_id: string;
  store_name: string;
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  average_stock_level: number;
}

export interface ReplenishmentFrequency {
  store_id: string;
  store_name: string;
  order_count: number;
  average_days_between_orders: number;
  last_order_date: string;
}

/**
 * Get stock turnover rates
 */
export async function getStockTurnoverRates(
  period?: { startDate?: string; endDate?: string }
): Promise<StockTurnoverRate[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get all products
  const { data: products, error: productsError } = await adminSupabase
    .from('products')
    .select('id, name, sku');

  if (productsError) {
    throw new Error(`Failed to fetch products: ${productsError.message}`);
  }

  // Get order items for the period
  let orderQuery = adminSupabase
    .from('order_items')
    .select(`
      product_id,
      quantity,
      orders (
        id,
        created_at,
        status
      )
    `)
    .eq('orders.status', 'approved');

  if (period?.startDate) {
    orderQuery = orderQuery.gte('orders.created_at', period.startDate);
  }
  if (period?.endDate) {
    orderQuery = orderQuery.lte('orders.created_at', period.endDate);
  }

  const { data: orderItems, error: orderItemsError } = await orderQuery;

  if (orderItemsError) {
    throw new Error(`Failed to fetch order items: ${orderItemsError.message}`);
  }

  // Calculate total sold per product
  const productSales = new Map<string, number>();
  (orderItems || []).forEach((item: any) => {
    const productId = item.product_id;
    const quantity = item.quantity || 0;
    productSales.set(productId, (productSales.get(productId) || 0) + quantity);
  });

  // Get average stock levels
  const { data: stockLevels, error: stockError } = await adminSupabase
    .from('store_stock')
    .select('product_id, current_stock');

  if (stockError) {
    throw new Error(`Failed to fetch stock levels: ${stockError.message}`);
  }

  const productStock = new Map<string, { total: number; count: number }>();
  (stockLevels || []).forEach((stock: any) => {
    const productId = stock.product_id;
    const currentStock = stock.current_stock || 0;
    if (!productStock.has(productId)) {
      productStock.set(productId, { total: 0, count: 0 });
    }
    const existing = productStock.get(productId)!;
    existing.total += currentStock;
    existing.count += 1;
  });

  // Calculate turnover rates
  const turnoverRates: StockTurnoverRate[] = [];

  (products || []).forEach((product: any) => {
    const totalSold = productSales.get(product.id) || 0;
    const stockData = productStock.get(product.id);
    const averageStock = stockData && stockData.count > 0 ? stockData.total / stockData.count : 0;

    // Turnover rate = total sold / average stock (if average stock > 0)
    const turnoverRate = averageStock > 0 ? totalSold / averageStock : 0;

    turnoverRates.push({
      product_id: product.id,
      product_name: product.name || 'Unknown',
      sku: product.sku || 'N/A',
      total_sold: totalSold,
      average_stock: Math.round(averageStock * 100) / 100,
      turnover_rate: Math.round(turnoverRate * 100) / 100,
    });
  });

  return turnoverRates.sort((a, b) => b.turnover_rate - a.turnover_rate);
}

/**
 * Get stock management performance by store
 */
export async function getStockManagementByStore(): Promise<StockManagementByStore[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get all stores
  const { data: stores, error: storesError } = await adminSupabase
    .from('stores')
    .select('id, name');

  if (storesError) {
    throw new Error(`Failed to fetch stores: ${storesError.message}`);
  }

  // Get stock levels for all stores
  const { data: stockLevels, error: stockError } = await adminSupabase
    .from('store_stock')
    .select('store_id, product_id, current_stock');

  if (stockError) {
    throw new Error(`Failed to fetch stock levels: ${stockError.message}`);
  }

  const storeStock = new Map<string, {
    store_id: string;
    store_name: string;
    products: Set<string>;
    stockLevels: number[];
  }>();

  (stores || []).forEach((store: any) => {
    storeStock.set(store.id, {
      store_id: store.id,
      store_name: store.name || 'Unknown Store',
      products: new Set(),
      stockLevels: [],
    });
  });

  (stockLevels || []).forEach((stock: any) => {
    const storeData = storeStock.get(stock.store_id);
    if (storeData) {
      storeData.products.add(stock.product_id);
      storeData.stockLevels.push(stock.current_stock || 0);
    }
  });

  const management: StockManagementByStore[] = [];

  storeStock.forEach((data) => {
    const totalProducts = data.products.size;
    const lowStockCount = data.stockLevels.filter(level => level > 0 && level < 10).length;
    const outOfStockCount = data.stockLevels.filter(level => level === 0).length;
    const averageStock = data.stockLevels.length > 0
      ? data.stockLevels.reduce((sum, level) => sum + level, 0) / data.stockLevels.length
      : 0;

    management.push({
      store_id: data.store_id,
      store_name: data.store_name,
      total_products: totalProducts,
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      average_stock_level: Math.round(averageStock * 100) / 100,
    });
  });

  return management.sort((a, b) => b.total_products - a.total_products);
}

/**
 * Get replenishment frequency
 */
export async function getReplenishmentFrequency(
  startDate?: string,
  endDate?: string
): Promise<ReplenishmentFrequency[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('orders')
    .select(`
      id,
      store_id,
      created_at,
      status,
      stores (
        id,
        name
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data: orders, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }

  const storeOrders = new Map<string, {
    store_id: string;
    store_name: string;
    orderDates: string[];
  }>();

  (orders || []).forEach((order: any) => {
    const store = order.stores;
    if (!store) return;

    const storeId = store.id;
    if (!storeOrders.has(storeId)) {
      storeOrders.set(storeId, {
        store_id: storeId,
        store_name: store.name || 'Unknown Store',
        orderDates: [],
      });
    }

    storeOrders.get(storeId)!.orderDates.push(order.created_at);
  });

  const frequency: ReplenishmentFrequency[] = [];

  storeOrders.forEach((data) => {
    const orderCount = data.orderDates.length;
    let totalDaysBetween = 0;

    // Calculate average days between orders
    if (orderCount > 1) {
      for (let i = 1; i < orderCount; i++) {
        const prevDate = new Date(data.orderDates[i - 1]);
        const currDate = new Date(data.orderDates[i]);
        const daysBetween = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
        totalDaysBetween += daysBetween;
      }
    }

    const averageDaysBetween = orderCount > 1 ? totalDaysBetween / (orderCount - 1) : 0;
    const lastOrderDate = data.orderDates.length > 0
      ? data.orderDates[data.orderDates.length - 1]
      : '';

    frequency.push({
      store_id: data.store_id,
      store_name: data.store_name,
      order_count: orderCount,
      average_days_between_orders: Math.round(averageDaysBetween * 100) / 100,
      last_order_date: lastOrderDate,
    });
  });

  return frequency.sort((a, b) => b.order_count - a.order_count);
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(
  threshold: number = 10
): Promise<Array<{
  store_id: string;
  store_name: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
}>> {
  const adminSupabase = getSupabaseAdmin();

  const { data: stockLevels, error } = await adminSupabase
    .from('store_stock')
    .select(`
      store_id,
      product_id,
      current_stock,
      stores (
        id,
        name
      ),
      products (
        id,
        name
      )
    `)
    .lte('current_stock', threshold);

  if (error) {
    throw new Error(`Failed to fetch stock levels: ${error.message}`);
  }

  const alerts: Array<{
    store_id: string;
    store_name: string;
    product_id: string;
    product_name: string;
    current_stock: number;
    threshold: number;
  }> = [];

  (stockLevels || []).forEach((stock: any) => {
    const store = stock.stores;
    const product = stock.products;

    if (!store || !product) return;

    alerts.push({
      store_id: store.id,
      store_name: store.name || 'Unknown Store',
      product_id: product.id,
      product_name: product.name || 'Unknown Product',
      current_stock: stock.current_stock || 0,
      threshold,
    });
  });

  return alerts.sort((a, b) => a.current_stock - b.current_stock);
}

