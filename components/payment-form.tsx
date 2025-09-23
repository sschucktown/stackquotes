"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Building2, Shield, Loader2 } from "lucide-react"

interface PaymentFormProps {
  amount: number
  onPaymentSuccess: (paymentId: string) => void
  onPaymentError: (error: string) => void
}

export function PaymentForm({ amount, onPaymentSuccess, onPaymentError }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState({
    // Card fields
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    cardName: "",
    // ACH fields
    routingNumber: "",
    accountNumber: "",
    accountName: "",
    // Billing
    billingAddress: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (paymentMethod === "card") {
      return formData.cardNumber && formData.expiryDate && formData.cvc && formData.cardName && formData.billingAddress
    } else {
      return formData.routingNumber && formData.accountNumber && formData.accountName && formData.billingAddress
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      onPaymentError("Please fill in all required fields")
      return
    }

    setIsProcessing(true)

    try {
      // Step 1: Create payment intent
      const intentResponse = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethodType: paymentMethod,
        }),
      })

      if (!intentResponse.ok) {
        throw new Error("Failed to create payment intent")
      }

      const { clientSecret, paymentIntentId } = await intentResponse.json()

      // Step 2: Simulate payment processing
      // In production, you'd use Stripe Elements or similar
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Step 3: Confirm payment
      const confirmResponse = await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          proposalId: "prop_123", // This would come from props
          tier: "better", // This would come from props
          clientNotes: "", // This would come from props
        }),
      })

      if (!confirmResponse.ok) {
        throw new Error("Payment confirmation failed")
      }

      const { paymentId } = await confirmResponse.json()
      onPaymentSuccess(paymentId)
    } catch (error) {
      console.error("Payment error:", error)
      onPaymentError(error instanceof Error ? error.message : "Payment failed")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Choose how you'd like to pay</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            <div className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                Credit or Debit Card
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg">
              <RadioGroupItem value="ach" id="ach" />
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="ach" className="flex-1 cursor-pointer">
                Bank Transfer (ACH) - Save on fees
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card>
        <CardHeader>
          <CardTitle>{paymentMethod === "card" ? "Card Information" : "Bank Account Information"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethod === "card" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={formData.cvc}
                    onChange={(e) => handleInputChange("cvc", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  placeholder="John Smith"
                  value={formData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="123456789"
                  value={formData.routingNumber}
                  onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Holder Name</Label>
                <Input
                  id="accountName"
                  placeholder="John Smith"
                  value={formData.accountName}
                  onChange={(e) => handleInputChange("accountName", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="billingAddress">Billing Address</Label>
            <Input
              id="billingAddress"
              placeholder="123 Main St, City, State 12345"
              value={formData.billingAddress}
              onChange={(e) => handleInputChange("billingAddress", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button type="submit" disabled={isProcessing || !validateForm()} className="w-full text-lg py-6" size="lg">
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <Shield className="h-5 w-5 mr-2" />
            Pay ${amount.toLocaleString()} Securely
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Your payment information is encrypted and secure</p>
        <p>You will receive a receipt via email after payment</p>
      </div>
    </form>
  )
}
