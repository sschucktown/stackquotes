import { defineStore } from "pinia";

const STORAGE_KEY = "stackquotes:demo-mode";

const getInitialState = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
};

const persist = (active: boolean) => {
  if (typeof window === "undefined") return;
  if (active) {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } else {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
};

export const useDemoStore = defineStore("demo-mode", {
  state: () => ({
    active: getInitialState(),
  }),
  actions: {
    activate() {
      this.active = true;
      persist(true);
    },
    deactivate() {
      this.active = false;
      persist(false);
    },
    toggle(value?: boolean) {
      const next = value ?? !this.active;
      this.active = next;
      persist(next);
    },
  },
});

