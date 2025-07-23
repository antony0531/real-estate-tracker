// Tauri IPC Service Layer
// Wraps Tauri commands for easy use in React components

import { invoke } from '@tauri-apps/api/tauri'

// Types matching our Rust backend
export interface AppInfo {
  name: string
  version: string
  description: string
}

export interface PythonInfo {
  version: string
  executable: string
  has_backend: boolean
}

export interface ProjectData {
  name: string
  budget: number
  property_type: string
  property_class: string
  description?: string
  floors?: number
  sqft?: number
  address?: string
}

export interface RoomData {
  name: string
  floor: number
  length?: number
  width?: number
  height?: number
  condition?: number
  notes?: string
}

export interface ExpenseData {
  room_name: string
  category: string
  cost: number
  hours?: number
  condition?: number
  notes?: string
}

/**
 * Real Estate Tracker Tauri Service
 * Provides typed wrappers around Tauri IPC commands
 */
export class TauriService {
  
  // =============================================================================
  // APP & SYSTEM COMMANDS
  // =============================================================================
  
  /**
   * Get application information
   */
  static async getAppInfo(): Promise<AppInfo> {
    try {
      return await invoke<AppInfo>('get_app_info')
    } catch (error) {
      console.error('Failed to get app info:', error)
      throw new Error(`Failed to get app info: ${error}`)
    }
  }

  /**
   * Initialize the database
   */
  static async initializeDatabase(): Promise<string> {
    try {
      return await invoke<string>('initialize_database')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      throw new Error(`Failed to initialize database: ${error}`)
    }
  }

  /**
   * Check Python installation
   */
  static async checkPythonInstallation(): Promise<PythonInfo> {
    try {
      return await invoke<PythonInfo>('check_python_installation')
    } catch (error) {
      console.error('Failed to check Python installation:', error)
      throw new Error(`Failed to check Python installation: ${error}`)
    }
  }

  // =============================================================================
  // PROJECT COMMANDS
  // =============================================================================

  /**
   * Get all projects
   */
  static async getProjects(): Promise<string> {
    try {
      return await invoke<string>('get_projects')
    } catch (error) {
      console.error('Failed to get projects:', error)
      throw new Error(`Failed to get projects: ${error}`)
    }
  }

