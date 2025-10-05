import type { Client } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

interface ClientPayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export const fetchClients = () => apiFetch<Client[]>("/clients/list");

export const createClient = (payload: ClientPayload) =>
  apiFetch<Client>("/clients/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

