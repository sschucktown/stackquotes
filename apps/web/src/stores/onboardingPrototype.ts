import { defineStore } from "pinia";

export interface BusinessInfo {
  businessName: string;
  phone: string;
  email: string;
  serviceArea: string;
  trade: string;
  paymentTerms: string;
  warranty: string;
}

export type LineItem = {
  label: string;
  value: string;
  description?: string;
};

export type ProposalOption = {
  label: string;
  headline: string;
  details: string[];
  price: string;
  accent?: string;
};

export type UploadedFileMeta = {
  name: string;
  size: number;
  type: string;
};

export type DashboardProposal = {
  id: string;
  name: string;
  client: string;
  status: string;
};

const defaultBusinessInfo = (): BusinessInfo => ({
  businessName: "Palmetto Deck Co.",
  phone: "(843) 555-2184",
  email: "info@palmettodeckco.com",
  serviceArea: "Charleston, SC",
  trade: "Deck Builder",
  paymentTerms: "30% deposit, 40% mid-project, 30% at completion",
  warranty: "1-year workmanship warranty",
});

const defaultLineItems = (): LineItem[] => [
  { label: "Composite decking", value: "$14.50/sqft", description: "Moisture-resistant boards in a warm cedar tone." },
  { label: "Framing labor", value: "$65/hr", description: "Crew time for footings, joists, blocking, and hardware." },
  { label: "Railing system", value: "$48/ft", description: "Black powder-coated aluminum with clean, modern lines." },
];

const defaultProposalOptions = (): ProposalOption[] => [
  {
    label: "Good",
    headline: "Pressure-treated lumber",
    details: ["Standard railing", "Basic stairs", "Classic look"],
    price: "$8,450",
    accent: "from-slate-100 to-slate-50",
  },
  {
    label: "Better",
    headline: "Composite decking",
    details: ["Upgraded railing", "Hidden fasteners", "Low-maintenance finish"],
    price: "$12,400",
    accent: "from-sky-100 to-blue-50",
  },
  {
    label: "Best",
    headline: "Composite premium",
    details: ["Aluminum railing", "Accent lighting", "Picture-frame borders"],
    price: "$16,900",
    accent: "from-amber-50 to-orange-50",
  },
];

export const useOnboardingPrototypeStore = defineStore("onboarding-prototype", {
  state: () => ({
    uploadedFileName: "",
    uploadedFile: { name: "", size: 0, type: "" } as UploadedFileMeta,
    trade: "Deck Builder",
    businessInfo: defaultBusinessInfo(),
    lineItems: defaultLineItems(),
    proposalOptions: defaultProposalOptions(),
    proposals: [] as DashboardProposal[],
  }),
  actions: {
    setUploadedFile(file: UploadedFileMeta) {
      this.uploadedFile = file;
      this.uploadedFileName = file.name;
    },
    clearUploadedFile() {
      this.uploadedFile = { name: "", size: 0, type: "" };
      this.uploadedFileName = "";
    },
    setTrade(trade: string) {
      this.trade = trade;
      this.businessInfo = { ...this.businessInfo, trade };
    },
    updateBusinessInfo(payload: Partial<BusinessInfo>) {
      this.businessInfo = { ...this.businessInfo, ...payload };
    },
    addProposal(proposal: DashboardProposal) {
      this.proposals = [proposal, ...this.proposals];
    },
    reset() {
      this.uploadedFileName = "";
      this.uploadedFile = { name: "", size: 0, type: "" };
      this.trade = "Deck Builder";
      this.businessInfo = defaultBusinessInfo();
      this.lineItems = defaultLineItems();
      this.proposalOptions = defaultProposalOptions();
    },
  },
});
