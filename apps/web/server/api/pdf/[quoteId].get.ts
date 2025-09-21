import { defineEventHandler, getRouterParam, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import pwLambda from 'playwright-aws-lambda'

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, 'quoteId')
  if (!quoteId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing quoteId' })
  }

  try {
    console.log('🚀 Launching Playwright AWS Lambda Chromium...')
    const browser = await pwLambda.launchChromium({ headless: true }) // ✅ key line

    const page = await browser.newPage()

    const config = useRuntimeConfig()
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`
    console.log('🌐 Navigating to:', quoteUrl)

    await page.goto(quoteUrl, { waitUntil: 'networkidle' })

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
      statusMessage: 'Failed to generate PDF'
    })
  }
})
