import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getNotifications, createNotification } from '@/lib/services/notifications';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 * Get notifications for current user
 */
export async function GET(request: NextRequest) {
  try {
    const adminSupabase = getSupabaseAdmin();
    const searchParams = request.nextUrl.searchParams;

    // TODO: Get user_id from authentication
    // For now, using a query parameter (should be from auth session)
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status') as 'unread' | 'read' | 'archived' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    const notifications = await getNotifications(userId, status || undefined);

    // Paginate
    const paginatedNotifications = notifications.slice(offset, offset + limit);

    return NextResponse.json({
      notifications: paginatedNotifications,
      pagination: {
        page,
        limit,
        total: notifications.length,
        totalPages: Math.ceil(notifications.length / limit),
      },
      unreadCount: notifications.filter(n => n.status === 'unread').length,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create notification (admin/system use)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, type, message, data } = body;

    if (!user_id || !type || !message) {
      return NextResponse.json(
        { error: 'user_id, type, and message are required' },
        { status: 400 }
      );
    }

    const notification = await createNotification(user_id, type, message, data);

    return NextResponse.json({
      success: true,
      notification,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

