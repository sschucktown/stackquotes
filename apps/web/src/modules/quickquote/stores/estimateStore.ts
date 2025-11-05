import { defineStore } from "pinia";
import type { Estimate, EstimateFilters, EstimateTemplateKey, LineItem } from "@stackquotes/types";
import {
  acceptEstimate,
  createEstimate,
  declineEstimate,
  duplicateEstimate,
  fetchEstimates,
  updateEstimate,
} from "@modules/quickquote/api/estimates";
import { deleteEstimate as apiDeleteEstimate } from "@modules/quickquote/api/estimates";
import type { EstimatePayload } from "@modules/quickquote/api/estimates";
import { generatePdf } from "@modules/quickquote/api/pdf";
import { sendEstimateEmail } from "@modules/quickquote/api/email";
import { derivePipelineStatus } from "../utils/status";
import { useDemoStore } from "@/stores/demoStore";
import { demoEstimates, cloneEstimate } from "@/data/demo";
import { useProposalStore } from "@modules/proposals/stores/proposalStore";

const DEFAULT_DEMO_TAX_RATE = 0.07;
const DEMO_PDF_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const generateDemoId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

const cloneLineItems = (lineItems: LineItem[]): LineItem[] =>
  lineItems.map((item) => ({ ...item }));

const calculateTotals = (
  lineItems: LineItem[],
  taxRate: number
): { subtotal: number; tax: number; total: number } => {
  const subtotal = Math.round(
    lineItems.reduce((sum, item) => sum + Number(item.total ?? item.quantity * item.unitPrice), 0) * 100
  ) / 100;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
};

const applyFilters = (
  estimates: Estimate[],
  filters: { status?: EstimatePipelineStatus; search?: string }
): Estimate[] => {
  const { status, search } = filters;
  let result = estimates.slice();
  if (status) {
    result = result.filter((estimate) => derivePipelineStatus(estimate) === status);
  }
  if (search) {
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter((estimate) => {
        const project = estimate.projectTitle?.toLowerCase() ?? "";
        const notes = estimate.notes?.toLowerCase() ?? "";
        return project.includes(term) || notes.includes(term);
      });
    }
  }
  return result;
};

export type EstimatePipelineStatus = Estimate["status"];

interface EstimateState {
  items: Estimate[];
  demoItems: Estimate[] | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: EstimatePipelineStatus;
    search?: string;
  };
  activePdfUrl: string | null;
}

