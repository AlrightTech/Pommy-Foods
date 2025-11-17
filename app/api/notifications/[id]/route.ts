import { NextRequest, NextResponse } from 'next/server';
import { markNotificationRead, markNotificationArchived } from '@/lib/services/notifications';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/notifications/[id]
 * Mark notification as read/archived
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action || !['read', 'archived'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "read" or "archived"' },
        { status: 400 }
      );
    }

    if (action === 'read') {
      await markNotificationRead(params.id);
      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      await markNotificationArchived(params.id);
      return NextResponse.json({
        success: true,
        message: 'Notification archived',
      });
    }
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification', details: error.message },
      { status: 500 }
    );
  }
}

