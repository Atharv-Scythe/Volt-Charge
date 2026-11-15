import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { algorithmService } from '@/services/algorithmService';
import { StepController } from '@/visualizers/StepController';
import { AlgorithmInfo } from './AlgorithmInfo';
import type { SearchStep } from '@/types';

export const SearchLab: React.FC = () => {
  const { stations } = useApp();
  const [algorithm, setAlgorithm] = useState<'linear_search' | 'binary_search'>('linear_search');
  const [searchField, setSearchField] = useState<'id' | 'name'>('id');
  const [searchKey, setSearchKey] = useState('ST005');
  const [steps, setSteps] = useState<SearchStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [found, setFound] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<any>(null);

  // Stations for searching (sorted if binary search)
  const displayStations = React.useMemo(() => {
    if (algorithm === 'binary_search') {
      return [...stations].sort((a, b) =>
        searchField === 'id' ? a.id.localeCompare(b.id) : a.name.localeCompare(b.name)
      );
    }
    return stations;
  }, [stations, algorithm, searchField]);

  const handleExecute = async () => {
    try {
      setLoading(true);
      setIsPlaying(false);
      setCurrentStepIndex(0);
      setResultMessage(null);
      setFound(null);

      const algType = algorithm === 'linear_search' ? 'linear' : 'binary';
      const res = await algorithmService.searchStations(algType, searchKey, searchField);

      const rawSteps = (res.steps || []) as SearchStep[];
      setSteps(rawSteps);
      setResultMessage((res as any).message || (res.result ? 'Station Found!' : 'Station Not Found'));
      setFound(!!res.result);
      setCurrentStepIndex(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search error';
      setResultMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleExecute();
  }, [algorithm, searchField]);

  // Animation player
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

  const pseudocode =
    algorithm === 'linear_search'
      ? [
          'for i = 0 to stations.length - 1:',
          '    if stations[i].' + searchField + ' == key:',
          '        return stations[i]  // Match found',
          'return NOT_FOUND',
        ]
      : [
          'low = 0, high = stations.length - 1',
          'while low <= high:',
          '    mid = floor((low + high) / 2)',
          '    if stations[mid].' + searchField + ' == key: return mid',
          '    else if stations[mid].' + searchField + ' < key: low = mid + 1',
          '    else: high = mid - 1',
          'return NOT_FOUND',
        ];

  const getActiveLine = () => {
    if (!currentStep) return 0;
    if (algorithm === 'linear_search') {
      return currentStep.match ? 2 : 1;
    } else {
      if (currentStep.match) return 3;
      return 4;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Configuration Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Algorithm Toggle */}
          <div className="flex rounded-xl bg-stone-100 p-1">
            <button
              onClick={() => setAlgorithm('linear_search')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                algorithm === 'linear_search'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Linear Search O(n)
            </button>
            <button
              onClick={() => setAlgorithm('binary_search')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                algorithm === 'binary_search'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Binary Search O(log n)
            </button>
          </div>

          {/* Search Field */}
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as 'id' | 'name')}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white"
          >
            <option value="id">Search by Station ID</option>
            <option value="name">Search by Name</option>
          </select>

          {/* Search Key Input */}
          <div className="relative">
            <input
              type="text"
              value={searchKey}
              onChange={(e) => setSearchKey(e.target.value)}
              placeholder="Search key..."
              className="px-3 py-2 pl-8 text-xs font-mono rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Run C++ Search
          </button>
        </div>

        {/* Quick Station Selectors */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-stone-400 font-medium">Quick keys:</span>
          {['ST001', 'ST005', 'ST011', 'ST999'].map((k) => (
            <button
              key={k}
              onClick={() => {
                setSearchField('id');
                setSearchKey(k);
              }}
              className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md font-mono text-[11px]"
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Elements Runway */}
          <div className="bg-stone-50/80 rounded-2xl p-6 border border-stone-200/80 min-h-[320px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Station Dataset Array ({displayStations.length} elements)
                </span>
                {algorithm === 'binary_search' && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Pre-sorted for Binary Search
                  </span>
                )}
              </div>

              {/* Station blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {displayStations.map((st, idx) => {
                  let isChecked = false;
                  let isCurrent = false;
                  let isMatch = false;
                  let isLow = false;
                  let isHigh = false;
                  let isMid = false;

                  if (currentStep) {
                    if (algorithm === 'linear_search') {
                      isChecked = idx < currentStepIndex;
                      isCurrent = (currentStep as any).index === idx;
                      isMatch = isCurrent && currentStep.match;
                    } else {
                      isLow = (currentStep as any).low === idx;
                      isHigh = (currentStep as any).high === idx;
                      isMid = (currentStep as any).mid === idx;
                      isMatch = isMid && currentStep.match;
                    }
                  }

                  let cardStyle = 'bg-white border-stone-200 text-stone-700';
                  if (isMatch) {
                    cardStyle = 'bg-emerald-500 border-emerald-600 text-white ring-4 ring-emerald-200';
                  } else if (isMid || isCurrent) {
                    cardStyle = 'bg-amber-400 border-amber-500 text-stone-900 ring-4 ring-amber-200';
                  } else if (isLow || isHigh) {
                    cardStyle = 'bg-blue-50 border-blue-300 text-blue-900';
                  } else if (isChecked) {
                    cardStyle = 'bg-stone-100 border-stone-200 text-stone-400 opacity-60';
                  }

                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold">{st.id}</span>
                        <span className="text-[9px] font-mono opacity-60">[{idx}]</span>
                      </div>
                      <p className="text-xs font-bold truncate mt-1">{st.name}</p>
                      <div className="mt-2 text-[10px] font-mono flex items-center justify-between">
                        {isLow && <span className="font-bold text-blue-700">LOW</span>}
                        {isMid && <span className="font-bold text-amber-900">MID</span>}
                        {isHigh && <span className="font-bold text-blue-700">HIGH</span>}
                        {isMatch && <span className="font-bold text-white">MATCH!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Results bar */}
            <div className="mt-4 pt-4 border-t border-stone-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {found === true && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                {found === false && <XCircle className="w-4 h-4 text-rose-600" />}
                <span className="font-semibold text-stone-700">
                  {resultMessage || 'Step through to search'}
                </span>
              </div>
              <span className="text-stone-500 font-mono">
                Comparisons: <b>{currentStepIndex}</b> / {steps.length}
              </span>
            </div>
          </div>

          {/* Controls */}
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
          name={algorithm === 'linear_search' ? 'Linear Search' : 'Binary Search'}
          description={
            algorithm === 'linear_search'
              ? 'Sequentially checks each station record in the unsorted database array until a target match is found or the end of the array is reached.'
              : 'Repeatedly divides the search interval in half by comparing the search key with the middle element of a sorted station array.'
          }
          pseudocode={pseudocode}
          activeLine={getActiveLine()}
          timeComplexity={
            algorithm === 'linear_search'
              ? { best: 'O(1)', average: 'O(n)', worst: 'O(n)' }
              : { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' }
          }
          spaceComplexity="O(1)"
          currentOperation={
            currentStep
              ? `Comparing ${searchField} '${currentStep.compared}' with key '${searchKey}' &rarr; ${
                  currentStep.match ? 'FOUND' : 'No match, continue'
                }`
              : 'Press Play or Step to inspect execution'
          }
        />
      </div>
    </div>
  );
};
