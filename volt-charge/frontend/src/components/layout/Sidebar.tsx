import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Building2,
  FlaskConical,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Find Stations', path: '/find-stations', icon: MapPin },
    { name: 'Queue Simulator', path: '/queue', icon: Users, badge: 'FIFO' },
    { name: 'Station Management', path: '/management', icon: Building2 },
    { name: 'Algorithm Lab', path: '/algorithm-lab', icon: FlaskConical, badge: 'DSA' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-white border-r border-stone-200/80 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-stone-100">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-stone-900 leading-none">
                Volt-Charge
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mt-1">
                Smart EV &amp; DSA
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-700'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 truncate tracking-tight">{item.name}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-700 text-emerald-100'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {/* Tooltip for collapsed mode */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-stone-900 text-white text-xs rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="p-3 border-t border-stone-100 flex items-center justify-between">
        {!collapsed && (
          <div className="px-2">
            <p className="text-xs font-semibold text-stone-700">C++ DSA Engine</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-stone-500">Connected &amp; Active</span>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};
