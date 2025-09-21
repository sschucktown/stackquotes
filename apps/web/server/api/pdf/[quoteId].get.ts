// apps/web/server/api/pdf/[quoteId].get.ts
import { defineEventHandler, getRouterParam, createError } from "h3"
import { useRuntimeConfig } from "#imports"

export default defineEventHandler(async (event) => {
  const quoteId = getRouterParam(event, "quoteId")
  if (!quoteId) {
    throw createError({ statusCode: 400, statusMessage: "Missing quoteId" })
  }

  const config = useRuntimeConfig()
  const pdfServiceUrl =
    process.env.PDF_SERVICE_URL || config.public.pdfServiceUrl

  if (!pdfServiceUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "PDF service not configured",
    })
  }

  try {
    // the URL of the quote page inside your app
    const quoteUrl = `${config.public.baseUrl}/quotes/${quoteId}`
    const url = `${pdfServiceUrl}/pdf?url=${encodeURIComponent(quoteUrl)}`

    // fetch from Render PDF service
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`PDF service error: ${response.status}`)
    }

    const pdf = Buffer.from(await response.arrayBuffer())

    event.node.res.setHeader("Content-Type", "application/pdf")
    event.node.res.setHeader(
      "Content-Disposition",
      `attachment; filename="quote-${quoteId}.pdf"`
    )
    return pdf
  } catch (err: any) {
    console.error("❌ PDF proxy failed:", err)
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to generate PDF",
    })
  }
})
