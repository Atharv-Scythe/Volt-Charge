import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { algorithmService } from '@/services/algorithmService';
import { QueueVisualizer } from '@/components/queue/QueueVisualizer';
import { QueueControls } from '@/components/queue/QueueControls';
import type { Vehicle, QueueStep } from '@/types';
import { Users, AlertCircle, CheckCircle2, History, ShieldCheck, Zap } from 'lucide-react';

export const QueueSimulator: React.FC = () => {
  const { queueState, refreshQueue, addToast, addActivity } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [peekedId, setPeekedId] = useState<string | null>(null);
  const [operationLogs, setOperationLogs] = useState<
    { id: string; type: string; message: string; timestamp: string }[]
  >([
    {
      id: 'init-1',
      type: 'enqueue',
      message: 'Initial fleet pre-loaded into Circular Queue buffer',
      timestamp: 'System startup',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const MAX_CAPACITY = 20;

  useEffect(() => {
    if (queueState && queueState.vehicles) {
      setVehicles(queueState.vehicles);
    }
  }, [queueState]);

  const addLog = (type: string, message: string) => {
    const newLog = {
      id: Math.random().toString(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setOperationLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const handleEnqueue = async (vehicleData: Partial<Vehicle>) => {
    // Edge case: overflow check
    if (vehicles.length >= MAX_CAPACITY) {
      addToast('error', `Queue Overflow: Maximum buffer capacity (${MAX_CAPACITY}) reached!`);
      addLog('overflow', `OVERFLOW: Rejected ${vehicleData.id || 'vehicle'} — Queue is full`);
      return;
    }

    // Edge case: duplicate vehicle ID
    if (vehicles.some((v) => v.id === vehicleData.id)) {
      addToast('warning', `Duplicate ID Error: Vehicle ${vehicleData.id} is already in the queue!`);
      addLog('error', `DUPLICATE REJECTED: ${vehicleData.id} already present in buffer`);
      return;
    }

    try {
      setLoading(true);
      const res = await algorithmService.queueOperation('enqueue', vehicleData);
      if (res && res.result) {
        await refreshQueue();
        addToast('success', `Vehicle ${vehicleData.id} successfully enqueued!`);
        addLog('enqueue', `ENQUEUE: ${vehicleData.id} (${vehicleData.type}) added at rear pointer`);
        addActivity('queue', `Vehicle ${vehicleData.id} enqueued in charging buffer`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Enqueue error';
      addToast('error', msg);
      addLog('error', `ERROR: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDequeue = async () => {
    // Edge case: underflow check
    if (vehicles.length === 0) {
      addToast('error', 'Queue Underflow: Cannot dequeue from an empty buffer!');
      addLog('underflow', 'UNDERFLOW: Dequeue rejected — Queue is empty');
      return;
    }

    const frontVehicle = vehicles[0];

    try {
      setLoading(true);
      const res = await algorithmService.queueOperation('dequeue');
      if (res) {
        await refreshQueue();
        addToast('success', `Vehicle ${frontVehicle.id} completed charging and departed!`);
        addLog(
          'dequeue',
          `DEQUEUE: ${frontVehicle.id} (${frontVehicle.type}) departed. Next vehicle promoted to FRONT ⚡`
        );
        addActivity('charge', `Vehicle ${frontVehicle.id} finished session & departed`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Dequeue error';
      addToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePeek = async () => {
    if (vehicles.length === 0) {
      addToast('info', 'Queue is empty — nothing to inspect');
      return;
    }

    const frontVehicle = vehicles[0];
    setPeekedId(frontVehicle.id);
    addToast('info', `PEEK: Front vehicle is ${frontVehicle.id} (${frontVehicle.type})`);
    addLog(
      'peek',
      `PEEK: Front element at Index 0 &rarr; ${frontVehicle.id} (Battery: ${frontVehicle.batteryPercentage}%)`
    );

    // Auto clear peek highlight after 3 seconds
    setTimeout(() => {
      setPeekedId(null);
    }, 3000);
  };

  const handleClear = async () => {
    try {
      setLoading(true);
      await algorithmService.queueOperation('clear');
      await refreshQueue();
      setVehicles([]);
      addToast('info', 'Circular queue reset to empty state');
      addLog('clear', 'CLEAR: Queue buffer cleared by operator');
    } catch (err) {
      console.error('Clear error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & C++ Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Circular Queue EV Fleet Simulator
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time visual demonstration of custom C++ Circular Queue data structure with FIFO discipline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>C++ Native Implementation (circular_queue.cpp)</span>
          </div>
        </div>
      </div>

      {/* Main Queue Runway Component */}
      <QueueVisualizer
        vehicles={vehicles}
        capacity={MAX_CAPACITY}
        frontIndex={vehicles.length > 0 ? 0 : -1}
        rearIndex={vehicles.length > 0 ? vehicles.length - 1 : -1}
        peekedVehicleId={peekedId}
      />

      {/* Two Column Grid: Controls & Live Operations Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <QueueControls
            onEnqueue={handleEnqueue}
            onDequeue={handleDequeue}
            onPeek={handlePeek}
            onClear={handleClear}
            isFull={vehicles.length >= MAX_CAPACITY}
            isEmpty={vehicles.length === 0}
            loading={loading}
          />

          {/* Theoretical DSA Properties Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600" />
              Circular FIFO Data Structure Specifications
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Enqueue</span>
                <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">O(1)</span>
                <span className="text-[10px] text-stone-500">rear = (rear + 1) % N</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Dequeue</span>
                <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">O(1)</span>
                <span className="text-[10px] text-stone-500">front = (front + 1) % N</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Peek Front</span>
                <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">O(1)</span>
                <span className="text-[10px] text-stone-500">data[front]</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Space</span>
                <span className="text-sm font-bold font-mono text-stone-800 block mt-0.5">O(N)</span>
                <span className="text-[10px] text-stone-500">Array Ring Buffer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution History Log (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-stone-900">Queue Operations Log</h4>
                </div>
                <span className="text-[10px] font-mono text-stone-400 font-bold">
                  {operationLogs.length} events
                </span>
              </div>

              {/* Log Entries */}
              <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto mt-2 space-y-1">
                {operationLogs.map((log) => {
                  let badgeColor = 'bg-stone-100 text-stone-700';
                  if (log.type === 'enqueue') badgeColor = 'bg-emerald-50 text-emerald-700';
                  if (log.type === 'dequeue') badgeColor = 'bg-blue-50 text-blue-700';
                  if (log.type === 'peek') badgeColor = 'bg-amber-50 text-amber-700';
                  if (log.type === 'overflow' || log.type === 'underflow' || log.type === 'error')
                    badgeColor = 'bg-rose-50 text-rose-700';

                  return (
                    <div key={log.id} className="pt-2 pb-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${badgeColor}`}
                        >
                          {log.type}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="text-stone-800 font-medium mt-1 leading-snug">{log.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400 text-center font-mono">
              FIFO: Vehicle in position #1 always discharges first
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
