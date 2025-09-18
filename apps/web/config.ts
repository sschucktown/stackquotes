// apps/web/nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'


export default defineNuxtConfig({
typescript: { strict: true },
devtools: { enabled: true },
css: ['~/assets/tailwind.css'],
modules: [
'@pinia/nuxt'
],
pinia: { autoImports: ['defineStore'] },
runtimeConfig: {
// Server only
stripeSecretKey: process.env.STRIPE_SECRET_KEY,
supabaseServiceRole: process.env.SUPABASE_SERVICE_ROLE,
// Public (exposed to client)
public: {
supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
}
},
nitro: {
preset: 'vercel',
// Increase function timeout for PDF rendering if needed
vercel: { config: { functions: { 'api/**': { maxDuration: 60 } } } }
}
})
