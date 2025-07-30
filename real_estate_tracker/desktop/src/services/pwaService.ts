// PWA Service - provides mock implementations for PWA mode
import { indexedDB } from './indexedDB';
import type { Project, Expense, Room, AppInfo, APIResponse } from '@/types';

class PWAService {
  private initialized = false;

  async initializeDatabase(): Promise<APIResponse<void>> {
    try {
      if (!this.initialized) {
        await indexedDB.init();
        this.initialized = true;
        
        // Initialize with demo data if empty
        const projects = await indexedDB.getAllProjects();
        if (projects.length === 0) {
          await this.createDemoData();
        }
      }
      
      return { success: true, data: undefined };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to initialize IndexedDB: ${error}` 
      };
    }
  }

  async getAppInfo(): Promise<APIResponse<AppInfo>> {
    return {
      success: true,
      data: {
        version: '0.2.0-pwa',
        platform: 'web',
        features: ['offline', 'camera', 'pwa'],
        databasePath: 'IndexedDB'
      }
    };
  }

  // Projects
  async createProject(
    name: string,
    budget: number,
    propertyType: string,
    strategyType: string
  ): Promise<APIResponse<Project>> {
    try {
      const project: Project = {
        id: `proj_${Date.now()}`,
        name,
        address: '',
        budget,
        spent: 0,
        property_type: propertyType,
        strategy_type: strategyType,
        status: 'planning',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await indexedDB.saveProject(project);
      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listProjects(): Promise<APIResponse<Project[]>> {
    try {
      const projects = await indexedDB.getAllProjects();
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getProject(id: string): Promise<APIResponse<Project>> {
    try {
      const project = await indexedDB.getProject(id);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<APIResponse<Project>> {
    try {
      const project = await indexedDB.getProject(id);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }
      
      const updatedProject = {
        ...project,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      await indexedDB.saveProject(updatedProject);
      return { success: true, data: updatedProject };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteProject(id: string): Promise<APIResponse<void>> {
    try {
      // For now, just mark as deleted in the project
      const project = await indexedDB.getProject(id);
      if (project) {
        project.status = 'deleted';
        await indexedDB.saveProject(project);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Expenses
  async createExpense(
    projectId: string,
    roomId: string,
    category: string,
    amount: number,
    notes: string
  ): Promise<APIResponse<Expense>> {
    try {
      const expense: Expense = {
        id: `exp_${Date.now()}`,
        project_id: projectId,
        room_id: roomId,
        category,
        amount,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      await indexedDB.saveExpense(expense);
      
      // Update project spent amount
      const project = await indexedDB.getProject(projectId);
      if (project) {
        project.spent = (project.spent || 0) + amount;
        await indexedDB.saveProject(project);
      }
      
      return { success: true, data: expense };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listExpenses(projectId?: string): Promise<APIResponse<Expense[]>> {
    try {
      if (projectId) {
        const expenses = await indexedDB.getExpensesByProject(projectId);
        return { success: true, data: expenses };
      }
      // Return all expenses if no project specified
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Rooms
  async createRoom(
    projectId: string,
    name: string,
    floor?: number
  ): Promise<APIResponse<Room>> {
    try {
      const room: Room = {
        id: `room_${Date.now()}`,
        project_id: projectId,
        name,
        floor_number: floor || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        condition: 3,
        notes: ''
      };
      
      await indexedDB.saveRoom(room);
      return { success: true, data: room };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listRooms(projectId?: string): Promise<APIResponse<Room[]>> {
    try {
      if (projectId) {
        const rooms = await indexedDB.getRoomsByProject(projectId);
        return { success: true, data: rooms };
      }
      return { success: true, data: [] };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Export functionality
  async exportData(): Promise<APIResponse<any>> {
    try {
      const data = await indexedDB.exportData();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async importData(data: any): Promise<APIResponse<void>> {
    try {
      await indexedDB.importData(data);
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Demo data creation
  private async createDemoData() {
    // Create a demo project
    const demoProject: Project = {
      id: 'demo_project_1',
      name: 'Demo House Flip',
      address: '123 Demo Street',
      budget: 50000,
      spent: 5250,
      property_type: 'single_family',
      strategy_type: 'flip',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await indexedDB.saveProject(demoProject);
    
    // Create demo rooms
    const rooms = [
      { name: 'Kitchen', floor: 1 },
      { name: 'Living Room', floor: 1 },
      { name: 'Master Bedroom', floor: 2 },
      { name: 'Bathroom', floor: 1 }
    ];
    
    for (const roomData of rooms) {
      const room: Room = {
        id: `demo_room_${roomData.name.toLowerCase().replace(' ', '_')}`,
        project_id: demoProject.id,
        name: roomData.name,
        floor_number: roomData.floor,
        condition: 3,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await indexedDB.saveRoom(room);
    }
    
    // Create demo expenses
    const expenses = [
      { room: 'demo_room_kitchen', category: 'material', amount: 2500, notes: 'New cabinets' },
      { room: 'demo_room_kitchen', category: 'labor', amount: 1500, notes: 'Cabinet installation' },
      { room: 'demo_room_living_room', category: 'material', amount: 750, notes: 'Paint and supplies' },
      { room: 'demo_room_bathroom', category: 'material', amount: 500, notes: 'New fixtures' }
    ];
    
    for (const expData of expenses) {
      const expense: Expense = {
        id: `demo_expense_${Date.now()}_${Math.random()}`,
        project_id: demoProject.id,
        room_id: expData.room,
        category: expData.category,
        amount: expData.amount,
        notes: expData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await indexedDB.saveExpense(expense);
    }
  }
}

export const pwaService = new PWAService();