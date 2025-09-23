"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Plus, Trash2, Calculator, Send, Save } from "lucide-react"
import Link from "next/link"

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface QuoteTier {
  name: string
  description: string
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
}

export default function NewQuotePage() {
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    projectDescription: "",
  })

  const [quoteInfo, setQuoteInfo] = useState({
    title: "",
    validUntil: "",
    depositPercentage: 25,
    taxRate: 8.5,
  })

  const [tiers, setTiers] = useState<QuoteTier[]>([
    {
      name: "Good",
      description: "Essential features and quality materials",
      lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    {
      name: "Better",
      description: "Enhanced features with premium materials",
      lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    {
      name: "Best",
      description: "Top-tier features with luxury materials",
      lineItems: [{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  ])

  const [activeTier, setActiveTier] = useState(0)

  const addLineItem = (tierIndex: number) => {
    const newTiers = [...tiers]
    const newId = Date.now().toString()
    newTiers[tierIndex].lineItems.push({
      id: newId,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    })
    setTiers(newTiers)
  }

  const removeLineItem = (tierIndex: number, itemId: string) => {
    const newTiers = [...tiers]
    newTiers[tierIndex].lineItems = newTiers[tierIndex].lineItems.filter((item) => item.id !== itemId)
    setTiers(newTiers)
    calculateTierTotals(tierIndex)
  }

  const updateLineItem = (tierIndex: number, itemId: string, field: keyof LineItem, value: string | number) => {
    const newTiers = [...tiers]
    const itemIndex = newTiers[tierIndex].lineItems.findIndex((item) => item.id === itemId)
    if (itemIndex !== -1) {
      newTiers[tierIndex].lineItems[itemIndex] = {
        ...newTiers[tierIndex].lineItems[itemIndex],
        [field]: value,
      }

      // Recalculate total for this line item
      const item = newTiers[tierIndex].lineItems[itemIndex]
      item.total = item.quantity * item.unitPrice

      setTiers(newTiers)
      calculateTierTotals(tierIndex)
    }
  }

  const calculateTierTotals = (tierIndex: number) => {
    const newTiers = [...tiers]
    const tier = newTiers[tierIndex]
    tier.subtotal = tier.lineItems.reduce((sum, item) => sum + item.total, 0)
    tier.tax = tier.subtotal * (quoteInfo.taxRate / 100)
    tier.total = tier.subtotal + tier.tax
    setTiers(newTiers)
  }

  const handleSaveQuote = () => {
    console.log("Saving quote...", { clientInfo, quoteInfo, tiers })
    // Here you would save to your backend
  }

  const handleSendQuote = () => {
    console.log("Sending quote...", { clientInfo, quoteInfo, tiers })
    // Here you would send the quote to the client
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">Create New Quote</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSaveQuote}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSendQuote}>
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Client & Quote Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
                <CardDescription>Enter your client's details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    placeholder="John Smith"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input
                    id="clientPhone"
                    placeholder="(555) 123-4567"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAddress">Project Address</Label>
                  <Textarea
                    id="clientAddress"
                    placeholder="123 Main St, City, State 12345"
                    value={clientInfo.address}
                    onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectDescription">Project Description</Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Brief description of the project..."
                    value={clientInfo.projectDescription}
                    onChange={(e) => setClientInfo({ ...clientInfo, projectDescription: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Settings</CardTitle>
                <CardDescription>Configure quote parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quoteTitle">Quote Title</Label>
                  <Input
                    id="quoteTitle"
                    placeholder="Kitchen Remodel Project"
                    value={quoteInfo.title}
                    onChange={(e) => setQuoteInfo({ ...quoteInfo, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={quoteInfo.validUntil}
                    onChange={(e) => setQuoteInfo({ ...quoteInfo, validUntil: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={quoteInfo.taxRate}
                    onChange={(e) => setQuoteInfo({ ...quoteInfo, taxRate: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositPercentage">Deposit (%)</Label>
                  <Input
                    id="depositPercentage"
                    type="number"
                    value={quoteInfo.depositPercentage}
                    onChange={(e) =>
                      setQuoteInfo({ ...quoteInfo, depositPercentage: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quote Tiers */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quote Tiers</CardTitle>
                <CardDescription>Create Good/Better/Best options for your client</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Tier Tabs */}
                <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
                  {tiers.map((tier, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTier(index)}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTier === index
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tier.name}
                    </button>
                  ))}
                </div>

                {/* Active Tier Content */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Tier Description</Label>
                    <Input
                      placeholder="Describe this tier..."
                      value={tiers[activeTier].description}
                      onChange={(e) => {
                        const newTiers = [...tiers]
                        newTiers[activeTier].description = e.target.value
                        setTiers(newTiers)
                      }}
                    />
                  </div>

                  {/* Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Line Items</Label>
                      <Button size="sm" onClick={() => addLineItem(activeTier)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {tiers[activeTier].lineItems.map((item, itemIndex) => (
                        <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                          <div className="col-span-5">
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <Input
                              placeholder="Item description..."
                              value={item.description}
                              onChange={(e) => updateLineItem(activeTier, item.id, "description", e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Qty</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(activeTier, item.id, "quantity", Number.parseInt(e.target.value) || 1)
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Unit Price</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateLineItem(activeTier, item.id, "unitPrice", Number.parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm">
                              ${item.total.toFixed(2)}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(activeTier, item.id)}
                              disabled={tiers[activeTier].lineItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tier Summary */}
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${tiers[activeTier].subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax ({quoteInfo.taxRate}%):</span>
                      <span>${tiers[activeTier].tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${tiers[activeTier].total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Deposit ({quoteInfo.depositPercentage}%):</span>
                      <span>${(tiers[activeTier].total * (quoteInfo.depositPercentage / 100)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tier Comparison */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="h-5 w-5 mr-2" />
                  Tier Comparison
                </CardTitle>
                <CardDescription>Quick overview of all tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {tiers.map((tier, index) => (
                    <div key={index} className="text-center p-4 border border-border/50 rounded-lg">
                      <Badge variant={index === 0 ? "outline" : index === 1 ? "secondary" : "default"} className="mb-2">
                        {tier.name}
                      </Badge>
                      <div className="text-2xl font-bold">${tier.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        ${(tier.total * (quoteInfo.depositPercentage / 100)).toFixed(2)} deposit
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
