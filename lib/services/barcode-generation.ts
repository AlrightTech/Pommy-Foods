import { getSupabaseAdmin } from '@/lib/supabase/admin';

export interface BarcodeLabel {
  id: string;
  kitchen_sheet_item_id: string;
  barcode: string;
  qr_code: string;
  label_type: 'barcode' | 'qr_code' | 'both';
  printed: boolean;
  printed_at?: string;
}

/**
 * Generate unique barcode for kitchen sheet item
 * Format: PF-{product_sku}-{batch_number}-{timestamp}
 */
export function generateBarcode(
  productSku: string,
  batchNumber?: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now();
  const batch = batchNumber ? `-${batchNumber}` : '';
  return `PF-${productSku}${batch}-${ts}`;
}

/**
 * Generate unique QR code (same format as barcode for now)
 */
export function generateQRCode(
  productSku: string,
  batchNumber?: string,
  timestamp?: number
): string {
  return generateBarcode(productSku, batchNumber, timestamp);
}

/**
 * Generate barcode label for a kitchen sheet item
 */
export async function generateBarcodeLabel(
  kitchenSheetItemId: string,
  productSku: string,
  batchNumber?: string,
  labelType: 'barcode' | 'qr_code' | 'both' = 'both'
): Promise<BarcodeLabel> {
  const adminSupabase = getSupabaseAdmin();

  // Check if barcode already exists
  const { data: existing } = await adminSupabase
    .from('barcode_labels')
    .select('*')
    .eq('kitchen_sheet_item_id', kitchenSheetItemId)
    .single();

  if (existing) {
    return existing as BarcodeLabel;
  }

  // Generate barcode and QR code
  const timestamp = Date.now();
  const barcode = generateBarcode(productSku, batchNumber, timestamp);
  const qrCode = generateQRCode(productSku, batchNumber, timestamp);

  // Create barcode label record
  const { data: label, error } = await adminSupabase
    .from('barcode_labels')
    .insert({
      kitchen_sheet_item_id: kitchenSheetItemId,
      barcode,
      qr_code: qrCode,
      label_type: labelType,
      printed: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to generate barcode label: ${error.message}`);
  }

  return label as BarcodeLabel;
}

/**
 * Get barcode label for a kitchen sheet item
 */
export async function getBarcodeLabel(
  kitchenSheetItemId: string
): Promise<BarcodeLabel | null> {
  const adminSupabase = getSupabaseAdmin();

  const { data: label, error } = await adminSupabase
    .from('barcode_labels')
    .select('*')
    .eq('kitchen_sheet_item_id', kitchenSheetItemId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch barcode label: ${error.message}`);
  }

  return label as BarcodeLabel | null;
}

/**
 * Mark barcode label as printed
 */
export async function markBarcodePrinted(
  barcodeLabelId: string
): Promise<void> {
  const adminSupabase = getSupabaseAdmin();

  const { error } = await adminSupabase
    .from('barcode_labels')
    .update({
      printed: true,
      printed_at: new Date().toISOString(),
    })
    .eq('id', barcodeLabelId);

  if (error) {
    throw new Error(`Failed to mark barcode as printed: ${error.message}`);
  }
}

/**
 * Generate barcodes for all items in a kitchen sheet
 */
export async function generateBarcodesForKitchenSheet(
  kitchenSheetId: string
): Promise<BarcodeLabel[]> {
  const adminSupabase = getSupabaseAdmin();

  // Get all kitchen sheet items
  const { data: items, error: itemsError } = await adminSupabase
    .from('kitchen_sheet_items')
    .select(`
      id,
      batch_number,
      products (
        id,
        sku
      )
    `)
    .eq('kitchen_sheet_id', kitchenSheetId);

  if (itemsError) {
    throw new Error(`Failed to fetch kitchen sheet items: ${itemsError.message}`);
  }

  const labels: BarcodeLabel[] = [];

  for (const item of items || []) {
    const product = item.products as any;
    const productSku = product?.sku || 'UNKNOWN';
    const batchNumber = item.batch_number || undefined;

    try {
      const label = await generateBarcodeLabel(item.id, productSku, batchNumber);
      labels.push(label);
    } catch (error: any) {
      console.error(`Failed to generate barcode for item ${item.id}:`, error);
      // Continue with other items
    }
  }

  return labels;
}

