import { defineStore } from "pinia";
import type {
  Estimate,
  LineItem,
  Proposal,
  ProposalDepositConfig,
  ProposalOption,
} from "@stackquotes/types";
import {
  acceptProposalOption,
  fetchProposal,
  fetchPreviousLineItems,
  fetchProposals,
  generateSmartProposal,
  saveProposal,
  sendProposal,
  type ProposalSavePayload,
  type ProposalSendPayload,
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

const DEFAULT_DEPOSIT: ProposalDepositConfig = { type: "percentage", value: 30 };

const generateDemoProposalId = () =>
  `demo-proposal-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const buildProposalOptions = (lineItems: LineItem[]): ProposalOption[] =>
  PROPOSAL_PRESETS.map((preset) => {
    const mapped = lineItems.map((item) => {
      const unitCost = roundCurrency(item.unitPrice * preset.factor);
      const total = roundCurrency(unitCost * item.quantity);
      return {
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        unitCost,
        total,
      };
    });
    const subtotal = roundCurrency(mapped.reduce((sum, entry) => sum + entry.total, 0));
    return {
      name: preset.name,
      summary: preset.summary,
      lineItems: mapped,
      subtotal,
      multiplier: preset.factor,
    };
  });

const computeDepositAmount = (
  options: ProposalOption[],
  deposit: ProposalDepositConfig
): number => {
  if (deposit.type === "fixed") {
    return roundCurrency(deposit.value);
  }
  const baseOption =
    options.find((option) => option.name?.toLowerCase() === "better") ?? options[0] ?? null;
  if (!baseOption) return 0;
  return roundCurrency(baseOption.subtotal * (deposit.value / 100));
};

interface ProposalState {
  items: Proposal[];
  demoItems: Proposal[] | null;
  loading: boolean;
  generating: boolean;
  saving: boolean;
  sending: boolean;
  error: string | null;
  selectedId: string | null;
  lastGeneratedId: string | null;
}

export const useProposalStore = defineStore("proposals", {
  state: (): ProposalState => ({
    items: [],
    demoItems: null,
    loading: false,
    generating: false,
    saving: false,
    sending: false,
    error: null,
    selectedId: null,
    lastGeneratedId: null,
  }),
  getters: {
    hasData(state): boolean {
      return state.items.length > 0;
    },
    latest(state): Proposal | null {
      return state.items[0] ?? null;
    },
    current(state): Proposal | null {
      if (!state.selectedId) return null;
      return state.items.find((item) => item.id === state.selectedId) ?? null;
    },
    fallback(): Proposal[] {
      return demoProposals.map((proposal) => cloneProposal(proposal));
    },
  },
  actions: {
    setSelected(id: string | null) {
      this.selectedId = id;
    },
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
        if (!this.selectedId && this.items.length) {
          this.selectedId = this.items[0].id;
        }
        return;
      }
      this.demoItems = null;
      const response = await fetchProposals(params);
      if (response.error) {
        this.error = response.error;
        this.items = [];
      } else {
        this.items = response.data ?? [];
        if (!this.selectedId && this.items.length) {
          this.selectedId = this.items[0].id;
        }
      }
      this.loading = false;
    },
    async fetchById(id: string) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoProposals.map((proposal) => cloneProposal(proposal));
        }
        return this.demoItems.find((proposal) => proposal.id === id) ?? null;
      }
      const response = await fetchProposal(id);
      if (response.error) {
        this.error = response.error;
        return null;
      }
      if (response.data) {
        this.upsert(response.data);
      }
      return response.data ?? null;
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
            this.selectedId = existing.id;
            return cloneProposal(existing);
          }
          const estimate = sourceEstimate ?? null;
          if (!estimate) {
            throw new Error("Estimate data unavailable for demo generation");
          }
          const options = buildProposalOptions(estimate.lineItems as LineItem[]);
          const proposal: Proposal = {
            id: generateDemoProposalId(),
            userId: "demo-user",
            clientId: estimate.clientId,
            quickquoteId: estimateId,
            title: `${estimate.projectTitle} SmartProposal`,
            description: estimate.notes ?? null,
            options,
            totals: options.map((option) => ({ name: option.name, total: option.subtotal })),
            status: "draft",
            depositAmount: computeDepositAmount(options, DEFAULT_DEPOSIT),
            depositType: DEFAULT_DEPOSIT.type,
            depositValue: DEFAULT_DEPOSIT.value,
            depositConfig: DEFAULT_DEPOSIT,
            publicToken: null,
            sentAt: null,
            paymentLinkUrl: null,
            paymentLinkId: null,
            acceptedOption: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          this.upsert(proposal);
          this.lastGeneratedId = proposal.id;
          this.selectedId = proposal.id;
          return cloneProposal(proposal);
        }
        const response = await generateSmartProposal(estimateId);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.upsert(response.data);
          if (response.meta?.created !== false) {
            this.lastGeneratedId = response.data.id;
            this.selectedId = response.data.id;
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
    async save(payload: ProposalSavePayload) {
      this.saving = true;
      this.error = null;
      try {
        const demo = useDemoStore();
        if (demo.active) {
          const targetId = payload.id ?? generateDemoProposalId();
          const existingIndex = this.demoItems?.findIndex((proposal) => proposal.id === targetId) ?? -1;
          const base: Proposal = existingIndex >= 0 && this.demoItems ? cloneProposal(this.demoItems[existingIndex]) : {
            id: targetId,
            userId: "demo-user",
            clientId: payload.clientId,
            quickquoteId: payload.quickquoteId ?? null,
            title: payload.title,
            description: payload.description ?? null,
            options: payload.options,
            totals: payload.options.map((option) => ({ name: option.name, total: option.subtotal })),
            status: "draft",
            depositAmount: null,
            depositType: payload.deposit?.type ?? DEFAULT_DEPOSIT.type,
            depositValue: payload.deposit?.value ?? DEFAULT_DEPOSIT.value,
            depositConfig: payload.deposit ?? DEFAULT_DEPOSIT,
            publicToken: null,
            sentAt: null,
            paymentLinkUrl: null,
            paymentLinkId: null,
            acceptedOption: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          base.title = payload.title;
          base.description = payload.description ?? null;
          base.options = payload.options;
          base.totals = payload.options.map((option) => ({ name: option.name, total: option.subtotal }));
          base.depositConfig = payload.deposit ?? DEFAULT_DEPOSIT;
          base.depositType = base.depositConfig.type;
          base.depositValue = base.depositConfig.value;
          base.depositAmount = computeDepositAmount(base.options, base.depositConfig);
          if (this.demoItems) {
            if (existingIndex >= 0) {
              this.demoItems.splice(existingIndex, 1, cloneProposal(base));
            } else {
              this.demoItems.unshift(cloneProposal(base));
            }
          }
          this.upsert(base);
          this.selectedId = base.id;
          return cloneProposal(base);
        }
        const response = await saveProposal(payload);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.upsert(response.data);
          this.selectedId = response.data.id;
        }
        return response.data ?? null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Unable to save proposal.";
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async send(payload: ProposalSendPayload) {
      this.sending = true;
      this.error = null;
      try {
        const demo = useDemoStore();
        if (demo.active) {
          const target = this.items.find((proposal) => proposal.id === payload.id);
          if (!target) {
            throw new Error("Proposal not found");
          }
          target.status = "sent";
          target.sentAt = new Date().toISOString();
          this.upsert(cloneProposal(target));
          return cloneProposal(target);
        }
        const response = await sendProposal(payload);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.upsert(response.data);
          this.selectedId = response.data.id;
        }
        return response.data ?? null;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "Unable to send proposal.";
        throw error;
      } finally {
        this.sending = false;
      }
    },
    async loadPreviousLineItems(clientId: string) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoProposals.map((proposal) => cloneProposal(proposal));
        }
        const [previous] = this.demoItems.filter((proposal) => proposal.clientId === clientId);
        if (!previous) return null;
        return {
          options: cloneProposal(previous).options,
          deposit: previous.depositConfig ?? DEFAULT_DEPOSIT,
        };
      }
      const response = await fetchPreviousLineItems(clientId);
      if (response.error) {
        this.error = response.error;
        return null;
      }
      return response.data ?? null;
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
        target.status = "accepted";
        target.acceptedOption = optionName;
        target.updatedAt = new Date().toISOString();
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
        this.selectedId = response.data.id;
      }
      return response.data ?? null;
    },
  },
});

