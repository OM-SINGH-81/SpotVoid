"use client"

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { Building } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center">
          <Image
            src="https://picsum.photos/seed/10/1800/1200"
            alt="Background"
            fill
            className="object-cover"
            data-ai-hint="cityscape night"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 text-center text-white p-4">
            <div className="inline-block p-4 bg-primary/80 rounded-2xl mb-6 backdrop-blur-sm">
                <Building className="h-16 w-16 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Welcome to CrimeWise
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto text-primary-foreground/80 mb-8">
              Harnessing the power of AI to analyze crime data, predict hotspots, and optimize patrol routes for a safer community.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}