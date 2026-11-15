import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Dashboard } from '@/pages/Dashboard';
import { FindStations } from '@/pages/FindStations';
import { QueueSimulator } from '@/pages/QueueSimulator';
import { StationManagement } from '@/pages/StationManagement';
import { AlgorithmLab } from '@/pages/AlgorithmLab';
import { Analytics } from '@/pages/Analytics';
import { Settings } from '@/pages/Settings';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="find-stations" element={<FindStations />} />
        <Route path="queue" element={<QueueSimulator />} />
        <Route path="management" element={<StationManagement />} />
        <Route path="algorithm-lab" element={<AlgorithmLab />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
