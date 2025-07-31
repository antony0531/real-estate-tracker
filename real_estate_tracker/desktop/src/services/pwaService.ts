// PWA Service - provides mock implementations for PWA mode
import { indexedDB } from "./indexedDB";
import type { Project, Expense, Room, AppInfo, ApiResponse } from "@/types";

class PWAService {
  private initialized = false;

  async initializeDatabase(): Promise<ApiResponse<void>> {
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
        error: `Failed to initialize IndexedDB: ${error}`,
      };
    }
  }

  async getAppInfo(): Promise<ApiResponse<AppInfo>> {
    return {
      success: true,
      data: {
        version: "0.2.0-pwa",
        platform: "web",
        features: ["offline", "camera", "pwa"],
        databasePath: "IndexedDB",
      },
    };
  }

  // Projects
  async createProject(
    name: string,
    budget: number,
    propertyType: string,
    strategyType: string,
  ): Promise<ApiResponse<Project>> {
    try {
      const project: Project = {
        id: Date.now(),
        name,
        address: "",
        budget,
        spent: 0,
        property_type: propertyType,
        strategy_type: strategyType,
        status: "planning",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await indexedDB.saveProject(project);
      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const projects = await indexedDB.getAllProjects();
      return { success: true, data: projects };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    try {
      const project = await indexedDB.getProject(id);
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async updateProject(
    id: string,
    updates: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    try {
      const project = await indexedDB.getProject(id);
      if (!project) {
        return { success: false, error: "Project not found" };
      }

      const updatedProject = {
        ...project,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      await indexedDB.saveProject(updatedProject);
      return { success: true, data: updatedProject };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    try {
      // For now, just mark as deleted in the project
      const project = await indexedDB.getProject(id);
      if (project) {
        project.status = "deleted";
        await indexedDB.saveProject(project);
      }
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Expenses
  async createExpense(
    projectId: number,
    roomId: number,
    category: ExpenseCategory,
    amount: number,
    notes: string,
  ): Promise<ApiResponse<Expense>> {
    try {
      const expense: Expense = {
        id: Date.now(),
        projectId,
        roomId,
        category,
        cost: amount,
        description: notes || "",
        notes,
        createdAt: new Date().toISOString(),
      };

      await indexedDB.saveExpense(expense);

      // Update project spent amount
      const project = await indexedDB.getProject(projectId.toString());
      if (project) {
        project.spent = (project.spent || 0) + amount;
        await indexedDB.saveProject(project);
      }

      return { success: true, data: expense };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listExpenses(projectId?: string): Promise<ApiResponse<Expense[]>> {
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
    floor?: number,
  ): Promise<ApiResponse<Room>> {
    try {
      const room: Room = {
        id: Date.now(),
        project_id: projectId,
        name,
        floor_number: floor || 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        condition: 3,
        notes: "",
      };

      await indexedDB.saveRoom(room);
      return { success: true, data: room };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async listRooms(projectId?: string): Promise<ApiResponse<Room[]>> {
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
  async exportData(): Promise<ApiResponse<any>> {
    try {
      const data = await indexedDB.exportData();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async importData(data: any): Promise<ApiResponse<void>> {
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
      id: 1,
      name: "Demo House Flip",
      address: "123 Demo Street",
      budget: 50000,
      spent: 5250,
      property_type: "single_family",
      strategy_type: "flip",
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await indexedDB.saveProject(demoProject);

    // Create demo rooms
    const rooms = [
      { name: "Kitchen", floor: 1 },
      { name: "Living Room", floor: 1 },
      { name: "Master Bedroom", floor: 2 },
      { name: "Bathroom", floor: 1 },
    ];

    for (const roomData of rooms) {
      const room: Room = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        projectId: demoProject.id,
        name: roomData.name,
        floor: roomData.floor,
        condition: 3,
        notes: "",
      };
      await indexedDB.saveRoom(room);
    }

    // Create demo expenses
    const expenses = [
      {
        room: "demo_room_kitchen",
        category: "material",
        amount: 2500,
        notes: "New cabinets",
      },
      {
        room: "demo_room_kitchen",
        category: "labor",
        amount: 1500,
        notes: "Cabinet installation",
      },
      {
        room: "demo_room_living_room",
        category: "material",
        amount: 750,
        notes: "Paint and supplies",
      },
      {
        room: "demo_room_bathroom",
        category: "material",
        amount: 500,
        notes: "New fixtures",
      },
    ];

    for (const expData of expenses) {
      const expense: Expense = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        projectId: demoProject.id,
        roomId: 1, // We'll use a placeholder room ID
        category: expData.category as ExpenseCategory,
        cost: expData.amount,
        description: expData.notes,
        notes: expData.notes,
        createdAt: new Date().toISOString(),
      };
      await indexedDB.saveExpense(expense);
    }
  }
}

export const pwaService = new PWAService();
