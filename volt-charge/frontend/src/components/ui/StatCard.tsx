import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  accent?: 'emerald' | 'teal' | 'amber' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  accent = 'emerald',
}) => {
  const iconBgMap = {
    emerald: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    amber: 'bg-amber-50 text-amber-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl border border-stone-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-stone-800 mt-1 tracking-tight">{value}</h3>
          {change && (
            <p
              className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                isPositive ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              <span>{isPositive ? '↑' : '↓'}</span>
              <span>{change}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBgMap[accent]}`}>
          <Icon className="w-6 h-6 stroke-[1.75]" />
        </div>
      </div>
    </motion.div>
  );
};
