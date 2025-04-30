import { useQuery } from 'react-query';  
import { getEmployeeStats } from '@/services/employeeStatsService';  
  
export const useEmployeeStats = () => {  
  return useQuery('employeeStats', getEmployeeStats);  
};