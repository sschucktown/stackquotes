// apps/web/server/api/pdf/[quoteId].get.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, 'quoteId')
  if (!quoteId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing quoteId' })
  }

  try {
    const executablePath =
      process.env.NODE_ENV === 'production'
        ? await chromium.executablePath() // 👈 must be awaited
        : undefined

    console.log('🚀 Launching Chromium with path:', executablePath)

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()

    const config = useRuntimeConfig()
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`

    console.log('🌐 Navigating to:', quoteUrl)

    await page.goto(quoteUrl, { waitUntil: 'networkidle0' })

    console.log('📄 Generating PDF...')
    const pdf = await page.pdf({ format: 'A4', printBackground: true })

    await browser.close()
    console.log('✅ PDF generated successfully')

    event.node.res.setHeader('Content-Type', 'application/pdf')
    event.node.res.setHeader(
      'Content-Disposition',
      `attachment; filename="quote-${quoteId}.pdf"`
    )
    return pdf
  } catch (err: any) {
    console.error('❌ PDF generation failed:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate PDF',
    })
  }
})
