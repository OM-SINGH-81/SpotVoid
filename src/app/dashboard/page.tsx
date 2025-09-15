"use client"

import React, { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

import { crimeData, policeStations, crimeTypes as allCrimeTypes } from '@/lib/mock-data';
import { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import MapProvider from '@/components/map-provider';
import Header from '@/components/header';
import Filters from '@/components/dashboard/filters';
import CrimeHeatmap from '@/components/dashboard/crime-heatmap';
import CrimePrediction from '@/components/dashboard/crime-prediction';
import PatrolRoutes from '@/components/dashboard/patrol-routes';
import ChatAssistant from '@/components/dashboard/chat-assistant';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState<string[]>(allCrimeTypes.map(ct => ct.value));

  const [prediction, setPrediction] = useState<PredictCrimeOutput | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);

  const filteredCrimeData = useMemo(() => {
    return crimeData.filter(crime => {
      const crimeDate = new Date(crime.date);
      const isDateInRange = dateRange?.from && dateRange?.to ? crimeDate >= dateRange.from && crimeDate <= dateRange.to : true;
      const isStationMatch = selectedStation === 'all' || crime.policeStation === selectedStation;
      const isCrimeTypeMatch = selectedCrimeTypes.includes(crime.crimeType);
      return isDateInRange && isStationMatch && isCrimeTypeMatch;
    });
  }, [dateRange, selectedStation, selectedCrimeTypes]);

  const filtersForAI = useMemo(() => ({
    policeStation: selectedStation,
    crimeTypes: selectedCrimeTypes
  }), [selectedStation, selectedCrimeTypes]);

  return (
    <MapProvider>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-screen-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Filters &amp; AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Filters
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      selectedStation={selectedStation}
                      setSelectedStation={setSelectedStation}
                      selectedCrimeTypes={selectedCrimeTypes}
                      setSelectedCrimeTypes={setSelectedCrimeTypes}
                    />
                  </div>
                  <div>
                    <ChatAssistant />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="h-[500px] lg:h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Interactive Crime Heatmap</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <CrimeHeatmap data={filteredCrimeData} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Crime Prediction</CardTitle>
                </CardHeader>
                <CardContent>
                  <CrimePrediction 
                    filters={filtersForAI}
                    onPredictionChange={setPrediction}
                    isLoading={isLoadingPrediction}
                    onIsLoadingChange={setIsLoadingPrediction}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimized Patrol Routes</CardTitle>
                </CardHeader>
                <CardContent className="h-[550px] p-0">
                  <PatrolRoutes prediction={prediction} isLoadingPrediction={isLoadingPrediction} />
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </MapProvider>
  );
}