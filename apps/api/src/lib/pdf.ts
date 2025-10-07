import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import type { Estimate, Client, EstimateTemplateKey, UserSettings } from "@stackquotes/types";
import { buildBrandTheme, normalizeHex } from "./brand.js";
import type { BrandTheme } from "./brand.js";

interface PdfRenderOptions {
  settings?: UserSettings | null;
  template?: EstimateTemplateKey;
}

interface PdfTemplateContext {
  pdf: PDFDocument;
  page: PDFPage;
  estimate: Estimate;
  client: Client;
  theme: BrandTheme;
  fonts: {
    sans: PDFFont;
    sansBold: PDFFont;
    serif: PDFFont;
    serifBold: PDFFont;
  };
  accentColor: { r: number; g: number; b: number };
  options: PdfRenderOptions;
  footerText?: string;
  watermarkText: string;
  logo?: {
    image: PDFImage;
    width: number;
    height: number;
  };
}

const LETTER_SIZE: [number, number] = [612, 792];
const DEFAULT_WATERMARK_TEXT = "Powered by StackQuotes";

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = normalizeHex(hex).slice(1);
  const value = parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const hexToRgbUnit = (hex: string): { r: number; g: number; b: number } => {
  const { r, g, b } = hexToRgb(hex);
  return { r: r / 255, g: g / 255, b: b / 255 };
};

interface DrawTextOptions {
  size?: number;
  font?: PDFFont;
  color?: { r: number; g: number; b: number };
  lineHeight?: number;
  maxWidth?: number;
}

const drawText = (
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  { size = 12, font, color = { r: 15 / 255, g: 23 / 255, b: 42 / 255 }, lineHeight, maxWidth }: DrawTextOptions
): number => {
  const lines = maxWidth && font ? wrapText(text, font, size, maxWidth) : [text];
  const actualLineHeight = lineHeight ?? size * 1.4;
  lines.forEach((line, idx) => {
    page.drawText(line, {
      x,
      y: y - idx * actualLineHeight,
      size,
      font,
      color: rgb(color.r, color.g, color.b),
    });
  });
  return y - (lines.length - 1) * actualLineHeight;
};

const wrapText = (text: string, font: PDFFont, size: number, maxWidth: number): string[] => {
  if (!text) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines.length ? lines : [text];
};

const drawWatermark = (ctx: PdfTemplateContext) => {
  const { watermarkText } = ctx;
  if (!watermarkText) return;

  const { page, fonts } = ctx;
  const { width } = page.getSize();
  const size = 10;
  const textWidth = fonts.serif.widthOfTextAtSize(watermarkText, size);
  const x = Math.max((width - textWidth) / 2, 24);
  const y = 24;

  page.drawText(watermarkText, {
    x,
    y,
    size,
    font: fonts.serif,
    color: rgb(148 / 255, 163 / 255, 184 / 255),
  });
};

const drawLineItems = (
  ctx: PdfTemplateContext,
  startY: number,
  options?: { accentBackground?: boolean; zebra?: boolean }
): number => {
  const { page, estimate, fonts, theme } = ctx;
  const margin = 48;
  let cursorY = startY;
  const headers = ["Description", "Qty", "Unit", "Line Total"];
  const columnWidths = [260, 70, 90, 100];
  const columnXs = columnWidths.reduce<number[]>((acc, width, index) => {
    if (index === 0) {
      acc.push(margin);
    } else {
      acc.push(acc[index - 1] + columnWidths[index - 1] + 10);
    }
    return acc;
  }, []);

  // Header background
  const headerWidth = columnWidths.reduce((sum, width) => sum + width, 0) + (columnWidths.length - 1) * 10;
  page.drawRectangle({
    x: margin,
    y: cursorY - 22,
    width: headerWidth,
    height: 24,
    color: options?.accentBackground ? rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b) : rgb(0.95, 0.97, 0.99),
    opacity: options?.accentBackground ? 0.18 : 1,
  });

  headers.forEach((header, index) => {
    drawText(page, header, columnXs[index], cursorY - 16, {
      size: 10,
      font: fonts.sansBold,
      color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
    });
  });

  cursorY -= 30;

  estimate.lineItems.forEach((item, rowIndex) => {
    const isZebra = options?.zebra && rowIndex % 2 === 1;
    if (isZebra) {
      page.drawRectangle({
        x: margin,
        y: cursorY - 18,
        width: headerWidth,
        height: 24,
        color: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
        opacity: 0.08,
      });
    }

    const descriptionLines = wrapText(item.description, fonts.sans, 11, columnWidths[0]);
    const rowHeight = Math.max(descriptionLines.length * 14, 20);
    drawText(page, item.description, columnXs[0], cursorY - 12, {
      size: 11,
      font: fonts.sans,
      maxWidth: columnWidths[0],
    });
    drawText(page, item.quantity.toFixed(2), columnXs[1], cursorY - 12, {
      size: 11,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, `$${item.unitPrice.toFixed(2)}`, columnXs[2], cursorY - 12, {
      size: 11,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, `$${item.total.toFixed(2)}`, columnXs[3], cursorY - 12, {
      size: 11,
      font: fonts.sansBold,
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255 },
    });

    cursorY -= rowHeight;
  });

  return cursorY - 10;
};

