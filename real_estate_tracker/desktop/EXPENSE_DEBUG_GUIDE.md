# Expense Debug Guide

## To debug why expenses aren't reflecting:

### 1. Open Browser Console (F12)
When you add an expense, you should see these logs in order:

```
[EXPENSE-MODAL] Submitting expense: {projectId: 1, roomName: "Living Room", ...}
[EXPENSE-MODAL] Expense added, result: "Expense added successfully..."
[EXPENSE-MODAL] Calling onSuccess callback to refresh dashboard
[EXPENSE-MODAL] Invalidating all caches
[EXPENSE-MODAL] Caches invalidated, data should refresh
[DASHBOARD] Expense added, refreshing dashboard...
[DASHBOARD] Loading dashboard data...
[DASHBOARD] Loading expenses for project 1 - Test Project
[DASHBOARD] Raw expenses output for project 1: <CLI OUTPUT HERE>
[DASHBOARD] Parsing expenses from output: <CLI OUTPUT HERE>
[DASHBOARD] Total expenses parsed: X Total cost: $XXX
[DASHBOARD] Project 1 spent: $XXX
[DASHBOARD] Data loaded successfully: {projectCount: 1, totalBudget: 100000, totalSpent: XXX}
[DASHBOARD] Chart data: [{name: "Test Project", budget: 100000, spent: XXX, available: XXX}]
[DASHBOARD] Last refresh: HH:MM:SS AM/PM
[DASHBOARD] Dashboard refresh complete after expense
```

### 2. Check for Errors
Look for any red error messages, especially:
- Network errors
- Python backend errors
- Parsing errors

### 3. Verify CLI Output Format
The expense parser expects output like this:
```
│ ID │ Project │ Room │ Category │ Amount │ Date │
│ 1  │ Test    │ Living Room │ Material │ $500.00 │ 2025-01-29 │
```

### 4. Common Issues:

#### Issue: "Room not found in project"
- Solution: Make sure the room exists in the project before adding expense
- The ExpenseModal should auto-create rooms if needed

#### Issue: Expenses show 0 or don't update
- Check if the CLI output format has changed
- Look for parsing errors in console
- Verify the expense was actually saved in database

#### Issue: Dashboard doesn't refresh
- Check for JavaScript errors
- Verify the onSuccess callback is being called
- Look for cache invalidation logs

### 5. Manual Testing Steps:

1. **Clear all data and start fresh:**
   - Go to Settings > Database > Clear All Data
   - Create a new project
   - Add a room to the project
   - Add an expense

2. **Check the raw CLI output:**
   - Open Debug page (if available)
   - Run: `list expenses --project-id 1`
   - Verify expenses are in database

3. **Force refresh:**
   - Click the "Refresh" button in dashboard
   - Check if expenses appear after manual refresh

### 6. Quick Fixes to Try:

1. **Clear browser cache:**
   - Ctrl+Shift+R (hard refresh)
   - Clear localStorage: `localStorage.clear()` in console

2. **Restart the app:**
   - Close and reopen the desktop app
   - This ensures Python backend is fresh

3. **Check Python CLI directly:**
   ```bash
   cd backend
   python -m src.cli expense list --project-id 1
   ```

### 7. Enhanced Logging Added:
- Expense parsing now logs all attempts to find cost
- Dashboard logs raw CLI output for debugging
- Timestamp shows when data was last refreshed
- Success toast shows when refresh completes

## If issues persist:
1. Share the console logs from steps above
2. Share the raw CLI output for expenses
3. Check if the Python backend is returning data correctly