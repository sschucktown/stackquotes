import type {
  Client,
  ContractorProfile,
  Estimate,
  LineItem,
  Proposal,
  ProposalOption,
  ProposalTotal,
  UserSettings,
} from "@stackquotes/types";

const now = () => new Date().toISOString();

const makeLineItem = (
  id: string,
  description: string,
  quantity: number,
  unitPrice: number
): LineItem => ({
  id,
  description,
  quantity,
  unitPrice,
  total: Math.round(quantity * unitPrice * 100) / 100,
});

const deckLineItems = [
  makeLineItem("li-pt-framing", "Pressure-treated framing", 1, 5500),
  makeLineItem("li-composite-boards", "Composite decking boards", 1, 6900),
  makeLineItem("li-aluminum-rail", "Aluminum railing system", 1, 2600),
  makeLineItem("li-permit", "Permit + inspection fee", 1, 300),
];

const lightingLineItems = [
  makeLineItem("li-lowvolt", "Low-voltage stair lighting", 1, 1750),
  makeLineItem("li-postcaps", "LED post cap lighting", 12, 89),
  makeLineItem("li-transformer", "Transformer + wiring kit", 1, 640),
];

const subtotal = (items: LineItem[]) =>
  Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;

const deckSubtotal = subtotal(deckLineItems);
const lightingSubtotal = subtotal(lightingLineItems);

export const demoClients: Client[] = [
  {
    id: "demo-client-1",
    userId: "demo-user",
    name: "Charleston Deck Pros",
    email: "client@deckpros.com",
    phone: "(843) 555-1881",
    address: "514 Mcenery Aly, Charleston, SC 29403",
    createdAt: now(),
  },
  {
    id: "demo-client-2",
    userId: "demo-user",
    name: "Kiawah Island Club",
    email: "projects@kiawahclub.com",
    phone: "(843) 555-7711",
    address: "343 Ocean Course Dr, Kiawah Island, SC 29455",
    createdAt: now(),
  },
];

const buildEstimate = (
  id: string,
  clientId: string,
  title: string,
  items: LineItem[],
  status: Estimate["status"],
  createdOffsetDays: number,
  taxRate = 0.07,
  notes?: string
): Estimate => {
  const createdAt = new Date(Date.now() - createdOffsetDays * 24 * 60 * 60 * 1000);
  const subtotalValue = subtotal(items);
  const taxValue = Math.round(subtotalValue * taxRate * 100) / 100;
  const totalValue = Math.round((subtotalValue + taxValue) * 100) / 100;
  return {
    id,
    userId: "demo-user",
    clientId,
    projectTitle: title,
    lineItems: items.map((item) => ({ ...item })),
    subtotal: subtotalValue,
    tax: taxValue,
    total: totalValue,
    notes,
    status,
    convertedToProposal: status === "accepted",
    jobId: null,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
    approvalToken: null,
    approvalTokenExpiresAt: null,
    approvedAt: status === "accepted" ? now() : null,
    approvedBy: status === "accepted" ? "demo-user" : null,
    viewedAt: null,
  };
};

export const demoEstimates: Estimate[] = [
  buildEstimate(
    "demo-estimate-1",
    "demo-client-1",
    "Charleston Deck Remodel",
    deckLineItems,
    "sent",
    9,
    0.07,
    "Includes teardown, framing, decking, and railing upgrades."
  ),
  buildEstimate(
    "demo-estimate-2",
    "demo-client-1",
    "Deck Lighting Upgrade",
    lightingLineItems,
    "accepted",
    4,
    0.07,
    "Low-voltage lighting package with transformer and dimmer."
  ),
  buildEstimate(
    "demo-estimate-3",
    "demo-client-2",
    "Oceanfront Boardwalk Refresh",
    [
      makeLineItem("li-boardwalk", "Ipe boardwalk resurfacing", 1, 8800),
      makeLineItem("li-handrail", "Marine-grade handrail system", 1, 5400),
      makeLineItem("li-misc", "Hardware & fasteners", 1, 950),
    ],
    "draft",
    2,
    0.07
  ),
];

export const demoSettings: UserSettings = {
  userId: "demo-user",
  defaultTaxRate: 0.07,
  footerText: "Charleston Deck Pros • Licensed • Insured",
  logoUrl: "https://dummyimage.com/160x160/2563eb/ffffff&text=SQ",
  companyName: "Charleston Deck Pros",
  orgId: null,
  accentColor: "#2563eb",
  estimateTemplate: "premium",
};

export const demoContractorProfile: ContractorProfile = {
  userId: "demo-user",
  businessName: "Charleston Deck Pros",
  ownerName: "Sam Builder",
  tradeType: "Decks & Outdoor Living",
  city: "Charleston",
  state: "SC",
  phone: "(843) 555-1024",
  email: "sam@charlestondeckpros.com",
  logoUrl: "https://dummyimage.com/160x160/2563eb/ffffff&text=SQ",
  createdAt: now(),
  updatedAt: now(),
};

const proposalMultiplier = [
  { name: "Good", coefficient: 0.85, summary: "Value-focused essentials to win price-sensitive clients." },
  { name: "Better", coefficient: 1, summary: "Balanced scope aligned with your QuickQuote baseline." },
  { name: "Best", coefficient: 1.2, summary: "Premium upgrade package for maximum client delight." },
];

const applyMultiplier = (items: LineItem[], coefficient: number): ProposalOption => {
  const lineItems = items.map((item) => {
    const unitCost = Math.round(item.unitPrice * coefficient * 100) / 100;
    const total = Math.round(unitCost * item.quantity * 100) / 100;
    return {
      description: item.description,
      quantity: item.quantity,
      unitCost,
      total,
    };
  });
  const subtotalValue = Math.round(lineItems.reduce((sum, entry) => sum + entry.total, 0) * 100) / 100;
  return {
    name: "",
    summary: "",
    lineItems,
    subtotal: subtotalValue,
    multiplier: coefficient,
  };
};

const buildProposalFromEstimate = (estimate: Estimate): Proposal => {
  const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const options: ProposalOption[] = proposalMultiplier.map((entry) => {
    const option = applyMultiplier(estimate.lineItems as LineItem[], entry.coefficient);
    return {
      ...option,
      name: entry.name,
      summary: entry.summary,
    };
  });
  const totals: ProposalTotal[] = options.map((option) => ({
    name: option.name,
    total: option.subtotal,
  }));
  return {
    id: `demo-proposal-${estimate.id}`,
    userId: "demo-user",
    quickquoteId: estimate.id,
    options,
    totals,
    status: estimate.status === "accepted" ? "Accepted" : "Generated",
    acceptedOption: estimate.status === "accepted" ? "Better" : null,
    createdAt,
  };
};

export const demoProposals: Proposal[] = [
  buildProposalFromEstimate(demoEstimates[0]),
  buildProposalFromEstimate(demoEstimates[1]),
];

export const cloneEstimate = (estimate: Estimate): Estimate =>
  JSON.parse(JSON.stringify(estimate)) as Estimate;

export const cloneClient = (client: Client): Client =>
  JSON.parse(JSON.stringify(client)) as Client;

export const cloneProposal = (proposal: Proposal): Proposal =>
  JSON.parse(JSON.stringify(proposal)) as Proposal;

export const cloneSettings = (settings: UserSettings): UserSettings =>
  JSON.parse(JSON.stringify(settings)) as UserSettings;

export const cloneProfile = (profile: ContractorProfile): ContractorProfile =>
  JSON.parse(JSON.stringify(profile)) as ContractorProfile;

