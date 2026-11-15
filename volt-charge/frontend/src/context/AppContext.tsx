import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Station, Vehicle, QueueState, ActivityItem } from '@/types';
import { stationService } from '@/services/stationService';
import { algorithmService } from '@/services/algorithmService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface AppContextType {
  stations: Station[];
  loadingStations: boolean;
  userLocation: { latitude: number; longitude: number };
  setUserLocation: (loc: { latitude: number; longitude: number }) => void;
  activities: ActivityItem[];
  addActivity: (type: ActivityItem['type'], message: string) => void;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
  refreshStations: () => Promise<void>;
  queueState: QueueState | null;
  refreshQueue: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState({ latitude: 28.6139, longitude: 77.2090 }); // New Delhi
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'charge',
      message: 'Vehicle VH001 charging at GreenVolt Central Hub',
      timestamp: '2 mins ago',
    },
    {
      id: '2',
      type: 'queue',
      message: 'Vehicle VH002 enqueued at Central Station queue',
      timestamp: '5 mins ago',
    },
    {
      id: '3',
      type: 'sort',
      message: 'Sorted 15 stations by distance using Merge Sort (O(n log n))',
      timestamp: '12 mins ago',
    },
    {
      id: '4',
      type: 'search',
      message: 'Binary Search found station ST005 in 3 comparisons',
      timestamp: '18 mins ago',
    },
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [queueState, setQueueState] = useState<QueueState | null>(null);

  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addActivity = (type: ActivityItem['type'], message: string) => {
    const item: ActivityItem = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: 'Just now',
    };
    setActivities((prev) => [item, ...prev.slice(0, 19)]);
  };

  const refreshStations = async () => {
    try {
      setLoadingStations(true);
      const data = await stationService.getStations();
      setStations(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch stations';
      addToast('error', msg);
    } finally {
      setLoadingStations(false);
    }
  };

  const refreshQueue = async () => {
    try {
      const res = await algorithmService.queueOperation('status');
      if (res && res.result) {
        setQueueState(res.result as QueueState);
      }
    } catch (err) {
      console.warn('Queue refresh note:', err);
    }
  };

  useEffect(() => {
    refreshStations();
    refreshQueue();
  }, []);

  return (
    <AppContext.Provider
      value={{
        stations,
        loadingStations,
        userLocation,
        setUserLocation,
        activities,
        addActivity,
        toasts,
        addToast,
        removeToast,
        refreshStations,
        queueState,
        refreshQueue,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
