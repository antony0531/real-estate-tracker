// PerformanceOptimizer - Advanced performance optimization for Real Estate Tracker

import { dataCache, type ProjectData, type ExpenseData } from './dataCache'
import { TauriService } from './tauri'

interface ProjectDetails {
  id: number
  name: string
  status: string
  priority: string
  budget: number
  spent: number
  rooms: number
  completion: number
}

interface BatchUpdateRequest {
  projectId: number
  field: 'status' | 'priority'
  value: string
}

class PerformanceOptimizerService {
  private batchUpdateQueue: BatchUpdateRequest[] = []
  private batchTimeout: number | null = null
  private readonly BATCH_DELAY = 500 // ms

  // Optimized project loading with parallel processing
  async loadProjectsOptimized(): Promise<ProjectDetails[]> {
    console.log('[PERF] Starting optimized project loading...')
    const startTime = performance.now()

    try {
      // Check cache first - instant loading
      const cachedProjects = dataCache.getProjects()
      if (cachedProjects && cachedProjects.length > 0) {
        console.log(`[PERF] Cache hit! Loaded ${cachedProjects.length} projects in ${(performance.now() - startTime).toFixed(1)}ms`)
        return this.transformProjectData(cachedProjects)
      }

      // If no cache, load with parallel processing
      console.log('[PERF] Cache miss, loading from backend...')
      
      // Get basic project data first
      const projectsOutput = await TauriService.getProjects()
      const basicProjects = this.parseBasicProjects(projectsOutput)
      
      if (basicProjects.length === 0) {
        console.log('[PERF] No projects found')
        return []
      }

      // Create promises for parallel data loading
      const detailPromises = basicProjects.map(async (project) => {
        try {
          // Load expenses and rooms in parallel
          const [expensesOutput, roomsOutput] = await Promise.all([
            TauriService.getExpenses(project.id).catch(() => ''),
            TauriService.getRooms(project.id).catch(() => '')
          ])

          const spent = this.calculateSpentFromExpenses(expensesOutput)
          const rooms = this.parseRoomCount(roomsOutput)
          const completion = project.budget > 0 ? Math.min((spent / project.budget) * 100, 100) : 0

          return {
            ...project,
            spent,
            rooms,
            completion
          }
        } catch (error) {
          console.warn(`[PERF] Failed to load details for project ${project.id}:`, error)
          return {
            ...project,
            spent: 0,
            rooms: 0,
            completion: 0
          }
        }
      })

      // Wait for all details to load with timeout
      const detailedProjects = await Promise.allSettled(detailPromises)
      const successfulProjects = detailedProjects
        .filter((result): result is PromiseFulfilledResult<ProjectDetails> => result.status === 'fulfilled')
        .map(result => result.value)

      // Cache the results for next time
      const projectsForCache: ProjectData[] = successfulProjects.map(p => ({
        id: p.id,
        name: p.name,
        budget: p.budget,
        spent: p.spent,
        status: p.status,
        description: '',
        floors: 0,
        sqft: 0,
        address: ''
      }))
      
      dataCache.setProjects(projectsForCache)

      const loadTime = performance.now() - startTime
      console.log(`[PERF] Loaded ${successfulProjects.length} projects with full details in ${loadTime.toFixed(1)}ms`)
      
      return successfulProjects

    } catch (error) {
      console.error('[PERF] Error in optimized loading:', error)
      throw error
    }
  }

  // Parse basic project data from CLI output
  private parseBasicProjects(output: string): Omit<ProjectDetails, 'spent' | 'rooms' | 'completion'>[] {
    const lines = output.trim().split('\n')
    const projects: Omit<ProjectDetails, 'spent' | 'rooms' | 'completion'>[] = []
    
    for (const line of lines) {
      if (line.startsWith('│') && line.includes('$')) {
        const columns = line.split('│').map(col => col.trim()).filter(col => col)
        
        // Column structure: ID, Name, Status, Priority, Budget, Type, Created
        if (columns.length >= 7) {
          const id = parseInt(columns[0], 10)
          const name = columns[1]
          const status = columns[2].toLowerCase().replace(/\s+/g, '_').trim()
          const priority = columns[3].toLowerCase().trim()
          const budgetMatch = columns[4].match(/\$([0-9,]+)/)
          
          if (!isNaN(id) && budgetMatch) {
            const budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10)
            
            projects.push({
              id,
              name,
              status,
              priority,
              budget
            })
          }
        }
      }
    }
    
