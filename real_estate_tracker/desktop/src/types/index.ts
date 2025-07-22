// Main type exports for the Real Estate Tracker desktop app
import React from 'react'

// Re-export all types from specific modules
export * from './project'
export * from './expense'
export * from './tauri'

// Global application types
export interface AppInfo {
  name: string
  version: string
  author: string
  description: string
  databasePath: string
  exportsPath: string
}

// User interface types
export interface User {
  id: number
  username: string
  email?: string
  createdAt: string
}

// Enum types (matching backend Python enums)
export enum PropertyType {
  SINGLE_FAMILY = 'single_family',
  DUPLEX = 'duplex',
  TRIPLEX = 'triplex',
  FOURPLEX = 'fourplex',
  APARTMENT = 'apartment',
  CONDO = 'condo',
  COMMERCIAL = 'commercial',
}

export enum PropertyClass {
  SF_CLASS_A = 'sf_class_a',
  SF_CLASS_B = 'sf_class_b',
  SF_CLASS_C = 'sf_class_c',
  SF_CLASS_D = 'sf_class_d',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

export enum ExpenseCategory {
  MATERIAL = 'material',
  LABOR = 'labor',
}

// Component prop types
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Loading states
export interface LoadingState {
  isLoading: boolean
  error: string | null
  lastUpdated?: string
} 