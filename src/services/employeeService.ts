import api from './api';
import { Employee } from '@/types';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get<Employee[]>('/employees');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch employees');
  }
};

export const createEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
  try {
    const response = await api.post<Employee>('/employees', employeeData);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create employee');
  }
};

export const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
  try {
    const response = await api.put<Employee>(`/employees/${id}`, employeeData);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to update employee ${id}`);
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  try {
    await api.delete(`/employees/${id}`);
  } catch (error) {
    throw new Error(`Failed to delete employee ${id}`);
  }
};