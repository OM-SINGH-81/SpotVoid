"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const PixelBlast = dynamic(() => import("@/components/effects/PixelBlast"), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  return (
    <>
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

      <div className="flex flex-col min-h-screen bg-transparent">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center p-8 max-w-3xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              See the Blind Spots <br /> Before Crime Strikes
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              SpotVoid leverages cutting-edge AI to analyze crime data, predict
              emerging hotspots, and generate optimized patrol routes, creating
              safer communities for everyone.
            </p>
            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
