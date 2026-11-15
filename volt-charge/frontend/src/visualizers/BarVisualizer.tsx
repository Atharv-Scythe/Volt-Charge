import React from 'react';
import { motion } from 'framer-motion';

export interface BarItem {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  state: 'default' | 'comparing' | 'swapping' | 'sorted' | 'pivot';
}

interface BarVisualizerProps {
  items: BarItem[];
  criteriaLabel: string;
  maxValue?: number;
}

export const BarVisualizer: React.FC<BarVisualizerProps> = ({
  items,
  criteriaLabel,
  maxValue,
}) => {
  const calculatedMax = maxValue || Math.max(...items.map((i) => i.value), 1);

  const stateColors = {
    default: 'bg-emerald-500/80 border-emerald-600',
    comparing: 'bg-amber-400 border-amber-500 ring-2 ring-amber-300',
    swapping: 'bg-rose-500 border-rose-600 ring-2 ring-rose-300',
    sorted: 'bg-teal-600 border-teal-700',
    pivot: 'bg-indigo-500 border-indigo-600 ring-2 ring-indigo-300',
  };

  return (
    <div className="bg-stone-50/80 rounded-2xl p-6 border border-stone-200/80 min-h-[300px] flex flex-col justify-between">
      {/* Visual bars container */}
      <div className="flex-1 flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto">
        {items.map((item, index) => {
          const heightPercent = Math.max(12, Math.round((item.value / calculatedMax) * 100));

          return (
            <div
              key={item.id}
              className="flex-1 max-w-[54px] min-w-[32px] flex flex-col items-center justify-end h-48 group relative"
            >
              {/* Value indicator tooltip / label */}
              <span className="text-[10px] font-mono font-bold text-stone-600 mb-1 truncate">
                {item.displayValue}
              </span>

              {/* Animated Bar */}
              <motion.div
                layout
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className={`w-full rounded-t-xl border-t border-x transition-colors duration-150 ${
                  stateColors[item.state]
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Station Label & Index */}
              <div className="mt-2 text-center w-full">
                <span className="text-[10px] font-mono font-bold text-stone-500 block truncate">
                  {item.label}
                </span>
                <span className="text-[9px] text-stone-400 block font-mono">[{index}]</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Criteria Info & Legend */}
      <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <span className="font-semibold text-stone-700">
          Sorting Metric: <span className="text-emerald-700 font-bold uppercase">{criteriaLabel}</span>
        </span>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Default
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-400" /> Comparing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" /> Swapping
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-teal-600" /> Sorted
          </span>
        </div>
      </div>
    </div>
  );
};
