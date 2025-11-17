import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateBarcodesForKitchenSheet, getBarcodeLabel, markBarcodePrinted } from '@/lib/services/barcode-generation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/kitchen-sheets/[id]/barcode
 * Generate barcode/QR code for kitchen sheet items
 * 
 * Body (optional):
 * {
 *   item_ids?: string[] (if provided, only generate for these items)
 *   label_type?: 'barcode' | 'qr_code' | 'both'
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json().catch(() => ({}));

    const { item_ids, label_type = 'both' } = body;

    // Validate kitchen sheet exists
    const { data: kitchenSheet, error: sheetError } = await adminSupabase
      .from('kitchen_sheets')
      .select('id')
      .eq('id', params.id)
      .single();

    if (sheetError || !kitchenSheet) {
      return NextResponse.json(
        { error: 'Kitchen sheet not found' },
        { status: 404 }
      );
    }

    let labels;

    if (item_ids && Array.isArray(item_ids) && item_ids.length > 0) {
      // Generate for specific items
      const { data: items } = await adminSupabase
        .from('kitchen_sheet_items')
        .select(`
          id,
          batch_number,
          products (
            id,
            sku
          )
        `)
        .eq('kitchen_sheet_id', params.id)
        .in('id', item_ids);

      if (!items || items.length === 0) {
        return NextResponse.json(
          { error: 'No items found for the provided IDs' },
          { status: 404 }
        );
      }

      labels = [];
      for (const item of items) {
        const product = item.products as any;
        const productSku = product?.sku || 'UNKNOWN';
        const batchNumber = item.batch_number || undefined;

        const { generateBarcodeLabel } = await import('@/lib/services/barcode-generation');
        try {
          const label = await generateBarcodeLabel(item.id, productSku, batchNumber, label_type);
          labels.push(label);
        } catch (error: any) {
          console.error(`Failed to generate barcode for item ${item.id}:`, error);
        }
      }
    } else {
      // Generate for all items
      labels = await generateBarcodesForKitchenSheet(params.id);
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${labels.length} barcode label(s)`,
      labels,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating barcodes:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcodes', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/kitchen-sheets/[id]/barcode
 * Get all barcodes for a kitchen sheet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    // Get kitchen sheet items
    const { data: items, error: itemsError } = await adminSupabase
      .from('kitchen_sheet_items')
      .select('id')
      .eq('kitchen_sheet_id', params.id);

    if (itemsError) {
      throw itemsError;
    }

    // Get barcodes for all items
    const itemIds = (items || []).map(item => item.id);
    const { data: barcodes, error: barcodesError } = await adminSupabase
      .from('barcode_labels')
      .select(`
        *,
        kitchen_sheet_items (
          id,
          quantity,
          products (
            id,
            name,
            sku
          )
        )
      `)
      .in('kitchen_sheet_item_id', itemIds);

    if (barcodesError) {
      throw barcodesError;
    }

    return NextResponse.json({
      barcodes: barcodes || [],
      count: barcodes?.length || 0,
      printed: barcodes?.filter((b: any) => b.printed).length || 0,
      notPrinted: barcodes?.filter((b: any) => !b.printed).length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching barcodes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barcodes', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/kitchen-sheets/[id]/barcode
 * Mark barcode as printed
 * 
 * Body:
 * {
 *   barcode_label_id: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { barcode_label_id } = body;

    if (!barcode_label_id) {
      return NextResponse.json(
        { error: 'barcode_label_id is required' },
        { status: 400 }
      );
    }

    await markBarcodePrinted(barcode_label_id);

    return NextResponse.json({
      success: true,
      message: 'Barcode marked as printed',
    });
  } catch (error: any) {
    console.error('Error marking barcode as printed:', error);
    return NextResponse.json(
      { error: 'Failed to mark barcode as printed', details: error.message },
      { status: 500 }
    );
  }
}

