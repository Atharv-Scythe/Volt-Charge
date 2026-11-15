import api from './api';
import type { Vehicle, AlgorithmResult, Station, QueueState } from '@/types';

export const algorithmService = {
  async findNearest(userLat: number, userLon: number): Promise<AlgorithmResult<Station>> {
    const { data } = await api.post<any>('/algorithms/nearest', {
      userLat,
      userLon,
      latitude: userLat,
      longitude: userLon,
    });
    return {
      result: data.station || data.result,
      steps: data.steps || [],
      distance: data.distance,
      comparisons: data.steps?.length,
    } as any;
  },

  async searchStations(
    algorithm: 'linear' | 'binary',
    key: string,
    field: string
  ): Promise<AlgorithmResult<Station | null>> {
    const { data } = await api.post<any>('/algorithms/search', {
      algorithm: algorithm === 'linear' ? 'linear_search' : 'binary_search',
      key,
      field,
    });
    return {
      result: data.station,
      steps: data.steps || [],
      message: data.message,
      totalComparisons: data.totalComparisons,
    } as any;
  },

  async sortStations(
    algorithm: 'bubble' | 'selection' | 'merge' | 'quick',
    criteria: string,
    datasetSize?: number
  ): Promise<AlgorithmResult<Station[]>> {
    const algMap: Record<string, string> = {
      bubble: 'bubble_sort',
      selection: 'selection_sort',
      merge: 'merge_sort',
      quick: 'quick_sort',
    };
    const { data } = await api.post<any>('/algorithms/sort', {
      algorithm: algMap[algorithm] || 'bubble_sort',
      criteria,
      datasetSize,
    });
    return {
      result: data.sortedStations,
      steps: data.steps || [],
      comparisons: data.comparisons,
      swaps: data.swaps,
      executionTime: data.executionTimeMs,
    } as any;
  },

  async queueOperation(
    operation: 'enqueue' | 'dequeue' | 'peek' | 'status' | 'clear',
    vehicle?: Partial<Vehicle>
  ): Promise<AlgorithmResult<QueueState>> {
    const { data } = await api.post<any>('/algorithms/queue', {
      operation,
      vehicle,
    });
    return {
      result: data,
      steps: data.engineResult?.steps || [],
      message: data.message,
    } as any;
  },
};
