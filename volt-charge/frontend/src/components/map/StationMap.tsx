import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Station } from '@/types';
import { Zap, Navigation, Clock } from 'lucide-react';

// Fix Leaflet standard icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom station marker icons
const createStationIcon = (station: Station, isSelected: boolean) => {
  const isAvailable = station.availablePorts > 2;
  const isLimited = station.availablePorts > 0 && station.availablePorts <= 2;

  let bgClass = 'bg-emerald-600 text-white';
  if (isLimited) bgClass = 'bg-amber-500 text-white';
  if (station.availablePorts === 0) bgClass = 'bg-rose-600 text-white';

  const ringClass = isSelected ? 'ring-4 ring-emerald-400 scale-125 z-50' : 'ring-2 ring-white shadow-md';

  const html = `
    <div class="relative flex items-center justify-center">
      <div class="w-8 h-8 rounded-full ${bgClass} ${ringClass} flex items-center justify-center font-bold text-xs shadow-lg transition-transform duration-200">
        ⚡
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-ev-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

// User Location Icon (Pulsing Blue)
const userIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-300 shadow-lg"></div>
      <div class="absolute w-8 h-8 rounded-full bg-blue-400/30 animate-ping"></div>
    </div>
  `,
  className: 'custom-user-marker',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface StationMapProps {
  stations: Station[];
  userLocation: { latitude: number; longitude: number };
  selectedStation?: Station | null;
  onSelectStation?: (station: Station) => void;
  height?: string;
}

// Controller to auto-center when selected station changes
const MapViewController: React.FC<{
  center: [number, number];
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom || 13, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
};

export const StationMap: React.FC<StationMapProps> = ({
  stations,
  userLocation,
  selectedStation,
  onSelectStation,
  height = 'h-[500px]',
}) => {
  const mapCenter: [number, number] = selectedStation
    ? [selectedStation.latitude, selectedStation.longitude]
    : [userLocation.latitude, userLocation.longitude];

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden border border-stone-200/80 shadow-sm relative z-10`}>
      <MapContainer
        center={[userLocation.latitude, userLocation.longitude]}
        zoom={12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <MapViewController center={mapCenter} zoom={selectedStation ? 14 : 12} />

        {/* Clean OpenStreetMap tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
          <Popup>
            <div className="p-1">
              <p className="font-bold text-xs text-blue-700">Your Current Location</p>
              <p className="text-[11px] text-stone-500 font-mono">
                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Station Markers */}
        {stations.map((st) => (
          <Marker
            key={st.id}
            position={[st.latitude, st.longitude]}
            icon={createStationIcon(st, selectedStation?.id === st.id)}
            eventHandlers={{
              click: () => onSelectStation && onSelectStation(st),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-stone-500">{st.id}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {st.chargingType}
                  </span>
                </div>
                <h5 className="font-bold text-xs text-stone-900 mt-1">{st.name}</h5>
                <p className="text-[11px] text-stone-500 truncate mt-0.5">{st.location}</p>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-stone-600">
                    Ports: <b>{st.availablePorts}/{st.totalPorts}</b>
                  </span>
                  {st.distance !== undefined && (
                    <span className="font-bold text-emerald-600">
                      {typeof st.distance === 'number' ? st.distance.toFixed(1) : st.distance} km
                    </span>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-stone-200/80 shadow-md z-[1000] text-[11px] space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
          <span className="text-stone-700 font-medium">User Location</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span className="text-stone-700 font-medium">Ports Available (&gt;2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-stone-700 font-medium">Limited Ports (1-2)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span className="text-stone-700 font-medium">Station Full (0 ports)</span>
        </div>
      </div>
    </div>
  );
};
