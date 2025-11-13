import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stores/[id]
 * Get a single store by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Store not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ store });
  } catch (error: any) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch store',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stores/[id]
 * Update a store (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    // Check if store exists
    const { data: existingStore, error: fetchError } = await supabase
      .from('stores')
      .select('id, email')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingStore) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // If email is being changed, check if new email already exists
    if (body.email && body.email !== existingStore.email) {
      const { data: emailCheck } = await supabase
        .from('stores')
        .select('id')
        .eq('email', body.email.trim().toLowerCase())
        .neq('id', params.id)
        .single();

      if (emailCheck) {
        return NextResponse.json(
          { error: 'A store with this email already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.email !== undefined) updateData.email = body.email.trim().toLowerCase();
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;
    if (body.address !== undefined) updateData.address = body.address?.trim() || null;
    if (body.city !== undefined) updateData.city = body.city?.trim() || null;
    if (body.state !== undefined) updateData.state = body.state?.trim() || null;
    if (body.zip_code !== undefined) updateData.zip_code = body.zip_code?.trim() || null;
    if (body.credit_limit !== undefined) {
      const creditLimit = parseFloat(body.credit_limit);
      if (creditLimit < 0) {
        return NextResponse.json(
          { error: 'Credit limit cannot be negative' },
          { status: 400 }
        );
      }
      updateData.credit_limit = creditLimit;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    // Don't allow direct modification of current_balance through this endpoint
    // It should be updated through order/payment operations

    const { data: store, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A store with this email already exists' },
          { status: 409 }
        );
      }
      
      throw error;
    }

    return NextResponse.json({
      store,
      message: 'Store updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update store',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/stores/[id]
 * Partially update a store
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // PATCH uses the same logic as PUT
  return PUT(request, { params });
}

/**
 * DELETE /api/admin/stores/[id]
 * Delete or deactivate a store
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

    // Check if store exists
    const { data: existingStore, error: fetchError } = await supabase
      .from('stores')
      .select('id, name')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingStore) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if store has active orders
    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('store_id', params.id)
      .in('status', ['pending', 'approved', 'draft'])
      .limit(1);

    if (activeOrders && activeOrders.length > 0 && hardDelete) {
      return NextResponse.json(
        { error: 'Cannot delete store with active orders. Deactivate instead.' },
        { status: 400 }
      );
    }

    if (hardDelete) {
      // Hard delete - remove from database
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        message: 'Store deleted successfully'
      });
    } else {
      // Soft delete - deactivate the store
      const { data: store, error } = await supabase
        .from('stores')
        .update({ is_active: false })
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        store,
        message: 'Store deactivated successfully'
      });
    }
  } catch (error: any) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete store',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}

