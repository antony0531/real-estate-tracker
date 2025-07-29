// DataCache Service - Optimize performance by caching frequently accessed data

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

interface ProjectData {
  id: number
  name: string
  budget: number
  spent: number
  status: string
  type?: string
  created?: string
  priority?: 'high' | 'medium' | 'low' | 'urgent'
  completion?: number
  rooms?: number
  timeline?: string
  description?: string
  floors?: number
  sqft?: number
  address?: string
}

interface ExpenseData {
  id: number
  project_id: number
  project_name: string
  room_name: string
  category: 'material' | 'labor'
  cost: number
  labor_hours?: number
  room_condition_after?: number
  notes?: string
  date_added: string
}

interface DashboardStats {
  projectCount: number;
  totalBudget: number;
  totalSpent: number;
  isLoading: boolean;
}

interface RoomData {
  id: number;
  name: string;
  area: number;
  // Add other room data here
}

class DataCacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly PROJECTS_TTL = 10 * 60 * 1000 // 10 minutes for projects
  private readonly EXPENSES_TTL = 3 * 60 * 1000 // 3 minutes for expenses
  private readonly DASHBOARD_TTL = 2 * 60 * 1000 // 2 minutes for dashboard stats

  // Helper methods for cache management
  private set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    })
  }

  private get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > entry.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  private delete(key: string): void {
    this.cache.delete(key)
  }

  // Projects cache
  setProjects(projects: ProjectData[]): void {
    this.set('projects', projects, this.PROJECTS_TTL)
    console.log(`[CACHE] Cached ${projects.length} projects`)
  }

  getProjects(): ProjectData[] | null {
    return this.get<ProjectData[]>('projects')
  }

  invalidateProjects(): void {
    this.delete('projects')
    console.log('[CACHE] Invalidated projects cache')
  }

  // Dashboard stats cache
  setDashboardStats(stats: DashboardStats): void {
    this.set('dashboard:stats', stats, this.DASHBOARD_TTL)
    console.log('[CACHE] Cached dashboard stats')
  }

  getDashboardStats(): DashboardStats | null {
    return this.get<DashboardStats>('dashboard:stats')
  }

  invalidateDashboardStats(): void {
    this.delete('dashboard:stats')
    console.log('[CACHE] Invalidated dashboard stats cache')
  }

  // Expenses cache
  setExpenses(projectId: number, expenses: ExpenseData[]): void {
    this.set(`expenses:project:${projectId}`, expenses, this.EXPENSES_TTL)
    console.log(`[CACHE] Cached ${expenses.length} expenses for project ${projectId}`)
  }

  getExpenses(projectId: number): ExpenseData[] | null {
    const cached = this.get<ExpenseData[]>(`expenses:project:${projectId}`)
    if (cached) {
      console.log(`[CACHE] Retrieved ${cached.length} expenses from cache for project ${projectId}`)
    }
    return cached
  }

  invalidateExpenses(projectId?: number): void {
    if (projectId) {
      this.delete(`expenses:project:${projectId}`)
      console.log(`[CACHE] Invalidated expenses cache for project ${projectId}`)
    } else {
      // Clear all expense-related caches
      for (const key of this.cache.keys()) {
        if (key.startsWith('expenses:')) {
          this.delete(key)
        }
      }
      console.log('[CACHE] Invalidated all expenses caches')
    }
  }

  // Rooms cache
  setRooms(projectId: number, rooms: RoomData[]): void {
    this.set(`rooms:project:${projectId}`, rooms, this.DEFAULT_TTL)
    console.log(`[CACHE] Cached ${rooms.length} rooms for project ${projectId}`)
  }

  getRooms(projectId: number): RoomData[] | null {
    return this.get<RoomData[]>(`rooms:project:${projectId}`)
  }

  invalidateRooms(projectId: number): void {
    this.delete(`rooms:project:${projectId}`)
    console.log(`[CACHE] Invalidated rooms cache for project ${projectId}`)
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear()
    console.log('[CACHE] Cleared all cache')
  }

  // Get cache stats
  getStats(): { cacheSize: number; cacheKeys: string[] } {
    const keys = Object.keys(this.cache)
    return {
      cacheSize: keys.length,
      cacheKeys: keys
    }
  }

  // Batch operations for better performance
  batchSetProjects(projects: ProjectData[], projectExpenses: Map<number, ExpenseData[]>): void {
    // Set projects
    this.setProjects(projects)
    
    // Set individual projects
    projects.forEach(project => {
      // Assuming setProject is still needed, but not in the new_code, so we'll keep it
      // this.setProject(project.id, project) 
    })
    
    // Set expenses for each project
    projectExpenses.forEach((expenses, projectId) => {
      this.setExpenses(projectId, expenses)
    })
    
    // Set all expenses combined
    const allExpenses = Array.from(projectExpenses.values()).flat()
    // Assuming setAllExpenses is still needed, but not in the new_code, so we'll keep it
    // this.setAllExpenses(allExpenses) 
  }
}

// Export singleton instance
export const dataCache = new DataCacheService()
export type { ProjectData, ExpenseData } 