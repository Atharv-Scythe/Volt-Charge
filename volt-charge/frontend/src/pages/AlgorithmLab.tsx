import React, { useState } from 'react';
import { QueueLab } from '@/components/algorithms/QueueLab';
import { SearchLab } from '@/components/algorithms/SearchLab';
import { SortLab } from '@/components/algorithms/SortLab';
import { NearestLab } from '@/components/algorithms/NearestLab';
import { Users, Search, ArrowUpDown, Compass, FlaskConical, ShieldCheck } from 'lucide-react';

export const AlgorithmLab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'search' | 'sort' | 'nearest'>('sort');

  const tabs = [
    { id: 'sort', label: 'Sorting Lab', icon: ArrowUpDown, badge: 'Bubble, Selection, Merge, Quick' },
    { id: 'queue', label: 'Queue Lab', icon: Users, badge: 'Circular FIFO Buffer O(1)' },
    { id: 'search', label: 'Searching Lab', icon: Search, badge: 'Linear O(n) & Binary O(log n)' },
    { id: 'nearest', label: 'Nearest Station Lab', icon: Compass, badge: 'Haversine Formula O(n)' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <FlaskConical className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Data Structures &amp; Algorithms Laboratory
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Interactive Algorithm Visualizer &amp; Complexity Studio
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-3xl">
            Explore and step through native C++ implementations of classic computer science algorithms solving real-world EV charging and routing constraints.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Real C++ Executable Engine Steps</span>
        </div>
      </div>

      {/* Lab Tabs Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-stone-100 rounded-2xl border border-stone-200/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 ring-1 ring-black/5'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`}
              />
              <div className="text-left">
                <span className="block leading-none">{tab.label}</span>
                <span className="text-[10px] font-normal text-stone-400 block mt-0.5">
                  {tab.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Lab Component */}
      <div className="mt-6">
        {activeTab === 'sort' && <SortLab />}
        {activeTab === 'queue' && <QueueLab />}
        {activeTab === 'search' && <SearchLab />}
        {activeTab === 'nearest' && <NearestLab />}
      </div>
    </div>
  );
};
