export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: 'quarterly' | 'half-yearly';
  status: 'Open' | 'Closed';
}

export interface ReviewWindow {
  id: string;
  cycleId: string;
  label: string;
  openDate: string;
  closeDate: string;
  status: 'open' | 'closed';
}

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Employee {
  id?: string;
  name: string;
  email: string;
  department: string;
  role: 'admin' | 'manager' | 'employee';
  managerId?: string;
}

export interface KRA {
  id: string;
  name: string;
  description: string;
  cycleId: string;
  employeeId: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  kpis: KPI[];
}

export interface KPI {
  id: string;
  description: string;
  target: number;
  unit: string;
  weight: number;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

export interface SelfReview {
  id: string;
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
  submittedAt: string;
}

export interface ManagerReview {
  id: string;
  employeeId: string;
  cycleId: string;
  reviews: {
    kpiId: string;
    rating: number;
    comment: string;
  }[];
  submittedAt: string;
}