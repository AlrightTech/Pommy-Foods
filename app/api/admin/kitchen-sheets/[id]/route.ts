import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/kitchen-sheets/[id]
 * Get kitchen sheet with item preparation status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();

    const { data: kitchenSheet, error } = await adminSupabase
      .from('kitchen_sheets')
      .select(`
        *,
        orders (
          id,
          order_number,
          status
        ),
        kitchen_sheet_items (
          id,
          product_id,
          quantity,
          prepared,
          prepared_at,
          prepared_by,
          batch_number,
          expiry_date,
          products (
            id,
            name,
            sku,
            category,
            unit
          ),
          barcode_labels (
            id,
            barcode,
            qr_code,
            label_type,
            printed
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!kitchenSheet) {
      return NextResponse.json(
        { error: 'Kitchen sheet not found' },
        { status: 404 }
      );
    }

    // Group items by category and expiry date
    const items = kitchenSheet.kitchen_sheet_items as any[];
    const groupedByCategory: Record<string, any[]> = {};
    const groupedByExpiry: Record<string, any[]> = {};

    items.forEach((item: any) => {
      const category = item.products?.category || 'Uncategorized';
      if (!groupedByCategory[category]) {
        groupedByCategory[category] = [];
      }
      groupedByCategory[category].push(item);

      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date).toISOString().split('T')[0];
        if (!groupedByExpiry[expiryDate]) {
          groupedByExpiry[expiryDate] = [];
        }
        groupedByExpiry[expiryDate].push(item);
      }
    });

    const preparedCount = items.filter((item: any) => item.prepared).length;
    const totalCount = items.length;

    return NextResponse.json({
      kitchenSheet: {
        ...kitchenSheet,
        preparationStatus: {
          prepared: preparedCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0,
        },
        groupedByCategory,
        groupedByExpiry,
      },
    });
  } catch (error: any) {
    console.error('Error fetching kitchen sheet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kitchen sheet', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/kitchen-sheets/[id]
 * Mark items as prepared or mark kitchen sheet as completed
 * 
 * Body:
 * {
 *   action: 'mark_prepared' | 'mark_completed',
 *   item_ids?: string[] (required for mark_prepared),
 *   prepared_by?: string (required for mark_prepared)
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const body = await request.json();

    const { action, item_ids, prepared_by } = body;

    if (!action || !['mark_prepared', 'mark_completed'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "mark_prepared" or "mark_completed"' },
        { status: 400 }
      );
    }

    if (action === 'mark_prepared') {
      if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
        return NextResponse.json(
          { error: 'item_ids array is required for mark_prepared action' },
          { status: 400 }
        );
      }

      // Mark items as prepared
      const { data: updatedItems, error: updateError } = await adminSupabase
        .from('kitchen_sheet_items')
        .update({
          prepared: true,
          prepared_at: new Date().toISOString(),
          prepared_by: prepared_by || null,
        })
        .in('id', item_ids)
        .eq('kitchen_sheet_id', params.id)
        .select(`
          *,
          products (
            id,
            name,
            sku
          )
        `);

      if (updateError) {
        throw updateError;
      }

      // Check if all items are prepared
      const { data: allItems } = await adminSupabase
        .from('kitchen_sheet_items')
        .select('id, prepared')
        .eq('kitchen_sheet_id', params.id);

      const allPrepared = (allItems || []).every((item: any) => item.prepared);

      if (allPrepared) {
        // Mark kitchen sheet as completed
        await adminSupabase
          .from('kitchen_sheets')
          .update({
            completed_at: new Date().toISOString(),
          })
          .eq('id', params.id);
      }

      return NextResponse.json({
        success: true,
        message: `Marked ${updatedItems?.length || 0} item(s) as prepared`,
        items: updatedItems,
        allPrepared,
      });
    } else if (action === 'mark_completed') {
      // Mark kitchen sheet as completed
      const { data: kitchenSheet, error: updateError } = await adminSupabase
        .from('kitchen_sheets')
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        message: 'Kitchen sheet marked as completed',
        kitchenSheet,
      });
    }
  } catch (error: any) {
    console.error('Error updating kitchen sheet:', error);
    return NextResponse.json(
      { error: 'Failed to update kitchen sheet', details: error.message },
      { status: 500 }
    );
  }
}

