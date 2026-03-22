"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Map, { Source, Layer, MapMouseEvent } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

// Toronto city center coordinates
const TORONTO_CENTER = {
  longitude: -79.3832,
  latitude: 43.7182,
  zoom: 11,
};

interface HoveredZone {
  name: string;
  x: number;
  y: number;
}

interface TorontoMapProps {
  onZoneHover?: (name: string | null) => void;
  onZoneClick?: (name: string) => void;
}

export default function TorontoMap({ onZoneHover, onZoneClick }: TorontoMapProps) {
  const [neighbourhoods, setNeighbourhoods] = useState(null);
  const [hoveredZone, setHoveredZone] = useState<HoveredZone | null>(null);
  const [loading, setLoading] = useState(true);
  const hoveredNameRef = useRef<string | null>(null);

  // Fetch Toronto neighbourhood boundaries from our API route
  useEffect(() => {
    fetch("/api/neighbourhoods")
      .then((res) => res.json())
      .then((data) => {
        setNeighbourhoods(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load neighbourhoods:", err);
        setLoading(false);
      });
  }, []);

  // When mouse moves over the map, check if we're hovering a neighbourhood
  const onMouseMove = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (feature) {
      // Toronto Open Data uses AREA_NAME for neighbourhood names
      const name =
        feature.properties?.AREA_NAME ||
        feature.properties?.name ||
        "Unknown Zone";

      if (hoveredNameRef.current !== name) {
        hoveredNameRef.current = name;
        onZoneHover?.(name);
      }
      setHoveredZone({ name, x: event.point.x, y: event.point.y });
    } else {
      if (hoveredNameRef.current !== null) {
        hoveredNameRef.current = null;
        onZoneHover?.(null);
      }
      setHoveredZone(null);
    }
  }, [onZoneHover]);

  const onMouseClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0];
    if (feature) {
      const name =
        feature.properties?.AREA_NAME ||
        feature.properties?.name ||
        "Unknown Zone";
      onZoneClick?.(name);
    }
  }, [onZoneClick]);

  return (
    <div className="relative w-full h-full">
      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950">
          <p className="text-gray-400 text-sm">Loading Toronto zones...</p>
        </div>
      )}

      <Map
        initialViewState={TORONTO_CENTER}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        interactiveLayerIds={["neighbourhood-fill"]} // only this layer triggers mouse events
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoveredZone(null)}
        onClick={onMouseClick}
      >
        {neighbourhoods && (
          <Source id="neighbourhoods" type="geojson" data={neighbourhoods}>
            {/* Semi-transparent fill so the map is still visible underneath */}
            <Layer
              id="neighbourhood-fill"
              type="fill"
              paint={{
                "fill-color": "#3b82f6",
                "fill-opacity": 0.12,
              }}
            />

            {/* Border lines between zones */}
            <Layer
              id="neighbourhood-border"
              type="line"
              paint={{
                "line-color": "#60a5fa",
                "line-width": 1,
                "line-opacity": 0.5,
              }}
            />

            {/* Brighter fill on hover */}
            <Layer
              id="neighbourhood-fill-hover"
              type="fill"
              paint={{
                "fill-color": "#3b82f6",
                "fill-opacity": [
                  "case",
                  ["==", ["get", "name"], hoveredZone?.name ?? ""],
                  0.35,
                  0,
                ],
              }}
            />
          </Source>
        )}
      </Map>

      {/* Hover tooltip bubble */}
      {hoveredZone && (
        <div
          className="absolute z-10 pointer-events-none bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 rounded-lg shadow-xl"
          style={{
            left: hoveredZone.x + 14,
            top: hoveredZone.y - 14,
          }}
        >
          <span className="font-medium">{hoveredZone.name}</span>
        </div>
      )}
    </div>
  );
}
