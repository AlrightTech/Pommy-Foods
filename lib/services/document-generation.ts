import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface KitchenSheetData {
  id: string;
  sheet_number: string;
  order_id: string;
  order_number: string;
  created_at: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    category: string;
    quantity: number;
    unit: string;
    prepared: boolean;
    batch_number?: string | null;
    expiry_date?: string | null;
  }>;
  groupedByCategory: Record<string, Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit: string;
    prepared: boolean;
    batch_number?: string | null;
    expiry_date?: string | null;
  }>>;
  groupedByExpiry?: Record<string, Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit: string;
    prepared: boolean;
    batch_number?: string | null;
    expiry_date?: string | null;
  }>>;
}

export interface DeliveryNoteData {
  id: string;
  note_number: string;
  order_id: string;
  order_number: string;
  store_id: string;
  store_name: string;
  store_address: string;
  store_city: string;
  store_state: string;
  store_zip_code: string;
  store_phone: string;
  store_email: string;
  created_at: string;
  items: Array<{
    product_id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit: string;
  }>;
}

/**
 * Generate kitchen sheet data with items grouped by category
 */
export async function generateKitchenSheetData(
  kitchenSheetId: string
): Promise<KitchenSheetData> {
  const adminSupabase = getSupabaseAdmin();

  // Get kitchen sheet with order and items
  const { data: kitchenSheet, error: sheetError } = await adminSupabase
    .from('kitchen_sheets')
    .select(`
      id,
      sheet_number,
      order_id,
      created_at,
      orders (
        id,
        order_number
      ),
      kitchen_sheet_items (
        id,
        product_id,
        quantity,
        prepared,
        batch_number,
        expiry_date,
        products (
          id,
          name,
          sku,
          category,
          unit
        )
      )
    `)
    .eq('id', kitchenSheetId)
    .single();

  if (sheetError || !kitchenSheet) {
    throw new Error('Kitchen sheet not found');
  }

  const order = kitchenSheet.orders as any;
  const items = (kitchenSheet.kitchen_sheet_items as any[]).map((item: any) => {
    const product = item.products;
    return {
      product_id: item.product_id,
      product_name: product?.name || 'Unknown Product',
      product_sku: product?.sku || 'N/A',
      category: product?.category || 'Uncategorized',
      quantity: item.quantity,
      unit: product?.unit || 'unit',
      prepared: item.prepared || false,
      batch_number: item.batch_number || null,
      expiry_date: item.expiry_date || null,
    };
  });

  // Group items by category
  const groupedByCategory: Record<string, typeof items> = {};
  items.forEach(item => {
    const category = item.category;
    if (!groupedByCategory[category]) {
      groupedByCategory[category] = [];
    }
    groupedByCategory[category].push(item);
  });

  // Group items by expiry date for priority handling
  const groupedByExpiry: Record<string, typeof items> = {};
  items.forEach(item => {
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date).toISOString().split('T')[0];
      if (!groupedByExpiry[expiryDate]) {
        groupedByExpiry[expiryDate] = [];
      }
      groupedByExpiry[expiryDate].push(item);
    }
  });

  return {
    id: kitchenSheet.id,
    sheet_number: kitchenSheet.sheet_number,
    order_id: kitchenSheet.order_id,
    order_number: order?.order_number || 'N/A',
    created_at: kitchenSheet.created_at,
    items,
    groupedByCategory,
    groupedByExpiry,
  };
}

/**
 * Generate delivery note data
 */
export async function generateDeliveryNoteData(
  deliveryId: string
): Promise<DeliveryNoteData> {
  const adminSupabase = getSupabaseAdmin();

  // Get delivery with order, store, and items
  const { data: delivery, error: deliveryError } = await adminSupabase
    .from('deliveries')
    .select(`
      id,
      order_id,
      created_at,
      orders (
        id,
        order_number,
        order_items (
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            sku,
            unit
          )
        )
      ),
      delivery_notes (
        id,
        note_number
      )
    `)
    .eq('id', deliveryId)
    .single();

  if (deliveryError || !delivery) {
    throw new Error('Delivery not found');
  }

  const order = delivery.orders as any;
  const orderItems = order?.order_items || [];

  // Get store information
  const { data: orderWithStore } = await adminSupabase
    .from('orders')
    .select(`
      store_id,
      stores (
        id,
        name,
        email,
        phone,
        address,
        city,
        state,
        zip_code
      )
    `)
    .eq('id', delivery.order_id)
    .single();

  const store = orderWithStore?.stores as any;

  const items = orderItems.map((item: any) => {
    const product = item.products;
    return {
      product_id: item.product_id,
      product_name: product?.name || 'Unknown Product',
      product_sku: product?.sku || 'N/A',
      quantity: item.quantity,
      unit: product?.unit || 'unit',
    };
  });

  const deliveryNote = (delivery.delivery_notes as any[])?.[0];

  return {
    id: delivery.id,
    note_number: deliveryNote?.note_number || `DN-${delivery.id.substring(0, 8)}`,
    order_id: delivery.order_id,
    order_number: order?.order_number || 'N/A',
    store_id: store?.id || '',
    store_name: store?.name || 'Unknown Store',
    store_address: store?.address || '',
    store_city: store?.city || '',
    store_state: store?.state || '',
    store_zip_code: store?.zip_code || '',
    store_phone: store?.phone || '',
    store_email: store?.email || '',
    created_at: delivery.created_at,
    items,
  };
}

/**
 * Create delivery note record
 */
export async function createDeliveryNote(
  deliveryId: string,
  orderId: string,
  storeId: string
): Promise<{ id: string; note_number: string }> {
  const adminSupabase = getSupabaseAdmin();

  // Generate note number
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const noteNumber = `DN-${timestamp}-${random}`;

  // Create delivery note
  const { data: deliveryNote, error } = await adminSupabase
    .from('delivery_notes')
    .insert({
      delivery_id: deliveryId,
      note_number: noteNumber,
      order_id: orderId,
      store_id: storeId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create delivery note: ${error.message}`);
  }

  return {
    id: deliveryNote.id,
    note_number: deliveryNote.note_number,
  };
}

