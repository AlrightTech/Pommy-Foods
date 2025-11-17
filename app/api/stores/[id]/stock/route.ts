import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { updateStock } from '@/lib/services/stock-management';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stores/[id]/stock
 * Allow stores to update their stock levels (customer-facing)
 * 
 * Body:
 * {
 *   updates: Array<{
 *     product_id: string,
 *     quantity: number (positive to increase, negative to decrease)
 *   }>,
 *   updated_by?: string (user_id)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { updates, updated_by } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'updates array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate store exists
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

    // TODO: Validate store ownership (via user_profiles.store_id)
    // For now, we'll allow any store_id

    // Update stock for each product
    const results = [];
    const errors = [];

    for (const update of updates) {
      const { product_id, quantity } = update;

      if (!product_id || quantity === undefined) {
        errors.push(`Invalid update: product_id and quantity are required`);
        continue;
      }

      try {
        // Use manual_adjustment reason for customer-initiated updates
        await updateStock({
          store_id: params.id,
          product_id,
          quantity, // Can be positive or negative
          reason: 'manual_adjustment',
          notes: 'Stock updated by store',
          updated_by: updated_by || null,
        });

        // Get updated stock level
        const { data: stock } = await adminSupabase
          .from('store_stock')
          .select('current_stock')
          .eq('store_id', params.id)
          .eq('product_id', product_id)
          .single();

        results.push({
          product_id,
          new_stock: stock?.current_stock || 0,
        });
      } catch (error: any) {
        errors.push(`Failed to update stock for product ${product_id}: ${error.message}`);
      }
    }

    // Check for replenishment needs (products with low stock)
    const { data: allStock } = await adminSupabase
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
      `)
      .eq('store_id', params.id);

    const replenishmentNeeds = (allStock || [])
      .filter((stock: any) => {
        const minLevel = stock.products?.min_stock_level || 10;
        return (stock.current_stock || 0) < minLevel;
      })
      .map((stock: any) => ({
        product_id: stock.product_id,
        product_name: stock.products?.name || 'Unknown',
        current_stock: stock.current_stock || 0,
        min_stock_level: stock.products?.min_stock_level || 10,
        needs_replenishment: true,
      }));

    return NextResponse.json({
      success: true,
      message: `Updated ${results.length} product(s)`,
      updates: results,
      errors: errors.length > 0 ? errors : undefined,
      replenishmentNeeds,
    });
  } catch (error: any) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stores/[id]/stock
 * Get stock levels for a store
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    const productId = searchParams.get('product_id');
    const lowStockOnly = searchParams.get('low_stock_only') === 'true';

    let query = adminSupabase
      .from('store_stock')
      .select(`
        *,
        products (
          id,
          name,
          sku,
          category,
          price,
          min_stock_level
        )
      `)
      .eq('store_id', params.id);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (lowStockOnly) {
      // This would require a join or subquery to check min_stock_level
      // Simplified for now - filter in application code
    }

    const { data: stockLevels, error } = await query;

    if (error) {
      throw error;
    }

    // Filter low stock if requested
    let filteredStock = stockLevels || [];
    if (lowStockOnly) {
      filteredStock = filteredStock.filter((stock: any) => {
        const minLevel = stock.products?.min_stock_level || 10;
        return (stock.current_stock || 0) < minLevel;
      });
    }

    return NextResponse.json({
      stock: filteredStock,
      count: filteredStock.length,
    });
  } catch (error: any) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock', details: error.message },
      { status: 500 }
    );
  }
}

