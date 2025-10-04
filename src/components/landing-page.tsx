"use client";

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PixelBlast } from '@/components/effects/PixelBlast';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 text-center">
        {/* Background Effect */}
        <div className="absolute inset-0 z-0 opacity-30">
          <PixelBlast />
        </div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              SPOTVOID
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 text-gray-300">
            See the Blind Spots Before Crime Strikes
          </p>
          <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
            Advanced AI-powered crime prediction and prevention platform. Helping law enforcement agencies and communities stay one step ahead.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              onClick={() => router.push('/dashboard')}
            >
              Enter Dashboard
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              onClick={() => router.push('/womens-safety')}
            >
              Women's Safety
            </Button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2025 SPOTVOID. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}