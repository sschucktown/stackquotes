import { defineStore } from "pinia";

export interface ScheduledItem {
  id: string;
  projectId: string;
  clientName: string;
  projectName: string;
  optionLabel: string;
  startDate: string;
  depositDue: number;
  message: string | null;
  timestamp: string;
}

type SchedulePayload = Omit<ScheduledItem, "id" | "timestamp"> & { id?: string; timestamp?: string };

const STORAGE_KEY = "stackquotes:scheduling";

const loadFromStorage = (): ScheduledItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persist = (items: ScheduledItem[]) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore storage errors in prototype */
  }
};

export const useSchedulingStore = defineStore("schedulingStore", {
  state: () => ({
    items: loadFromStorage() as ScheduledItem[],
  }),
  actions: {
    scheduleJob(payload: SchedulePayload): ScheduledItem {
      const id = payload.id || `sched-${Date.now()}`;
      const timestamp = payload.timestamp || new Date().toISOString();
      const item: ScheduledItem = {
        id,
        timestamp,
        ...payload,
      };
      this.items.unshift(item);
      persist(this.items);
      return item;
    },
    getByProject(projectId: string) {
      return this.items.filter((item) => item.projectId === projectId);
    },
    clear() {
      this.items = [];
      persist(this.items);
    },
  },
});
