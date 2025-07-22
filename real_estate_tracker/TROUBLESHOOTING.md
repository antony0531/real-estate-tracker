# 🛠️ Troubleshooting Guide
## Real Estate Flip Tracker - Common Issues and Solutions

This document captures the major errors encountered during development and their proven solutions. Use this as a reference when encountering similar issues.

---

## 🚨 **Critical Windows Compatibility Issues**

### **1. UnicodeEncodeError: 'charmap' codec can't encode character**

**❌ Problem:**
```
UnicodeEncodeError: 'charmap' codec can't encode character '\u2713' in position 0: character maps to <undefined>
```

**🔍 Root Cause:**
- Windows console using `cp1252` encoding by default
- Rich library attempting to display Unicode emojis (`✓`, `❌`, `🏠`, `💰`, `📊`, etc.)
- Python CLI output containing Unicode characters that Windows console cannot render

**✅ Solution:**
```python
# BEFORE (Problematic):
rprint("✓ Project created successfully")
rprint("💰 Budget: $150,000")
bar = "█" * filled_length + "░" * (bar_length - filled_length)

# AFTER (Fixed):
success_message("Project created successfully")  # Using utility function
rprint(f"Budget: {format_currency(150000)}")    # Using format helper  
bar = "#" * filled_length + "-" * (bar_length - filled_length)  # ASCII chars
```

**📝 Implementation:**
1. **Replaced all Unicode emojis** with plain text or ASCII equivalents
2. **Created utility functions** in `cli/utils.py` for consistent messaging:
   - `success_message()`, `error_message()`, `warning_message()`
   - `format_currency()`, `format_percentage()`
3. **Used ASCII characters** in progress bars and visual elements

**🎯 Files Changed:**
- `backend/src/cli/commands/*.py` - All command modules
- `cli_test_workflow.py` - Test script output
- `comprehensive_cli_test.py` - Test validation

---

## 🐍 **Python Environment & Import Issues**

### **2. ModuleNotFoundError: No module named 'sqlalchemy'**

**❌ Problem:**
```
ModuleNotFoundError: No module named 'sqlalchemy'
```

**🔍 Root Cause:**
- Test scripts running from wrong directory
- Virtual environment not activated or not found
- Python path not including installed packages

**✅ Solution:**
```python
# comprehensive_cli_test.py - Fixed Implementation
class ComprehensiveCLITester:
    def __init__(self):
        # Set working directory to backend where venv is located
        self.backend_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)), "backend"
        )
        
        # Try to use virtual environment Python if available
        venv_python = os.path.join(self.backend_dir, "venv", "Scripts", "python.exe")
        if not os.path.exists(venv_python):
            # Try Unix-style venv path
            venv_python = os.path.join(self.backend_dir, "venv", "bin", "python")
            
        if os.path.exists(venv_python):
            self.cli_base = [venv_python, "-m", "src.cli"]
        else:
            self.cli_base = [sys.executable, "-m", "src.cli"]
```

**📝 Implementation:**
1. **Auto-detect virtual environment** Python executable
2. **Set correct working directory** in subprocess calls
3. **Fallback to system Python** with clear warnings
4. **Updated documentation** with activation instructions

---

## ⚙️ **CLI Command and Parsing Issues**

### **3. Invalid value for 'BUDGET': 'Comprehensive' is not a valid float**

**❌ Problem:**
```bash
# This command failed:
real-estate-tracker project create 'Test Comprehensive Project' 200000 single_family sf_class_b

# Error: Invalid value for 'BUDGET': 'Comprehensive' is not a valid float.
```

**🔍 Root Cause:**
- Test script using `cmd.split()` which incorrectly parsed quoted strings
- Quoted project names split into multiple arguments
- Arguments shifted causing budget to receive part of project name

