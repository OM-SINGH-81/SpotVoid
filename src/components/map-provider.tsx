"use client"

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

export default function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
        <div className="flex h-screen items-center justify-center p-8">
            <Alert variant="destructive" className="max-w-md">
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Google Maps API Key Missing</AlertTitle>
                <AlertDescription>
                    Please add your Google Maps API key to the <code>.env.local</code> file to enable map features.
                    <br />
                    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
                    </code>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      {children}
    </APIProvider>
  );
}
