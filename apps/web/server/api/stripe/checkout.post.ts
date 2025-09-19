/// <reference types="nitropack" />

import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody<{ amount: number }>(event)

  if (!body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Amount is required',
    })
  }

  // Stripe initialized with your secret key from runtime config
  const stripe = new Stripe(config.stripeSecretKey as string, {
    apiVersion: '2024-06-20',
 // use latest supported API version
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: 'Deposit Payment' },
          unit_amount: Math.round(body.amount * 100), // amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${config.public.baseUrl}/success`,
    cancel_url: `${config.public.baseUrl}/cancel`,
  })

  return { id: session.id, url: session.url }
})
