// Unified API Service - automatically uses Tauri or PWA service based on environment
import { Platform } from './platform';
import { pwaService } from './pwaService';

// Types matching our backend
export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

export interface ProjectData {
  name: string;
  budget: number;
  property_type: string;
  property_class: string;
  description?: string;
  floors?: number;
  sqft?: number;
  address?: string;
}

export interface UpdateProjectData {
  name?: string;
  budget?: number;
  description?: string;
  floors?: number;
  sqft?: number;
  address?: string;
}

export interface RoomData {
  name: string;
  floor: number;
  length?: number;
  width?: number;
  height?: number;
  condition?: number;
  notes?: string;
}

export interface ExpenseData {
  room_name: string;
  category: string;
  cost: number;
  hours?: number;
  condition?: number;
  notes?: string;
}

// Lazy load TauriService only when needed
let TauriServiceModule: any = null;

async function getTauriService() {
  if (!TauriServiceModule && Platform.isTauri()) {
    try {
      TauriServiceModule = await import('./tauri');
    } catch (e) {
      console.error('Failed to load Tauri service:', e);
    }
  }
  return TauriServiceModule?.TauriService;
}

/**
 * Unified API Service that works in both Tauri and PWA environments
 */
export class APIService {
  
  // =============================================================================
  // APP & SYSTEM COMMANDS
  // =============================================================================
  
  static async getAppInfo(): Promise<AppInfo> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.getAppInfo();
        if (!result.success) throw new Error(result.error);
        return result.data as any;
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.getAppInfo();
    } catch (error) {
      console.error('Failed to get app info:', error);
      throw new Error(`Failed to get app info: ${error}`);
    }
  }

  static async initializeDatabase(): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.initializeDatabase();
        if (!result.success) throw new Error(result.error);
        return 'PWA database initialized';
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  // =============================================================================
  // PROJECT COMMANDS
  // =============================================================================

  static async getProjects(): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.listProjects();
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.getProjects();
    } catch (error) {
      console.error('Failed to get projects:', error);
      throw new Error(`Failed to get projects: ${error}`);
    }
  }

  static async createProject(data: ProjectData): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.createProject(
          data.name,
          data.budget,
          data.property_type,
          data.property_class
        );
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.createProject(data);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  // =============================================================================
  // EXPENSE COMMANDS
  // =============================================================================

  static async getExpenses(projectId: number): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.listExpenses(String(projectId));
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.getExpenses(projectId);
    } catch (error) {
      console.error(`Failed to get expenses for project ${projectId}:`, error);
      throw new Error(`Failed to get expenses for project ${projectId}: ${error}`);
    }
  }

  static async addExpense(expenseData: {
    projectId: number;
    roomName: string;
    category: 'material' | 'labor';
    cost: number;
    hours?: number;
    condition?: number;
    notes?: string;
  }): Promise<string> {
    try {
      if (Platform.isPWA()) {
        // For PWA, we need to create/find the room first
        const roomsResult = await pwaService.listRooms(String(expenseData.projectId));
        let roomId = '';
        if (roomsResult.success && roomsResult.data) {
          const existingRoom = roomsResult.data.find(r => r.name === expenseData.roomName);
          if (existingRoom) {
            roomId = existingRoom.id;
          } else {
            // Create the room if it doesn't exist
            const newRoomResult = await pwaService.createRoom(
              String(expenseData.projectId),
              expenseData.roomName
            );
            if (newRoomResult.success && newRoomResult.data) {
              roomId = newRoomResult.data.id;
            }
          }
        }
        
        const result = await pwaService.createExpense(
          String(expenseData.projectId),
          roomId,
          expenseData.category,
          expenseData.cost,
          expenseData.notes || ''
        );
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      
      const TauriService = await getTauriService();
      if (!TauriService) throw new Error('Tauri service not available');
      return await TauriService.addExpense(expenseData);
    } catch (error) {
      console.error(`Failed to add expense to project ${expenseData.projectId}:`, error);
      throw new Error(`Failed to add expense to project ${expenseData.projectId}: ${error}`);
    }
  }

  // Add more methods as needed...
  
  /**
   * Parse CLI output into structured data
   */
  static parseCliOutput(output: string): {
    success: boolean;
    data: any;
    message?: string;
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(output);
      return { success: true, data: parsed };
    } catch {
      // If not JSON, treat as plain text success if no error indicators
      const hasError = output.toLowerCase().includes('error') || 
                      output.toLowerCase().includes('failed') ||
                      output.toLowerCase().includes('exception');
      
      return {
        success: !hasError,
        data: output.trim(),
        message: hasError ? 'Command executed with errors' : 'Command executed successfully'
      };
    }
  }

  /**
   * Helper method to handle errors consistently
   */
  static handleError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message;
      return typeof message === 'string' ? message : String(message);
    }
    
    return 'An unknown error occurred';
  }
}