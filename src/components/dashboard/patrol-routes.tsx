"use client"

import React from 'react';
import { Map, AdvancedMarker, Pin, Polyline } from '@vis.gl/react-google-maps';
import type { PatrolHotspot, Position } from '@/lib/types';

type PatrolRoutesProps = {
  hotspots: PatrolHotspot[];
};

export default function PatrolRoutes({ hotspots }: PatrolRoutesProps) {
  const routePath = hotspots.map(h => h.position);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <Map
        defaultCenter={{ lat: 37.7749, lng: -122.4194 }}
        defaultZoom={12}
        mapId="PATROL_ROUTE_MAP"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {hotspots.map(hotspot => (
          <AdvancedMarker key={hotspot.id} position={hotspot.position}>
            <Pin background={'hsl(var(--accent))'} borderColor={'hsl(var(--accent))'} glyphColor={'hsl(var(--accent-foreground))'}>
              {hotspot.order}
            </Pin>
          </AdvancedMarker>
        ))}
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            strokeColor={'hsl(var(--primary))'}
            strokeOpacity={0.8}
            strokeWeight={3}
          />
        )}
      </Map>
    </div>
  );
}
