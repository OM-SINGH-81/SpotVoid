
"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import MapProvider from "@/components/map-provider";
import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Map, BarChart2, Siren, Route, MessageSquareWarning, Building } from "lucide-react";
import WomensSafetyHeatmap from "@/components/womens-safety/womens-safety-heatmap";
import WomensSafetyTrends from "@/components/womens-safety/womens-safety-trends";
import SafeRoute from "@/components/womens-safety/safe-route";
import PlaceholderCard from "@/components/womens-safety/placeholder-card";

const PixelBlast = dynamic(() => import("@/components/effects/PixelBlast"), {
  ssr: false,
  loading: () => null,
});

export default function WomensSafetyPage() {
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBg(true);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
            <motion.div 
              className="mx-auto max-w-screen-2xl space-y-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-primary">Women's Safety Dashboard</h1>
                <p className="mt-2 text-lg text-muted-foreground">Dedicated analytics for women's safety & protection.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Heatmap */}
                <div className="lg:col-span-2">
                  <Card className="h-[600px] flex flex-col bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Map /> Women-Specific Crime Heatmap</CardTitle>
                      <CardDescription>Hotspots of harassment, assault, and stalking.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <WomensSafetyHeatmap />
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Analytics & Tools */}
                <div className="space-y-8">
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><BarChart2 /> Trends & Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                       <WomensSafetyTrends />
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Siren /> Predictive Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PlaceholderCard message="Predictive alerts coming soon..." />
                    </CardContent>
                  </Card>
                   <Card className="bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Route /> Safe Route Recommendation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SafeRoute />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><MessageSquareWarning /> Community Feedback</CardTitle>
                          <CardDescription>Crowd-sourced safety information.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <PlaceholderCard message="Feedback system coming soon..." />
                      </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-2"><Building /> Action Panel for Authorities</CardTitle>
                          <CardDescription>Quick insights for intervention planning.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <PlaceholderCard message="Action panel coming soon..." />
                      </CardContent>
                  </Card>
              </div>

            </motion.div>
          </main>
        </div>
      </MapProvider>
    </>
  );
}
