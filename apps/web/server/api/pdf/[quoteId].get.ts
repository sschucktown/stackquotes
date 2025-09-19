// apps/web/server/api/pdf/[quoteId].get.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, 'quoteId')
  if (!quoteId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing quoteId',
    })
  }

  try {
    // Launch Puppeteer with Sparticuz Chromium (works on Vercel)
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    })

    const page = await browser.newPage()

    // Load your hosted page for the quote (adjust path if needed)
    const config = useRuntimeConfig()
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`

    await page.goto(quoteUrl, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
    })

    await browser.close()

    // Return PDF to client
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
