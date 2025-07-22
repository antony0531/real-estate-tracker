use std::process::{Command, Stdio};
use serde::{Deserialize, Serialize};
use tokio::process::Command as TokioCommand;
use anyhow::{Result, anyhow};
use tracing::{debug, error, warn};

#[derive(Debug, Serialize, Deserialize)]
pub struct PythonInfo {
    pub version: String,
    pub executable: String,
    pub has_backend: bool,
}

/// Find Python executable path
#[tauri::command]
pub async fn get_python_path() -> Result<String, String> {
    // First try to find the virtual environment Python
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    let backend_dir = current_dir.join("../backend");
    
    // Try virtual environment Python first (Windows)
    let venv_python = backend_dir.join("venv/Scripts/python.exe");
    if venv_python.exists() {
        if let Ok(output) = Command::new(&venv_python).arg("--version").output() {
            if output.status.success() {
                return Ok(venv_python.to_string_lossy().to_string());
            }
        }
    }
    
    // Try virtual environment Python (Unix-like)
    let venv_python_unix = backend_dir.join("venv/bin/python");
    if venv_python_unix.exists() {
        if let Ok(output) = Command::new(&venv_python_unix).arg("--version").output() {
            if output.status.success() {
                return Ok(venv_python_unix.to_string_lossy().to_string());
            }
        }
    }
    
    // Fallback to system Python
    let possible_names = vec!["python", "python3", "py"];
    
    for name in possible_names {
        if let Ok(output) = Command::new(name)
            .arg("--version")
            .output() 
        {
            if output.status.success() {
                return Ok(name.to_string());
            }
        }
    }
    
    Err("Python not found in PATH or virtual environment".to_string())
}

/// Check if Python installation is valid and has required dependencies
#[tauri::command]
pub async fn check_python_installation() -> Result<PythonInfo, String> {
    let python_cmd = get_python_path().await?;
    
    // Get Python version
    let version_output = Command::new(&python_cmd)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to get Python version: {}", e))?;
        
    let version = String::from_utf8_lossy(&version_output.stdout)
        .trim()
        .to_string();

    // Check if backend is available by testing our CLI module
    let backend_path = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?
        .join("../backend");
        
    let backend_check = Command::new(&python_cmd)
        .current_dir(&backend_path)
        .args(["-m", "src.cli", "--help"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .map_err(|e| format!("Failed to check backend: {}", e))?;

    Ok(PythonInfo {
        version,
        executable: python_cmd,
        has_backend: backend_check.success(),
    })
}

/// Execute a Python CLI command and return the result
pub async fn execute_python_command(args: Vec<&str>) -> Result<String> {
    let python_path = get_python_path().await
        .map_err(|e| anyhow!("Python not found: {}", e))?;
    
    debug!("Executing Python command: {} {:?}", python_path, args);
    
    // Change to backend directory for execution
    let backend_path = std::env::current_dir()?
        .join("../backend");
        
    let mut cmd = TokioCommand::new(&python_path);
    cmd.current_dir(&backend_path)
        .args(["-m", "src.cli"])
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
        
    let output = cmd.output().await?;
    
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        debug!("Python command success: {}", stdout);
        Ok(stdout.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        error!("Python command failed: {}", stderr);
        Err(anyhow!("Python command failed: {}", stderr))
    }
}

/// Execute a Python CLI command with JSON output parsing
pub async fn execute_python_json_command<T>(args: Vec<&str>) -> Result<T> 
where
    T: for<'de> Deserialize<'de>,
{
    let output = execute_python_command(args).await?;
    
    // Try to parse JSON from output
    // The CLI might have other output, so we look for JSON lines
    for line in output.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with('{') || trimmed.starts_with('[') {
            match serde_json::from_str::<T>(trimmed) {
                Ok(result) => return Ok(result),
                Err(e) => {
                    warn!("Failed to parse JSON line: {} - Error: {}", trimmed, e);
                    continue;
                }
            }
        }
    }
    
    Err(anyhow!("No valid JSON found in Python output: {}", output))
}

/// Parse CLI text output into structured data
pub fn parse_cli_output(output: &str) -> Result<serde_json::Value> {
    // For now, return the output as-is wrapped in a JSON object
    // In the future, we could parse specific CLI output formats
    Ok(serde_json::json!({
        "success": true,
        "output": output.trim(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_python_detection() {
        let result = get_python_path().await;
        println!("Python path result: {:?}", result);
        // Don't assert here since Python might not be available in test environment
    }
    
    #[tokio::test]
    async fn test_python_info() {
        if let Ok(info) = check_python_installation().await {
            println!("Python info: {:?}", info);
        }
    }
} 