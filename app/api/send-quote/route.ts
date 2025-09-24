import { NextResponse } from "next/server"
import { Resend } from "resend"
import PDFDocument from "pdfkit"
import getStream from "get-stream"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { quote } = body

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "Missing API key" }, { status: 500 })
    }

    if (!quote?.client_email) {
      return NextResponse.json({ success: false, error: "Missing client email" }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await generateQuotePdf(quote)

    // Debug log
    console.log("📤 Sending email:", {
      from: "StackQuotes <quotes@stackquotes.com>",
      to: [quote.client_email],
      subject: `Your Quote from ${quote.company_name || "StackQuotes"}`,
    })

    const { data, error } = await resend.emails.send({
      from: "StackQuotes <quotes@stackquotes.com>",   // ✅ string, not function
      to: [quote.client_email],
      subject: `Your Quote from ${quote.company_name || "StackQuotes"}`,
      text: "Please find your attached quote.",
      attachments: [
        {
          filename: "quote.pdf",
          content: Buffer.from(pdfBuffer).toString("base64"), // ✅ force base64
        },
      ],
    })

    if (error) {
      console.error("❌ Resend error:", error)
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    console.log("✅ Email sent:", data)
    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error("❌ Send quote error:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}

async function generateQuotePdf(quote: any): Promise<Buffer> {
  const doc = new PDFDocument()
  const stream = doc.pipe(getStream.buffer())

  doc.fontSize(20).text("Quote", { align: "center" })
  doc.moveDown()
  doc.fontSize(14).text(`Company: ${quote.company_name}`)
  doc.text(`Client: ${quote.client_name}`)
  doc.text(`Email: ${quote.client_email}`)
  doc.text(`Phone: ${quote.client_phone || "N/A"}`)
  doc.moveDown()
  doc.text(`Project: ${quote.project_title}`)
  doc.text(`Description: ${quote.project_description || "N/A"}`)
  doc.moveDown()

  if (quote.good_total) doc.text(`Good: $${quote.good_total}`)
  if (quote.better_total) doc.text(`Better: $${quote.better_total}`)
  if (quote.best_total) doc.text(`Best: $${quote.best_total}`)

  doc.moveDown()
  doc.text(`Deposit: ${quote.deposit_percentage || 0}%`)
  doc.text(`Valid Until: ${quote.valid_until || "N/A"}`)
  doc.text(`Notes: ${quote.notes || "N/A"}`)

  doc.end()
  return stream
}
