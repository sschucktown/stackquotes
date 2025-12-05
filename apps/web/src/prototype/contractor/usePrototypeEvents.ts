import { ref } from "vue";

export type PrototypeTimelineEvent = {
  id: string;
  type: string;
  title: string;
  meta?: string;
  description?: string;
  amount?: string;
  method?: string;
  time: string;
};

export const timelineEvents = ref<PrototypeTimelineEvent[]>([
  {
    id: "evt-1",
    type: "payment",
    title: "Deposit received",
    meta: "Payment",
    description: "Paid via card - Auth code 59328 - Email receipt sent.",
    amount: "$2,400",
    time: "Jun 27, 4:12 PM"
  },
  {
    id: "evt-2",
    type: "status",
    title: "Visit scheduled",
    meta: "Job",
    description: "Calendar invite sent for site walk.",
    time: "Jun 27, 3:05 PM"
  },
  {
    id: "evt-3",
    type: "note",
    title: "Note added",
    meta: "Notes",
    description: "Ledger looks rotted along left span.",
    time: "Jun 27, 10:03 AM"
  }
]);

export function addTimelineEvent(event: PrototypeTimelineEvent) {
  timelineEvents.value = [{ ...event, id: event.id || `evt-${Date.now()}` }, ...timelineEvents.value];
}
