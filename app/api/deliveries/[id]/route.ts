import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const { data: delivery, error } = await supabase
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
          )
        ),
        returns (
          *,
          products (
            *
          )
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
  } catch (error) {
    console.error('Error fetching delivery:', error);
    return NextResponse.json(
      { error: 'Failed to fetch delivery' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { data: delivery, error } = await supabase
      .from('deliveries')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error('Error updating delivery:', error);
    return NextResponse.json(
      { error: 'Failed to update delivery' },
      { status: 500 }
    );
  }
}

