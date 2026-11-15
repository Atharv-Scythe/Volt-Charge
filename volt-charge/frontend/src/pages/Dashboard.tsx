import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Zap,
  Users,
  Clock,
  Navigation,
  ArrowRight,
  BatteryCharging,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatCard } from '@/components/ui/StatCard';
import { StationCard } from '@/components/stations/StationCard';
import { algorithmService } from '@/services/algorithmService';
import type { Station } from '@/types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stations, userLocation, activities, queueState, addToast, refreshStations } = useApp();
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [nearestDistance, setNearestDistance] = useState<number | null>(null);
  const [loadingNearest, setLoadingNearest] = useState(false);

  // Compute nearest station via C++ engine on mount / location change
  useEffect(() => {
    const fetchNearest = async () => {
      if (stations.length === 0) return;
      try {
        setLoadingNearest(true);
        const res = await algorithmService.findNearest(userLocation.latitude, userLocation.longitude);
        if (res && res.result) {
          setNearestStation(res.result as Station);
          setNearestDistance((res as any).distance || null);
        }
      } catch (err) {
        console.error('Failed to compute nearest station:', err);
      } finally {
        setLoadingNearest(false);
      }
    };
    fetchNearest();
  }, [stations, userLocation]);

  // Total statistics
  const totalStations = stations.length;
  const totalPorts = stations.reduce((acc, s) => acc + (s.totalPorts || 0), 0);
  const availablePorts = stations.reduce((acc, s) => acc + (s.availablePorts || 0), 0);
  const vehiclesInQueue = queueState?.size || 0;
  const avgWaitingTime =
    totalStations > 0
      ? Math.round(stations.reduce((acc, s) => acc + (s.waitingTime || 0), 0) / totalStations)
      : 0;

  // Top nearby stations
  const nearbyStations = [...stations].slice(0, 6);

  const handleJoinQueue = (station: Station) => {
    navigate('/queue');
    addToast('info', `Navigated to queue for station ${station.name}`);
  };

  const handleNavigateStation = (station: Station) => {
    navigate('/find-stations');
    addToast('success', `Plotting navigation route to ${station.name}`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Smart EV Navigation &amp; C++ DSA Core
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Intelligent EV Charging &amp; Real Data Structure Simulator
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Optimized with Haversine great-circle navigation, circular FIFO buffers, binary search, and benchmarked sorting algorithms.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => navigate('/find-stations')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              Explore Stations
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/algorithm-lab')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/10"
            >
              Open Algorithm Lab
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Charging Stations"
          value={totalStations}
          icon={Building2}
          change="+2 new hubs"
          isPositive={true}
          accent="emerald"
        />
        <StatCard
          title="Available Charging Ports"
          value={`${availablePorts} / ${totalPorts}`}
          icon={Zap}
          change={`${Math.round((availablePorts / (totalPorts || 1)) * 100)}% available`}
          isPositive={true}
          accent="teal"
        />
        <StatCard
          title="Vehicles in Queue"
          value={vehiclesInQueue}
          icon={Users}
          change="Circular FIFO active"
          isPositive={vehiclesInQueue < 10}
          accent="amber"
        />
        <StatCard
          title="Average Waiting Time"
          value={`${avgWaitingTime} mins`}
          icon={Clock}
          change="Real-time estimated"
          isPositive={avgWaitingTime < 20}
          accent="indigo"
        />
      </div>

      {/* Two Column Layout: Main Stations Grid vs Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Nearby Stations */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">
                Nearby Charging Stations
              </h3>
              <p className="text-xs text-stone-500">
                Sorted by geographical proximity calculated via C++ Haversine formula
              </p>
            </div>
            <button
              onClick={() => navigate('/find-stations')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              View all {stations.length}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nearbyStations.map((station) => (
              <StationCard
                key={station.id}
                station={station}
                onJoinQueue={handleJoinQueue}
                onNavigate={handleNavigateStation}
                onView={(st) => navigate('/find-stations')}
                isNearest={nearestStation?.id === station.id}
              />
            ))}
          </div>
        </div>

        {/* Right Column (1/3): Nearest Station Highlight & Queue & Activity */}
        <div className="space-y-6">
          {/* Nearest Station Highlight Card */}
          {nearestStation && (
            <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500 text-stone-950 text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Optimal Match
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {nearestDistance ? `${nearestDistance.toFixed(1)} km away` : 'Closest'}
                </span>
              </div>

              <h4 className="text-xl font-extrabold tracking-tight mt-3">
                {nearestStation.name}
              </h4>
              <p className="text-xs text-stone-300 mt-1 truncate">{nearestStation.location}</p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/10 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Charging Power
                  </span>
                  <span className="font-bold text-emerald-300 text-sm mt-0.5 block">
                    {nearestStation.chargingRate} kW ({nearestStation.chargingType})
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Available Ports
                  </span>
                  <span className="font-bold text-white text-sm mt-0.5 block">
                    {nearestStation.availablePorts} of {nearestStation.totalPorts}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleJoinQueue(nearestStation)}
                className="w-full mt-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                Navigate &amp; Reserve Queue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Queue Overview Mini Card */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Hub Queue Status</h4>
                  <span className="text-[11px] text-stone-500">Circular buffer O(1)</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/queue')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Simulator &rarr;
              </button>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <span className="text-stone-500 font-medium">Currently Charging:</span>
                <span className="font-bold text-stone-900">
                  {queueState?.currentlyCharging
                    ? `${queueState.currentlyCharging.id} (${queueState.currentlyCharging.type})`
                    : 'None active'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <span className="text-stone-500 font-medium">Next in Service:</span>
                <span className="font-bold text-emerald-700">
                  {queueState?.nextInLine
                    ? `${queueState.nextInLine.id} (${queueState.nextInLine.type})`
                    : 'Queue Clear'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl">
                <span className="text-stone-500 font-medium">Est. Wait for New Arrival:</span>
                <span className="font-bold text-stone-900">
                  {(queueState?.size || 0) * 15} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h4 className="text-sm font-bold text-stone-900">Live System Activity</h4>
              <span className="text-[10px] text-stone-400 font-bold uppercase">Real-time</span>
            </div>

            <div className="divide-y divide-stone-100 mt-2">
              {activities.slice(0, 4).map((act) => (
                <div key={act.id} className="py-2.5 text-xs">
                  <p className="font-semibold text-stone-800 leading-snug">{act.message}</p>
                  <span className="text-[10px] text-stone-400 mt-0.5 block">{act.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
