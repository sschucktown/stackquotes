import { reactive } from "vue";

export type Message = {
  id: string;
  sender: "client" | "contractor" | "team";
  text: string;
  time: string;
  unread: boolean;
  timelineLinked?: boolean;
  createdAt?: string;
};

export type Thread = {
  id: string;
  jobId: string;
  participant: string;
  initials: string;
  project: string;
  jobType: string;
  unread: boolean;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageAt?: string;
  messages: Message[];
};

function relativeFromIso(iso?: string) {
  if (!iso) return "Just now";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.max(1, Math.round(diff / 60_000))}m ago`;
  if (diff < 86_400_000) return `${Math.max(1, Math.round(diff / 3_600_000))}h ago`;
  return "Yesterday";
}

export const messageStore = reactive({
  activeThreadId: "sarah-thompson",
  threads: [
    {
      id: "sarah-thompson",
      jobId: "job-maple",
      participant: "Sarah Thompson",
      initials: "ST",
      project: "Maple St Deck",
      jobType: "Deck",
      unread: true,
      lastMessage: "Quick question about materials.",
      lastMessageTime: "2h ago",
      messages: [
        {
          id: "msg-s1",
          sender: "client",
          text: "Hi Jordan, can you confirm the composite color options?",
          time: "9:04 AM",
          unread: true,
          timelineLinked: true
        },
        {
          id: "msg-s2",
          sender: "contractor",
          text: "Yes! We can show you samples during the visit.",
          time: "9:06 AM",
          unread: false
        },
        {
          id: "msg-s3",
          sender: "client",
          text: "Great, thank you!",
          time: "9:09 AM",
          unread: false,
          timelineLinked: true
        }
      ]
    },
    {
      id: "mike-robertson",
      jobId: "job-lakeview",
      participant: "Mike Robertson",
      initials: "MR",
      project: "Lakeview Patio",
      jobType: "Patio",
      unread: false,
      lastMessage: "Did you get the photos?",
      lastMessageTime: "4h ago",
      messages: [
        {
          id: "msg-m1",
          sender: "client",
          text: "Did you get the photos?",
          time: "8:02 AM",
          unread: false,
          timelineLinked: true
        },
        {
          id: "msg-m2",
          sender: "contractor",
          text: "Yes, downloading now. We will add to the file set.",
          time: "8:06 AM",
          unread: false
        }
      ]
    },
    {
      id: "crew-chat",
      jobId: "job-team",
      participant: "Crew Chat",
      initials: "CC",
      project: "Team Thread",
      jobType: "Team",
      unread: false,
      lastMessage: "Material staged by side gate.",
      lastMessageTime: "Yesterday",
      messages: [
        {
          id: "msg-c1",
          sender: "team",
          text: "Material staged by side gate.",
          time: "Yesterday 6:30 PM",
          unread: false,
          timelineLinked: true
        },
        {
          id: "msg-c2",
          sender: "team",
          text: "Need to tarp if rain tonight.",
          time: "Yesterday 6:42 PM",
          unread: false
        }
      ]
    }
  ] as Thread[],

  markThreadRead(id: string) {
    const thread = this.threads.find((t) => t.id === id);
    if (!thread) return;
    thread.unread = false;
    thread.messages.forEach((msg) => {
      msg.unread = false;
    });
  },

  pushIncomingMessage(payload: { threadId: string; text: string; createdAt?: string }) {
    const thread = this.threads.find((t) => t.id === payload.threadId);
    if (!thread) return;

    const timestamp = payload.createdAt ?? new Date().toISOString();
    const msg: Message = {
      id: `msg-${Date.now()}`,
      sender: "client",
      text: payload.text,
      time: "Just now",
      unread: true,
      createdAt: timestamp
    };

    thread.messages.push(msg);
    thread.lastMessage = msg.text;
    thread.lastMessageAt = timestamp;
    thread.lastMessageTime = relativeFromIso(timestamp);
    thread.unread = true;

    const idx = this.threads.indexOf(thread);
    if (idx > 0) {
      this.threads.splice(idx, 1);
      this.threads.unshift(thread);
    }

    if (typeof window !== "undefined" && (window as any).__sqShowMessageToast) {
      (window as any).__sqShowMessageToast({
        participant: thread.participant,
        job: thread.project,
        text: msg.text
      });
    }
  },

  simulateRandomIncoming() {
    const candidates = this.threads;
    if (!candidates.length) return;
    const idx = Math.floor(Math.random() * candidates.length);
    const thread = candidates[idx];

    const canned = [
      "Just checking in on the stain options.",
      "We’re good for tomorrow’s visit.",
      "Can we add lighting to the quote?",
      "Quick question about railing styles."
    ];
    const text = canned[Math.floor(Math.random() * canned.length)];

    this.pushIncomingMessage({
      threadId: thread.id,
      text
    });
  }
});
