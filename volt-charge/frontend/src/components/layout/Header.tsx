import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, User, ShieldCheck, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Header: React.FC = () => {
  const location = useLocation();
  const { activities } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Overview Dashboard';
      case '/find-stations':
        return 'Find & Explore Stations';
      case '/queue':
        return 'EV Queue Simulator (Circular FIFO)';
      case '/management':
        return 'Station Management';
      case '/algorithm-lab':
        return 'DSA Algorithm Laboratory';
      case '/analytics':
        return 'Analytics & Performance';
      case '/settings':
        return 'System Settings';
      default:
        return 'Volt-Charge';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
        <p className="text-xs text-stone-500 font-medium">
          Smart Electric Vehicle Charging &amp; Real Data Structure Simulator
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Engine status indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>C++ Engine 1.0 (Haversine &amp; FIFO Active)</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors relative"
            title="Activity Notifications"
          >
            <Bell className="w-5 h-5" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-stone-200/80 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100 px-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Recent Activities
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {activities.length} new
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto mt-2 space-y-1.5 divide-y divide-stone-50">
                {activities.slice(0, 5).map((act) => (
                  <div key={act.id} className="pt-2 pb-1 px-2 text-xs">
                    <p className="font-semibold text-stone-800 leading-snug">{act.message}</p>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">{act.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            EV
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-bold text-stone-800 block leading-tight">Admin Driver</span>
            <span className="text-[10px] text-stone-500 block leading-none">Driver #DL-882</span>
          </div>
        </div>
      </div>
    </header>
  );
};
