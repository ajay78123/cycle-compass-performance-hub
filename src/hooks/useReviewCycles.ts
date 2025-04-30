import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';  
import api from '../services/api';  
  
export function useReviewCycles() {  
  const { data: cycles, isLoading, error } = useQuery({  
    queryKey: ['reviewCycles'],  
    queryFn: async () => {  
      const response = await api.get('/review-cycles');  
      return response.data;  
    }  
  });  
    
  return { cycles: cycles || [], isLoading, error };  
}  
  
export function useActiveReviewCycle() {  
  const { data: cycle, isLoading, error } = useQuery({  
    queryKey: ['activeReviewCycle'],  
    queryFn: async () => {  
      const response = await api.get('/review-cycles/active');  
      return response.data;  
    }  
  });  
    
  return { cycle, isLoading, error };  
}