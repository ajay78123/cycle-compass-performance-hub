import api from './api';  
  
export interface EmployeeStats {  
  employeesWithGoals: number;  
  totalEmployees: number;  
  reviewsCompleted: number;  
  reviewsDue: number;  
}  
  
export const getEmployeeStats = () => api.get<EmployeeStats>('/stats/employees');