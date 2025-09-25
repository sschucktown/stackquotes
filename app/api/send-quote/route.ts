import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont } from "pdf-lib";

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

    const pdfBuffer = await buildQuotePdf(quote);

    const result = await resend.emails.send({
      from: "StackQuotes <noreply@stackquotes.com>",
      to: [clientEmail],
      subject: `Quote: ${quote.project_title ?? "Untitled Project"}`,
      html: "<p>Please find your quote attached.</p>",
      text: "Please find your quote attached.",
      attachments: [
        {
          filename: "quote.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (err) {
    console.error("Send quote error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function buildQuotePdf(quote: QuotePayload): Promise<Buffer> {
  const doc = await PDFDocument.create();
  let page = doc.addPage();
  let { height } = page.getSize();
  const margin = 48;
  let cursorY = height - margin;

  const regularFont = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  const ensureSpace = (heightNeeded: number) => {
    if (cursorY - heightNeeded <= margin) {
      page = doc.addPage();
      ({ height } = page.getSize());
      cursorY = height - margin;
    }
  };

  const drawText = (
    text: string,
    {
      size = 12,
      font = regularFont,
      x = margin,
      lineGap = 6,
    }: { size?: number; font?: PDFFont; x?: number; lineGap?: number } = {}
  ) => {
    const heightNeeded = size + lineGap;
    ensureSpace(heightNeeded);
    page.drawText(text, { x, y: cursorY, size, font, color: rgb(0, 0, 0) });
    cursorY -= heightNeeded;
  };

  const addSpacer = (heightNeeded = 12) => {
    ensureSpace(heightNeeded);
    cursorY -= heightNeeded;
  };

  const drawLabelValue = (label: string, value: string | number | null | undefined) => {
    const size = 12;
    const lineGap = 6;
    const heightNeeded = size + lineGap;
    ensureSpace(heightNeeded);
    page.drawText(`${label}:`, { x: margin, y: cursorY, size, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText(String(value ?? "N/A"), {
      x: margin + 140,
      y: cursorY,
      size,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    cursorY -= heightNeeded;
  };

  const drawParagraph = (text: string) => {
    const lines = breakIntoLines(text, 90);
    lines.forEach((line) => drawText(line, { x: margin + 12, size: 11, lineGap: 4 }));
  };

  const drawHeading = (text: string) => {
    drawText(text, { size: 18, font: boldFont, lineGap: 10 });
  };

  drawHeading("Quote Summary");
  drawLabelValue("Project", quote.project_title ?? "Untitled Project");
  drawLabelValue("Client", quote.client_name ?? "Unknown client");
  if (quote.client_email) {
    drawLabelValue("Email", quote.client_email);
  }
  if (quote.client_phone) {
    drawLabelValue("Phone", quote.client_phone);
  }
  if (quote.valid_until) {
    drawLabelValue("Valid Until", quote.valid_until);
  }

  if (quote.project_description) {
    addSpacer(6);
    drawText("Description", { font: boldFont });
    drawParagraph(quote.project_description);
  }

  addSpacer(12);
  drawHeading("Options");

  const tiers = [
    { label: "Good", total: quote.good_total, items: summarizeItems(quote.good_items) },
    { label: "Better", total: quote.better_total, items: summarizeItems(quote.better_items) },
    { label: "Best", total: quote.best_total, items: summarizeItems(quote.best_items) },
  ];

  tiers.forEach(({ label, total, items }) => {
    drawText(`${label} Option - ${currency(total)}`, { font: boldFont });
    if (items.length === 0) {
      drawText("- No line items provided", { x: margin + 12, size: 11 });
    } else {
      const maxItems = 8;
      items.slice(0, maxItems).forEach((item) => {
        drawText(`- ${item}`, { x: margin + 12, size: 11 });
      });
      if (items.length > maxItems) {
        drawText(`- ...and ${items.length - maxItems} more`, { x: margin + 12, size: 11 });
      }
    }
    addSpacer(6);
  });

  addSpacer(6);
  drawHeading("Financial Summary");
  drawLabelValue("Best Total", currency(quote.best_total));
  const depositPercentage = Number(quote.deposit_percentage ?? 0);
  drawLabelValue("Deposit Percentage", `${depositPercentage}%`);
  const estimatedDeposit = ((Number(quote.best_total) || 0) * depositPercentage) / 100;
  drawLabelValue("Estimated Deposit", currency(estimatedDeposit));

  if (quote.notes) {
    addSpacer(12);
    drawHeading("Internal Notes");
    drawParagraph(quote.notes);
  }

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

function breakIntoLines(text: string, maxCharsPerLine: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
