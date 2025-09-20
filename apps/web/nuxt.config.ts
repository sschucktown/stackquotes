// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,   // ✅ ensure SSR + API routes

  modules: ['@pinia/nuxt'],

  css: ['@/assets/css/tailwind.css'],

  plugins: [
    '~/plugins/supabase.client.ts', // load Supabase early
  ],

  runtimeConfig: {
    // server-only
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // public (client-side)
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },

  typescript: {
    strict: true,
    shim: false,
  },

  nitro: {
    preset: 'vercel',
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
