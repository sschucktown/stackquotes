"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Send, Plus, Trash2 } from "lucide-react"
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
  const searchParams = useSearchParams()
  const quoteId = searchParams.get("id")

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
    { name: "Good", description: "Essential", lineItems: [], subtotal: 0, tax: 0, total: 0 },
    { name: "Better", description: "Enhanced", lineItems: [], subtotal: 0, tax: 0, total: 0 },
    { name: "Best", description: "Premium", lineItems: [], subtotal: 0, tax: 0, total: 0 },
  ])

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      if (!quoteId) return
      const { data, error } = await supabase.from("quotes").select("*").eq("id", quoteId).single()
      if (error) {
        console.error("Error loading quote:", error)
        return
      }
      if (!data) return

      setClientInfo({
        name: data.client_name,
        email: data.client_email,
        phone: data.client_phone,
        address: "",
        projectDescription: data.project_description,
      })
      setQuoteInfo({
        title: data.project_title,
        validUntil: data.valid_until,
        depositPercentage: data.deposit_percentage,
        taxRate: 8.5,
      })
      setTiers([
        { name: "Good", description: "Essential", lineItems: data.good_items || [], subtotal: data.good_total, tax: 0, total: data.good_total },
        { name: "Better", description: "Enhanced", lineItems: data.better_items || [], subtotal: data.better_total, tax: 0, total: data.better_total },
        { name: "Best", description: "Premium", lineItems: data.best_items || [], subtotal: data.best_total, tax: 0, total: data.best_total },
      ])
    }
    fetchQuote()
  }, [quoteId, supabase])

  const calculateTierTotals = (tierIndex: number) => {
    const newTiers = [...tiers]
    const tier = newTiers[tierIndex]
    tier.subtotal = tier.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    tier.tax = tier.subtotal * (quoteInfo.taxRate / 100)
    tier.total = tier.subtotal + tier.tax
    setTiers(newTiers)
  }

  const addLineItem = (tierIndex: number) => {
    const newTiers = [...tiers]
    newTiers[tierIndex].lineItems.push({ id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, total: 0 })
    setTiers(newTiers)
    calculateTierTotals(tierIndex)
  }

  const updateLineItem = (tierIndex: number, itemId: string, field: keyof LineItem, value: string | number) => {
    const newTiers = [...tiers]
    const itemIndex = newTiers[tierIndex].lineItems.findIndex((i) => i.id === itemId)
    if (itemIndex === -1) return
    newTiers[tierIndex].lineItems[itemIndex] = {
      ...newTiers[tierIndex].lineItems[itemIndex],
      [field]: value,
    }
    newTiers[tierIndex].lineItems[itemIndex].total =
      newTiers[tierIndex].lineItems[itemIndex].quantity *
      newTiers[tierIndex].lineItems[itemIndex].unitPrice
    setTiers(newTiers)
    calculateTierTotals(tierIndex)
  }

  const removeLineItem = (tierIndex: number, itemId: string) => {
    const newTiers = [...tiers]
    newTiers[tierIndex].lineItems = newTiers[tierIndex].lineItems.filter((i) => i.id !== itemId)
    setTiers(newTiers)
    calculateTierTotals(tierIndex)
  }

  const saveQuote = async (status: "draft" | "sent") => {
    setIsLoading(true)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error("Auth error:", userError)
      alert("Authentication error. Please log in again.")
      setIsLoading(false)
      return
    }
    if (!user) {
      alert("You must be logged in")
      setIsLoading(false)
      return
    }

    const payload = {
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
      valid_until: quoteInfo.validUntil || null, // ✅ this fixes the error
      status,
    }

    let error
    if (quoteId) {
      ;({ error } = await supabase.from("quotes").update(payload).eq("id", quoteId))
    } else {
      ;({ error } = await supabase.from("quotes").insert([{ user_id: user.id, ...payload }]))
    }

    if (error) {
      console.error("Error saving quote:", error)
      alert("Failed to save quote: " + error.message)
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-xl font-semibold">{quoteId ? "Edit Quote" : "Create New Quote"}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => saveQuote("draft")} disabled={isLoading}><Save className="h-4 w-4 mr-2" /> Save Draft</Button>
            <Button onClick={() => saveQuote("sent")} disabled={isLoading}><Send className="h-4 w-4 mr-2" /> {quoteId ? "Update & Send" : "Send Quote"}</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Enter client details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Client Name" value={clientInfo.name} onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })} />
            <Input placeholder="Email" type="email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} />
            <Input placeholder="Phone" value={clientInfo.phone} onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })} />
            <Input placeholder="Project Title" value={quoteInfo.title} onChange={(e) => setQuoteInfo({ ...quoteInfo, title: e.target.value })} />
            <Textarea placeholder="Project Description" value={clientInfo.projectDescription} onChange={(e) => setClientInfo({ ...clientInfo, projectDescription: e.target.value })} />
          </CardContent>
        </Card>

        {tiers.map((tier, tierIndex) => (
          <Card key={tier.name}>
            <CardHeader>
              <CardTitle>{tier.name} Option</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tier.lineItems.map((item) => (
                <div key={item.id} className="flex space-x-2 items-center">
                  <Input placeholder="Description" value={item.description} onChange={(e) => updateLineItem(tierIndex, item.id, "description", e.target.value)} />
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateLineItem(tierIndex, item.id, "quantity", Number(e.target.value))} />
                  <Input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => updateLineItem(tierIndex, item.id, "unitPrice", Number(e.target.value))} />
                  <span className="w-20 text-right">${item.total.toFixed(2)}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeLineItem(tierIndex, item.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addLineItem(tierIndex)}><Plus className="h-4 w-4 mr-2" /> Add Item</Button>
              <div className="text-right font-semibold">Subtotal: ${tier.subtotal.toFixed(2)}</div>
              <div className="text-right text-sm text-muted-foreground">Tax: ${tier.tax.toFixed(2)}</div>
              <div className="text-right font-bold">Total: ${tier.total.toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
