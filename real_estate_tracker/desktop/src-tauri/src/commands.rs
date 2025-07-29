use serde::{Deserialize, Serialize};
use tauri::command;
use anyhow::Result;
use tracing::info;
use tracing::error;

use crate::python::execute_python_command;

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
pub struct UpdateProjectData {
    pub name: Option<String>,
    pub budget: Option<f64>,
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
    
    let project_id_str = project_id.to_string();
    let output = execute_python_command(vec!["project", "show", &project_id_str])
        .await
        .map_err(|e| format!("Failed to get project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Create a new project
#[command]
pub async fn create_project(data: ProjectData) -> Result<String, String> {
    info!("Creating project: {}", data.name);
    
    let budget_str = data.budget.to_string();
    let mut args = vec![
        "project", "create",
        &data.name,
        &budget_str,
        &data.property_type,
        &data.property_class
    ];

    // Collect all optional string values first
    let mut temp_strings = Vec::new();
    let mut floor_idx = None;
    let mut sqft_idx = None;

    if let Some(description) = &data.description {
        args.push("--description");
        args.push(description);
    }

    if let Some(floors) = data.floors {
        let floors_str = floors.to_string();
        temp_strings.push(floors_str);
        floor_idx = Some(temp_strings.len() - 1);
    }

    if let Some(sqft) = data.sqft {
        let sqft_str = sqft.to_string();
        temp_strings.push(sqft_str);
        sqft_idx = Some(temp_strings.len() - 1);
    }

    // Add the floor arguments if present
    if let Some(idx) = floor_idx {
        args.push("--floors");
        args.push(&temp_strings[idx]);
    }

    // Add the sqft arguments if present
    if let Some(idx) = sqft_idx {
        args.push("--sqft");
        args.push(&temp_strings[idx]);
    }

    if let Some(address) = &data.address {
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
pub async fn update_project(project_id: u32, data: UpdateProjectData) -> Result<String, String> {
    info!("Updating project {}", project_id);
    
    let project_id_str = project_id.to_string();
    let mut args = vec!["project", "update", &project_id_str];

    // Only add supported update parameters
    if let Some(name) = &data.name {
        args.push("--name");
        args.push(name);
    }

    // Note: property_type and property_class are NOT supported by update command
    // They can only be set during project creation

    // Collect optional string values first
    let mut temp_strings = Vec::new();
    let mut budget_idx = None;
    let mut floor_idx = None;
    let mut sqft_idx = None;

    if let Some(budget) = data.budget {
        let budget_str = budget.to_string();
        temp_strings.push(budget_str);
        budget_idx = Some(temp_strings.len() - 1);
    }

    if let Some(description) = &data.description {
        args.push("--description");
        args.push(description);
    }

    if let Some(floors) = data.floors {
        let floors_str = floors.to_string();
        temp_strings.push(floors_str);
        floor_idx = Some(temp_strings.len() - 1);
    }

    if let Some(sqft) = data.sqft {
        let sqft_str = sqft.to_string();
        temp_strings.push(sqft_str);
        sqft_idx = Some(temp_strings.len() - 1);
    }

    // Add the budget arguments if present
    if let Some(idx) = budget_idx {
        args.push("--budget");
        args.push(&temp_strings[idx]);
    }

    // Add the floor arguments if present
    if let Some(idx) = floor_idx {
        args.push("--floors");
        args.push(&temp_strings[idx]);
    }

    // Add the sqft arguments if present
    if let Some(idx) = sqft_idx {
        args.push("--sqft");
        args.push(&temp_strings[idx]);
    }

    if let Some(address) = &data.address {
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
pub async fn delete_project(project_id: u32) -> Result<String, String> {
    info!("Deleting project {}", project_id);
    
    let project_id_str = project_id.to_string();
    let args = vec!["project", "delete", &project_id_str, "--force"];

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete project {}: {}", project_id, e))?;

    Ok(output)
}

/// Get all rooms for a project
#[command]
pub async fn get_rooms(project_id: u32) -> Result<String, String> {
    info!("Fetching rooms for project {}", project_id);
    
    let project_id_str = project_id.to_string();
    let output = execute_python_command(vec!["room", "list", &project_id_str])
        .await
        .map_err(|e| format!("Failed to get rooms for project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Add a room to a project
#[command]
pub async fn add_room(project_id: u32, data: RoomData) -> Result<String, String> {
    info!("Adding room {} to project {}", data.name, project_id);
    
    let project_id_str = project_id.to_string();
    let floor_str = data.floor.to_string();
    
    let mut args = vec![
        "room", "add",
        &project_id_str,
        &data.name,
        &floor_str
    ];

    // Collect optional string values first
    let mut temp_strings = Vec::new();
    let mut length_idx = None;
    let mut width_idx = None;
    let mut height_idx = None;
    let mut condition_idx = None;

    if let Some(length) = data.length {
        let length_str = length.to_string();
        temp_strings.push(length_str);
        length_idx = Some(temp_strings.len() - 1);
    }

    if let Some(width) = data.width {
        let width_str = width.to_string();
        temp_strings.push(width_str);
        width_idx = Some(temp_strings.len() - 1);
    }

    if let Some(height) = data.height {
        let height_str = height.to_string();
        temp_strings.push(height_str);
        height_idx = Some(temp_strings.len() - 1);
    }

    if let Some(condition) = data.condition {
        let condition_str = condition.to_string();
        temp_strings.push(condition_str);
        condition_idx = Some(temp_strings.len() - 1);
    }

    // Add all the optional arguments
    if let Some(idx) = length_idx {
        args.push("--length");
        args.push(&temp_strings[idx]);
    }

    if let Some(idx) = width_idx {
        args.push("--width");
        args.push(&temp_strings[idx]);
    }

    if let Some(idx) = height_idx {
        args.push("--height");
        args.push(&temp_strings[idx]);
    }

    if let Some(idx) = condition_idx {
        args.push("--condition");
        args.push(&temp_strings[idx]);
    }

    if let Some(notes) = &data.notes {
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
pub async fn delete_room(project_id: u32, room_name: String) -> Result<String, String> {
    info!("Deleting room {} from project {}", room_name, project_id);
    
    let project_id_str = project_id.to_string();
    let args = vec!["room", "delete", &project_id_str, &room_name, "--force"];

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete room {}: {}", room_name, e))?;

    Ok(output)
}

/// Get all expenses for a project
#[command]
pub async fn get_expenses(project_id: u32) -> Result<String, String> {
    info!("Fetching expenses for project {}", project_id);
    
    let project_id_str = project_id.to_string();
    let args = vec!["expense", "list", &project_id_str];

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to get expenses for project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Add an expense to a project
#[command]
pub async fn add_expense(project_id: u32, data: ExpenseData) -> Result<String, String> {
    info!("Adding expense to project {}", project_id);
    info!("Expense data: {:?}", data);
    
    let project_id_str = project_id.to_string();
    let cost_str = data.cost.to_string();
    
    let mut args = vec![
        "expense", "add",
        &project_id_str,
        &data.room_name,
        &data.category,
        &cost_str
    ];

    info!("Base command args: {:?}", args);

    // Collect optional string values first
    let mut temp_strings = Vec::new();
    let mut hours_idx = None;
    let mut condition_idx = None;

    if let Some(hours) = data.hours {
        if hours > 0.0 {
            let hours_str = hours.to_string();
            temp_strings.push(hours_str);
            hours_idx = Some(temp_strings.len() - 1);
        }
    }

    if let Some(condition) = data.condition {
        let condition_str = condition.to_string();
        temp_strings.push(condition_str);
        condition_idx = Some(temp_strings.len() - 1);
    }

    // Add optional arguments
    if let Some(idx) = hours_idx {
        args.push("--hours");
        args.push(&temp_strings[idx]);
    }

    if let Some(idx) = condition_idx {
        args.push("--condition");
        args.push(&temp_strings[idx]);
    }

    if let Some(notes) = &data.notes {
        if !notes.trim().is_empty() {
            args.push("--notes");
            args.push(notes);
        }
    }

    info!("Final command args: {:?}", args);

    let output = execute_python_command(args)
        .await
        .map_err(|e| {
            error!("Failed to execute expense add command: {}", e);
            format!("Failed to add expense: {}", e)
        })?;

    info!("Expense add output: {}", output);
    Ok(output)
}

/// Delete an expense
#[command]
pub async fn delete_expense(expense_id: u32) -> Result<String, String> {
    info!("Deleting expense {}", expense_id);
    
    let expense_id_str = expense_id.to_string();
    let args = vec!["expense", "delete", &expense_id_str, "--force"];

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to delete expense {}: {}", expense_id, e))?;

    Ok(output)
}

/// Update a room
#[command]
pub async fn update_room(
    project_id: u32, 
    room_name: String, 
    data: serde_json::Value
) -> Result<String, String> {
    info!("Updating room {} in project {}", room_name, project_id);
    
    let project_id_str = project_id.to_string();
    // Collect all string arguments first to avoid borrowing conflicts
    let mut string_args = Vec::new();
    let mut arg_pairs = Vec::new(); // Store (flag, value_index) pairs
    
    if let Some(new_name) = data.get("name").and_then(|v| v.as_str()) {
        string_args.push(new_name.to_string());
        arg_pairs.push(("--name", string_args.len() - 1));
    }
    
    if let Some(length) = data.get("length").and_then(|v| v.as_f64()) {
        string_args.push(length.to_string());
        arg_pairs.push(("--length", string_args.len() - 1));
    }
    
    if let Some(width) = data.get("width").and_then(|v| v.as_f64()) {
        string_args.push(width.to_string());
        arg_pairs.push(("--width", string_args.len() - 1));
    }
    
    if let Some(height) = data.get("height").and_then(|v| v.as_f64()) {
        string_args.push(height.to_string());
        arg_pairs.push(("--height", string_args.len() - 1));
    }
    
    if let Some(condition) = data.get("condition").and_then(|v| v.as_i64()) {
        string_args.push(condition.to_string());
        arg_pairs.push(("--condition", string_args.len() - 1));
    }
    
    if let Some(notes) = data.get("notes").and_then(|v| v.as_str()) {
        string_args.push(notes.to_string());
        arg_pairs.push(("--notes", string_args.len() - 1));
    }

    // Build the final args vector
    let mut args = vec!["room", "update", &project_id_str, &room_name];
    for (flag, value_index) in arg_pairs {
        args.push(flag);
        args.push(&string_args[value_index]);
    }

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to update room {}: {}", room_name, e))?;

    Ok(output)
}

/// Update an expense
#[command]
pub async fn update_expense(
    expense_id: u32, 
    data: serde_json::Value
) -> Result<String, String> {
    info!("Updating expense {}", expense_id);
    
    let expense_id_str = expense_id.to_string();
    // Collect all string arguments first to avoid borrowing conflicts
    let mut string_args = Vec::new();
    let mut arg_pairs = Vec::new(); // Store (flag, value_index) pairs
    
    if let Some(room_name) = data.get("room_name").and_then(|v| v.as_str()) {
        string_args.push(room_name.to_string());
        arg_pairs.push(("--room", string_args.len() - 1));
    }
    
    if let Some(category) = data.get("category").and_then(|v| v.as_str()) {
        string_args.push(category.to_string());
        arg_pairs.push(("--category", string_args.len() - 1));
    }
    
    if let Some(cost) = data.get("cost").and_then(|v| v.as_f64()) {
        string_args.push(cost.to_string());
        arg_pairs.push(("--cost", string_args.len() - 1));
    }
    
    if let Some(hours) = data.get("hours").and_then(|v| v.as_f64()) {
        string_args.push(hours.to_string());
        arg_pairs.push(("--hours", string_args.len() - 1));
    }
    
    if let Some(condition) = data.get("condition").and_then(|v| v.as_i64()) {
        string_args.push(condition.to_string());
        arg_pairs.push(("--condition", string_args.len() - 1));
    }
    
    if let Some(notes) = data.get("notes").and_then(|v| v.as_str()) {
        string_args.push(notes.to_string());
        arg_pairs.push(("--notes", string_args.len() - 1));
    }

    // Build the final args vector
    let mut args = vec!["expense", "update", &expense_id_str];
    for (flag, value_index) in arg_pairs {
        args.push(flag);
        args.push(&string_args[value_index]);
    }

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to update expense {}: {}", expense_id, e))?;

    Ok(output)
}

/// Get budget status for a project
#[command]
pub async fn get_budget_status(project_id: u32) -> Result<String, String> {
    info!("Fetching budget status for project {}", project_id);
    
    let project_id_str = project_id.to_string();
    let output = execute_python_command(vec!["budget", "status", &project_id_str])
        .await
        .map_err(|e| format!("Failed to get budget status for project {}: {}", project_id, e))?;
        
    Ok(output)
}

/// Export project data
#[command]
pub async fn export_project(project_id: u32, format: String) -> Result<String, String> {
    info!("Exporting project {} in {} format", project_id, format);
    
    let project_id_str = project_id.to_string();
    let args = vec!["export", "csv", &project_id_str];

    if format != "csv" {
        return Err("Only CSV export is currently supported".to_string());
    }

    let output = execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to export project {}: {}", project_id, e))?;

    Ok(output)
} 

/// Test expense addition with debug info
#[command]
pub async fn test_expense_add() -> Result<String, String> {
    info!("Testing expense addition with known good data");
    
    // Test with hardcoded values that we know work
    let test_data = ExpenseData {
        room_name: "Living Room".to_string(),
        category: "material".to_string(),
        cost: 100.0,
        hours: None,
        condition: Some(3),
        notes: Some("Test expense from Tauri".to_string()),
    };

    info!("Test data: {:?}", test_data);

    // Try to add to project 1 which we know exists
    add_expense(1, test_data).await
} 

/// Update project status quickly
#[command]
pub async fn update_project_status(project_id: u32, status: String) -> Result<String, String> {
    let project_id_str = project_id.to_string();
    let args = vec!["project", "update", &project_id_str, "--status", &status];
    
    execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to update project status: {}", e))
}

/// Update project priority quickly  
#[command]
pub async fn update_project_priority(project_id: u32, priority: String) -> Result<String, String> {
    let project_id_str = project_id.to_string();
    let args = vec!["project", "update", &project_id_str, "--priority", &priority];
    
    execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to update project priority: {}", e))
} 

/// Get all expenses across all projects
#[command]
pub async fn get_all_expenses() -> Result<String, String> {
    let args = vec!["expense", "list", "--all"];
    
    execute_python_command(args)
        .await
        .map_err(|e| format!("Failed to get all expenses: {}", e))
} 