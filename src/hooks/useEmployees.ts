import { useQuery, useMutation, useQueryClient } from 'react-query';  
import {   
  getEmployees,   
  getEmployee,   
  createEmployee,   
  updateEmployee,   
  deleteEmployee,  
  Employee  
} from '@/services/employeeService';  
  
export const useEmployees = () => {  
  return useQuery('employees', getEmployees);  
};  
  
export const useEmployee = (id: string) => {  
  return useQuery(['employee', id], () => getEmployee(id));  
};  
  
export const useCreateEmployee = () => {  
  const queryClient = useQueryClient();  
    
  return useMutation(createEmployee, {  
    onSuccess: () => {  
      queryClient.invalidateQueries('employees');  
    },  
  });  
};  
  
export const useUpdateEmployee = () => {  
  const queryClient = useQueryClient();  
