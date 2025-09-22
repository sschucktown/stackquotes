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
      // ✅ Match what @nuxtjs/supabase expects
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      baseUrl:
        process.env.NUXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_BASE_URL ||
        'http://localhost:3000',
    },
  },

  css: ['~/assets/css/tailwind.css'],
})
