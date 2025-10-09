import { defineStore } from "pinia";
import type { Estimate, EstimateFilters, EstimateTemplateKey } from "@stackquotes/types";
import {
  createEstimate,
  duplicateEstimate,
  fetchEstimates,
  updateEstimate,
} from "@modules/quickquote/api/estimates";
import type { EstimatePayload } from "@modules/quickquote/api/estimates";
import { generatePdf } from "@modules/quickquote/api/pdf";
import { sendEstimateEmail } from "@modules/quickquote/api/email";

export type EstimatePipelineStatus = Estimate["status"] | "seen";

interface EstimateState {
  items: Estimate[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: EstimatePipelineStatus;
    search?: string;
  };
  activePdfUrl: string | null;
}

const toPipelineStatus = (estimate: Estimate): EstimatePipelineStatus => {
  if (estimate.status === "sent" && estimate.viewedAt) {
    return "seen";
  }
  return estimate.status;
};

export const useEstimateStore = defineStore("estimates", {
  state: (): EstimateState => ({
    items: [],
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
          const key = toPipelineStatus(estimate);
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
      const { status, ...rest } = filters;
      const apiFilters: EstimateFilters = {
        ...rest,
        status: status && status !== "seen" ? status : undefined,
      };
      const { data, error } = await fetchEstimates(apiFilters);
      if (error) {
        this.error = error;
      } else if (data) {
        this.items =
          status === "seen"
            ? data.filter((estimate) => estimate.status === "sent" && Boolean(estimate.viewedAt))
            : data;
      }
      this.loading = false;
    },
    async create(payload: EstimatePayload) {
      this.error = null;
      const { data, error } = await createEstimate(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items.unshift(data);
      }
      return data;
    },
    async update(id: string, payload: Partial<EstimatePayload>) {
      this.error = null;
      const { data, error } = await updateEstimate(id, payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items = this.items.map((estimate) => (estimate.id === id ? data : estimate));
      }
      return data;
    },
    async duplicate(id: string) {
      const { data, error } = await duplicateEstimate(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items.unshift(data);
      }
      return data;
    },
    async createPdf(id: string) {
      const { data, error } = await generatePdf(id);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      this.activePdfUrl = data?.downloadUrl ?? null;
      return data;
    },
    async emailEstimate(payload: { estimateId: string; to: string; subject: string; message: string; downloadUrl?: string; template?: EstimateTemplateKey }) {
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
      return data;
    },
  },
});

