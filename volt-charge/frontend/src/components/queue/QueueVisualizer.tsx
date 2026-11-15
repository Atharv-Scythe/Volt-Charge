import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '@/types';
import { Zap, ArrowRight, CornerDownRight, RotateCcw } from 'lucide-react';

interface QueueVisualizerProps {
  vehicles: Vehicle[];
  capacity?: number;
  frontIndex?: number;
  rearIndex?: number;
  peekedVehicleId?: string | null;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({
  vehicles,
  capacity = 20,
  peekedVehicleId,
}) => {
  const emptySlotsCount = Math.max(0, capacity - vehicles.length);

  return (
    <div className="bg-stone-50/70 rounded-2xl p-6 border border-stone-200/80">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            FIFO
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900 tracking-tight">
              Circular FIFO Buffer State
            </h4>
            <p className="text-xs text-stone-500">
              Array-based implementation with front &amp; rear wrapping pointers
            </p>
          </div>
        </div>

        {/* Capacity pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 shadow-sm">
            Occupied: <span className="text-emerald-600">{vehicles.length}</span> / {capacity}
          </span>
          <span className="px-3 py-1 bg-white border border-stone-200 rounded-xl font-bold text-stone-700 shadow-sm">
            Status:{' '}
            <span
              className={
                vehicles.length >= capacity
                  ? 'text-rose-600'
                  : vehicles.length === 0
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }
            >
              {vehicles.length >= capacity
                ? 'OVERFLOW RISK (Full)'
                : vehicles.length === 0
                ? 'UNDERFLOW (Empty)'
                : 'Accepting Vehicles'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Queue Cards Runway */}
      <div className="relative overflow-x-auto pb-4 pt-2">
        <div className="flex items-stretch gap-4 min-w-max">
          <AnimatePresence mode="popLayout">
            {vehicles.map((v, idx) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                position={idx + 1}
                isFront={idx === 0}
                isRear={idx === vehicles.length - 1}
                isPeeked={peekedVehicleId === v.id}
              />
            ))}
          </AnimatePresence>

          {/* Empty slot indicators for remaining capacity (up to 4 visual placeholders) */}
          {Array.from({ length: Math.min(emptySlotsCount, 4) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-48 h-44 rounded-2xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center text-stone-400 p-4 text-center bg-stone-50/50"
            >
              <div className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-xs font-mono font-bold mb-2">
                {vehicles.length + i}
              </div>
              <span className="text-xs font-semibold">Available Slot</span>
              <span className="text-[10px] text-stone-400 mt-0.5">Ready for Enqueue</span>
            </div>
          ))}

          {vehicles.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-stone-100 rounded-2xl text-stone-400 mb-2">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h5 className="text-sm font-bold text-stone-700">Queue is currently empty</h5>
              <p className="text-xs text-stone-400 max-w-xs mt-1">
                Enqueue simulated vehicles to watch FIFO service discipline in real time.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info on pointers */}
      <div className="mt-4 pt-4 border-t border-stone-200/80 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Front Pointer Index: <b className="text-stone-800">{vehicles.length > 0 ? 0 : -1}</b>
          </span>
          <span className="flex items-center gap-1 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Rear Pointer Index:{' '}
            <b className="text-stone-800">{vehicles.length > 0 ? vehicles.length - 1 : -1}</b>
          </span>
        </div>
        <div className="text-[11px] font-mono text-stone-400">
          Formula: <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">rear = (rear + 1) % MAX_CAPACITY</code>
        </div>
      </div>
    </div>
  );
};
