"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
  const supabase = createClient()
  const router = useRouter()

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
  const [isLoading, setIsLoading] = useState(false)

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

  const saveQuote = async (status: "draft" | "sent") => {
    setIsLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in")
      setIsLoading(false)
      return
    }

    const { error } = await supabase.from("quotes").insert([
      {
        user_id: user.id,
        client_name: clientInfo.name,
        client_email: clientInfo.email,
        client_phone: clientInfo.phone,
        project_title: quoteInfo.title,
        project_description: clientInfo.projectDescription,
        good_total: tiers[0].total,
        better_total: tiers[1].total,
        best_total: tiers[2].total,
        good_items: tiers[0].lineItems,
        better_items: tiers[1].lineItems,
        best_items: tiers[2].lineItems,
        deposit_percentage: quoteInfo.depositPercentage,
        valid_until: quoteInfo.validUntil,
        status,
      },
    ])

    if (error) {
      console.error("Error saving quote:", error)
      alert(error.message)
    } else {
      router.push("/dashboard")
    }

    setIsLoading(false)
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
            <Button variant="outline" onClick={() => saveQuote("draft")} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={() => saveQuote("sent")} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Send Quote
            </Button>
          </div>
        </div>
      </header>

      {/* Rest of your form remains unchanged */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* ... form code (client info, tiers, etc.) ... */}
      </div>
    </div>
  )
}
