import { NextRequest, NextResponse } from 'next/server';
import { 
  modifyOrderItems, 
  addOrderItems, 
  removeOrderItems 
} from '@/lib/services/order-modification';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/orders/[id]/modify
 * Modify order items
 * 
 * Body:
 * - action: 'replace' | 'add' | 'remove'
 * - items: Array of items (for replace/add)
 * - item_ids: Array of item IDs (for remove)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, items, item_ids } = body;

    if (!action || !['replace', 'add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: replace, add, or remove' },
        { status: 400 }
      );
    }

    let updatedOrder;

    switch (action) {
      case 'replace':
        if (!items || !Array.isArray(items) || items.length === 0) {
          return NextResponse.json(
            { error: 'Items array is required for replace action' },
            { status: 400 }
          );
        }
        updatedOrder = await modifyOrderItems(params.id, items);
        break;

      case 'add':
        if (!items || !Array.isArray(items) || items.length === 0) {
          return NextResponse.json(
            { error: 'Items array is required for add action' },
            { status: 400 }
          );
        }
        updatedOrder = await addOrderItems(params.id, items);
        break;

      case 'remove':
        if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
          return NextResponse.json(
            { error: 'item_ids array is required for remove action' },
            { status: 400 }
          );
        }
        updatedOrder = await removeOrderItems(params.id, item_ids);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Order items ${action}ed successfully`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error modifying order:', error);
    return NextResponse.json(
      { error: 'Failed to modify order', details: error.message },
      { status: 500 }
    );
  }
}

