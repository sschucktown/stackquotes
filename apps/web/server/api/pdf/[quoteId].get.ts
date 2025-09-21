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
    // Get executable path safely (supports both string and async getter)
    let executablePath: string | undefined
    if (process.env.NODE_ENV === 'production') {
      executablePath =
        typeof chromium.executablePath === 'function'
          ? await chromium.executablePath()
          : chromium.executablePath
    } else {
      executablePath = undefined // let Puppeteer find Chrome locally
    }

    console.log('Chromium path in production:', executablePath)

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless, // let @sparticuz/chromium decide
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    const config = useRuntimeConfig()
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`
    console.log('Navigating to quote URL:', quoteUrl)

    await page.goto(quoteUrl, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

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
