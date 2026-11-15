import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Station } from '@/types';

interface StationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Station>) => Promise<void>;
  initialData?: Station | null;
  mode: 'create' | 'edit';
}

export const StationFormModal: React.FC<StationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    latitude: 28.6139,
    longitude: 77.2090,
    chargingType: 'DC Fast' as 'DC Fast' | 'Level 2',
    totalPorts: 8,
    availablePorts: 4,
    chargingRate: 150,
    waitingTime: 15,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        id: initialData.id,
        name: initialData.name,
        location: initialData.location,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        chargingType: (initialData.chargingType as 'DC Fast' | 'Level 2') || 'DC Fast',
        totalPorts: initialData.totalPorts,
        availablePorts: initialData.availablePorts,
        chargingRate: initialData.chargingRate,
        waitingTime: initialData.waitingTime,
      });
    } else {
      setFormData({
        id: `ST${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        location: '',
        latitude: 28.6139,
        longitude: 77.2090,
        chargingType: 'DC Fast',
        totalPorts: 8,
        availablePorts: 4,
        chargingRate: 150,
        waitingTime: 15,
      });
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.id.trim()) newErrors.id = 'Station ID is required';
    if (!formData.name.trim()) newErrors.name = 'Station Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location description is required';
    if (formData.latitude < -90 || formData.latitude > 90) newErrors.latitude = 'Invalid latitude (-90 to 90)';
    if (formData.longitude < -180 || formData.longitude > 180) newErrors.longitude = 'Invalid longitude (-180 to 180)';
    if (formData.totalPorts <= 0) newErrors.totalPorts = 'Total ports must be at least 1';
    if (formData.availablePorts < 0) newErrors.availablePorts = 'Available ports cannot be negative';
    if (formData.availablePorts > formData.totalPorts) newErrors.availablePorts = 'Available cannot exceed total ports';
    if (formData.chargingRate <= 0) newErrors.chargingRate = 'Charging rate must be > 0 kW';
    if (formData.waitingTime < 0) newErrors.waitingTime = 'Waiting time cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Charging Station' : 'Edit Charging Station'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Station ID */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Station ID *
            </label>
            <input
              type="text"
              disabled={mode === 'edit'}
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-stone-100 font-mono"
              placeholder="e.g. ST016"
            />
            {errors.id && <p className="text-xs text-rose-500 mt-1">{errors.id}</p>}
          </div>

          {/* Station Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Station Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. EcoVolt Express"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Location description */}
        <div>
          <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
            Location Address *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. South Extension II, New Delhi"
          />
          {errors.location && <p className="text-xs text-rose-500 mt-1">{errors.location}</p>}
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Latitude (Haversine input) *
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            {errors.latitude && <p className="text-xs text-rose-500 mt-1">{errors.latitude}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Longitude (Haversine input) *
            </label>
            <input
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
            {errors.longitude && <p className="text-xs text-rose-500 mt-1">{errors.longitude}</p>}
          </div>
        </div>

        {/* Charging Type & Rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Charging Type
            </label>
            <select
              value={formData.chargingType}
              onChange={(e) =>
                setFormData({ ...formData, chargingType: e.target.value as 'DC Fast' | 'Level 2' })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="DC Fast">DC Fast (150-250 kW)</option>
              <option value="Level 2">Level 2 AC (22 kW)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Power Output (kW)
            </label>
            <input
              type="number"
              value={formData.chargingRate}
              onChange={(e) => setFormData({ ...formData, chargingRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Ports & Wait Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Total Ports *
            </label>
            <input
              type="number"
              value={formData.totalPorts}
              onChange={(e) => setFormData({ ...formData, totalPorts: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.totalPorts && <p className="text-xs text-rose-500 mt-1">{errors.totalPorts}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Available Ports *
            </label>
            <input
              type="number"
              value={formData.availablePorts}
              onChange={(e) => setFormData({ ...formData, availablePorts: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.availablePorts && <p className="text-xs text-rose-500 mt-1">{errors.availablePorts}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
              Wait Time (mins) *
            </label>
            <input
              type="number"
              value={formData.waitingTime}
              onChange={(e) => setFormData({ ...formData, waitingTime: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.waitingTime && <p className="text-xs text-rose-500 mt-1">{errors.waitingTime}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : mode === 'create' ? 'Create Station' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
