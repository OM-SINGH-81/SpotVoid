"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PixelBlast from "@/components/effects/PixelBlast";
import { Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 p-4 backdrop-blur-md bg-background/30 border-b border-border">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">CrimeWise</h1>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          {/* PixelBlast Background */}
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="#B19EEF"
            patternScale={2.5}
            patternDensity={1.6}
            pixelSizeJitter={1}
            enableRipples
            rippleSpeed={1}
            rippleThickness={0.2}
            rippleIntensityScale={3}
            liquid
            liquidStrength={0.25}
            liquidRadius={1}
            liquidWobbleSpeed={4}
            speed={0.5}
            edgeFade={0.15}
            className="absolute inset-0 w-full h-full"
          />

          {/* Centered Content with transparent bg */}
          <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 rounded-2xl bg-background/40 backdrop-blur-md shadow-xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
              The Future of Crime Prediction
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Our advanced AI model analyzes historical data to predict crime
              hotspots and generate optimized patrol routes, empowering law
              enforcement to stay one step ahead.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg transition-transform hover:scale-105"
              >
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-600 transition-transform hover:scale-105"
              >
                <Link href="#">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
