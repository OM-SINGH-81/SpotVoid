
"use client"

import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { crimeData } from '@/lib/mock-data';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Incidents",
    color: "hsl(var(--chart-1))",
  },
};

export default function WomensSafetyTrends() {
  const harassmentData = useMemo(() => {
    return crimeData.filter(c => c.crimeType === 'Harassment');
  }, []);

  const trendsByStation = useMemo(() => {
    const stationCounts = new Map<string, number>();
    harassmentData.forEach(crime => {
        stationCounts.set(crime.policeStation, (stationCounts.get(crime.policeStation) || 0) + 1);
    });
    return Array.from(stationCounts.entries()).map(([name, count]) => ({ name, count }));
  }, [harassmentData]);
  
  return (
    <div className="h-48 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <ResponsiveContainer>
          <BarChart data={trendsByStation} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid horizontal={false} />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={10} width={80} />
            <XAxis dataKey="count" type="number" hide />
            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} content={<ChartTooltipContent />} />
            <Bar dataKey="count" name="Incidents" fill="var(--color-count)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
