import { TauriService } from "../services/tauri";

/**
 * Debug utility to test project loading directly
 */
export const testProjectLoading = async () => {
  console.log("🔍 [DEBUG] Testing project loading...");

  try {
    const rawOutput = await TauriService.getProjects();
    console.log("📄 [DEBUG] Raw CLI output:");
    console.log(rawOutput);
    console.log("📄 [DEBUG] Output length:", rawOutput.length);
    console.log("📄 [DEBUG] Output type:", typeof rawOutput);

    if (!rawOutput.trim()) {
      console.log("⚠️ [DEBUG] Empty output received from backend");
      return { success: false, error: "Empty output from backend" };
    }

    const lines = rawOutput.trim().split("\n");
    console.log("📝 [DEBUG] Split into", lines.length, "lines:");
    lines.forEach((line, index) => {
      console.log(`📝 [DEBUG] Line ${index + 1}:`, JSON.stringify(line));
    });

    // Test parsing
    const dataLines = lines.filter(
      (line) => line.startsWith("│") && line.includes("$"),
    );
    console.log("🔍 [DEBUG] Found", dataLines.length, "data lines");

    dataLines.forEach((line, index) => {
      const columns = line
        .split("│")
        .map((col) => col.trim())
        .filter((col) => col);
      console.log(`🔍 [DEBUG] Data line ${index + 1} columns:`, columns);
    });

    return { success: true, lines: dataLines.length };
  } catch (error) {
    console.error("❌ [DEBUG] Error testing project loading:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Call this from browser console to debug project loading
 */
declare global {
  interface Window {
    debugProjectLoading: typeof testProjectLoading;
  }
}

// Make it available globally for debugging
if (typeof window !== "undefined") {
  window.debugProjectLoading = testProjectLoading;
}
