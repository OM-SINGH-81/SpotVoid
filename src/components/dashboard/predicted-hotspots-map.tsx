
"use client"

import React, { useState, useEffect } from 'react';
import { useMap, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { TheftIcon, AccidentIcon, HarassmentIcon } from '@/components/icons';

type PredictedHotspotsMapProps = {
  hotspots: PredictCrimeOutput['predictedHotspots'];
};

const riskConfig = {
  High: { icon: <AlertTriangle className="w-5 h-5 text-destructive" />, color: "hsl(var(--destructive))", fillColor: "hsl(var(--destructive))" },
  Medium: { icon: <Info className="w-5 h-5 text-yellow-500" />, color: "hsl(var(--chart-4))", fillColor: "hsl(var(--chart-4))" },
  Low: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "hsl(var(--chart-2))", fillColor: "hsl(var(--chart-2))" },
};

const crimeIconMap = {
  Theft: { icon: <TheftIcon className="w-5 h-5" /> },
  Accident: { icon: <AccidentIcon className="w-5 h-5" /> },
  Harassment: { icon: <HarassmentIcon className="w-5 h-5" /> },
  default: { icon: <Info className="w-5 h-5" /> },
};

type CircleProps = google.maps.CircleOptions & {
    center: google.maps.LatLngLiteral;
    radius: number;
    onMouseOver?: (e: google.maps.MapMouseEvent) => void;
    onMouseOut?: (e: google.maps.MapMouseEvent) => void;
    onClick?: (e: google.maps.MapMouseEvent) => void;
};

const CircleComponent = (props: CircleProps) => {
    const [circle, setCircle] = useState<google.maps.Circle | null>(null);
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        if (!circle) {
            const newCircle = new google.maps.Circle({ ...props, map });
            setCircle(newCircle);
        } else {
            circle.setOptions(props);
        }

        return () => {
            if (circle) {
                circle.setMap(null);
            }
        };
    }, [map, circle, props]);
    
    useEffect(() => {
        if (!circle) return;
        const listeners = [
            google.maps.event.addListener(circle, 'mouseover', (e:any) => props.onMouseOver?.(e)),
            google.maps.event.addListener(circle, 'mouseout', (e:any) => props.onMouseOut?.(e)),
            google.maps.event.addListener(circle, 'click', (e:any) => props.onClick?.(e))
        ];

        return () => {
            listeners.forEach(listener => google.maps.event.removeListener(listener));
        }

    }, [circle, props.onMouseOver, props.onMouseOut, props.onClick]);

    return null;
}


export default function PredictedHotspotsMap({ hotspots }: PredictedHotspotsMapProps) {
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const selectedHotspot = hotspots.find(hotspot => hotspot.id === selectedHotspotId);

  if (!hotspots || hotspots.length === 0) {
      return (
          <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
              <p className="text-muted-foreground">No predicted hotspots to display.</p>
          </div>
      )
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border">
      <Map
        defaultCenter={{ lat: 28.6139, lng: 77.2090 }}
        defaultZoom={11}
        mapId="PREDICTED_HOTSPOTS_MAP"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {hotspots.map(hotspot => {
            const currentRisk = riskConfig[hotspot.riskLevel];
            
            return (
                <CircleComponent
                    key={hotspot.id}
                    center={hotspot.position}
                    radius={1000} // Increased radius in meters for better visibility
                    strokeColor={currentRisk.color}
                    strokeOpacity={0.9}
                    strokeWeight={2}
                    fillColor={currentRisk.fillColor}
                    fillOpacity={0.4} // Increased fill opacity for better visibility
                    onMouseOver={() => setSelectedHotspotId(hotspot.id)}
                    onMouseOut={() => setSelectedHotspotId(null)}
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                />
            )
        })}

        {selectedHotspot && (
          <InfoWindow
            position={selectedHotspot.position}
            onCloseClick={() => setSelectedHotspotId(null)}
            pixelOffset={[0, -20]}
          >
            <Card className="border-none shadow-none max-w-xs">
              <CardHeader className="p-2">
                <CardTitle className="text-base flex items-center gap-2">
                   {riskConfig[selectedHotspot.riskLevel].icon} {selectedHotspot.riskLevel} Risk: {selectedHotspot.locationName}
                </CardTitle>
                <CardDescription>Predicted Crime: {selectedHotspot.predictedCrimeType}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 text-sm">
                <p><strong>Reason:</strong> {selectedHotspot.reason}</p>
              </CardContent>
            </Card>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
}
