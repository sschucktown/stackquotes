import Stripe from 'stripe'
import { H3Event, readBody } from 'h3'


export default defineEventHandler(async (event: H3Event) => {
const config = useRuntimeConfig()
const stripe = new Stripe(config.stripeSecretKey!, { apiVersion: '2024-06-20' })
const { quoteId } = await readBody<{ quoteId: string }>(event)


// Load quote from Supabase
const sb = await useServerSupabase()
const { data: quote } = await sb.from('quotes').select('*').eq('id', quoteId).single()
if (!quote) throw createError({ statusCode: 404, statusMessage: 'Quote not found' })


const session = await stripe.checkout.sessions.create({
mode: 'payment',
success_url: `${config.public.appUrl}/quotes/${quoteId}?paid=1`,
cancel_url: `${config.public.appUrl}/quotes/${quoteId}?canceled=1`,
line_items: [
{
price_data: {
currency: 'usd',
product_data: { name: `Deposit for Quote ${quoteId}` },
unit_amount: Math.round((quote.deposit_amount ?? 0) * 100)
},
quantity: 1
}
]
})


return { url: session.url }
})


// Minimal server-side Supabase client (service role)
async function useServerSupabase() {
const config = useRuntimeConfig()
const { createClient } = await import('@supabase/supabase-js')
return createClient(
process.env.NUXT_PUBLIC_SUPABASE_URL!,
config.supabaseServiceRole!
)
}
