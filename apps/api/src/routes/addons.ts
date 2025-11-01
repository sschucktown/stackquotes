import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { initStripe } from "../lib/stripe.js";
import { loadServerConfig } from "@stackquotes/config";
import { getBaseAppUrl, readJsonBody } from "./stripe/utils.js";

const serverConfig = loadServerConfig();

const ADDON_PRICE_MAP: Record<string, string | null> = {
  permitsync: serverConfig.STRIPE_ADDON_PERMITSYNC ?? null,
  supplylink: serverConfig.STRIPE_ADDON_SUPPLYLINK ?? null,
  quoteiq_plus: serverConfig.STRIPE_ADDON_QUOTEIQ_PLUS ?? null,
  financing_boost: serverConfig.STRIPE_ADDON_FINANCING_BOOST ?? null,
  // New pricing model addons
  branding: serverConfig.STRIPE_PRICE_ADDON_BRANDING ?? null,
  proposal_slots: serverConfig.STRIPE_PRICE_ADDON_PROPOSALS ?? null,
};

const addonsSchema = z.record(z.union([z.boolean(), z.string(), z.number()])).default({});

const checkoutSchema = z.object({
  addonKey: z.enum(["permitsync", "supplylink", "quoteiq_plus", "financing_boost", "branding", "proposal_slots"]),
});

export const addonsRouter = new Hono();

addonsRouter.get("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("addons")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[addons] failed to load addons", error);
    c.status(500);
    return c.json({ error: "Unable to load add-ons." });
  }
  return c.json({ data: (data?.addons as Record<string, unknown>) ?? {} });
});

addonsRouter.patch("/", async (c) => {
  const user = await requireUser(c);
  const body = await readJsonBody(c);
  const parsed = addonsSchema.safeParse(body?.addons ?? {});
  if (!parsed.success) {
    c.status(400);
    return c.json({ error: parsed.error.flatten().fieldErrors });
  }
  const supabase = getServiceClient();
  const { data: existing } = await supabase
    .from("users")
    .select("addons")
    .eq("id", user.id)
    .maybeSingle();

  const currentAddons = (existing?.addons as Record<string, unknown>) ?? {};
  const merged = { ...currentAddons, ...parsed.data };

  const { error } = await supabase
    .from("users")
    .upsert(
      {
        id: user.id,
        addons: merged,
      },
      { onConflict: "id" }
    );

  if (error) {
    console.error("[addons] failed to update addons", error);
    c.status(500);
    return c.json({ error: "Unable to update add-ons." });
  }

  return c.json({ data: merged });
});

addonsRouter.post("/checkout", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const body = await readJsonBody(c);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    c.status(400);
    return c.json({ error: parsed.error.flatten().fieldErrors });
  }

  const priceId = ADDON_PRICE_MAP[parsed.data.addonKey];
  if (!priceId) {
    c.status(400);
    return c.json({ error: "Add-on pricing is not configured." });
  }

  const { data: userRow, error: userError } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (userError) {
    console.error("[addons] failed to fetch user record", userError);
    c.status(500);
    return c.json({ error: "Unable to create checkout session." });
  }

  const stripe = initStripe();
  let customerId = userRow?.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    const { error: updateError } = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          stripe_customer_id: customerId,
        },
        { onConflict: "id" }
      );
    if (updateError) {
      console.error("[addons] failed to persist stripe customer id", updateError);
    }
  }

  const baseUrl = getBaseAppUrl();
  const mode = parsed.data.addonKey === "proposal_slots" ? "payment" : "subscription";
  const session = await stripe.checkout.sessions.create({
    mode,
    customer: customerId ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/settings/billing?addon=${parsed.data.addonKey}&status=success`,
    cancel_url: `${baseUrl}/settings/billing?addon=${parsed.data.addonKey}&status=cancelled`,
    metadata: {
      addonKey: parsed.data.addonKey,
      userId: user.id,
    },
  });

  if (!session.url) {
    c.status(500);
    return c.json({ error: "Stripe did not return a checkout URL." });
  }

  return c.json({
    data: {
      url: session.url,
      id: session.id,
    },
  });
});
