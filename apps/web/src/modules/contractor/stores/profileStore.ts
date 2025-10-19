import { defineStore } from "pinia";
import type { ContractorProfile } from "@stackquotes/types";
import {
  fetchContractorProfile,
  upsertContractorProfile,
  uploadContractorLogo,
} from "../api/profile";

const seedProfile: ContractorProfile = {
  userId: "demo-user",
  businessName: "Charleston Deck Pros",
  ownerName: "Sam Builder",
  tradeType: "Decks & Outdoor Living",
  city: "Charleston",
  state: "SC",
  phone: "(843) 555-1024",
  email: "sam@charlestondeckpros.com",
  logoUrl: "https://yourcdn.com/demo-logo.png",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
};

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
      const response = await fetchContractorProfile();
      if (response.error) {
        this.error = response.error;
        this.setProfile({ ...seedProfile }, true);
      } else if (response.data) {
        this.setProfile(response.data, false);
      } else {
        this.setProfile({ ...seedProfile }, true);
      }
      this.loading = false;
    },
    async save(payload: Partial<ContractorProfile>) {
      this.saving = true;
      this.error = null;
      try {
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

