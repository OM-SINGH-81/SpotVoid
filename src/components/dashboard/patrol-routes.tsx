
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { TriangleAlert, Route, Clock, Ruler, Info } from 'lucide-react';
import { Polyline } from '@/components/polyline';
import type { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GeneratingLoader from '../ui/generating-loader';
import type { Position } from '@/lib/types';


type PatrolRoutesProps = {
  prediction: PredictCrimeOutput | null;
  isLoadingPrediction: boolean;
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

type GeneratedRoute = {
    hotspots: (PredictCrimeOutput['predictedHotspots'][0] & { order: number })[];
    totalDistance: string;
    estimatedTime: string;
}


export default function PatrolRoutes({ prediction, isLoadingPrediction }: PatrolRoutesProps) {
  const [route, setRoute] = useState<GeneratedRoute | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  useEffect(() => {
    if (prediction && prediction.predictedHotspots && prediction.predictedHotspots.length > 0) {
        // Order hotspots by latitude to create a somewhat logical path
        const orderedHotspots = [...prediction.predictedHotspots].sort((a, b) => a.position.lat - b.position.lat);
        
        // Add an 'order' property for display
        const hotspotsWithOrder = orderedHotspots.map((h, i) => ({ ...h, order: i + 1 }));

        // Calculate distance and time
        let totalDistance = 0;
        for (let i = 0; i < hotspotsWithOrder.length - 1; i++) {
            totalDistance += getDistanceFromLatLonInKm(hotspotsWithOrder[i].position, hotspotsWithOrder[i+1].position);
        }
        
        // Average patrol speed: 20 km/h
        const estimatedTime = (totalDistance / 20) * 60; 

        setRoute({
            hotspots: hotspotsWithOrder,
            totalDistance: `${totalDistance.toFixed(1)} km`,
            estimatedTime: `${Math.round(estimatedTime)} min`,
        });

    } else {
        setRoute(null);
    }
  }, [prediction]);


  const isLoading = isLoadingPrediction;
  const sortedHotspots = route?.hotspots || [];
  const routePath = sortedHotspots.map(h => h.position);
  const hoveredHotspot = sortedHotspots.find(h => h.id === hoveredHotspotId);

  const showNoDataMessage = !isLoading && (!route || route.hotspots.length === 0);
  const showInsufficientDataMessage = !isLoading && route && route.hotspots.length > 0 && routePath.length < 2;

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden rounded-lg">
        <div className="absolute top-4 left-4 z-10 bg-card/80 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
            <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Route className="w-5 h-5 text-primary" />
                    <strong>Route Info:</strong>
                </div>
                <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span>{route?.totalDistance || '0 km'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{route?.estimatedTime || '0 min'}</span>
                </div>
            </div>
        </div>

        {isLoading && (
            <div className="absolute inset-0 z-20">
                <GeneratingLoader />
            </div>
        )}
        
        {showNoDataMessage && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                <p className="text-muted-foreground">Select filters and generate predictions to see a patrol route.</p>
            </div>
        )}

        {showInsufficientDataMessage && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 p-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Not Enough Data</AlertTitle>
                    <AlertDescription>Could not find enough hotspots to generate a multi-point route. The map shows the single identified hotspot.</AlertDescription>
                </Alert>
            </div>
        )}

        <Map
            defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
            defaultZoom={11}
            mapId="PATROL_ROUTE_MAP"
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
                        <CardTitle className="text-base">{hoveredHotspot.locationName}</CardTitle>
                        <CardDescription>{hoveredHotspot.reason}</CardDescription>
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
    </div>
  );
}