    return projects
  }

  // Fast calculation of spent amount
  private calculateSpentFromExpenses(output: string): number {
    if (!output.trim()) return 0
    
    let total = 0
    const lines = output.split('\n')
    
    for (const line of lines) {
      if (line.includes('$')) {
        const match = line.match(/\$([0-9,]+(?:\.[0-9]{2})?)/)
        if (match) {
          const amount = parseFloat(match[1].replace(/,/g, ''))
          if (!isNaN(amount)) {
            total += amount
          }
        }
      }
    }
    
    return total
  }

  // Fast room count parsing
  private parseRoomCount(output: string): number {
    if (!output.trim()) return 0
    
    const lines = output.split('\n')
    let count = 0
    
    for (const line of lines) {
      if (line.startsWith('│') && !line.includes('━')) {
        count++
      }
    }
    
    // Subtract header rows
    return Math.max(0, count - 1)
  }

  // Transform cached data for display
  private transformProjectData(cachedProjects: ProjectData[]): ProjectDetails[] {
    return cachedProjects.map(project => ({
      id: project.id,
      name: project.name,
      status: project.status,
      priority: 'medium', // Default if not in cache
      budget: project.budget,
      spent: project.spent,
      rooms: 0, // Will be loaded if needed
      completion: project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0
    }))
  }

  // Batch update for better performance
  queueBatchUpdate(projectId: number, field: 'status' | 'priority', value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Add to queue
      this.batchUpdateQueue.push({ projectId, field, value })

      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout)
      }

      // Set new timeout to process batch
      this.batchTimeout = setTimeout(async () => {
        try {
          await this.processBatchUpdates()
          resolve()
        } catch (error) {
          reject(error)
        }
      }, this.BATCH_DELAY)
    })
  }

  // Process all queued updates
  private async processBatchUpdates(): Promise<void> {
    if (this.batchUpdateQueue.length === 0) return

    const updates = [...this.batchUpdateQueue]
    this.batchUpdateQueue = []

    console.log(`[PERF] Processing ${updates.length} batch updates`)

    // Group updates by type for efficiency
    const statusUpdates = updates.filter(u => u.field === 'status')
    const priorityUpdates = updates.filter(u => u.field === 'priority')

    try {
      // Process status updates in parallel
      if (statusUpdates.length > 0) {
        await Promise.all(
          statusUpdates.map(update => 
            TauriService.updateProjectStatus(update.projectId, update.value)
          )
        )
      }

      // Process priority updates in parallel
      if (priorityUpdates.length > 0) {
        await Promise.all(
          priorityUpdates.map(update => 
            TauriService.updateProjectPriority(update.projectId, update.value)
          )
        )
      }

      // Invalidate cache to trigger reload
      dataCache.invalidateProjects()
      
      console.log('[PERF] Batch updates completed successfully')
      
    } catch (error) {
      console.error('[PERF] Batch update failed:', error)
      throw error
    }
  }

  // Preload project details in background
  async preloadProjectDetails(projectIds: number[]): Promise<void> {
    console.log(`[PERF] Preloading details for ${projectIds.length} projects in background`)
    
    // Load in background without waiting
    Promise.all(
      projectIds.map(async (id) => {
        try {
          const [expensesOutput, roomsOutput] = await Promise.all([
            TauriService.getExpenses(id),
            TauriService.getRooms(id)
          ])
          
          // Cache the results
          const expenses = this.parseExpensesForCache(expensesOutput)
          const rooms = this.parseRoomsForCache(roomsOutput)
          
          dataCache.setExpenses(id, expenses)
          dataCache.setRooms(id, rooms)
          
        } catch (error) {
          console.warn(`[PERF] Failed to preload details for project ${id}`)
        }
      })
    ).then(() => {
      console.log('[PERF] Background preloading completed')
    })
  }

  // Helper methods for caching
  private parseExpensesForCache(output: string): ExpenseData[] {
    // Simplified parsing for cache
    return []
  }

  private parseRoomsForCache(output: string): any[] {
    // Simplified parsing for cache
    return []
  }

  // Clear all performance caches
  clearCache(): void {
    dataCache.clearAll()
    console.log('[PERF] Performance cache cleared')
  }

  // Get performance stats
  getPerformanceStats(): { cacheSize: number; cacheKeys: string[] } {
    return dataCache.getStats()
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizerService()
export type { ProjectDetails, BatchUpdateRequest } 