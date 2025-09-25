"use client"

import { useCallback, useEffect, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Plus, Save } from "lucide-react"

type ProfileForm = {
  company_name: string
  contact_name: string
  email: string
  phone: string
  address: string
}

export default function ProfilePage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProfileForm>({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadProfile = useCallback(async () => {
    setError(null)
    setLoading(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("Error fetching authenticated user:", userError)
      setError("You need to be signed in to manage your profile.")
      setLoading(false)
      return
    }

    setUserId(user.id)

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("company_name, contact_name, email, phone, address")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Error loading profile:", profileError)
      setError("We couldn't load your profile. Please try again.")
      setFormData({
        company_name: "",
        contact_name: "",
        email: user.email ?? "",
        phone: "",
        address: "",
      })
      setLoading(false)
      return
    }

    const nextData: ProfileForm = {
      company_name: data?.company_name ?? "",
      contact_name: data?.contact_name ?? "",
      email: data?.email ?? user.email ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
    }

    setFormData(nextData)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  const handleChange =
    (field: keyof ProfileForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (error) setError(null)
      if (success) setSuccess(false)
    }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) {
      setError("You need to be signed in to update your profile.")
      return
    }

    setSuccess(false)
    setSaving(true)
    setError(null)

    const sanitized: ProfileForm = {
      company_name: formData.company_name.trim(),
      contact_name: formData.contact_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
    }

    const { error: updateError } = await supabase.from("profiles").upsert({
      id: userId,
      company_name: sanitized.company_name,
      contact_name: sanitized.contact_name,
      email: sanitized.email,
      phone: sanitized.phone || null,
      address: sanitized.address || null,
    })

    if (updateError) {
      console.error("Error updating profile:", updateError)
      setError("We couldn't save your profile. Please try again.")
    } else {
      setFormData({
        ...sanitized,
      })
      setSuccess(true)
    }

    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">SQ</span>
            </div>
            <span className="text-xl font-semibold text-foreground">StackQuotes</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/quotes/new">
              <Button>
                <Plus className="h-4 w-4" />
                New Quote
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold">Account profile</h1>
          <p className="text-muted-foreground">
            Manage the company details and contact information that appear on your quotes and proposals.
          </p>
        </div>

        <Card className="max-w-3xl border-border/50">
          <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>Keep this information up to date to deliver the right details to clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertTitle>Profile updated</AlertTitle>
                <AlertDescription>Your changes have been saved successfully.</AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading your profile...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange("company_name")}
                      placeholder="Acme Renovations"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Primary contact</Label>
                    <Input
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange("contact_name")}
                      placeholder="Alex Contractor"
                      required
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange("email")}
                      placeholder="you@company.com"
                      required
                      disabled={saving}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange("phone")}
                      placeholder="(555) 123-4567"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business address (optional)</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange("address")}
                    placeholder={`123 Main Street
Suite 200
Springfield, IL 62704`}
                    rows={4}
                    disabled={saving}
                  />
                </div>

                <div className="flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-4 text-sm text-muted-foreground md:flex-row md:items-center">
                  <p>These details are shared on client-facing documents.</p>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
