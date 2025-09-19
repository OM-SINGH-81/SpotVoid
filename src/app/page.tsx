"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import PixelBlast from "@/components/effects/PixelBlast";

import { Shield } from "lucide-react";


export default function LandingPage() {
  const [showBg, setShowBg] = useState(false);

  // Delay PixelBlast load for better performance
  useEffect(() => {
    const timer = setTimeout(() => setShowBg(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-background" />
      
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen px-8">
        <div className="relative z-10 max-w-3xl mx-auto text-center px-8 py-12 
                        rounded-2xl shadow-xl overflow-hidden
                        before:absolute before:inset-0 before:-z-10 before:bg-background/80 before:backdrop-blur-md">
          
          {showBg && (
            <div className="absolute inset-0 -z-20">
                <PixelBlast
                  variant="circle"
                  pixelSize={6}
                  color="#B19EEF"
                  patternScale={3}
                  patternDensity={1.2}
                  pixelSizeJitter={0.5}
                  enableRipples
                  rippleSpeed={0.4}
                  rippleThickness={0.12}
                  rippleIntensityScale={1.5}
                  liquid
                  liquidStrength={0.12}
                  liquidRadius={1.2}
                  liquidWobbleSpeed={5}
                  speed={0.6}
                  edgeFade={0.25}
                  transparent
                />
            </div>
          )}

          {/* Logo/Header */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">CrimeWise</h1>
          </div>

          {/* Hero Text */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The Future of Crime Prediction
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-foreground/80 mb-10">
            Our AI model predicts crime hotspots and generates optimized patrol routes,
            empowering law enforcement to stay one step ahead.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
            >
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="transition-transform hover:scale-105"
            >
              <Link href="#">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">How It Works</h2>
          <p className="text-foreground/70 max-w-3xl mx-auto mb-12">
            CrimeWise leverages advanced AI and historical crime data to identify high-risk zones 
            and generate intelligent patrol strategies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-card rounded-xl shadow-md border">
              <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-foreground/70">
                Our AI processes thousands of data points to identify patterns in crime activity.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-md border">
              <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Hotspot Mapping</h3>
              <p className="text-foreground/70">
                High-risk zones are displayed on real-time maps with intuitive visuals.
              </p>
            </div>
            <div className="p-6 bg-card rounded-xl shadow-md border">
              <Shield className="h-10 w-10 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Predictive Insights</h3>
              <p className="text-foreground/70">
                Seasonal and time-based forecasts help in proactive resource allocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-8 flex justify-center">
        <div className="max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to make cities safer?
          </h2>
          <p className="text-lg text-foreground/70 mb-10">
            Join law enforcement agencies already using CrimeWise to predict crime 
            before it happens.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg transition-transform hover:scale-105"
          >
            <Link href="/dashboard">Get Started Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
