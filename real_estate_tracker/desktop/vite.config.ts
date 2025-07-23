import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Vite options tailored for Tauri development
  clearScreen: false,
  
  // Tauri expects a fixed port for development
  server: {
    port: 9876,
    strictPort: true,
    // Host to allow external connections (important for Tauri)
    host: '0.0.0.0',
    // Disable HMR in Tauri for better stability
    hmr: {
      port: 9877,
    },
  },

  // Environment variables available to the frontend
  envPrefix: ['VITE_', 'TAURI_'],

  // Build configuration
  build: {
    // Tauri supports es2021
    target: 'es2021',
    // Minify for production
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Generate sourcemaps for debugging
    sourcemap: !!process.env.TAURI_DEBUG,
  },

  // Path resolution for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },

  // CSS preprocessing
  css: {
    postcss: './postcss.config.js',
  },
})