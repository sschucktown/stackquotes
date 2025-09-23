"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PaymentForm } from "@/components/payment-form"
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Proposal {
  id: string
  title: string
  contractor: {
    name: string
    email: string
    phone: string
  }
  client: {
    name: string
    address: string
  }
  depositPercentage: number
  taxRate: number
  tiers: Array<{
    name: string
    description: string
    subtotal: number
    tax: number
    total: number
  }>
}

export default function PaymentPage({
  params,
  searchParams,
}: { params: { id: string }; searchParams: { tier?: string } }) {
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"form" | "processing" | "success" | "error">("form")
  const [paymentError, setPaymentError] = useState("")
  const [paymentId, setPaymentId] = useState("")

  useEffect(() => {
    // Fetch proposal data
    const fetchProposal = async () => {
      try {
        const response = await fetch(`/api/proposals/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProposal(data)
        }
      } catch (error) {
        console.error("Error fetching proposal:", error)
      }
    }

    fetchProposal()
  }, [params.id])

  const selectedTier = proposal?.tiers.find((tier) => tier.name.toLowerCase() === searchParams.tier)
  const depositAmount = selectedTier ? selectedTier.total * (proposal.depositPercentage / 100) : 0

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id)
    setPaymentStatus("success")
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setPaymentStatus("error")
  }

  if (!proposal || !selectedTier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-xl font-bold mb-2">Loading...</h2>
            <p className="text-muted-foreground mb-4">Please wait while we load your proposal.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">
              Your deposit of ${depositAmount.toLocaleString()} has been processed successfully.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground mb-6">
              <p>• Payment ID: {paymentId}</p>
              <p>• You'll receive a confirmation email shortly</p>
              <p>• {proposal.contractor.name} will contact you to schedule</p>
              <p>• Project timeline will be confirmed within 24 hours</p>
            </div>
            <Button className="w-full" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p className="text-muted-foreground mb-6">{paymentError}</p>
            <Button onClick={() => setPaymentStatus("form")} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/proposal/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposal
          </Link>
          <Badge variant="secondary" className="text-sm">
            Secure Payment
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">Secure your project with a deposit payment</p>
        </div>

        <div className="grid gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{proposal.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Selected Package:</span>
                <Badge variant="secondary">{selectedTier.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Project Total:</span>
                <span>${selectedTier.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Deposit ({proposal.depositPercentage}%):</span>
                <span className="font-medium">${depositAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Amount Due Today:</span>
                <span>${depositAmount.toLocaleString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Remaining balance: ${(selectedTier.total - depositAmount).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <PaymentForm
            amount={depositAmount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      </div>
    </div>
  )
}
