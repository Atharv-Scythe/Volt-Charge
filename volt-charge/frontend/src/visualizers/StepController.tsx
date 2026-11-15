import React from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface StepControllerProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack?: () => void;
  onReset: () => void;
  currentStep: number;
  totalSteps: number;
  speed: number;
  setSpeed: (s: number) => void;
  disabled?: boolean;
}

export const StepController: React.FC<StepControllerProps> = ({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  currentStep,
  totalSteps,
  speed,
  setSpeed,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={disabled || currentStep === 0}
          className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-xl transition-colors"
          title="Reset to Step 0"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {onStepBack && (
          <button
            onClick={onStepBack}
            disabled={disabled || isPlaying || currentStep <= 0}
            className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-xl transition-colors"
            title="Step Back"
          >
            <SkipBack className="w-4 h-4" />
          </button>
        )}

        {isPlaying ? (
          <button
            onClick={onPause}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Pause className="w-4 h-4 fill-current" />
            Pause
          </button>
        ) : (
          <button
            onClick={onPlay}
            disabled={disabled || (totalSteps > 0 && currentStep >= totalSteps)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            Play
          </button>
        )}

        <button
          onClick={onStepForward}
          disabled={disabled || isPlaying || (totalSteps > 0 && currentStep >= totalSteps)}
          className="p-2 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded-xl transition-colors"
          title="Step Forward"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Step Counter */}
      <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
        <span>
          Step: <b className="text-stone-900">{currentStep}</b> / {totalSteps}
        </span>
        <div className="w-24 bg-stone-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-150"
            style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-stone-500 font-medium">Speed:</span>
        <input
          type="range"
          min="100"
          max="1200"
          step="100"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          className="w-24 accent-emerald-600 cursor-pointer"
        />
        <span className="font-mono text-stone-600 w-12 text-right">{speed}ms</span>
      </div>
    </div>
  );
};
