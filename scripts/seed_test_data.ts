import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const resolveEnvPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, "..");
  return path.join(repoRoot, ".env");
};

dotenv.config({ path: resolveEnvPath() });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const stripe =
  stripeSecret && stripeSecret.startsWith("sk_")
    ? new Stripe(stripeSecret, { apiVersion: "2024-04-10" })
    : null;

type SeedUser = {
  email: string;
  password: string;
  company: string;
  tier: "launch" | "pro" | "crew";
  trialDays?: number;
  addons?: Record<string, unknown>;
  requireConnect?: boolean;
};

const seedUsers: SeedUser[] = [
  {
    email: "free_user@example.com",
    password: "Passw0rd!",
    company: "Charleston Deck Pros (Launch)",
    tier: "launch",
    addons: {},
    requireConnect: true,
  },
  {
    email: "trial_user@example.com",
    password: "Passw0rd!",
    company: "Summerville Renovations (Trial)",
    tier: "pro",
    trialDays: 14,
    addons: { financing_boost: true },
    requireConnect: true,
  },
  {
    email: "pro_user@example.com",
    password: "Passw0rd!",
    company: "Mount Pleasant Builders (Pro)",
    tier: "pro",
    addons: { permitsync: true, quoteiq_plus: true },
    requireConnect: true,
  },
];

async function ensureAuthUser(email: string, password: string): Promise<string> {
  const existing = await supabase.auth.admin.getUserByEmail(email);
  if (existing.data?.user) {
    return existing.data.user.id;
  }
  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (created.error || !created.data.user) {
    throw created.error ?? new Error(`Unable to create user for ${email}`);
  }
  return created.data.user.id;
}

async function ensureStripeConnectAccount(userId: string, email: string, company: string): Promise<string | null> {
  if (!stripe) {
    console.warn(`[seed] Stripe secret key missing: skipping Connect account for ${email}`);
    return null;
  }
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      business_profile: { name: company },
      metadata: { userId },
    });
    return account.id;
  } catch (error) {
    console.error(`[seed] Failed to create Connect account for ${email}`, error);
    return null;
  }
}

function trialEndTimestamp(days?: number): string | null {
  if (!days || days <= 0) return null;
  const future = new Date();
  future.setDate(future.getDate() + days);
  return future.toISOString();
}

async function seedUser(record: SeedUser) {
  const userId = await ensureAuthUser(record.email, record.password);
  console.log(`[seed] Synced auth user ${record.email} (${userId})`);

  const connectAccountId = record.requireConnect
    ? await ensureStripeConnectAccount(userId, record.email, record.company)
    : null;

  const trialEnd = trialEndTimestamp(record.trialDays);

  const { error: profileError } = await supabase.from("contractor_profiles").upsert(
    {
      user_id: userId,
      business_name: record.company,
      owner_name: record.email.split("@")[0],
      trade_type: "General Contracting",
      trade: "General Contracting",
      city: "Charleston",
      state: "SC",
      stripe_account_id: connectAccountId ?? null,
      stripe_account_status: connectAccountId ? "active" : null,
    },
    { onConflict: "user_id" }
  );
  if (profileError) {
    console.error(`[seed] Failed to upsert contractor profile for ${record.email}`, profileError);
  }

  const { error: usersError } = await supabase.from("users").upsert(
    {
      id: userId,
      subscription_tier: record.tier,
      trial_end: trialEnd,
      is_active: true,
      addons: record.addons ?? {},
      stripe_connect_account_id: connectAccountId ?? null,
    },
    { onConflict: "id" }
  );
  if (usersError) {
    console.error(`[seed] Failed to upsert users row for ${record.email}`, usersError);
  }

  const { error: settingsError } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      company_name: record.company,
      default_tax_rate: 0.07,
    },
    { onConflict: "user_id" }
  );
  if (settingsError) {
    console.error(`[seed] Failed to upsert user settings for ${record.email}`, settingsError);
  }

  console.log(
    `[seed] ${record.email}: tier=${record.tier} trial_end=${trialEnd ?? "none"} connect=${connectAccountId ?? "skipped"}`
  );
}

async function main() {
  for (const record of seedUsers) {
    try {
      await seedUser(record);
    } catch (error) {
      console.error(`[seed] Failed to seed ${record.email}`, error);
    }
  }
  console.log("[seed] Completed test data provisioning.");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error("[seed] Unhandled error", error);
  process.exit(1);
});
