// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
  ],

  css: [
    '@/assets/css/tailwind.css',
  ],

  plugins: [
    '~/plugins/supabase.client.ts', // ensure supabase client loads early
  ],

  runtimeConfig: {
    // Server-only (never exposed client-side)
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Public (available in browser)
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
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
