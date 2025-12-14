import type { SupabaseClient } from "@stackquotes/db";

export const JOB_EVENT_TYPES = {
  JOB_CREATED: "JOB_CREATED",
  PROPOSAL_APPROVED: "PROPOSAL_APPROVED",
  JOB_SCHEDULED: "JOB_SCHEDULED",
  KICKOFF_PACKET_SENT: "KICKOFF_PACKET_SENT",
  KICKOFF_PACKET_VIEWED: "KICKOFF_PACKET_VIEWED",
  KICKOFF_CLIENT_CONFIRMED: "KICKOFF_CLIENT_CONFIRMED",
  CLIENT_SUBMITTED_ACCESS: "CLIENT_SUBMITTED_ACCESS",
  PAYMENT_LINK_SENT: "PAYMENT_LINK_SENT",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  STATUS_CHANGED: "STATUS_CHANGED",
} as const;

export type JobEventType = (typeof JOB_EVENT_TYPES)[keyof typeof JOB_EVENT_TYPES];
export type JobEventActor = "system" | "contractor" | "client";

export interface CreateJobEventInput {
  jobId: string;
  type: JobEventType;
  actor: JobEventActor;
  title: string;
  description?: string | null;
}

export interface JobEventRecord {
  id: string;
  job_id: string;
  type: JobEventType;
  actor: JobEventActor;
  title: string;
  description: string | null;
  created_at: string;
}

export const createJobEvent = async (
  supabase: SupabaseClient,
  input: CreateJobEventInput
): Promise<JobEventRecord> => {
  const payload = {
    job_id: input.jobId,
    type: input.type,
    actor: input.actor,
    title: input.title,
    description: input.description ?? null,
  };

  const { data, error } = await supabase
    .from("job_events")
    .insert(payload)
    .select("id, job_id, type, actor, title, description, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as JobEventRecord;
};

export const listJobEventsForJob = async (
  supabase: SupabaseClient,
  jobId: string
): Promise<JobEventRecord[]> => {
  const { data, error } = await supabase
    .from("job_events")
    .select("id, job_id, type, actor, title, description, created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as JobEventRecord[];
};
