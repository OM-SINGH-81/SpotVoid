"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Brain, Map, BarChart3 } from "lucide-react";

// ✅ Dynamic import of PixelBlast (avoids SSR issues)
const PixelBlast = dynamic(() => import("@/components/effects/PixelBlast"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
      Loading background...
    </div>
  ),
});

export default function LandingPage() {
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBg(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* ✅ PixelBlast Background with fade animation */}
      {showBg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-0"
        >
          <PixelBlast variant="square" pixelSize={8} color="#EE0000" />
        </motion.div>
      )}

      {/* ✅ Hero Section */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 pt-24">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl font-extrabold text-white drop-shadow-lg"
        >
          Predict & Prevent Crime Before It Happens
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="mt-6 max-w-2xl text-lg text-gray-200"
        >
          AI-powered predictive policing to keep cities safer, smarter, and one
          step ahead of crime.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4 }}
          className="mt-10"
        >
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white shadow-lg transition-transform hover:scale-105"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </motion.div>
      </section>

      {/* ✅ Features Section */}
      <section className="relative py-24 px-8 bg-black/40 z-10">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 lg:grid-cols-4 text-center">
          {[
            {
              icon: <Shield className="w-10 h-10 mx-auto mb-4 text-red-500" />,
              title: "Real-time Protection",
              desc: "Detect threats before they escalate with AI-driven insights.",
            },
            {
              icon: <Brain className="w-10 h-10 mx-auto mb-4 text-red-500" />,
              title: "AI Predictions",
              desc: "Leverage machine learning to predict high-risk zones.",
            },
            {
              icon: <Map className="w-10 h-10 mx-auto mb-4 text-red-500" />,
              title: "Smart Mapping",
              desc: "Visualize hotspots with geospatial crime analytics.",
            },
            {
              icon: (
                <BarChart3 className="w-10 h-10 mx-auto mb-4 text-red-500" />
              ),
              title: "Data Insights",
              desc: "Make informed policing decisions with real-time reports.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white/5 backdrop-blur border border-white/10 shadow-md"
            >
              {f.icon}
              <h3 className="text-xl font-semibold text-white mb-3">
                {f.title}
              </h3>
              <p className="text-gray-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ CTA Section */}
      <section className="relative py-24 px-8 flex justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl text-center bg-black/20 rounded-2xl shadow-lg p-12 backdrop-blur"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to make cities safer?
          </h2>
          <p className="text-lg text-gray-300 mb-10">
            Join law enforcement agencies already using CrimeWise to predict
            crime before it happens.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white shadow-lg transition-transform hover:scale-105"
          >
            <Link href="/contact">Request Demo</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
