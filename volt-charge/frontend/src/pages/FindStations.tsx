import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ArrowUpDown, Navigation, MapPin, Zap, Clock, Users } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StationCard } from '@/components/stations/StationCard';
import { StationMap } from '@/components/map/StationMap';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Station } from '@/types';

export const FindStations: React.FC = () => {
  const navigate = useNavigate();
  const { stations, userLocation, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [chargingTypeFilter, setChargingTypeFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [sortBy, setSortBy] = useState<'distance' | 'waitingTime' | 'availablePorts' | 'name'>('distance');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [detailModalStation, setDetailModalStation] = useState<Station | null>(null);

  // Filter & Sort
  const filteredStations = useMemo(() => {
    let result = [...stations];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (st) =>
          st.name.toLowerCase().includes(q) ||
          st.id.toLowerCase().includes(q) ||
          st.location.toLowerCase().includes(q)
      );
    }

    // Charging Type
    if (chargingTypeFilter !== 'all') {
      result = result.filter((st) =>
        st.chargingType.toLowerCase().includes(chargingTypeFilter.toLowerCase())
      );
    }

    // Available only
    if (availableOnly) {
      result = result.filter((st) => st.availablePorts > 0);
    }

    // Distance filter
    result = result.filter((st) => {
      if (typeof st.distance === 'number') {
        return st.distance <= maxDistance;
      }
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'distance') {
        return (a.distance || 0) - (b.distance || 0);
      } else if (sortBy === 'waitingTime') {
        return a.waitingTime - b.waitingTime;
      } else if (sortBy === 'availablePorts') {
        return b.availablePorts - a.availablePorts;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [stations, searchQuery, chargingTypeFilter, availableOnly, maxDistance, sortBy]);

  const handleJoinQueue = (station: Station) => {
    navigate('/queue');
    addToast('success', `Joined queue for ${station.name}`);
  };

  const handleNavigate = (station: Station) => {
    setSelectedStation(station);
    addToast('info', `Centered map on ${station.name} (${station.id})`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stations by name, ID (e.g. ST001), or locality..."
              className="w-full px-4 py-2.5 pl-10 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Charging type filter */}
            <select
              value={chargingTypeFilter}
              onChange={(e) => setChargingTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium text-stone-700 shadow-sm"
            >
              <option value="all">All Charging Types</option>
              <option value="dc">DC Fast Only</option>
              <option value="level">Level 2 AC Only</option>
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent font-medium text-stone-700 focus:outline-none text-xs"
              >
                <option value="distance">Sort by Distance (Haversine)</option>
                <option value="waitingTime">Sort by Wait Time</option>
                <option value="availablePorts">Sort by Available Ports</option>
                <option value="name">Sort Alphabetically</option>
              </select>
            </div>

            {/* Toggle Available only */}
            <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-stone-700 bg-stone-50 px-3 py-2 rounded-xl border border-stone-200">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="rounded accent-emerald-600"
              />
              Available Only
            </label>
          </div>
        </div>

        {/* Distance Range Slider & Count */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500 gap-3">
          <div className="flex items-center gap-3">
            <span>Radius Range:</span>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-32 accent-emerald-600 cursor-pointer"
            />
            <span className="font-bold text-stone-800 font-mono">{maxDistance} km</span>
          </div>

          <span className="font-semibold text-stone-700">
            Showing <b className="text-emerald-700">{filteredStations.length}</b> of {stations.length} stations
          </span>
        </div>
      </div>

      {/* Main Split View: Map + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Station Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 max-h-[820px] overflow-y-auto pr-1">
          {filteredStations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`cursor-pointer rounded-2xl transition-all ${
                    selectedStation?.id === st.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''
                  }`}
                >
                  <StationCard
                    station={st}
                    onJoinQueue={handleJoinQueue}
                    onNavigate={handleNavigate}
                    onView={(station) => setDetailModalStation(station)}
                    isNearest={filteredStations[0]?.id === st.id && sortBy === 'distance'}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-stone-200">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-stone-800">No matching stations found</h4>
              <p className="text-xs text-stone-400 mt-1">
                Try widening your search filters or increasing the radius distance.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Leaflet Map (5 Cols) */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-stone-900">Interactive Map View</h4>
              </div>
              {selectedStation && (
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  Focused: {selectedStation.id}
                </span>
              )}
            </div>

            <StationMap
              stations={filteredStations}
              userLocation={userLocation}
              selectedStation={selectedStation}
              onSelectStation={(st) => setSelectedStation(st)}
              height="h-[520px]"
            />
          </div>
        </div>
      </div>

      {/* Station Detail Modal */}
      {detailModalStation && (
        <Modal
          isOpen={!!detailModalStation}
          onClose={() => setDetailModalStation(null)}
          title={`Station Details — ${detailModalStation.name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                  {detailModalStation.id}
                </span>
                <h4 className="text-lg font-bold text-stone-900 mt-1">{detailModalStation.name}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{detailModalStation.location}</p>
              </div>
              <Badge variant="emerald">{detailModalStation.chargingType}</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Available</span>
                <span className="text-base font-bold text-emerald-600 block mt-1">
                  {detailModalStation.availablePorts} / {detailModalStation.totalPorts}
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Output</span>
                <span className="text-base font-bold text-stone-800 block mt-1">
                  {detailModalStation.chargingRate} kW
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Wait Time</span>
                <span className="text-base font-bold text-stone-800 block mt-1">
                  {detailModalStation.waitingTime} mins
                </span>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Haversine</span>
                <span className="text-base font-bold text-emerald-700 block mt-1">
                  {detailModalStation.distance ? `${detailModalStation.distance.toFixed(1)} km` : '--'}
                </span>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-500">Geographical Latitude:</span>
                <span className="font-mono font-semibold text-stone-800">{detailModalStation.latitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Geographical Longitude:</span>
                <span className="font-mono font-semibold text-stone-800">{detailModalStation.longitude}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="font-semibold text-emerald-600 uppercase">{detailModalStation.status || 'Active'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDetailModalStation(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const s = detailModalStation;
                  setDetailModalStation(null);
                  handleJoinQueue(s);
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Join Station Queue
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
