import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface ProductStats {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_ordered: number;
  total_quantity: number;
  total_revenue: number;
  average_order_value: number;
  order_count: number;
  stores_using: number;
}

export interface ProductStockInfo {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_stock_across_stores: number;
  stores_with_stock: number;
  stores_below_threshold: number;
  stores_out_of_stock: number;
}

/**
 * Get product statistics including sales, orders, and revenue
 */
export async function getProductStatistics(
  productId?: string,
  startDate?: string,
  endDate?: string
): Promise<ProductStats[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('order_items')
    .select(`
      product_id,
      quantity,
      total_price,
      order_id,
      products (
        id,
        name,
        sku
      ),
      orders!inner (
        id,
        status,
        created_at
      )
    `)
    .eq('orders.status', 'completed');

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (startDate) {
    query = query.gte('orders.created_at', startDate);
  }

  if (endDate) {
    query = query.lte('orders.created_at', endDate);
  }

  const { data: orderItems, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch product statistics: ${error.message}`);
  }

  // Group by product
  const productMap = new Map<string, ProductStats>();

  orderItems?.forEach((item: any) => {
    const product = item.products;
    if (!product) return;

    const productId = product.id;
    const existing = productMap.get(productId);

    if (existing) {
      existing.total_quantity += item.quantity || 0;
      existing.total_revenue += parseFloat(item.total_price || 0);
      existing.order_count += 1;
    } else {
      productMap.set(productId, {
        product_id: productId,
        product_name: product.name,
        product_sku: product.sku,
        total_ordered: item.quantity || 0,
        total_quantity: item.quantity || 0,
        total_revenue: parseFloat(item.total_price || 0),
        average_order_value: parseFloat(item.total_price || 0),
        order_count: 1,
        stores_using: 0,
      });
    }
  });

  // Calculate averages and get unique stores
  const stats = Array.from(productMap.values()).map((stat) => {
    stat.average_order_value = stat.order_count > 0 
      ? stat.total_revenue / stat.order_count 
      : 0;

    // Get unique stores for this product
    const productOrderItems = orderItems?.filter(
      (item: any) => item.product_id === stat.product_id
    ) || [];
    const uniqueOrderIds = new Set(
      productOrderItems.map((item: any) => item.order_id)
    );
    stat.stores_using = uniqueOrderIds.size;

    return stat;
  });

  return stats;
}

/**
 * Get product stock information across all stores
 */
export async function getProductStockInfo(
  productId?: string
): Promise<ProductStockInfo[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('store_stock')
    .select(`
      product_id,
      current_stock,
      products (
        id,
        name,
        sku,
        min_stock_level
      )
    `);

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data: stockData, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch stock information: ${error.message}`);
  }

  // Group by product
  const productMap = new Map<string, ProductStockInfo>();

  stockData?.forEach((stock: any) => {
    const product = stock.products;
    if (!product) return;

    const productId = product.id;
    const existing = productMap.get(productId);

    const currentStock = stock.current_stock || 0;
    const minStock = product.min_stock_level || 0;
    const isBelowThreshold = currentStock < minStock;
    const isOutOfStock = currentStock === 0;

    if (existing) {
      existing.total_stock_across_stores += currentStock;
      existing.stores_with_stock += currentStock > 0 ? 1 : 0;
      existing.stores_below_threshold += isBelowThreshold ? 1 : 0;
      existing.stores_out_of_stock += isOutOfStock ? 1 : 0;
    } else {
      productMap.set(productId, {
        product_id: productId,
        product_name: product.name,
        product_sku: product.sku,
        total_stock_across_stores: currentStock,
        stores_with_stock: currentStock > 0 ? 1 : 0,
        stores_below_threshold: isBelowThreshold ? 1 : 0,
        stores_out_of_stock: isOutOfStock ? 1 : 0,
      });
    }
  });

  return Array.from(productMap.values());
}

/**
 * Get top selling products
 */
export async function getTopSellingProducts(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<ProductStats[]> {
  const stats = await getProductStatistics(undefined, startDate, endDate);
  return stats
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, limit);
}

/**
 * Get products with low stock across stores
 */
export async function getLowStockProducts(): Promise<ProductStockInfo[]> {
  const stockInfo = await getProductStockInfo();
  return stockInfo.filter(
    (info) => info.stores_below_threshold > 0 || info.stores_out_of_stock > 0
  );
}


