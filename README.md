# StackQuotes QuickQuote Monorepo

QuickQuote is the first module in the StackQuotes SaaS platform, enabling contractors to create, send, and track single-price estimates in minutes. This repository is a Turborepo-based monorepo containing the Vue 3 web client, a Node/Hono API layer, and shared packages for configuration, types, UI primitives, and Supabase integration.

## Repository Layout

```
stackquotes/
├── apps/
│   ├── api/            # Hono + Supabase service API (PDF, email, estimates)
│   └── web/            # Vite + Vue 3 QuickQuote front-end
├── packages/
│   ├── config/         # Shared Zod-based environment loader
│   ├── db/             # Supabase client helpers and schema
│   ├── types/          # Shared TypeScript interfaces
│   └── ui/             # Reusable Vue components
├── docs/PRDs/          # Product requirements (source document)
├── turbo.json          # Turborepo pipeline config
└── pnpm-workspace.yaml # Workspace definition
```

## Features

- Vue 3 + Pinia SPA with Supabase Auth (email/password) and Tailwind UI
- Estimate builder with dynamic line items, auto totals, duplication, and draft/save flows
- Client selector with inline creation, settings form for company defaults
- PDF generation via `pdf-lib` with Supabase Storage delivery and preview modal
- Email delivery using Resend with Supabase-backed access control
- Shared packages for environment validation, types, database helpers, UI primitives
- Supabase schema with RLS policies for clients, estimates, and user settings

## Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/) 9+
- Supabase project (for auth, database, and storage)
- Resend API key (optional; required for outbound email)

## Environment Configuration

Copy the provided examples and populate values from Supabase/Resend:

```bash
cp .env.example .env
cp apps/web/.env.example apps/web/.env
```

Required variables:

- `.env`
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `BASE_APP_URL` (e.g. `http://localhost:5173`)
  - `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRODUCT_ID` (optional placeholders for future modules)
- `apps/web/.env`
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_BASE_URL` (defaults to `http://localhost:8787/api`)
  - `VITE_APP_NAME`

## Database Setup

Run the Supabase schema found in `packages/db/schema.sql` against your project. This creates `clients`, `estimates`, and `user_settings` tables, enables row-level security, and adds helper triggers. RLS assumes Supabase Auth user IDs.

If storage bucket provisioning is not yet enabled in your project, manually create a private bucket named `estimates` (the API attempts to create it on demand with the service role key).

## Installing Dependencies

```bash
pnpm install
```

### Useful Scripts

- `pnpm dev` – run all dev targets (`apps/web` on Vite, `apps/api` via `tsx watch`)
- `pnpm build` – build all packages/apps via Turborepo
- `pnpm --filter @stackquotes/web dev` – front-end only
- `pnpm --filter @stackquotes/api dev` – API only
- `pnpm --filter @stackquotes/ui build` – compile UI package

## Running Locally

```bash
# install deps
pnpm install

# start API (port 8787)
pnpm --filter @stackquotes/api dev

# in a second terminal, start web client (port 5173)
pnpm --filter @stackquotes/web dev
```

Once the Supabase environment variables are set and the servers are running, visit `http://localhost:5173` to sign up/log in. All authenticated API requests forward the Supabase session token via Authorization headers.

## API Surface (apps/api)

| Endpoint | Method | Description |
| --- | --- | --- |
| `/api/estimates/list` | GET | List estimates for the authenticated user (filterable by status/search) |
| `/api/estimates/create` | POST | Create estimate with line items and totals |
| `/api/estimates/update` | PATCH | Update estimate fields/line items |
| `/api/estimates/duplicate` | POST | Clone an existing estimate |
| `/api/clients/list` | GET | Fetch clients for the authenticated user |
| `/api/clients/create` | POST | Create a client record |
| `/api/settings/current` | GET | Load user settings |
| `/api/settings/update` | POST | Upsert user settings |
| `/api/pdf/generate` | POST | Generate PDF, upload to storage, return signed URL |
| `/api/email/send` | POST | Send estimate email via Resend |

All endpoints expect a Bearer token from Supabase Auth. Errors are returned as `{ "error": string }`.

## Front-End Highlights

- Auth guard waits for Supabase session before routing
- Dashboard summary with status filters/search, inline duplication, settings toggles
- Estimate editor handles draft creation, updates, PDF preview, and email sending
- Shared UI primitives (`@stackquotes/ui`) provide consistent styling for form elements, cards, modals, and buttons

## Testing & Linting

No automated tests are included yet. Recommended next steps:

1. Add component/unit tests (Vitest + Testing Library) for critical flows
2. Expand API test coverage (e.g. using Supertest)
3. Configure lint rules (`eslint`, `prettier`) across the repo

## Deployment Notes

- Deploy API and web to the same origin (Vercel or similar) so that `/api` points to the Hono app
- Ensure environment variables are available to both serverless functions and the web build
- Update `vercel.json` or your deployment pipeline to run `pnpm build` and serve `apps/web/dist`

## Next Steps

- Implement PayLink integration (schema includes forward-compatible fields)
- Wire Stripe billing flows (placeholder configuration present)
- Add analytics instrumentation for dashboard KPI tracking

