import { defineStore } from "pinia";
import type { Proposal } from "@stackquotes/types";
import {
  acceptProposalOption,
  fetchProposals,
  generateSmartProposal,
} from "../api/proposals";

const seedProposal: Proposal = {
  id: "seed-proposal-1",
  userId: "demo-user",
  quickquoteId: null,
  status: "Generated",
  acceptedOption: null,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  options: [
    {
      name: "Good",
      summary: "Value-focused essentials to win price-sensitive clients.",
      multiplier: 0.85,
      subtotal: 13005,
      lineItems: [
        { description: "Pressure-treated framing", quantity: 1, unitCost: 4675, total: 4675 },
        { description: "Composite decking boards", quantity: 1, unitCost: 5865, total: 5865 },
        { description: "Aluminum railing system", quantity: 1, unitCost: 2210, total: 2210 },
        { description: "Permit + inspection fee", quantity: 1, unitCost: 255, total: 255 },
      ],
    },
    {
      name: "Better",
      summary: "Balanced scope aligned with your QuickQuote baseline.",
      multiplier: 1,
      subtotal: 15300,
      lineItems: [
        { description: "Pressure-treated framing", quantity: 1, unitCost: 5500, total: 5500 },
        { description: "Composite decking boards", quantity: 1, unitCost: 6900, total: 6900 },
        { description: "Aluminum railing system", quantity: 1, unitCost: 2600, total: 2600 },
        { description: "Permit + inspection fee", quantity: 1, unitCost: 300, total: 300 },
      ],
    },
    {
      name: "Best",
      summary: "Premium upgrade package for maximum client delight.",
      multiplier: 1.2,
      subtotal: 18360,
      lineItems: [
        { description: "Pressure-treated framing", quantity: 1, unitCost: 6600, total: 6600 },
        { description: "Composite decking boards", quantity: 1, unitCost: 8280, total: 8280 },
        { description: "Aluminum railing system", quantity: 1, unitCost: 3120, total: 3120 },
        { description: "Permit + inspection fee", quantity: 1, unitCost: 360, total: 360 },
      ],
    },
  ],
  totals: [
    { name: "Good", total: 13005 },
    { name: "Better", total: 15300 },
    { name: "Best", total: 18360 },
  ],
};

interface ProposalState {
  items: Proposal[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  lastGeneratedId: string | null;
}

export const useProposalStore = defineStore("proposals", {
  state: (): ProposalState => ({
    items: [],
    loading: false,
    generating: false,
    error: null,
    lastGeneratedId: null,
  }),
  getters: {
    hasData(state): boolean {
      return state.items.length > 0;
    },
    latest(state): Proposal | null {
      return state.items[0] ?? null;
    },
    fallback(): Proposal[] {
      return [seedProposal];
    },
  },
  actions: {
    upsert(proposal: Proposal) {
      const index = this.items.findIndex((item) => item.id === proposal.id);
      if (index >= 0) {
        this.items.splice(index, 1, proposal);
      } else {
        this.items.unshift(proposal);
      }
    },
    async load(params?: { limit?: number }) {
      this.loading = true;
      this.error = null;
      const response = await fetchProposals(params);
      if (response.error) {
        this.error = response.error;
        this.items = [];
      } else {
        this.items = response.data ?? [];
      }
      this.loading = false;
    },
    async generate(estimateId: string) {
      this.generating = true;
      this.error = null;
      try {
        const response = await generateSmartProposal(estimateId);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.upsert(response.data);
          if (!response.meta?.alreadyExists) {
            this.lastGeneratedId = response.data.id;
          }
        }
        return response.data ?? null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Unable to generate SmartProposal.";
        throw error;
      } finally {
        this.generating = false;
      }
    },
    async markAccepted(proposalId: string, optionName: string) {
      this.error = null;
      const response = await acceptProposalOption(proposalId, optionName);
      if (response.error) {
        this.error = response.error;
        throw new Error(response.error);
      }
      if (response.data) {
        this.upsert(response.data);
      }
      return response.data ?? null;
    },
  },
});

