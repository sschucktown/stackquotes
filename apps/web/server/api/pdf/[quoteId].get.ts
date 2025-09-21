import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import pwLambda from 'playwright-aws-lambda'

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, 'quoteId')
  if (!quoteId) throw createError({ statusCode: 400, statusMessage: 'Missing quoteId' })

  try {
    console.log('🚀 Launching Playwright AWS Lambda Chromium...')
    const browser = await pwLambda.launchChromium({ headless: true }) // 👈 ONLY this

    const page = await browser.newPage()
    const config = useRuntimeConfig()
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`
    console.log('🌐 Navigating to:', quoteUrl)

    await page.goto(quoteUrl, { waitUntil: 'networkidle' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })

    await browser.close()
    return pdf
  } catch (err) {
    console.error('❌ PDF generation failed:', err)
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate PDF' })
  }
})
