"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CreditCard,
  FileText,
  PlayCircle,
  Smartphone,
  Sparkles,
} from "lucide-react"

interface DemoSection {
  id: DemoSectionId
  title: string
  tagline: string
  Component: () => JSX.Element
}

type DemoSectionId = "quote-builder" | "payment-flow" | "mobile-first" | "upgrade-journey"

export default function DemoPage() {
  const [activeSectionId, setActiveSectionId] = useState<DemoSectionId>("quote-builder")

  useEffect(() => {
    console.info(`[demo] Active section changed to: ${activeSectionId}`)
  }, [activeSectionId])

  const activeSection = useMemo(
    () => demoSections.find((section) => section.id === activeSectionId) ?? demoSections[0],
    [activeSectionId],
  )

  const ActiveComponent = activeSection.Component

  return (
    <div className="bg-background text-foreground">
      <section className="border-b border-border/40 bg-gradient-to-b from-background via-background to-muted/30">
        <div className="container mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 md:flex-row md:items-center">
          <div className="flex-1 space-y-6">
            <Badge className="bg-primary/10 text-primary">Live product tour</Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Experience StackQuotes in minutes
            </h1>
            <p className="text-lg text-muted-foreground">
              Follow an interactive walkthrough that mirrors the Good/Better/Best workflow on our landing page, see how
              instant deposits get triggered, and explore the mobile-first quoting experience.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="group" onClick={() => setActiveSectionId("quote-builder")}> 
                Start interactive demo
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Try StackQuotes free</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <DemoHeroHighlight icon={FileText} label="Guided quote builder" />
              <DemoHeroHighlight icon={CreditCard} label="Instant deposit capture" />
              <DemoHeroHighlight icon={Smartphone} label="Mobile-first workflows" />
            </div>
          </div>
          <div className="flex-1">
            <Card className="border-border/40 bg-card/60 shadow-xl">
              <AspectRatio ratio={16 / 9}>
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-muted">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(80,97,255,0.25),_transparent_60%)]" />
                  <div className="z-10 flex flex-col items-center justify-center gap-4 text-center">
                    <Button size="lg" variant="secondary" className="gap-2">
                      <PlayCircle className="h-5 w-5" />
                      Watch 2-min overview
                    </Button>
                    <p className="max-w-xs text-sm text-muted-foreground">
                      Prefer a quick video? Embed a highlight reel of the quote builder and payments here.
                    </p>
                  </div>
                </div>
              </AspectRatio>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl space-y-10 px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {demoSections.map((section) => (
            <Card
              key={section.id}
              className={cn(
                "border-border/50 transition-shadow",
                activeSectionId === section.id ? "shadow-lg shadow-primary/10" : "hover:shadow-md",
              )}
            >
              <button
                type="button"
                className="flex h-full w-full flex-col items-start gap-3 rounded-lg p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setActiveSectionId(section.id)}
              >
                <Badge variant={activeSectionId === section.id ? "default" : "secondary"}>
                  Step {demoSections.indexOf(section) + 1}
                </Badge>
                <CardTitle className="text-xl">{section.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">{section.tagline}</CardDescription>
              </button>
            </Card>
          ))}
        </div>

        <Card className="border-border/40 bg-card/70 shadow-md">
          <CardHeader className="space-y-2">
            <Badge className="w-fit bg-primary/10 text-primary">Interactive spotlight</Badge>
            <CardTitle className="text-2xl font-semibold">{activeSection.title}</CardTitle>
            <CardDescription>{activeSection.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <ActiveComponent />
          </CardContent>
        </Card>
      </section>

      <section className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto max-w-5xl space-y-8 px-6 py-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-semibold">Ready to put it into action?</h2>
              <p className="text-muted-foreground">
                Every demo account starts with sample data so you can recreate what you just explored in a few clicks.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/signup">Launch your free trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Sign in to existing account</Link>
              </Button>
            </div>
          </div>
          <Card className="border-dashed border-border/60 bg-background/80">
            <CardContent className="grid gap-6 p-6 md:grid-cols-3">
              <ValueMetric
                icon={Sparkles}
                label="Pre-built templates"
                value="3"
                helper="Good / Better / Best sample packages ready to customize."
              />
              <ValueMetric
                icon={CreditCard}
                label="Payments supported"
                value="Stripe + ACH"
                helper="Collect deposits and final payments instantly."
              />
              <ValueMetric
                icon={BarChart3}
                label="Conversion lift"
                value="+23%"
                helper="Average win-rate increase for teams using StackQuotes Pro."
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

const demoSections: readonly DemoSection[] = [
  {
    id: "quote-builder",
    title: "Quote builder walkthrough",
    tagline: "Build Good/Better/Best proposals with automatic math and professional outputs.",
    Component: QuoteBuilderWalkthrough,
  },
  {
    id: "payment-flow",
    title: "Instant deposit and approval flow",
    tagline: "Show prospects how clients approve quotes and trigger payments in seconds.",
    Component: PaymentFlowPreview,
  },
  {
    id: "mobile-first",
    title: "Mobile-first experience",
    tagline: "Highlight responsive layouts, offline capture, and voice-to-text notes in the field.",
    Component: MobileExperienceSpotlight,
  },
  {
    id: "upgrade-journey",
    title: "Upgrade path from trial to Pro",
    tagline: "Explain how teams grow into Essentials and Pro once they validate the workflow.",
    Component: UpgradeJourneyOverview,
  },
] as const

function DemoHeroHighlight({
  icon: Icon,
  label,
}: {
  icon: typeof FileText
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-background/80 px-3 py-1">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </span>
  )
}

function QuoteBuilderWalkthrough() {
  type QuoteTier = "good" | "better" | "best"

  const quoteOptions: Record<QuoteTier, QuoteOption> = {
    good: {
      title: "Good",
      subtitle: "Baseline refresh",
      price: 4200,
      depositRate: 0.3,
      timeline: "5 business days",
      highlights: ["Standard materials", "2-year workmanship warranty", "Digital PDF & share link"],
      lineItems: [
        { label: "Site prep & cleanup", amount: 650 },
        { label: "Materials", amount: 2100 },
        { label: "Labor", amount: 1450 },
      ],
    },
    better: {
      title: "Better",
      subtitle: "Premium upgrade",
      price: 5750,
      depositRate: 0.3,
      timeline: "7 business days",
      highlights: ["Premium finishes", "4-year warranty", "Client portal with approvals"],
      lineItems: [
        { label: "Site prep & cleanup", amount: 750 },
        { label: "Materials", amount: 2750 },
        { label: "Labor", amount: 1900 },
        { label: "Project management", amount: 350 },
      ],
    },
    best: {
      title: "Best",
      subtitle: "Signature experience",
      price: 7125,
      depositRate: 0.35,
      timeline: "10 business days",
      highlights: ["Designer consultation", "6-year warranty", "Post-project follow-up"],
      lineItems: [
        { label: "Site prep & cleanup", amount: 850 },
        { label: "Materials", amount: 3100 },
        { label: "Labor", amount: 2100 },
        { label: "Project management", amount: 475 },
        { label: "Client experience kit", amount: 600 },
      ],
    },
  }

  const [selectedTier, setSelectedTier] = useState<QuoteTier>("better")
  const selectedOption = quoteOptions[selectedTier]
  const subtotal = selectedOption.lineItems.reduce((sum, line) => sum + line.amount, 0)
  const deposit = Math.round(selectedOption.price * selectedOption.depositRate)
  const balance = selectedOption.price - deposit

  useEffect(() => {
    console.info(`[demo] Quote option selected: ${selectedTier}`)
  }, [selectedTier])

  return (
    <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Good / Better / Best packages</h3>
          <p className="text-muted-foreground">
            Toggle between pre-built packages to show prospects how StackQuotes auto-updates totals, deposits, and the
            client-facing preview instantly.
          </p>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          className="w-full"
          value={selectedTier}
          onValueChange={(value) => value && setSelectedTier(value as QuoteTier)}
        >
          {(Object.entries(quoteOptions) as [QuoteTier, QuoteOption][]).map(([tierKey, option]) => (
            <ToggleGroupItem key={tierKey} value={tierKey}>
              <div className="flex flex-col">
                <span className="font-semibold">{option.title}</span>
                <span className="text-xs text-muted-foreground">{option.subtitle}</span>
              </div>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <Card className="border-border/50 bg-background/80">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedOption.title} package</CardTitle>
            <CardDescription>{selectedOption.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Investment</p>
                  <p className="text-3xl font-semibold">${selectedOption.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deposit due today</p>
                  <p className="text-xl font-medium text-primary">${deposit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Balance on completion</p>
                  <p className="text-xl font-medium">${balance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Line items</h4>
              <ul className="space-y-2">
                {selectedOption.lineItems.map((line) => (
                  <li key={line.label} className="flex items-center justify-between text-sm">
                    <span>{line.label}</span>
                    <span className="text-muted-foreground">${line.amount.toLocaleString()}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between border-t border-dashed border-border/40 pt-2 text-sm font-semibold">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Highlights</h4>
              <ul className="grid gap-2 sm:grid-cols-2">
                {selectedOption.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border/50 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Client preview
            </CardTitle>
            <CardDescription>
              Every quote renders as a responsive web link and polished PDF—perfect for quick approvals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/40 bg-background/60 p-4 text-sm leading-relaxed">
              <p className="font-semibold">Project summary</p>
              <p className="text-muted-foreground">
                {selectedOption.title} package selected — includes {selectedOption.highlights[0]?.toLowerCase()} with a
                {" "}
                {Math.round(selectedOption.depositRate * 100)}% deposit collected instantly.
              </p>
              <div className="mt-4 grid gap-3 rounded-lg bg-muted/40 p-3">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Timeline</span>
                  <span>{selectedOption.timeline}</span>
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Deposit</span>
                  <span>${deposit.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
                  <span>Balance</span>
                  <span>${balance.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full">
              Download sample PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg">Talking points</CardTitle>
            <CardDescription>Use these prompts while prospects explore the demo.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                • “Notice how deposit amounts recalculate as we switch tiers—no manual math or spreadsheets.”
              </li>
              <li>
                • “Your client receives this branded link instantly and can approve on any device.”
              </li>
              <li>• “Customize each line item or add optional upsells to increase average job value.”</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface QuoteOption {
  title: string
  subtitle: string
  price: number
  depositRate: number
  timeline: string
  highlights: string[]
  lineItems: { label: string; amount: number }[]
}

function PaymentFlowPreview() {
  const paymentStages: PaymentStage[] = [
    {
      id: 0,
      label: "Quote sent",
      detail: "Client receives the Good/Better/Best proposal via email and text.",
      helper: "Track opens and follow-ups automatically.",
    },
    {
      id: 1,
      label: "Client approves",
      detail: "They select the Better package, sign, and add a payment method.",
      helper: "Approval captured with an e-signature and saved to the job record.",
    },
    {
      id: 2,
      label: "Deposit captured",
      detail: "StackQuotes charges the 30% deposit through Stripe or ACH instantly.",
      helper: "Funds arrive in your connected account within minutes.",
    },
    {
      id: 3,
      label: "Project kickoff",
      detail: "Milestone reminders schedule the remaining balance automatically.",
      helper: "Set custom reminders or request progress payments mid-project.",
    },
  ]

  const [stage, setStage] = useState<number>(2)
  const activeStage = paymentStages[stage]
  const progressValue = (stage / (paymentStages.length - 1)) * 100

  useEffect(() => {
    console.info(`[demo] Payment stage selected: ${activeStage.label}`)
  }, [activeStage])

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Approval to cash in seconds</h3>
          <p className="text-muted-foreground">
            Drag the slider to show how approvals trigger instant deposits, scheduled follow-ups, and synced reporting.
          </p>
        </div>
        <div className="space-y-4">
          <Slider
            value={[stage]}
            min={0}
            max={paymentStages.length - 1}
            step={1}
            onValueChange={(value) => setStage((prev) => value[0] ?? prev)}
          />
          <Progress value={progressValue} />
        </div>
        <div className="space-y-4">
          {paymentStages.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-lg border p-4",
                stage === item.id ? "border-primary bg-primary/5" : "border-border/40 bg-background/60",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{item.label}</p>
                {stage === item.id && <Badge className="bg-primary text-primary-foreground">Live</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{item.helper}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border/50 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            Payment summary
          </CardTitle>
          <CardDescription>Demonstrate the automation triggered at each stage.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-lg border border-dashed border-border/50 bg-background/70 p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current step</p>
            <p className="text-lg font-semibold">{activeStage.label}</p>
            <p className="text-muted-foreground">{activeStage.detail}</p>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              • Deposits sync to QuickBooks and your job cost reports instantly—no double entry.
            </li>
            <li>
              • Customer receipts and status emails are automated, saving your office staff hours each week.
            </li>
            <li>
              • Trigger reminders or schedule the remaining balance directly from the quote timeline.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

interface PaymentStage {
  id: number
  label: string
  detail: string
  helper: string
}

function MobileExperienceSpotlight() {
  const [tab, setTab] = useState<string>("offline")

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
      <Card className="border-border/50 bg-card/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            Field-ready quoting
          </CardTitle>
          <CardDescription>
            Showcase how crews build quotes in the field with offline capture, voice-to-text, and photo annotations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="offline">Offline mode</TabsTrigger>
              <TabsTrigger value="voice">Voice-to-text</TabsTrigger>
              <TabsTrigger value="photos">Photo markup</TabsTrigger>
            </TabsList>
            <TabsContent value="offline" className="space-y-3 rounded-lg border border-border/40 bg-background/70 p-4">
              <h4 className="text-base font-semibold">Works even without signal</h4>
              <p className="text-sm text-muted-foreground">
                Crews capture line items, photos, and customer notes offline. StackQuotes syncs everything automatically
                when they reconnect.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Offline drafts clearly labeled so office staff know what needs review.</li>
                <li>• Auto-sync triggers push notifications once the device is back online.</li>
              </ul>
            </TabsContent>
            <TabsContent value="voice" className="space-y-3 rounded-lg border border-border/40 bg-background/70 p-4">
              <h4 className="text-base font-semibold">Voice-to-text notes</h4>
              <p className="text-sm text-muted-foreground">
                Tap the microphone to dictate scope notes or material counts. Transcriptions attach directly to the
                quote.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Auto-detects speaker names and organizes notes by room or phase.</li>
                <li>• Highlights keywords like “change order” so follow-ups never get missed.</li>
              </ul>
            </TabsContent>
            <TabsContent value="photos" className="space-y-3 rounded-lg border border-border/40 bg-background/70 p-4">
              <h4 className="text-base font-semibold">Annotated photos</h4>
              <p className="text-sm text-muted-foreground">
                Snap photos, mark measurements, and add callouts that customers see directly in the quote gallery.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Built-in markup tools—no need to hop into another app.</li>
                <li>• Clients can react or comment before approving to speed up clarification.</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/40 bg-gradient-to-br from-primary/10 via-background to-background">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <Badge className="w-fit bg-primary text-primary-foreground">Responsive</Badge>
              <h4 className="text-lg font-semibold">Tablet & desktop ready</h4>
              <p className="text-sm text-muted-foreground">
                Switch devices mid-quote without losing work. Layouts adapt instantly for office review.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Auto-save drafts for foreman approval.</li>
              <li>• Real-time collaboration with office coordinators.</li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-gradient-to-br from-muted/50 via-background to-background">
          <CardContent className="flex h-full flex-col justify-between gap-4 p-6">
            <div className="space-y-2">
              <Badge className="w-fit bg-secondary text-secondary-foreground">Customer view</Badge>
              <h4 className="text-lg font-semibold">Client-friendly approvals</h4>
              <p className="text-sm text-muted-foreground">
                Customers approve from their phone, confirm payment, and receive instant receipts.
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Branded URLs highlight your company name.</li>
              <li>• Auto-reminders for unapproved quotes after 48 hours.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UpgradeJourneyOverview() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-5">
        <h3 className="text-xl font-semibold">Turn demo momentum into upgrades</h3>
        <p className="text-muted-foreground">
          Share how teams progress from trial to paid plans by unlocking automations, analytics, and integrations. This
          closes the loop with the pricing narrative on the landing page.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <PlanCard
            name="Essentials"
            price="$49/mo"
            description="For solo owners validating the workflow."
            features={["Unlimited quotes", "Instant deposit collection", "Standard PDF exports"]}
          />
          <PlanCard
            name="Pro"
            price="$99/mo"
            description="For growing crews who need automation and reporting."
            features={["Advanced analytics", "Team permissions", "QuickBooks sync", "Dedicated success manager"]}
            highlighted
          />
        </div>

        <div className="rounded-lg border border-dashed border-border/40 bg-background/70 p-5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Upgrade talking points</p>
          <ul className="mt-2 space-y-2">
            <li>• “Trials start with demo data so you can recreate this quote in under five minutes.”</li>
            <li>• “Essentials is great for owner-operators; Pro adds permissions and reporting for teams.”</li>
            <li>• “Annual plans lock in a 15% savings and onboarding session.”</li>
          </ul>
        </div>
      </div>

      <Card className="border-border/50 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg">Demo follow-up checklist</CardTitle>
          <CardDescription>Embed this in your marketing automation or CRM playbook.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
            <p>Capture completion events from the tour to trigger nurture emails.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
            <p>Invite engaged prospects to schedule a personalized onboarding session.</p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
            <p>Share the Essentials vs. Pro comparison PDF for multi-stakeholder buys.</p>
          </div>
          <Button variant="secondary" className="w-full">
            Download enablement kit
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function PlanCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <Card
      className={cn(
        "h-full border border-border/40",
        highlighted && "border-primary/60 shadow-lg shadow-primary/10",
      )}
    >
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div>
          <h4 className="text-lg font-semibold">{name}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <p className="text-2xl font-semibold">{price}</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button variant={highlighted ? "default" : "outline"} className="mt-auto">
          Choose {name}
        </Button>
      </CardContent>
    </Card>
  )
}

function ValueMetric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Sparkles
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{helper}</p>
    </div>
  )
}
