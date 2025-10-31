import type { Component } from "vue";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/vue/24/outline";

export interface NavItemConfig {
  label: string;
  name: string;
  icon: Component;
  matches: (routeName: string | null) => boolean;
  requiresPro?: boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Home",
    name: "dashboard-home",
    icon: HomeIcon,
    matches: (name) => name === "dashboard-home",
  },
  {
    label: "QuickQuotes",
    name: "quickquote-dashboard",
    icon: DocumentDuplicateIcon,
    matches: (name) => name?.startsWith("quickquote") ?? false,
  },
  {
    label: "SmartProposals",
    name: "smart-proposals",
    icon: ClipboardDocumentCheckIcon,
    matches: (name) => name === "smart-proposals",
    requiresPro: true,
  },
  {
    label: "Payments",
    name: "payments",
    icon: BanknotesIcon,
    matches: (name) => name === "payments",
  },
  {
    label: "ProfitPulse",
    name: "analytics",
    icon: ChartBarIcon,
    matches: (name) => name === "analytics",
    requiresPro: true,
  },
  {
    label: "Settings",
    name: "settings",
    icon: Cog6ToothIcon,
    matches: (name) => name === "settings",
  },
  {
    label: "Chat / Help",
    name: "help",
    icon: ChatBubbleLeftRightIcon,
    matches: (name) => name === "help",
  },
];
