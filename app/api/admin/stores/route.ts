import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stores
 * Get all stores with pagination, search, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;
    
    const search = searchParams.get('search');
    const isActive = searchParams.get('is_active');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('stores')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,city.ilike.%${search}%`);
    }

    // Apply active status filter
    if (isActive !== null && isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({
      stores: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch stores',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/stores
 * Create a new store
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();

    // Validation
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Store name and email are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('email', body.email)
      .single();

    if (existingStore) {
      return NextResponse.json(
        { error: 'A store with this email already exists' },
        { status: 409 }
      );
    }

    // Prepare store data
    const storeData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      zip_code: body.zip_code?.trim() || null,
      credit_limit: parseFloat(body.credit_limit) || 0,
      current_balance: 0,
      is_active: body.is_active !== undefined ? body.is_active : true,
    };

    // Validate credit limit
    if (storeData.credit_limit < 0) {
      return NextResponse.json(
        { error: 'Credit limit cannot be negative' },
        { status: 400 }
      );
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A store with this email already exists' },
          { status: 409 }
        );
      }
      
      throw error;
    }

    return NextResponse.json(
      { 
        store,
        message: 'Store created successfully'
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create store',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
