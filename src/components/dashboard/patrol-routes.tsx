"use client"

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Loader2, TriangleAlert, Route, Clock, Ruler } from 'lucide-react';

import { Polyline } from '@/components/polyline';
import type { PatrolHotspot } from '@/lib/types';
import { generatePatrolRoute, GeneratePatrolRouteInput, GeneratePatrolRouteOutput } from '@/ai/flows/ai-patrol-routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type PatrolRoutesProps = {
  filters: GeneratePatrolRouteInput;
};

export default function PatrolRoutes({ filters }: PatrolRoutesProps) {
  const [route, setRoute] = useState<GeneratePatrolRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRoute = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await generatePatrolRoute(filters);
        setRoute(result);
      } catch (e) {
        console.error("Patrol route generation error:", e);
        setError("Failed to generate patrol route. The AI model may be offline.");
      } finally {
        setIsLoading(false);
      }
    };

    if (filters.dateRange.startDate && filters.dateRange.endDate && filters.crimeTypes && filters.crimeTypes.length > 0) {
      getRoute();
    } else {
        setIsLoading(false);
        setRoute(null);
    }
  }, [filters]);

  const routePath = route?.hotspots.sort((a,b) => a.order - b.order).map(h => h.position) || [];

  return (
    <div className="w-full h-full flex flex-col">
        {route && !isLoading && !error && (
            <div className="flex items-center justify-center gap-6 p-4 border-b text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Route className="w-5 h-5 text-primary" />
                    <strong>Route Info:</strong>
                </div>
                <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span>{route.totalDistance}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{route.estimatedTime}</span>
                </div>
            </div>
        )}
        <div className="w-full h-full rounded-b-lg overflow-hidden relative flex-1">
            {isLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating optimized route...</p>
                </div>
                </div>
            )}
            {!isLoading && error && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4">
                    <Alert variant="destructive">
                        <TriangleAlert className="h-4 w-4" />
                        <AlertTitle>Route Generation Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </div>
            )}
            {!isLoading && !error && (!route || route.hotspots.length === 0) && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <p className="text-muted-foreground">Select filters to generate a patrol route.</p>
                </div>
            )}
            <Map
                defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
                defaultZoom={11}
                mapId="PATROL_ROUTE_MAP"
                gestureHandling={'greedy'}
                disableDefaultUI={true}
            >
                {route?.hotspots.map(hotspot => (
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
    </div>
  );
}