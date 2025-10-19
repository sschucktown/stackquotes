export type UUID = string;

export type EstimateStatus = "draft" | "sent" | "seen" | "accepted" | "declined";

export type EstimateTemplateKey = "modern" | "premium" | "classic";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  cost?: number | null;
}

export interface Estimate {
  id: UUID;
  userId: UUID;
  clientId: UUID;
  projectTitle: string;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  status: EstimateStatus;
  convertedToProposal: boolean;
  jobId?: string | null;
  createdAt: string;
  updatedAt: string;
  approvalToken?: string | null;
  approvalTokenExpiresAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  viewedAt?: string | null;
}

export interface Client {
  id: UUID;
  userId: UUID;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface UserSettings {
  userId: UUID;
  defaultTaxRate: number;
  footerText?: string;
  logoUrl?: string;
  companyName?: string;
  orgId?: string | null;
  accentColor?: string | null;
  estimateTemplate?: EstimateTemplateKey;
}

export interface EstimateFilters {
  status?: EstimateStatus;
  search?: string;
}

export interface PdfPayload {
  estimateId: UUID;
  downloadUrl: string;
}

export interface EmailPayload {
  estimateId: UUID;
  to: string;
  subject: string;
  message: string;
  downloadUrl?: string;
  template?: EstimateTemplateKey;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PublicEstimatePayload {
  estimate: Estimate;
  client: Client;
  settings: UserSettings | null;
  downloadUrl?: string | null;
}

export interface ProposalEvent {
  id: UUID;
  userId: UUID;
  estimateId: UUID;
  event: string;
  token?: UUID | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProposalOptionLineItem {
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface ProposalOption {
  name: string;
  summary?: string | null;
  lineItems: ProposalOptionLineItem[];
  subtotal: number;
  multiplier?: number | null;
}

export interface ProposalTotal {
  name: string;
  total: number;
}

export interface Proposal {
  id: UUID;
  userId: UUID;
  quickquoteId: UUID | null;
  options: ProposalOption[];
  totals: ProposalTotal[];
  status: string;
  acceptedOption?: string | null;
  createdAt: string;
}

export interface ContractorProfile {
  userId: UUID;
  businessName?: string | null;
  ownerName?: string | null;
  tradeType?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  publicSlug?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ProposalSummaryMetrics {
  totalProposals: number;
  acceptedProposals: number;
  acceptanceRate: number;
  averageValue: number;
  revenueYtd: number;
}

