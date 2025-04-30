
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';

// Page imports
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import CreateReviewCycle from '@/pages/CreateReviewCycle';
import TeamGoals from '@/pages/TeamGoals';
import EmployeeReview from '@/pages/EmployeeReview';
import ManagerReview from '@/pages/ManagerReview';
import Profile from '@/pages/Profile';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  // Guard for admin-only routes
  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated && user?.role === 'admin') {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
  };
  
  // Guard for manager-only routes
  const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated && (user?.role === 'manager' || user?.role === 'admin')) {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
  };
  
  // Dashboard selector based on user role
  const DashboardSelector = () => {
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
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<AppLayout />}>
        {/* Dashboard route that renders based on user role */}
        <Route index element={<DashboardSelector />} />
        
        {/* Admin routes */}
        <Route path="cycles/new" element={
          <AdminRoute>
            <CreateReviewCycle />
          </AdminRoute>
        } />
        <Route path="users" element={
          <AdminRoute>
            <div className="p-6">User Management (Coming Soon)</div>
          </AdminRoute>
        } />
        <Route path="settings" element={
          <AdminRoute>
            <div className="p-6">System Settings (Coming Soon)</div>
          </AdminRoute>
        } />
        <Route path="cycles" element={
          <AdminRoute>
            <div className="p-6">Manage Review Cycles (Coming Soon)</div>
          </AdminRoute>
        } />
        
        {/* Manager routes */}
        <Route path="team-goals" element={
          <ManagerRoute>
            <TeamGoals />
          </ManagerRoute>
        } />
        <Route path="reviews" element={
          <ManagerRoute>
            <ManagerReview />
          </ManagerRoute>
        } />
        
        {/* Employee routes */}
        <Route path="goals" element={<EmployeeReview />} />
        
        {/* Common routes */}
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<div className="p-6">Page not found</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
