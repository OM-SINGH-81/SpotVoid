
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { DateRange } from "react-day-picker"
import { addDays, format, parseISO } from "date-fns"

import { PredictCrimeInput, PredictCrimeOutput } from "@/ai/flows/ai-crime-prediction"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"
import GeneratingLoader from "../ui/generating-loader"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

type CrimePredictionProps = {
  filters: Omit<PredictCrimeInput, 'dateRange'> | null;
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    const value = e.target.value;
    if (!value) {
      setDateRange({
        ...dateRange,
        [field]: undefined
      });
      return;
    }

    try {
      const newDate = parseISO(value);
      setDateRange({
        ...dateRange,
        [field]: newDate,
      });
    } catch (error) {
      console.error("Invalid date format", error);
    }
  };

  const predictionFilters = useMemo(() => {
    if (!filters || !dateRange?.from || !dateRange?.to) return null;
    return {
      ...filters,
      dateRange: {
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
      },
    };
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
      try {
        const response = await fetch('/api/predict-crime', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(predictionFilters)
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || "An unexpected error occurred.");
        }
        const result: PredictCrimeOutput = await response.json();
        setPrediction(result);
        onPredictionChange(result);
      } catch (e: any) {
        console.error("Crime prediction error:", e)
        setError(e.message || "Failed to generate crime prediction.")
        onPredictionChange(null);
      } finally {
        onIsLoadingChange(false)
      }
    }
    
    if (predictionFilters && predictionFilters.crimeTypes.length > 0) {
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
       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-2">
            <div>
                <Label htmlFor="predict-start-date">Start Date</Label>
                <Input
                    id="predict-start-date"
                    type="date"
                    value={dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange(e, 'from')}
                    className="mt-1"
                />
            </div>
             <div>
                <Label htmlFor="predict-end-date">End Date</Label>
                <Input
                    id="predict-end-date"
                    type="date"
                    value={dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : ''}
                    onChange={(e) => handleDateChange(e, 'to')}
                    className="mt-1"
                />
            </div>
        </div>
      </div>

      {isLoading && (
        <div className="relative h-96 flex items-center justify-center">
            <GeneratingLoader />
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
