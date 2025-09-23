import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Zap, Shield, Smartphone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SQ</span>
            </div>
            <span className="text-xl font-semibold text-foreground">StackQuotes</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">New: Multi-tier quoting system</Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-balance mb-6 leading-tight">
            Win more jobs with
            <span className="text-primary"> professional quotes</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance mb-8 leading-relaxed">
            StackQuotes helps contractors create Good/Better/Best quotes, collect deposits, and manage payments—all in
            one simple, mobile-first app.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to close more deals</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop juggling spreadsheets, PDFs, and multiple apps. Create professional quotes in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Multi-Tier Quotes</CardTitle>
                <CardDescription>
                  Create Good/Better/Best options to maximize revenue and give clients choice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Automatic calculations
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Professional PDF export
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Client-facing web links
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Instant Deposits</CardTitle>
                <CardDescription>
                  Collect deposits the moment clients approve your quote. No more chasing payments.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Stripe integration
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    ACH & card payments
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Automatic invoicing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>Mobile-First</CardTitle>
                <CardDescription>Create quotes on-site, in the field, or anywhere you do business.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Works on any device
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Offline capability
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                    Voice-to-text input
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, upgrade when you're ready to scale.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-2xl">Essentials</CardTitle>
                <div className="text-4xl font-bold">
                  $49<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription>Perfect for getting started with professional quotes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Multi-tier quotes (Good/Better/Best)
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Deposit collection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    PDF & web exports
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Basic reporting
                  </li>
                </ul>
                <Button className="w-full" size="lg">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/50 bg-primary/5 relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Recommended
              </Badge>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">
                  $99<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription>Everything in Essentials, plus advanced features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Everything in Essentials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Change orders & invoicing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Progress billing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-primary mr-3" />
                    Priority support
                  </li>
                </ul>
                <Button className="w-full" size="lg">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">SQ</span>
            </div>
            <span className="text-lg font-semibold">StackQuotes</span>
          </div>
          <p className="text-muted-foreground">© 2025 StackQuotes. Built for contractors who want to win more jobs.</p>
        </div>
      </footer>
    </div>
  )
}