**✅ Solution:**
```python
# BEFORE (Problematic):
def run_command(self, cmd, description, expect_success=True):
    full_cmd = self.cli_base + cmd.split()[1:]  # Naive split
    
# AFTER (Fixed):
def run_command(self, cmd, description, expect_success=True):
    import shlex
    
    # Properly parse command with quoted strings
    cmd_parts = shlex.split(cmd)
    if cmd_parts[0] == "real-estate-tracker":
        cmd_parts = cmd_parts[1:]  # Remove prefix
        
    full_cmd = self.cli_base + cmd_parts
```

**📝 Implementation:**
1. **Used `shlex.split()`** instead of `str.split()` for robust parsing
2. **Handles quoted arguments** correctly (preserves spaces in names)
3. **Simplified test data** to avoid complex nested quotes
4. **Updated all test commands** to use consistent formatting

---

## 🗄️ **Database Model and Attribute Issues**

### **4. 'Expense' object has no attribute 'expense_date'**

**❌ Problem:**
```python
# CLI code trying to access non-existent attribute:
expense.expense_date.strftime("%Y-%m-%d")  # AttributeError!
```

**🔍 Root Cause:**
- **Model inconsistency**: `Expense` model uses `created_at` field
- **Code mismatch**: CLI code referenced `expense_date` instead
- **Copy-paste errors** in multiple command modules

**✅ Solution:**
```python
# BEFORE (Incorrect):
expense.expense_date.strftime("%Y-%m-%d")

# AFTER (Fixed):
expense.created_at.strftime("%Y-%m-%d")
```

**📝 Implementation:**
1. **Systematic search** for all `expense_date` references
2. **Replaced with `created_at`** in all command modules:
   - `expense.py` - List command
   - `export.py` - CSV export functionality
3. **Verified model definition** matches usage patterns

---

## 🧪 **Testing and Validation Issues**

### **5. No such command 'list' for room app**

**❌ Problem:**
```
Usage: real-estate-tracker room [OPTIONS] COMMAND [ARGS]...
Error: No such command 'list'.
```

**🔍 Root Cause:**
- **Missing command implementation**: `room list` command not created
- **Test expecting functionality** that didn't exist yet
- **Incomplete command coverage** in CLI modules

**✅ Solution:**
```python
# Added missing command in room.py:
@app.command("list")
def list_rooms(project_id: int = typer.Argument(..., help="Project ID")):
    """List all rooms in a project"""
    # ... implementation ...
```

**📝 Implementation:**
1. **Implemented missing `room list` command** in `cli/commands/room.py`
2. **Added comprehensive table display** with room details
3. **Included error handling** for non-existent projects
4. **Updated help documentation** and usage examples

---

## 🔒 **Security Vulnerabilities and Fixes**

### **6. Path Traversal Vulnerability in Export Command**

**❌ Problem:**
```python
# Dangerous - user could specify: ../../../etc/passwd
output_file = user_provided_filename  # Direct usage!
```

**🔍 Root Cause:**
- **Direct use of user input** for file paths
- **No path sanitization** in export commands
- **Potential directory traversal** attacks

**✅ Solution:**
```python
# Secure implementation in export.py:
def export_csv(output_file: Optional[str] = None):
    if output_file:
        # Security: Sanitize user-provided filename
        import os.path
        
        output_file = os.path.basename(output_file)  # Remove directory paths
        if not output_file.endswith(".csv"):
            output_file += ".csv"
            
        # Additional character sanitization
        safe_chars = set(
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-_"
        )
        output_file = "".join(c if c in safe_chars else "_" for c in output_file)
```

**📝 Implementation:**
1. **Strip directory paths** using `os.path.basename()`
2. **Sanitize file characters** to prevent injection
3. **Force `.csv` extension** for consistency
4. **Restrict to safe character set** only

---

## 🔄 **Process and Environment Issues**

### **7. PermissionError: Access is denied on Windows**

**❌ Problem:**
```
PermissionError: [WinError 5] Access is denied: 'test.db'
```

**🔍 Root Cause:**
- **File locks** from previous test runs
- **Process cleanup issues** in test scripts
- **Windows file handling** differences from Unix systems

