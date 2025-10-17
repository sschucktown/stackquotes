import type { Component } from "vue";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/vue/24/outline";

export interface NavItemConfig {
  label: string;
  name: string;
  icon: Component;
  matches: (routeName: string | null) => boolean;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    label: "Dashboard",
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
  },
  {
    label: "Analytics",
    name: "analytics",
    icon: ChartBarIcon,
    matches: (name) => name === "analytics",
  },
  {
    label: "Settings",
    name: "settings",
    icon: Cog6ToothIcon,
    matches: (name) => name === "settings",
  },
];
