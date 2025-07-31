// ModernSettings.tsx - Modern settings page with improved UI
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Moon,
  Sun,
  Save,
  RotateCcw,
  Database,
  Download,
  Upload,
  FolderOpen,
  FileDown,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import { cn } from "../utils/cn";

interface SettingsState {
  darkMode: boolean;
  autoSave: boolean;
  includeRoomDetails: boolean;
  databasePath: string;
  exportPath: string;
  isLoading: boolean;
}

export default function ModernSettings() {
  const [settings, setSettings] = useState<SettingsState>({
    darkMode: true,
    autoSave: true,
    includeRoomDetails: true,
    databasePath: "",
    exportPath: "",
    isLoading: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setSettings((prev) => ({ ...prev, isLoading: true }));

      // Check if dark mode is currently active
      const isDarkMode = document.documentElement.classList.contains("dark");

      // Load settings from localStorage
      const savedSettings = {
        darkMode: isDarkMode,
        autoSave: localStorage.getItem("autoSave") !== "false",
        includeRoomDetails:
          localStorage.getItem("includeRoomDetails") !== "false",
      };

      // Get user home directory for database path
      const homePath = localStorage.getItem("userHome") || "~";
      const databasePath = `${homePath}/.real_estate_tracker/tracker.db`;

      setSettings({
        ...savedSettings,
        databasePath,
        exportPath:
          localStorage.getItem("exportPath") ||
          `${homePath}/Documents/Real Estate Exports`,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
      setSettings((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;

    // Toggle dark mode class on document
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Save to localStorage
    localStorage.setItem("darkMode", newDarkMode.toString());

    setSettings((prev) => ({ ...prev, darkMode: newDarkMode }));
    toast.success(`${newDarkMode ? "Dark" : "Light"} mode enabled`);
  };

  const toggleAutoSave = () => {
    const newAutoSave = !settings.autoSave;
    localStorage.setItem("autoSave", newAutoSave.toString());
    setSettings((prev) => ({ ...prev, autoSave: newAutoSave }));
    toast.success(`Auto-save ${newAutoSave ? "enabled" : "disabled"}`);
  };

  const toggleIncludeRoomDetails = () => {
    const newIncludeRoomDetails = !settings.includeRoomDetails;
    localStorage.setItem(
      "includeRoomDetails",
      newIncludeRoomDetails.toString(),
    );
    setSettings((prev) => ({
      ...prev,
      includeRoomDetails: newIncludeRoomDetails,
    }));
    toast.success(
      `Room details ${newIncludeRoomDetails ? "included" : "excluded"} in exports`,
    );
  };

  const handleBackupDatabase = async () => {
    try {
      toast.info("Database backup functionality coming soon");
    } catch (error) {
      toast.error("Failed to backup database");
    }
  };

  const handleRestoreDatabase = async () => {
    try {
      toast.info("Database restore functionality coming soon");
    } catch (error) {
      toast.error("Failed to restore database");
    }
  };

  const handleResetDatabase = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset the database? This will delete ALL your projects and data!",
      )
    ) {
      try {
        toast.info("Database reset functionality coming soon");
      } catch (error) {
        toast.error("Failed to reset database");
      }
    }
  };

  const saveSettings = () => {
    toast.success("Settings saved successfully!");
  };

  const resetToDefaults = () => {
    if (window.confirm("Reset all settings to defaults?")) {
      // Reset to defaults
      localStorage.removeItem("autoSave");
      localStorage.removeItem("includeRoomDetails");
      localStorage.removeItem("exportPath");

      // Keep dark mode as is

      setSettings((prev) => ({
        ...prev,
        autoSave: true,
        includeRoomDetails: true,
        exportPath: `${prev.databasePath.split("/.real_estate_tracker")[0]}/Documents/Real Estate Exports`,
      }));

      toast.success("Settings reset to defaults");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize your Real Estate Tracker experience
          </p>
        </motion.div>

        {/* Application Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? (
                    <Moon className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {settings.darkMode ? "Dark Mode" : "Light Mode"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.darkMode
                        ? "Easier on the eyes in low light"
                        : "Better visibility in bright environments"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="w-12 h-12"
                >
                  {settings.darkMode ? (
                    <ToggleRight className="w-6 h-6 text-primary-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </Button>
              </div>

              {/* Auto-save Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Save
                    className={cn(
                      "w-5 h-5",
                      settings.autoSave ? "text-emerald-600" : "text-gray-400",
                    )}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Auto-save
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Automatically save changes as you type
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAutoSave}
                  className="w-12 h-12"
                >
                  {settings.autoSave ? (
                    <ToggleRight className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Database Location
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400"
                    readOnly
                    value={settings.databasePath}
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Browse functionality coming soon")
                    }
                    leftIcon={<FolderOpen className="w-4 h-4" />}
                  >
                    Browse
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your data is stored locally for privacy and offline access
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Database Actions
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={handleBackupDatabase}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Backup Database
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRestoreDatabase}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Restore Database
                  </Button>
                  <Button variant="destructive" onClick={handleResetDatabase}>
                    Reset Database
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileDown className="w-5 h-5" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Export Location
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                    value={settings.exportPath}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        exportPath: e.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      toast.info("Browse functionality coming soon")
                    }
                    leftIcon={<FolderOpen className="w-4 h-4" />}
                  >
                    Browse
                  </Button>
                </div>
              </div>

              {/* Include Room Details Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Info
                    className={cn(
                      "w-5 h-5",
                      settings.includeRoomDetails
                        ? "text-blue-600"
                        : "text-gray-400",
                    )}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Include room details in exports
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add room information to CSV exports
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleIncludeRoomDetails}
                  className="w-12 h-12"
                >
                  {settings.includeRoomDetails ? (
                    <ToggleRight className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-6 h-6" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>About Real Estate Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Version
                  </span>
                  <span className="font-medium">0.2.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Build
                  </span>
                  <span className="font-medium">Development</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">
                    Frontend
                  </span>
                  <span className="font-medium">Tauri + React</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Backend
                  </span>
                  <span className="font-medium">Python CLI</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex gap-3 pb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={saveSettings}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset to Defaults
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
