import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { algorithmService } from '@/services/algorithmService';
import { StepController } from '@/visualizers/StepController';
import { AlgorithmInfo } from './AlgorithmInfo';
import type { QueueStep, Vehicle } from '@/types';
import { ArrowRight, Plus, Eye, Trash2, Zap, Car } from 'lucide-react';

export const QueueLab: React.FC = () => {
  const { queueState, refreshQueue } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [steps, setSteps] = useState<QueueStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [front, setFront] = useState(0);
  const [rear, setRear] = useState(-1);
  const [statusMsg, setStatusMsg] = useState('Circular queue ready');
  const timerRef = useRef<any>(null);

  const MAX_CAPACITY = 10;

  useEffect(() => {
    if (queueState && queueState.vehicles) {
      setVehicles(queueState.vehicles.slice(0, MAX_CAPACITY));
      setFront(queueState.front >= 0 ? queueState.front : 0);
      setRear(queueState.rear >= 0 ? queueState.rear : -1);
    }
  }, [queueState]);

  const recordLocalStep = (op: string, vid: string, msg: string, updated: Vehicle[]) => {
    const newStep: QueueStep = {
      operation: op,
      vehicleId: vid,
      front: updated.length > 0 ? 0 : -1,
      rear: updated.length > 0 ? updated.length - 1 : -1,
      size: updated.length,
      queueState: updated,
      message: msg,
    };
    setSteps((prev) => [...prev, newStep]);
    setCurrentStepIndex((prev) => prev + 1);
  };

  const handleEnqueue = async () => {
    if (vehicles.length >= MAX_CAPACITY) {
      recordLocalStep('overflow', '', 'OVERFLOW: Cannot enqueue into full circular buffer (10/10)', vehicles);
      setStatusMsg('OVERFLOW ERROR: Queue is full!');
      return;
    }

    const nextNum = Math.floor(100 + Math.random() * 900);
    const newV: Vehicle = {
      id: `VH${nextNum}`,
      type: 'Tesla Model 3',
      batteryPercentage: 25,
      requiredPercentage: 85,
      chargingDuration: 30,
      arrivalTime: new Date().toISOString(),
      assignedStation: 'ST001',
    };

    const nextVehicles = [...vehicles, newV];
    setVehicles(nextVehicles);
    setRear((r) => (r + 1) % MAX_CAPACITY);
    setStatusMsg(`Enqueued ${newV.id} at rear index ${(rear + 1) % MAX_CAPACITY}`);
    recordLocalStep('enqueue', newV.id, `Enqueued vehicle ${newV.id} at rear pointer`, nextVehicles);
  };

  const handleDequeue = async () => {
    if (vehicles.length === 0) {
      recordLocalStep('underflow', '', 'UNDERFLOW: Cannot dequeue from empty circular buffer', []);
      setStatusMsg('UNDERFLOW ERROR: Queue is already empty!');
      return;
    }

    const departed = vehicles[0];
    const nextVehicles = vehicles.slice(1);
    setVehicles(nextVehicles);
    setStatusMsg(`Dequeued ${departed.id} from front position. Vehicle departing...`);
    recordLocalStep('dequeue', departed.id, `Vehicle ${departed.id} served and departed`, nextVehicles);
  };

  const handlePeek = () => {
    if (vehicles.length === 0) {
      setStatusMsg('Queue is empty — nothing to peek');
      return;
    }
    const frontV = vehicles[0];
    setStatusMsg(`PEEK: Front vehicle is ${frontV.id} (${frontV.type}), Battery: ${frontV.batteryPercentage}%`);
    recordLocalStep('peek', frontV.id, `Peeked front vehicle ${frontV.id}`, vehicles);
  };

  const handleClear = () => {
    setVehicles([]);
    setFront(0);
    setRear(-1);
    setStatusMsg('Queue reset to empty');
    recordLocalStep('clear', '', 'Queue cleared', []);
  };

  const pseudocode = [
    '// Enqueue Operation O(1)',
    'if isFull(): throw OverflowException',
    'rear = (rear + 1) % MAX_CAPACITY',
    'buffer[rear] = vehicle; count++',
    '',
    '// Dequeue Operation O(1)',
    'if isEmpty(): throw UnderflowException',
    'frontVehicle = buffer[front]',
    'front = (front + 1) % MAX_CAPACITY; count--',
    'return frontVehicle',
  ];

  const currentStep = steps[currentStepIndex - 1] || null;

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleEnqueue}
            disabled={vehicles.length >= MAX_CAPACITY}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Step Enqueue
          </button>

          <button
            onClick={handleDequeue}
            disabled={vehicles.length === 0}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            Step Dequeue
          </button>

          <button
            onClick={handlePeek}
            disabled={vehicles.length === 0}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-stone-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            Peek Front
          </button>

          <button
            onClick={handleClear}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200"
          >
            <Trash2 className="w-4 h-4" />
            Reset Buffer
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-3 py-1 bg-stone-100 rounded-xl font-bold text-stone-700">
            Size: <b className="text-emerald-700">{vehicles.length}</b> / {MAX_CAPACITY}
          </span>
          <span className="px-3 py-1 bg-stone-100 rounded-xl font-bold text-stone-700">
            Front: <b className="text-emerald-700">{vehicles.length > 0 ? 0 : -1}</b>
          </span>
          <span className="px-3 py-1 bg-stone-100 rounded-xl font-bold text-stone-700">
            Rear: <b className="text-blue-700">{vehicles.length > 0 ? vehicles.length - 1 : -1}</b>
          </span>
        </div>
      </div>

      {/* Main Visualizer Runway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-stone-50/80 rounded-2xl p-6 border border-stone-200/80 min-h-[340px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Circular Memory Buffer Ring (Slots 0 to {MAX_CAPACITY - 1})
                </span>
                <span className="text-xs font-mono font-bold text-stone-600 bg-white px-2.5 py-1 rounded-xl border border-stone-200 shadow-sm">
                  {statusMsg}
                </span>
              </div>

              {/* Memory slots row */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: MAX_CAPACITY }).map((_, slotIdx) => {
                  const hasVehicle = slotIdx < vehicles.length;
                  const v = hasVehicle ? vehicles[slotIdx] : null;
                  const isFront = hasVehicle && slotIdx === 0;
                  const isRear = hasVehicle && slotIdx === vehicles.length - 1;

                  let slotBorder = 'border-stone-200 bg-white';
                  if (isFront) {
                    slotBorder = 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-300';
                  } else if (isRear) {
                    slotBorder = 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-300';
                  } else if (!hasVehicle) {
                    slotBorder = 'border-dashed border-stone-200 bg-stone-50/40 text-stone-300';
                  }

                  return (
                    <div
                      key={slotIdx}
                      className={`p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[120px] ${slotBorder}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-stone-400">
                          Index [{slotIdx}]
                        </span>
                        {isFront && (
                          <span className="text-[9px] font-extrabold text-white bg-emerald-600 px-1.5 py-0.5 rounded-full">
                            FRONT
                          </span>
                        )}
                        {isRear && (
                          <span className="text-[9px] font-extrabold text-white bg-blue-600 px-1.5 py-0.5 rounded-full">
                            REAR
                          </span>
                        )}
                      </div>

                      {v ? (
                        <div className="my-1">
                          <span className="text-[10px] font-mono font-bold text-stone-500">{v.id}</span>
                          <h6 className="text-xs font-bold text-stone-900 truncate">{v.type}</h6>
                          <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1">
                            <span>Bat: {v.batteryPercentage}%</span>
                            <span>{v.chargingDuration}m</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-[11px] font-semibold text-stone-400">Empty Slot</span>
                        </div>
                      )}

                      <div className="text-[9px] font-mono text-stone-400 border-t border-stone-100 pt-1">
                        {isFront ? 'Charging ⚡' : hasVehicle ? 'Waiting...' : 'Available'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pointer calculation footer */}
            <div className="mt-4 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2 font-mono">
              <span>FIFO Principle: Earliest vehicle in receives charging first.</span>
              <span className="text-emerald-700 font-bold">Time Complexity: O(1) All Ops</span>
            </div>
          </div>

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
          name="Circular Queue (FIFO)"
          description="Fixed-size ring buffer where the last position connects back to the first position. Enables strict O(1) time complexity for enqueue and dequeue without shifting elements."
          pseudocode={pseudocode}
          activeLine={currentStep?.operation === 'enqueue' ? 3 : currentStep?.operation === 'dequeue' ? 8 : 0}
          timeComplexity={{ best: 'O(1)', average: 'O(1)', worst: 'O(1)' }}
          spaceComplexity="O(n)"
          currentOperation={
            currentStep
              ? `${currentStep.operation.toUpperCase()}: ${currentStep.message}`
              : 'Execute Enqueue or Dequeue to trace circular pointers'
          }
        />
      </div>
    </div>
  );
};
