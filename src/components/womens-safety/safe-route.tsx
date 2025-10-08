
"use client"

import React, { useState } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Polyline } from '@/components/polyline';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Mock positions for start/end
const locations = {
    "Hauz Khas": { lat: 28.5493, lng: 77.2054 },
    "Karol Bagh": { lat: 28.6477, lng: 77.1912 },
};

// Mock paths based on the mock positions
const safePathData = [
    locations["Hauz Khas"],
    { lat: 28.57, lng: 77.21 },
    { lat: 28.60, lng: 77.19 },
    locations["Karol Bagh"]
];

const riskyPathData = [
    locations["Hauz Khas"],
    { lat: 28.56, lng: 77.195 },
    { lat: 28.62, lng: 77.18 },
    locations["Karol Bagh"]
];


export default function SafeRoute() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [showRoute, setShowRoute] = useState(false);

  const handleFindRoute = () => {
    if (start && end) {
      setShowRoute(true);
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="start-location">Start</Label>
                <Input id="start-location" placeholder="e.g., Hauz Khas" value={start} onChange={(e) => setStart(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="end-location">End</Label>
                <Input id="end-location" placeholder="e.g., Karol Bagh" value={end} onChange={(e) => setEnd(e.target.value)} />
            </div>
        </div>
        <Button onClick={handleFindRoute} className="w-full">Find Safe Route</Button>
        <div className="flex-1 w-full rounded-lg overflow-hidden border relative">
            <Map
                defaultCenter={{ lat: 28.6, lng: 77.2 }}
                defaultZoom={11.5}
                mapId="SAFE_ROUTE_MAP"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
            {showRoute && (
                <>
                    {/* Routes */}
                    <Polyline path={riskyPathData} strokeColor={'hsl(var(--destructive))'} strokeWeight={5} strokeOpacity={0.6} />
                    <Polyline path={safePathData} strokeColor={'hsl(var(--primary))'} strokeWeight={6} strokeOpacity={0.9} />

                    {/* Markers */}
                    <AdvancedMarker position={locations["Hauz Khas"]}>
                        <Pin background={'#4caf50'} glyphColor={'#fff'} borderColor={'#4caf50'} />
                    </AdvancedMarker>
                     <AdvancedMarker position={locations["Karol Bagh"]}>
                        <Pin background={'#f44336'} glyphColor={'#fff'} borderColor={'#f44336'} />
                    </AdvancedMarker>
                </>
            )}
            </Map>
            {showRoute && (
                <div className="absolute bottom-2 left-2 right-2 bg-card/80 backdrop-blur-sm p-2 rounded-md text-xs flex justify-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span>Safe Route</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>Risky Route</span>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
