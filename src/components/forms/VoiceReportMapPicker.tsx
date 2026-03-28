"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  latitude: string;
  longitude: string;
  onPick: (lat: number, lng: number) => void;
};

const GHANA_CENTER: [number, number] = [7.95, -1.02];

export function VoiceReportMapPicker({ latitude, longitude, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // One-time map init; initial centre uses first-render lat/lng. External updates handled below.
  useEffect(() => {
    let cancelled = false;
    if (!containerRef.current) return undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const lat0 = Number.parseFloat(latitude);
      const lng0 = Number.parseFloat(longitude);
      const hasPoint =
        Number.isFinite(lat0) &&
        Number.isFinite(lng0) &&
        lat0 >= -90 &&
        lat0 <= 90 &&
        lng0 >= -180 &&
        lng0 <= 180;

      const center: [number, number] = hasPoint ? [lat0, lng0] : GHANA_CENTER;
      const zoom = hasPoint ? 12 : 6;

      const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView(center, zoom);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(center, { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const ll = marker.getLatLng();
        onPickRef.current(ll.lat, ll.lng);
      });
      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        onPickRef.current(e.latlng.lat, e.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Mount-only: initial centre from first paint; coord edits sync in the following effect.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const lat = Number.parseFloat(latitude);
    const lng = Number.parseFloat(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return;

    const ll = marker.getLatLng();
    if (Math.abs(ll.lat - lat) < 1e-5 && Math.abs(ll.lng - lng) < 1e-5) return;

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], Math.max(map.getZoom(), 10));
  }, [latitude, longitude, mapReady]);

  return (
    <div
      ref={containerRef}
      className="isolate z-0 mt-2 h-[min(280px,45vh)] w-full rounded-xl border border-[var(--border)]"
    />
  );
}

export default VoiceReportMapPicker;
