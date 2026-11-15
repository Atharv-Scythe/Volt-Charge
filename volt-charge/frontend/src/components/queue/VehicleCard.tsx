import React from 'react';
import { motion } from 'framer-motion';
import { BatteryCharging, Battery, Clock, Car, Zap } from 'lucide-react';
import type { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isFront?: boolean;
  isRear?: boolean;
  position: number;
  isPeeked?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isFront = false,
  isRear = false,
  position,
  isPeeked = false,
}) => {
  const isCharging = isFront;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: 50 }}
      animate={{
        opacity: 1,
        scale: isPeeked ? 1.05 : 1,
        x: 0,
        boxShadow: isPeeked
          ? '0 0 0 3px rgba(16, 185, 129, 0.4), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : isCharging
          ? '0 0 0 2px rgba(16, 185, 129, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      exit={{ opacity: 0, scale: 0.7, x: -80, transition: { duration: 0.3 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative w-64 bg-white rounded-2xl p-4 border flex flex-col justify-between flex-shrink-0 transition-colors ${
        isCharging
          ? 'border-emerald-500 bg-emerald-50/20'
          : isPeeked
          ? 'border-emerald-400 bg-emerald-50/40'
          : 'border-stone-200/80 hover:border-stone-300'
      }`}
    >
      {/* Pointer Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5">
          {isFront && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
              <Zap className="w-2.5 h-2.5 fill-current" />
              FRONT (Charging)
            </span>
          )}
          {isRear && (
            <span className="bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
              REAR
            </span>
          )}
          {!isFront && !isRear && (
            <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Position #{position}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono font-bold text-stone-400">
          Slot {position - 1}
        </span>
      </div>

      {/* Vehicle Info */}
      <div className="flex items-start gap-3 mt-1">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 ${
            isCharging ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-700'
          }`}
        >
          <Car className="w-5 h-5 stroke-[1.75]" />
        </div>
        <div className="overflow-hidden">
          <span className="text-xs font-mono font-bold text-stone-400">{vehicle.id}</span>
          <h5 className="text-sm font-bold text-stone-900 truncate leading-snug">
            {vehicle.type}
          </h5>
          <span className="text-[11px] text-stone-500 block truncate">
            Station: {vehicle.assignedStation}
          </span>
        </div>
      </div>

      {/* Battery State Indicator */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600 mb-1">
          <span className="flex items-center gap-1 text-[11px]">
            {isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-stone-500" />
            )}
            Battery Level
          </span>
          <span className="font-bold text-stone-800">
            {vehicle.batteryPercentage}% &rarr; {vehicle.requiredPercentage}%
          </span>
        </div>

        {/* Battery Bar */}
        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full ${isCharging ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${vehicle.batteryPercentage}%` }}
          />
          <div
            className="h-full bg-emerald-200 border-l border-white/50"
            style={{ width: `${vehicle.requiredPercentage - vehicle.batteryPercentage}%` }}
          />
        </div>

        {/* Charging duration */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            Est. Time: {vehicle.chargingDuration} mins
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {vehicle.arrivalTime ? vehicle.arrivalTime.split('T')[1]?.substring(0, 5) || 'Now' : 'Now'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
