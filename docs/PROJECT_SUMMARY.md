# PROJECT SUMMARY

- Name: StackQuotes (with planned PermitGet/permit data integration)
- Monorepo: Turborepo with `apps/api` (Hono), `apps/web` (Vue 3), shared `packages/*`
- Primary audience: Small to mid-size contractors; secondary: crews/owners needing proposals, deposits, and light analytics

## 1. Project Overview
- Purpose: Help contractors generate professional proposals fast, send for approval, and collect deposits online with Stripe.
- Target users: Trades (HVAC, roofing, remodels, etc.), solo contractors and small teams graduating to multi-seat “Crew”.
- Problem solved: Reduces proposal turnaround, standardizes pricing/options (Good/Better/Best), streamlines deposits and onboarding for payouts.

## 2. Core Products
- QuickQuote (live)
  - Estimate builder, client management, PDF/email, Supabase RLS-backed data.
  - References: `README.md`, apps/api endpoints; front-end under `apps/web/src/modules/quickquote/*`.
- SmartProposal (live)
  - Generates Good/Better/Best proposals from QuickQuote; deposit configuration and approval flows.
  - References: `apps/api/src/lib/smartProposal.ts:1`, `apps/api/src/services/smartProposals.ts:1`, `apps/api/src/routes/proposals.ts:1`.
- PayLink (in-flight)
  - Stripe checkout/payment links for deposits; Stripe Connect for contractor payouts; platform fees by tier.
  - References: `apps/api/src/lib/stripe.ts:1`, `apps/api/src/routes/stripe/create-payment-link.ts:1`.
- ProfitPulse (planned/preview)
  - Analytics dashboards for proposal performance and revenue snapshots.
  - References in UI copy and pages: `apps/web/src/pages/analytics/AnalyticsPage.vue:5`, `apps/web/src/pages/pricing.vue:131`.
- ScopeForge (beta/planned)
  - Template library and milestone scheduling; change orders; staged payments TBD.
  - References: `apps/web/src/pages/pricing.vue:135`, `apps/api/src/routes/stripe/create-installment-plan.ts:30`.
- Financing (Wisetack integration; telemetry live)
  - Loan application placeholders; telemetry API to record interest/offers.
  - References: `apps/api/src/integrations/wisetack.ts:1`, `apps/api/src/routes/wisetack/index.ts:1`.
- PermitGet/PermitSync (planned)
  - Add-on key `permitsync`; onboarding mentions localizing permit data; no PermitGet API implemented yet.
  - References: `apps/api/src/routes/addons.ts:12`, `apps/web/src/pages/onboarding/OnboardingPage.vue:80`.

## 3. Business Model
- Tiers
  - Launch (free): SmartProposal + PayLink (3% platform fee), previews, basic features.
  - Pro ($99/mo): G/B/B proposals, AI templates, ProfitPulse, insights.
  - Crew ($99 + $20/seat): Pro + seats, shared clients, org analytics.
  - References: `apps/web/src/pages/pricing.vue:1`.
- Add-ons
  - Branding, proposal slots, financing boost (reduces/waives platform fee), legacy: permitsync/supplylink/quoteiq_plus.
  - References: `apps/api/src/routes/addons.ts:1`.
- Revenue drivers
  - Subscriptions (Pro, Crew), platform fees on deposits (3% Launch; 1% paid tiers), add-on purchases, potential financing revenue (future).
  - Fee logic: `apps/api/src/lib/fees.ts:1`.
- Monetization roadmap
  - Expand PayLink automation, ScopeForge milestones, deeper analytics (ProfitPulse), permit data add-ons, upsells.

## 4. Technical Architecture
- Front-end
  - Vue 3 + Vite + Pinia, Tailwind UI; modular pages and feature modules.
  - References: `README.md`, `apps/web/src/modules/*`, `apps/web/src/pages/*`.
- API
  - Hono HTTP server, Node/TS; routes for estimates, proposals, contractor profile, stripe, addons, email, pdf, onboarding.
  - References: `apps/api/src/app.ts:1`.
- Data layer
  - Supabase: Auth, Postgres, Storage; RLS policies (described in README); shared db SDK in `packages/db`.
  - References: `packages/db/src/index.ts:1`, `README.md`.
