// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod python;
mod database;

use tauri::{Manager, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem, CustomMenuItem};
use tracing::{info, error};
use tracing_subscriber;

fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    info!("Starting Real Estate Tracker Desktop Application");

    // Create system tray menu
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    tauri::Builder::default()
        .system_tray(tauri::SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                let window = app.get_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                    "hide" => {
                        let window = app.get_window("main").unwrap();
                        window.hide().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_info,
            commands::initialize_database,
            commands::get_projects,
            commands::get_project,
            commands::create_project,
            commands::update_project,
            commands::delete_project,
            commands::get_rooms,
            commands::add_room,
            commands::delete_room,
            commands::get_expenses,
            commands::add_expense,
            commands::delete_expense,
            commands::get_budget_status,
            commands::export_project,
            python::get_python_path,
            python::check_python_installation,
            python::debug_python_paths,
            python::test_python_execution,
            commands::test_expense_add
        ])
        .setup(|app| {
            // Initialize app data directory using Tauri's runtime
            let app_handle = app.handle();
            let app_handle_clone = app_handle.clone();
            
            // Use Tauri's async runtime instead of tokio::spawn
            tauri::async_runtime::spawn(async move {
                if let Err(e) = database::initialize_app_data().await {
                    error!("Failed to initialize app data: {}", e);
                }
            });

            // Check Python installation on startup
            tauri::async_runtime::spawn(async move {
                match python::check_python_installation().await {
                    Ok(info) => {
                        info!("Python installation found: {:?}", info);
                    }
                    Err(e) => {
                        error!("Python installation check failed: {}", e);
                        // Could show a dialog to user here
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // Hide to system tray instead of closing
                event.window().hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
} 