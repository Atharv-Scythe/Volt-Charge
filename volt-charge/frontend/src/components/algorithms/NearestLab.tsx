import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { algorithmService } from '@/services/algorithmService';
import { StepController } from '@/visualizers/StepController';
import { AlgorithmInfo } from './AlgorithmInfo';
import type { NearestStep } from '@/types';
import { Navigation, Compass, MapPin, Zap } from 'lucide-react';

export const NearestLab: React.FC = () => {
  const { stations, userLocation, setUserLocation } = useApp();
  const [steps, setSteps] = useState<NearestStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(700);
  const [nearestStation, setNearestStation] = useState<any>(null);
  const [minDist, setMinDist] = useState<number | null>(null);
  const timerRef = useRef<any>(null);

  const handleRunNearest = async () => {
    try {
      setIsPlaying(false);
      setCurrentStepIndex(0);

      const res = await algorithmService.findNearest(userLocation.latitude, userLocation.longitude);
      const rawSteps = (res.steps || []) as NearestStep[];
      setSteps(rawSteps);
      setNearestStation(res.result || null);
      if (rawSteps.length > 0) {
        setMinDist(rawSteps[rawSteps.length - 1].currentMin);
      }
    } catch (err) {
      console.error('Nearest station error:', err);
    }
  };

  useEffect(() => {
    handleRunNearest();
  }, [userLocation, stations]);

  // Player
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, steps.length]);

  const currentStep = steps[currentStepIndex - 1] || null;

  const pseudocode = [
    'minDist = INFINITY, nearestStation = NULL',
    'for each station in stations:',
    '    dLat = toRadians(station.lat - user.lat)',
    '    dLon = toRadians(station.lon - user.lon)',
    '    a = sin²(dLat/2) + cos(user.lat)*cos(station.lat)*sin²(dLon/2)',
    '    dist = 2 * R * atan2(√a, √(1-a))  // R = 6371 km',
    '    if dist < minDist: minDist = dist; nearestStation = station',
    'return nearestStation',
  ];

  return (
    <div className="space-y-6">
      {/* Location Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
            <Compass className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-stone-900">User Coordinates (Haversine Center)</h4>
            <p className="text-xs text-stone-500 font-mono">
              Latitude: {userLocation.latitude.toFixed(4)}, Longitude: {userLocation.longitude.toFixed(4)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick coordinate presets */}
          <span className="text-xs text-stone-400 font-medium">Test Locations:</span>
          {[
            { label: 'Connaught Place', lat: 28.6315, lon: 77.2167 },
            { label: 'Saket', lat: 28.5244, lon: 77.2090 },
            { label: 'Gurugram', lat: 28.4595, lon: 77.0266 },
          ].map((loc) => (
            <button
              key={loc.label}
              onClick={() => setUserLocation({ latitude: loc.lat, longitude: loc.lon })}
              className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700"
            >
              {loc.label}
            </button>
          ))}
          <button
            onClick={handleRunNearest}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all ml-2"
          >
            Re-run C++ Scan
          </button>
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Distance iteration cards */}
          <div className="bg-stone-50/80 rounded-2xl p-6 border border-stone-200/80 min-h-[340px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Linear Haversine Scan Trace ({stations.length} stations)
                </span>
                {currentStep && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Current Min: {currentStep.currentMin.toFixed(2)} km
                  </span>
                )}
              </div>

              {/* Station distance cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stations.map((st, idx) => {
                  const isChecked = idx < currentStepIndex;
                  const isCurrent = currentStepIndex - 1 === idx;
                  const isCurrentMin = currentStep && currentStep.stationId === st.id && currentStep.isNewMin;

                  let borderClass = 'border-stone-200 bg-white';
                  if (isCurrentMin) {
                    borderClass = 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300';
                  } else if (isCurrent) {
                    borderClass = 'border-amber-400 bg-amber-50 ring-2 ring-amber-300';
                  } else if (isChecked) {
                    borderClass = 'border-stone-200 bg-stone-100/70 opacity-60';
                  }

                  // Find step data if checked
                  const stepForThis = steps[idx];

                  return (
                    <div
                      key={st.id}
                      className={`p-3.5 rounded-xl border transition-all duration-200 ${borderClass}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-stone-400">{st.id}</span>
                        {isCurrentMin && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            NEW MIN
                          </span>
                        )}
                        {isCurrent && !isCurrentMin && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            CALCULATING
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs font-bold text-stone-900 truncate mt-1">{st.name}</h5>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">{st.location}</p>

                      <div className="mt-2.5 pt-2 border-t border-stone-200/50 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-stone-400">Distance:</span>
                        <span className="font-bold text-stone-800">
                          {stepForThis ? `${stepForThis.distance.toFixed(2)} km` : 'Pending...'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results bar */}
            {nearestStation && (
              <div className="mt-4 pt-4 border-t border-stone-200 flex items-center justify-between text-xs">
                <span className="text-stone-600">
                  Nearest Candidate:{' '}
                  <b className="text-emerald-700">{nearestStation.name} ({nearestStation.id})</b>
                </span>
                <span className="text-stone-500 font-mono">
                  Minimum Distance: <b>{minDist ? minDist.toFixed(2) : '--'} km</b>
                </span>
              </div>
            )}
          </div>

          {/* Step Controller */}
          <StepController
            isPlaying={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onStepForward={() => setCurrentStepIndex((p) => Math.min(steps.length, p + 1))}
            onStepBack={() => setCurrentStepIndex((p) => Math.max(0, p - 1))}
            onReset={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            speed={speed}
            setSpeed={setSpeed}
          />
        </div>

        {/* Algorithm details */}
        <AlgorithmInfo
          name="Haversine Formula &amp; Nearest Scan"
          description="Computes great-circle geographical distances between coordinates over Earth sphere (radius = 6371 km) and determines the absolute minimum in O(n) time."
          pseudocode={pseudocode}
          activeLine={currentStep ? (currentStep.isNewMin ? 6 : 5) : 0}
          timeComplexity={{ best: 'O(n)', average: 'O(n)', worst: 'O(n)' }}
          spaceComplexity="O(1)"
          currentOperation={
            currentStep
              ? `Station ${currentStep.stationId}: Calculated distance = ${currentStep.distance.toFixed(
                  2
                )} km &rarr; ${
                  currentStep.isNewMin ? 'UPDATED NEW MINIMUM' : 'Exceeds current minimum'
                }`
              : 'Press Play or Step to visualize Haversine calculations'
          }
        />
      </div>
    </div>
  );
};
