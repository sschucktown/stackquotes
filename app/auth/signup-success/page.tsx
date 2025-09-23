import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignupSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-border/50">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SQ</span>
              </div>
              <span className="text-xl font-semibold">StackQuotes</span>
            </div>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>We've sent you a confirmation link to complete your account setup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
                <Mail className="h-6 w-6 text-muted-foreground mr-2" />
                <span className="text-sm text-muted-foreground">
                  Click the link in your email to verify your account
                </span>
              </div>

              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>

            <div className="text-center">
              <Link href="/login">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
