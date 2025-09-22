import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL
        || process.env.NEXT_PUBLIC_BASE_URL
        || 'http://localhost:3000',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL
        || process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
        || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },

  // 👇 Required so @nuxtjs/supabase initializes correctly
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL
      || process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
})
