import { defineStore } from "pinia";
import type { Client } from "@stackquotes/types";
import { createClient, fetchClients } from "@modules/quickquote/api/clients";
import { useDemoStore } from "@/stores/demoStore";
import { demoClients, cloneClient } from "@/data/demo";

const generateDemoId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;

interface ClientState {
  items: Client[];
  demoItems: Client[] | null;
  loading: boolean;
  error: string | null;
}

export const useClientStore = defineStore("clients", {
  state: (): ClientState => ({
    items: [],
    demoItems: null,
    loading: false,
    error: null,
  }),
  actions: {
    async load() {
      this.loading = true;
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoClients.map((client) => cloneClient(client));
        }
        this.items = (this.demoItems ?? []).map((client) => cloneClient(client));
        this.loading = false;
        this.error = null;
        return;
      }
      this.demoItems = null;
      const { data, error } = await fetchClients();
      if (error) {
        this.error = error;
      } else if (data) {
        this.items = data;
      }
      this.loading = false;
    },
    async create(payload: { name: string; email: string; phone?: string; address?: string }) {
      const demo = useDemoStore();
      if (demo.active) {
        if (!this.demoItems) {
          this.demoItems = demoClients.map((client) => cloneClient(client));
        }
        this.error = null;
        const client: Client = {
          id: generateDemoId("demo-client"),
          userId: "demo-user",
          name: payload.name,
          email: payload.email,
          phone: payload.phone ?? null,
          address: payload.address ?? null,
          createdAt: new Date().toISOString(),
        };
        this.demoItems.push(client);
        this.items = this.demoItems.map((item) => cloneClient(item));
        return cloneClient(client);
      }
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
