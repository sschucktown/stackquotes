// apps/web/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

console.log('🟢 SUPABASE URL exists:', !!process.env.NUXT_PUBLIC_SUPABASE_URL)
console.log('🟢 SUPABASE ANON KEY exists:', !!process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY)

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],

  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    },
  },

  css: ['~/assets/css/tailwind.css'],

  build: {
    transpile: ['@headlessui/vue'],
  },
})
