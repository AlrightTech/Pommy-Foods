import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateProduct, validateSKUFormat } from '@/lib/utils/product-validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * List products with advanced filtering for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const lowStock = searchParams.get('low_stock') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    const { data: products, error, count } = await query;

    if (error) {
      throw error;
    }

    // Filter low stock products if requested
    let filteredProducts = products || [];
    if (lowStock) {
      // Get stock levels for all products
      const { data: stockData } = await adminSupabase
        .from('store_stock')
        .select('product_id, current_stock, products!inner(min_stock_level)');

      const lowStockProductIds = new Set<string>();
      stockData?.forEach((stock: any) => {
        const currentStock = stock.current_stock || 0;
        const minStock = stock.products?.min_stock_level || 0;
        if (currentStock < minStock) {
          lowStockProductIds.add(stock.product_id);
        }
      });

      // Also include products with no stock records (treat as 0 stock)
      const productsWithStock = new Set(stockData?.map((s: any) => s.product_id) || []);
      products?.forEach((product: any) => {
        if (!productsWithStock.has(product.id)) {
          const minStock = product.min_stock_level || 0;
          if (minStock > 0) {
            lowStockProductIds.add(product.id);
          }
        }
      });

      filteredProducts = filteredProducts.filter((p: any) => 
        lowStockProductIds.has(p.id)
      );
    }

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Create a new product with validation
 */
export async function POST(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { name, description, sku, price, cost, unit, category, min_stock_level, is_active } = body;

    // Validate required fields
    if (!name || !sku || price === undefined) {
      return NextResponse.json(
        { error: 'Name, SKU, and price are required' },
        { status: 400 }
      );
    }

    // Validate product data
    const validation = validateProduct({ name, sku, price, cost, min_stock_level });
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Validate SKU format
    const skuValidation = validateSKUFormat(sku);
    if (!skuValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid SKU format', details: skuValidation.errors },
        { status: 400 }
      );
    }

    // Check if SKU already exists
    const { data: existingProduct, error: checkError } = await adminSupabase
      .from('products')
      .select('id, sku')
      .eq('sku', sku)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" which is what we want
      throw checkError;
    }

    if (existingProduct) {
      return NextResponse.json(
        { error: 'SKU already exists', details: `Product with SKU "${sku}" already exists` },
        { status: 409 }
      );
    }

    // Create product
    const { data: product, error } = await adminSupabase
      .from('products')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        sku: sku.trim().toUpperCase(),
        price: parseFloat(price),
        cost: cost ? parseFloat(cost) : null,
        unit: unit || 'unit',
        category: category?.trim() || null,
        min_stock_level: min_stock_level || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error.message },
      { status: 500 }
    );
  }
}

