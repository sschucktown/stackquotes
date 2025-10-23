import { Hono } from "hono";
import { registerCreateCheckoutSessionRoute } from "./create-checkout-session.js";
import { registerCreateConnectAccountRoute } from "./create-connect-account.js";
import { registerCreatePaymentLinkRoute } from "./create-payment-link.js";
import { registerCreateOneTimeRoute } from "./create-onetime.js";
import { registerCreateInstallmentPlanRoute } from "./create-installment-plan.js";
import { registerStripeWebhookRoute } from "./webhook.js";

export const stripeRouter = new Hono();

registerCreateCheckoutSessionRoute(stripeRouter);
registerCreateConnectAccountRoute(stripeRouter);
registerCreatePaymentLinkRoute(stripeRouter);
registerCreateOneTimeRoute(stripeRouter);
registerCreateInstallmentPlanRoute(stripeRouter);
registerStripeWebhookRoute(stripeRouter);

export default stripeRouter;

