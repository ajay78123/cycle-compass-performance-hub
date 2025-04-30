
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  switch (user?.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default Index;
