// Tauri IPC Service Layer
// Wraps Tauri commands for easy use in React components

import { Platform } from "./platform";
import { pwaService } from "./pwaService";

// Import will be mocked in production builds via Vite config
import { invoke } from "@tauri-apps/api/tauri";

// Types matching our Rust backend
export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

export interface PythonInfo {
  version: string;
  executable: string;
  has_backend: boolean;
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
      if (Platform.isPWA()) {
        const result = await pwaService.getAppInfo();
        if (!result.success) throw new Error(result.error);
        return result.data as any;
      }

      return await invoke<AppInfo>("get_app_info");
    } catch (error) {
      console.error("Failed to get app info:", error);
      // Return default for PWA instead of throwing
      if (Platform.isPWA()) {
        return {
          name: "Real Estate Tracker",
          version: "0.2.0-pwa",
          description: "PWA Mode",
        };
      }
      throw new Error(`Failed to get app info: ${error}`);
    }
  }

  /**
   * Initialize the database
   */
  static async initializeDatabase(): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.initializeDatabase();
        if (!result.success) throw new Error(result.error);
        return "PWA database initialized";
      }

      return await invoke<string>("initialize_database");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      // Handle gracefully for PWA
      if (Platform.isPWA()) {
        // Try to initialize PWA database as fallback
        try {
          const result = await pwaService.initializeDatabase();
          if (result.success) {
            return "PWA database initialized (fallback)";
          }
        } catch (e) {
          console.error("PWA fallback also failed:", e);
        }
      }
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  /**
   * Check Python installation
   */
  static async checkPythonInstallation(): Promise<PythonInfo> {
    try {
      return await invoke<PythonInfo>("check_python_installation");
    } catch (error) {
      console.error("Failed to check Python installation:", error);
      throw new Error(`Failed to check Python installation: ${error}`);
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
      if (Platform.isPWA()) {
        const result = await pwaService.listProjects();
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      return await invoke<string>("get_projects");
    } catch (error) {
      console.error("Failed to get projects:", error);
      throw new Error(`Failed to get projects: ${error}`);
    }
  }

  /**
   * Get a specific project by ID
   */
  static async getProject(projectId: number): Promise<string> {
    try {
      return await invoke<string>("get_project", { projectId });
    } catch (error) {
      console.error(`Failed to get project ${projectId}:`, error);
      throw new Error(`Failed to get project ${projectId}: ${error}`);
    }
  }

  /**
   * Create a new project
   */
  static async createProject(data: ProjectData): Promise<string> {
    try {
      if (Platform.isPWA()) {
        const result = await pwaService.createProject(
          data.name,
          data.budget,
          data.property_type,
          data.property_class,
        );
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }

      const result = await invoke<string>("create_project", { data });

      // Invalidate cache after creating project
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateProjects();
      console.log(`[TAURI] Cache invalidated after creating new project`);

      return result;
    } catch (error) {
      console.error("Failed to create project:", error);
      throw new Error(`Failed to create project: ${error}`);
    }
  }

  /**
   * Update an existing project
   */
  static async updateProject(
    projectId: number,
    data: UpdateProjectData,
  ): Promise<string> {
    try {
      const result = await invoke<string>("update_project", {
        projectId,
        data,
      });

      // Invalidate cache after updating project
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateProjects();
      console.log(
        `[TAURI] Cache invalidated after updating project ${projectId}`,
      );

      return result;
    } catch (error) {
      console.error(`Failed to update project ${projectId}:`, error);
      throw new Error(`Failed to update project ${projectId}: ${error}`);
    }
  }

  /**
   * Delete a project
   */
  static async deleteProject(projectId: number): Promise<string> {
    try {
      const result = await invoke<string>("delete_project", { projectId });

      // Invalidate cache after deleting project
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateProjects();
      dataCache.invalidateExpenses(); // Also invalidate expenses since project is deleted
      console.log(
        `[TAURI] Cache invalidated after deleting project ${projectId}`,
      );

      return result;
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
      throw new Error(`Failed to delete project ${projectId}: ${error}`);
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
      const result = await invoke<string>("get_rooms", { projectId });
      return result || "";
    } catch (error: unknown) {
      console.error(`Failed to get rooms for project ${projectId}:`, error);
      const errorMessage = this.handleError(error);
      throw new Error(
        `Failed to get rooms for project ${projectId}: ${errorMessage}`,
      );
    }
  }

  /**
   * Add a room to a project
   */
  static async addRoom(
    projectId: number,
    name: string,
    floor: number,
    length?: number,
    width?: number,
    height?: number,
    condition?: number,
    notes?: string,
  ): Promise<void> {
    try {
      await invoke("add_room", {
        projectId,
        data: {
          name,
          floor,
          length_ft: length,
          width_ft: width,
          height_ft: height,
          initial_condition: condition,
          notes,
        },
      });

      // Invalidate cache after adding room
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateRooms(projectId);
      console.log(
        `[TAURI] Cache invalidated after adding room to project ${projectId}`,
      );
    } catch (error: unknown) {
      console.error("Failed to add room:", error);
      const errorMessage = this.handleError(error);
      throw new Error(`Failed to add room: ${errorMessage}`);
    }
  }

  /**
   * Update a room in a project
   */
  static async updateRoom(
    projectId: number,
    currentName: string,
    newName?: string,
    length?: number,
    width?: number,
    height?: number,
    condition?: number,
    notes?: string,
  ): Promise<void> {
    try {
      await invoke("update_room", {
        projectId,
        roomName: currentName,
        data: {
          name: newName,
          length_ft: length,
          width_ft: width,
          height_ft: height,
          initial_condition: condition,
          notes,
        },
      });

      // Invalidate cache after updating room
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateRooms(projectId);
      console.log(
        `[TAURI] Cache invalidated after updating room in project ${projectId}`,
      );
    } catch (error: unknown) {
      console.error("Failed to update room:", error);
      const errorMessage = this.handleError(error);
      throw new Error(`Failed to update room: ${errorMessage}`);
    }
  }

  /**
   * Delete a room from a project
   */
  static async deleteRoom(
    projectId: number,
    roomName: string,
  ): Promise<string> {
    try {
      const result = await invoke<string>("delete_room", {
        project_id: projectId,
        room_name: roomName,
      });

      // Invalidate cache after deleting room
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateRooms(projectId);
      console.log(
        `[TAURI] Cache invalidated after deleting room from project ${projectId}`,
      );

      return result;
    } catch (error) {
      console.error("Failed to delete room:", error);
      throw new Error(`Failed to delete room: ${error}`);
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
      if (Platform.isPWA()) {
        const result = await pwaService.listExpenses(String(projectId));
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }
      // The Tauri command only supports projectId, not filters
      // If filters are needed, we'll filter on the frontend
      return await invoke<string>("get_expenses", { projectId });
    } catch (error) {
      throw new Error(
        `Failed to get expenses for project ${projectId}: ${TauriService.handleError(error)}`,
      );
    }
  }

  /**
   * Add an expense to a project
   */
  static async addExpense(expenseData: {
    projectId: number;
    roomName: string;
    category: "material" | "labor";
    cost: number;
    hours?: number;
    condition?: number;
    notes?: string;
  }): Promise<string> {
    try {
      if (Platform.isPWA()) {
        // For PWA, we need to create/find the room first
        const roomsResult = await pwaService.listRooms(
          String(expenseData.projectId),
        );
        let roomId = "";
        if (roomsResult.success && roomsResult.data) {
          const existingRoom = roomsResult.data.find(
            (r) => r.name === expenseData.roomName,
          );
          if (existingRoom) {
            roomId = existingRoom.id;
          } else {
            // Create the room if it doesn't exist
            const newRoomResult = await pwaService.createRoom(
              String(expenseData.projectId),
              expenseData.roomName,
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
          expenseData.notes || "",
        );
        if (!result.success) throw new Error(result.error);
        return JSON.stringify(result.data);
      }

      const data = {
        room_name: expenseData.roomName,
        category: expenseData.category,
        cost: expenseData.cost,
        hours: expenseData.hours,
        condition: expenseData.condition,
        notes: expenseData.notes,
      };

      const result = await invoke<string>("add_expense", {
        projectId: expenseData.projectId,
        data,
      });

      // Invalidate all relevant caches
      const { dataCache } = await import("./dataCache");
      // Invalidate expenses for this project and all expenses
      dataCache.invalidateExpenses(expenseData.projectId);
      dataCache.invalidateExpenses(); // This will clear all expense caches
      dataCache.invalidateDashboardStats();
      dataCache.invalidateProjects();
      console.log(
        `[TAURI] Cache invalidated after adding expense to project ${expenseData.projectId}`,
      );

      return result;
    } catch (error) {
      console.error(
        `Failed to add expense to project ${expenseData.projectId}:`,
        error,
      );
      throw new Error(
        `Failed to add expense to project ${expenseData.projectId}: ${error}`,
      );
    }
  }

  /**
   * Delete an expense by ID
   */
  static async deleteExpense(expenseId: number): Promise<string> {
    try {
      const result = await invoke<string>("delete_expense", {
        expenseId,
      });

      // Invalidate cache after deleting expense
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateExpenses(); // Invalidate all expenses since we don't know project ID
      console.log(
        `[TAURI] Cache invalidated after deleting expense ${expenseId}`,
      );

      return result;
    } catch (error) {
      console.error(`Failed to delete expense ${expenseId}:`, error);
      throw new Error(`Failed to delete expense ${expenseId}: ${error}`);
    }
  }

  /**
   * Update an expense
   */
  static async updateExpense(
    expenseId: number,
    data: {
      room_name?: string;
      category?: "material" | "labor";
      cost?: number;
      hours?: number;
      condition?: number;
      notes?: string;
    },
  ): Promise<string> {
    try {
      const result = await invoke<string>("update_expense", {
        expenseId,
        data,
      });

      // Invalidate cache after updating expense
      const { dataCache } = await import("./dataCache");
      dataCache.invalidateExpenses(); // Invalidate all expenses since we don't know project ID
      console.log(
        `[TAURI] Cache invalidated after updating expense ${expenseId}`,
      );

      return result;
    } catch (error) {
      console.error(`Failed to update expense ${expenseId}:`, error);
      throw new Error(`Failed to update expense ${expenseId}: ${error}`);
    }
  }

  /**
   * Get total expenses across all projects (helper method)
   */
  static async getAllExpenses(): Promise<string> {
    try {
      // Get all projects first
      const projectsOutput = await this.getProjects();

      // Parse project IDs from the output
      const projectIds = this.extractProjectIds(projectsOutput);

      // Get expenses for all projects
      const allExpensesPromises = projectIds.map(
        (id) => this.getExpenses(id).catch(() => ""), // Ignore errors for individual projects
      );

      const allExpenses = await Promise.all(allExpensesPromises);
      return allExpenses
        .filter((exp) => exp.trim())
        .join("\n---PROJECT_SEPARATOR---\n");
    } catch (error) {
      console.error("Failed to get all expenses:", error);
      throw new Error(`Failed to get all expenses: ${error}`);
    }
  }

  /**
   * Helper method to extract project IDs from project list output
   */
  private static extractProjectIds(projectsOutput: string): number[] {
    const lines = projectsOutput.trim().split("\n");
    const projectIds: number[] = [];

    for (const line of lines) {
      if (line.startsWith("│") && line.includes("$")) {
        const columns = line
          .split("│")
          .map((col) => col.trim())
          .filter((col) => col);
        if (columns.length > 0) {
          const id = parseInt(columns[0]);
          if (!isNaN(id)) {
            projectIds.push(id);
          }
        }
      }
    }

    return projectIds;
  }

  // =============================================================================
  // BUDGET & EXPORT COMMANDS
  // =============================================================================

  /**
   * Get budget status for a project
   */
  static async getBudgetStatus(projectId: number): Promise<string> {
    try {
      return await invoke<string>("get_budget_status", { projectId });
    } catch (error) {
      console.error(
        `Failed to get budget status for project ${projectId}:`,
        error,
      );
      throw new Error(
        `Failed to get budget status for project ${projectId}: ${error}`,
      );
    }
  }

  /**
   * Export project data
   */
  static async exportProject(
    projectId: number,
    format: string = "csv",
  ): Promise<string> {
    try {
      return await invoke<string>("export_project", {
        projectId,
        format,
      });
    } catch (error) {
      console.error(`Failed to export project ${projectId}:`, error);
      throw new Error(`Failed to export project ${projectId}: ${error}`);
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
      await this.getAppInfo();
      await this.checkPythonInstallation();
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  /**
   * Test Python execution capabilities
   */
  static async testPythonExecution(): Promise<string> {
    try {
      return await invoke<string>("test_python_execution");
    } catch (error) {
      console.error("Failed to test Python execution:", error);
      throw new Error(`Failed to test Python execution: ${error}`);
    }
  }

  /**
   * Test expense addition with debug info
   */
  static async testExpenseAdd(): Promise<string> {
    try {
      return await invoke<string>("test_expense_add");
    } catch (error) {
      console.error("Test expense add failed:", error);
      throw new Error(`Test expense add failed: ${error}`);
    }
  }

  /**
   * Get formatted list of all rooms across all projects
   */
  static async getAllRoomsList(): Promise<string> {
    try {
      const projects = await this.getProjects();
      let allRooms = "\n=== ALL AVAILABLE ROOMS ===\n\n";

      // Parse projects from CLI output
      const lines = projects.trim().split("\n");
      const projectIds: number[] = [];

      for (const line of lines) {
        if (
          line.startsWith("│") &&
          line.includes("$") &&
          !line.includes("ID")
        ) {
          const columns = line
            .split("│")
            .map((col) => col.trim())
            .filter((col) => col);
          if (columns.length >= 1) {
            const id = parseInt(columns[0], 10);
            if (!isNaN(id)) {
              projectIds.push(id);
            }
          }
        }
      }

      for (const projectId of projectIds) {
        try {
          const roomsOutput = await this.getRooms(projectId);
          allRooms += `\nProject ${projectId} Rooms:\n${roomsOutput}\n`;
        } catch (error) {
          allRooms += `\nProject ${projectId}: Error loading rooms - ${error}\n`;
        }
      }

      return allRooms;
    } catch (error) {
      console.error("Failed to get all rooms list:", error);
      throw new Error(`Failed to get all rooms list: ${error}`);
    }
  }

  /**
   * Parse CLI output into structured data
   * This is a helper for components that need to extract data from CLI text output
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
      const hasError =
        output.toLowerCase().includes("error") ||
        output.toLowerCase().includes("failed") ||
        output.toLowerCase().includes("exception");

      return {
        success: !hasError,
        data: output.trim(),
        message: hasError
          ? "Command executed with errors"
          : "Command executed successfully",
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

    if (typeof error === "string") {
      return error;
    }

    if (error && typeof error === "object" && "message" in error) {
      const message = error.message;
      return typeof message === "string" ? message : String(message);
    }

    return "An unknown error occurred";
  }

  // Quick update methods for better performance
  static async updateProjectStatus(
    projectId: number,
    status: string,
  ): Promise<string> {
    const result = await invoke("update_project_status", { projectId, status });

    // Invalidate cache after updating project status
    const { dataCache } = await import("./dataCache");
    dataCache.invalidateProjects();
    console.log(
      `[TAURI] Cache invalidated after updating project ${projectId} status`,
    );

    return result as string;
  }

  static async updateProjectPriority(
    projectId: number,
    priority: string,
  ): Promise<string> {
    const result = await invoke("update_project_priority", {
      projectId,
      priority,
    });

    // Invalidate cache after updating project priority
    const { dataCache } = await import("./dataCache");
    dataCache.invalidateProjects();
    console.log(
      `[TAURI] Cache invalidated after updating project ${projectId} priority`,
    );

    return result as string;
  }
}
