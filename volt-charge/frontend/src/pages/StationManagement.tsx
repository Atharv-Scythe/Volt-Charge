import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Zap,
  Clock,
  LayoutGrid,
  Table as TableIcon,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { stationService } from '@/services/stationService';
import { StationFormModal } from '@/components/stations/StationFormModal';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { Station } from '@/types';

export const StationManagement: React.FC = () => {
  const { stations, refreshStations, addToast, addActivity } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Station | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered stations
  const filteredStations = useMemo(() => {
    if (!searchQuery.trim()) return stations;
    const q = searchQuery.toLowerCase().trim();
    return stations.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.id.toLowerCase().includes(q) ||
        st.location.toLowerCase().includes(q)
    );
  }, [stations, searchQuery]);

  const handleOpenCreate = () => {
    setSelectedStation(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (station: Station) => {
    setSelectedStation(station);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: Partial<Station>) => {
    try {
      if (modalMode === 'create') {
        await stationService.createStation(data as any);
        addToast('success', `Station ${data.name} created successfully!`);
        addActivity('station', `Created charging station ${data.name} (${data.id})`);
      } else {
        await stationService.updateStation(data.id!, data);
        addToast('success', `Station ${data.name} updated successfully!`);
        addActivity('station', `Updated charging station details for ${data.id}`);
      }
      await refreshStations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save station';
      addToast('error', msg);
      throw err;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setDeleting(true);
      await stationService.deleteStation(deleteCandidate.id);
      addToast('success', `Station ${deleteCandidate.name} has been deleted.`);
      addActivity('station', `Deleted charging station ${deleteCandidate.name} (${deleteCandidate.id})`);
      setDeleteCandidate(null);
      await refreshStations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete station';
      addToast('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
            Station Management &amp; Persistence
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Create, update, search, and delete charging hub records with persistent SQLite synchronization.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add New Station
        </button>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, station name, or locality..."
            className="w-full px-4 py-2 pl-9 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 font-medium">
            Total: <b className="text-stone-800">{filteredStations.length}</b> records
          </span>

          {/* View toggle */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Station Name</th>
                  <th className="p-3.5">Locality</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Ports (Avail/Total)</th>
                  <th className="p-3.5">Power</th>
                  <th className="p-3.5">Wait Time</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {filteredStations.map((st) => (
                  <tr key={st.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-stone-500">{st.id}</td>
                    <td className="p-3.5 font-bold text-stone-900">{st.name}</td>
                    <td className="p-3.5 text-stone-500 max-w-[200px] truncate">{st.location}</td>
                    <td className="p-3.5">
                      <Badge variant={st.chargingType?.includes('DC') ? 'teal' : 'emerald'}>
                        {st.chargingType}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-bold ${
                          st.availablePorts > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {st.availablePorts}
                      </span>{' '}
                      / {st.totalPorts}
                    </td>
                    <td className="p-3.5 font-mono">{st.chargingRate} kW</td>
                    <td className="p-3.5">{st.waitingTime}m</td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                          title="Edit Station"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteCandidate(st)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Station"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStations.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                    {st.id}
                  </span>
                  <Badge variant={st.chargingType?.includes('DC') ? 'teal' : 'emerald'}>
                    {st.chargingType}
                  </Badge>
                </div>
                <h4 className="text-base font-bold text-stone-900 mt-2">{st.name}</h4>
                <p className="text-xs text-stone-500 mt-1 truncate">{st.location}</p>

                <div className="mt-4 pt-3 border-t border-stone-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Ports</span>
                    <span className="font-bold text-emerald-600 block mt-0.5">
                      {st.availablePorts}/{st.totalPorts}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Power</span>
                    <span className="font-bold text-stone-800 block mt-0.5">{st.chargingRate} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Wait</span>
                    <span className="font-bold text-stone-800 block mt-0.5">{st.waitingTime}m</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(st)}
                  className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteCandidate(st)}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Station Form Modal (Add / Edit) */}
      <StationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedStation}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <Modal
          isOpen={!!deleteCandidate}
          onClose={() => setDeleteCandidate(null)}
          title="Confirm Station Deletion"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Are you sure you want to delete this station?</p>
                <p className="mt-0.5 text-rose-700">
                  This will permanently remove <b>{deleteCandidate.name} ({deleteCandidate.id})</b> from the database. All dashboard metrics, route distances, and queue assignments will update dynamically.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