**✅ Solution:**
```python
# Proper cleanup in test scripts:
def cleanup_test_data(self):
    """Clean up test data safely"""
    try:
        session = db_manager.get_session()
        # Delete test projects and cascade
        projects = session.query(Project).filter(
            Project.name.like('Test%')
        ).all()
        
        for project in projects:
            session.delete(project)
        session.commit()
        
    except Exception as e:
        session.rollback()
        rprint(f"[yellow]Cleanup warning: {e}[/yellow]")
    finally:
        session.close()
```

**📝 Implementation:**
1. **Proper session management** with try/finally blocks
2. **Graceful error handling** in cleanup routines
3. **Database connection cleanup** after operations
4. **Test isolation** to prevent interference

---

## 🏗️ **Architecture Refactoring Lessons**

### **8. Monolithic File Management**

**❌ Problem:**
- **1202-line `cli.py` file** difficult to maintain
- **Mixed responsibilities** in single module
- **Testing complexity** due to coupling

**✅ Solution:**
```
# Modular structure implemented:
backend/src/cli/
├── __init__.py          # Main CLI app configuration
├── utils.py             # Shared utilities
└── commands/
    ├── system.py        # System operations
    ├── project.py       # Project management  
    ├── room.py          # Room operations
    ├── expense.py       # Expense tracking
    ├── budget.py        # Budget analysis
    └── export.py        # Data export
```

**📝 Benefits Achieved:**
1. **Single Responsibility**: Each module focuses on one domain
2. **Easy Testing**: Individual modules can be tested in isolation
3. **Team Development**: Multiple developers can work on different modules
4. **Maintainability**: Changes localized to specific functionality

---

## 📋 **Prevention Strategies**

### **🛡️ Best Practices Established**

1. **Unicode Safety:**
   - Always test on Windows environments
   - Use ASCII characters for console output
   - Create utility functions for consistent messaging

2. **Environment Management:**
   - Document virtual environment requirements
   - Auto-detect venv paths in test scripts
   - Provide clear setup instructions

3. **Command Parsing:**
   - Use `shlex.split()` for robust argument parsing
   - Test with quoted strings containing spaces
   - Validate all command variations

4. **Database Operations:**
   - Verify model attribute names match usage
   - Use proper session management patterns
   - Implement cleanup in finally blocks

5. **Security by Design:**
   - Sanitize all user inputs
   - Prevent path traversal attacks
   - Use allowlist approach for characters/paths

6. **Testing Strategy:**
   - Test on target deployment platforms
   - Include edge cases in test suites
   - Implement proper test data cleanup

---

## 🚀 **Quick Debug Commands**

```bash
# Check Python environment
python --version
pip list | grep sqlalchemy

# Test CLI directly
cd backend
python -m src.cli --help
python -m src.cli project list

# Run comprehensive tests
cd real_estate_tracker
python comprehensive_cli_test.py

# Check database
cd backend
python -c "from src.database import db_manager; print(db_manager.db_path)"
```

---

## 📞 **Getting Help**

If you encounter issues not covered here:

1. **Check git history** for similar fixes: `git log --grep="fix\|error"`
2. **Review test outputs** for detailed error messages
3. **Validate environment** setup matches documentation
4. **Check platform-specific** considerations (Windows/macOS/Linux)

---

## **Error 9: Frontend Setup - Linter Errors During Initial Structure Creation**

### **Problem**
```typescript
Cannot find module 'react' or its corresponding type declarations.
Cannot find module '@/components/Layout' or its corresponding type declarations.
JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
This JSX tag requires the module path 'react/jsx-runtime' to exist, but none could be found.
```

### **Root Cause**
When setting up a new frontend project, TypeScript shows import errors for:
1. **Dependencies not installed yet**: React, Vite, Tailwind packages missing
2. **Component files not created**: Importing components that don't exist yet
3. **Path aliases not working**: TypeScript can't resolve `@/` aliases until deps installed
4. **JSX transform not available**: React types needed for JSX compilation

