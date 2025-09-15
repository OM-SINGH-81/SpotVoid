"use client"

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { TriangleAlert, Route, Clock, Ruler, Info } from 'lucide-react';

import { Polyline } from '@/components/polyline';
import { generatePatrolRoute, GeneratePatrolRouteOutput } from '@/ai/flows/ai-patrol-routes';
import type { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GeneratingLoader from '../ui/generating-loader';

type PatrolRoutesProps = {
  prediction: PredictCrimeOutput | null;
  isLoadingPrediction: boolean;
};

export default function PatrolRoutes({ prediction, isLoadingPrediction }: PatrolRoutesProps) {
  const [route, setRoute] = useState<GeneratePatrolRouteOutput | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

  useEffect(() => {
    const getRoute = async () => {
      if (!prediction || prediction.dailyData.length === 0) {
        setRoute(null);
        setIsLoadingRoute(false);
        return;
      }
      setIsLoadingRoute(true);
      setError(null);
      // try {
      //   const result = await generatePatrolRoute({ predictedData: prediction });
      //   setRoute(result);
      // } catch (e) {
      //   console.error("Patrol route generation error:", e);
      //   setError("Failed to generate patrol route. The AI model may be offline.");
      // } finally {
      //   setIsLoadingRoute(false);
      // }
      
      // Temporarily disable API call
      console.log("API call to generatePatrolRoute disabled for UI development.");
      setTimeout(() => {
        setIsLoadingRoute(false);
      }, 2000);
    };

    getRoute();

  }, [prediction]);
  
  const isLoading = isLoadingPrediction || isLoadingRoute;

  const sortedHotspots = route?.hotspots.sort((a,b) => a.order - b.order) || [];
  const routePath = sortedHotspots.map(h => h.position);

  const hoveredHotspot = route?.hotspots.find(h => h.id === hoveredHotspotId);

  const showInsufficientDataMessage = !isLoading && !error && route && route.hotspots.length > 0 && routePath.length < 2;

  const showNoDataMessage = !isLoading && !error && (!prediction || prediction.dailyData.length === 0);

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
        {!isLoading && error && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 p-4">
                <Alert variant="destructive">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertTitle>Route Generation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )}
        {showNoDataMessage && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20">
                <p className="text-muted-foreground">Select filters to generate a patrol route.</p>
            </div>
        )}
            {showInsufficientDataMessage && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-20 p-4">
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Not Enough Data</AlertTitle>
                    <AlertDescription>The AI could not find enough hotspots to generate a multi-point route. The map shows the single identified hotspot.</AlertDescription>
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
    </div>
  );
}
