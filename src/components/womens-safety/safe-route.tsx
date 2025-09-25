
"use client"

import React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import { Polyline } from '@/components/polyline';

const safePath = [
    { lat: 28.63, lng: 77.22 },
    { lat: 28.635, lng: 77.225 },
    { lat: 28.63, lng: 77.23 },
    { lat: 28.625, lng: 77.235 },
];

const riskyPath = [
    { lat: 28.63, lng: 77.22 },
    { lat: 28.625, lng: 77.225 },
    { lat: 28.63, lng: 77.23 },
    { lat: 28.625, lng: 77.235 },
];

export default function SafeRoute() {
  return (
    <div className="w-full h-32 rounded-lg overflow-hidden border">
       <Map
        defaultCenter={{ lat: 28.63, lng: 77.225 }}
        defaultZoom={14}
        mapId="SAFE_ROUTE_MAP"
        gestureHandling={'none'}
        disableDefaultUI={true}
      >
        <Polyline path={riskyPath} strokeColor={'hsl(var(--destructive))'} strokeWeight={5} strokeOpacity={0.7} />
        <Polyline path={safePath} strokeColor={'hsl(var(--primary))'} strokeWeight={6} strokeOpacity={0.9} />
      </Map>
    </div>
  );
}
