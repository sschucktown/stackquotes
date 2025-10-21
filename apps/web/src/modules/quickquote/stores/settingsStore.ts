import { defineStore } from "pinia";
import type { UserSettings } from "@stackquotes/types";
import {
  fetchSettings,
  updateSettings,
  uploadLogo as uploadLogoRequest,
} from "@modules/quickquote/api/settings";
import { useDemoStore } from "@/stores/demoStore";
import { demoSettings, cloneSettings } from "@/data/demo";

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to read file data"));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Failed to read the selected file"));
    reader.readAsDataURL(file);
  });

const pickDefined = <T extends object>(source: Partial<T>): Partial<T> => {
  const result: Partial<T> = {};
  (Object.keys(source) as (keyof T)[]).forEach((key) => {
    const value = source[key];
    if (value !== undefined) {
      result[key] = value;
    }
  });
  return result;
};

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
      const demo = useDemoStore();
      if (demo.active) {
        this.data = cloneSettings(demoSettings);
        this.error = null;
        this.loading = false;
        return;
      }
      const { data, error } = await fetchSettings();
      if (error) {
        this.error = error;
      } else {
        this.data = (data as UserSettings | null) ?? null;
      }
      this.loading = false;
    },
    async update(payload: Partial<UserSettings>) {
      const demo = useDemoStore();
      if (demo.active) {
        const current = this.data ? cloneSettings(this.data) : cloneSettings(demoSettings);
        const updated: UserSettings = {
          ...current,
          ...pickDefined<UserSettings>(payload),
        };
        this.data = cloneSettings(updated);
        return this.data;
      }
      const { data, error } = await updateSettings(payload);
      if (error) {
        this.error = error;
        throw new Error(error);
      }
      this.data = data ?? null;
      return data;
    },
    async uploadLogo(file: File) {
      const demo = useDemoStore();
      if (demo.active) {
        const logoDataUrl = await readFileAsDataUrl(file);
        const current = this.data ? cloneSettings(this.data) : cloneSettings(demoSettings);
        current.logoUrl = logoDataUrl;
        this.data = cloneSettings(current);
        return this.data;
      }
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

