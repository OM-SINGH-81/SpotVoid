"use client"

import React from 'react';
import { APIProvider, Status } from '@vis.gl/react-google-maps';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

const MissingKeyMessage = () => (
    <div className="flex h-screen items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Google Maps API Key Missing or Invalid</AlertTitle>
            <AlertDescription>
                Please add a valid Google Maps API key to the <code>.env.local</code> file to enable map features.
                <br />
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold mt-2 block">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_API_KEY"
                </code>
            </AlertDescription>
        </Alert>
    </div>
);

export default function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <MissingKeyMessage />;
  }

  return (
    <APIProvider 
        apiKey={apiKey}
        render={status => {
            switch(status) {
                case Status.LOADING:
                    return <div className="flex h-screen items-center justify-center"><p>Loading maps...</p></div>;
                case Status.FAILURE:
                    return <MissingKeyMessage />;
                case Status.SUCCESS:
                    return children;
            }
        }}
    >
    </APIProvider>
  );
}
