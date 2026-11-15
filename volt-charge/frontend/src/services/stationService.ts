import api from './api';
import type { Station } from '@/types';

export interface StationFilters {
  chargingType?: string;
  status?: string;
  search?: string;
  sort?: string;
}

export const stationService = {
  async getStations(filters?: StationFilters): Promise<Station[]> {
    const params = new URLSearchParams();
    if (filters?.chargingType) params.append('chargingType', filters.chargingType);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort) params.append('sort', filters.sort);
    const { data } = await api.get<Station[]>('/stations', { params });
    return data;
  },

  async getStation(id: string): Promise<Station> {
    const { data } = await api.get<Station>(`/stations/${id}`);
    return data;
  },

  async createStation(stationData: Omit<Station, 'id' | 'status'>): Promise<Station> {
    const { data } = await api.post<Station>('/stations', stationData);
    return data;
  },

  async updateStation(id: string, stationData: Partial<Station>): Promise<Station> {
    const { data } = await api.put<Station>(`/stations/${id}`, stationData);
    return data;
  },

  async deleteStation(id: string): Promise<void> {
    await api.delete(`/stations/${id}`);
  },
};
