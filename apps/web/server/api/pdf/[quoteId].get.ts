import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, 'quoteId')
  const sb = await useServerSupabase()

  const { data: quote } = await sb
    .from('quotes')
    .select('*, clients(*), contractors(*)')
    .eq('id', quoteId)
    .single()

  if (!quote) {
    throw createError({ statusCode: 404, statusMessage: 'Quote not found' })
  }

  const html = renderQuoteHtml(quote)

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({ format: 'A4', printBackground: true })
  await browser.close()

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `inline; filename=quote-${quoteId}.pdf`)

  return pdf
})

function renderQuoteHtml(q: any) {
  const css = `
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Ubuntu,Arial,sans-serif;color:#0f172a}
  .hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px}
  .logo{height:48px}
  .tier{border:1px solid #e2e8f0;border-radius:12px;padding:12px;margin-bottom:12px}
  h1{color:#1E293B}
  .pill{background:#F8FAFC;padding:4px 8px;border-radius:999px;border:1px solid #e2e8f0}
  table{width:100%;border-collapse:collapse}
  td,th{padding:8px;border-top:1px solid #e2e8f0;text-align:left}
  `

  const tiers = ['good', 'better', 'best']
  const tierHtml = tiers
    .map(
      (t) => `
    <div class="tier">
      <h3>${t.toUpperCase()}</h3>
      <table>
        <thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead>
        <tbody>
          ${(q.options?.[t] || [])
            .map(
              (i: any) =>
                `<tr><td>${i.description}</td><td>${i.qty}</td><td>$${i.unitPrice.toFixed(
                  2
                )}</td><td>$${(i.qty * i.unitPrice).toFixed(2)}</td></tr>`
            )
            .join('')}
        </tbody>
      </table>
    </div>`
    )
    .join('')

  return `<!doctype html>
  <html>
    <head><meta charset="utf-8"/><style>${css}</style></head>
    <body>
      <div class="hdr">
        <div>
          <h1>Quote #${q.id}</h1>
          <div class="pill">${q.contractors?.company_name ?? ''}</div>
        </div>
        ${
          q.contractors?.logo_url
            ? `<img class="logo" src="${q.contractors.logo_url}"/>`
            : ''
        }
      </div>
      <div>
        <strong>Client:</strong> ${q.clients?.name ?? ''} — ${q.clients?.email ?? ''}
      </div>
      <hr/>
      ${tierHtml}
      <h3>Deposit: $${(q.deposit_amount ?? 0).toFixed(2)}</h3>
    </body>
  </html>`
}

async function useServerSupabase() {
  const config = useRuntimeConfig()
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL!,
    config.supabaseServiceRole!
  )
}
