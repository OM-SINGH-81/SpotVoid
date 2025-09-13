"use client"

import { useEffect, useState } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { Position } from '@/lib/types';

type PolylineProps = google.maps.PolylineOptions & {
    path: Position[];
};

export const Polyline = (props: PolylineProps) => {
  const [polyline, setPolyline] = useState<google.maps.Polyline | null>(null);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (!polyline) {
      const newPolyline = new google.maps.Polyline({ ...props, map });
      setPolyline(newPolyline);
    } else {
        polyline.setOptions(props);
    }

    return () => {
      if (polyline) {
        polyline.setMap(null);
      }
    };
  }, [map, polyline, props]);

  return null;
};
