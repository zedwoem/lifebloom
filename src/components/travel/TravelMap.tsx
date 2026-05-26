"use client";

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon crash in Next.js SSR build environments
const customIcon = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
}) : undefined;

export default function TravelMap() {
  const defaultPosition: [number, number] = [-6.2088, 106.8456]; // Jakarta default

  return (
    <div className="w-full h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-soft-ambient relative z-0">
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {customIcon && (
          <Marker position={defaultPosition} icon={customIcon}>
            <Popup>
              <div className="p-1 Atkinson-font text-[#131b2e]">
                <strong className="text-sm block">Multi-Gen Retreat</strong>
                <span className="text-xs text-slate-500">Accessible ground floors & senior friendly.</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
