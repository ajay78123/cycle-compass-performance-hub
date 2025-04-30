import { useQuery, useMutation, useQueryClient } from 'react-query';  
import { getReviewCycles, createReviewCycle } from '@/services/reviewCycleService';  
  
export const useReviewCycles = () => {  
  return useQuery('reviewCycles', getReviewCycles);  
};  
  
export const useCreateReviewCycle = () => {  
  const queryClient = useQueryClient();  
    
  return useMutation(createReviewCycle, {  
    onSuccess: () => {  
      queryClient.invalidateQueries('reviewCycles');  
    },  
  });  
};