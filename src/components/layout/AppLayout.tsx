
import React from 'react';
import { useNavigate, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  User, 
  Users, 
  Settings, 
  FileText, 
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const AppLayout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        title: "Profile",
        icon: User,
        onClick: () => navigate("/profile"),
      },
    ];
    
    if (user?.role === "admin") {
      return [
        ...commonItems,
        {
          title: "Dashboard",
          icon: FileText,
          onClick: () => navigate("/"),
        },
        {
          title: "Review Cycles",
          icon: Calendar,
          onClick: () => navigate("/cycles"),
        },
        {
          title: "All Users",
          icon: Users,
          onClick: () => navigate("/users"),
        },
        {
          title: "Settings",
          icon: Settings,
          onClick: () => navigate("/settings"),
        }
      ];
    }
    
    if (user?.role === "manager") {
      return [
        ...commonItems,
        {
          title: "Dashboard",
          icon: FileText,
          onClick: () => navigate("/"),
        },
        {
          title: "Team Goals",
          icon: Users,
          onClick: () => navigate("/team-goals"),
        },
        {
          title: "Reviews",
          icon: Calendar,
          onClick: () => navigate("/reviews"),
        }
      ];
    }
    
    // Employee
    return [
      ...commonItems,
      {
        title: "Dashboard",
        icon: FileText,
        onClick: () => navigate("/"),
      },
      {
        title: "My Goals",
        icon: Calendar,
        onClick: () => navigate("/goals"),
      }
    ];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r bg-white dark:bg-gray-900">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-kpi-blue flex items-center justify-center">
                <span className="text-white font-semibold text-sm">K</span>
              </div>
              <span className="font-semibold text-lg">KRA/KPI App</span>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {getNavItems().map((item, idx) => (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton onClick={item.onClick} className={cn(
                    "flex items-center gap-3 w-full px-4 py-2 rounded-md",
                    "text-gray-700 dark:text-gray-300 hover:bg-kpi-blue/10 hover:text-kpi-blue"
                  )}>
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>{user ? getInitials(user.name) : "UN"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={() => logout()} 
                className="p-2 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={18} />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          <div className="flex items-center h-14 px-4 border-b bg-white dark:bg-gray-900">
            <SidebarTrigger className="mr-2" />
            <div className="flex-1"></div>
          </div>
          
          <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900/50">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
