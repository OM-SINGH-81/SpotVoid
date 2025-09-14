"use client"

import React, { useState, useEffect } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Loader2, TriangleAlert, Route, Clock, Ruler, Info, ListOrdered } from 'lucide-react';

import { Polyline } from '@/components/polyline';
import type { PatrolHotspot } from '@/lib/types';
import { generatePatrolRoute, GeneratePatrolRouteInput, GeneratePatrolRouteOutput } from '@/ai/flows/ai-patrol-routes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '../ui/scroll-area';

type PatrolRoutesProps = {
  filters: Omit<GeneratePatrolRouteInput, 'dateRange'>;
};

export default function PatrolRoutes({ filters }: PatrolRoutesProps) {
  const [route, setRoute] = useState<GeneratePatrolRouteOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);

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

    if (filters.crimeTypes && filters.crimeTypes.length > 0) {
      getRoute();
    } else {
        setIsLoading(false);
        setRoute(null);
    }
  }, [filters]);

  const sortedHotspots = route?.hotspots.sort((a,b) => a.order - b.order) || [];
  const routePath = sortedHotspots.map(h => h.position);

  const hoveredHotspot = route?.hotspots.find(h => h.id === hoveredHotspotId);

  const showInsufficientDataMessage = !isLoading && !error && route && route.hotspots.length > 0 && routePath.length < 2;

  return (
    <div className="w-full h-full flex flex-col lg:flex-row">
        <div className="w-full lg:w-2/3 h-1/2 lg:h-full rounded-b-lg lg:rounded-bl-lg lg:rounded-r-none overflow-hidden relative">
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
             {showInsufficientDataMessage && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 p-4">
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
                             <CardDescription>Lat: {hoveredHotspot.position.lat.toFixed(4)}, Lng: {hoveredHotspot.position.lng.toFixed(4)}</CardDescription>
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
        <div className="w-full lg:w-1/3 flex flex-col border-t lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-center gap-4 p-4 border-b text-sm">
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
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    <h4 className="font-medium flex items-center gap-2 text-muted-foreground">
                        <ListOrdered className="w-5 h-5 text-primary" />
                        <span>Patrol Order</span>
                    </h4>
                    <ol className="space-y-2">
                        {sortedHotspots.map((hotspot) => (
                            <li 
                                key={hotspot.id} 
                                className={`p-2 rounded-md transition-colors text-sm ${hoveredHotspotId === hotspot.id ? 'bg-muted' : ''}`}
                                onMouseEnter={() => setHoveredHotspotId(hotspot.id)} 
                                onMouseLeave={() => setHoveredHotspotId(null)}
                            >
                                {hotspot.name}
                            </li>
                        ))}
                    </ol>
                </div>
            </ScrollArea>
        </div>
    </div>
  );
}
