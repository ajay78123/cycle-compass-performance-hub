import { useState, useEffect } from 'react';  
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';  
import api from '../services/api';  
import { KRA, KPI } from '@/types';  
  
export function useKRAs(employeeId?: string, cycleId?: string) {  
  const queryClient = useQueryClient();  
    
  const { data: kras, isLoading: krasLoading, error: krasError } = useQuery({  
    queryKey: ['kras', employeeId, cycleId],  
    queryFn: async () => {  
      const params = {};  
      if (employeeId) params.employeeId = employeeId;  
      if (cycleId) params.cycleId = cycleId;  
        
      const response = await api.get('/kras', { params });  
      return response.data;  
    }  
  });  
    
  const { data: kpis, isLoading: kpisLoading, error: kpisError } = useQuery({  
    queryKey: ['kpis', employeeId, cycleId],  
    queryFn: async () => {  
      const params = {};  
      if (employeeId) params.employeeId = employeeId;  
      if (cycleId) params.cycleId = cycleId;  
        
      const response = await api.get('/kpis', { params });  
      return response.data;  
    }  
  });  
    
  return {   
    kras: kras || [],   
    kpis: kpis || [],   
    isLoading: krasLoading || kpisLoading,  
    error: krasError || kpisError  
  };  
}  
  
export function useCreateKRA() {  
  const queryClient = useQueryClient();  
    
  const mutation = useMutation({  
    mutationFn: async (kraData: any) => {  
      const response = await api.post('/kras', kraData);  
      return response.data;  
    },  
    onSuccess: () => {  
      queryClient.invalidateQueries({ queryKey: ['kras'] });  
      queryClient.invalidateQueries({ queryKey: ['kpis'] });  
    }  
  });  
    
  return mutation;  