import { defineStore } from "pinia";
import router from "@/router";

type Status = "pending" | "confirmed" | "requested-change";

type State = {
  proposedDate: string | null;
  depositDue: number | null;
  contractorMessage: string | null;
  status: Status;
};

const STORAGE_KEY = "stackquotes:client-schedule-prototype";

const loadState = (): State => {
  if (typeof window === "undefined") {
    return {
      proposedDate: "2025-12-13",
      depositDue: 3570,
      contractorMessage: "Let me know if this date works for you — excited to get started!",
      status: "pending",
    };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return {
    proposedDate: "2025-12-13",
    depositDue: 3570,
    contractorMessage: "Let me know if this date works for you — excited to get started!",
    status: "pending",
  };
};

const persist = (state: State) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
};

export const useClientSchedulePrototype = defineStore("clientSchedulePrototype", {
  state: (): State => loadState(),
  actions: {
    setProposal(data: { proposedDate: string; depositDue: number; contractorMessage?: string | null }) {
      this.proposedDate = data.proposedDate;
      this.depositDue = data.depositDue;
      this.contractorMessage = data.contractorMessage || null;
      this.status = "pending";
      persist(this.$state);
    },
    confirmSchedule() {
      this.status = "confirmed";
      persist(this.$state);
      router.push("/prototype/client/schedule/confirmed");
    },
    requestNewDate() {
      this.status = "requested-change";
      persist(this.$state);
      router.push("/prototype/client/schedule/requested-change");
    },
  },
});
