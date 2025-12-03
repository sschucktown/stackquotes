export type ThemeName = "blue" | "green" | "orange" | "dark";

export interface ContractorBrand {
  name: string;
  logoUrl?: string;
  theme: ThemeName;
}

export interface PackageOption {
  id: string;
  tier: "Good" | "Better" | "Best";
  label: string;
  priceTotal: number;
  monthlyEstimate?: number;
  description: string;
  bullets: string[];
  isRecommended?: boolean;
  depositAmount: number;
  financingNote?: string;
}

export interface TimelineStep {
  id: string;
  label: string;
  days: string;
  description?: string;
}

export interface InclusionGroup {
  id: string;
  title: string;
  items: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  quote: string;
}

export interface ProposalData {
  id: string;
  clientName: string;
  projectTitle: string;
  projectAddress: string;
  createdAt: string;
  expiresAt: string;
  heroImageUrl?: string;
  galleryUrls: string[];
  contractorBrand: ContractorBrand;
  summaryBlurb: string;
  packages: PackageOption[];
  inclusions: InclusionGroup[];
  exclusions: InclusionGroup[];
  costSummary: {
    rangeLabel: string;
    rangeValue: string;
    note: string;
  };
  timeline: TimelineStep[];
  testimonials: Testimonial[];
  terms: string[];
  warranty: string;
  footerNote: string;
}

export const mockProposal: ProposalData = {
  id: "demo-001",
  clientName: "Jordan Smith",
  projectTitle: "Backyard Composite Deck Replacement",
  projectAddress: "123 Maple Street, Charleston, SC",
  createdAt: "2025-11-30",
  expiresAt: "2025-12-15",
  heroImageUrl: "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
  galleryUrls: [
    "https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg",
    "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
    "https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg",
  ],
  contractorBrand: {
    name: "Lowcountry Deck Co.",
    logoUrl: "https://dummyimage.com/80x80/1d4ed8/ffffff&text=LD",
    theme: "blue",
  },
  summaryBlurb:
    "Thanks for the opportunity to quote your new composite deck. Below are three options (Good / Better / Best) so you can pick what fits your budget and wishlist.",
  packages: [
    {
      id: "good",
      tier: "Good",
      label: "Essential Upgrade",
      priceTotal: 12800,
      monthlyEstimate: 265,
      description: "Solid composite deck replacement with standard railing, no lighting.",
      bullets: [
        "12' x 20' composite decking (basic color)",
        "Standard aluminum railing",
        "Existing frame inspected and reinforced",
        "1-year workmanship warranty",
      ],
      isRecommended: false,
      depositAmount: 2500,
      financingNote: "Estimated with 60-month financing, subject to approval.",
    },
    {
      id: "better",
      tier: "Better",
      label: "Entertainer Package",
      priceTotal: 15800,
      monthlyEstimate: 325,
      description: "Most popular option — upgraded deck plus steps and post lighting.",
      bullets: [
        "12' x 20' composite decking (upgraded color)",
        "Aluminum railing with black balusters",
        "Wide steps to yard",
        "Post cap lighting (solar)",
        "2-year workmanship warranty",
      ],
      isRecommended: true,
      depositAmount: 3500,
      financingNote: "Estimated with 60-month financing, subject to approval.",
    },
    {
      id: "best",
      tier: "Best",
      label: "Entertainer Plus with Pergola",
      priceTotal: 19800,
      monthlyEstimate: 405,
      description: "Includes pergola, upgraded fascia, and full lighting package.",
      bullets: [
        "12' x 20' composite decking (premium color)",
        "Hidden fastener system",
        "Custom wood pergola",
        "Full perimeter and stair lighting",
        "3-year workmanship warranty",
      ],
      isRecommended: false,
      depositAmount: 4500,
      financingNote: "Estimated with 60-month financing, subject to approval.",
    },
  ],
  inclusions: [
    {
      id: "work-scope",
      title: "What’s Included",
      items: [
        "Demolition and haul-away of existing decking boards",
        "Frame inspection and reinforcement as needed",
        "Supply and installation of new composite decking",
        "All fasteners, hardware, and trim pieces",
        "Final cleanup of job site",
      ],
    },
    {
      id: "permits",
      title: "Permits & Inspections",
      items: [
        "Permit application and coordination with the city (if required)",
        "Scheduling of related inspections",
        "On-site presence during key inspections as needed",
      ],
    },
  ],
  exclusions: [
    {
      id: "not-included",
      title: "Not Included",
      items: [
        "Structural repairs beyond quoted framing allowances",
        "Electrical work beyond basic low-voltage lighting",
        "Landscaping or irrigation modifications",
        "Painting or staining of existing structures",
      ],
    },
  ],
  costSummary: {
    rangeLabel: "Investment Range",
    rangeValue: "$12,800 – $19,800",
    note: "Choose the option that fits your budget today — you can always add upgrades later.",
  },
  timeline: [
    {
      id: "deposit",
      label: "Reserve Your Spot",
      days: "Day 0–1",
      description: "Approve a package and pay the deposit to get on the schedule.",
    },
    {
      id: "permits",
      label: "Permits & Ordering",
      days: "Week 1–2",
      description: "We handle permitting (if needed) and order all materials.",
    },
    {
      id: "build",
      label: "Build Time",
      days: "3–5 days",
      description: "Typical on-site time, weather permitting.",
    },
    {
      id: "final",
      label: "Final Walkthrough",
      days: "Day 1 after completion",
      description: "We walk the project with you and handle any punch list items.",
    },
  ],
  testimonials: [
    {
      id: "t1",
      name: "Alex & Morgan",
      location: "James Island",
      rating: 5,
      quote:
        "The crew was on time, clean, and the deck looks incredible. We were grilling on it the first weekend.",
    },
    {
      id: "t2",
      name: "Chris D.",
      location: "West Ashley",
      rating: 5,
      quote: "Communication was easy and the permit process was handled for us. Highly recommend.",
    },
    {
      id: "t3",
      name: "Lauren P.",
      location: "Mount Pleasant",
      rating: 4,
      quote:
        "They helped us pick between options and stayed on the timeline. Very happy with the result.",
    },
  ],
  terms: [
    "Pricing valid until proposal expiration date.",
    "Changes to scope or materials may affect pricing and schedule.",
    "Unforeseen structural issues will be discussed and approved before additional work.",
    "Payment schedule: deposit at acceptance, balance due at substantial completion.",
  ],
  warranty:
    "All labor is covered under our workmanship warranty (1–3 years depending on package), in addition to manufacturer warranties on materials.",
  footerNote:
    "Questions before you decide? Just reply to this email or text us — we’re happy to walk through the options with you.",
};
