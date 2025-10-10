
"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";

import {
  crimeData,
  policeStations,
  crimeTypes as allCrimeTypes,
} from "@/lib/mock-data";
import { PredictCrimeOutput } from "@/ai/flows/ai-crime-prediction";
import MapProvider from "@/components/map-provider";
import Header from "@/components/header";
import Filters from "@/components/dashboard/filters";
import CrimePrediction from "@/components/dashboard/crime-prediction";
import ChatAssistant from "@/components/dashboard/chat-assistant";
import DashboardLoader from "@/components/dashboard-loader";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";


const CrimeHeatmap = dynamic(() => import("@/components/dashboard/crime-heatmap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const PatrolRoutes = dynamic(() => import("@/components/dashboard/patrol-routes"), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />,
});


const PixelBlast = dynamic(() => import("@/components/effects/PixelBlast"), {
  ssr: false,
  loading: () => null,
});

const MissingKeyMessage = () => (
    <div className="flex h-[calc(100vh-10rem)] items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Google Maps API Key Missing or Invalid</AlertTitle>
            <AlertDescription>
                Please add a valid Google Maps API key to the <code>.env.local</code> file to enable map features.
                <br />
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold mt-2 block">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
                </code>
            </AlertDescription>
        </Alert>
    </div>
);


export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showBg, setShowBg] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(false);


  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== "YOUR_API_KEY" && apiKey.length > 5) {
      setIsApiKeyValid(true);
    }
    const timer = setTimeout(() => {
      setDateRange({
        from: addDays(new Date(), -15),
        to: new Date(),
      });
      setShowBg(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [selectedCrimeTypes, setSelectedCrimeTypes] = useState<string[]>(
    allCrimeTypes.map((ct) => ct.value)
  );

  const [prediction, setPrediction] = useState<PredictCrimeOutput | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(true);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const filteredCrimeData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    return crimeData.filter((crime) => {
      const crimeDate = new Date(crime.date);
      const isDateInRange =
        crimeDate >= dateRange.from! && crimeDate <= dateRange.to!;
      const isStationMatch =
        selectedStation === "all" || crime.policeStation === selectedStation;
      const isCrimeTypeMatch = selectedCrimeTypes.includes(crime.crimeType);
      return isDateInRange && isStationMatch && isCrimeTypeMatch;
    });
  }, [dateRange, selectedStation, selectedCrimeTypes]);

  const filtersForAI = useMemo(
    () => {
        if (!dateRange?.from || !dateRange?.to) return null;
        return {
            dateRange: {
                startDate: dateRange.from.toISOString(),
                endDate: dateRange.to.toISOString(),
            },
            policeStation: selectedStation,
            crimeTypes: selectedCrimeTypes,
        }
    },
    [selectedStation, selectedCrimeTypes, dateRange]
  );

  return (
    <>
      {!dateRange && <DashboardLoader />}
      {showBg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="fixed inset-0 z-[-1] pointer-events-none"
        >
          <PixelBlast
            variant="square"
            pixelSize={6}
            color="#FF0000"
            speed={0.3}
            patternDensity={1.2}
            patternScale={1.8}
            className="w-full h-full"
          />
        </motion.div>
      )}
      <MapProvider>
        <div className="flex flex-col min-h-screen bg-transparent">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {!isApiKeyValid ? <MissingKeyMessage /> : (
            <div className="mx-auto max-w-screen-2xl space-y-8">
              {/* Filters + AI Assistant */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Filters */}
                <Card className="xl:col-span-2 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Crime Analytics & Filters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dateRange ? (
                      <>
                        <Filters
                          dateRange={dateRange}
                          setDateRange={setDateRange}
                          selectedStation={selectedStation}
                          setSelectedStation={setSelectedStation}
                          selectedCrimeTypes={selectedCrimeTypes}
                          setSelectedCrimeTypes={setSelectedCrimeTypes}
                        />
                        {/* Crime Quote Section */}

                        <div className="mt-8 p-6 rounded-xl text-center text-lg italic text-foreground shadow-sm">
                          "Technology and vigilance together help us predict and
                          prevent crime, ensuring the safety and justice of our
                          communities."
                        </div>
                      </>
                    ) : (
                      <div className="space-y-6">
                        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                        <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Assistant */}
                <Card className="bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>AI Assistant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      {!isAssistantOpen ? (
                        <button
                          onClick={() => setIsAssistantOpen(true)}
                          className="w-24 h-24 text-4xl flex items-center justify-center rounded-full 
                                     bg-accent text-accent-foreground hover:bg-blue-500 active:bg-blue-700 
                                     transition-colors shadow-lg"
                        >
                          🤖
                        </button>
                      ) : (
                        <div className="w-full">
                          <button
                            onClick={() => setIsAssistantOpen(false)}
                            className="mb-2 px-3 py-1 text-sm rounded-md bg-muted hover:bg-muted/70 transition"
                          >
                            Close
                          </button>
                          <ChatAssistant />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Heatmap */}
              <Card className="h-[500px] lg:h-[600px] flex flex-col bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Interactive Crime Heatmap</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  {dateRange ? (
                    <CrimeHeatmap data={filteredCrimeData} />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-md animate-pulse" />
                  )}
                </CardContent>
              </Card>

              {/* AI Crime Prediction */}
              <Card className="bg-card/50 backdrop-blur-sm">
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

              {/* Patrol Routes - Full width like Heatmap */}
              <Card className="h-[500px] lg:h-[600px] flex flex-col bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Optimized Patrol Routes</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <PatrolRoutes
                    prediction={prediction}
                    isLoadingPrediction={isLoadingPrediction}
                  />
                </CardContent>
              </Card>
            </div>
            )}
          </main>
        </div>
      </MapProvider>
    </>
  );
}
