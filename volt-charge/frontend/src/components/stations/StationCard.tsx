import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Zap, Clock, Navigation, Users, ArrowUpRight } from 'lucide-react';
import type { Station } from '@/types';
import { Badge } from '@/components/ui/Badge';

interface StationCardProps {
  station: Station;
  onView?: (station: Station) => void;
  onNavigate?: (station: Station) => void;
  onJoinQueue?: (station: Station) => void;
  isNearest?: boolean;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  onView,
  onNavigate,
  onJoinQueue,
  isNearest = false,
}) => {
  const isDcFast = station.chargingType?.toLowerCase().includes('dc');
  const portPercentage =
    station.totalPorts > 0
      ? Math.round((station.availablePorts / station.totalPorts) * 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all duration-200 flex flex-col justify-between ${
        isNearest
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/10 shadow-emerald-500/5'
          : 'border-stone-200/80 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      {isNearest && (
        <div className="absolute -top-3 left-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
          <Zap className="w-3 h-3 fill-current" />
          Nearest Station
        </div>
      )}

      <div>
        {/* Header: ID, Name, Type */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                {station.id}
              </span>
              <Badge variant={isDcFast ? 'teal' : 'emerald'}>
                {station.chargingType}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-stone-900 mt-2 tracking-tight group-hover:text-emerald-700">
              {station.name}
            </h4>
          </div>

          {station.distance !== undefined && (
            <div className="text-right flex-shrink-0">
              <span className="text-sm font-extrabold text-emerald-700">
                {typeof station.distance === 'number' ? station.distance.toFixed(1) : station.distance} km
              </span>
              <span className="text-[10px] text-stone-400 block font-medium">Haversine</span>
            </div>
          )}
        </div>

        {/* Location info */}
        <div className="flex items-center gap-1.5 text-stone-500 text-xs mt-2.5">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-stone-400" />
          <span className="truncate">{station.location}</span>
        </div>

        {/* Ports & Charging Power & Wait Time */}
        <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-2 text-center">
          <div className="bg-stone-50/80 p-2 rounded-xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Available</span>
            <span
              className={`text-sm font-bold block mt-0.5 ${
                station.availablePorts > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {station.availablePorts} / {station.totalPorts}
            </span>
          </div>

          <div className="bg-stone-50/80 p-2 rounded-xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Power</span>
            <span className="text-sm font-bold text-stone-700 block mt-0.5">
              {station.chargingRate} kW
            </span>
          </div>

          <div className="bg-stone-50/80 p-2 rounded-xl">
            <span className="text-[10px] text-stone-400 uppercase font-bold block">Est. Wait</span>
            <span className="text-sm font-bold text-stone-700 block mt-0.5">
              {station.waitingTime}m
            </span>
          </div>
        </div>

        {/* Ports Availability Bar */}
        <div className="mt-3">
          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                portPercentage > 50
                  ? 'bg-emerald-500'
                  : portPercentage > 0
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${portPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 flex items-center gap-2 border-t border-stone-100">
        <button
          onClick={() => onView && onView(station)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200/80 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          Details
        </button>
        <button
          onClick={() => onNavigate && onNavigate(station)}
          className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center justify-center gap-1"
          title="Navigate coordinates"
        >
          <Navigation className="w-3.5 h-3.5" />
          Map
        </button>
        <button
          onClick={() => onJoinQueue && onJoinQueue(station)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
        >
          <Users className="w-3.5 h-3.5" />
          Join Queue
        </button>
      </div>
    </motion.div>
  );
};
