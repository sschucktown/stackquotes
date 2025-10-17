import type { Component } from "vue";
import { HomeIcon, DocumentTextIcon, UsersIcon, CubeIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";

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
    label: "Proposals",
    name: "proposals",
    icon: DocumentTextIcon,
    matches: (name) => name === "proposals",
  },
  {
    label: "Clients",
    name: "clients",
    icon: UsersIcon,
    matches: (name) => name === "clients",
  },
  {
    label: "Materials",
    name: "materials",
    icon: CubeIcon,
    matches: (name) => name === "materials",
  },
  {
    label: "Settings",
    name: "settings",
    icon: Cog6ToothIcon,
    matches: (name) => name === "settings",
  },
];
