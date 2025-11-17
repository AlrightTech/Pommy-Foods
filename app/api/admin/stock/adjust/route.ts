import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { updateStock } from '@/lib/services/stock-management';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/stock/adjust
 * Adjust stock levels manually (increase, decrease, wastage, returns)
 * 
 * Body:
 * {
 *   store_id: string,
 *   product_id: string,
 *   quantity: number, // Positive for increase, negative for decrease
 *   reason: 'manual_adjustment' | 'wastage' | 'return',
 *   notes?: string,
 *   updated_by?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { store_id, product_id, quantity, reason, notes, updated_by } = body;

    // Validation
    if (!store_id || !product_id) {
      return NextResponse.json(
        { error: 'store_id and product_id are required' },
        { status: 400 }
      );
    }

    if (quantity === undefined || quantity === null) {
      return NextResponse.json(
        { error: 'quantity is required' },
        { status: 400 }
      );
    }

    if (!['manual_adjustment', 'wastage', 'return'].includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid reason. Must be: manual_adjustment, wastage, or return' },
        { status: 400 }
      );
    }

    // Verify store exists
    const { data: store, error: storeError } = await adminSupabase
      .from('stores')
      .select('id, name')
      .eq('id', store_id)
      .single();

    if (storeError || !store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Verify product exists
    const { data: product, error: productError } = await adminSupabase
      .from('products')
      .select('id, name, sku')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update stock
    await updateStock({
      store_id,
      product_id,
      quantity, // Can be positive or negative
      reason,
      notes,
      updated_by,
    });

    // Get updated stock level
    const { data: updatedStock, error: stockError } = await adminSupabase
      .from('store_stock')
      .select('current_stock, last_updated')
      .eq('store_id', store_id)
      .eq('product_id', product_id)
      .single();

    if (stockError && stockError.code !== 'PGRST116') {
      throw stockError;
    }

    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      stock: {
        store_id,
        product_id,
        product_name: product.name,
        product_sku: product.sku,
        current_stock: updatedStock?.current_stock || 0,
        last_updated: updatedStock?.last_updated || new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error adjusting stock:', error);
    return NextResponse.json(
      { error: 'Failed to adjust stock', details: error.message },
      { status: 500 }
    );
  }
}

