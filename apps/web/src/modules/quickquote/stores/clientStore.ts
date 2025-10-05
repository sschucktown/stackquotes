import { defineStore } from "pinia";
import type { Client } from "@stackquotes/types";
import { createClient, fetchClients } from "@modules/quickquote/api/clients";

interface ClientState {
  items: Client[];
  loading: boolean;
  error: string | null;
}

export const useClientStore = defineStore("clients", {
  state: (): ClientState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async load() {
      this.loading = true;
      const { data, error } = await fetchClients();
      if (error) {
        this.error = error;
      } else if (data) {
        this.items = data;
      }
      this.loading = false;
    },
    async create(payload: { name: string; email: string; phone?: string; address?: string }) {
      const { data, error } = await createClient(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      if (data) {
        this.items.push(data);
      }
      return data;
    },
  },
});

