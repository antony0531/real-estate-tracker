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

#[derive(Debug, Serialize, Deserialize)]
pub struct DebugInfo {
    pub current_dir: String,
    pub backend_dir: String,
    pub backend_dir_exists: bool,
    pub venv_python_path: String,
    pub venv_python_exists: bool,
    pub found_python_path: Option<String>,
}

/// Debug command to troubleshoot path issues
#[tauri::command]
pub async fn debug_python_paths() -> Result<DebugInfo, String> {
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    
    let backend_dir = current_dir.join("../../backend");
    let venv_python = backend_dir.join("venv/Scripts/python.exe");
    
    let found_python = get_python_path().await.ok();
    
    Ok(DebugInfo {
        current_dir: current_dir.to_string_lossy().to_string(),
        backend_dir: backend_dir.to_string_lossy().to_string(),
        backend_dir_exists: backend_dir.exists(),
        venv_python_path: venv_python.to_string_lossy().to_string(),
        venv_python_exists: venv_python.exists(),
        found_python_path: found_python,
    })
}

/// Test Python command execution with detailed logging
#[tauri::command]
pub async fn test_python_execution() -> Result<String, String> {
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    
    let backend_dir = current_dir.join("../../backend");
    let venv_python = backend_dir.join("venv/Scripts/python.exe");
    
    let mut output = String::new();
    output.push_str(&format!("Current dir: {}\n", current_dir.to_string_lossy()));
    output.push_str(&format!("Backend dir: {}\n", backend_dir.to_string_lossy()));
    output.push_str(&format!("Backend exists: {}\n", backend_dir.exists()));
    output.push_str(&format!("Venv python: {}\n", venv_python.to_string_lossy()));
    output.push_str(&format!("Venv exists: {}\n", venv_python.exists()));
    
    // Try to execute Python command
    if venv_python.exists() {
        use tokio::process::Command as TokioCommand;
        use std::process::Stdio;
        
        let mut cmd = TokioCommand::new(&venv_python);
        cmd.current_dir(&backend_dir)
           .args(["-m", "src.cli", "project", "list"])
           .stdout(Stdio::piped())
           .stderr(Stdio::piped());
           
        match cmd.output().await {
            Ok(command_output) => {
                let stdout = String::from_utf8_lossy(&command_output.stdout);
                let stderr = String::from_utf8_lossy(&command_output.stderr);
                
                output.push_str(&format!("Command success: {}\n", command_output.status.success()));
                output.push_str(&format!("Stdout: {}\n", stdout.lines().count()));
                output.push_str(&format!("Stderr: {}\n", stderr));
                
                if !stdout.is_empty() {
                    output.push_str(&format!("Sample output: {}\n", 
                        stdout.lines().take(3).collect::<Vec<_>>().join(" | ")));
                }
            }
            Err(e) => {
                output.push_str(&format!("Command failed: {}\n", e));
            }
        }
    } else {
        output.push_str("Venv python not found\n");
    }
    
    Ok(output)
}

