'use client';

import * as React from 'react';

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
};

type Props = {
  points: MapPoint[];
  center?: [number, number];
  zoom?: number;
  height?: number;
};

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

let leafletLoadPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (leafletLoadPromise) return leafletLoadPromise;

  leafletLoadPromise = new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).L));
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return leafletLoadPromise;
}

function MapView({ points, center, zoom = 9, height = 420 }: Props) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    loadLeaflet()
      .then((L) => {
        if (cancelled || !L || !containerRef.current) return;
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const fallbackCenter: [number, number] =
          center ?? (points[0] ? [points[0].lat, points[0].lng] : [-22.5231, -44.1041]);

        const map = L.map(containerRef.current, {
          scrollWheelZoom: false,
        }).setView(fallbackCenter, zoom);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        const brandIcon = L.divIcon({
          className: '',
          html: '<div style="width:14px;height:14px;border-radius:9999px;background:#0e6b6b;border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        points.forEach((p) => {
          L.marker([p.lat, p.lng], { icon: brandIcon })
            .addTo(map)
            .bindPopup(
              `<strong>${p.title}</strong>${p.subtitle ? `<br/>${p.subtitle}` : ''}`
            );
        });

        if (points.length > 1) {
          const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
          map.fitBounds(bounds, { padding: [32, 32] });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points), center?.[0], center?.[1], zoom]);

  if (failed) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center bg-surface/50 text-sm text-fg-muted"
      >
        Não foi possível carregar o mapa agora. Recarregue a página.
      </div>
    );
  }

  return <div ref={containerRef} style={{ height, width: '100%' }} />;
}

export default MapView;
export { MapView };
