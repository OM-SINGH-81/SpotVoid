
"use client"

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { TriangleAlert, Route, Clock, Ruler, Info } from 'lucide-react';

import { Polyline } from '@/components/polyline';
import { GeneratePatrolRouteOutput } from '@/ai/flows/ai-patrol-routes';
import type { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';

type ActionPanelProps = {
  prediction: PredictCrimeOutput | null;
};

export default function ActionPanel({ prediction }: ActionPanelProps) {
  const [route, setRoute] = useState<GeneratePatrolRouteOutput | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  useEffect(() => {
    const getRoute = async () => {
      if (!prediction) {
        setRoute(null);
        setIsLoadingRoute(false);
        return;
      }
      setIsLoadingRoute(true);
      setError(null);
      try {
        const response = await fetch('/api/generate-route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ predictedData: prediction, policeStation: 'all' })
        });
        if (!response.ok) {
            const errorBody = await response.json();
            throw new Error(errorBody.error || "An unexpected error occurred.");
        }
        const result: GeneratePatrolRouteOutput = await response.json();
        setRoute(result);
      } catch (e: any) {
        console.error("Patrol route generation error:", e);
        setError(e.message || "Failed to generate patrol route.");
      } finally {
        setIsLoadingRoute(false);
      }
    };

    getRoute();

  }, [prediction]);
  
  const sortedHotspots = route?.hotspots.sort((a,b) => a.order - b.order) || [];
  const routePath = sortedHotspots.map(h => h.position);
  const hoveredHotspot = route?.hotspots.find(h => h.id === hoveredHotspotId);
  const showInsufficientDataMessage = !isLoadingRoute && !error && route && route.hotspots.length > 0 && routePath.length < 2;

  if(isLoadingRoute) {
    return <Skeleton className="w-full h-full" />
  }

  if (error) {
    return (
        <Alert variant="destructive" className="h-full">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Route Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  if (!route || route.hotspots.length === 0) {
    return (
        <div className="text-muted-foreground text-sm text-center h-full flex items-center justify-center">
            No route data available based on current trends.
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden rounded-lg border">
        {showInsufficientDataMessage && (
            <div className="absolute top-2 left-2 right-2 z-10 p-2">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">The AI found one hotspot but needs more data to create a full route.</AlertDescription>
                </Alert>
            </div>
        )}
        <Map
            defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
            defaultZoom={11}
            mapId="WOMENS_ACTION_MAP"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
        >
            {sortedHotspots.map(hotspot => (
                <div key={hotspot.id} onMouseEnter={() => setHoveredHotspotId(hotspot.id)} onMouseLeave={() => setHoveredHotspotId(null)}>
                <AdvancedMarker position={hotspot.position}>
                    <Pin background={'hsl(var(--accent))'} borderColor={'hsl(var(--accent))'} glyphColor={'hsl(var(--accent-foreground))'}>
                    {hotspot.order}
                    </Pin>
                </AdvancedMarker>
                </div>
            ))}
            {hoveredHotspot && (
                <InfoWindow position={hoveredHotspot.position} pixelOffset={[0, -40]} onCloseClick={() => setHoveredHotspotId(null)}>
                    <Card className="border-none shadow-none max-w-xs">
                    <CardHeader className="p-2">
                        <CardTitle className="text-base">{hoveredHotspot.name}</CardTitle>
                        <CardDescription>{hoveredHotspot.description}</CardDescription>
                    </CardHeader>
                    </Card>
                </InfoWindow>
            )}
            {routePath.length > 1 && (
            <Polyline
                path={routePath}
                strokeColor={'hsl(var(--primary))'}
                strokeOpacity={0.8}
                strokeWeight={3}
            />
            )}
        </Map>
        <div className="bg-card/80 backdrop-blur-sm p-2 border-t text-xs">
            <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-1">
                    <Ruler className="w-3 h-3 text-muted-foreground" />
                    <span>{route.totalDistance}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{route.estimatedTime}</span>
                </div>
            </div>
        </div>
    </div>
  );
}
