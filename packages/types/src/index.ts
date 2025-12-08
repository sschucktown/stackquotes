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
  id?: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface ProposalOptionVisual {
  abstract_key: string;
  custom_image_url?: string | null;
  accent_key?: string | null;
}

export interface ProposalOption {
  name: string;
  summary?: string | null;
  lineItems: ProposalOptionLineItem[];
  subtotal: number;
  multiplier?: number | null;
  visual?: ProposalOptionVisual | null;
}

export interface ProposalTotal {
  name: string;
  total: number;
}

export type ProposalStatus = "draft" | "sent" | "accepted" | "paid";

export type ProposalDepositType = "percentage" | "fixed";

export interface ProposalDepositConfig {
  type: ProposalDepositType;
  value: number;
}

export type KickoffStatus = "pending" | "sent" | "viewed" | "acknowledged";

export interface KickoffDetails {
  arrivalWindow: string | null;
  leadName: string | null;
  leadPhone: string | null;
  materialNotes: string | null;
  accessNotes: string | null;
  attachments?: string[] | null;
}

export interface Proposal {
  id: UUID;
  userId: UUID;
  clientId: UUID;
  quickquoteId: UUID | null;
  options: ProposalOption[];
  totals: ProposalTotal[];
  title: string;
  description?: string | null;
  status: ProposalStatus | string;
  depositAmount?: number | null;
  depositType?: ProposalDepositType | null;
  depositValue?: number | null;
  depositConfig?: ProposalDepositConfig | null;
  publicToken?: UUID | null;
  sentAt?: string | null;
  paymentLinkUrl?: string | null;
  paymentLinkId?: string | null;
  updatedAt: string;
  acceptedOption?: string | null;
  createdAt: string;
  kickoffStatus?: KickoffStatus | null;
  kickoffDetails?: KickoffDetails | null;
  kickoffSentAt?: string | null;
  kickoffViewedAt?: string | null;
  crewArrivalWindow?: string | null;
  crewLeadName?: string | null;
  crewLeadPhone?: string | null;
  materialsDropNotes?: string | null;
  accessNotes?: string | null;
}

export interface ContractorProfile {
  userId: UUID;
  businessName?: string | null;
  ownerName?: string | null;
  tradeType?: string | null;
  trade?: string | null;
  averageProjectSize?: string | null;
  postalCode?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  publicSlug?: string | null;
  tradeSeeded?: boolean | null;
  stripeAccountId?: string | null;
  stripeAccountStatus?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProposalTemplate {
  id: UUID;
  userId: UUID;
  userProjectId: UUID | null;
  trade: string;
  projectName: string;
  tier: string;
  lineItems: ProposalOptionLineItem[];
  totalPrice?: number | null;
  createdAt: string;
}

export interface UserProjectTemplate {
  id: UUID;
  userId: UUID;
  trade: string;
  tradeProjectId?: UUID | null;
  projectName: string;
  description?: string | null;
  basePrice?: number | null;
  createdAt: string;
  proposals: UserProposalTemplate[];
}

export interface ProposalSummaryMetrics {
  totalProposals: number;
  acceptedProposals: number;
  acceptanceRate: number;
  averageValue: number;
  revenueYtd: number;
}

export type SubscriptionPlanTier = "launch" | "pro" | "crew";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "incomplete"
  | "canceled"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | "pending";

export interface SubscriptionRecord {
  id: UUID;
  userId: UUID;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  planTier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type PaymentType = "deposit" | "upsell" | "installment";

export interface PaymentRecord {
  id: UUID;
  contractorId: UUID;
  proposalId: UUID | null;
  stripePaymentIntentId?: string | null;
  amount: number;
  type: PaymentType;
  status: string;
  feePercent?: number | null;
  isMilestone?: boolean;
  isFinanced?: boolean;
  paymentStatus?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

