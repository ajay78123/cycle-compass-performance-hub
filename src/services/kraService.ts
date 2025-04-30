import api from './api';
import { KRA, KPI } from '@/types';

export interface CreateKRAInput {
  name: string;
  description: string;
  cycleId: string;
  employeeId: string;
  kpis: {
    description: string;
    target: number;
    unit: string;
    weight: number;
  }[];
}

export const getKRAs = async (employeeId?: string, cycleId?: string): Promise<KRA[]> => {
  try {
    const params: { employeeId?: string; cycleId?: string } = {};
    if (employeeId) params.employeeId = employeeId;
    if (cycleId) params.cycleId = cycleId;
    const response = await api.get<KRA[]>('/kras', { params });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch KRAs');
  }
};

export const createKRA = async (kraData: CreateKRAInput): Promise<KRA> => {
  try {
    const response = await api.post<KRA>('/kras', kraData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create KRA');
  }
};

export const updateKRA = async (id: string, kraData: Partial<CreateKRAInput>): Promise<KRA> => {
  try {
    const response = await api.put<KRA>(`/kras/${id}`, kraData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update KRA ${id}`);
  }
};

export const deleteKRA = async (id: string): Promise<void> => {
  try {
    await api.delete(`/kras/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete KRA ${id}`);
  }
};

export const approveKRA = async (id: string, feedback: string): Promise<KRA> => {
  try {
    const response = await api.patch<KRA>(`/kras/${id}/approve`, { feedback });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to approve KRA ${id}`);
  }
};

export const rejectKRA = async (id: string, feedback: string): Promise<KRA> => {
  try {
    const response = await api.patch<KRA>(`/kras/${id}/reject`, { feedback });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to reject KRA ${id}`);
  }
};

export const approveKPI = async (id: string, feedback: string): Promise<KPI> => {
  try {
    const response = await api.patch<KPI>(`/kpis/${id}/approve`, { feedback });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to approve KPI ${id}`);
  }
};

export const rejectKPI = async (id: string, feedback: string): Promise<KPI> => {
  try {
    const response = await api.patch<KPI>(`/kpis/${id}/reject`, { feedback });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to reject KPI ${id}`);
  }
};