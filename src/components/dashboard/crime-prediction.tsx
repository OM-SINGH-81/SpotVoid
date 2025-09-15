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
  onPredictionChange: (prediction: PredictCrimeOutput | null) => void;
  isLoading: boolean;
  onIsLoadingChange: (isLoading: boolean) => void;
}

const chartConfig = {
  historicalCount: {
    label: "Historical",
    color: "hsl(var(--secondary-foreground) / 0.7)",
  },
  predictedCount: {
    label: "Predicted",
    color: "hsl(var(--primary))",
  },
};

export default function CrimePrediction({ filters, onPredictionChange, isLoading, onIsLoadingChange }: CrimePredictionProps) {
  const [prediction, setPrediction] = useState<PredictCrimeOutput | null>(null)
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
        onPredictionChange(null);
        onIsLoadingChange(false);
        return;
      }
      onIsLoadingChange(true)
      setError(null)
      // try {
      //   const result = await predictCrime(predictionFilters)
      //   setPrediction(result);
      //   onPredictionChange(result);
      // } catch (e) {
      //   console.error("Crime prediction error:", e)
      //   setError("Failed to generate crime prediction. The AI model may be offline.")
      //   onPredictionChange(null);
      // } finally {
      //   onIsLoadingChange(false)
      // }
      
      // Temporarily disable API call
      console.log("API call to predictCrime disabled for UI development.");
      onIsLoadingChange(false);
      onPredictionChange(null);
    }
    
    if (predictionFilters && filters.crimeTypes.length > 0) {
      getPrediction()
    } else {
      onIsLoadingChange(false);
      setPrediction(null);
      onPredictionChange(null);
    }

  }, [predictionFilters, onPredictionChange, onIsLoadingChange])

  const combinedBreakdown = useMemo(() => {
    if (!prediction) return [];
    
    const combined = new Map<string, { crimeType: string, historicalCount: number, predictedCount: number }>();
    
    const allCrimeTypeNames = new Set([
        ...(prediction.historicalCrimeTypeBreakdown?.map(item => item.crimeType) || []),
        ...(prediction.predictedCrimeTypeBreakdown?.map(item => item.crimeType) || [])
    ]);

    allCrimeTypeNames.forEach(ct => {
        combined.set(ct, { crimeType: ct, historicalCount: 0, predictedCount: 0 });
    });

    prediction.historicalCrimeTypeBreakdown?.forEach(item => {
        if(combined.has(item.crimeType)) {
            combined.get(item.crimeType)!.historicalCount = item.count;
        }
    });

    prediction.predictedCrimeTypeBreakdown?.forEach(item => {
        if(combined.has(item.crimeType)) {
            combined.get(item.crimeType)!.predictedCount = item.count;
        }
    });

    return Array.from(combined.values());
  }, [prediction]);

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

      {!isLoading && !error && (!prediction || (prediction.dailyData.length === 0 && combinedBreakdown.length === 0)) && (
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
                    <YAxis fontSize={12} allowDecimals={false} />
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
            <h3 className="text-lg font-medium mb-4">Crime Type Breakdown</h3>
            <div className="h-60 w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer>
                  <BarChart data={combinedBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <YAxis dataKey="crimeType" type="category" fontSize={12} width={80} />
                    <XAxis type="number" fontSize={12} allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--muted))'}} />
                    <Legend />
                    <Bar dataKey="historicalCount" name="Historical" fill={chartConfig.historicalCount.color} radius={[4, 0, 0, 4]} />
                    <Bar dataKey="predictedCount" name="Predicted" fill={chartConfig.predictedCount.color} radius={[0, 4, 4, 0]} />
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
