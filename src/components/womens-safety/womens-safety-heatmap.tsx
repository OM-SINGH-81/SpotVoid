
"use client"

import React, { useState } from 'react';
import { Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { format } from 'date-fns';

import { crimeData } from '@/lib/mock-data';
import { HarassmentIcon } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const harassmentData = crimeData.filter(crime => crime.crimeType === 'Harassment');

export default function WomensSafetyHeatmap() {
  const [selectedCrimeId, setSelectedCrimeId] = useState<string | null>(null);

  const selectedCrime = harassmentData.find(crime => crime.id === selectedCrimeId);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <Map
        defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
        defaultZoom={11}
        mapId="WOMENS_SAFETY_MAP"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {harassmentData.map(crime => (
          <AdvancedMarker
            key={crime.id}
            position={crime.position}
            onClick={() => setSelectedCrimeId(crime.id)}
            onPointerEnter={() => setSelectedCrimeId(crime.id)}
            onPointerLeave={() => setSelectedCrimeId(null)}
          >
            <Pin
              background={'hsl(var(--chart-5))'}
              glyphColor={"#fff"}
              borderColor={'hsl(var(--chart-5))'}
            >
                <HarassmentIcon className="w-5 h-5" />
            </Pin>
          </AdvancedMarker>
        ))}

        {selectedCrime && (
          <InfoWindow
            position={selectedCrime.position}
            onCloseClick={() => setSelectedCrimeId(null)}
            pixelOffset={[0, -40]}
          >
            <Card className="border-none shadow-none max-w-xs">
              <CardHeader className="p-2">
                <CardTitle className="text-base flex items-center gap-2">
                   <HarassmentIcon className="w-5 h-5" /> {selectedCrime.crimeType}
                </CardTitle>
                <CardDescription className="font-code">{selectedCrime.id}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 text-sm">
                <p><strong>Date:</strong> {format(new Date(selectedCrime.date), 'PPp')}</p>
                <p><strong>Station:</strong> {selectedCrime.policeStation}</p>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
