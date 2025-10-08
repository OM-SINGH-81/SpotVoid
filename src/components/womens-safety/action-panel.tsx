
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { TriangleAlert, Info } from 'lucide-react';

import { Polyline } from '@/components/polyline';
import { GeneratePatrolRouteOutput } from '@/ai/flows/ai-patrol-routes';
import type { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { crimeData } from '@/lib/mock-data';
import type { Position } from '@/lib/types';

type ActionPanelProps = {
  prediction: PredictCrimeOutput | null;
};

// Helper function to calculate distance between two lat/lng points
function getDistanceFromLatLonInKm(pos1: Position, pos2: Position) {
  const R = 6371; // Radius of the earth in km
  const dLat = (pos2.lat - pos1.lat) * (Math.PI/180);
  const dLon = (pos2.lng - pos1.lng) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1.lat * (Math.PI/180)) * Math.cos(pos2.lat * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

export default function ActionPanel({ prediction }: ActionPanelProps) {
  const [route, setRoute] = useState<GeneratePatrolRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  const generatedRoute = useMemo(() => {
    if (!prediction || prediction.predictedCrimeTypeBreakdown.length === 0) {
      return null;
    }
    try {
      const topCrimeTypes = prediction.predictedCrimeTypeBreakdown
        .sort((a, b) => b.count - a.count)
        .map(p => p.crimeType);
  
      const plausibleLocations = crimeData.filter(crime => 
        topCrimeTypes.includes(crime.crimeType)
      );
  
      const selectedHotspots = plausibleLocations.slice(0, 5);
  
      if (selectedHotspots.length === 0) {
        return null;
      }
  
      const orderedHotspots = selectedHotspots
        .sort((a, b) => a.position.lat - b.position.lat)
        .map((hotspot, index) => ({
          id: `hs-${hotspot.id}`,
          name: `${index + 1}. ${hotspot.crimeType} Hotspot`,
          description: `Near ${hotspot.policeStation} station, reported on ${new Date(hotspot.date).toLocaleDateString()}.`,
          position: hotspot.position,
          order: index + 1,
        }));
  
      let totalDistance = 0;
      for (let i = 0; i < orderedHotspots.length - 1; i++) {
        totalDistance += getDistanceFromLatLonInKm(orderedHotspots[i].position, orderedHotspots[i+1].position);
      }
  
      const estimatedTime = (totalDistance / 20) * 60;
  
      return {
        hotspots: orderedHotspots,
        totalDistance: `${totalDistance.toFixed(1)} km`,
        estimatedTime: `${Math.round(estimatedTime)} min`,
      };
    } catch (e) {
      console.error("Error generating client-side route:", e);
      setError("Failed to process data for patrol route.");
      return null;
    }
  }, [prediction]);


  useEffect(() => {
    setIsLoading(true);
    setError(null);
    if (prediction) {
        setRoute(generatedRoute);
    } else {
        setRoute(null);
    }
    setIsLoading(false);
  }, [prediction, generatedRoute]);
  
  const sortedHotspots = route?.hotspots.sort((a,b) => a.order - b.order) || [];
  const routePath = sortedHotspots.map(h => h.position);
  const hoveredHotspot = route?.hotspots.find(h => h.id === hoveredHotspotId);
  const showInsufficientDataMessage = !isLoading && !error && route && route.hotspots.length > 0 && routePath.length < 2;

  if(isLoading) {
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
        <div className="text-muted-foreground text-sm text-center h-full flex items-center justify-center p-4">
            No actionable route available based on current safety trends.
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
                <div className="font-semibold">Route:</div>
                <div>{route.totalDistance}</div>
                <div>{route.estimatedTime}</div>
            </div>
        </div>
    </div>
  );
}
