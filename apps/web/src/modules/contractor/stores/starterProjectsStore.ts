import { defineStore } from "pinia";
import type { UserProjectTemplate } from "@stackquotes/types";
import { fetchStarterProjects } from "../api/projects";
import { useDemoStore } from "@/stores/demoStore";

interface StarterProjectsState {
  items: UserProjectTemplate[];
  loading: boolean;
  error: string | null;
}

export const useStarterProjectsStore = defineStore("starter-projects", {
  state: (): StarterProjectsState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async load(force = false) {
      if (this.items.length && !force) return;
      if (this.loading) return;
      this.loading = true;
      this.error = null;
      const demo = useDemoStore();
      try {
        if (demo.active) {
          this.items = [];
          return;
        }
        const { data, error } = await fetchStarterProjects();
        if (error) {
          this.error = error;
          this.items = [];
        } else {
          this.items = data ?? [];
        }
      } finally {
        this.loading = false;
      }
    },
    reset() {
      this.items = [];
      this.error = null;
      this.loading = false;
    },
  },
});