- Integrations
  - Stripe: payments, Connect, webhooks; `apps/api/src/routes/stripe/*`, `apps/api/src/lib/stripe.ts:1`.
  - Resend: transactional email; `apps/api/src/lib/email.ts` (present).
  - Wisetack: financing sandbox client; telemetry route.
- Config
  - Zod-validated env loader; central Stripe price mapping and keys.
  - References: `packages/config/src/index.ts:1`.
- Data flow (typical)
  - Web app auth via Supabase → API routes (bearer token) → Supabase DB/storage; PDF/email via services; Stripe checkout → webhook → DB updates.

## 5. Go-to-Market Strategy
- ICP
  - Solo to small-team contractors needing faster proposals and simple online payments; upsell to teams (Crew).
- Channels
  - Direct signups via landing/pricing, in-product upgrades via Stripe Checkout.
  - References: `apps/web/src/pages/marketing/StackQuotesLandingPage.vue:261`.
- Acquisition loop
  - Start free (Launch) → send proposals and collect deposits (3% fee) → upgrade for lower fees, G/B/B, analytics, templates.
- Cross-product synergies
  - QuickQuote → SmartProposal generation → PayLink deposit → ProfitPulse analytics; ScopeForge milestones; potential PermitSync for local compliance and lead-in for PermitGet.

## 6. Current Phase
- Live/Implemented
  - QuickQuote estimates, clients, PDF/email; SmartProposal creation and editing; Stripe payments infrastructure; contractor profile/branding; add-ons API shell; financing telemetry.
  - References: API routes in `apps/api/src/routes/*`, UI modules in `apps/web/src/modules/*`.
- In development / placeholders
  - PayLink: session creation is live; onboarding fallback returns Stripe test URL if no Connect account (`apps/api/src/routes/stripe/create-payment-link.ts:35`).
  - ScopeForge: installment plan endpoint is stubbed (`create-installment-plan.ts:30`).
  - ProfitPulse: UI stubs and references present; backend analytics not shown.
  - PermitGet/PermitSync: Add-on key exists; no API integration found.
- Key milestones ahead
  - Complete PayLink production flow (end-to-end with webhooks, ledger, UI tying to proposals).
  - Implement ScopeForge milestones and change orders.
  - Ship ProfitPulse analytics backend.
  - Add Permit data integration (PermitGet/PermitSync).
  - Harden billing/add-ons (Stripe customer portal, receipts).

## 7. Key Risks & Leverage Points
- Risks
  - Payment compliance and payout correctness (Stripe Connect edge cases, webhook robustness).
  - Data integrity without tests; RLS/Supabase schema evolution.
  - Feature sprawl vs. focus (multiple planned modules).
- Leverage
  - Strong modular monorepo and shared packages speed iteration.
  - Clear upgrade path via platform fees and Stripe Checkout for monetization.
  - Supabase + Hono simplicity accelerates shipping.

## 8. Recommendations
- Payments
  - Finalize PayLink: persist intent/link metadata to proposals and payments, backfill on webhooks, add idempotency; path: `apps/api/src/lib/stripe.ts:128`, `apps/api/src/routes/stripe/webhook.ts:1`.
  - Enforce Connect onboarding checks and guide users from UI when missing (currently returns placeholder).
- Proposals
  - Automate deposit-link inclusion on send; ensure accepted option drives payment amount; confirm acceptance-token handling in public routes.
- Analytics
  - Define ProfitPulse backend metrics and endpoints; add charts to `apps/web/src/pages/analytics/AnalyticsPage.vue:5`.
- Add-ons/Billing
  - Complete add-on lifecycle (checkout → entitlement update via webhook). Validate pricing IDs in `packages/config/src/index.ts:1` and map in `apps/api/src/routes/addons.ts:1`.
- ScopeForge
  - Replace installment stub with milestone scheduling and multiple PaymentIntents/invoices; guard with Pro/Crew.
- PermitGet/PermitSync
  - Clarify scope: introduce an integration service and routes; decide on geo-sourcing and pricing; wire add-on entitlement to UI.
- Testing/Quality
  - Add unit/integration tests (API, proposal math, Stripe fee logic); add e2e for Stripe webhook flows; introduce ESLint/Prettier repo-wide.
- Docs/Onboarding
  - Fill `docs/architecture.md` and `docs/roadmap.md`; add developer setup and sequence diagrams; expand onboarding flows in UI.

