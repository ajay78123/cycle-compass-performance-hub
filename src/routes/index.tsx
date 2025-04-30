import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import AdminDashboard from '@/pages/AdminDashboard';
import ManagerDashboard from '@/pages/ManagerDashboard';
import EmployeeDashboard from '@/pages/EmployeeDashboard';
import CreateReviewCycle from '@/pages/CreateReviewCycle';
import CycleDetails from '../pages/CycleDetails';
import ReviewCalendar from '../pages/ReviewCalendar';
import ExportData from '../pages/ExportData';
import TeamGoals from '@/pages/TeamGoals';
import EmployeeReview from '@/pages/EmployeeReview';
import ManagerReview from '@/pages/ManagerReview';
import Profile from '@/pages/Profile';
import MyKRAs from '@/pages/MyKRAs';
import ValidateKRAs from '@/pages/ValidateKRAs';
import EmployeeManagement from '@/pages/EmployeeManagement';
import NotFound from '@/pages/NotFound';

const AppRoutes: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) return <div>Loading...</div>;
    if (isAuthenticated && user?.role === 'admin') {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
  };

  const ManagerRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) return <div>Loading...</div>;
    if (isAuthenticated && user?.role === 'manager') {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
  };

  const EmployeeRoute = ({ children }: { children: React.ReactNode }) => {
    if (isLoading) return <div>Loading...</div>;
    if (isAuthenticated && user?.role === 'employee') {
      return <>{children}</>;
    }
    return <Navigate to="/" />;
  };

  const DashboardSelector = () => {
    if (isLoading) return <div>Loading...</div>;
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
    <TooltipProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardSelector />} />
          {/* Admin routes */}
          <Route path="cycles/new" element={<AdminRoute><CreateReviewCycle /></AdminRoute>} />
          <Route path="cycles/:id" element={<AdminRoute><CycleDetails /></AdminRoute>} />
          <Route path="cycles" element={<AdminRoute><div className="p-6">Manage Review Cycles (Coming Soon)</div></AdminRoute>} />
          <Route path="users" element={<AdminRoute><EmployeeManagement /></AdminRoute>} />
          <Route path="settings" element={<AdminRoute><div className="p-6">System Settings (Coming Soon)</div></AdminRoute>} />
          <Route path="calendar" element={<AdminRoute><ReviewCalendar /></AdminRoute>} />
          <Route path="export" element={<AdminRoute><ExportData /></AdminRoute>} />
          <Route path="my-kras" element={<EmployeeRoute><MyKRAs /></EmployeeRoute>} />
          {/* Manager routes */}
          <Route path="team-goals" element={<ManagerRoute><TeamGoals /></ManagerRoute>} />
          <Route path="reviews" element={<ManagerRoute><ManagerReview /></ManagerRoute>} />
          <Route path="validate-kras" element={<ManagerRoute><ValidateKRAs /></ManagerRoute>} />
          <Route path="reviews" element={<ManagerRoute><ManagerReview /></ManagerRoute>} />
          {/* Employee routes */}
          <Route path="goals" element={<EmployeeRoute><EmployeeReview /></EmployeeRoute>} />
          <Route path="my-kras" element={<EmployeeRoute><MyKRAs /></EmployeeRoute>} />
          {/* Common routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
};

export default AppRoutes;