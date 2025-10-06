import { defineStore } from "pinia";
import type { UserSettings } from "@stackquotes/types";
import {
  fetchSettings,
  updateSettings,
  uploadLogo as uploadLogoRequest,
} from "@modules/quickquote/api/settings";

interface SettingsState {
  data: UserSettings | null;
  loading: boolean;
  error: string | null;
}

export const useSettingsStore = defineStore("settings", {
  state: (): SettingsState => ({
    data: null,
    loading: false,
    error: null,
  }),
  actions: {
    async load() {
      this.loading = true;
      const { data, error } = await fetchSettings();
      if (error) {
        this.error = error;
      } else {
        this.data = (data as UserSettings | null) ?? null;
      }
      this.loading = false;
    },
    async update(payload: Partial<UserSettings>) {
      const { data, error } = await updateSettings(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      this.data = data ?? null;
      return data;
    },
    async uploadLogo(file: File) {
      const { data, error } = await uploadLogoRequest(file);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      this.data = data ?? this.data;
      return data ?? null;
    },
  },
});

