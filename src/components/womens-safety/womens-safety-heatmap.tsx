
"use client"

import React from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Pin } from '@vis.gl/react-google-maps';

import { crimeData } from '@/lib/mock-data';
import { HarassmentIcon } from '@/components/icons';

const harassmentData = crimeData.filter(crime => crime.crimeType === 'Harassment');

export default function WomensSafetyHeatmap() {
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
          >
            <Pin
              background={'hsl(var(--chart-1))'}
              glyphColor={"#fff"}
              borderColor={'hsl(var(--chart-1))'}
            >
                <HarassmentIcon className="w-5 h-5" />
            </Pin>
          </AdvancedMarker>
        ))}
      </Map>
    </div>
  );
}
