import React, { useState } from 'react';
import { Plus, ArrowRight, Eye, Trash2, Shuffle, Car } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Modal } from '@/components/ui/Modal';

interface QueueControlsProps {
  onEnqueue: (vehicle: Partial<Vehicle>) => Promise<void>;
  onDequeue: () => Promise<void>;
  onPeek: () => Promise<void>;
  onClear: () => Promise<void>;
  isFull: boolean;
  isEmpty: boolean;
  loading?: boolean;
}

const EV_MODELS = [
  'Tesla Model 3',
  'Tata Nexon EV',
  'MG ZS EV',
  'Hyundai Kona Electric',
  'BYD Atto 3',
  'Mahindra XUV400',
  'Kia EV6',
  'BMW iX',
  'Audi e-tron',
  'Porsche Taycan',
];

export const QueueControls: React.FC<QueueControlsProps> = ({
  onEnqueue,
  onDequeue,
  onPeek,
  onClear,
  isFull,
  isEmpty,
  loading = false,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: `VH00${Math.floor(10 + Math.random() * 89)}`,
    type: 'Tesla Model 3',
    batteryPercentage: 20,
    requiredPercentage: 80,
    chargingDuration: 35,
    assignedStation: 'ST001',
  });

  const handleQuickAdd = async () => {
    const randomModel = EV_MODELS[Math.floor(Math.random() * EV_MODELS.length)];
    const randomBattery = Math.floor(10 + Math.random() * 30);
    const randomDuration = Math.floor(20 + Math.random() * 40);
    const randomId = `VH00${Math.floor(10 + Math.random() * 89)}`;

    await onEnqueue({
      id: randomId,
      type: randomModel,
      batteryPercentage: randomBattery,
      requiredPercentage: 90,
      chargingDuration: randomDuration,
      assignedStation: 'ST001',
    });
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onEnqueue(formData);
    setIsAddModalOpen(false);
    // Reset ID for next
    setFormData({
      ...formData,
      id: `VH00${Math.floor(10 + Math.random() * 89)}`,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-stone-900 tracking-tight">Queue Control Operations</h4>
          <p className="text-xs text-stone-500">Dispatch operations directly to C++ Circular Queue engine</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Enqueue Custom Vehicle */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={isFull || loading}
          className="px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Enqueue Vehicle
        </button>

        {/* Quick Simulated Add */}
        <button
          onClick={handleQuickAdd}
          disabled={isFull || loading}
          className="px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all border border-emerald-200 flex items-center gap-1.5"
          title="Generates random realistic EV parameters and enqueues"
        >
          <Shuffle className="w-3.5 h-3.5" />
          Quick Random EV
        </button>

        {/* Dequeue / Service */}
        <button
          onClick={onDequeue}
          disabled={isEmpty || loading}
          className="px-4 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          Dequeue (Service Front)
        </button>

        {/* Peek Front */}
        <button
          onClick={onPeek}
          disabled={isEmpty || loading}
          className="px-4 py-2.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          Peek Front
        </button>

        {/* Reset / Clear Queue */}
        <button
          onClick={onClear}
          disabled={isEmpty || loading}
          className="px-4 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all ml-auto border border-rose-200 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Queue
        </button>
      </div>

      {/* Modal for adding specific vehicle */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enqueue EV into Circular Queue"
      >
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Vehicle Identifier *
            </label>
            <input
              type="text"
              required
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              EV Model Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {EV_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Current Battery (%)
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.batteryPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, batteryPercentage: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Target Battery (%)
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.requiredPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, requiredPercentage: parseInt(e.target.value) || 100 })
                }
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Estimated Duration (mins)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={formData.chargingDuration}
              onChange={(e) =>
                setFormData({ ...formData, chargingDuration: parseInt(e.target.value) || 30 })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
            >
              Enqueue Vehicle
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
