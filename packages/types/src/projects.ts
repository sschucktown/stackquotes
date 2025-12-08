export type KickoffStatus = 'pending' | 'sent' | 'viewed';

export interface KickoffDetails {
  crewArrivalWindow: string;
  crewLeadName: string;
  crewLeadPhone: string;
  materialsDropNotes?: string;
  accessNotes?: string;
}

export interface ProjectWithKickoff {
  id: string;
  title: string;
  // ...existing fields...
  kickoff_status: KickoffStatus;
  kickoff_sent_at: string | null;
  kickoff_viewed_at: string | null;
  crew_arrival_window: string | null;
  crew_lead_name: string | null;
  crew_lead_phone: string | null;
  materials_drop_notes: string | null;
  access_notes: string | null;
  kickoff_details: KickoffDetails | null;
}
