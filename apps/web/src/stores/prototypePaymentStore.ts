import { defineStore } from "pinia";

type PaymentState = {
  paidById: Record<string, boolean>;
};

const STORAGE_KEY = "stackquotes:prototype:deposit-paid";
const baseState = (): PaymentState => ({
  paidById: {
    "job-maple": false,
    "p-001": false,
  },
});

const loadState = (): PaymentState => {
  if (typeof window === "undefined") return baseState();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return baseState();
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.paidById) {
      return {
        paidById: { ...baseState().paidById, ...parsed.paidById },
      };
    }
  } catch {
    /* ignore storage read errors in prototype */
  }
  return baseState();
};

const persist = (state: PaymentState) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore storage write errors in prototype */
  }
};

export const usePrototypePaymentStore = defineStore("prototypePaymentStore", {
  state: (): PaymentState => loadState(),
  getters: {
    isPaid: (state) => (id?: string) => {
      if (!id) return false;
      return Boolean(state.paidById[id]);
    },
  },
  actions: {
    markPaid(ids: string | string[], paid = true) {
      const list = Array.isArray(ids) ? ids : [ids];
      list.forEach((id) => {
        if (!id) return;
        this.paidById[id] = paid;
      });
      persist(this.$state);
    },
    reset(ids?: string | string[]) {
      if (!ids) {
        this.paidById = baseState().paidById;
      } else {
        const list = Array.isArray(ids) ? ids : [ids];
        list.forEach((id) => {
          if (!id) return;
          this.paidById[id] = false;
        });
      }
      persist(this.$state);
    },
  },
});
