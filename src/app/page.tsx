"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Database, Map, BarChart3, Menu, X } from "lucide-react";

// Dynamic PixelBlast to avoid SSR issues
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowBg(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white overflow-x-hidden scroll-smooth">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-20 bg-black/50 backdrop-blur-md py-4 px-6 md:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-500">CrimeWise</h1>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="#features" className="hover:text-red-500 transition-colors">Features</Link>
          <Link href="#learn-more" className="hover:text-red-500 transition-colors">Why Choose Us</Link>
          <Link href="/dashboard" className="hover:text-red-500 transition-colors">Dashboard</Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed top-16 left-0 w-full h-fit bg-black/80 backdrop-blur-lg z-10 flex flex-col items-center space-y-6 py-8"
        >
          <Link href="#features" className="text-lg hover:text-red-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Features</Link>
          <Link href="#learn-more" className="text-lg hover:text-red-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Why Choose Us</Link>
          <Link href="/dashboard" className="text-lg hover:text-red-500 transition-colors" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
        </motion.div>
      )}


      {/* PixelBlast Background */}
      {showBg && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.2 }}
    className="fixed z-0 pointer-events-none 
               w-[105vw] h-[105vh] -top-[2vh] -left-[2vw]"
  >
    <PixelBlast
      variant="square"
      pixelSize={8}
      color="#FF0000"
      speed={0.5}
      patternDensity={1.5}
      patternScale={1.5}
      className="w-full h-full"
    />
  </motion.div>
)}



      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center flex-1 text-center px-6 pt-36 pb-36">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-5xl font-extrabold drop-shadow-lg"
        >
          Predict & Prevent Crime Before It Happens
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="mt-6 max-w-2xl text-lg text-gray-200"
        >
          Powered by secure API integrations and real-time data, CrimeWise helps agencies stay one step ahead of crime.
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
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white transition-transform hover:scale-105"
          >
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-24 px-8">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2 lg:grid-cols-4 text-center">
          {[
            { icon: <MapPin className="w-10 h-10 mx-auto mb-4 text-red-500" />, title: "Real-time Protection", desc: "Detect threats before they escalate using live data streams." },
            { icon: <Database className="w-10 h-10 mx-auto mb-4 text-red-500" />, title: "Data-Driven Predictions", desc: "Use integrated APIs to highlight high-risk zones instantly." },
            { icon: <Map className="w-10 h-10 mx-auto mb-4 text-red-500" />, title: "Smart Mapping", desc: "Visualize hotspots with interactive geospatial analytics." },
            { icon: <BarChart3 className="w-10 h-10 mx-auto mb-4 text-red-500" />, title: "Actionable Insights", desc: "Get clear, real-time reports for better decision making." },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm"
            >
              {f.icon}
              <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-300">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="relative py-24 px-8 flex justify-center">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl text-center bg-black/20 rounded-2xl p-12 backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold mb-6">Ready to make cities safer?</h2>
          <p className="text-lg text-gray-300 mb-10">
            Join law enforcement agencies already using <b>CrimeWise</b> to prevent crime and optimize city security.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500 text-white transition-transform hover:scale-105"
          >
            <Link href="#learn-more">Learn More</Link>
          </Button>
        </motion.div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more" className="relative py-24 px-8 text-center">
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-6"
        >
          Why Choose CrimeWise?
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-lg text-gray-300 mb-12"
        >
          CrimeWise integrates directly with secure APIs to provide predictive insights, optimized patrol routes, and reliable crime trend analysis — without heavy infrastructure or complex overhead.
        </motion.p>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            { title: "Seamless API Integration", desc: "Plug into existing police systems and data sources effortlessly." },
            { title: "Lightweight & Fast", desc: "Optimized for speed and accuracy without complex overhead." },
            { title: "Proven Reliability", desc: "Trusted by agencies for consistent and actionable insights." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-black/20 border border-white/10 backdrop-blur-sm"
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 backdrop-blur-md text-gray-400 py-6 text-center mt-12 z-10">
        &copy; {new Date().getFullYear()} CrimeWise. All rights reserved.
      </footer>
    </div>
  );
}
