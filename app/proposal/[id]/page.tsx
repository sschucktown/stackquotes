"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, Clock, MapPin, Mail, Phone, Calendar, CreditCard, FileText } from "lucide-react"

// Mock data - in real app this would come from API
const mockProposal = {
  id: "prop_123",
  title: "Kitchen Remodel Project",
  contractor: {
    name: "Smith Construction LLC",
    email: "john@smithconstruction.com",
    phone: "(555) 123-4567",
    logo: null,
  },
  client: {
    name: "Johnson Residence",
    address: "123 Oak Street, Springfield, IL 62701",
  },
  projectDescription: "Complete kitchen renovation including cabinets, countertops, flooring, and appliances.",
  validUntil: "2024-02-15",
  depositPercentage: 25,
  taxRate: 8.5,
  status: "pending",
  tiers: [
    {
      name: "Good",
      description: "Essential features with quality materials",
      lineItems: [
        { description: "Cabinet installation (standard grade)", quantity: 1, unitPrice: 8500, total: 8500 },
        { description: "Quartz countertops", quantity: 25, unitPrice: 65, total: 1625 },
        { description: "Vinyl plank flooring", quantity: 200, unitPrice: 4.5, total: 900 },
        { description: "Standard appliance package", quantity: 1, unitPrice: 3200, total: 3200 },
      ],
      subtotal: 14225,
      tax: 1209.13,
      total: 15434.13,
    },
    {
      name: "Better",
      description: "Enhanced features with premium materials",
      lineItems: [
        { description: "Cabinet installation (premium grade)", quantity: 1, unitPrice: 12000, total: 12000 },
        { description: "Granite countertops", quantity: 25, unitPrice: 85, total: 2125 },
        { description: "Hardwood flooring", quantity: 200, unitPrice: 8, total: 1600 },
        { description: "Mid-range appliance package", quantity: 1, unitPrice: 5500, total: 5500 },
        { description: "Under-cabinet lighting", quantity: 1, unitPrice: 800, total: 800 },
      ],
      subtotal: 22025,
      tax: 1872.13,
      total: 23897.13,
    },
    {
      name: "Best",
      description: "Top-tier features with luxury materials",
      lineItems: [
        { description: "Custom cabinet installation (luxury grade)", quantity: 1, unitPrice: 18000, total: 18000 },
        { description: "Marble countertops", quantity: 25, unitPrice: 120, total: 3000 },
        { description: "Premium hardwood flooring", quantity: 200, unitPrice: 12, total: 2400 },
        { description: "High-end appliance package", quantity: 1, unitPrice: 8500, total: 8500 },
        { description: "Smart home integration", quantity: 1, unitPrice: 1500, total: 1500 },
        { description: "Premium lighting package", quantity: 1, unitPrice: 1200, total: 1200 },
      ],
      subtotal: 34600,
      tax: 2941,
      total: 37541,
    },
  ],
}

export default function ProposalPage({ params }: { params: { id: string } }) {
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [clientNotes, setClientNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAcceptProposal = async () => {
    if (!selectedTier) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Redirect to payment page
    window.location.href = `/proposal/${params.id}/payment?tier=${selectedTier}`
  }

  const handleDeclineProposal = async () => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Proposal declined. The contractor has been notified.")
    setIsSubmitting(false)
  }

  const selectedTierData = mockProposal.tiers.find((tier) => tier.name.toLowerCase() === selectedTier)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">SC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{mockProposal.contractor.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {mockProposal.contractor.email}
                  </span>
                  <span className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {mockProposal.contractor.phone}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant={mockProposal.status === "pending" ? "secondary" : "default"} className="text-sm">
              <Clock className="h-4 w-4 mr-1" />
              {mockProposal.status}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Project Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{mockProposal.title}</CardTitle>
            <CardDescription className="flex items-center text-base">
              <MapPin className="h-4 w-4 mr-2" />
              {mockProposal.client.address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{mockProposal.projectDescription}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Valid until {new Date(mockProposal.validUntil).toLocaleDateString()}
              </div>
              <div className="text-sm text-muted-foreground">Deposit required: {mockProposal.depositPercentage}%</div>
            </div>
          </CardContent>
        </Card>

        {/* Tier Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Choose Your Option</CardTitle>
            <CardDescription>Select the package that best fits your needs and budget</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedTier} onValueChange={setSelectedTier} className="space-y-6">
              {mockProposal.tiers.map((tier, index) => (
                <div key={tier.name} className="relative">
                  <div
                    className={`border-2 rounded-lg p-6 transition-all ${
                      selectedTier === tier.name.toLowerCase()
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-border"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <RadioGroupItem value={tier.name.toLowerCase()} id={tier.name.toLowerCase()} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor={tier.name.toLowerCase()} className="text-lg font-semibold cursor-pointer">
                            {tier.name}
                          </Label>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${tier.total.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              ${(tier.total * (mockProposal.depositPercentage / 100)).toLocaleString()} deposit
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{tier.description}</p>

                        {/* Line Items */}
                        <div className="space-y-2">
                          {tier.lineItems.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex justify-between text-sm">
                              <span>
                                {item.description} {item.quantity > 1 && `(${item.quantity}x)`}
                              </span>
                              <span>${item.total.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        {/* Totals */}
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${tier.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ({mockProposal.taxRate}%):</span>
                            <span>${tier.tax.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>Total:</span>
                            <span>${tier.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index === 1 && (
                    <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">Most Popular</Badge>
                  )}
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Client Notes */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>Any questions or special requests? (Optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Let us know if you have any questions or special requirements..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleAcceptProposal}
            disabled={!selectedTier || isSubmitting}
            className="flex-1 text-lg py-6"
            size="lg"
          >
            <CheckCircle2 className="h-5 w-5 mr-2" />
            {isSubmitting ? "Processing..." : "Accept & Pay Deposit"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDeclineProposal}
            disabled={isSubmitting}
            className="flex-1 text-lg py-6 bg-transparent"
            size="lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            Decline Proposal
          </Button>
        </div>

        {selectedTier && (
          <Card className="mt-6 bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Selected: {selectedTierData?.name} Package</h3>
                  <p className="text-sm text-muted-foreground">
                    Total: ${selectedTierData?.total.toLocaleString()} • Deposit: $
                    {((selectedTierData?.total || 0) * (mockProposal.depositPercentage / 100)).toLocaleString()}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
