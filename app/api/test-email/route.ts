import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const result = await resend.emails.send({
      from: "StackQuotes <quotes@stackquotes.com>",
      to: "scottmsandie@gmail.com",
      subject: "Resend test",
      text: "If you got this, Resend is working in Vercel.",
    })

    console.log("Resend result:", result)
    return NextResponse.json({ success: true, result })
  } catch (err) {
    console.error("Test email error:", err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
