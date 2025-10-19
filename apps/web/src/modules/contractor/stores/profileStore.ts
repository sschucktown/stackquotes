import { defineStore } from "pinia";
import type { ContractorProfile } from "@stackquotes/types";
import {
  fetchContractorProfile,
  upsertContractorProfile,
  uploadContractorLogo,
} from "../api/profile";
import { useDemoStore } from "@/stores/demoStore";
import { demoContractorProfile, cloneProfile } from "@/data/demo";

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

interface ContractorProfileState {
  profile: ContractorProfile | null;
  loading: boolean;
  saving: boolean;
  uploading: boolean;
  error: string | null;
  isDemo: boolean;
}

export const useContractorProfileStore = defineStore("contractor-profile", {
  state: (): ContractorProfileState => ({
    profile: null,
    loading: false,
    saving: false,
    uploading: false,
    error: null,
    isDemo: false,
  }),
  actions: {
    setProfile(profile: ContractorProfile | null, demo = false) {
      this.profile = profile;
      this.isDemo = demo;
    },
    async load(force = false) {
      if (this.profile && !force) return;
      this.loading = true;
      this.error = null;
      const demo = useDemoStore();
      if (demo.active) {
        this.setProfile(cloneProfile(demoContractorProfile), true);
        this.loading = false;
        return;
      }
      const response = await fetchContractorProfile();
      if (response.error) {
        this.error = response.error;
        this.setProfile(cloneProfile(demoContractorProfile), true);
      } else if (response.data) {
        this.setProfile(response.data, false);
      } else {
        this.setProfile(cloneProfile(demoContractorProfile), true);
      }
      this.loading = false;
    },
    async save(payload: Partial<ContractorProfile>) {
      this.saving = true;
      this.error = null;
      try {
        const demo = useDemoStore();
        if (demo.active) {
          const current = this.profile ? cloneProfile(this.profile) : cloneProfile(demoContractorProfile);
          const updated: ContractorProfile = { ...current };
          Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined) {
              (updated as Record<string, unknown>)[key] = value;
            }
          });
          updated.updatedAt = new Date().toISOString();
          this.setProfile(updated, true);
          return updated;
        }
        const response = await upsertContractorProfile(payload);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.setProfile(response.data, false);
        }
        return response.data ?? null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Unable to update contractor profile.";
        throw error;
      } finally {
        this.saving = false;
      }
    },
    async uploadLogo(file: File) {
      this.uploading = true;
      this.error = null;
      try {
        const demo = useDemoStore();
        if (demo.active) {
          const logoUrl = await readFileAsDataUrl(file);
          const current = this.profile ? cloneProfile(this.profile) : cloneProfile(demoContractorProfile);
          current.logoUrl = logoUrl;
          current.updatedAt = new Date().toISOString();
          this.setProfile(current, true);
          return current;
        }
        const response = await uploadContractorLogo(file);
        if (response.error) {
          throw new Error(response.error);
        }
        if (response.data) {
          this.setProfile(response.data, false);
        }
        return response.data ?? null;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Unable to upload logo. Please try again.";
        throw error;
      } finally {
        this.uploading = false;
      }
    },
  },
});
