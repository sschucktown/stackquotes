import { defineStore } from "pinia";
import type { Estimate, EstimateFilters, EstimateTemplateKey } from "@stackquotes/types";
import {
  acceptEstimate,
  createEstimate,
  declineEstimate,
  duplicateEstimate,
  fetchEstimates,
  updateEstimate,
} from "@modules/quickquote/api/estimates";
import type { EstimatePayload } from "@modules/quickquote/api/estimates";
import { generatePdf } from "@modules/quickquote/api/pdf";
import { sendEstimateEmail } from "@modules/quickquote/api/email";
import { derivePipelineStatus } from "../utils/status";

export type EstimatePipelineStatus = Estimate["status"];

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
      void this.reload();
      return data;
    },
    async markAccepted(id: string) {
      this.error = null;
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
    async reload() {
      const filters = { ...this.filters };
      await this.load(filters);
    },
  },
});

