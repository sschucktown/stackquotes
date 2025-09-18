# stackquotes
# StackQuotes – MVP Scaffold


## Prereqs
- Node 20+
- Supabase project with Auth enabled and `assets` public bucket
- Stripe account (test mode)


## Setup
1) Clone repo and install deps
```bash
pnpm i
pnpm -C apps/web dev
```


2) Configure Supabase
- Run `supabase/schema.sql` and `supabase/row_owner.sql` in SQL editor.
- Create `assets` bucket or run the insert statement (public=true).


3) Env
- Copy `apps/web/.env.example` → `.env` and fill values.


4) Run
```bash
pnpm -C apps/web dev
```


## Deploy (Vercel)
- Framework: Nuxt 3
- Build command: `npm run build`
- Output: `.output/public`
- Set env vars in Vercel. Ensure serverless function timeout ≥ 60s for PDF.


## Notes
- PDF endpoint: `/api/pdf/:quoteId`
- Stripe Checkout: POST `/api/stripe/checkout` with `{ quoteId }`
```


---


# 🧠 Implementation Notes
- **Palette** wired in Tailwind: header/bg/text/cta/warn.
- **Auth** is magic-link email; swap to password if desired.
- **Auto 3 options**: scaffolded via `QuoteForm` with Good/Better/Best buckets.
- **Logo upload** stores in `assets/logos/*` and uses public URL.
- **RLS** ensures tenant isolation by `contractor_id = auth.uid()`.
- **Stripe**: single line item deposit; webhooks can be added later to mark `quotes.status = 'accepted'`.
- **Puppeteer**: minimal HTML template—customize for branding.
