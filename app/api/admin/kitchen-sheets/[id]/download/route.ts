import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { generateKitchenSheetData } from '@/lib/services/document-generation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/kitchen-sheets/[id]/download
 * Download kitchen sheet as PDF or JSON
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

    // Generate kitchen sheet data
    const kitchenSheetData = await generateKitchenSheetData(params.id);

    if (format === 'pdf') {
      // TODO: Generate PDF using a PDF library
      // For now, return JSON data that can be used to generate PDF on frontend
      return NextResponse.json({
        message: 'PDF generation not yet implemented. Use kitchen sheet data to generate PDF on frontend.',
        kitchenSheet: kitchenSheetData,
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
            'Content-Disposition': `attachment; filename="kitchen-sheet-${kitchenSheetData.sheet_number}.pdf"`,
          },
        });
      });

      // Add content to PDF
      doc.fontSize(20).text(`Kitchen Sheet ${kitchenSheetData.sheet_number}`, 100, 100);
      doc.fontSize(14).text(`Order: ${kitchenSheetData.order_number}`, 100, 130);
      
      // Group by category
      Object.entries(kitchenSheetData.groupedByCategory).forEach(([category, items]) => {
        doc.fontSize(16).text(category, 100, doc.y + 20);
        items.forEach(item => {
          doc.fontSize(12).text(`${item.product_name} (${item.product_sku}) - Qty: ${item.quantity} ${item.unit}`, 120, doc.y + 10);
        });
      });

      doc.end();
      */
    }

    // Return JSON format
    return NextResponse.json({
      kitchenSheet: kitchenSheetData,
    });
  } catch (error: any) {
    console.error('Error generating kitchen sheet:', error);
    return NextResponse.json(
      { error: 'Failed to generate kitchen sheet', details: error.message },
      { status: 500 }
    );
  }
}

