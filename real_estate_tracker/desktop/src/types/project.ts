import { PropertyType, PropertyClass, ProjectStatus } from "./index";
import type { Expense } from "./expense";

// Project data types
export interface ProjectData {
  id: number;
  name: string;
  budget: number;
  spent: number;
  status: string;
  type: string;
  created: string;
  priority: "high" | "medium" | "low" | "urgent";
  completion: number;
  rooms: number;
  timeline: string;
  description?: string;
  address?: string;
  totalBudget?: number;
  propertyType?: PropertyType;
  propertyClass?: PropertyClass;
  squareFootage?: number;
}

export interface Project extends ProjectData {
  // Any additional fields specific to the Projects view
}

export interface DashboardStats {
  projectCount: number;
  totalBudget: number;
  totalSpent: number;
  isLoading: boolean;
}

export interface ExpenseData {
  id: number;
  date: string;
  roomName: string;
  category: string;
  cost: number;
  hours?: number;
  notes?: string;
}

// Room data types
export interface Room {
  id: number;
  projectId: number;
  name: string;
  condition: number; // 1-10 scale
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
  createdAt: string;

  // Calculated fields
  squareFootage?: number;
  totalExpenses?: number;

  // Related data
  expenses?: Expense[];
}

// Form data types for creating/updating
export interface ProjectFormData {
  name: string;
  description?: string;
  address?: string;
  totalBudget: number;
  propertyType: PropertyType;
  propertyClass: PropertyClass;
  status?: ProjectStatus;
  squareFootage?: number;
}

export interface RoomFormData {
  name: string;
  condition: number;
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
}

// Project summary for dashboard
export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageCompletion: number;
}
