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

let stripeClient: Stripe | null = null;

const getStripe = (): Stripe | null => {
  if (stripeClient) {
    return stripeClient;
  }
  const config = loadServerConfig();
  if (!config.STRIPE_SECRET_KEY) {
    return null;
  }
  stripeClient = new Stripe(config.STRIPE_SECRET_KEY, {
    apiVersion: "2024-04-10",
  });
  return stripeClient;
};

export interface PaymentLinkResult {
  url: string;
  id: string;
}

export const createDepositPaymentLink = async (
  params: PaymentLinkParams
): Promise<PaymentLinkResult | null> => {
  const stripe = getStripe();
  if (!stripe) {
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

  return { url: link.url, id: link.id };
};
