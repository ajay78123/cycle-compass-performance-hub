
export type UserRole = "admin" | "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  managerId?: string;
  profilePicture?: string;
}

export interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  frequency: "quarterly" | "half-yearly";
  status: "open" | "closed";
}

export interface ReviewWindow {
  id: string;
  cycleId: string;
  label: string;
  openDate: string;
  closeDate: string;
  status: "upcoming" | "open" | "closed";
}

export interface KRA {
  id: string;
  employeeId: string;
  cycleId: string;
  name: string;
  description?: string;
  status: "draft" | "pending" | "approved" | "rejected";
  feedback?: string;
}

export interface KPI {
  id: string;
  kraId: string;
  description: string;
  target: number;
  unit: string;
  weight: number;
  status: "draft" | "pending" | "approved" | "rejected";
  feedback?: string;
}

export interface Assignment {
  id: string;
  employeeId: string;
  cycleId: string;
  kra: string;
  kpi: string;
  target: number;
  unit: string;
  weight: number;
}

export interface Rating {
  id: string;
  assignmentId: string;
  raterId: string;
  raterType: "self" | "manager";
  score: number;
  comment: string;
  windowId: string;
  createdAt: string;
}

export interface DashboardMetrics {
  employeesWithGoals: number;
  totalEmployees: number;
  reviewsCompleted: number;
  reviewsDue: number;
  upcomingDeadline?: string;
  cycleName?: string;
}
