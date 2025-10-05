export type UUID = string;

export type EstimateStatus = "draft" | "sent" | "accepted" | "declined";

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
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

