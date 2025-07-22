import { PropertyType, PropertyClass, ProjectStatus } from './index'
import type { Expense } from './expense'

// Project data types
export interface Project {
  id: number
  name: string
  description?: string
  address?: string
  totalBudget: number
  propertyType: PropertyType
  propertyClass: PropertyClass
  status: ProjectStatus
  squareFootage?: number
  createdAt: string
  updatedAt: string
  
  // Calculated fields
  totalExpenses?: number
  budgetUsed?: number
  budgetRemaining?: number
  completionPercentage?: number
  
  // Related data
  rooms?: Room[]
  expenses?: Expense[]
}

// Room data types
export interface Room {
  id: number
  projectId: number
  name: string
  condition: number  // 1-10 scale
  length?: number
  width?: number
  height?: number
  notes?: string
  createdAt: string
  
  // Calculated fields
  squareFootage?: number
  totalExpenses?: number
  
  // Related data
  expenses?: Expense[]
}

// Form data types for creating/updating
export interface ProjectFormData {
  name: string
  description?: string
  address?: string
  totalBudget: number
  propertyType: PropertyType
  propertyClass: PropertyClass
  status?: ProjectStatus
  squareFootage?: number
}

export interface RoomFormData {
  name: string
  condition: number
  length?: number
  width?: number
  height?: number
  notes?: string
}

// Project summary for dashboard
export interface ProjectSummary {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalSpent: number
  averageCompletion: number
} 