import { Resend } from "resend";
import { loadServerConfig } from "@stackquotes/config";

export const sendEstimateEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: Uint8Array }[];
}) => {
  const config = loadServerConfig();
  if (!config.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const resend = new Resend(config.RESEND_API_KEY);
  await resend.emails.send({
    from: `StackQuotes <no-reply@stackquotes.com>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    attachments: options.attachments?.map((file) => ({
      filename: file.filename,
      content: Buffer.from(file.content).toString("base64"),
    })),
  });
};

