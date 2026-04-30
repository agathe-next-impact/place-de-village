"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type Marker, type Popup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Carte MapLibre GL JS avec tuiles IGN Géoplateforme (open data,
 * sans clé API pour les tuiles essentielles « Plan IGN »).
 *
 * Cf. CdC §2.1 Pôle 3 : « la carte SVG inline est un placeholder, à
 * remplacer par MapLibre + tuiles IGN ou OpenStreetMap. » → fait.
 */

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  label: string;
  description?: string;
  href?: string;
};

const IGN_PLAN_TILES =
  "https://data.geopf.fr/wmts?REQUEST=GetTile&SERVICE=WMTS&VERSION=1.0.0&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}";

const IGN_ATTRIBUTION =
  '<a href="https://www.ign.fr/" target="_blank" rel="noopener">IGN — Géoplateforme</a>';

export function MapView({
  points,
  center,
  zoom = 14,
  className,
  height = 380,
  onMapClick,
  showCenterMarker,
}: {
  points: MapPoint[];
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  className?: string;
  height?: number;
  onMapClick?: (lng: number, lat: number) => void;
  showCenterMarker?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const centerMarkerRef = useRef<Marker | null>(null);

  // Init map (une seule fois)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Center par défaut : Trizac (Cantal)
    const initCenter: [number, number] =
      center ??
      (points.length > 0 ? [points[0].lng, points[0].lat] : [2.4640, 45.2240]);

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          ign: {
            type: "raster",
            tiles: [IGN_PLAN_TILES],
            tileSize: 256,
            attribution: IGN_ATTRIBUTION,
            minzoom: 0,
            maxzoom: 18,
          },
        },
        layers: [
          {
            id: "ign-plan",
            type: "raster",
            source: "ign",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: initCenter,
      zoom,
      attributionControl: { compact: true },
      cooperativeGestures: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: false }),
      "top-right",
    );

    if (onMapClick) {
      map.on("click", (e) => onMapClick(e.lngLat.lng, e.lngLat.lat));
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Volontairement aucune dep — la carte ne doit pas être recréée à chaque render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Synchronise les markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // Vide les anciens
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const p of points) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${p.label} (${p.description ?? ""})`);
      el.style.cssText = `
        width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
        background: ${p.color}; color: #fff; border: 2px solid #fff;
        box-shadow: 0 2px 5px rgba(0,0,0,0.25);
        transform: rotate(-45deg);
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; padding: 0;
      `;
      const dot = document.createElement("span");
      dot.style.cssText = `width: 6px; height: 6px; background: #fff; border-radius: 50%; transform: rotate(45deg);`;
      el.appendChild(dot);

      let popup: Popup | null = null;
      if (p.href) {
        popup = new maplibregl.Popup({ offset: 18, closeButton: true, closeOnClick: true })
          .setHTML(
            `<strong style="display:block;color:${p.color}">${escapeHtml(p.label)}</strong>` +
              (p.description ? `<div style="color:#4d4843;font-size:12px;margin-top:2px">${escapeHtml(p.description)}</div>` : "") +
              `<a href="${escapeHtml(p.href)}" style="color:#1f6e7a;font-weight:600;font-size:12px;display:inline-block;margin-top:6px;text-decoration:underline">Voir le détail →</a>`,
          );
      }

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.lng, p.lat]);
      if (popup) marker.setPopup(popup);
      marker.addTo(map);
      markersRef.current.push(marker);
    }
  }, [points]);

  // Marker "centre" (utilisé pour la création de signalement)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!showCenterMarker) {
      centerMarkerRef.current?.remove();
      centerMarkerRef.current = null;
      return;
    }
    if (!centerMarkerRef.current) {
      const el = document.createElement("div");
      el.style.cssText = `width: 24px; height: 24px; border-radius: 50%; background: #1f6e7a; border: 3px solid #fff; box-shadow: 0 0 0 2px #1f6e7a;`;
      centerMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(map.getCenter()).addTo(map);
      const update = () => centerMarkerRef.current?.setLngLat(map.getCenter());
      map.on("move", update);
    }
  }, [showCenterMarker]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, borderRadius: 6, overflow: "hidden" }}
      role="application"
      aria-label="Carte interactive des signalements"
    />
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
