"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import PixelBlast from "@/components/effects/PixelBlast";
import { useTheme } from "next-themes";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-background">
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
            <Badge variant="outline" className="mb-6 backdrop-blur-sm">
                <Sparkles className="mr-2 h-3 w-3" />
                New Background
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-foreground animate-fade-in-down">
              It&apos;s dangerous to go alone!
              <br/>
              <span className="text-4xl md:text-6xl text-muted-foreground">Take this.</span>
            </h1>
            
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
