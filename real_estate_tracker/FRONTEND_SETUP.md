# 🖥️ Desktop Frontend Setup Guide
## React + TypeScript + Tauri Implementation

This document provides a comprehensive guide for setting up and working with the desktop frontend of the Real Estate Tracker application.

---

## 📚 **Table of Contents**
- [Quick Setup](#quick-setup)
- [Architecture Overview](#architecture-overview)
- [Dependency Installation](#dependency-installation)
- [Development Workflow](#development-workflow)
- [Common Issues & Solutions](#common-issues--solutions)
- [Component Structure](#component-structure)
- [State Management](#state-management)
- [Tauri Integration](#tauri-integration)
- [Testing Strategy](#testing-strategy)
- [Build & Distribution](#build--distribution)

---

## 🚀 **Quick Setup**

### **Prerequisites**
```bash
# Required versions
Node.js >= 18.0.0
npm >= 8.0.0
Rust >= 1.70.0

# Check versions
node --version
npm --version
rustc --version
```

### **Installation Steps**
```bash
# 1. Navigate to desktop directory
cd real_estate_tracker/desktop

# 2. Install Node.js dependencies
npm install

# 3. Install Tauri CLI (if not already installed)
npm install -g @tauri-apps/cli

# 4. Verify setup
npm run type-check
npm run lint

# 5. Start development server
npm run tauri:dev
```

**⚠️ IMPORTANT SETUP NOTES:**
- **Linter Errors During Setup**: TypeScript will show import errors until all files are created and dependencies installed. This is normal and expected.
  - ❌ `Cannot find module 'react'` - React not installed yet
  - ❌ `Cannot find module '@/components/Layout'` - Component files not created yet  
  - ❌ `JSX element implicitly has type 'any'` - React types not installed yet
  - ✅ **These ALL resolve after running `npm install`**
- **Rust Compilation**: First run takes 5-10 minutes as Rust dependencies compile
- **Port Conflicts**: Vite uses port 1420 - ensure it's available
- **Windows Users**: May need to install Visual Studio Build Tools for Rust compilation

---

## 🏗️ **Architecture Overview**

### **Technology Stack**
```typescript
// Frontend Framework
React 18.2+         // UI library with hooks and concurrent features
TypeScript 5.2+     // Type safety and better DX
Vite 4.5+          // Fast build tool and dev server

// State Management  
Zustand 4.4+       // Lightweight state management
React Query 5.8+   // Server state and caching

// UI & Styling
Tailwind CSS 3.3+  // Utility-first CSS framework
Radix UI           // Headless UI primitives
Lucide React       // Beautiful icons
Sonner             // Toast notifications

// Tauri Integration
@tauri-apps/api    // Tauri API bindings
Rust IPC           // Inter-process communication

// Development Tools
ESLint + Prettier  // Code linting and formatting
Vitest             // Fast unit testing
React Query Dev    // Development tools
```

### **Project Structure**
```
desktop/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   │   ├── ui/             # Basic UI primitives (Button, Input, etc.)
│   │   ├── project/        # Project-specific components
│   │   ├── expense/        # Expense-related components
│   │   └── budget/         # Budget analysis components
│   ├── pages/              # Route-level components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── ProjectView.tsx # Project details page
│   │   └── Settings.tsx    # App settings
│   ├── hooks/              # Custom React hooks
│   │   ├── useProjects.ts  # Project data hooks
│   │   ├── useExpenses.ts  # Expense data hooks
│   │   └── useTauri.ts     # Tauri API hooks
│   ├── services/           # API service layer
│   │   ├── tauri.ts        # Tauri command wrappers
│   │   ├── projects.ts     # Project API calls
│   │   └── storage.ts      # Local storage utilities
│   ├── stores/             # Zustand state stores
│   │   ├── appStore.ts     # Global app state
│   │   ├── projectStore.ts # Project state
│   │   └── uiStore.ts      # UI state (theme, sidebar, etc.)
│   ├── types/              # TypeScript type definitions
│   │   ├── index.ts        # Main type exports
│   │   ├── project.ts      # Project-related types
│   │   └── tauri.ts        # Tauri-specific types
│   └── utils/              # Utility functions
│       ├── format.ts       # Formatting helpers
│       ├── validation.ts   # Form validation
│       └── constants.ts    # App constants
├── src-tauri/              # Rust Tauri backend
├── public/                 # Static assets
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

---

## 📦 **Dependency Installation**

### **Expected Installation Process**
```bash
npm install
# ✅ Installing 50+ packages...
# ⏱️  This takes 2-3 minutes on first install
# 🔧 Builds native dependencies (if any)
# ✅ Installation complete!
```

### **Common Installation Issues**

#### **1. Node Version Mismatch**
```bash
# ERROR: Node version 16.x not supported
# SOLUTION: Upgrade to Node 18+
nvm install 18
nvm use 18
npm install
```

#### **2. Rust Not Found**
```bash
# ERROR: Rust compiler not found
# SOLUTION: Install Rust toolchain
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
rustc --version
```

#### **3. Permission Errors (Windows)**
```bash
# ERROR: EACCES permission denied
# SOLUTION: Run PowerShell as Administrator
# Or fix npm permissions:
npm config set cache C:\tmp\npm-cache --global
```

#### **4. Network Issues**
```bash
# ERROR: Network timeout during install
# SOLUTION: Use different registry or proxy
npm install --registry https://registry.npmjs.org/
# Or use offline mode if packages are cached
npm install --offline
```

---

## 🔄 **Development Workflow**

### **Starting Development**
```bash
# Terminal 1: Start Vite dev server
npm run dev
# Vite dev server running at http://localhost:1420

# Terminal 2: Start Tauri dev server (includes Vite)
npm run tauri:dev
# This opens the desktop app window
# Includes hot reload for both Rust and TypeScript
```

### **Available Scripts**
```bash
# Development
npm run dev              # Start Vite dev server only
npm run tauri:dev        # Start full Tauri development mode

# Building
npm run build           # Build frontend for production
npm run tauri:build     # Build entire Tauri application

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run type-check      # Run TypeScript compiler check
npm run format          # Format code with Prettier

# Testing
npm run test            # Run unit tests with Vitest
npm run test:ui         # Run tests with UI interface

# Preview
npm run preview         # Preview production build locally
```

### **Hot Reload Behavior**
- **TypeScript/React Changes**: Instant hot reload in < 1 second
- **CSS Changes**: Instant style updates without page reload
- **Rust Changes**: Full app restart (takes 10-30 seconds to recompile)
- **Tauri Config Changes**: Requires full restart

---

## 🚨 **Common Issues & Solutions**

### **1. Linter Errors During Setup**

**❌ Problem:**
```typescript
Cannot find module '@/components/Layout' or its corresponding type declarations.
```

**🔍 Root Cause:** Files haven't been created yet, or path aliases not working.

**✅ Solution:**
```bash
# 1. Create missing files (see component structure below)
# 2. Verify tsconfig.json path mapping
# 3. Restart TypeScript language server in VSCode
#    Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

### **2. Tauri Commands Not Working**

**❌ Problem:**
```typescript
Error: Command 'get_projects' not found
```

**🔍 Root Cause:** Rust backend not running or commands not registered.

**✅ Solution:**
```rust
// In src-tauri/src/main.rs - ensure command is registered:
.invoke_handler(tauri::generate_handler![
    get_projects,  // Make sure this matches the function name
    // ... other commands
])
```

### **3. CORS Issues in Development**

**❌ Problem:**
```
Access to fetch blocked by CORS policy
```

**🔍 Root Cause:** Vite dev server and Tauri using different ports.

**✅ Solution:**
```typescript
// vite.config.ts - ensure correct configuration
server: {
  port: 1420,
  strictPort: true,
  host: '0.0.0.0', // Important for Tauri
}
```

### **4. Build Failures**

**❌ Problem:**
```bash
npm run build
# ERROR: Build failed with 5 errors
```

**🔍 Common Causes & Solutions:**
```bash
# TypeScript errors
npm run type-check  # Fix type errors first

# Missing dependencies
npm install  # Reinstall if package-lock.json changed

# Rust compilation errors
cd src-tauri && cargo check  # Check Rust code separately
```

### **5. Slow Development Startup**

**❌ Problem:** `npm run tauri:dev` takes 5+ minutes to start.

**✅ Solutions:**
```bash
# 1. Use incremental compilation (already enabled in our config)
# 2. Close other resource-intensive applications
# 3. Use SSD storage for better I/O performance
# 4. Increase RAM if possible (Rust compilation is memory-intensive)

# For subsequent starts (much faster):
cargo build  # Pre-compile Rust dependencies
```

---

## 🧩 **Component Structure**

### **Component Categories**

#### **1. Layout Components** (`/components/layout/`)
```typescript
// Layout.tsx - Main app layout with sidebar and header
export interface LayoutProps {
  children: React.ReactNode
  appInfo: AppInfo | null
}

// Header.tsx - Top navigation bar
export interface HeaderProps {
  appInfo: AppInfo | null
  onToggleSidebar: () => void
}

// Sidebar.tsx - Left navigation sidebar
export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}
```

#### **2. UI Primitives** (`/components/ui/`)
```typescript
// Button.tsx - Reusable button component
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline'
  size: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

// Input.tsx - Form input component
export interface InputProps {
  label?: string
  error?: string
  helper?: string
  icon?: React.ReactNode
}
```

#### **3. Business Logic Components** (`/components/project/`, `/components/expense/`)
```typescript
// ProjectCard.tsx - Project overview card
export interface ProjectCardProps {
  project: Project
  onSelect: (id: number) => void
}

// ExpenseForm.tsx - Add/edit expense form
export interface ExpenseFormProps {
  projectId: number
  onSubmit: (expense: ExpenseData) => void
  onCancel: () => void
}
```

---

## 🗃️ **State Management**

### **Zustand Store Pattern**
```typescript
// stores/projectStore.ts
interface ProjectState {
  // Data
  projects: Project[]
  selectedProject: Project | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchProjects: () => Promise<void>
  selectProject: (id: number) => void
  createProject: (data: ProjectData) => Promise<void>
  updateProject: (id: number, data: Partial<ProjectData>) => Promise<void>
  deleteProject: (id: number) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projects = await invoke<Project[]>('get_projects')
      set({ projects, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  // ... other actions
}))
```

### **React Query Integration**
```typescript
// hooks/useProjects.ts
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const result = await invoke<string>('get_projects')
      // Parse CLI output or return structured data
      return parseProjectsOutput(result)
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: ProjectData) => {
      return await invoke<string>('create_project', { data })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`)
    },
  })
}
```

---

## 🔌 **Tauri Integration**

### **Command Wrapper Pattern**
```typescript
// services/tauri.ts
export class TauriService {
  // Project operations
  static async getProjects(): Promise<Project[]> {
    try {
      const result = await invoke<string>('get_projects')
      return this.parseCliOutput(result)
    } catch (error) {
      throw new Error(`Failed to get projects: ${error}`)
    }
  }
  
  static async createProject(data: ProjectData): Promise<Project> {
    try {
      const result = await invoke<string>('create_project', { data })
      return this.parseProjectOutput(result)
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`)
    }
  }
  
  // Helper to parse CLI output
  private static parseCliOutput(output: string): any {
    // Parse Rich CLI output to extract data
    // This is where we handle the CLI text output
    // and convert it to structured data
  }
}
```

### **Error Handling Strategy**
```typescript
// utils/errorHandler.ts
export const handleTauriError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  // Handle Tauri-specific errors
  if (error && typeof error === 'object' && 'message' in error) {
    return error.message as string
  }
  
  return 'An unexpected error occurred'
}
```

---

## 🧪 **Testing Strategy**

### **Component Testing with Vitest**
```typescript
// components/__tests__/ProjectCard.test.tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import ProjectCard from '../ProjectCard'

describe('ProjectCard', () => {
  const mockProject = {
    id: 1,
    name: 'Test Project',
    budget: 150000,
    // ... other properties
  }
  
  it('displays project information correctly', () => {
    const onSelect = vi.fn()
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('$150,000')).toBeInTheDocument()
  })
  
  it('calls onSelect when clicked', async () => {
    const onSelect = vi.fn()
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />)
    
    await screen.getByRole('button').click()
    expect(onSelect).toHaveBeenCalledWith(1)
  })
})
```

### **Tauri Command Mocking**
```typescript
// tests/setup.ts
import { vi } from 'vitest'

// Mock Tauri API for testing
vi.mock('@tauri-apps/api/tauri', () => ({
  invoke: vi.fn(),
}))

// Mock implementations
const mockInvoke = vi.mocked(invoke)

mockInvoke.mockImplementation((command: string, args?: any) => {
  switch (command) {
    case 'get_projects':
      return Promise.resolve('[mock project list output]')
    case 'create_project':
      return Promise.resolve('[mock create project output]')
    default:
      return Promise.reject(new Error(`Unknown command: ${command}`))
  }
})
```

---

## 📦 **Build & Distribution**

### **Development Build**
```bash
npm run build
# Creates optimized frontend build
# Output: dist/ directory

npm run tauri:build
# Creates complete desktop application
# Output: src-tauri/target/release/bundle/
```

### **Production Build Outputs**
```
src-tauri/target/release/bundle/
├── dmg/                    # macOS installer
│   └── Real Estate Tracker_0.2.0_x64.dmg
├── deb/                    # Linux Debian package
│   └── real-estate-tracker_0.2.0_amd64.deb
└── msi/                    # Windows installer
    └── Real Estate Tracker_0.2.0_x64_en-US.msi
```

### **Build Optimization**
```typescript
// vite.config.ts production optimizations
build: {
  target: 'es2021',
  minify: 'esbuild',          // Fast minification
  sourcemap: false,           # Disable in production
  rollupOptions: {
    output: {
      manualChunks: {         # Code splitting
        vendor: ['react', 'react-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        charts: ['recharts'],
      },
    },
  },
}
```

---

## 🎯 **Next Steps**

### **Immediate Tasks**
1. **Install Dependencies**: Run `npm install` to resolve linter errors
2. **Create Component Files**: Generate all the imported components
3. **Test Basic Setup**: Ensure `npm run tauri:dev` starts successfully
4. **Implement Dashboard**: Create the main dashboard page

### **Development Priorities**
1. **Core Components**: Layout, buttons, forms, cards
2. **Project Management**: CRUD operations for projects
3. **Budget Visualization**: Charts and progress indicators
4. **Settings Interface**: Theme, preferences, configuration

---

**📝 Remember**: This is a living document. Update it as you encounter new issues or discover better solutions. Every problem solved here saves hours for future developers! 

**🚀 Ready to start building?** Follow the Quick Setup steps above and begin with `npm install`. 