### **Solution**
**Expected Behavior**: These errors are completely normal during initial project setup.

```bash
# 1. Complete the project structure first (ignore linter errors)
# 2. Install all dependencies to resolve module imports
cd desktop
npm install

# 3. Verify setup
npm run type-check  # Should now pass
npm run lint        # Should now pass
```

### **Implementation Details**
```typescript
// Frontend Architecture Decisions Made:
1. Vite + React + TypeScript: Modern, fast development
2. Tailwind CSS: Utility-first styling with custom theme
3. Zustand + React Query: Lightweight state management
4. Path aliases: Clean imports (@components, @pages, etc.)
5. Comprehensive type system: Project, Expense, Tauri types
```

### **Affected Files**
- `vite.config.ts` - Build configuration with Tauri integration
- `tailwind.config.ts` - Custom theme with Real Estate branding
- `tsconfig.json` - TypeScript configuration with path aliases
- `package.json` - 50+ dependencies for complete frontend stack
- `src/types/` - Comprehensive TypeScript type definitions
- `FRONTEND_SETUP.md` - Complete development documentation

### **Prevention Strategies**
1. **Document Expected Errors**: Always note that linter errors during setup are normal
2. **Progressive Setup**: Structure → Dependencies → Components → Integration
3. **Comprehensive Documentation**: Include troubleshooting for each stage
4. **Clear Next Steps**: Document exact commands to resolve issues

---

## **Error 10: TypeScript Configuration Conflicts**

### **Problem**
```bash
npm run type-check
# ERROR: Output file 'vite.config.d.ts' has not been built from source file 'vite.config.ts'
# The file is in the program because: Matched by include pattern 'vite.config.ts' in tsconfig.json

npm run lint  
# ERROR: ESLint couldn't find a configuration file
```

### **Root Cause**
1. **tsconfig.json misconfiguration**: `vite.config.ts` included in main config instead of node config
2. **Missing ESLint configuration**: `.eslintrc.json` file not created despite ESLint in package.json

### **Solution**
```bash
# 1. Fix tsconfig.json - Remove vite.config.ts from main include array
# 2. Create .eslintrc.json with proper React + TypeScript rules  
# 3. Create .eslintignore to exclude build artifacts
```

### **Implementation Details**
```json
// tsconfig.json - Remove vite.config.ts from include
{
  "include": [
    "src/**/*",
    "src/**/*.ts", 
    "src/**/*.tsx"
    // Remove: "vite.config.ts" - handled by tsconfig.node.json
  ]
}

// .eslintrc.json - Create with React + TypeScript rules
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended", 
    "plugin:react-hooks/recommended"
  ]
}
```

### **Affected Files**
- `tsconfig.json` - Fixed include patterns
- `.eslintrc.json` - Created ESLint configuration
- `.eslintignore` - Created to exclude build files

### **Prevention Strategies**
1. **Test Before Commit**: Always run `npm run type-check` and `npm run lint` 
2. **Configuration Templates**: Use proven config templates for new projects
3. **Incremental Setup**: Test each configuration file as it's added

---

## **Error 11: Missing Component Files and Import Dependencies**

### **Problem**
```typescript
// After fixing configuration, component import errors appear:
Cannot find module '@/pages/Dashboard' or its corresponding type declarations.
Cannot find module '@/pages/ProjectView' or its corresponding type declarations.
Cannot find module '@/pages/Settings' or its corresponding type declarations.
Cannot find module '@/components/layout/Layout' or its corresponding type declarations.

// ESLint configuration errors:
ESLint couldn't find the config "@typescript-eslint/recommended" to extend from.
```

### **Root Cause**
1. **Missing Component Files**: App.tsx imports components that don't exist yet
2. **ESLint TypeScript Plugin Missing**: Configuration references plugin not in dependencies
3. **Dev Dependencies Issue**: React Query dev tools import causes build errors

