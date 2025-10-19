import { defineStore } from "pinia";
import type { Estimate, LineItem, Proposal, ProposalOption, ProposalTotal } from "@stackquotes/types";
import {
  acceptProposalOption,
  fetchProposals,
  generateSmartProposal,
} from "../api/proposals";
import { useDemoStore } from "@/stores/demoStore";
import { demoProposals, cloneProposal } from "@/data/demo";

const PROPOSAL_PRESETS = [
  {
    name: "Good",
    factor: 0.85,
    summary: "Value-focused essentials to win price-sensitive clients.",
  },
  {
    name: "Better",
    factor: 1,
    summary: "Balanced scope aligned with your QuickQuote baseline.",
  },
  {
    name: "Best",
    factor: 1.2,
    summary: "Premium upgrade package for maximum client delight.",
  },
];

const generateDemoProposalId = () =>
  `demo-proposal-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

const buildProposalOptions = (lineItems: LineItem[]): ProposalOption[] =>
  PROPOSAL_PRESETS.map((preset) => {
    const mapped = lineItems.map((item) => {
      const unitCost = Math.round(item.unitPrice * preset.factor * 100) / 100;
      const total = Math.round(unitCost * item.quantity * 100) / 100;
      return {
        description: item.description,
        quantity: item.quantity,
        unitCost,
        total,
      };
    });
    const subtotal = Math.round(mapped.reduce((sum, entry) => sum + entry.total, 0) * 100) / 100;
    return {
      name: preset.name,
      summary: preset.summary,
      lineItems: mapped,
      subtotal,
      multiplier: preset.factor,
    };
  });

const buildProposalTotals = (options: ProposalOption[]): ProposalTotal[] =>
  options.map((option) => ({ name: option.name, total: option.subtotal }));

interface ProposalState {
  items: Proposal[];
  demoItems: Proposal[] | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  lastGeneratedId: string | null;
}

export const useProposalStore = defineStore("proposals", {
  state: (): ProposalState => ({
    items: [],
    demoItems: null,
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
      return demoProposals.map((proposal) => cloneProposal(proposal));
    },
  },
  actions: {
    upsert(proposal: Proposal) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoProposals.map((item) => cloneProposal(item));
        }
        const demoIndex = this.demoItems.findIndex((item) => item.id === proposal.id);
        if (demoIndex >= 0) {
          this.demoItems.splice(demoIndex, 1, cloneProposal(proposal));
        } else {
          this.demoItems.unshift(cloneProposal(proposal));
        }
      }
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
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoProposals.map((proposal) => cloneProposal(proposal));
        }
        this.items = (this.demoItems ?? []).map((proposal) => cloneProposal(proposal));
        this.loading = false;
        return;
      }
      this.demoItems = null;
      const response = await fetchProposals(params);
      if (response.error) {
        this.error = response.error;
        this.items = [];
      } else {
        this.items = response.data ?? [];
      }
      this.loading = false;
    },
    async generate(estimateId: string, sourceEstimate?: Estimate | null) {
      this.generating = true;
      this.error = null;
      try {
        const demo = useDemoStore();
        if (demo.active) {
          if (!this.demoItems) {
            this.demoItems = demoProposals.map((proposal) => cloneProposal(proposal));
          }
          const existing = this.demoItems.find((proposal) => proposal.quickquoteId === estimateId);
          if (existing) {
            this.upsert(existing);
            this.lastGeneratedId = existing.id;
            return cloneProposal(existing);
          }
          const estimate = sourceEstimate ?? null;
          if (!estimate) {
            throw new Error("Estimate data unavailable for demo generation");
          }
          const options = buildProposalOptions(estimate.lineItems as LineItem[]);
          const totals = buildProposalTotals(options);
          const proposal: Proposal = {
            id: generateDemoProposalId(),
            userId: "demo-user",
            quickquoteId: estimateId,
            options,
            totals,
            status: "Generated",
            acceptedOption: null,
            createdAt: new Date().toISOString(),
          };
          this.upsert(proposal);
          this.lastGeneratedId = proposal.id;
          return cloneProposal(proposal);
        }
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
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoProposals.map((proposal) => cloneProposal(proposal));
        }
        const target = this.demoItems.find((proposal) => proposal.id === proposalId);
        if (!target) {
          throw new Error("Proposal not found");
        }
        target.status = "Accepted";
        target.acceptedOption = optionName;
        this.upsert(target);
        return cloneProposal(target);
      }
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
