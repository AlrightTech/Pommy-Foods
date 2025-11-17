import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  data?: any;
  status: 'unread' | 'read' | 'archived';
  created_at: string;
  read_at?: string;
}

/**
 * Create a notification
 */
export async function createNotification(
  userId: string,
  type: string,
  message: string,
  data?: any
): Promise<Notification> {
  const adminSupabase = getSupabaseAdmin();

  const { data: notification, error } = await adminSupabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      message,
      data: data || null,
      status: 'unread',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  return notification as Notification;
}

/**
 * Send order approval notification to store owner
 */
export async function sendOrderApprovalNotification(
  storeId: string,
  orderId: string
): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  // Get store owner (user with store_id matching)
  const { data: storeOwner, error: ownerError } = await adminSupabase
    .from('user_profiles')
    .select('id')
    .eq('store_id', storeId)
    .eq('role', 'store_owner')
    .maybeSingle();

  if (ownerError || !storeOwner) {
    console.warn(`No store owner found for store ${storeId}`);
    return;
  }

  // Get order details
  const { data: order } = await adminSupabase
    .from('orders')
    .select('order_number, final_amount')
    .eq('id', orderId)
    .single();

  const orderNumber = order?.order_number || orderId;
  const orderAmount = order?.final_amount || 0;

  await createNotification(
    storeOwner.id,
    'order_approved',
    `Your order ${orderNumber} has been approved. Total amount: $${orderAmount.toFixed(2)}`,
    {
      order_id: orderId,
      order_number: orderNumber,
      amount: orderAmount,
    }
  );
}

/**
 * Send payment reminder notification
 */
export async function sendPaymentReminderNotification(
  storeId: string,
  invoiceId: string
): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  // Get store owner
  const { data: storeOwner, error: ownerError } = await adminSupabase
    .from('user_profiles')
    .select('id')
    .eq('store_id', storeId)
    .eq('role', 'store_owner')
    .maybeSingle();

  if (ownerError || !storeOwner) {
    console.warn(`No store owner found for store ${storeId}`);
    return;
  }

  // Get invoice details
  const { data: invoice } = await adminSupabase
    .from('invoices')
    .select('invoice_number, total_amount, due_date')
    .eq('id', invoiceId)
    .single();

  const invoiceNumber = invoice?.invoice_number || invoiceId;
  const amount = invoice?.total_amount || 0;
  const dueDate = invoice?.due_date || '';

  await createNotification(
    storeOwner.id,
    'payment_reminder',
    `Payment reminder: Invoice ${invoiceNumber} for $${amount.toFixed(2)} is due on ${dueDate}`,
    {
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      amount,
      due_date: dueDate,
    }
  );
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
  userId: string,
  status?: 'unread' | 'read' | 'archived'
): Promise<Notification[]> {
  const adminSupabase = getSupabaseAdmin();

  let query = adminSupabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data: notifications, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return (notifications || []) as Notification[];
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  const { error } = await adminSupabase
    .from('notifications')
    .update({
      status: 'read',
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

/**
 * Mark notification as archived
 */
export async function markNotificationArchived(notificationId: string): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  const { error } = await adminSupabase
    .from('notifications')
    .update({
      status: 'archived',
    })
    .eq('id', notificationId);

  if (error) {
    throw new Error(`Failed to archive notification: ${error.message}`);
  }
}

