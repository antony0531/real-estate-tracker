import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // Base path for GitHub Pages deployment
  base: mode === 'production' ? '/real-estate-tracker/' : '/',

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
  
  // Resolve aliases for easier imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // In production (PWA), replace Tauri imports with mocks
      ...(mode === 'production' ? {
        '@tauri-apps/api/tauri': path.resolve(__dirname, './src/mocks/tauri-mock.ts'),
        '@tauri-apps/api': path.resolve(__dirname, './src/mocks/tauri-mock.ts'),
      } : {})
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "lucide-react",
      "sonner"
    ],
  },

  // Build configuration
  build: {
    // Tauri supports es2021
    target: process.env.TAURI_PLATFORM == "windows" ? "chrome105" : "safari13",
    // don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // Copy service worker to output
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
  
  // PWA support
  publicDir: 'public',
}));