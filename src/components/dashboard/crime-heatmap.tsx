"use client"

import React, { useState } from 'react';
import { Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import type { CrimeData } from '@/lib/types';
import { TheftIcon, AccidentIcon, HarassmentIcon } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

type CrimeHeatmapProps = {
  data: CrimeData[];
};

const crimeIconMap = {
  Theft: { icon: <TheftIcon className="w-5 h-5" />, color: "hsl(var(--destructive))" },
  Accident: { icon: <AccidentIcon className="w-5 h-5" />, color: "hsl(var(--accent))" },
  Harassment: { icon: <HarassmentIcon className="w-5 h-5" />, color: "hsl(var(--primary))" },
};

export default function CrimeHeatmap({ data }: CrimeHeatmapProps) {
  const [selectedCrimeId, setSelectedCrimeId] = useState<string | null>(null);

  const selectedCrime = data.find(crime => crime.id === selectedCrimeId);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <Map
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={12}
        mapId="CRIMEWISE_MAP"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {data.map(crime => (
          <AdvancedMarker
            key={crime.id}
            position={crime.position}
            onClick={() => setSelectedCrimeId(crime.id)}
            onPointerEnter={() => setSelectedCrimeId(crime.id)}
            onPointerLeave={() => setSelectedCrimeId(null)}
          >
            <Pin
              background={crimeIconMap[crime.crimeType]?.color || '#ccc'}
              glyphColor={"#fff"}
              borderColor={crimeIconMap[crime.crimeType]?.color || '#ccc'}
            >
              {crimeIconMap[crime.crimeType]?.icon}
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
                   {crimeIconMap[selectedCrime.crimeType]?.icon} {selectedCrime.crimeType}
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
