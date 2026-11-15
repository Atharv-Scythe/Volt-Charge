import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { algorithmService } from '@/services/algorithmService';
import { StepController } from '@/visualizers/StepController';
import { BarVisualizer, BarItem } from '@/visualizers/BarVisualizer';
import { AlgorithmInfo } from './AlgorithmInfo';
import type { SortStep, Station } from '@/types';
import { BarChart3, Layers, Zap } from 'lucide-react';

export const SortLab: React.FC = () => {
  const { stations } = useApp();
  const [algorithm, setAlgorithm] = useState<'bubble' | 'selection' | 'merge' | 'quick'>('bubble');
  const [criteria, setCriteria] = useState<'distance' | 'availablePorts' | 'waitingTime' | 'name'>('waitingTime');
  const [datasetSize, setDatasetSize] = useState<number>(10);
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, executionTimeMs: 0 });
  const [showComparisonTable, setShowComparisonTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<any>(null);

  // Initial items based on criteria
  const getInitialValue = (st: Station) => {
    switch (criteria) {
      case 'distance':
        return typeof st.distance === 'number' ? st.distance : 15.0;
      case 'availablePorts':
        return st.availablePorts;
      case 'waitingTime':
        return st.waitingTime;
      case 'name':
        return st.name.charCodeAt(0);
      default:
        return st.waitingTime;
    }
  };

  const [bars, setBars] = useState<BarItem[]>([]);

  const handleRunSort = async () => {
    try {
      setLoading(true);
      setIsPlaying(false);
      setCurrentStepIndex(0);

      const res = await algorithmService.sortStations(algorithm, criteria, datasetSize);
      const rawSteps = (res.steps || []) as SortStep[];
      setSteps(rawSteps);
      setStats({
        comparisons: res.comparisons || 0,
        swaps: res.swaps || 0,
        executionTimeMs: res.executionTime || 0.1,
      });

      // Prepare initial bars
      const initial = stations.slice(0, datasetSize).map((s) => ({
        id: s.id,
        label: s.name.substring(0, 8),
        value: getInitialValue(s),
        displayValue:
          criteria === 'name' ? s.name.substring(0, 3) : String(getInitialValue(s)),
        state: 'default' as BarItem['state'],
      }));
      setBars(initial);
    } catch (err) {
      console.error('Sort error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunSort();
  }, [algorithm, criteria, datasetSize]);

  // Update bars when step changes
  useEffect(() => {
    if (steps.length === 0 || currentStepIndex === 0) {
      const initial = stations.slice(0, datasetSize).map((s) => ({
        id: s.id,
        label: s.name.substring(0, 8),
        value: getInitialValue(s),
        displayValue:
          criteria === 'name' ? s.name.substring(0, 3) : String(getInitialValue(s)),
        state: 'default' as BarItem['state'],
      }));
      setBars(initial);
      return;
    }

    const step = steps[currentStepIndex - 1];
    if (!step) return;

    setBars((prev) => {
      const next = [...prev];
      // Reset all to default unless finished
      for (let i = 0; i < next.length; i++) {
        next[i] = { ...next[i], state: currentStepIndex >= steps.length ? 'sorted' : 'default' };
      }

      if (step.indices && step.indices.length >= 2) {
        const [i1, i2] = step.indices;
        if (i1 < next.length && i2 < next.length) {
          const actionState = step.action === 'swap' ? 'swapping' : 'comparing';
          next[i1] = { ...next[i1], state: actionState };
          next[i2] = { ...next[i2], state: actionState };

          // If swap, swap values
          if (step.action === 'swap') {
            const temp = next[i1];
            next[i1] = next[i2];
            next[i2] = temp;
          }
        }
      }
      return next;
    });
  }, [currentStepIndex, steps, criteria]);

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

  const pseudocodes: Record<string, string[]> = {
    bubble: [
      'for i = 0 to n - 2:',
      '    for j = 0 to n - i - 2:',
      '        if array[j] > array[j + 1]:',
      '            swap(array[j], array[j + 1])',
      'return array',
    ],
    selection: [
      'for i = 0 to n - 2:',
      '    minIdx = i',
      '    for j = i + 1 to n - 1: if array[j] < array[minIdx]: minIdx = j',
      '    swap(array[i], array[minIdx])',
      'return array',
    ],
    merge: [
      'function mergeSort(arr, l, r):',
      '    if l >= r: return',
      '    m = l + (r - l) / 2',
      '    mergeSort(arr, l, m); mergeSort(arr, m + 1, r)',
      '    merge(arr, l, m, r)',
    ],
    quick: [
      'function quickSort(arr, low, high):',
      '    if low < high:',
      '        pi = partition(arr, low, high)',
      '        quickSort(arr, low, pi - 1)',
      '        quickSort(arr, pi + 1, high)',
    ],
  };

  const complexities: Record<string, any> = {
    bubble: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    selection: { best: 'O(n²)', average: 'O(n²)', worst: 'O(n²)', space: 'O(1)' },
    merge: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)' },
    quick: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)' },
  };

  return (
    <div className="space-y-6">
      {/* Configuration Controls */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Algorithm selector */}
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(['bubble', 'selection', 'merge', 'quick'] as const).map((alg) => (
              <button
                key={alg}
                onClick={() => setAlgorithm(alg)}
                className={`px-3 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                  algorithm === alg
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {alg} Sort
              </button>
            ))}
          </div>

          {/* Criteria */}
          <select
            value={criteria}
            onChange={(e) => setCriteria(e.target.value as any)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white"
          >
            <option value="waitingTime">Sort by Waiting Time</option>
            <option value="availablePorts">Sort by Available Ports</option>
            <option value="distance">Sort by Distance</option>
            <option value="name">Sort by Station Name</option>
          </select>

          {/* Dataset size */}
          <select
            value={datasetSize}
            onChange={(e) => setDatasetSize(parseInt(e.target.value))}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 bg-white"
          >
            <option value={8}>8 Stations (Fast Demo)</option>
            <option value={15}>15 Stations (Full Data)</option>
            <option value={50}>50 Stations (Benchmark)</option>
            <option value={100}>100 Stations (Stress Test)</option>
          </select>

          <button
            onClick={handleRunSort}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Run C++ Sort
          </button>
        </div>

        <button
          onClick={() => setShowComparisonTable(!showComparisonTable)}
          className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          {showComparisonTable ? 'Hide Benchmark' : 'Compare 4 Algorithms'}
        </button>
      </div>

      {/* Benchmark Matrix Table (if toggled) */}
      {showComparisonTable && (
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm animate-in fade-in duration-200">
          <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Sorting Algorithm Complexity &amp; Empirical Benchmark
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase">
                <tr>
                  <th className="p-3">Algorithm</th>
                  <th className="p-3">Best Time</th>
                  <th className="p-3">Average Time</th>
                  <th className="p-3">Worst Time</th>
                  <th className="p-3">Space</th>
                  <th className="p-3">Stability</th>
                  <th className="p-3">Use Case in EV Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                <tr className="hover:bg-stone-50/50">
                  <td className="p-3 font-bold text-emerald-700">Bubble Sort</td>
                  <td className="p-3 font-mono">O(n)</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(1)</td>
                  <td className="p-3 text-emerald-600">Stable</td>
                  <td className="p-3">Small queues / educational comparison</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="p-3 font-bold text-emerald-700">Selection Sort</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(1)</td>
                  <td className="p-3 text-rose-600">Unstable</td>
                  <td className="p-3">Minimizing memory write operations</td>
                </tr>
                <tr className="hover:bg-stone-50/50 bg-emerald-50/30">
                  <td className="p-3 font-bold text-emerald-700">Merge Sort</td>
                  <td className="p-3 font-mono">O(n log n)</td>
                  <td className="p-3 font-mono">O(n log n)</td>
                  <td className="p-3 font-mono">O(n log n)</td>
                  <td className="p-3 font-mono">O(n)</td>
                  <td className="p-3 text-emerald-600">Stable</td>
                  <td className="p-3">Predictable O(n log n) distance sorting</td>
                </tr>
                <tr className="hover:bg-stone-50/50">
                  <td className="p-3 font-bold text-emerald-700">Quick Sort</td>
                  <td className="p-3 font-mono">O(n log n)</td>
                  <td className="p-3 font-mono">O(n log n)</td>
                  <td className="p-3 font-mono">O(n²)</td>
                  <td className="p-3 font-mono">O(log n)</td>
                  <td className="p-3 text-rose-600">Unstable</td>
                  <td className="p-3">In-place high-throughput fleet sorting</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Sort Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <BarVisualizer items={bars} criteriaLabel={criteria} />

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Comparisons</span>
              <span className="text-lg font-bold text-stone-800 font-mono mt-0.5 block">
                {stats.comparisons}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Swaps / Shifts</span>
              <span className="text-lg font-bold text-stone-800 font-mono mt-0.5 block">
                {stats.swaps}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200/80 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Execution Time</span>
              <span className="text-lg font-bold text-emerald-700 font-mono mt-0.5 block">
                {stats.executionTimeMs.toFixed(2)} ms
              </span>
            </div>
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
          name={`${algorithm.toUpperCase()} Sort`}
          description={`Manually written C++ sorting algorithm executing over the station collection according to ${criteria}.`}
          pseudocode={pseudocodes[algorithm]}
          activeLine={currentStep ? (currentStep.action === 'swap' ? 3 : 2) : 0}
          timeComplexity={complexities[algorithm]}
          spaceComplexity={complexities[algorithm].space}
          currentOperation={
            currentStep
              ? `Step ${currentStep.step}: ${currentStep.action.toUpperCase()} indices [${
                  currentStep.indices ? currentStep.indices.join(', ') : ''
                }] &rarr; values (${
                  currentStep.values ? currentStep.values.join(' vs ') : ''
                })`
              : 'Press Play or Step to visualize algorithm execution'
          }
        />
      </div>
    </div>
  );
};
