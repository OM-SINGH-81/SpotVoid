"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import Header from "@/components/header"

export default function TestAiPage() {
  const [prompt, setPrompt] = React.useState("Predict crime hotspots in Delhi")
  const [isLoading, setIsLoading] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async () => {
    setIsLoading(true)
    setResult(null)
    setError(null)
    try {
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: prompt }),
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.output)
      } else {
        setError(data.error || "An unknown error occurred.")
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Test Gemini API</CardTitle>
            <CardDescription>
              Use this page to send a direct request to the Gemini API to verify the connection.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label htmlFor="prompt" className="text-sm font-medium">Prompt</label>
                <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your test prompt here"
                />
            </div>
            {result && (
              <div className="p-4 bg-muted rounded-md border">
                <p className="font-semibold mb-2">API Response:</p>
                <p className="text-sm">{result}</p>
              </div>
            )}
            {error && (
              <div className="p-4 bg-destructive/10 text-destructive-foreground rounded-md border border-destructive">
                <p className="font-semibold mb-2">Error:</p>
                <p className="text-sm font-mono">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Sending..." : "Send Test Request"}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
