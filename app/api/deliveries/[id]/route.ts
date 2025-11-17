import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['assigned'],
  assigned: ['in_transit', 'pending'],
  in_transit: ['delivered', 'assigned'],
  delivered: [], // Final state
  cancelled: [], // Final state
};

/**
 * Validate delivery status transition
 */
function validateStatusTransition(currentStatus: string, newStatus: string): boolean {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: delivery, error } = await adminSupabase
      .from('deliveries')
      .select(`
        *,
        orders (
          *,
          stores (
            *
          ),
          order_items (
            *,
            products (
              *
            )
          ),
          invoices (
            *
          )
        ),
        returns (
          *,
          products (
            *
          )
        ),
        delivery_signatures (
          *
        ),
        drivers (
          id,
          name,
          phone
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ delivery });
  } catch (error: any) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    // Get current delivery status
    const { data: currentDelivery, error: fetchError } = await adminSupabase
      .from('deliveries')
      .select('status')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentDelivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Validate status transition if status is being updated
    if (body.status && body.status !== currentDelivery.status) {
      if (!validateStatusTransition(currentDelivery.status, body.status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${currentDelivery.status} to ${body.status}`,
            allowedTransitions: VALID_STATUS_TRANSITIONS[currentDelivery.status] || [],
          },
          { status: 400 }
        );
      }

      // Set delivered_at timestamp when status changes to delivered
      if (body.status === 'delivered' && !body.delivered_at) {
        body.delivered_at = new Date().toISOString();
      }
    }

    // Handle proof of delivery (e-signature and photo)
    if (body.signature_data || body.proof_of_delivery_url) {
      const { data: existingSignature } = await adminSupabase
        .from('delivery_signatures')
        .select('id')
        .eq('delivery_id', params.id)
        .single();

      const signatureData = {
        delivery_id: params.id,
        signature_data: body.signature_data || null,
        proof_of_delivery_url: body.proof_of_delivery_url || null,
        signed_at: new Date().toISOString(),
        signed_by: body.signed_by || null,
      };

      if (existingSignature) {
        await adminSupabase
          .from('delivery_signatures')
          .update(signatureData)
          .eq('id', existingSignature.id);
      } else {
        await adminSupabase
          .from('delivery_signatures')
          .insert(signatureData);
      }

      // Remove from body to avoid updating deliveries table with these fields
      delete body.signature_data;
      delete body.proof_of_delivery_url;
      delete body.signed_by;
    }

    // Update delivery
    const { data: delivery, error } = await adminSupabase
      .from('deliveries')
      .update(body)
      .eq('id', params.id)
      .select(`
        *,
        orders (
          *,
          stores (
            *
          ),
          order_items (
            *,
            products (
              *
            )
          )
        ),
        delivery_signatures (
          *
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ delivery });
  } catch (error: any) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery', details: error.message },
      { status: 500 }
    );
  }
}

