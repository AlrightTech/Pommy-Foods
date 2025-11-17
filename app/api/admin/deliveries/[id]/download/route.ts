import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateDeliveryNoteData, createDeliveryNote } from '@/lib/services/document-generation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/deliveries/[id]/download
 * Download delivery note as PDF or JSON
 * 
 * Query params:
 * - format: 'pdf' | 'json' (default: 'json')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    // Get delivery to check if delivery note exists
    const adminSupabase = getSupabaseAdmin();
    const { data: delivery, error: deliveryError } = await adminSupabase
      .from('deliveries')
      .select('id, order_id, delivery_notes (id)')
      .eq('id', params.id)
      .single();

    if (deliveryError || !delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      );
    }

    // Create delivery note if it doesn't exist
    const deliveryNotes = delivery.delivery_notes as any[];
    if (!deliveryNotes || deliveryNotes.length === 0) {
      // Get order to get store_id
      const { data: order } = await adminSupabase
        .from('orders')
        .select('store_id')
        .eq('id', delivery.order_id)
        .single();

      if (order && order.store_id) {
        await createDeliveryNote(params.id, delivery.order_id, order.store_id);
      }
    }

    // Generate delivery note data
    const deliveryNoteData = await generateDeliveryNoteData(params.id);

    if (format === 'pdf') {
      // TODO: Generate PDF using a PDF library
      // For now, return JSON data that can be used to generate PDF on frontend
      return NextResponse.json({
        message: 'PDF generation not yet implemented. Use delivery note data to generate PDF on frontend.',
        deliveryNote: deliveryNoteData,
      });

      // Example PDF generation (commented out - requires pdfkit or similar):
      /*
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="delivery-note-${deliveryNoteData.note_number}.pdf"`,
          },
        });
      });

      // Add content to PDF
      doc.fontSize(20).text(`Delivery Note ${deliveryNoteData.note_number}`, 100, 100);
      doc.fontSize(14).text(`Order: ${deliveryNoteData.order_number}`, 100, 130);
      doc.fontSize(12).text(`Store: ${deliveryNoteData.store_name}`, 100, 150);
      doc.fontSize(12).text(`${deliveryNoteData.store_address}`, 100, 170);
      doc.fontSize(12).text(`${deliveryNoteData.store_city}, ${deliveryNoteData.store_state} ${deliveryNoteData.store_zip_code}`, 100, 190);
      
      doc.fontSize(16).text('Items:', 100, doc.y + 30);
      deliveryNoteData.items.forEach(item => {
        doc.fontSize(12).text(`${item.product_name} (${item.product_sku}) - Qty: ${item.quantity} ${item.unit}`, 120, doc.y + 10);
      });

      doc.end();
      */
    }

    // Return JSON format
    return NextResponse.json({
      deliveryNote: deliveryNoteData,
    });
  } catch (error: any) {
    console.error('Error generating delivery note:', error);
    return NextResponse.json(
      { error: 'Failed to generate delivery note', details: error.message },
      { status: 500 }
    );
  }
}

