"use client"

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

type ProfileForm = {
  company_name: string
  contact_name: string
  phone: string
  email: string
  address: string
}

export default function ProfilePage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()

  const [form, setForm] = useState<ProfileForm>({
    company_name: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      setLoading(true)

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          toast({
            variant: "destructive",
            title: "Session expired",
            description: "Please sign in again to continue.",
          })
          router.push("/login")
          return
        }

        setUserId(user.id)

        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) {
          toast({
            variant: "destructive",
            title: "Unable to load profile",
            description: error.message,
          })
        } else if (data && isMounted) {
          setForm({
            company_name: data.company_name ?? "",
            contact_name: data.contact_name ?? "",
            phone: data.phone ?? "",
            email: data.email ?? user.email ?? "",
            address: data.address ?? "",
          })
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [router, supabase, toast])

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    setSaving(true)

    const payload = {
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
    }

    try {
      const { error } = await supabase.from("profiles").update(payload).eq("id", userId)

      if (error) {
        toast({
          variant: "destructive",
          title: "Unable to save profile",
          description: error.message,
        })
      } else {
        toast({
          title: "Profile updated",
          description: "Your contractor details have been saved.",
        })
        setForm((prev) => ({
          ...prev,
          company_name: payload.company_name,
          contact_name: payload.contact_name,
          email: payload.email,
          phone: payload.phone ?? "",
          address: payload.address ?? "",
        }))
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="border-border/50 bg-background/60 backdrop-blur">
      <CardHeader>
        <CardTitle>Contractor Profile</CardTitle>
        <CardDescription>Keep your business details up to date for quotes and client communication.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input
              id="company_name"
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              placeholder="Acme Construction"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_name">Primary contact</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={form.contact_name}
              onChange={handleChange}
              placeholder="Jordan Smith"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@stackquotes.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Business address</Label>
            <Textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Street, Suite 200, Springfield, IL"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