export const useEstimateStore = defineStore("estimates", {
  state: (): EstimateState => ({
    items: [],
    demoItems: null,
    loading: false,
    error: null,
    filters: {},
    activePdfUrl: null,
  }),
  getters: {
    groupedByStatus(state) {
      return state.items.reduce<
        Record<EstimatePipelineStatus, Estimate[]>
      >(
        (acc, estimate) => {
          const key = derivePipelineStatus(estimate);
          (acc[key] ??= []).push(estimate);
          return acc;
        },
        { draft: [], sent: [], seen: [], accepted: [], declined: [] }
      );
    },
    getById: (state) => (id: string) => state.items.find((estimate) => estimate.id === id) ?? null,
  },
  actions: {
    async load(filters: { status?: EstimatePipelineStatus; search?: string } = {}) {
      this.loading = true;
      this.error = null;
      this.filters = filters;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        this.items = applyFilters(this.demoItems ?? [], filters);
        this.loading = false;
        return;
      }
      this.demoItems = null;
      const { status, ...rest } = filters;
      const apiFilters: EstimateFilters = {
        ...rest,
        status,
      };
      const { data, error } = await fetchEstimates(apiFilters);
      if (error) {
        this.error = error;
      } else if (data) {
        this.items =
          status === "seen"
            ? data.filter((estimate) => derivePipelineStatus(estimate) === "seen")
            : data;
      }
      this.loading = false;
    },
    async create(payload: EstimatePayload) {
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const taxRate = payload.taxRate ?? DEFAULT_DEMO_TAX_RATE;
        const lineItems = cloneLineItems(payload.lineItems);
        const { subtotal, tax, total } = calculateTotals(lineItems, taxRate);
        const nowIso = new Date().toISOString();
        const estimate: Estimate = {
          id: generateDemoId("demo-estimate"),
          userId: "demo-user",
          clientId: payload.clientId,
          projectTitle: payload.projectTitle,
          lineItems,
          subtotal,
          tax,
          total,
          notes: payload.notes,
          status: payload.status ?? "draft",
          convertedToProposal: false,
          jobId: payload.jobId ?? null,
          createdAt: nowIso,
          updatedAt: nowIso,
          approvalToken: null,
          approvalTokenExpiresAt: null,
          approvedAt: null,
          approvedBy: null,
          viewedAt: null,
        };
        this.demoItems.unshift(estimate);
        this.items = applyFilters(this.demoItems, this.filters);
        return cloneEstimate(estimate);
      }
      const { data, error } = await createEstimate(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items.unshift(data);
      }
      void this.reload();
      return data;
    },
    async update(id: string, payload: Partial<EstimatePayload>) {
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const target = this.demoItems.find((estimate) => estimate.id === id);
        if (!target) {
          throw new Error("Estimate not found");
        }
        if (payload.lineItems) {
          const lineItems = cloneLineItems(payload.lineItems);
          const taxRate = payload.taxRate ?? DEFAULT_DEMO_TAX_RATE;
          const { subtotal, tax, total } = calculateTotals(lineItems, taxRate);
          target.lineItems = lineItems;
          target.subtotal = subtotal;
          target.tax = tax;
          target.total = total;
        }
        if (payload.projectTitle !== undefined) {
          target.projectTitle = payload.projectTitle ?? target.projectTitle;
        }
        if (payload.clientId) {
          target.clientId = payload.clientId;
        }
        if (payload.notes !== undefined) {
          target.notes = payload.notes ?? undefined;
        }
        if (payload.status) {
          target.status = payload.status;
        }
        if (payload.jobId !== undefined) {
          target.jobId = payload.jobId ?? null;
        }
        target.updatedAt = new Date().toISOString();
        this.items = applyFilters(this.demoItems, this.filters);
        return cloneEstimate(target);
      }
      const { data, error } = await updateEstimate(id, payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items = this.items.map((estimate) => (estimate.id === id ? data : estimate));
      }
      void this.reload();
      return data;
    },
    async duplicate(id: string) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const source = this.demoItems.find((estimate) => estimate.id === id);
        if (!source) {
          throw new Error("Estimate not found");
        }
        const nowIso = new Date().toISOString();
        const duplicated: Estimate = {
          ...cloneEstimate(source),
          id: generateDemoId("demo-estimate"),
          projectTitle: `${source.projectTitle} (Copy)`,
          status: "draft",
          convertedToProposal: false,
          createdAt: nowIso,
          updatedAt: nowIso,
          approvedAt: null,
          approvedBy: null,
          approvalToken: null,
          approvalTokenExpiresAt: null,
        };
        this.demoItems.unshift(duplicated);
        this.items = applyFilters(this.demoItems, this.filters);
        return cloneEstimate(duplicated);
      }
      const { data, error } = await duplicateEstimate(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items.unshift(data);
      }
      void this.reload();
      return data;
    },
    async createPdf(id: string) {
      const demo = useDemoStore();
      if (demo.active) {
        this.activePdfUrl = DEMO_PDF_URL;
        return { downloadUrl: DEMO_PDF_URL };
      }
      const { data, error } = await generatePdf(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      this.activePdfUrl = data?.downloadUrl ?? null;
      return data;
    },
    async emailEstimate(payload: { estimateId: string; to: string; subject: string; message: string; downloadUrl?: string; template?: EstimateTemplateKey }) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const target = this.demoItems.find((estimate) => estimate.id === payload.estimateId);
        if (target) {
          target.status = "sent";
          target.updatedAt = new Date().toISOString();
        }
        this.items = applyFilters(this.demoItems ?? [], this.filters);
        return {
          sent: true,
          status: "sent",
          template: payload.template ?? "modern",
          approvalUrl: "https://stackquotes.vercel.app/demo/approval",
        };
      }
      const { data, error } = await sendEstimateEmail(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data?.status) {
        this.items = this.items.map((estimate) =>
          estimate.id === payload.estimateId ? { ...estimate, status: data.status } : estimate
        );
      }
      void this.reload();
      return data;
    },
    async markAccepted(id: string) {
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const target = this.demoItems.find((estimate) => estimate.id === id);
        if (!target) {
          throw new Error("Estimate not found");
        }
        const nowIso = new Date().toISOString();
        target.status = "accepted";
        target.approvedAt = nowIso;
        target.approvedBy = "demo-user";
        target.convertedToProposal = true;
        target.updatedAt = nowIso;
        this.items = applyFilters(this.demoItems, this.filters);
        const proposalStore = useProposalStore();
        await proposalStore.generate(id, target);
        return cloneEstimate(target);
      }
      const { data, error } = await acceptEstimate(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items = this.items.map((estimate) => (estimate.id === id ? data : estimate));
      }
      await this.reload();
      return data;
    },
    async markDeclined(id: string) {
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const target = this.demoItems.find((estimate) => estimate.id === id);
        if (!target) {
          throw new Error("Estimate not found");
        }
        target.status = "declined";
        target.approvedAt = null;
        target.approvedBy = null;
        target.convertedToProposal = false;
        target.updatedAt = new Date().toISOString();
        this.items = applyFilters(this.demoItems, this.filters);
        return cloneEstimate(target);
      }
      const { data, error } = await declineEstimate(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items = this.items.map((estimate) => (estimate.id === id ? data : estimate));
      }
      await this.reload();
      return data;
    },
    async remove(id: string) {
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoEstimates.map((estimate) => cloneEstimate(estimate));
        }
        const idx = this.demoItems.findIndex((e) => e.id === id);
        if (idx === -1) throw new Error("Estimate not found");
        if (derivePipelineStatus(this.demoItems[idx]) !== "draft") {
          throw new Error("Only draft estimates can be deleted");
        }
        this.demoItems.splice(idx, 1);
        this.items = applyFilters(this.demoItems, this.filters);
        return { ok: true } as any;
      }
      const { data, error } = await apiDeleteEstimate(id);
      if ((error as any)) {
        this.error = error as any;
        throw new Error(error as any);
      }
      await this.reload();
      return data ?? ({ ok: true } as any);
    },
    async reload() {
      const filters = { ...this.filters };
      await this.load(filters);
    },
  },
});

