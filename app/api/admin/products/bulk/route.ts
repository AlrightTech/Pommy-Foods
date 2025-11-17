import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/products/bulk
 * Bulk update products (activate/deactivate, category, etc.)
 * 
 * Body:
 * - product_ids: Array of product IDs
 * - action: 'activate' | 'deactivate' | 'update_category' | 'update_min_stock'
 * - data: Additional data based on action
 */
export async function PATCH(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { product_ids, action, data } = body;

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: 'product_ids array is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'action is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};

    switch (action) {
      case 'activate':
        updateData.is_active = true;
        break;

      case 'deactivate':
        updateData.is_active = false;
        break;

      case 'update_category':
        if (!data?.category) {
          return NextResponse.json(
            { error: 'category is required for update_category action' },
            { status: 400 }
          );
        }
        updateData.category = data.category;
        break;

      case 'update_min_stock':
        if (data?.min_stock_level === undefined) {
          return NextResponse.json(
            { error: 'min_stock_level is required for update_min_stock action' },
            { status: 400 }
          );
        }
        if (data.min_stock_level < 0) {
          return NextResponse.json(
            { error: 'min_stock_level cannot be negative' },
            { status: 400 }
          );
        }
        updateData.min_stock_level = parseInt(data.min_stock_level);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    const { data: updatedProducts, error } = await adminSupabase
      .from('products')
      .update(updateData)
      .in('id', product_ids)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedProducts?.length || 0} product(s)`,
      updated_count: updatedProducts?.length || 0,
      products: updatedProducts,
    });
  } catch (error: any) {
    console.error('Error performing bulk update:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk update', details: error.message },
      { status: 500 }
    );
  }
}



