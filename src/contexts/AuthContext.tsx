
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - In a real app this would come from an API
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@example.com",
    role: "manager",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager"
  },
  {
    id: "3",
    name: "Employee User",
    email: "employee@example.com",
    role: "employee",
    managerId: "2",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=employee"
  },
  {
    id: "4",
    name: "Test Admin",
    email: "test@gmail.com",
    role: "admin",
    profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=testadmin"
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check local storage for saved user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('kpi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app this would be an API call
    setIsLoading(true);
    
    // Mock login - simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email);
        
        // For the test admin account, we check the password
        if (email === "test@gmail.com" && password !== "testpass") {
          setIsLoading(false);
          resolve(false);
          return;
        }
        
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('kpi_user', JSON.stringify(foundUser));
          setIsLoading(false);
          resolve(true);
        } else {
          setIsLoading(false);
          resolve(false);
        }
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('kpi_user');
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
