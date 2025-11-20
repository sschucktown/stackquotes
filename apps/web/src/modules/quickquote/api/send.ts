import { generatePdf } from "@modules/quickquote/api/pdf";
import { sendEstimateEmail } from "@modules/quickquote/api/email";
import type { EmailPayload, PdfPayload } from "@stackquotes/types";

export interface SendQuickQuoteInput {
  estimateId: string;
  to: string;
  subject: string;
  message: string;
}

export interface SendQuickQuoteResult {
  pdf?: PdfPayload | null;
  email?: {
    sent: boolean;
    status: string;
    template?: string;
    approvalUrl?: string;
  } | null;
  approvalUrl?: string;
}

export const sendQuickQuote = async (
  input: SendQuickQuoteInput
): Promise<SendQuickQuoteResult> => {
  const pdfResp = await generatePdf(input.estimateId);
  const pdf = pdfResp.data ?? null;

  const emailPayload: EmailPayload = {
    estimateId: input.estimateId,
    to: input.to,
    subject: input.subject,
    message: input.message,
    downloadUrl: pdf?.downloadUrl ?? undefined,
  };

  const emailResp = await sendEstimateEmail(emailPayload);
  const email = emailResp.data
    ? {
        sent: emailResp.data.sent,
        status: emailResp.data.status,
        template: (emailResp.data as any).template,
        approvalUrl: (emailResp.data as any).approvalUrl,
      }
    : null;

  return {
    pdf,
    email,
    approvalUrl: email?.approvalUrl,
  };
};

