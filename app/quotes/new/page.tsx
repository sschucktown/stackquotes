"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export default function NewQuotePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const quoteId = searchParams.get("id")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<any>({
    client_name: "",
    client_email: "",
    client_phone: "",
    project_title: "",
    project_description: "",
    good_total: 0,
    good_items: [],
    better_total: 0,
    better_items: [],
    best_total: 0,
    best_items: [],
    deposit_percentage: 25,
    valid_until: null,
    notes: "",
    status: "draft",
  })

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push("/login")
        return
      }
      setUser(user)

      if (quoteId) {
        const { data, error: fetchError } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", quoteId)
          .single()

        if (!fetchError && data) {
          setFormData(data)
        }
      }

      setLoading(false)
    }
    init()
  }, [quoteId, router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSaveDraft = async () => {
    if (!user) return

    try {
      if (quoteId) {
        const { error } = await supabase
          .from("quotes")
          .update({
            ...formData,
            status: "draft",
            updated_at: new Date().toISOString(),
          })
          .eq("id", quoteId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("quotes").insert([
          {
            ...formData,
            user_id: user.id,
            status: "draft",
          },
        ])
        if (error) throw error
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Error saving draft:", err)
      alert("Failed to save draft: " + (err as Error).message)
    }
  }

  const handleSend = async () => {
    if (!user) return

    try {
      if (!quoteId) {
        alert("Please save this quote as a draft first, then send it.")
        return
      }

      // Update Supabase status
      const { error } = await supabase
        .from("quotes")
        .update({
          ...formData,
          status: "sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", quoteId)

      if (error) throw error

      // Call API to send PDF email
      const response = await fetch("/api/send-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      router.push("/dashboard")
    } catch (err) {
      console.error("Error sending quote:", err)
      alert("Failed to send quote: " + (err as Error).message)
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{quoteId ? "Edit Quote" : "New Quote"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client_name">Client Name</Label>
              <Input id="client_name" value={formData.client_name} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="client_email">Client Email</Label>
              <Input id="client_email" type="email" value={formData.client_email} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="project_title">Project Title</Label>
              <Input id="project_title" value={formData.project_title} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="project_description">Project Description</Label>
              <Input id="project_description" value={formData.project_description} onChange={handleChange} />
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button type="button" className="bg-primary text-white" onClick={handleSend}>
                Send Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
