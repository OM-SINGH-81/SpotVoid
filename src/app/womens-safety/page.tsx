"use client";

import React from "react";
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
import { ShieldAlert, Map, BarChart2, Siren, Route, MessageSquareWarning, Building } from "lucide-react";


export default function WomensSafetyPage() {
  return (
    <MapProvider>
      <div className="flex flex-col min-h-screen bg-background">
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
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Map /> Women-Specific Crime Heatmap</CardTitle>
                    <CardDescription>Hotspots of harassment, assault, and stalking.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="w-full h-full bg-muted rounded-md animate-pulse flex items-center justify-center text-muted-foreground">
                        <p>Heatmap coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Analytics & Tools */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 /> Trends & Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="w-full h-48 bg-muted rounded-md animate-pulse flex items-center justify-center text-muted-foreground">
                        <p>Charts coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Siren /> Predictive Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center p-4">Alerts will appear here...</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Route /> Safe Route Recommendation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full h-32 bg-muted rounded-md animate-pulse flex items-center justify-center text-muted-foreground">
                        <p>Safe Route feature coming soon...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquareWarning /> Community Feedback</CardTitle>
                        <CardDescription>Crowd-sourced safety information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="w-full h-40 bg-muted rounded-md animate-pulse flex items-center justify-center text-muted-foreground">
                            <p>Feedback system coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Building /> Action Panel for Authorities</CardTitle>
                        <CardDescription>Quick insights for intervention planning.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-40 bg-muted rounded-md animate-pulse flex items-center justify-center text-muted-foreground">
                            <p>Action panel coming soon...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

          </motion.div>
        </main>
      </div>
    </MapProvider>
  );
}