  /**
   * Get a specific project by ID
   */
  static async getProject(projectId: number): Promise<string> {
    try {
      return await invoke<string>('get_project', { projectId })
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error)
      throw new Error(`Failed to get project ${projectId}: ${error}`)
    }
  }

  /**
   * Create a new project
   */
  static async createProject(data: ProjectData): Promise<string> {
    try {
      return await invoke<string>('create_project', { data })
    } catch (error) {
      console.error('Failed to create project:', error)
      throw new Error(`Failed to create project: ${error}`)
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(projectId: number, data: ProjectData): Promise<string> {
    try {
      return await invoke<string>('update_project', { projectId, data })
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error)
      throw new Error(`Failed to update project ${projectId}: ${error}`)
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: number): Promise<string> {
    try {
      return await invoke<string>('delete_project', { projectId })
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error)
      throw new Error(`Failed to delete project ${projectId}: ${error}`)
    }
  }

  // =============================================================================
  // ROOM COMMANDS
  // =============================================================================

  /**
   * Get all rooms for a project
   */
  static async getRooms(projectId: number): Promise<string> {
    try {
      return await invoke<string>('get_rooms', { projectId })
    } catch (error) {
      console.error(`Failed to get rooms for project ${projectId}:`, error)
      throw new Error(`Failed to get rooms for project ${projectId}: ${error}`)
    }
  }

  /**
   * Add a room to a project
   */
  static async addRoom(roomData: {
    projectId: number
    name: string
    floor: number
    length?: number
    width?: number
    height?: number
    condition?: number
    notes?: string
  }): Promise<string> {
    try {
      const data = {
        name: roomData.name,
        floor: roomData.floor,
        length: roomData.length,
        width: roomData.width,
        height: roomData.height || 8.0,
        condition: roomData.condition || 3,
        notes: roomData.notes
      }

      return await invoke<string>('add_room', { 
        projectId: roomData.projectId, 
        data 
      })
    } catch (error) {
      console.error(`Failed to add room to project ${roomData.projectId}:`, error)
      throw new Error(`Failed to add room to project ${roomData.projectId}: ${error}`)
    }
  }

  /**
   * Delete a room
   */
  static async deleteRoom(projectId: number, roomName: string): Promise<string> {
    try {
      return await invoke<string>('delete_room', { projectId, roomName })
    } catch (error) {
      console.error(`Failed to delete room ${roomName}:`, error)
      throw new Error(`Failed to delete room ${roomName}: ${error}`)
    }
  }

  // =============================================================================
  // EXPENSE COMMANDS
  // =============================================================================

  /**
   * Get all expenses for a project
   */
  static async getExpenses(projectId: number): Promise<string> {
    try {
      // The Tauri command only supports projectId, not filters
      // If filters are needed, we'll filter on the frontend
      return await invoke<string>('get_expenses', { projectId })
    } catch (error) {
      throw new Error(`Failed to get expenses for project ${projectId}: ${TauriService.handleError(error)}`)
    }
  }

  /**
   * Add an expense to a project
   */
  static async addExpense(expenseData: {
    projectId: number
    roomName: string
    category: 'material' | 'labor'
    cost: number
    hours?: number
    condition?: number
    notes?: string
  }): Promise<string> {
    try {
      const data = {
        room_name: expenseData.roomName,
        category: expenseData.category,
        cost: expenseData.cost,
        hours: expenseData.hours,
        condition: expenseData.condition,
        notes: expenseData.notes
      }

      return await invoke<string>('add_expense', { 
        projectId: expenseData.projectId, 
        data 
      })
    } catch (error) {
      console.error(`Failed to add expense to project ${expenseData.projectId}:`, error)
      throw new Error(`Failed to add expense to project ${expenseData.projectId}: ${error}`)
    }
  }

  /**
   * Delete an expense by ID
   */
  static async deleteExpense(expenseId: number): Promise<string> {
    try {
      return await invoke<string>('delete_expense', { 
        expenseId 
      })
    } catch (error) {
      console.error(`Failed to delete expense ${expenseId}:`, error)
      throw new Error(`Failed to delete expense ${expenseId}: ${error}`)
    }
  }

  /**
   * Get total expenses across all projects (helper method)
   */
  static async getAllExpenses(): Promise<string> {
    try {
      // Get all projects first
      const projectsOutput = await this.getProjects()
      
      // Parse project IDs from the output
      const projectIds = this.extractProjectIds(projectsOutput)
      
      // Get expenses for all projects
      const allExpensesPromises = projectIds.map(id => 
        this.getExpenses(id).catch(() => '') // Ignore errors for individual projects
      )
      
      const allExpenses = await Promise.all(allExpensesPromises)
      return allExpenses.filter(exp => exp.trim()).join('\n---PROJECT_SEPARATOR---\n')
      
    } catch (error) {
      console.error('Failed to get all expenses:', error)
      throw new Error(`Failed to get all expenses: ${error}`)
    }
  }

  /**
   * Helper method to extract project IDs from project list output
   */
  private static extractProjectIds(projectsOutput: string): number[] {
    const lines = projectsOutput.trim().split('\n')
    const projectIds: number[] = []
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        if (columns.length > 0) {
          const id = parseInt(columns[0])
          if (!isNaN(id)) {
            projectIds.push(id)
          }
        }
      }
    }
    
    return projectIds
  }

  // =============================================================================
  // BUDGET & EXPORT COMMANDS
  // =============================================================================

  /**
   * Get budget status for a project
   */
  static async getBudgetStatus(projectId: number): Promise<string> {
    try {
      return await invoke<string>('get_budget_status', { projectId })
    } catch (error) {
      console.error(`Failed to get budget status for project ${projectId}:`, error)
      throw new Error(`Failed to get budget status for project ${projectId}: ${error}`)
    }
  }

  /**
   * Export project data
   */
  static async exportProject(projectId: number, format: string = 'csv'): Promise<string> {
    try {
      return await invoke<string>('export_project', { 
        projectId, 
        format 
      })
    } catch (error) {
      console.error(`Failed to export project ${projectId}:`, error)
      throw new Error(`Failed to export project ${projectId}: ${error}`)
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Test the connection to Python CLI
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.getAppInfo()
      await this.checkPythonInstallation()
      return true
    } catch (error) {
      console.error('Connection test failed:', error)
      return false
    }
  }

  /**
   * Test Python execution capabilities
   */
  static async testPythonExecution(): Promise<string> {
    try {
      return await invoke<string>('test_python_execution')
    } catch (error) {
      console.error('Failed to test Python execution:', error)
      throw new Error(`Failed to test Python execution: ${error}`)
    }
  }

  /**
   * Test expense addition with debug info
   */
  static async testExpenseAdd(): Promise<string> {
    try {
      return await invoke<string>('test_expense_add')
    } catch (error) {
      console.error('Test expense add failed:', error)
      throw new Error(`Test expense add failed: ${error}`)
    }
  }

  /**
   * Get formatted list of all rooms across all projects
   */
  static async getAllRoomsList(): Promise<string> {
    try {
      const projects = await this.getProjects()
      let allRooms = "\n=== ALL AVAILABLE ROOMS ===\n\n"
      
      // Parse projects from CLI output
      const lines = projects.trim().split('\n')
      const projectIds: number[] = []
      
      for (const line of lines) {
        if (line.startsWith('│') && line.includes('$') && !line.includes('ID')) {
          const columns = line.split('│').map(col => col.trim()).filter(col => col)
          if (columns.length >= 1) {
            const id = parseInt(columns[0], 10)
            if (!isNaN(id)) {
              projectIds.push(id)
            }
          }
        }
      }

      for (const projectId of projectIds) {
        try {
          const roomsOutput = await this.getRooms(projectId)
          allRooms += `\nProject ${projectId} Rooms:\n${roomsOutput}\n`
        } catch (error) {
          allRooms += `\nProject ${projectId}: Error loading rooms - ${error}\n`
        }
      }

      return allRooms
    } catch (error) {
      console.error('Failed to get all rooms list:', error)
      throw new Error(`Failed to get all rooms list: ${error}`)
    }
  }

  /**
   * Parse CLI output into structured data
   * This is a helper for components that need to extract data from CLI text output
   */
  static parseCliOutput(output: string): {
    success: boolean
    data: any
    message?: string
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(output)
      return { success: true, data: parsed }
    } catch {
      // If not JSON, treat as plain text success if no error indicators
      const hasError = output.toLowerCase().includes('error') || 
                      output.toLowerCase().includes('failed') ||
                      output.toLowerCase().includes('exception')
      
      return {
        success: !hasError,
        data: output.trim(),
        message: hasError ? 'Command executed with errors' : 'Command executed successfully'
      }
    }
  }

  /**
   * Handle common error scenarios with user-friendly messages
   */
  static handleError(error: unknown): string {
    if (typeof error === 'string') {
      return error
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    // Common error patterns from our CLI
    const errorStr = String(error)
    
    if (errorStr.includes('Python not found')) {
      return 'Python is not installed or not found in PATH. Please install Python 3.11+ and try again.'
    }
    
    if (errorStr.includes('Database initialization failed')) {
      return 'Failed to initialize database. Please check file permissions and try again.'
    }
    
    if (errorStr.includes('No such command')) {
      return 'Command not recognized. Please check the CLI implementation.'
    }
    
    return `An unexpected error occurred: ${errorStr}`
  }
} 