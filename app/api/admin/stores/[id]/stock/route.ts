import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { checkStoreReplenishmentNeeds } from '@/lib/services/replenishment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stores/[id]/stock
 * Get all stock levels for a store with product details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const lowStockOnly = searchParams.get('low_stock_only') === 'true';
    const includeReplenishmentNeeds = searchParams.get('include_replenishment') === 'true';

    // Verify store exists
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('id, name')
      .eq('id', params.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get all products
    const { data: products, error: productsError } = await adminSupabase
      .from('products')
      .select('id, name, sku, price, min_stock_level, is_active')
      .eq('is_active', true)
      .order('name');

    if (productsError) {
      throw productsError;
    }

    // Get stock levels for this store
    const { data: storeStock, error: stockError } = await adminSupabase
      .from('store_stock')
      .select('product_id, current_stock, last_updated, updated_by')
      .eq('store_id', params.id);

    if (stockError) {
      throw stockError;
    }

    // Create a map of product_id to stock
    const stockMap = new Map(
      (storeStock || []).map((s: any) => [s.product_id, s])
    );

    // Combine products with stock levels
    const stockLevels = (products || []).map((product: any) => {
      const stock = stockMap.get(product.id);
      const currentStock = stock?.current_stock || 0;
      const minStock = product.min_stock_level || 0;
      const needsReplenishment = currentStock < minStock;

      return {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_price: product.price,
        min_stock_level: minStock,
        current_stock: currentStock,
        last_updated: stock?.last_updated || null,
        updated_by: stock?.updated_by || null,
        needs_replenishment: needsReplenishment,
        stock_status: needsReplenishment ? 'low' : currentStock === 0 ? 'out' : 'ok',
      };
    });

    // Filter low stock if requested
    let filteredStock = stockLevels;
    if (lowStockOnly) {
      filteredStock = stockLevels.filter((s: any) => s.needs_replenishment);
    }

    // Get replenishment needs if requested
    let replenishmentNeeds = null;
    if (includeReplenishmentNeeds) {
      try {
        const needs = await checkStoreReplenishmentNeeds(params.id);
        replenishmentNeeds = needs;
      } catch (error) {
        console.error('Error checking replenishment needs:', error);
      }
    }

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
      },
      stock_levels: filteredStock,
      total_products: stockLevels.length,
      low_stock_count: stockLevels.filter((s: any) => s.needs_replenishment).length,
      out_of_stock_count: stockLevels.filter((s: any) => s.current_stock === 0).length,
      replenishment_needs: replenishmentNeeds,
    });
  } catch (error: any) {
    console.error('Error fetching store stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch store stock', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stores/[id]/stock
 * Update stock levels for a store (bulk update)
 * 
 * Body:
 * - updates: Array of { product_id, current_stock, updated_by? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();
    const { updates } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array is required' },
        { status: 400 }
      );
    }

    // Verify store exists
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('id, name')
      .eq('id', params.id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Validate updates
    for (const update of updates) {
      if (!update.product_id) {
        return NextResponse.json(
          { error: 'product_id is required for all updates' },
          { status: 400 }
        );
      }
      if (update.current_stock === undefined || update.current_stock < 0) {
        return NextResponse.json(
          { error: 'current_stock must be a non-negative number' },
          { status: 400 }
        );
      }
    }

    // Upsert stock levels
    const stockUpdates = updates.map((update: any) => ({
      store_id: params.id,
      product_id: update.product_id,
      current_stock: update.current_stock,
      last_updated: new Date().toISOString(),
      updated_by: update.updated_by || null,
    }));

    // Use upsert to insert or update
    const { data: updatedStock, error: updateError } = await adminSupabase
      .from('store_stock')
      .upsert(stockUpdates, {
        onConflict: 'store_id,product_id',
      })
      .select(`
        *,
        products (
          id,
          name,
          sku,
          min_stock_level
        )
      `);

    if (updateError) {
      throw updateError;
    }

    // Check if any products now need replenishment
    // This could trigger auto-replenishment in the future
    const replenishmentNeeds = await checkStoreReplenishmentNeeds(params.id);

    return NextResponse.json({
      success: true,
      message: 'Stock levels updated successfully',
      updated_stock: updatedStock,
      replenishment_needed: replenishmentNeeds.length > 0,
      replenishment_items: replenishmentNeeds,
    });
  } catch (error: any) {
    console.error('Error updating store stock:', error);
    return NextResponse.json(
      { error: 'Failed to update store stock', details: error.message },
      { status: 500 }
    );
  }
}

