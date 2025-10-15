import type { Client, Estimate, EstimateTemplateKey, UserSettings } from "@stackquotes/types";
import { buildBrandTheme } from "../brand.js";
import type { BrandTheme } from "../brand.js";

interface EmailTemplateContext {
  estimate: Estimate;
  client: Client;
  settings?: UserSettings | null;
  message: string;
  downloadUrl?: string;
  template?: EstimateTemplateKey;
  approvalUrl?: string;
  trackingPixelUrl?: string;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatMessage = (message: string): string => {
  if (!message.trim()) return "";
  const paragraphs = message.trim().split(/\r?\n\s*\r?\n/);
  return paragraphs
    .map((paragraph) => {
      const lines = paragraph.split(/\r?\n/).map((line) => {
        const trimmed = line.trim();
        return trimmed ? escapeHtml(trimmed) : "&nbsp;";
      });
      return `<p style="margin:0 0 16px 0; line-height:1.6;">${lines.join("<br />")}</p>`;
    })
    .join("");
};

const renderLineItemsTable = (
  estimate: Estimate,
  theme: BrandTheme,
  options: { zebra?: boolean } = {}
): string => {
  const rows = estimate.lineItems
    .map((item, index) => {
      const background = options.zebra && index % 2 === 1 ? `${theme.accentLight}22` : "#ffffff";
      return `<tr style="background:${background};">
        <td style="padding:12px 0; border-bottom:1px solid ${theme.neutralBorder}; color:#0f172a; font-weight:500;">
          ${escapeHtml(item.description)}
        </td>
        <td style="padding:12px 16px; border-bottom:1px solid ${theme.neutralBorder}; text-align:right; color:#475569;">${item.quantity.toFixed(2)}</td>
        <td style="padding:12px 16px; border-bottom:1px solid ${theme.neutralBorder}; text-align:right; color:#475569;">${currencyFormatter.format(item.unitPrice)}</td>
        <td style="padding:12px 0; border-bottom:1px solid ${theme.neutralBorder}; text-align:right; color:#0f172a; font-weight:600;">${currencyFormatter.format(item.total)}</td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-top:16px;">
    <thead>
      <tr>
        <th align="left" style="padding-bottom:12px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Description</th>
        <th align="right" style="padding-bottom:12px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Qty</th>
        <th align="right" style="padding-bottom:12px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Unit Cost</th>
        <th align="right" style="padding-bottom:12px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Line Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
};

const renderTotals = (estimate: Estimate, theme: BrandTheme, variant: "card" | "stacked"): string => {
  if (variant === "card") {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-collapse:collapse;">
      <tr>
        <td style="padding:20px; background:${theme.accentLight}; border-radius:12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="color:#475569; font-size:14px;">Subtotal</td>
              <td align="right" style="color:#475569; font-size:14px;">${currencyFormatter.format(estimate.subtotal)}</td>
            </tr>
            <tr>
              <td style="color:#475569; font-size:14px; padding-top:8px;">Tax</td>
              <td align="right" style="color:#475569; font-size:14px; padding-top:8px;">${currencyFormatter.format(estimate.tax)}</td>
            </tr>
            <tr>
              <td style="padding-top:16px; font-size:18px; font-weight:700; color:#0f172a;">Total Due</td>
              <td align="right" style="padding-top:16px; font-size:20px; font-weight:800; color:${theme.accentDark};">${currencyFormatter.format(estimate.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  }

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px; border-collapse:collapse;">
    <tr>
      <td style="padding:8px 0; border-bottom:1px solid ${theme.neutralBorder}; color:#0f172a;">Subtotal</td>
      <td align="right" style="padding:8px 0; border-bottom:1px solid ${theme.neutralBorder}; color:#0f172a;">${currencyFormatter.format(estimate.subtotal)}</td>
    </tr>
    <tr>
      <td style="padding:8px 0; border-bottom:1px solid ${theme.neutralBorder}; color:#0f172a;">Tax</td>
      <td align="right" style="padding:8px 0; border-bottom:1px solid ${theme.neutralBorder}; color:#0f172a;">${currencyFormatter.format(estimate.tax)}</td>
    </tr>
    <tr>
      <td style="padding-top:12px; font-weight:700; color:#0f172a;">Total Due</td>
      <td align="right" style="padding-top:12px; font-weight:700; color:${theme.accentDark};">${currencyFormatter.format(estimate.total)}</td>
    </tr>
  </table>`;
};

const buildCta = (
  theme: BrandTheme,
  options: { approvalUrl?: string; downloadUrl?: string }
): string => {
  const { approvalUrl, downloadUrl } = options;
  const links: string[] = [];
  if (approvalUrl) {
    links.push(
      `<a href="${approvalUrl}" style="color:${theme.accent}; text-decoration:none;">Open the estimate online</a>`
    );
  }
  if (downloadUrl) {
    links.push(
      `<a href="${downloadUrl}" style="color:${theme.accent}; text-decoration:none;">Download a PDF copy</a>`
    );
  }
  const extra =
    links.length > 0
      ? `<p style="margin:12px 0 0; color:#475569; font-size:14px;">${links.join(
          " &middot; "
        )}</p>`
      : "";
  return `<div style="margin-top:32px; padding:20px; border-radius:16px; background:${theme.accentLight};">
    <p style="margin:0; font-size:12px; font-weight:600; letter-spacing:0.08em; color:${theme.accentDark}; text-transform:uppercase;">Next steps</p>
    <p style="margin:12px 0 0; color:#334155; line-height:1.6;">
      When you're ready to move forward, simply reply to this email and we'll put together a detailed proposal with a few options to choose from.
    </p>
    ${extra}
  </div>`;
};

const renderModern = (context: EmailTemplateContext, theme: BrandTheme): string => {
  const messageHtml = formatMessage(context.message);
  const lineItemsHtml = renderLineItemsTable(context.estimate, theme);
  const totalsHtml = renderTotals(context.estimate, theme, "card");
  const ctaHtml = buildCta(theme, {
    approvalUrl: context.approvalUrl,
    downloadUrl: context.downloadUrl,
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(context.estimate.projectTitle)}</title>
  </head>
  <body style="margin:0; padding:0; background:#f8fafc; font-family:'Inter','Helvetica','Arial',sans-serif; color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 40px rgba(15,23,42,0.06);">
            <tr>
              <td style="padding:32px 32px 24px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      ${context.settings?.logoUrl ? `<img src="${context.settings.logoUrl}" alt="${escapeHtml(theme.companyName)}" style="max-width:160px; height:auto; margin-bottom:12px;" />` : ``}
                      <div style="font-size:24px; font-weight:700;">${escapeHtml(theme.companyName)}</div>
                      <div style="margin-top:4px; color:#64748b;">Estimate for ${escapeHtml(context.client.name)}</div>
                    </td>
                    <td align="right" style="color:#64748b; font-size:14px;">
                      <div><strong>Estimate</strong></div>
                      <div style="margin-top:4px;">${escapeHtml(context.estimate.projectTitle)}</div>
                    </td>
                  </tr>
                </table>
                <div style="margin-top:24px; height:4px; border-radius:999px; background:${theme.accent};"></div>
                <div style="margin-top:24px;">
                  ${messageHtml || `<p style="margin:0 0 16px 0; line-height:1.6;">Hi ${escapeHtml(context.client.name)},</p>`}
                </div>
                ${lineItemsHtml}
                ${totalsHtml}
                ${context.estimate.notes ? `<div style="margin-top:24px; padding:16px; background:#f1f5f9; border-radius:12px;">
                  <div style="font-weight:600; margin-bottom:8px;">Notes</div>
                  <div style="line-height:1.6; color:#475569;">${escapeHtml(context.estimate.notes)}</div>
                </div>` : ""}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px; background:#f8fafc; color:#94a3b8; font-size:12px; text-align:center;">
                ${escapeHtml(theme.companyName)} &middot; Prepared with StackQuotes
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const renderPremium = (context: EmailTemplateContext, theme: BrandTheme): string => {
  const messageHtml = formatMessage(context.message);
  const lineItemsHtml = renderLineItemsTable(context.estimate, theme, { zebra: true });
  const totalsHtml = renderTotals(context.estimate, theme, "card");
  const ctaHtml = buildCta(theme, {
    approvalUrl: context.approvalUrl,
    downloadUrl: context.downloadUrl,
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(context.estimate.projectTitle)}</title>
  </head>
  <body style="margin:0; padding:0; background:#eef2ff; font-family:'Montserrat','Helvetica','Arial',sans-serif; color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 24px 60px rgba(15,23,42,0.1);">
            <tr>
              <td style="padding:40px 40px 32px 40px; background:${theme.accent}; color:${theme.accentText};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      ${context.settings?.logoUrl ? `<img src="${context.settings.logoUrl}" alt="${escapeHtml(theme.companyName)}" style="max-width:180px; height:auto; filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));" />` : `<div style="font-size:28px; font-weight:700; letter-spacing:0.05em;">${escapeHtml(theme.companyName)}</div>`}
                      <div style="margin-top:12px; font-size:14px; opacity:0.85;">Premium Estimate</div>
                    </td>
                    <td align="right" style="font-size:14px; opacity:0.85;">
                      <div style="font-weight:600;">Prepared For</div>
                      <div style="margin-top:4px; font-size:18px; font-weight:700;">${escapeHtml(context.client.name)}</div>
                      ${context.client.email ? `<div style="margin-top:4px;">${escapeHtml(context.client.email)}</div>` : ""}
                    </td>
                  </tr>
                </table>
                <div style="margin-top:32px; font-size:26px; font-weight:700;">${escapeHtml(context.estimate.projectTitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;">
                ${messageHtml || `<p style="margin:0 0 16px 0; line-height:1.8;">Hello ${escapeHtml(context.client.name)},</p>`}
                ${lineItemsHtml}
                ${totalsHtml}
                ${context.estimate.notes ? `<div style="margin-top:32px; padding:20px; border:1px solid ${theme.neutralBorder}; border-radius:14px; background:${theme.accentLight}22;">
                  <div style="font-weight:700; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.08em; color:${theme.accentDark};">Project Notes</div>
                  <div style="line-height:1.7; color:#334155;">${escapeHtml(context.estimate.notes)}</div>
                </div>` : ""}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px; background:#1f2937; color:#cbd5f5; font-size:12px; text-align:center;">
                ${escapeHtml(theme.companyName)} &bull; ${escapeHtml(context.client.name)} Estimate &bull; Powered by StackQuotes
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const renderClassic = (context: EmailTemplateContext, theme: BrandTheme): string => {
  const messageHtml = formatMessage(context.message);
  const lineItemsHtml = renderLineItemsTable(context.estimate, theme);
  const totalsHtml = renderTotals(context.estimate, theme, "stacked");
  const ctaHtml = buildCta(theme, {
    approvalUrl: context.approvalUrl,
    downloadUrl: context.downloadUrl,
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(context.estimate.projectTitle)}</title>
  </head>
  <body style="margin:0; padding:24px; background:#faf5f0; font-family:'Merriweather','Georgia','Times New Roman',serif; color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px; width:100%; background:#ffffff; border:2px solid ${theme.accent}; padding:48px 56px;">
            <tr>
              <td align="center">
                ${context.settings?.logoUrl ? `<img src="${context.settings.logoUrl}" alt="${escapeHtml(theme.companyName)}" style="max-width:200px; height:auto; margin-bottom:16px;" />` : ``}
                <div style="font-size:30px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">${escapeHtml(theme.companyName)}</div>
                <div style="margin-top:12px; font-size:16px; letter-spacing:0.08em; color:${theme.accentDark};">Estimate Proposal</div>
                <div style="margin-top:24px; width:80px; height:3px; background:${theme.accent};"></div>
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:16px;">
                      <div style="font-weight:700;">Prepared For</div>
                      <div style="margin-top:8px;">
                        ${escapeHtml(context.client.name)}<br />
                        ${context.client.email ? `${escapeHtml(context.client.email)}<br />` : ""}
                        ${context.client.phone ? `${escapeHtml(context.client.phone)}<br />` : ""}
                        ${context.client.address ? `${escapeHtml(context.client.address)}` : ""}
                      </div>
                    </td>
                    <td align="right" style="font-size:16px;">
                      <div style="font-weight:700;">Project</div>
                      <div style="margin-top:8px;">${escapeHtml(context.estimate.projectTitle)}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px;">
                ${messageHtml || `<p style="margin:0 0 18px 0; line-height:1.8;">Dear ${escapeHtml(context.client.name)},</p>`}
                ${lineItemsHtml}
                ${totalsHtml}
                ${context.estimate.notes ? `<div style="margin-top:32px; padding:20px; border:1px solid ${theme.neutralBorder}; background:#fafaf9;">
                  <div style="font-weight:700; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.08em;">Notes</div>
                  <div style="line-height:1.8;">${escapeHtml(context.estimate.notes)}</div>
                </div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding-top:36px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="font-size:14px; font-style:italic; color:#475569;">Signature</div>
                      <div style="margin-top:40px; border-top:1px solid ${theme.neutralBorder}; width:220px;"></div>
                    </td>
                    <td align="right">
                      <div style="font-size:14px; font-style:italic; color:#475569;">Date</div>
                      <div style="margin-top:40px; border-top:1px solid ${theme.neutralBorder}; width:140px; margin-left:auto;"></div>
                    </td>
                  </tr>
                </table>
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:32px; font-size:12px; color:#64748b; text-align:center;">
                ${escapeHtml(theme.companyName)} &bull; ${new Date().getFullYear()} &bull; All Rights Reserved
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const EMAIL_RENDERERS: Record<EstimateTemplateKey, (context: EmailTemplateContext, theme: BrandTheme) => string> = {
  modern: renderModern,
  premium: renderPremium,
  classic: renderClassic,
};

export interface RenderEstimateEmailResult {
  html: string;
  theme: BrandTheme;
  template: EstimateTemplateKey;
}

export async function renderEstimateEmail(context: EmailTemplateContext): Promise<RenderEstimateEmailResult> {
  const template = context.template ?? context.settings?.estimateTemplate ?? "modern";
  const theme = await buildBrandTheme({
    companyName: context.settings?.companyName ?? undefined,
    logoUrl: context.settings?.logoUrl ?? undefined,
    accentColor: context.settings?.accentColor ?? undefined,
  });
  const renderer = EMAIL_RENDERERS[template] ?? EMAIL_RENDERERS.modern;
  const trackingPixelHtml = context.trackingPixelUrl
    ? `<img src="${context.trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`
    : "";
  const rawHtml = renderer(context, theme);
  const html =
    trackingPixelHtml && rawHtml.includes("</body>")
      ? rawHtml.replace("</body>", `${trackingPixelHtml}</body>`)
      : `${rawHtml}${trackingPixelHtml}`;
  return {
    template,
    theme,
    html,
  };
}
