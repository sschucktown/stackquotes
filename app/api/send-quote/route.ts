import { NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import getStream from "get-stream";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quote, clientEmail } = body;

    if (!quote || !clientEmail) {
      return NextResponse.json(
        { success: false, error: "Missing quote or client email" },
        { status: 400 }
      );
    }

    // Generate PDF
    const doc = new PDFDocument();
    let buffers: Buffer[] = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      try {
        const { data, error } = await resend.emails.send({
          from: "StackQuotes <noreply@stackquotes.com>", // ✅ must match verified domain
          to: clientEmail,
          subject: `Quote: ${quote.project_title}`,
          text: "Please find your quote attached.",
          attachments: [
            {
              filename: "quote.pdf",
              content: pdfBuffer.toString("base64"),
              encoding: "base64",
            },
          ],
        });

        if (error) {
          console.error("Resend error:", error);
          return NextResponse.json(
            { success: false, error: "Failed to send email" },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true, result: data });
      } catch (err) {
        console.error("Send email error:", err);
        return NextResponse.json(
          { success: false, error: "Failed to send email" },
          { status: 500 }
        );
      }
    });

    // Build PDF content
    doc.fontSize(20).text(`Quote: ${quote.project_title}`);
    doc.moveDown();
    doc.fontSize(14).text(`Client: ${quote.client_name}`);
    doc.text(`Email: ${quote.client_email}`);
    if (quote.client_phone) doc.text(`Phone: ${quote.client_phone}`);
    doc.moveDown();

    doc.text("Project Description:");
    doc.text(quote.project_description || "N/A");
    doc.moveDown();

    ["good", "better", "best"].forEach((tier) => {
      doc.fontSize(16).text(`${tier.toUpperCase()} Tier`);
      doc.fontSize(12).text(
        `Total: $${quote[`${tier}_total`] || 0}`
      );
      const items = quote[`${tier}_items`] || [];
      items.forEach((item: any) => {
        doc.text(`- ${item.name}: $${item.price}`);
      });
      doc.moveDown();
    });

    doc.end();
    return new Response(); // Finish after PDF streaming starts
  } catch (error) {
    console.error("Send quote error:", error);
    return NextResponse.json(
      { success: false, error: "Unexpected error" },
      { status: 500 }
    );
  }
}
