use std::path::PathBuf;
use anyhow::{Result, anyhow};
use tokio::fs;
use tracing::info;

/// Get the application data directory
pub fn get_app_data_dir() -> Result<PathBuf> {
    let app_dir = dirs::data_dir()
        .ok_or_else(|| anyhow!("Could not determine data directory"))?
        .join("real-estate-tracker");
        
    Ok(app_dir)
}

/// Get the database file path
pub fn get_database_path() -> Result<PathBuf> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("tracker.db"))
}

/// Get the exports directory path
pub fn get_exports_dir() -> Result<PathBuf> {
    let app_dir = get_app_data_dir()?;
    Ok(app_dir.join("exports"))
}

/// Initialize application data directories
pub async fn initialize_app_data() -> Result<()> {
    let app_dir = get_app_data_dir()?;
    let exports_dir = get_exports_dir()?;
    
    info!("Initializing app data directory: {:?}", app_dir);
    
    // Create directories if they don't exist
    if !app_dir.exists() {
        fs::create_dir_all(&app_dir).await
            .map_err(|e| anyhow!("Failed to create app data directory: {}", e))?;
        info!("Created app data directory");
    }
    
    if !exports_dir.exists() {
        fs::create_dir_all(&exports_dir).await
            .map_err(|e| anyhow!("Failed to create exports directory: {}", e))?;
        info!("Created exports directory");
    }
    
    // Set up any default configuration files if needed
    let config_file = app_dir.join("config.json");
    if !config_file.exists() {
        let default_config = serde_json::json!({
            "version": "0.2.0",
            "first_run": true,
            "theme": "auto",
            "auto_backup": false,
            "backup_frequency": "weekly"
        });
        
        fs::write(&config_file, serde_json::to_string_pretty(&default_config)?)
            .await
            .map_err(|e| anyhow!("Failed to create config file: {}", e))?;
        
        info!("Created default configuration file");
    }
    
    info!("App data initialization complete");
    Ok(())
}

/// Clean up temporary files and perform maintenance
pub async fn cleanup_app_data() -> Result<()> {
    let app_dir = get_app_data_dir()?;
    let temp_dir = app_dir.join("temp");
    
    if temp_dir.exists() {
        fs::remove_dir_all(&temp_dir).await
            .map_err(|e| anyhow!("Failed to clean temp directory: {}", e))?;
        info!("Cleaned up temporary files");
    }
    
    Ok(())
}

/// Get application configuration
pub async fn get_app_config() -> Result<serde_json::Value> {
    let app_dir = get_app_data_dir()?;
    let config_file = app_dir.join("config.json");
    
    if config_file.exists() {
        let content = fs::read_to_string(&config_file).await
            .map_err(|e| anyhow!("Failed to read config file: {}", e))?;
            
        let config: serde_json::Value = serde_json::from_str(&content)
            .map_err(|e| anyhow!("Failed to parse config file: {}", e))?;
            
        Ok(config)
    } else {
        // Return default config
        Ok(serde_json::json!({
            "version": "0.2.0",
            "first_run": true,
            "theme": "auto",
            "auto_backup": false,
            "backup_frequency": "weekly"
        }))
    }
}

/// Update application configuration
pub async fn update_app_config(config: serde_json::Value) -> Result<()> {
    let app_dir = get_app_data_dir()?;
    let config_file = app_dir.join("config.json");
    
    fs::write(&config_file, serde_json::to_string_pretty(&config)?)
        .await
        .map_err(|e| anyhow!("Failed to write config file: {}", e))?;
        
    info!("Updated application configuration");
    Ok(())
}

/// Check if this is the first run of the application
pub async fn is_first_run() -> bool {
    match get_app_config().await {
        Ok(config) => config.get("first_run").and_then(|v| v.as_bool()).unwrap_or(true),
        Err(_) => true,
    }
}

/// Mark that the first run setup is complete
pub async fn complete_first_run_setup() -> Result<()> {
    let mut config = get_app_config().await?;
    config["first_run"] = serde_json::Value::Bool(false);
    update_app_config(config).await?;
    info!("First run setup completed");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_app_data_dir() {
        let dir = get_app_data_dir();
        assert!(dir.is_ok());
        println!("App data dir: {:?}", dir.unwrap());
    }
    
    #[tokio::test]
    async fn test_config_operations() {
        let config = get_app_config().await;
        assert!(config.is_ok());
        println!("Config: {:?}", config.unwrap());
    }
} 