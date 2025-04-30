import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/services/employeeService';
import { Employee } from '@/types';

export function useEmployees() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  return {
    employees: data || [],
    isLoading,
    error,
  };
}

export function useTeamMembers(managerId?: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees', managerId],
    queryFn: async () => {
      const employees = await getEmployees();
      return employees.filter(emp => emp.managerId === managerId);
    },
    enabled: !!managerId,
  });

  return {
    employees: data || [],
    isLoading,
    error,
  };
}