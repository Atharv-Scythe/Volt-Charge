import React from 'react';
import { BookOpen, Clock, Cpu, Code2 } from 'lucide-react';

interface AlgorithmInfoProps {
  name: string;
  description: string;
  pseudocode: string[];
  activeLine?: number;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  currentOperation?: string;
}

export const AlgorithmInfo: React.FC<AlgorithmInfoProps> = ({
  name,
  description,
  pseudocode,
  activeLine = -1,
  timeComplexity,
  spaceComplexity,
  currentOperation,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-600 mb-1">
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Algorithm Insights</span>
        </div>
        <h4 className="text-base font-bold text-stone-900 tracking-tight">{name}</h4>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">{description}</p>
      </div>

      {/* Real-time Operation Status */}
      {currentOperation && (
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Current Action
          </span>
          <p className="text-xs font-mono font-medium text-emerald-950 mt-0.5">
            {currentOperation}
          </p>
        </div>
      )}

      {/* Complexity Badges */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
          <div className="flex items-center gap-1 text-stone-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase">Time Complexity</span>
          </div>
          <div className="space-y-0.5 font-mono text-[11px] text-stone-700">
            <div>Best: <b className="text-emerald-700">{timeComplexity.best}</b></div>
            <div>Avg: <b className="text-stone-900">{timeComplexity.average}</b></div>
            <div>Worst: <b className="text-rose-700">{timeComplexity.worst}</b></div>
          </div>
        </div>

        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1 text-stone-400 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">Space Complexity</span>
            </div>
            <div className="font-mono text-sm font-bold text-stone-800 mt-1">
              {spaceComplexity}
            </div>
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">In-place auxiliary</span>
        </div>
      </div>

      {/* Pseudocode Panel */}
      <div>
        <div className="flex items-center gap-1.5 text-stone-500 mb-1.5">
          <Code2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Pseudocode Trace</span>
        </div>
        <div className="bg-stone-900 text-stone-100 rounded-xl p-3 font-mono text-[11px] overflow-x-auto leading-relaxed max-h-48">
          {pseudocode.map((line, idx) => (
            <div
              key={idx}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                activeLine === idx
                  ? 'bg-emerald-500/30 text-emerald-300 font-bold border-l-2 border-emerald-400 pl-2'
                  : 'text-stone-300'
              }`}
            >
              <span className="inline-block w-5 text-stone-600 select-none text-[10px]">
                {idx + 1}
              </span>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