### **Solution**
```bash
# 1. Create missing component files with proper stub implementations
# 2. Fix ESLint configuration to use overrides for TypeScript files
# 3. Remove problematic dev tools code that causes build issues
```

### **Implementation Details**
Created functional component stubs:
- `Dashboard.tsx` - Main dashboard with project overview cards
- `ProjectView.tsx` - Individual project details page  
- `Settings.tsx` - Application settings and preferences
- `Layout.tsx` - Main navigation layout with sidebar

Fixed ESLint config to use overrides pattern:
```json
{
  "extends": ["eslint:recommended"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      "extends": ["@typescript-eslint/recommended"]
    }
  ]
}
```

### **Affected Files**
- `src/pages/Dashboard.tsx` - Created main dashboard page
- `src/pages/ProjectView.tsx` - Created project details page
- `src/pages/Settings.tsx` - Created settings page
- `src/components/layout/Layout.tsx` - Created navigation layout
- `src/main.tsx` - Removed problematic dev tools code
- `src/types/project.ts` - Fixed Expense type import
- `.eslintrc.json` - Fixed configuration to use overrides

### **Prevention Strategies**
1. **Create Component Stubs**: Always create stub components before referencing them
2. **Test Incrementally**: Create and test one component at a time
3. **Use ESLint Overrides**: Safer pattern for TypeScript configurations
4. **Avoid Complex Dev Tools**: Keep development tooling simple during initial setup

---

## **Error 12: Tailwind CSS Custom Class Not Recognized**

### **Problem**
```bash
npm run build
# ERROR: [postcss] The `border-border` class does not exist. 
# If `border-border` is a custom class, make sure it is defined within a `@layer` directive.
error during build: CssSyntaxError: border-border class does not exist
```

### **Root Cause**
CSS file uses `@apply border-border` but `border-border` is not a valid Tailwind utility class. The CSS custom properties define `--border` but Tailwind doesn't automatically create utility classes from custom properties.

### **Solution**
Replace all invalid CSS custom property classes with standard Tailwind utilities:
```css
// BEFORE (Invalid):
.card {
  @apply bg-card text-card-foreground border-border;  // ❌ Not real Tailwind classes
}
.btn-primary {
  @apply bg-primary text-primary-foreground;  // ❌ Custom properties as classes
}

// AFTER (Fixed):
.card {
  @apply bg-white text-gray-900 border-gray-200 dark:bg-gray-950 dark:text-gray-50;  // ✅ Real Tailwind classes
}
.btn-primary {
  @apply bg-brand-600 text-white hover:bg-brand-700;  // ✅ Using defined brand colors
}
```

### **Implementation Details**
**Root Cause**: CSS custom properties (like `--border`, `--primary`) don't automatically become Tailwind utility classes. The solution:
1. ✅ **Use standard Tailwind classes** (chosen approach)
2. **Use CSS custom properties directly** (`background-color: hsl(var(--primary))`)
3. **Extend Tailwind config** to create utilities from custom properties

**Comprehensive Fix Applied**:
- **Cards**: `bg-white text-gray-900 border-gray-200` with dark mode variants
- **Buttons**: `bg-brand-600 text-white` using defined brand colors  
- **Inputs**: `border-gray-200 bg-white` with proper focus states
- **Typography**: `text-gray-500` instead of `text-muted-foreground`

### **Affected Files**
- `src/index.css` - Replaced all invalid @apply statements with standard Tailwind classes
- `body` element - Fixed background and text color with direct CSS properties

### **Prevention Strategies**
1. **Test Build Process**: Always run `npm run build` to catch CSS errors
2. **Validate Tailwind Classes**: Ensure custom classes are properly defined
3. **Use CSS Properties Directly**: When custom properties are needed
4. **Check Tailwind Documentation**: Verify utility class names before using

---

**💡 Remember**: Every error we fixed made the system more robust. This troubleshooting guide ensures these lessons aren't lost and helps future development go smoothly! 