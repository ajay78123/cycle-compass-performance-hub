import { useQuery } from '@tanstack/react-query';  
import api from '../services/api';  
  
export function useRecentActivity(limit = 5) {  
  const { data: activities, isLoading, error } = useQuery({  
    queryKey: ['recentActivity', limit],  
    queryFn: async () => {  
      const response = await api.get(`/activities/recent?limit=${limit}`);  
      return response.data;  
    }  
  });  
    
  return { activities: activities || [], isLoading, error };  
}