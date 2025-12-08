import { Hono } from 'hono';
import { z } from 'zod';
import { getSupabaseClient } from '../lib/supabaseClient';
import type { KickoffDetails } from '@stackquotes/types/projects';

const kickoffRouter = new Hono();

// Shared schema
const kickoffSchema = z.object({
  projectId: z.string().uuid(),
  crewArrivalWindow: z.string().min(3),
  crewLeadName: z.string().min(2),
  crewLeadPhone: z.string().min(7),
  materialsDropNotes: z.string().optional().nullable(),
  accessNotes: z.string().optional().nullable(),
});

kickoffRouter.post('/send', async (c) => {
  const supabase = getSupabaseClient(c);
  const body = await c.req.json();

  const parsed = kickoffSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload', issues: parsed.error.issues }, 400);
  }

  const {
    projectId,
    crewArrivalWindow,
    crewLeadName,
    crewLeadPhone,
    materialsDropNotes,
    accessNotes,
  } = parsed.data;

  const kickoffDetails: KickoffDetails = {
    crewArrivalWindow,
    crewLeadName,
    crewLeadPhone,
    materialsDropNotes: materialsDropNotes || undefined,
    accessNotes: accessNotes || undefined,
  };

  const { data, error } = await supabase
    .from('projects')
    .update({
      kickoff_status: 'sent',
      kickoff_sent_at: new Date().toISOString(),
      crew_arrival_window: crewArrivalWindow,
      crew_lead_name: crewLeadName,
      crew_lead_phone: crewLeadPhone,
      materials_drop_notes: materialsDropNotes ?? null,
      access_notes: accessNotes ?? null,
      kickoff_details: kickoffDetails,
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('[kickoff/send] error', error);
    return c.json({ error: 'Failed to save kickoff details' }, 500);
  }

  // TODO: fire email/SMS notification here

  return c.json({ project: data });
});

kickoffRouter.post('/viewed', async (c) => {
  const supabase = getSupabaseClient(c);
  const body = await c.req.json();

  const schema = z.object({ projectId: z.string().uuid() });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  const { projectId } = parsed.data;

  const { data, error } = await supabase
    .from('projects')
    .update({
      kickoff_status: 'viewed',
      kickoff_viewed_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    console.error('[kickoff/viewed] error', error);
    return c.json({ error: 'Failed to mark as viewed' }, 500);
  }

  return c.json({ project: data });
});

export default kickoffRouter;
