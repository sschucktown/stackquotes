import { defineStore } from "pinia";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `draft-${Date.now()}`);

export const useProposalPrototype = defineStore("proposalPrototype", {
  state: () => ({
    draft: null as null | {
      id: string;
      jobId: string;
      jobName: string;
      lead: any;
      scope: string[];
      options: any;
      totals: { low: number; high: number; total: number };
      deposit: any;
      createdAt: string;
      status: "draft";
    },
  }),

  actions: {
    createDraftFromSmartProposal(payload: any) {
      this.draft = {
        id: uid(),
        jobId: payload?.jobId ?? "job-maple",
        jobName: payload?.jobName ?? "Maple St Deck",
        lead: payload?.lead ?? {},
        scope: payload?.scope ?? [],
        options: payload?.options ?? {},
        totals: payload?.totals ?? { low: 0, high: 0, total: 0 },
        deposit: payload?.deposit ?? { mode: "none", amount: 0 },
        createdAt: new Date().toISOString(),
        status: "draft",
      };
    },
  },
});
