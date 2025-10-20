import type { UserProjectTemplate } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const fetchStarterProjects = () =>
  apiFetch<UserProjectTemplate[]>("/contractor/projects");
