import { type NextRequest, NextResponse } from "next/server"

// Mock Stripe integration - in production you'd use the actual Stripe SDK
// import Stripe from 'stripe'
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = "usd", paymentMethodType = "card" } = await request.json()

    // Validate amount
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Mock payment intent creation
    // In production, this would be:
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency,
    //   payment_method_types: [paymentMethodType],
    //   metadata: {
    //     proposalId: proposalId,
    //     tier: tier,
    //   },
    // })

    const mockPaymentIntent = {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      amount: Math.round(amount * 100),
      currency,
      status: "requires_payment_method",
    }

    return NextResponse.json({
      clientSecret: mockPaymentIntent.client_secret,
      paymentIntentId: mockPaymentIntent.id,
    })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
  }
}
