import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { processReturns, getReturnsForDelivery, validateReturnItems } from '@/lib/services/returns-management';

export const dynamic = 'force-dynamic';

/**
 * GET /api/deliveries/[id]/returns
 * Get returns for a delivery
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const returns = await getReturnsForDelivery(params.id);

    return NextResponse.json({
      returns,
      count: returns.length,
    });
  } catch (error: any) {
    console.error('Error fetching returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch returns', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/deliveries/[id]/returns
 * Process returns from driver app
 * 
 * Body:
 * {
 *   returns: Array<{
 *     product_id: string,
 *     quantity: number,
 *     batch_number?: string,
 *     expiry_date?: string,
 *     reason?: 'expired' | 'damaged' | 'unsold',
 *     notes?: string
 *   }>,
 *   returned_by: string (driver_id)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { returns, returned_by } = body;

    // Validation
    if (!returns || !Array.isArray(returns) || returns.length === 0) {
      return NextResponse.json(
        { error: 'Returns array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!returned_by) {
      return NextResponse.json(
        { error: 'returned_by (driver_id) is required' },
        { status: 400 }
      );
    }

    // Validate delivery exists
    const { data: delivery, error: deliveryError } = await adminSupabase
      .from('deliveries')
      .select('id, order_id, status')
      .eq('id', params.id)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Only allow returns for delivered orders
    if (delivery.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Returns can only be processed for delivered orders' },
        { status: 400 }
      );
    }

    // Validate return items
    const validation = await validateReturnItems(params.id, returns);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Return validation failed',
          details: validation.errors,
          invalidItems: validation.invalidItems,
        },
        { status: 400 }
      );
    }

    // Process returns
    const result = await processReturns(params.id, returns, returned_by);

    return NextResponse.json({
      success: true,
      message: 'Returns processed successfully. Invoice has been adjusted.',
      returns: result.returns,
      invoice: result.invoice,
      totalReturnAmount: result.totalReturnAmount,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing returns:', error);
    return NextResponse.json(
      { error: 'Failed to process returns', details: error.message },
      { status: 500 }
    );
  }
}

