import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateProduct, validateSKUFormat } from '@/lib/utils/product-validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products/[id]
 * Get product details with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: product, error } = await adminSupabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get stock information across stores
    const { data: stockData } = await adminSupabase
      .from('store_stock')
      .select(`
        store_id,
        current_stock,
        stores (
          id,
          name
        )
      `)
      .eq('product_id', params.id);

    // Get order statistics
    const { data: orderItems } = await adminSupabase
      .from('order_items')
      .select('quantity, total_price, order_id, orders!inner(status, created_at)')
      .eq('product_id', params.id)
      .eq('orders.status', 'completed');

    const totalOrdered = orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    const totalRevenue = orderItems?.reduce((sum, item) => sum + parseFloat(item.total_price || 0), 0) || 0;
    const orderCount = new Set(orderItems?.map(item => item.order_id) || []).size;

    return NextResponse.json({
      product: {
        ...product,
        statistics: {
          total_ordered: totalOrdered,
          total_revenue: totalRevenue,
          order_count: orderCount,
          stores_with_stock: stockData?.length || 0,
          total_stock: stockData?.reduce((sum, s) => sum + (s.current_stock || 0), 0) || 0,
        },
        stock_by_store: stockData || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/[id]
 * Update product with validation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { name, description, sku, price, cost, unit, category, min_stock_level, is_active } = body;

    // Get existing product
    const { data: existingProduct, error: fetchError } = await adminSupabase
      .from('products')
      .select('id, sku')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Validate product data if provided
    if (name !== undefined || sku !== undefined || price !== undefined || cost !== undefined || min_stock_level !== undefined) {
      const validation = validateProduct({
        name,
        sku,
        price,
        cost,
        min_stock_level,
      });
      if (!validation.isValid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Check SKU uniqueness if SKU is being changed
    if (sku && sku !== existingProduct.sku) {
      const skuValidation = validateSKUFormat(sku);
      if (!skuValidation.isValid) {
        return NextResponse.json(
          { error: 'Invalid SKU format', details: skuValidation.errors },
          { status: 400 }
        );
      }

      const { data: duplicateProduct, error: checkError } = await adminSupabase
        .from('products')
        .select('id, sku')
        .eq('sku', sku)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (duplicateProduct) {
        return NextResponse.json(
          { error: 'SKU already exists', details: `Product with SKU "${sku}" already exists` },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (sku !== undefined) updateData.sku = sku.trim().toUpperCase();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category?.trim() || null;
    if (min_stock_level !== undefined) updateData.min_stock_level = parseInt(min_stock_level);
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: product, error } = await adminSupabase
      .from('products')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[id]
 * Delete product (soft delete by setting is_active to false, or hard delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

    // Check if product is used in any orders
    const { data: orderItems, error: checkError } = await adminSupabase
      .from('order_items')
      .select('id')
      .eq('product_id', params.id)
      .limit(1);

    if (checkError) {
      throw checkError;
    }

    if (orderItems && orderItems.length > 0 && !hardDelete) {
      // Soft delete - set is_active to false
      const { data: product, error } = await adminSupabase
        .from('products')
        .update({ is_active: false })
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Product deactivated (product is used in orders)',
        product,
      });
    } else {
      // Hard delete - remove product completely
      const { error } = await adminSupabase
        .from('products')
        .delete()
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: 'Product deleted successfully',
      });
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product', details: error.message },
      { status: 500 }
    );
  }
}




