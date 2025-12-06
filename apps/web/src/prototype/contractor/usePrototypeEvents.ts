import { ref } from "vue";

export type PrototypeTimelineEvent = {
  id: string;
  type: string;
  title: string;
  meta?: string;
  description?: string;
  text?: string;
  from?: string;
  amount?: string;
  method?: string;
  time: string;
  icon?: string;
  messagePreview?: string;
  fileUrl?: string;
  thumbnails?: string[];
};

export type PrototypeMessage = {
  id?: string;
  from: string;
  text: string;
  time: string;
};

export type PrototypeMessageThread = {
  id: string;
  clientName: string;
  clientInitials: string;
  jobName: string;
  lastMessage: string;
  lastUpdated: string;
  messages: PrototypeMessage[];
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
  },
  {
    id: "evt-4",
    type: "message",
    title: "Client Message",
    text: "Thanks for the update!",
    from: "Sarah Thompson",
    time: "Jun 27, 9:45 AM",
    icon: "MessageCircle"
  }
]);

export const messageThreads = ref<PrototypeMessageThread[]>([
  {
    id: "sarah-thompson",
    clientName: "Sarah Thompson",
    clientInitials: "ST",
    jobName: "Deck",
    lastMessage: "Quick question about materials.",
    lastUpdated: "2h ago",
    messages: [
      { id: "msg-1", from: "Sarah Thompson", text: "Hey! Just checking if you got the updated measurements?", time: "9:12 AM" },
      { id: "msg-2", from: "Contractor", text: "Yep, reviewing now!", time: "9:18 AM" },
      { id: "msg-3", from: "Sarah Thompson", text: "Awesome - also wondering about stain options.", time: "9:20 AM" },
      { id: "msg-4", from: "Contractor", text: "Got it. I'll send photos in a bit.", time: "9:24 AM" }
    ]
  },
  {
    id: "mike-robertson",
    clientName: "Mike Robertson",
    clientInitials: "MR",
    jobName: "Patio",
    lastMessage: "Did you get the photos?",
    lastUpdated: "4h ago",
    messages: [
      { id: "msg-5", from: "Mike Robertson", text: "Did you get the photos from this morning?", time: "8:02 AM" },
      { id: "msg-6", from: "Contractor", text: "Yes, downloading now. We will add to the file set.", time: "8:06 AM" }
    ]
  },
  {
    id: "crew-chat",
    clientName: "Crew Chat",
    clientInitials: "CC",
    jobName: "Team",
    lastMessage: "Material staged by side gate.",
    lastUpdated: "Yesterday",
    messages: [
      { id: "msg-7", from: "Contractor", text: "Material staged by side gate. Need to tarp if rain tonight.", time: "Yesterday 6:40 PM" },
      { id: "msg-8", from: "Contractor", text: "Reminder: safety checklist before demo.", time: "Yesterday 7:10 PM" }
    ]
  },
  {
    id: "auto-messages",
    clientName: "Auto Messages",
    clientInitials: "AM",
    jobName: "System",
    lastMessage: "Proposal follow-up pending",
    lastUpdated: "Yesterday",
    messages: [
      { id: "msg-9", from: "Contractor", text: "Proposal follow-up pending. Client viewed once.", time: "Yesterday 5:55 PM" }
    ]
  }
]);

export function addTimelineEvent(event: PrototypeTimelineEvent) {
  timelineEvents.value.unshift({ ...event, id: event.id || `evt-${Date.now()}` });
}

export function addMessageToThread(threadId: string, message: PrototypeMessage) {
  const messageId = message.id || `msg-${Date.now()}`;
  const enrichedMessage = { ...message, id: messageId };
  const thread = messageThreads.value.find((t) => t.id === threadId);

  if (thread) {
    thread.messages.push(enrichedMessage);
    thread.lastMessage = message.text;
    thread.lastUpdated = "Just now";
  }

  addTimelineEvent({
    type: "message",
    title: "New Message",
    text: message.text,
    from: message.from,
    time: "Just now",
    icon: "MessageCircle",
    id: messageId
  });
}
