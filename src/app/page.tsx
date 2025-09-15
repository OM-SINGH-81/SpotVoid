"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { BrainCircuit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center">
          <Image
            src="https://picsum.photos/seed/42/1800/1200"
            alt="Background"
            fill
            className="object-cover"
            data-ai-hint="digital security"
          />
          <div className="absolute inset-0 bg-background/70" />
          
          <div className="relative z-10 text-center p-4">
            <div 
              className="
                relative group
                w-full max-w-2xl mx-auto 
                p-8 rounded-2xl
                bg-card/50 border border-primary/20
                shadow-2xl shadow-primary/10
                backdrop-blur-lg
              "
            >
              <div 
                className="
                  absolute -top-12 left-1/2 -translate-x-1/2 
                  p-4 bg-primary/90 rounded-full 
                  border-4 border-background
                  animate-float
                  shadow-lg shadow-primary/30
                  group-hover:scale-110 transition-transform duration-300
                "
              >
                  <BrainCircuit className="h-16 w-16 text-primary-foreground" />
              </div>

              <div 
                className="
                  absolute inset-0 
                  bg-primary/10 rounded-2xl
                  blur-2xl opacity-30
                  animate-pulse
                "
              />

              <div className="relative pt-16">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
                  Welcome to CrimeWise
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground mb-8">
                  Harnessing the power of AI to analyze crime data, predict hotspots, and optimize patrol routes for a safer community.
                </p>
                <Button asChild size="lg" className="animate-pulse-slow">
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