/// Find Python executable path
#[tauri::command]
pub async fn get_python_path() -> Result<String, String> {
    // First try to find the virtual environment Python
    let current_dir = std::env::current_dir()
        .map_err(|e| format!("Failed to get current directory: {}", e))?;
    let backend_dir = current_dir.join("../../backend");
    
    // Try virtual environment Python first (Windows)
    let venv_python = backend_dir.join("venv/Scripts/python.exe");
    if venv_python.exists() {
        if let Ok(output) = Command::new(&venv_python)
            .arg("--version")
            .env("PYTHONIOENCODING", "utf-8")
            .env("PYTHONUTF8", "1")
            .output() {
            if output.status.success() {
                return Ok(venv_python.to_string_lossy().to_string());
            }
        }
    }
    
    // Try virtual environment Python (Unix-like)
    let venv_python_unix = backend_dir.join("venv/bin/python");
    if venv_python_unix.exists() {
        if let Ok(output) = Command::new(&venv_python_unix)
            .arg("--version")
            .env("PYTHONIOENCODING", "utf-8")
            .env("PYTHONUTF8", "1")
            .output() {
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
            .env("PYTHONIOENCODING", "utf-8")
            .env("PYTHONUTF8", "1")
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
        .env("PYTHONIOENCODING", "utf-8")
        .env("PYTHONUTF8", "1")
        .output()
        .map_err(|e| format!("Failed to get Python version: {}", e))?;
        
    let version = String::from_utf8_lossy(&version_output.stdout)
        .trim()
        .to_string();

    // Check if backend is available by testing our CLI module
    // If we found a virtual environment Python, derive the backend path from it
    let backend_check = if python_cmd.contains("backend") {
        // We found venv Python, extract backend directory
        let venv_path = std::path::Path::new(&python_cmd);
        let backend_dir = venv_path.parent()
            .and_then(|p| p.parent()) // Remove "Scripts" 
            .and_then(|p| p.parent()) // Remove "venv"
            .unwrap_or_else(|| std::path::Path::new("."));
            
        debug!("Using backend directory derived from venv: {:?}", backend_dir);
        
        Command::new(&python_cmd)
            .current_dir(backend_dir)
            .args(["-m", "src.cli", "--help"])
            .env("PYTHONIOENCODING", "utf-8")
            .env("PYTHONUTF8", "1")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|e| format!("Failed to check backend: {}", e))?
    } else {
        // Using system Python, try a simple test
        debug!("Using system Python, doing simple import test");
        
        Command::new(&python_cmd)
            .args(["-c", "import typer; print('Backend available')"])
            .env("PYTHONIOENCODING", "utf-8")
            .env("PYTHONUTF8", "1")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .map_err(|e| format!("Failed to check backend: {}", e))?
    };

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
    
    // Determine backend directory based on Python path
    let mut cmd = TokioCommand::new(&python_path);
    
    if python_path.contains("backend") {
        // We're using venv Python, derive backend directory and set up environment
        let venv_path = std::path::Path::new(&python_path);
        let venv_dir = venv_path.parent()
            .and_then(|p| p.parent()) // Remove "Scripts" to get to venv root
            .unwrap_or_else(|| std::path::Path::new("."));
        let backend_dir = venv_dir.parent() // Remove "venv" to get to backend
            .unwrap_or_else(|| std::path::Path::new("."));
            
        debug!("Python path: {}", python_path);
        debug!("Venv path: {:?}", venv_path);
        debug!("Venv directory: {:?}", venv_dir);
        debug!("Backend directory: {:?}", backend_dir);
        debug!("Backend directory exists: {}", backend_dir.exists());
        
        // Set up virtual environment
        cmd.current_dir(backend_dir);
        cmd.env("VIRTUAL_ENV", venv_dir);
        cmd.env("PATH", format!("{};{}", 
                 venv_path.parent().unwrap_or_else(|| std::path::Path::new(".")).display(),
                 std::env::var("PATH").unwrap_or_default()));
        
        // Fix Windows encoding issues with Unicode characters (emojis, etc.)
        cmd.env("PYTHONIOENCODING", "utf-8");
        cmd.env("PYTHONUTF8", "1");
        
        // Ensure Python can find the modules
        if let Some(backend_str) = backend_dir.to_str() {
            cmd.env("PYTHONPATH", backend_str);
            debug!("Set PYTHONPATH to: {}", backend_str);
        }
        
        // Log the full command we're about to execute
        debug!("Full command: {:?} in directory {:?}", 
               format!("{} -m src.cli {}", python_path, args.join(" ")), 
               backend_dir);
    } else {
        // Using system Python, try relative path fallback
        debug!("Using system Python, setting current dir to ../../backend");
        cmd.current_dir("../../backend");
        
        // Fix Windows encoding issues with Unicode characters (emojis, etc.)
        cmd.env("PYTHONIOENCODING", "utf-8");
        cmd.env("PYTHONUTF8", "1");
    }
    
    cmd.args(["-m", "src.cli"])
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());
        
    debug!("About to execute command with args: {:?}", args);
    let output = cmd.output().await?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    debug!("Command exit status: {}", output.status);
    debug!("Command stdout length: {}", stdout.len());
    debug!("Command stderr length: {}", stderr.len());
    
    if stdout.len() > 0 {
        debug!("Command stdout (first 500 chars): {}", &stdout[..stdout.len().min(500)]);
    }
    if stderr.len() > 0 {
        debug!("Command stderr: {}", stderr);
    }
    
    if output.status.success() {
        debug!("Python command success");
        Ok(stdout.to_string())
    } else {
        error!("Python command failed with status: {}", output.status);
        error!("Python command stderr: {}", stderr);
        error!("Python command stdout: {}", stdout);
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