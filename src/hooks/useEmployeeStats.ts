import { useQuery } from '@tanstack/react-query';  
import api from '../services/api';  
  
export function useEmployeeStats() {  
  const { data: stats, isLoading, error } = useQuery({  
    queryKey: ['employeeStats'],  
    queryFn: async () => {  
      const response = await api.get('/stats/employees');  
      return response.data;  
    }  
  });  
    
  return { stats, isLoading, error };  
}