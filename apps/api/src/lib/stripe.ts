import Stripe from "stripe";
import { loadServerConfig } from "@stackquotes/config";

interface PaymentLinkParams {
  amount: number;
  currency?: string;
  proposalTitle: string;
  contractorId: string;
  proposalId: string;
  customerName?: string | null;
}

export interface PaymentLinkResult {
  url: string;
  id: string;
}

export type StripeWebhookHandler = (event: Stripe.Event) => Promise<void> | void;

export interface HandleWebhookEventOptions {
  payload: string | Buffer | ArrayBuffer | Uint8Array;
  signature: string;
  secret?: string;
  handlers?: Record<string, StripeWebhookHandler>;
}

let cachedStripe: Stripe | null = null;
let cachedSecretKey: string | null = null;

export const initStripe = (): Stripe => {
  const config = loadServerConfig();
  const secretKey = config.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (cachedStripe && cachedSecretKey === secretKey) {
    return cachedStripe;
  }

  cachedStripe = new Stripe(secretKey, { apiVersion: "2024-04-10" });
  cachedSecretKey = secretKey;
  return cachedStripe;
};

const toBuffer = (payload: string | Buffer | ArrayBuffer | Uint8Array): Buffer => {
  if (Buffer.isBuffer(payload)) {
    return payload;
  }
  if (typeof payload === "string") {
    return Buffer.from(payload, "utf8");
  }
  if (payload instanceof Uint8Array) {
    return Buffer.from(payload);
  }
  return Buffer.from(payload);
};

export const handleWebhookEvent = async (
  options: HandleWebhookEventOptions
): Promise<Stripe.Event> => {
  const stripe = initStripe();
  const config = loadServerConfig();
  const secret = options.secret ?? config.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  const payload = toBuffer(options.payload);
  const event = stripe.webhooks.constructEvent(payload, options.signature, secret);

  if (options.handlers) {
    const handler = options.handlers[event.type] ?? options.handlers["*"];
    if (handler) {
      await handler(event);
    }
  }

  return event;
};

export const createDepositPaymentLink = async (
  params: PaymentLinkParams
): Promise<PaymentLinkResult | null> => {
  let stripe: Stripe;
  try {
    stripe = initStripe();
  } catch (error) {
    console.warn("[stripe] createDepositPaymentLink skipped:", (error as Error).message);
    return null;
  }

  const amount = Math.round(params.amount * 100);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const lineItems = [
    {
      price_data: {
        currency: params.currency ?? "usd",
        product_data: {
          name: params.proposalTitle || "Project Deposit",
          metadata: {
            contractorId: params.contractorId,
            proposalId: params.proposalId,
          },
        },
        unit_amount: amount,
      },
      quantity: 1,
    },
  ];

  const metadata: Record<string, string> = {
    contractorId: params.contractorId,
    proposalId: params.proposalId,
  };
  if (params.customerName) {
    metadata.customerName = params.customerName;
  }

  const link = await stripe.paymentLinks.create({
    line_items: lineItems as unknown as Stripe.PaymentLinkCreateParams.LineItem[],
    metadata,
  });

  // TODO: Store payment intent metadata for PayLink ledger sync once SmartProposal deposit automation runs.
  return { url: link.url, id: link.id };
};
