import { Resend } from "resend";
import { loadServerConfig } from "@stackquotes/config";

interface SendEstimateEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Uint8Array }[];
  contractorName?: string;
  contractorEmail?: string;
}

/**
 * Sends estimate or proposal emails using the hybrid "via StackQuotes" model.
 *
 * Example:
 *   From:  "Coastal Roofing via StackQuotes <no-reply@stackquotes.com>"
 *   Reply-To: "john@coastalroofing.com"
 */
export const sendEstimateEmail = async (options: SendEstimateEmailOptions) => {
  const config = loadServerConfig();
  if (!config.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(config.RESEND_API_KEY);

  const fromName = options.contractorName
    ? `${options.contractorName} via StackQuotes`
    : "StackQuotes";
  const from = `${fromName} <no-reply@stackquotes.com>`;
  const replyTo = options.contractorEmail || "support@stackquotes.com";

  await resend.emails.send({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    reply_to: replyTo,
    attachments: options.attachments?.map((file) => ({
      filename: file.filename,
      content: Buffer.from(file.content).toString("base64"),
    })),
  });
};
