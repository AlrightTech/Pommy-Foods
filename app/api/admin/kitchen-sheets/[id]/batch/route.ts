import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/kitchen-sheets/[id]/batch
 * Record batch number and expiry date for kitchen sheet items
 * 
 * Body:
 * {
 *   items: Array<{
 *     kitchen_sheet_item_id: string,
 *     batch_number?: string,
 *     expiry_date?: string (ISO date string)
 *   }>
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items array is required and must not be empty' },
        { status: 400 }
      );
    }

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

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Validate and update each item
    const updates: Array<{ id: string; batch_number?: string; expiry_date?: string }> = [];
    const errors: string[] = [];

    for (const item of items) {
      const { kitchen_sheet_item_id, batch_number, expiry_date } = item;

      if (!kitchen_sheet_item_id) {
        errors.push('kitchen_sheet_item_id is required for each item');
        continue;
      }

      // Validate expiry date if provided
      if (expiry_date) {
        const expiryDate = new Date(expiry_date);
        expiryDate.setHours(0, 0, 0, 0);

        // Expiry date should be in the future
        if (expiryDate < currentDate) {
          errors.push(`Expiry date ${expiry_date} is in the past for item ${kitchen_sheet_item_id}`);
          continue;
        }
      }

      updates.push({
        id: kitchen_sheet_item_id,
        batch_number: batch_number || null,
        expiry_date: expiry_date || null,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Update items in batch
    const updatedItems = [];
    for (const update of updates) {
      const { data: updatedItem, error: updateError } = await adminSupabase
        .from('kitchen_sheet_items')
        .update({
          batch_number: update.batch_number,
          expiry_date: update.expiry_date,
        })
        .eq('id', update.id)
        .eq('kitchen_sheet_id', params.id)
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `)
        .single();

      if (updateError) {
        console.error(`Failed to update item ${update.id}:`, updateError);
        errors.push(`Failed to update item ${update.id}: ${updateError.message}`);
      } else {
        updatedItems.push(updatedItem);
      }
    }

    if (errors.length > 0 && updatedItems.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update items', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedItems.length} item(s)`,
      items: updatedItems,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error updating batch information:', error);
    return NextResponse.json(
      { error: 'Failed to update batch information', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/kitchen-sheets/[id]/batch
 * Get batch and expiry information for kitchen sheet
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: kitchenSheet, error: sheetError } = await adminSupabase
      .from('kitchen_sheets')
      .select(`
        id,
        kitchen_sheet_items (
          id,
          product_id,
          quantity,
          batch_number,
          expiry_date,
          products (
            id,
            name,
            sku,
            category
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (sheetError || !kitchenSheet) {
      return NextResponse.json(
        { error: 'Kitchen sheet not found' },
        { status: 404 }
      );
    }

    const items = kitchenSheet.kitchen_sheet_items as any[];

    // Group items by expiry date
    const groupedByExpiry: Record<string, any[]> = {};
    items.forEach((item: any) => {
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date).toISOString().split('T')[0];
        if (!groupedByExpiry[expiryDate]) {
          groupedByExpiry[expiryDate] = [];
        }
        groupedByExpiry[expiryDate].push(item);
      } else {
        // Items without expiry date
        if (!groupedByExpiry['no_expiry']) {
          groupedByExpiry['no_expiry'] = [];
        }
        groupedByExpiry['no_expiry'].push(item);
      }
    });

    return NextResponse.json({
      kitchenSheetId: params.id,
      items,
      groupedByExpiry,
      totalItems: items.length,
      itemsWithBatch: items.filter((item: any) => item.batch_number).length,
      itemsWithExpiry: items.filter((item: any) => item.expiry_date).length,
    });
  } catch (error: any) {
    console.error('Error fetching batch information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch information', details: error.message },
      { status: 500 }
    );
  }
}

