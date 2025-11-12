import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        stores (
          *
        ),
        orders (
          *,
          order_items (
            *,
            products (
              *
            )
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

