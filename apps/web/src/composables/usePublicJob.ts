import { ref } from "vue";

export type PublicJob = {
  id: string;
  approved_option: string | null;
  approved_price: number | null;
  deposit_amount: number | null;
  payment_link_url: string | null;
};

export function usePublicJob() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const job = ref<PublicJob | null>(null);

  const load = async (jobId: string) => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(`/api/share/job/${jobId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      job.value = data.job;
    } catch (err: any) {
      console.error("[usePublicJob] load failed", err);
      error.value = "Unable to load project details.";
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    job,
    load,
  };
}
