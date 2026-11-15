import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Settings as SettingsIcon, MapPin, Sliders, ShieldCheck, Info, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { userLocation, setUserLocation, addToast } = useApp();
  const [lat, setLat] = useState(userLocation.latitude);
  const [lon, setLon] = useState(userLocation.longitude);
  const [saved, setSaved] = useState(false);

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setUserLocation({ latitude: lat, longitude: lon });
    addToast('success', 'User GPS coordinates updated successfully!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleResetDefault = () => {
    setLat(28.6139);
    setLon(77.2090);
    setUserLocation({ latitude: 28.6139, longitude: 77.2090 });
    addToast('info', 'Reset coordinates to New Delhi (28.6139, 77.2090)');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Configure simulated geographical coordinates, buffer constraints, and system parameters.
        </p>
      </div>

      {/* GPS Location Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <div>
            <h4 className="text-sm font-bold text-stone-900">Simulated User GPS Location</h4>
            <p className="text-xs text-stone-500">
              Origin coordinates utilized for Haversine distance computations in C++
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveLocation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-600 mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={lon}
                onChange={(e) => setLon(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-2 rounded-xl transition-colors"
            >
              Reset to New Delhi (28.6139, 77.2090)
            </button>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              {saved ? <Check className="w-4 h-4" /> : null}
              {saved ? 'Saved!' : 'Update Coordinates'}
            </button>
          </div>
        </form>
      </div>

      {/* Platform & Algorithm Architecture Info */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
          <Info className="w-5 h-5 text-teal-600" />
          <div>
            <h4 className="text-sm font-bold text-stone-900">About Volt-Charge Platform</h4>
            <p className="text-xs text-stone-500">Academic &amp; Full-Stack Specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2">
            <h5 className="font-bold text-stone-900">Frontend Technology</h5>
            <ul className="space-y-1 text-stone-600 list-disc list-inside">
              <li>React 18 with TypeScript &amp; Vite</li>
              <li>Tailwind CSS &amp; Lucide React Icons</li>
              <li>Framer Motion for real-time animations</li>
              <li>Leaflet &amp; OpenStreetMap for geospatial visualization</li>
              <li>Recharts for analytical telemetry</li>
            </ul>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 space-y-2">
            <h5 className="font-bold text-stone-900">Backend &amp; Algorithm Engine</h5>
            <ul className="space-y-1 text-stone-600 list-disc list-inside">
              <li>Python Flask REST API with Blueprints</li>
              <li>SQLite 3 database with automatic schema seeding</li>
              <li>Native C++11 Algorithm Engine (volt_engine.exe)</li>
              <li>Array-based Circular Queue with O(1) pointers</li>
              <li>Linear Scan &amp; Binary Search O(log n)</li>
              <li>Bubble, Selection, Merge &amp; Quick Sort</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-stone-400">
          Volt-Charge Platform &bull; Version 1.0.0 &bull; Designed for College DSA Evaluation &amp; EV Navigation
        </div>
      </div>
    </div>
  );
};
