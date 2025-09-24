import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import PDFDocument from "pdfkit"
import getStream from "get-stream"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { quoteId } = await req.json()

    const supabase = createClient()
    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Build PDF
    const doc = new PDFDocument()
    doc.fontSize(18).text(`Quote: ${quote.project_title}`, { underline: true })
    doc.moveDown()
    doc.fontSize(12).text(`Client: ${quote.client_name}`)
    doc.text(`Email: ${quote.client_email}`)
    doc.text(`Phone: ${quote.client_phone || "N/A"}`)
    doc.moveDown()
    doc.text(`Project Description:`)
    doc.text(quote.project_description || "N/A", { indent: 20 })
    doc.moveDown()
    doc.text(`Good Option: $${quote.good_total}`)
    doc.text(`Better Option: $${quote.better_total}`)
    doc.text(`Best Option: $${quote.best_total}`)
    doc.moveDown()
    doc.text(`Notes:`)
    doc.text(quote.notes || "None", { indent: 20 })
    doc.end()

    const pdfBuffer = await getStream.buffer(doc)

    // Send email
    const result = await resend.emails.send({
      from: "StackQuotes <quotes@stackquotes.com>", // must be verified in Resend
      to: quote.client_email,
      subject: `Quote: ${quote.project_title}`,
      text: `Hi ${quote.client_name}, please find your quote attached.`,
      attachments: [
        {
          filename: `quote-${quoteId}.pdf`,
          content: pdfBuffer.toString("base64"),
        },
      ],
    })

    if (result.error) {
      console.error("Resend API error:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log("Email sent successfully:", result)
    return NextResponse.json({ success: true, data: result })
  } catch (err) {
    console.error("Send quote error:", err)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
