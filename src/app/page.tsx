"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PixelBlast from "@/components/effects/PixelBlast";
import { Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="fixed top-0 left-0 w-full z-50 p-4">
        <div className="container mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
                    <Shield className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">CrimeWise</h1>
            </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          <PixelBlast
            variant="square"
            pixelSize={5}
            color="hsl(var(--accent))"
            patternScale={3}
            patternDensity={1.2}
            pixelSizeJitter={0.5}
            speed={0.2}
            edgeFade={0.1}
            transparent
            className="absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="relative z-10 p-4 flex flex-col items-center">
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-foreground animate-fade-in-down">
              The Future of Crime Prediction
            </h1>
             <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
              Our advanced AI model analyzes historical data to predict crime hotspots and generate optimized patrol routes, empowering law enforcement to stay one step ahead.
            </p>
            
            <div className="flex items-center gap-4 mt-8">
                <Button asChild size="lg">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="#">Learn More</Link>
                </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
