-- get_urgency_feed.sql
CREATE OR REPLACE FUNCTION public.get_urgency_feed(uid uuid)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  amount numeric,
  urgency_score numeric,
  status text,
  due_at timestamp with time zone,
  viewed_at timestamp with time zone
)
LANGUAGE sql STABLE AS $$
  WITH recent_views AS (
    SELECT DISTINCT ON (estimate_id)
      estimate_id,
      created_at AS viewed_at
    FROM proposal_events
    WHERE event = 'viewed'
      AND created_at > now() - interval '48 hours'
    ORDER BY estimate_id, created_at DESC
  )
  SELECT
    p.id,
    'proposal' AS type,
    COALESCE(p.title, 'Untitled Proposal') AS title,
    COALESCE(p.deposit_amount, 0) AS amount,
    (
      0.4 * LEAST(p.deposit_amount / 10000, 1)
      + 0.3 * (1 - LEAST(EXTRACT(EPOCH FROM (now() - p.sent_at)) / 86400 / 2, 1))
      + 0.2 * CASE WHEN rv.viewed_at IS NOT NULL THEN 1 ELSE 0 END
      + 0.1 * CASE WHEN p.status IN ('sent','accepted') THEN 1 ELSE 0 END
    ) AS urgency_score,
    p.status,
    p.sent_at AS due_at,
    rv.viewed_at
  FROM smart_proposals p
  LEFT JOIN recent_views rv ON rv.estimate_id = p.quickquote_id
  WHERE p.contractor_id = uid
  UNION ALL
  SELECT
    pay.id,
    'payment',
    'Payment Due',
    pay.amount,
    (
      0.5 * LEAST(pay.amount / 10000, 1)
      + 0.3 * (1 - LEAST(EXTRACT(EPOCH FROM (now() - pay.created_at)) / 86400 / 2, 1))
      + 0.2 * CASE WHEN pay.status IN ('pending','processing') THEN 1 ELSE 0 END
    ) AS urgency_score,
    pay.status,
    pay.created_at,
    NULL
  FROM payments pay
  WHERE pay.contractor_id = uid
  ORDER BY urgency_score DESC
  LIMIT 5;
$$;

