"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { predictCrime, PredictCrimeInput, PredictCrimeOutput } from "@/ai/flows/ai-crime-prediction"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Calendar as CalendarIcon, TriangleAlert } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Label } from "../ui/label"

type CrimePredictionProps = {
  filters: Omit<PredictCrimeInput, 'dateRange'>;
}

const chartConfig = {
  historicalCount: {
    label: "Historical",
    color: "hsl(var(--secondary-foreground))",
  },
  predictedCount: {
    label: "Predicted",
    color: "hsl(var(--primary))",
  },
};

export default function CrimePrediction({ filters }: CrimePredictionProps) {
  const [prediction, setPrediction] = useState<PredictCrimeOutput | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -15),
    to: addDays(new Date(), 15),
  });

  const predictionFilters = useMemo((): PredictCrimeInput | null => {
    if (dateRange?.from && dateRange?.to) {
      return {
        ...filters,
        dateRange: {
          startDate: dateRange.from.toISOString(),
          endDate: dateRange.to.toISOString(),
        }
      }
    }
    return null;
  }, [filters, dateRange]);


  useEffect(() => {
    const getPrediction = async () => {
      if (!predictionFilters) {
        setPrediction(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await predictCrime(predictionFilters)
        setPrediction(result);
      } catch (e) {
        console.error("Crime prediction error:", e)
        setError("Failed to generate crime prediction. The AI model may be offline.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (predictionFilters && filters.crimeTypes.length > 0) {
      getPrediction()
    } else {
      setIsLoading(false);
      setPrediction(null);
    }

  }, [predictionFilters])

  return (
    <div className="space-y-6">
       <div>
        <Label>Prediction Date Range</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal mt-1",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {isLoading && (
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>Prediction Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && (!prediction || (prediction.dailyData.length === 0 && prediction.crimeTypeBreakdown.length === 0)) && (
        <div className="text-center text-muted-foreground py-10">Select filters to see predictions.</div>
      )}
      
      {!isLoading && !error && prediction && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Daily Crime Trend</h3>
            <div className="h-60 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer>
                  <LineChart data={prediction.dailyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="historicalCount" name="Historical" stroke={chartConfig.historicalCount.color} strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="predictedCount" name="Predicted" stroke={chartConfig.predictedCount.color} strokeWidth={2} strokeDasharray="5 5" dot={false}/>
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Future Crime Type Breakdown</h3>
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
      )}
    </div>
  )
}