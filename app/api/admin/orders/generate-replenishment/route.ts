import { NextRequest, NextResponse } from 'next/server';
import { 
  generateReplenishmentOrder, 
  generateAllReplenishmentOrders,
  checkStoreReplenishmentNeeds 
} from '@/lib/services/replenishment';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/orders/generate-replenishment
 * Generate replenishment orders for stores with low stock
 * 
 * Query params:
 * - store_id: (optional) Generate for specific store only
 * - check_only: (optional) If true, only check needs without generating orders
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');
    const checkOnly = searchParams.get('check_only') === 'true';

    if (checkOnly) {
      // Just check replenishment needs without generating orders
      if (storeId) {
        const needs = await checkStoreReplenishmentNeeds(storeId);
        return NextResponse.json({
          store_id: storeId,
          needs_replenishment: needs.length > 0,
          items: needs,
        });
      } else {
        return NextResponse.json(
          { error: 'store_id is required when check_only=true' },
          { status: 400 }
        );
      }
    }

    // Generate replenishment orders
    if (storeId) {
      // Generate for specific store
      const order = await generateReplenishmentOrder(storeId);
      
      if (!order) {
        return NextResponse.json({
          success: true,
          message: 'No replenishment needed or draft order already exists',
          order: null,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Replenishment order generated',
        order,
      });
    } else {
      // Generate for all stores
      const orders = await generateAllReplenishmentOrders();
      
      return NextResponse.json({
        success: true,
        message: `Generated ${orders.length} replenishment order(s)`,
        orders,
        count: orders.length,
      });
    }
  } catch (error: any) {
    console.error('Error generating replenishment orders:', error);
    return NextResponse.json(
      { error: 'Failed to generate replenishment orders', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/orders/generate-replenishment
 * Check replenishment needs without generating orders
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('store_id');

    if (!storeId) {
      return NextResponse.json(
        { error: 'store_id is required' },
        { status: 400 }
      );
    }

    const needs = await checkStoreReplenishmentNeeds(storeId);

    return NextResponse.json({
      store_id: storeId,
      needs_replenishment: needs.length > 0,
      items: needs,
      count: needs.length,
    });
  } catch (error: any) {
    console.error('Error checking replenishment needs:', error);
    return NextResponse.json(
      { error: 'Failed to check replenishment needs', details: error.message },
      { status: 500 }
    );
  }
}

