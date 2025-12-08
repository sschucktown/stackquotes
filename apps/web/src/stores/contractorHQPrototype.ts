import { defineStore } from "pinia";
import { reactive } from "vue";
import { messageStore } from "@/prototype/stores/messages";
import { timelineEvents } from "@/prototype/contractor/usePrototypeEvents";

type JobStatus = "In Progress" | "Scheduled" | "Pending" | "Needs Visit";

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`);

const baseTimeline = () => [...timelineEvents.value];

export type KickoffState = {
  crewLead: string;
  crewLeadPhone: string;
  arrivalWindow: string;
  materialDrop: string;
  accessInstructions: string;
  preconstructionNotes: string;
  dayOneExpectations: string;
  safety: string;
  weatherPolicy: string;
  clientConfirmed: boolean;
  clientSubmittedAccess: boolean;
  packetSentAt: string | null;
  packetViewedAt: string | null;
};

export type TimelineEventType =
  | "STATUS"
  | "KICKOFF_PACKET_SENT"
  | "KICKOFF_PACKET_VIEWED"
  | "KICKOFF_CLIENT_CONFIRMED"
  | "KICKOFF_ACCESS_SUBMITTED"
  | "KICKOFF_SCHEDULE_CONFIRMED"
  | "MESSAGE_SENT"
  | string;

const defaultKickoff = (): KickoffState => ({
  crewLead: "",
  crewLeadPhone: "",
  arrivalWindow: "8:00–10:00 AM",
  materialDrop: "",
  accessInstructions: "",
  preconstructionNotes: "",
  dayOneExpectations: "",
  safety: "Crew wears protective gear. Please keep pets/kids clear.",
  weatherPolicy: "If weather disrupts work, we reschedule ASAP. No extra charge.",
  clientConfirmed: false,
  clientSubmittedAccess: false,
  packetSentAt: null,
  packetViewedAt: null,
});

const timelineMessageMap: Record<Exclude<TimelineEventType, "STATUS">, string> = {
  KICKOFF_PACKET_SENT: "Kaufmann Construction sent your kickoff packet.",
  KICKOFF_PACKET_VIEWED: "Client viewed the kickoff packet.",
  KICKOFF_CLIENT_CONFIRMED: "Client confirmed kickoff.",
  KICKOFF_ACCESS_SUBMITTED: "Access instructions submitted by client.",
  KICKOFF_SCHEDULE_CONFIRMED: "Schedule confirmed for kickoff.",
  MESSAGE_SENT: "New client message for Maple St Deck",
};

export const useContractorHQPrototype = defineStore("contractorHQPrototype", {
  state: () =>
    reactive({
      hqAlerts: [] as { id: string; text: string }[],
      jobs: [
        {
          id: "job-maple",
          name: "Maple St Deck",
          type: "Deck",
          status: "Needs Visit" as JobStatus,
          detail: "Site Visit at 3PM",
          lead: "Sarah Thompson",
          location: "482 Maple St, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
          kickoff: {
            ...defaultKickoff(),
            materialDrop: "Staging on driveway; avoid blocking garage.",
            preconstructionNotes: "Client prefers minimal debris near garden beds.",
            dayOneExpectations: "Walkthrough with crew lead; confirm scope highlights.",
          },
        },
        {
          id: "job-lakeview",
          name: "Lakeview Patio Build",
          type: "Patio",
          status: "In Progress" as JobStatus,
          detail: "Active crew on-site",
          lead: "Mike Robertson",
          location: "91 Lakeview Dr, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
          kickoff: defaultKickoff(),
        },
        {
          id: "job-baker",
          name: "Baker Ave Fence",
          type: "Fence",
          status: "Pending" as JobStatus,
          detail: "Proposal Follow-Up",
          lead: "Julia Perez",
          location: "219 Baker Ave, Seattle, WA",
          proposalDraft: null as null | any,
          timeline: baseTimeline(),
          kickoff: defaultKickoff(),
        },
      ],
    }),

  actions: {
    getJob(jobId?: string) {
      if (!jobId) return this.jobs[0];
      return this.jobs.find((j) => j.id === jobId) || this.jobs[0];
    },
    attachProposalDraft(jobId: string, draft: any) {
      const job = this.jobs.find((j) => j.id === jobId);
      if (job) {
        job.proposalDraft = draft;
      }
    },
    addTimelineEvent(jobId: string, typeOrMessage: string, customMessage?: string) {
      const job = this.jobs.find((j) => j.id === jobId);
      if (!job) return;
      const isKnownType = Object.keys(timelineMessageMap).includes(typeOrMessage);
      const eventType: TimelineEventType = customMessage ? (typeOrMessage as TimelineEventType) : isKnownType ? (typeOrMessage as TimelineEventType) : "STATUS";
      const message =
        customMessage ||
        (isKnownType ? timelineMessageMap[typeOrMessage as Exclude<TimelineEventType, "STATUS">] : typeOrMessage);
      const now = new Date();
      const event = {
        id: uid(),
        jobId,
        type: eventType,
        message,
        createdAt: now,
        title: message,
        description: message,
        time: "Just now",
      };
      job.timeline.unshift(event);
      timelineEvents.value.unshift(event);
    },
    addSystemMessage(jobId: string, message: string) {
      const job = this.jobs.find((j) => j.id === jobId);
      const jobName = job?.name ?? "Job";
      const threadId = `system-${jobId}`;

      const existing = messageStore.threads.find((t) => t.id === threadId);
      if (existing) {
        existing.messages.push({
          id: uid(),
          sender: "team",
          text: message,
          time: "Just now",
          unread: true,
        });
        existing.lastMessage = message;
        existing.lastMessageTime = "Just now";
        existing.unread = true;
      } else {
        messageStore.threads.unshift({
          id: threadId,
          jobId,
          participant: "System",
          initials: "SYS",
          project: jobName,
          jobType: job?.type ?? "Job",
          unread: true,
          lastMessage: message,
          lastMessageTime: "Just now",
          messages: [
            {
              id: uid(),
              sender: "team",
              text: message,
              time: "Just now",
              unread: true,
            },
          ],
        });
      }
    },
    addHQAlert(text: string) {
      this.hqAlerts.push({
        id: uid(),
        text,
      });
    },
    setKickoffField(key: keyof KickoffState | string, val: any, jobId?: string) {
      const job = this.getJob(jobId);
      if (!job) return;
      if (!job.kickoff) job.kickoff = defaultKickoff();
      // @ts-expect-error dynamic assignment for prototype store
      job.kickoff[key] = val;
    },
    markKickoffPacketSent(jobId?: string) {
      const job = this.getJob(jobId);
      if (!job) return;
      if (!job.kickoff) job.kickoff = defaultKickoff();
      job.kickoff.packetSentAt = new Date().toISOString();
      job.kickoff.packetViewedAt = null;
      job.kickoff.clientConfirmed = false;
      job.kickoff.clientSubmittedAccess = false;
    },
    markKickoffPacketViewed(jobId?: string) {
      const job = this.getJob(jobId);
      if (!job) return;
      if (!job.kickoff) job.kickoff = defaultKickoff();
      job.kickoff.packetViewedAt = new Date().toISOString();
    },
    markKickoffClientConfirmed(jobId?: string) {
      const job = this.getJob(jobId);
      if (!job) return;
      if (!job.kickoff) job.kickoff = defaultKickoff();
      job.kickoff.clientConfirmed = true;
    },
    markKickoffAccessSubmitted(jobId?: string) {
      const job = this.getJob(jobId);
      if (!job) return;
      if (!job.kickoff) job.kickoff = defaultKickoff();
      job.kickoff.clientSubmittedAccess = true;
    },
    addProposalApprovalEvent(jobId: string, option: string) {
      const job = this.jobs.find((j) => j.id === jobId) || this.jobs[0];
      const jobName = job?.name ?? "Job";
      const optionText = option ? option.charAt(0).toUpperCase() + option.slice(1) : "Selected";
      const timelineText = `Client approved the ${optionText} option.`;
      this.addTimelineEvent(job.id, timelineText);
      this.addSystemMessage(job.id, timelineText);
      this.addHQAlert(`Proposal approved for ${jobName}.`);
    },
    addScheduleProposal(jobId: string, jobName: string) {
      this.addTimelineEvent(jobId, `Schedule proposed for ${jobName}`);
      this.addTimelineEvent(jobId, "Awaiting client confirmation");
      this.addHQAlert(`Client needs to confirm the proposed schedule for ${jobName}`);
    },
  },
});
