// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  ssr: true,              // 👈 force server rendering & API routes
  nitro: {
    preset: 'vercel'      // 👈 target Vercel serverless runtime
  },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/supabase'
  ],

  css: ['@/assets/css/tailwind.css'],

  plugins: [
  ],

  runtimeConfig: {
    // server-only
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // public (client-side)
    public: {
      baseUrl:
        process.env.NUXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        'http://localhost:3000',
      supabaseUrl:
        process.env.NUXT_PUBLIC_SUPABASE_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey:
        process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      console.log('🟢 SUPABASE URL exists:', !!process.env.NUXT_PUBLIC_SUPABASE_URL)
console.log('🟢 SUPABASE KEY exists:', !!process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY)

    },
  },

  typescript: {
    strict: true,
    shim: false,
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
