export interface CommentMessage {
  id: string;
  body: string;
  createdAt: string;
  fromClient: boolean;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchProposalComments(proposalId: string): Promise<CommentMessage[]> {
  // Mocked fetch: replace with GET /api/proposals/:id/comments
  void proposalId;
  await delay(350);
  const now = new Date();
  return [
    {
      id: "seed-1",
      body: "Hi Jordan, this looks great. Do you have any flexibility on color options?",
      createdAt: now.toISOString(),
      fromClient: true,
    },
    {
      id: "seed-2",
      body: "Yes! We can show you a few composite samples during the site visit.",
      createdAt: now.toISOString(),
      fromClient: false,
    },
  ];
}

export async function createProposalComment(
  proposalId: string,
  payload: { body: string; fromClient: boolean },
): Promise<CommentMessage> {
  // Mocked post: replace with POST /api/proposals/:id/comments
  void proposalId;
  await delay(250);
  return {
    id: Math.random().toString(36).slice(2),
    body: payload.body,
    createdAt: new Date().toISOString(),
    fromClient: payload.fromClient,
  };
}
