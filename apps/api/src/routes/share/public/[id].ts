import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client (SERVICE ROLE — never exposed to browser)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  // Basic guard
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid proposal id' })
  }

  // Fetch proposal
  const { data: proposal, error } = await supabase
    .from('smart_proposals')
    .select(`
      id,
      status,
      signed_option,
      public_token,
      quickquote_id,
      payment_link_url,
      user_id,
      contractor_id,
      client_id,
      title,
      description,
      created_at,
      signed_at
    `)
    .eq('id', id)
    .single()

  // Not found (true 404)
  if (error && error.code === 'PGRST116') {
    return res.status(404).json({ error: 'Proposal not found' })
  }

  // Other DB error
  if (error) {
    console.error('Proposal fetch error:', error)
    return res.status(500).json({ error: 'Failed to load proposal' })
  }

  // 🔒 Future hook: expiration logic (INTENTIONALLY DISABLED FOR MVP)
  /*
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
    return res.status(410).json({ error: 'Proposal expired' })
  }
  */

  // ✅ Success
  return res.status(200).json({
    proposal: {
      id: proposal.id,
      status: proposal.status,
      signed_option: proposal.signed_option,
      title: proposal.title,
      description: proposal.description,
      client_id: proposal.client_id,
      contractor_id: proposal.contractor_id,
      payment_link_url: proposal.payment_link_url,
      created_at: proposal.created_at,
      signed_at: proposal.signed_at
    }
  })
}
