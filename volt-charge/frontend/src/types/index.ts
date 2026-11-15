// Station
export interface Station {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  chargingType: 'DC Fast' | 'Level 2' | 'Level 1';
  totalPorts: number;
  availablePorts: number;
  chargingRate: number;
  waitingTime: number;
  distance?: number;
  status: 'available' | 'busy' | 'offline' | 'full';
}

// Vehicle
export interface Vehicle {
  id: string;
  type: string;
  batteryPercentage: number;
  requiredPercentage: number;
  chargingDuration: number;
  arrivalTime: string;
  assignedStation: string;
}

// Queue
export interface QueueState {
  vehicles: Vehicle[];
  front: number;
  rear: number;
  size: number;
  capacity: number;
  currentlyCharging?: Vehicle;
  nextInLine?: Vehicle;
}

export interface QueueStep {
  operation: string;
  vehicleId: string;
  front: number;
  rear: number;
  size: number;
  queueState: Vehicle[];
  message: string;
}

// Search
export interface SearchStep {
  index?: number;
  low?: number;
  high?: number;
  mid?: number;
  stationId: string;
  compared: string;
  match: boolean;
}

// Sort
export interface SortStep {
  step: number;
  action: 'compare' | 'swap';
  indices: number[];
  values: string[];
  arrayState: string[];
}

// Nearest
export interface NearestStep {
  stationId: string;
  distance: number;
  currentMin: number;
  isNewMin: boolean;
}

// Algorithm Result
export interface AlgorithmResult<T = unknown> {
  result: T;
  steps: (SearchStep | SortStep | NearestStep | QueueStep)[];
  comparisons?: number;
  swaps?: number;
  executionTime?: number;
  complexity?: string;
}

// Activity
export interface ActivityItem {
  id: string;
  type: 'charge' | 'queue' | 'search' | 'sort' | 'station' | 'info';
  message: string;
  timestamp: string;
}

// Analytics
export interface StationUtilization {
  stationId: string;
  stationName: string;
  utilization: number;
}

export interface ChargingCompletion {
  date: string;
  count: number;
}

export interface AnalyticsData {
  totalStations: number;
  totalVehiclesServed: number;
  avgQueueLength: number;
  avgWaitingTime: number;
  stationUtilization: StationUtilization[];
  chargingCompletions: ChargingCompletion[];
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: string;
  read: boolean;
}
