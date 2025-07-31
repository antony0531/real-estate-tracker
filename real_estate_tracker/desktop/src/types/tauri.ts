// Tauri-specific types for IPC communication

// Tauri command responses
export interface TauriResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Command parameter types
export interface CreateProjectCommand {
  name: string;
  budget: number;
  property_type: string;
  property_class: string;
  description?: string;
  address?: string;
  sqft?: number;
}

export interface UpdateProjectCommand {
  project_id: number;
  name?: string;
  budget?: number;
  status?: string;
  description?: string;
  address?: string;
  sqft?: number;
}

export interface CreateRoomCommand {
  project_id: number;
  name: string;
  condition: number;
  length?: number;
  width?: number;
  height?: number;
  notes?: string;
}

export interface CreateExpenseCommand {
  project_id: number;
  room_name: string;
  category: "material" | "labor";
  cost: number;
  description: string;
  notes?: string;
}

// CLI output parsing types
export interface ParsedCliOutput {
  success: boolean;
  data: any;
  rawOutput: string;
}

// File system types for exports
export interface ExportOptions {
  project_id?: number;
  output_path?: string;
  include_rooms?: boolean;
  include_expenses?: boolean;
}

// App information from Rust backend
export interface TauriAppInfo {
  name: string;
  version: string;
  author: string;
  description: string;
  database_path: string;
  exports_path: string;
  config_path: string;
}

// System information
export interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
  python_path?: string;
  rust_version: string;
}

// Error types from Tauri
export interface TauriError {
  type: "command_error" | "python_error" | "io_error" | "parse_error";
  message: string;
  details?: string;
  code?: number;
}
