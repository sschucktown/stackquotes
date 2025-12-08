import { defineStore } from "pinia";

type ApprovalEvent = {
  id: string;
  projectId: string;
  optionLabel: string;
  reviewed: boolean;
};

export const useApprovalEventStore = defineStore("approvalEventStore", {
  state: () => ({
    events: [] as ApprovalEvent[],
  }),
  actions: {
    upsertEvent(event: ApprovalEvent) {
      const existing = this.events.find((e) => e.id === event.id);
      if (existing) {
        Object.assign(existing, event);
      } else {
        this.events.push(event);
      }
    },
    markReviewed(id: string) {
      const event = this.events.find((e) => e.id === id);
      if (event) {
        event.reviewed = true;
      }
    },
    getByProject(projectId: string) {
      return this.events.filter((e) => e.projectId === projectId);
    },
  },
});
