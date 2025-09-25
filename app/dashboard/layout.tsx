"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/dashboard/profile" },
]

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast({
          variant: "destructive",
          title: "Unable to sign out",
          description: error.message,
        })
        return
      }

      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to sign out",
        description: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">SQ</span>
            <span className="hidden text-lg sm:inline">StackQuotes</span>
          </Link>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <Button variant="outline" size="sm" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
