use serde::{Deserialize, Serialize};
use tauri::command;
use anyhow::Result;
use tracing::{info, error};

use crate::python::{execute_python_command, parse_cli_output};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppInfo {
    pub name: String,
    pub version: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectData {
    pub name: String,
    pub budget: f64,
    pub property_type: String,
    pub property_class: String,
    pub description: Option<String>,
    pub floors: Option<u32>,
    pub sqft: Option<f64>,
    pub address: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoomData {
    pub name: String,
    pub floor: u32,
    pub length: Option<f64>,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub condition: Option<u32>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExpenseData {
    pub room_name: String,
    pub category: String,
    pub cost: f64,
    pub hours: Option<f64>,
    pub condition: Option<u32>,
    pub notes: Option<String>,
}

/// Get application information
#[command]
pub async fn get_app_info() -> Result<AppInfo, String> {
    Ok(AppInfo {
        name: "Real Estate Tracker".to_string(),
        version: "0.2.0".to_string(),
        description: "Professional house flipping budget tracker".to_string(),
    })
}

/// Initialize the database
#[command]
pub async fn initialize_database() -> Result<String, String> {
    info!("Initializing database");
    
    let output = execute_python_command(vec!["init"])
        .await
        .map_err(|e| format!("Database initialization failed: {}", e))?;
        
    Ok(output)
}

/// Get all projects
#[command]
pub async fn get_projects() -> Result<String, String> {
    info!("Fetching all projects");
    
    let output = execute_python_command(vec!["project", "list"])
        .await
        .map_err(|e| format!("Failed to get projects: {}", e))?;
        
    Ok(output)
}

/// Get a specific project by ID
#[command]
pub async fn get_project(project_id: u32) -> Result<String, String> {
    info!("Fetching project {}", project_id);
    
    let output = execute_python_command(vec!["project", "show", &project_id.to_string()])
        .await
        .map_err(|e| format!("Failed to get project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Create a new project
#[command]
pub async fn create_project(data: ProjectData) -> Result<String, String> {
    info!("Creating project: {}", data.name);
    
    let mut args = vec![
        "project", "create",
        &data.name,
        &data.budget.to_string(),
        &data.property_type,
        &data.property_class
    ];
    
    // Add optional arguments
    let mut temp_strings = Vec::new(); // To keep strings alive
    
    if let Some(ref desc) = data.description {
        args.push("--description");
        args.push(desc);
    }
    
    if let Some(floors) = data.floors {
        let floors_str = floors.to_string();
        temp_strings.push(floors_str);
        args.push("--floors");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(sqft) = data.sqft {
        let sqft_str = sqft.to_string();
        temp_strings.push(sqft_str);
        args.push("--sqft");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(ref address) = data.address {
        args.push("--address");
        args.push(address);
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to create project: {}", e))?;
        
    Ok(output)
}

/// Update an existing project
#[command]
pub async fn update_project(project_id: u32, data: ProjectData) -> Result<String, String> {
    info!("Updating project {}", project_id);
    
    let mut args = vec!["project", "update", &project_id.to_string()];
    let mut temp_strings = Vec::new();
    
    // Add fields that should be updated
    args.push("--name");
    args.push(&data.name);
    
    let budget_str = data.budget.to_string();
    temp_strings.push(budget_str);
    args.push("--budget");
    args.push(temp_strings.last().unwrap());
    
    if let Some(ref desc) = data.description {
        args.push("--description");
        args.push(desc);
    }
    
    if let Some(ref address) = data.address {
        args.push("--address");
        args.push(address);
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to update project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Delete a project
#[command]
pub async fn delete_project(project_id: u32, force: bool) -> Result<String, String> {
    info!("Deleting project {} (force: {})", project_id, force);
    
    let mut args = vec!["project", "delete", &project_id.to_string()];
    if force {
        args.push("--force");
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Get rooms for a project
#[command]
pub async fn get_rooms(project_id: u32) -> Result<String, String> {
    info!("Fetching rooms for project {}", project_id);
    
    let output = execute_python_command(vec!["room", "list", &project_id.to_string()])
        .await
        .map_err(|e| format!("Failed to get rooms for project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Add a room to a project
#[command]
pub async fn add_room(project_id: u32, data: RoomData) -> Result<String, String> {
    info!("Adding room {} to project {}", data.name, project_id);
    
    let mut args = vec![
        "room", "add",
        &project_id.to_string(),
        &data.name,
        &data.floor.to_string()
    ];
    
    let mut temp_strings = Vec::new();
    
    if let Some(length) = data.length {
        let length_str = length.to_string();
        temp_strings.push(length_str);
        args.push("--length");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(width) = data.width {
        let width_str = width.to_string();
        temp_strings.push(width_str);
        args.push("--width");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(height) = data.height {
        let height_str = height.to_string();
        temp_strings.push(height_str);
        args.push("--height");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(condition) = data.condition {
        let condition_str = condition.to_string();
        temp_strings.push(condition_str);
        args.push("--condition");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(ref notes) = data.notes {
        args.push("--notes");
        args.push(notes);
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to add room: {}", e))?;
        
    Ok(output)
}

/// Delete a room
#[command]
pub async fn delete_room(project_id: u32, room_name: String, force: bool) -> Result<String, String> {
    info!("Deleting room {} from project {} (force: {})", room_name, project_id, force);
    
    let mut args = vec!["room", "delete", &project_id.to_string(), &room_name];
    if force {
        args.push("--force");
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete room: {}", e))?;
        
    Ok(output)
}

/// Get expenses for a project
#[command]
pub async fn get_expenses(project_id: u32, room_filter: Option<String>, category_filter: Option<String>) -> Result<String, String> {
    info!("Fetching expenses for project {}", project_id);
    
    let mut args = vec!["expense", "list", &project_id.to_string()];
    
    if let Some(ref room) = room_filter {
        args.push("--room");
        args.push(room);
    }
    
    if let Some(ref category) = category_filter {
        args.push("--category");
        args.push(category);
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to get expenses: {}", e))?;
        
    Ok(output)
}

/// Add an expense
#[command]
pub async fn add_expense(project_id: u32, data: ExpenseData) -> Result<String, String> {
    info!("Adding expense to project {} room {}", project_id, data.room_name);
    
    let mut args = vec![
        "expense", "add",
        &project_id.to_string(),
        &data.room_name,
        &data.category,
        &data.cost.to_string()
    ];
    
    let mut temp_strings = Vec::new();
    
    if let Some(hours) = data.hours {
        let hours_str = hours.to_string();
        temp_strings.push(hours_str);
        args.push("--hours");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(condition) = data.condition {
        let condition_str = condition.to_string();
        temp_strings.push(condition_str);
        args.push("--condition");
        args.push(temp_strings.last().unwrap());
    }
    
    if let Some(ref notes) = data.notes {
        args.push("--notes");
        args.push(notes);
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to add expense: {}", e))?;
        
    Ok(output)
}

/// Delete an expense
#[command]
pub async fn delete_expense(expense_id: u32, force: bool) -> Result<String, String> {
    info!("Deleting expense {} (force: {})", expense_id, force);
    
    let mut args = vec!["expense", "delete", &expense_id.to_string()];
    if force {
        args.push("--force");
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete expense: {}", e))?;
        
    Ok(output)
}

/// Get budget status for a project
#[command]
pub async fn get_budget_status(project_id: u32) -> Result<String, String> {
    info!("Getting budget status for project {}", project_id);
    
    let output = execute_python_command(vec!["budget", "status", &project_id.to_string()])
        .await
        .map_err(|e| format!("Failed to get budget status: {}", e))?;
        
    Ok(output)
}

/// Export project data
#[command]
pub async fn export_project(project_id: u32, output_file: Option<String>, no_rooms: bool, no_expenses: bool) -> Result<String, String> {
    info!("Exporting project {} to file", project_id);
    
    let mut args = vec!["export", "csv", &project_id.to_string()];
    
    if let Some(ref file) = output_file {
        args.push("--output");
        args.push(file);
    }
    
    if no_rooms {
        args.push("--no-rooms");
    }
    
    if no_expenses {
        args.push("--no-expenses");
    }
    
    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to export project: {}", e))?;
        
    Ok(output)
} 