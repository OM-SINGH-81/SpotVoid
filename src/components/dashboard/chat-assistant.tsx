
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Bot, Send, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import type { AskQuestionOutput } from "@/ai/flows/ai-chat-assistant"

const FormSchema = z.object({
  question: z.string().min(1, "Please enter a question."),
})

export default function ChatAssistant() {
  const [answer, setAnswer] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      question: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsLoading(true)
    setAnswer(null)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: data.question })
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || "An unexpected error occurred.");
      }
      const result: AskQuestionOutput = await response.json();
      setAnswer(result.answer)
    } catch (error: any) {
      console.error("AI chat error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to get an answer from the AI assistant.",
      })
    } finally {
      setIsLoading(false)
      form.reset()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-muted/50 rounded-lg">
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary rounded-full text-primary-foreground">
                  <Bot size={20} />
                </div>
                <div className="bg-card p-3 rounded-lg flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
            {answer && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary rounded-full text-primary-foreground">
                  <Bot size={20} />
                </div>
                <div className="bg-card p-3 rounded-lg text-sm">
                  {answer}
                </div>
              </div>
            )}
            {!isLoading && !answer && (
                <div className="text-center text-sm text-muted-foreground space-y-2">
                    <p className="font-semibold">Here are some ideas:</p>
                    <ul className="list-disc list-inside text-left text-xs">
                        <li>How many thefts happened in Connaught Place last month?</li>
                        <li>What were the crime trends in Vasant Kunj during September?</li>
                        <li>Show all accidents in Karol Bagh.</li>
                    </ul>
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="e.g., How many thefts in Karol Bagh last month?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isLoading}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
