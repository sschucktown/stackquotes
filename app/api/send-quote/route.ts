import { NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientEmail, quote } = body;

    if (!clientEmail || !quote) {
      return NextResponse.json(
        { error: "Missing clientEmail or quote" },
        { status: 400 }
      );
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
    const { data, error } = await resend.emails.send({
      from: "StackQuotes <noreply@stackquotes.com>", // ✅ must use verified domain
      to: [clientEmail],
      subject: `Quote: ${quote.project_title}`,
      html: "<p>Please find your quote attached.</p>",
      attachments: [
        {
          filename: "quote.pdf",
          content: pdfBuffer.toString("base64"),
        },
      ],
    });

    console.log("Resend result:", { data, error });

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("Send quote error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
