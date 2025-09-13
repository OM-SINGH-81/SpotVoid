"use client"

import React, { useState, useEffect } from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { predictCrime, PredictCrimeInput, PredictCrimeOutput } from "@/ai/flows/ai-crime-prediction"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

type CrimePredictionProps = {
  filters: PredictCrimeInput
}

export default function CrimePrediction({ filters }: CrimePredictionProps) {
  const [prediction, setPrediction] = useState<PredictCrimeOutput | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getPrediction = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await predictCrime(filters)
        setPrediction(result);
      } catch (e) {
        console.error("Crime prediction error:", e)
        setError("Failed to generate crime prediction. The AI model may be offline.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (filters.dateRange.startDate && filters.dateRange.endDate && filters.crimeTypes.length > 0) {
      getPrediction()
    } else {
      setIsLoading(false);
      setPrediction(null);
    }

  }, [filters])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>Prediction Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!prediction || (prediction.dailyPredictions.length === 0 && prediction.crimeTypeBreakdown.length === 0)) {
     return <div className="text-center text-muted-foreground py-10">Select filters to see predictions.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Daily Crime Count Prediction</h3>
        <div className="h-60 w-full">
          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer>
              <LineChart data={prediction.dailyPredictions} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="crimeCount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4">Crime Type Breakdown</h3>
        <div className="h-60 w-full">
          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer>
              <BarChart data={prediction.crimeTypeBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <YAxis dataKey="crimeType" type="category" fontSize={12} width={80} />
                <XAxis type="number" fontSize={12} />
                <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--muted))'}} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </div>
  )
}
