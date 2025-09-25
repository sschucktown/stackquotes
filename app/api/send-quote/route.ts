import { NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

const resend = new Resend(process.env.RESEND_API_KEY!);

type QuoteItem = { description?: string | null; amount?: number | null };

type QuotePayload = {
  project_title?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  project_description?: string | null;
  good_total?: number | null;
  better_total?: number | null;
  best_total?: number | null;
  good_items?: QuoteItem[] | null;
  better_items?: QuoteItem[] | null;
  best_items?: QuoteItem[] | null;
  deposit_percentage?: number | null;
  valid_until?: string | null;
  notes?: string | null;
  status?: string | null;
};

const currency = (value?: number | null) =>
  `$${Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const summarizeItems = (items?: QuoteItem[] | null) =>
  Array.isArray(items)
    ? items.filter((item) => item?.description).map((item) => String(item?.description))
    : [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientEmail, quote } = body as { clientEmail?: string; quote?: QuotePayload };

    if (!clientEmail || !quote) {
      return NextResponse.json({ error: "Missing clientEmail or quote" }, { status: 400 });
    }

    // Generate PDF
    const doc = new PDFDocument();
    doc.fontSize(18).text("Quote", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Project: ${quote.project_title}`);
    doc.text(`Client: ${quote.client_name}`);
    doc.text(`Email: ${quote.client_email}`);
    doc.moveDown();
    doc.text("Description:");
    doc.text(quote.project_description || "N/A");
    doc.moveDown();
    doc.text(`Good: $${quote.good_total}`);
    doc.text(`Better: $${quote.better_total}`);
    doc.text(`Best: $${quote.best_total}`);
    doc.end();

    const pdfBuffer = await getStream.buffer(doc);

    // Send email with Resend
    const result = await resend.emails.send({
      from: "StackQuotes <noreply@stackquotes.com>",
      to: [clientEmail],
      subject: `Quote: ${quote.project_title ?? "Untitled Project"}`,
      html: "<p>Please find your quote attached.</p>",
      text: "Please find your quote attached.",
      attachments: [
        {
          filename: "quote.pdf",
          content: pdfBuffer, // ✅ send buffer directly
        },
      ],
    });

    console.log("📧 Resend result:", JSON.stringify(result, null, 2));

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error("❌ Send quote error:", err);
    return NextResponse.json(
      { success: false, error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
