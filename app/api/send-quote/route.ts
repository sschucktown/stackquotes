import { NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"
import { jsPDF } from "jspdf"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { quoteId } = await req.json()

    const supabase = createClient()

    // Fetch quote details from Supabase
    const { data: quote, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single()

    if (error || !quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Generate PDF with jsPDF
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`Quote: ${quote.project_title}`, 20, 20)
    doc.setFontSize(12)
    doc.text(`Client: ${quote.client_name}`, 20, 40)
    doc.text(`Email: ${quote.client_email}`, 20, 50)
    doc.text(`Phone: ${quote.client_phone || "N/A"}`, 20, 60)
    doc.text(`Description: ${quote.project_description}`, 20, 80)
    doc.text(`Total (Best Option): $${quote.best_total}`, 20, 100)

    const pdfBytes = doc.output("arraybuffer")

    // Send via Resend
    const { data, error: sendError } = await resend.emails.send({
      from: "StackQuotes <no-reply@stackquotes.com>",
      to: quote.client_email,
      subject: `Quote: ${quote.project_title}`,
      text: `Hi ${quote.client_name}, please find your quote attached.`,
      attachments: [
        {
          filename: `quote-${quoteId}.pdf`,
          content: Buffer.from(pdfBytes).toString("base64"),
        },
      ],
    })

    if (sendError) {
      console.error(sendError)
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}
