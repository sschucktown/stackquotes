import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Estimate, Client, UserSettings } from "@stackquotes/types";

interface PdfOptions {
  companyName?: string;
  logoUrl?: string;
  footerText?: string;
}

export async function generateEstimatePdf(
  estimate: Estimate,
  client: Client,
  settings: PdfOptions = {}
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const { width, height } = page.getSize();

  const [fontRegular, fontBold] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
  ]);

  const margin = 40;
  let cursorY = height - margin;

  const drawText = (text: string, x: number, y: number, options?: { size?: number; font?: any }) => {
    page.drawText(text, {
      x,
      y,
      size: options?.size ?? 12,
      font: options?.font ?? fontRegular,
      color: rgb(0, 0, 0),
    });
  };

  drawText(settings.companyName ?? "StackQuotes", margin, cursorY, { size: 18, font: fontBold });
  if (settings.logoUrl) {
    try {
      const imageBytes = await fetch(settings.logoUrl).then((res) => res.arrayBuffer());
      const png = await pdf.embedPng(imageBytes);
      const scaled = png.scale(0.25);
      page.drawImage(png, {
        x: width - margin - scaled.width,
        y: cursorY - scaled.height + 12,
        width: scaled.width,
        height: scaled.height,
      });
    } catch (error) {
      console.warn("Failed to embed logo", error);
    }
  }

  cursorY -= 40;
  drawText(`Estimate`, margin, cursorY, { size: 16, font: fontBold });
  drawText(estimate.projectTitle, margin, cursorY - 18, { size: 14 });

  cursorY -= 60;
  drawText("Prepared for", margin, cursorY, { font: fontBold });
  drawText(client.name, margin, cursorY - 16);
  if (client.email) drawText(client.email, margin, cursorY - 32);
  if (client.phone) drawText(client.phone, margin, cursorY - 48);
  if (client.address) drawText(client.address, margin, cursorY - 64);

  cursorY -= 120;
  drawText("Line Items", margin, cursorY, { font: fontBold });
  cursorY -= 24;

  const columns = [margin, margin + 220, margin + 320, margin + 420, width - margin];
  drawText("Description", columns[0], cursorY, { font: fontBold });
  drawText("Qty", columns[1], cursorY, { font: fontBold });
  drawText("Unit", columns[2], cursorY, { font: fontBold });
  drawText("Total", columns[3], cursorY, { font: fontBold });
  cursorY -= 16;

  estimate.lineItems.forEach((item) => {
    drawText(item.description, columns[0], cursorY);
    drawText(item.quantity.toFixed(2), columns[1], cursorY);
    drawText(`$${item.unitPrice.toFixed(2)}`, columns[2], cursorY);
    drawText(`$${item.total.toFixed(2)}`, columns[3], cursorY);
    cursorY -= 16;
  });

  cursorY -= 16;
  drawText(`Subtotal: $${estimate.subtotal.toFixed(2)}`, columns[3], cursorY, { font: fontBold });
  cursorY -= 16;
  drawText(`Tax: $${estimate.tax.toFixed(2)}`, columns[3], cursorY, { font: fontBold });
  cursorY -= 16;
  drawText(`Total: $${estimate.total.toFixed(2)}`, columns[3], cursorY, { font: fontBold });

  if (estimate.notes) {
    cursorY -= 40;
    drawText("Notes", margin, cursorY, { font: fontBold });
    cursorY -= 20;
    const notes = wrapText(estimate.notes, 80);
    notes.forEach((line) => {
      drawText(line, margin, cursorY);
      cursorY -= 14;
    });
  }

  if (settings.footerText) {
    drawText(settings.footerText, margin, 40, { size: 10 });
  }

  return pdf.save();
}

const wrapText = (text: string, charsPerLine: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    if ((current + word).length > charsPerLine) {
      lines.push(current.trim());
      current = word + " ";
    } else {
      current += `${word} `;
    }
  });
  if (current.trim()) {
    lines.push(current.trim());
  }
  return lines;
};

