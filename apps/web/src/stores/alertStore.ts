import { defineStore } from "pinia";

type AlertTone = "info" | "success" | "warning" | "danger";

export type AlertItem = {
  id: string;
  text: string;
  tone: AlertTone;
};

export const useAlertStore = defineStore("alertStore", {
  state: () => ({
    alerts: [] as AlertItem[],
  }),
  actions: {
    addAlert(text: string, tone: AlertTone = "info") {
      this.alerts.unshift({
        id: `alert-${Date.now()}`,
        text,
        tone,
      });
    },
    clear() {
      this.alerts = [];
    },
  },
});
