import { defineStore } from "pinia";
import type { PackageTierId } from "../types";

export type Spv2SectionType = "hero" | "packages" | "why-us" | "payment" | "footer";
export type FontPreset = "clean" | "friendly" | "bold";

export interface SectionConfig {
  id: string;
  type: Spv2SectionType;
  title?: string;
  hidden?: boolean;
}

export interface PackageData {
  label: string;
  title: string;
  subtitle?: string;
  price: number;
  bullets: string[];
  metricLabel?: string;
  metricValue?: string;
  imageUrl?: string | null;
  secondaryImageUrl?: string | null;
  badgeLabel?: string;
  isRecommended?: boolean;
}

interface BrandSettings {
  primaryColor: string;
  accentColor: string;
  fontPreset: FontPreset;
  logoDataUrl: string | null;
}

interface HeroContent {
  title: string;
  subtitle: string;
  projectAddress: string;
}

interface PaymentTerms {
  depositType: "percent" | "fixed";
  depositValue: number;
  notes: string;
}

interface CompanyFooter {
  companyName: string;
  phone: string;
  email: string;
  license: string;
  address: string;
}

export interface Spv2State {
  proposalId: string | null;
  title: string;
  clientName: string;
  jobAddress: string;
  selectedPackageId: PackageTierId | null;
  brand: BrandSettings;
  hero: HeroContent;
  sections: SectionConfig[];
  packages: {
    good: PackageData;
    better: PackageData;
    best: PackageData;
  };
  whyUsText: string;
  paymentTerms: PaymentTerms;
  companyFooter: CompanyFooter;
}

const getDefaultState = (): Spv2State => ({
  proposalId: null,
  title: "Modern Exterior Makeover",
  clientName: "Avery Thompson",
  jobAddress: "2143 Magnolia Lane, Austin, TX",
  selectedPackageId: "better",
  brand: {
    primaryColor: "#0F62FE",
    accentColor: "#EEF2FF",
    fontPreset: "clean",
    logoDataUrl: null,
  },
  hero: {
    title: "Modern Exterior Makeover",
    subtitle: "Elevating curb appeal with premium finishes and long-life materials.",
    projectAddress: "2143 Magnolia Lane • Austin, TX",
  },
  sections: [
    { id: "hero", type: "hero", title: "Hero" },
    { id: "packages", type: "packages", title: "Packages" },
    { id: "why-us", type: "why-us", title: "Why choose us" },
    { id: "payment", type: "payment", title: "Payment terms" },
    { id: "footer", type: "footer", title: "Footer" },
  ],
  packages: {
    good: {
      label: "Good",
      title: "Core refresh package",
      subtitle: "Refresh focused on essential repairs and a clean finish.",
      price: 18500,
      bullets: ["Pressure wash & prep", "Repair trim + fascia", "Premium exterior paint"],
      metricLabel: "Timeline",
      metricValue: "2-3 wks",
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=960&q=80",
      secondaryImageUrl:
        "https://images.unsplash.com/photo-1505692069463-5e3405e3e7ee?auto=format&fit=crop&w=360&q=80",
    },
    better: {
      label: "Better",
      title: "Elevated curb appeal upgrade",
      subtitle: "Adds architectural accents and an upgraded coating system.",
      price: 24800,
      bullets: [
        "Everything in Good",
        "Smooth coat stucco repair",
        "Soffit + gutter refresh",
        "Upgraded coating warranty",
      ],
      metricLabel: "Warranty",
      metricValue: "8 yr",
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1080&q=80",
      secondaryImageUrl:
        "https://images.unsplash.com/photo-1505692069463-5e3405e3e7ee?auto=format&fit=crop&w=360&q=80",
      badgeLabel: "Recommended",
      isRecommended: true,
    },
    best: {
      label: "Best",
      title: "Signature transformation",
      subtitle: "Complete transformation with modern lighting and detail work.",
      price: 31200,
      bullets: [
        "Everything in Better",
        "Custom cedar accents",
        "Low-voltage lighting package",
        "Priority project timeline",
      ],
      metricLabel: "Timeline",
      metricValue: "Priority",
      imageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80",
      secondaryImageUrl:
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=320&q=80",
      badgeLabel: "Most comprehensive",
      isRecommended: true,
    },
  },
  whyUsText:
    "We run every project with a Tesla-level obsession with detail. Transparent bids, daily progress updates, and a clean jobsite every night—no surprises, just craftsmanship.",
  paymentTerms: {
    depositType: "percent",
    depositValue: 20,
    notes:
      "A 20% deposit secures your project date. Remaining balance split 50% at start + 30% at substantial completion.",
  },
  companyFooter: {
    companyName: "Scott & Co. Exterior Studio",
    phone: "(512) 555-2040",
    email: "hello@scottandco.build",
    license: "TX-EX-947210",
    address: "2143 Magnolia Lane, Austin, TX 78704",
  },
});

export const useSpv2Store = defineStore("spv2", {
  state: getDefaultState,
  getters: {
    visibleSections: (state) => state.sections.filter((section) => !section.hidden),
  },
  actions: {
    resetToDefaults() {
      Object.assign(this, getDefaultState());
    },
    setSelectedPackage(id: PackageTierId | null) {
      this.selectedPackageId = id;
    },
    updateBrand(payload: Partial<BrandSettings>) {
      this.brand = { ...this.brand, ...payload };
    },
    updateHero(payload: Partial<HeroContent>) {
      this.hero = { ...this.hero, ...payload };
    },
    updateSectionTitle(id: string, title: string) {
      const section = this.sections.find((section) => section.id === id);
      if (section) section.title = title;
    },
    moveSectionUp(id: string) {
      const index = this.sections.findIndex((section) => section.id === id);
      if (index > 0) {
        const sections = [...this.sections];
        const [item] = sections.splice(index, 1);
        sections.splice(index - 1, 0, item);
        this.sections = sections;
      }
    },
    moveSectionDown(id: string) {
      const index = this.sections.findIndex((section) => section.id === id);
      if (index !== -1 && index < this.sections.length - 1) {
        const sections = [...this.sections];
        const [item] = sections.splice(index, 1);
        sections.splice(index + 1, 0, item);
        this.sections = sections;
      }
    },
    toggleSectionHidden(id: string) {
      const section = this.sections.find((section) => section.id === id);
      if (section) {
        section.hidden = !section.hidden;
      }
    },
    updatePackage(key: keyof Spv2State["packages"], payload: Partial<PackageData>) {
      const target = this.packages[key];
      if (target) {
        this.packages[key] = { ...target, ...payload };
      }
    },
    replacePackageBullets(key: keyof Spv2State["packages"], bullets: string[]) {
      const target = this.packages[key];
      if (target) {
        this.packages[key] = { ...target, bullets };
      }
    },
    updateWhyUsText(text: string) {
      this.whyUsText = text;
    },
    updatePaymentTerms(payload: Partial<PaymentTerms>) {
      this.paymentTerms = { ...this.paymentTerms, ...payload };
    },
    updateCompanyFooter(payload: Partial<CompanyFooter>) {
      this.companyFooter = { ...this.companyFooter, ...payload };
    },
  },
});
