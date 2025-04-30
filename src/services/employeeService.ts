import api from './api';  
  
export interface Employee {  
  id?: string;  
  name: string;  
  email: string;  
  department: string;  
  role: 'admin' | 'manager' | 'employee';  
  manager?: string;  
}  
  
export const getEmployees = () => api.get<Employee[]>('/employees');  
export const getEmployee = (id: string) => api.get<Employee>(`/employees/${id}`);  
export const createEmployee = (employee: Omit<Employee, 'id'>) =>   
  api.post<Employee>('/employees', employee);  
export const updateEmployee = (id: string, employee: Partial<Employee>) =>   
  api.put<Employee>(`/employees/${id}`, employee);  
export const deleteEmployee = (id: string) =>   
  api.delete(`/employees/${id}`);