const drawTotalsCard = (ctx: PdfTemplateContext, startY: number, variant: "card" | "stacked" = "card"): number => {
  const { page, estimate, fonts, theme, accentColor } = ctx;
  const margin = 48;

  if (variant === "card") {
    const cardHeight = 88;
    page.drawRectangle({
      x: margin,
      y: startY - cardHeight,
      width: 516,
      height: cardHeight,
      color: rgb(accentColor.r, accentColor.g, accentColor.b),
      opacity: 0.12,
      borderColor: rgb(accentColor.r, accentColor.g, accentColor.b),
      borderWidth: 1,
    });
    drawText(page, "Subtotal", margin + 16, startY - 22, {
      size: 12,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, `$${estimate.subtotal.toFixed(2)}`, margin + 400, startY - 22, {
      size: 12,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, "Tax", margin + 16, startY - 42, {
      size: 12,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, `$${estimate.tax.toFixed(2)}`, margin + 400, startY - 42, {
      size: 12,
      font: fonts.sans,
      color: { r: 71 / 255, g: 85 / 255, b: 105 / 255 },
    });
    drawText(page, "Total Due", margin + 16, startY - 68, {
      size: 16,
      font: fonts.sansBold,
      color: { r: 15 / 255, g: 23 / 255, b: 42 / 255 },
    });
    drawText(page, `$${estimate.total.toFixed(2)}`, margin + 370, startY - 68, {
      size: 18,
      font: fonts.sansBold,
      color: accentColor,
    });
    return startY - cardHeight - 16;
  }

  const lines = [
    ["Subtotal", `$${estimate.subtotal.toFixed(2)}`],
    ["Tax", `$${estimate.tax.toFixed(2)}`],
    ["Total Due", `$${estimate.total.toFixed(2)}`],
  ] as const;
  let cursorY = startY;
  lines.forEach(([label, value], index) => {
    const isLast = index === lines.length - 1;
    drawText(page, label, margin, cursorY - 12, {
      size: isLast ? 14 : 12,
      font: isLast ? fonts.serifBold : fonts.serif,
    });
    drawText(page, value, margin + 420, cursorY - 12, {
      size: isLast ? 14 : 12,
      font: isLast ? fonts.serifBold : fonts.serif,
    });
    cursorY -= isLast ? 28 : 24;
  });
  return cursorY - 8;
};

const renderModernPdf = (ctx: PdfTemplateContext) => {
  const { page, fonts, theme, client, estimate, logo, footerText } = ctx;
  const margin = 48;
  const { width, height } = page.getSize();
  let cursorY = height - margin;

  if (logo) {
    page.drawImage(logo.image, {
      x: margin,
      y: cursorY - logo.height,
      width: logo.width,
      height: logo.height,
    });
    cursorY -= logo.height + 12;
  }

  drawText(page, theme.companyName, margin, cursorY, {
    size: 24,
    font: fonts.sansBold,
  });
  drawText(page, `Estimate for ${client.name}`, margin, cursorY - 24, {
    size: 12,
    font: fonts.sans,
    color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
  });
  drawText(page, estimate.projectTitle, width - margin - fonts.sans.widthOfTextAtSize(estimate.projectTitle, 12), cursorY - 24, {
    size: 12,
    font: fonts.sans,
    color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
  });

  cursorY -= 36;
  page.drawRectangle({
    x: margin,
    y: cursorY - 6,
    width: width - margin * 2,
    height: 4,
    color: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
  });

  cursorY -= 18;
  drawText(page, "Prepared For", margin, cursorY, {
    size: 12,
    font: fonts.sansBold,
  });
  cursorY -= 18;
  drawText(page, client.name, margin, cursorY, {
    size: 12,
    font: fonts.sans,
  });
  if (client.email) {
    cursorY -= 16;
    drawText(page, client.email, margin, cursorY, {
      size: 11,
      font: fonts.sans,
      color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
    });
  }
  if (client.phone) {
    cursorY -= 16;
    drawText(page, client.phone, margin, cursorY, {
      size: 11,
      font: fonts.sans,
      color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
    });
  }
  if (client.address) {
    cursorY -= 16;
    cursorY = drawText(page, client.address, margin, cursorY, {
      size: 11,
      font: fonts.sans,
      color: { r: 100 / 255, g: 116 / 255, b: 139 / 255 },
      maxWidth: width - margin * 2,
    }) - 4;
  }

  cursorY -= 24;
  cursorY = drawLineItems(ctx, cursorY, { accentBackground: true });

  cursorY = drawTotalsCard(ctx, cursorY, "card");

  if (estimate.notes) {
    cursorY -= 20;
    drawText(page, "Notes", margin, cursorY, {
      size: 12,
      font: fonts.sansBold,
    });
    cursorY -= 16;
    cursorY = drawText(page, estimate.notes, margin, cursorY, {
      size: 11,
      font: fonts.sans,
      maxWidth: width - margin * 2,
    });
  }

  if (footerText) {
    drawText(page, footerText, margin, 40, {
      size: 10,
      font: fonts.sans,
      color: { r: 148 / 255, g: 163 / 255, b: 184 / 255 },
    });
  }

  drawWatermark(ctx);
};

const renderPremiumPdf = (ctx: PdfTemplateContext) => {
  const { page, fonts, theme, client, estimate, logo, footerText } = ctx;
  const margin = 48;
  const { width, height } = page.getSize();
  let cursorY = height - margin;

  const headerHeight = 140;
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width,
    height: headerHeight,
    color: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
  });

  cursorY = height - margin - 20;
  if (logo) {
    page.drawImage(logo.image, {
      x: margin,
      y: cursorY - logo.height,
      width: logo.width,
      height: logo.height,
    });
  } else {
    drawText(page, theme.companyName, margin, cursorY, {
      size: 26,
      font: fonts.sansBold,
      color: { r: 1, g: 1, b: 1 },
    });
  }

  drawText(page, "Premium Estimate", margin, height - headerHeight + 36, {
    size: 12,
    font: fonts.sans,
    color: { r: 1, g: 1, b: 1 },
  });

  drawText(page, estimate.projectTitle, margin, height - headerHeight + 18, {
    size: 18,
    font: fonts.sansBold,
    color: { r: 1, g: 1, b: 1 },
  });

  drawText(page, "Prepared For", width - margin - 120, height - headerHeight + 36, {
    size: 12,
    font: fonts.sansBold,
    color: { r: 1, g: 1, b: 1 },
  });
  drawText(page, client.name, width - margin - 120, height - headerHeight + 18, {
    size: 12,
    font: fonts.sans,
    color: { r: 1, g: 1, b: 1 },
  });

  cursorY = height - headerHeight - 32;

  cursorY = drawLineItems(ctx, cursorY, { zebra: true });
  cursorY = drawTotalsCard(ctx, cursorY, "card");

  if (estimate.notes) {
    cursorY -= 24;
    page.drawRectangle({
      x: margin,
      y: cursorY - 80,
      width: width - margin * 2,
      height: 80,
      borderColor: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
      borderWidth: 1,
      opacity: 0.6,
    });
    cursorY -= 16;
    drawText(page, "Project Notes", margin + 16, cursorY, {
      size: 12,
      font: fonts.sansBold,
      color: { r: ctx.accentColor.r, g: ctx.accentColor.g, b: ctx.accentColor.b },
    });
    cursorY -= 18;
    drawText(page, estimate.notes, margin + 16, cursorY, {
      size: 11,
      font: fonts.sans,
      maxWidth: width - margin * 2 - 32,
    });
  }

  if (footerText) {
    drawText(page, footerText, margin, 40, {
      size: 10,
      font: fonts.sans,
      color: { r: 148 / 255, g: 163 / 255, b: 184 / 255 },
    });
  }

  drawWatermark(ctx);
};

const renderClassicPdf = (ctx: PdfTemplateContext) => {
  const { page, fonts, theme, client, estimate, logo, footerText } = ctx;
  const margin = 56;
  const { width, height } = page.getSize();
  let cursorY = height - margin;

  page.drawRectangle({
    x: margin - 20,
    y: margin - 40,
    width: width - (margin - 20) * 2,
    height: height - (margin - 20) * 2,
    borderColor: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
    borderWidth: 2,
  });

  if (logo) {
    page.drawImage(logo.image, {
      x: width / 2 - logo.width / 2,
      y: cursorY - logo.height,
      width: logo.width,
      height: logo.height,
    });
    cursorY -= logo.height + 16;
  }

  drawText(page, theme.companyName.toUpperCase(), width / 2 - 120, cursorY, {
    size: 20,
    font: fonts.serifBold,
  });
  cursorY -= 30;
  page.drawRectangle({
    x: width / 2 - 40,
    y: cursorY - 4,
    width: 80,
    height: 2,
    color: rgb(ctx.accentColor.r, ctx.accentColor.g, ctx.accentColor.b),
  });

  cursorY -= 28;
  drawText(page, "Estimate Proposal", width / 2 - 80, cursorY, {
    size: 14,
    font: fonts.serif,
  });

  cursorY -= 36;
  drawText(page, "Prepared For", margin, cursorY, {
    size: 12,
    font: fonts.serifBold,
  });
  cursorY -= 18;
  drawText(page, client.name, margin, cursorY, {
    size: 12,
    font: fonts.serif,
  });
  if (client.email) {
    cursorY -= 16;
    drawText(page, client.email, margin, cursorY, {
      size: 11,
      font: fonts.serif,
    });
  }
  if (client.address) {
    cursorY -= 16;
    cursorY = drawText(page, client.address, margin, cursorY, {
      size: 11,
      font: fonts.serif,
      maxWidth: width / 2 - margin,
    }) - 4;
  }

  drawText(page, "Project", width - margin - 160, height - margin - 130, {
    size: 12,
    font: fonts.serifBold,
  });
  drawText(page, estimate.projectTitle, width - margin - 160, height - margin - 150, {
    size: 12,
    font: fonts.serif,
    maxWidth: 160,
  });

  cursorY -= 24;
  cursorY = drawLineItems(ctx, cursorY);
  cursorY = drawTotalsCard(ctx, cursorY, "stacked");

  if (estimate.notes) {
    cursorY -= 28;
    drawText(page, "Notes", margin, cursorY, {
      size: 12,
      font: fonts.serifBold,
    });
    cursorY -= 16;
    cursorY = drawText(page, estimate.notes, margin, cursorY, {
      size: 11,
      font: fonts.serif,
      maxWidth: width - margin * 2,
    });
  }

  cursorY -= 48;
  drawText(page, "Signature", margin, cursorY, {
    size: 11,
    font: fonts.serif,
  });
  drawText(page, "Date", width - margin - 120, cursorY, {
    size: 11,
    font: fonts.serif,
  });
  cursorY -= 42;
  page.drawRectangle({
    x: margin,
    y: cursorY,
    width: 220,
    height: 1,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawRectangle({
    x: width - margin - 120,
    y: cursorY,
    width: 120,
    height: 1,
    color: rgb(0.6, 0.6, 0.6),
  });

  if (footerText) {
    drawText(page, footerText, margin, margin - 16, {
      size: 10,
      font: fonts.serif,
      color: { r: 112 / 255, g: 128 / 255, b: 144 / 255 },
    });
  }

  drawWatermark(ctx);
};

const PDF_RENDERERS: Record<EstimateTemplateKey, (ctx: PdfTemplateContext) => void> = {
  modern: renderModernPdf,
  premium: renderPremiumPdf,
  classic: renderClassicPdf,
};

export async function generateEstimatePdf(
  estimate: Estimate,
  client: Client,
  options: PdfRenderOptions = {}
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage(LETTER_SIZE);

  const [sans, sansBold, serif, serifBold] = await Promise.all([
    pdf.embedFont(StandardFonts.Helvetica),
    pdf.embedFont(StandardFonts.HelveticaBold),
    pdf.embedFont(StandardFonts.TimesRoman),
    pdf.embedFont(StandardFonts.TimesRomanBold),
  ]);

  const settings = options.settings ?? null;
  const theme = await buildBrandTheme({
    companyName: settings?.companyName ?? undefined,
    logoUrl: settings?.logoUrl ?? undefined,
    accentColor: settings?.accentColor ?? undefined,
  });

  const template = options.template ?? settings?.estimateTemplate ?? "modern";
  const accentColor = hexToRgbUnit(theme.accent);

  let logo: PdfTemplateContext["logo"] | undefined;
  if (theme.logoUrl) {
    try {
      const response = await fetch(theme.logoUrl);
      if (response.ok) {
        const contentType = response.headers.get("content-type") ?? "";
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        const image = contentType.includes("jpeg") || contentType.includes("jpg")
          ? await pdf.embedJpg(bytes)
          : await pdf.embedPng(bytes);
        const maxWidth = 160;
        const scale = image.width > maxWidth ? maxWidth / image.width : 1;
        logo = {
          image,
          width: image.width * scale,
          height: image.height * scale,
        };
      }
    } catch (error) {
      console.warn("Failed to embed logo in PDF", error);
    }
  }

  const context: PdfTemplateContext = {
    pdf,
    page,
    estimate,
    client,
    theme,
    fonts: {
      sans,
      sansBold,
      serif,
      serifBold,
    },
    accentColor,
    options,
    footerText: settings?.footerText ?? undefined,
    watermarkText: DEFAULT_WATERMARK_TEXT,
    logo,
  };

  const renderer = PDF_RENDERERS[template] ?? PDF_RENDERERS.modern;
  renderer(context);

  return pdf.save();
}

