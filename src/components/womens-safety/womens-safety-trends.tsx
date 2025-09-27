
"use client"

import React, { useMemo, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { crimeData } from '@/lib/mock-data';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardDescription } from '../ui/card';
import type { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';

const barChartConfig = {
  count: {
    label: "Incidents",
    color: "hsl(var(--chart-1))",
  },
};

const pieChartConfig = {
    day: { label: 'Day', color: 'hsl(var(--chart-2))' },
    night: { label: 'Night', color: 'hsl(var(--chart-1))' },
}

type WomensSafetyTrendsProps = {
    onPredictionChange: (prediction: PredictCrimeOutput | null) => void;
};


export default function WomensSafetyTrends({ onPredictionChange }: WomensSafetyTrendsProps) {
  const harassmentData = useMemo(() => {
    return crimeData.filter(c => c.crimeType === 'Harassment');
  }, []);

  const trendsByStation = useMemo(() => {
    const stationCounts = new Map<string, number>();
    harassmentData.forEach(crime => {
        stationCounts.set(crime.policeStation, (stationCounts.get(crime.policeStation) || 0) + 1);
    });
    return Array.from(stationCounts.entries()).map(([name, count]) => ({ name, count })).sort((a,b) => a.count - b.count);
  }, [harassmentData]);
  
  const trendsByTime = useMemo(() => {
    const timeCounts = { day: 0, night: 0 };
    harassmentData.forEach(crime => {
        const hour = new Date(crime.date).getHours();
        if (hour >= 6 && hour < 18) {
            timeCounts.day++;
        } else {
            timeCounts.night++;
        }
    });
    return [{ name: 'Day', value: timeCounts.day }, { name: 'Night', value: timeCounts.night }];
  }, [harassmentData]);

  useEffect(() => {
    // This is a mock prediction based on the trend data.
    // In a real app, you might have a more complex prediction model.
    const mockPrediction: PredictCrimeOutput = {
        dailyData: [], // This would be populated by a prediction flow
        predictedCrimeTypeBreakdown: [{ crimeType: 'Harassment', count: trendsByStation.reduce((acc, s) => acc + s.count, 0) / 2 }], // Example
        historicalCrimeTypeBreakdown: trendsByStation.map(s => ({ crimeType: 'Harassment', count: s.count })),
    };
    onPredictionChange(mockPrediction);
  }, [trendsByStation, onPredictionChange]);


  return (
    <Tabs defaultValue="station" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="station">By Station</TabsTrigger>
            <TabsTrigger value="time">By Time of Day</TabsTrigger>
        </TabsList>
        <TabsContent value="station">
            <CardDescription className="text-center my-2">Incidents by Police Station</CardDescription>
            <div className="h-[250px] w-full">
                <ChartContainer config={barChartConfig} className="h-full w-full">
                    <ResponsiveContainer>
                    <BarChart data={trendsByStation} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <CartesianGrid horizontal={false} />
                        <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={9} width={70} interval={0} />
                        <XAxis dataKey="count" type="number" hide />
                        <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" name="Incidents" fill="var(--color-count)" radius={4} />
                    </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </TabsContent>
        <TabsContent value="time">
            <CardDescription className="text-center my-2">Incidents by Time of Day</CardDescription>
            <div className="h-[250px] w-full">
                <ChartContainer config={pieChartConfig} className="h-full w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={trendsByTime}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="var(--color-day)"
                                label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {trendsByTime.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Day' ? 'var(--color-day)' : 'var(--color-night)'} />
                                ))}
                            </Pie>
                             <Legend content={({ payload }) => {
                                return (
                                <ul className="flex justify-center gap-4 mt-4 text-xs">
                                    {
                                    payload?.map((entry, index) => (
                                        <li key={`item-${index}`} className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: entry.color}}></span>
                                        {entry.value}
                                        </li>
                                    ))
                                    }
                                </ul>
                                )
                            }} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </TabsContent>
    </Tabs>
  );
}
