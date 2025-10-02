"use client"

import React from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';

export default function MapProvider({ children }: { children: React.ReactNode }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // The pages using this provider will handle the missing key message.
    return <>{children}</>;
  }

  return (
    <APIProvider 
        apiKey={apiKey}
        onLoad={() => console.log("Maps API loaded.")}
    >
        {children}
    </APIProvider>
  );
}
