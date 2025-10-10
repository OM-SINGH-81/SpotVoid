
"use client"

import React, { useState } from 'react';
import { Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { PredictCrimeOutput } from '@/ai/flows/ai-crime-prediction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { TheftIcon, AccidentIcon, HarassmentIcon } from '@/components/icons';

type PredictedHotspotsMapProps = {
  hotspots: PredictCrimeOutput['predictedHotspots'];
};

const riskConfig = {
  High: { icon: <AlertTriangle className="w-5 h-5 text-destructive" />, color: "hsl(var(--destructive))" },
  Medium: { icon: <Info className="w-5 h-5 text-yellow-500" />, color: "hsl(var(--chart-4))" },
  Low: { icon: <CheckCircle className="w-5 h-5 text-green-500" />, color: "hsl(var(--chart-2))" },
};

const crimeIconMap = {
  Theft: { icon: <TheftIcon className="w-5 h-5" /> },
  Accident: { icon: <AccidentIcon className="w-5 h-5" /> },
  Harassment: { icon: <HarassmentIcon className="w-5 h-5" /> },
  default: { icon: <Info className="w-5 h-5" /> },
};


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
            const currentCrimeIcon = crimeIconMap[hotspot.predictedCrimeType as keyof typeof crimeIconMap] || crimeIconMap.default;

            return (
                <AdvancedMarker
                    key={hotspot.id}
                    position={hotspot.position}
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                    onPointerEnter={() => setSelectedHotspotId(hotspot.id)}
                    onPointerLeave={() => setSelectedHotspotId(null)}
                >
                    <Pin
                    background={currentRisk.color}
                    glyphColor={"#fff"}
                    borderColor={currentRisk.color}
                    >
                    {currentRisk.icon}
                    </Pin>
                </AdvancedMarker>
            )
        })}

        {selectedHotspot && (
          <InfoWindow
            position={selectedHotspot.position}
            onCloseClick={() => setSelectedHotspotId(null)}
            pixelOffset={[0, -40]}
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

    
