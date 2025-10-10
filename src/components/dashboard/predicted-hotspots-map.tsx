
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
  High: { icon: <AlertTriangle className="w-5 h-5 text-destructive" />, color: "#ff0000", fillColor: "#ff0000" },
  Medium: { icon: <Info className="w-5 h-5 text-yellow-500" />, color: "#ffff00", fillColor: "#ffff00" },
  Low: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "#00ff00", fillColor: "#00ff00" },
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
        onClick={() => setSelectedHotspotId(null)}
      >
        {hotspots.map(hotspot => {
            const currentRisk = riskConfig[hotspot.riskLevel];
            
            return (
                <React.Fragment key={hotspot.id}>
                    <CircleComponent
                        center={hotspot.position}
                        radius={3000} 
                        strokeColor={currentRisk.color}
                        strokeOpacity={0.8}
                        strokeWeight={2}
                        fillColor={currentRisk.fillColor}
                        fillOpacity={0.4}
                    />
                    {/* Use an invisible marker to handle events */}
                    <div 
                        onMouseEnter={() => setSelectedHotspotId(hotspot.id)}
                        onMouseLeave={() => setSelectedHotspotId(null)}
                    >
                        <AdvancedMarker position={hotspot.position}>
                            {/* This is an empty div, making the marker invisible but interactive */}
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%' }} /> 
                        </AdvancedMarker>
                    </div>
                </React.Fragment>
            )
        })}

        {selectedHotspot && (
          <InfoWindow
            position={selectedHotspot.position}
            onCloseClick={() => setSelectedHotspotId(null)}
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
