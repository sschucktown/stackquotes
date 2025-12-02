import { computed, ref } from "vue";
import { apiFetch } from "@/lib/http";

export type CommentAuthorType = "client" | "contractor";

export interface ProposalComment {
  id: string;
  proposalId: string;
  authorType: CommentAuthorType;
  authorId: string | null;
  authorName?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
  optimistic?: boolean;
}

const sortByCreatedAt = (list: ProposalComment[]) =>
  [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

export const useProposalComments = (options?: { token?: string | null }) => {
  const comments = ref<ProposalComment[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const error = ref<string | null>(null);

  const hasComments = computed(() => comments.value.length > 0);

  const buildUrl = (proposalId: string, token?: string | null) => {
    const query = token ? `?token=${encodeURIComponent(token)}` : "";
    return `/smartproposals/${encodeURIComponent(proposalId)}/comments${query}`;
  };

  const loadComments = async (proposalId: string, token?: string | null) => {
    if (!proposalId) return;
    loading.value = true;
    error.value = null;
    try {
      const url = buildUrl(proposalId, token ?? options?.token ?? null);
      const res = await apiFetch<ProposalComment[]>(url);
      if (res.error) {
        throw new Error(res.error);
      }
      const list = (res.data ?? []).map((item) => ({
        ...item,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt,
      }));
      comments.value = sortByCreatedAt(list);
    } catch (e: any) {
      console.error("[comments] load failed", e);
      error.value = e?.message ?? "Unable to load comments.";
    } finally {
      loading.value = false;
    }
  };

  const addComment = async (proposalId: string, message: string, token?: string | null) => {
    const trimmed = message.trim();
    if (!proposalId || !trimmed) return;
    sending.value = true;
    error.value = null;

    const optimistic: ProposalComment = {
      id: `tmp-${Date.now()}`,
      proposalId,
      authorType: token ?? options?.token ? "client" : "contractor",
      authorId: null,
      message: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      optimistic: true,
    };
    comments.value = sortByCreatedAt([...comments.value, optimistic]);

    try {
      const url = buildUrl(proposalId, token ?? options?.token ?? null);
      const res = await apiFetch<ProposalComment[]>(url, {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });
      if (res.error) {
        throw new Error(res.error);
      }
      const list = res.data ?? [];
      comments.value = sortByCreatedAt(list as ProposalComment[]);
    } catch (e: any) {
      console.error("[comments] send failed", e);
      error.value = e?.message ?? "Unable to send comment.";
      // remove optimistic entry on failure
      comments.value = comments.value.filter((c) => c.id !== optimistic.id);
    } finally {
      sending.value = false;
    }
  };

  // Placeholder for future real-time support
  const subscribeToNewComments = () => {
    const unsubscribe = () => undefined;
    return unsubscribe;
  };

  return {
    comments,
    loading,
    sending,
    error,
    hasComments,
    loadComments,
    addComment,
    subscribeToNewComments,
  };
};
