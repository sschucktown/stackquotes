import { NextResponse } from "next/server";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import type * as PDFKit from "pdfkit";

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

const toBuffer = (doc: PDFKit.PDFDocument) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) =>
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    );
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clientEmail, quote } = body as { clientEmail?: string; quote?: QuotePayload };

    if (!clientEmail || !quote) {
      return NextResponse.json({ error: "Missing clientEmail or quote" }, { status: 400 });
    }

    const depositPercentage = Number(quote.deposit_percentage ?? 0);
    const hasDeposit = depositPercentage > 0;

    const tiers = [
      { label: "Good Option", total: quote.good_total },
      { label: "Better Option", total: quote.better_total },
      { label: "Best Option", total: quote.best_total },
    ].filter((tier) => Number(tier.total ?? 0) > 0);

    const depositAmount = (total?: number | null) => {
      const numericTotal = Number(total ?? 0);
      if (!hasDeposit || numericTotal <= 0) return 0;
      return numericTotal * (depositPercentage / 100);
    };

    // Generate PDF
    const doc = new PDFDocument();
    const pdfBufferPromise = toBuffer(doc);

    doc.fontSize(18).text("Quote", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Project: ${quote.project_title ?? "Untitled Project"}`);
    doc.text(`Client: ${quote.client_name ?? "N/A"}`);
    doc.text(`Email: ${quote.client_email ?? "N/A"}`);
    if (quote.client_phone) {
      doc.text(`Phone: ${quote.client_phone}`);
    }
    if (quote.valid_until) {
      doc.text(`Valid until: ${quote.valid_until}`);
    }
    doc.moveDown();
    doc.text("Description:");
    doc.text(quote.project_description || "N/A");
    doc.moveDown();
    doc.text(`Good: ${currency(quote.good_total)}`);
    doc.text(`Better: ${currency(quote.better_total)}`);
    doc.text(`Best: ${currency(quote.best_total)}`);
    doc.moveDown();

    if (hasDeposit) {
      doc.text(
        `Deposit required: ${depositPercentage}% due upon approval of your selected option.`
      );
      if (tiers.length) {
        doc.moveDown(0.5);
        tiers.forEach((tier) => {
          const tierDeposit = depositAmount(tier.total);
          doc.text(`${tier.label} deposit: ${currency(tierDeposit)}`);
        });
      }
      doc.moveDown();
      doc.text(
        "Pay the deposit using the secure link we provide once you confirm your preferred option. Reach out if you need the link resent."
      );
    } else {
      doc.text("No deposit payment is required to approve this quote.");
    }

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    const greetingName = quote.client_name?.trim().split(" ")[0] || "there";
    const projectTitle = quote.project_title ?? "your project";
    const depositLinesHtml = hasDeposit && tiers.length
      ? `<ul>${tiers
          .map(
            (tier) => `<li>${tier.label}: ${currency(depositAmount(tier.total))}</li>`
          )
          .join("")}</ul>`
      : "";

    const depositLinesText = hasDeposit && tiers.length
      ? tiers
          .map((tier) => `${tier.label}: ${currency(depositAmount(tier.total))}`)
          .join("\n")
      : "";

    const depositInstructionHtml = hasDeposit
      ? `<p><strong>Deposit required:</strong> ${depositPercentage}% is due upon approval.</p>${depositLinesHtml}<p>Approve your preferred option and use the secure payment link we send to pay the deposit and lock in scheduling.</p>`
      : "<p>No deposit payment is required to approve this quote.</p>";

    const depositInstructionText = hasDeposit
      ? `Deposit required: ${depositPercentage}% due upon approval.${
          depositLinesText ? `\n${depositLinesText}` : ""
        }\nApprove your preferred option and use the secure payment link we send to pay the deposit.`
      : "No deposit payment is required to approve this quote.";

    const emailHtml = `
      <p>Hi ${greetingName},</p>
      <p>Your quote for <strong>${projectTitle}</strong> is attached as a PDF.</p>
      ${depositInstructionHtml}
      <p>Let us know if you have any questions or need adjustments.</p>
      <p>Thanks,<br/>The StackQuotes Team</p>
    `;

    const emailText = `Hi ${greetingName},

We're excited to share your quote for ${projectTitle}. The PDF is attached.

${depositInstructionText}

Let us know if you have any questions or need adjustments.

Thanks,
The StackQuotes Team`;

    // Send email with Resend
    const result = await resend.emails.send({
      from: "StackQuotes <noreply@stackquotes.com>",
      to: [clientEmail],
      subject: `Quote: ${quote.project_title ?? "Untitled Project"}`,
      html: emailHtml,
      text: emailText,
      attachments: [
        {
          filename: "quote.pdf",
          content: pdfBuffer,
          type: "application/pdf",
        },
      ],
    });

    console.log("Resend result:", JSON.stringify(result, null, 2));

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err: any) {
    console.error("Send quote error:", err);
    return NextResponse.json(
      { success: false, error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
