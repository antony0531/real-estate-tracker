# 📖 Real Estate Tracker - Complete User Guide

## Table of Contents
- [Getting Started](#getting-started)
  - [Desktop Installation](#desktop-installation)
  - [Mobile Installation (PWA)](#mobile-installation-pwa)
- [Desktop Usage](#desktop-usage)
  - [Dashboard Overview](#dashboard-overview)
  - [Managing Projects](#managing-projects)
  - [Tracking Expenses](#tracking-expenses)
  - [Room Management](#room-management)
  - [Reports & Analytics](#reports--analytics)
  - [Settings & Preferences](#settings--preferences)
- [Mobile Usage](#mobile-usage)
  - [Mobile Interface](#mobile-interface)
  - [Quick Expense Entry](#quick-expense-entry)
  - [Photo Capture](#photo-capture)
  - [Offline Usage](#offline-usage)
- [Data Management](#data-management)
  - [Backup & Export](#backup--export)
  - [Import Data](#import-data)
  - [Sync Between Devices](#sync-between-devices)
- [Tips & Best Practices](#tips--best-practices)
- [Troubleshooting](#troubleshooting)

---

## Getting Started

### Desktop Installation

#### Windows
1. Download the latest `.exe` installer from [Releases](https://github.com/your-org/real-estate-tracker/releases)
2. Run the installer and follow the prompts
3. Launch from Start Menu or Desktop shortcut

#### macOS
1. Download the latest `.dmg` file from [Releases](https://github.com/your-org/real-estate-tracker/releases)
2. Open the DMG and drag the app to Applications
3. Launch from Applications folder
4. If you see a security warning, go to System Preferences > Security & Privacy and click "Open Anyway"

#### Linux
1. Download the `.AppImage` file from [Releases](https://github.com/your-org/real-estate-tracker/releases)
2. Make it executable: `chmod +x real-estate-tracker.AppImage`
3. Run: `./real-estate-tracker.AppImage`

### Mobile Installation (PWA)

#### On Android (Chrome)
1. Visit https://your-domain.github.io/real-estate-tracker
2. Tap the menu (3 dots) in Chrome
3. Select "Add to Home screen"
4. Name the app and tap "Add"
5. Find the app icon on your home screen

#### On iOS (Safari)
1. Visit https://your-domain.github.io/real-estate-tracker
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"
5. Find the app icon on your home screen

> **Note**: The app works offline after the first visit!

---

## Desktop Usage

### Dashboard Overview

When you first open the app, you'll see the main dashboard with:

```
┌─────────────────────────────────────────────────┐
│  🏠 Real Estate Tracker          [🔍] [⚙️] [🌙]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Total Projects: 5      💰 Total Budget: $750K│
│  💸 Total Spent: $425K     📈 Available: $325K  │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐              │
│  │ Budget vs   │  │ Spending    │              │
│  │ Spent Chart │  │ Timeline    │              │
│  └─────────────┘  └─────────────┘              │
│                                                 │
│  [+ New Project]  [+ Log Expense]  [View Reports]│
└─────────────────────────────────────────────────┘
```

**Key Features:**
- **Real-time Stats**: See your portfolio at a glance
- **Interactive Charts**: Click on charts to drill down
- **Quick Actions**: Fast access to common tasks
- **Auto-refresh**: Data updates every 5 minutes

### Managing Projects

#### Creating a New Project
1. Click **"+ Add New Project"** from the dashboard
2. Fill in the project details:
   - **Name**: e.g., "123 Main St Renovation"
   - **Address**: Full property address
   - **Budget**: Total renovation budget
   - **Type**: Single Family, Multi-family, etc.
   - **Status**: Planning, In Progress, Complete
3. Click **"Create Project"**

#### Viewing Project Details
1. Go to **Projects** in the sidebar
2. Click on any project card to view:
   - Budget overview
   - Expense breakdown
   - Room list
   - Timeline
   - Progress indicators

#### Editing Projects
1. Open a project
2. Click the **Edit** button (pencil icon)
3. Update any fields
4. Click **"Save Changes"**

### Tracking Expenses

#### Adding an Expense
1. Click **"+ Log Expense"** button
2. Select or enter:
   - **Project**: Which project this expense belongs to
   - **Room**: Select existing room or enter new
   - **Category**: Material or Labor
   - **Amount**: Cost in dollars
   - **Notes**: Optional description
3. Click **"Add Expense"**

> **Tip**: The system will alert you if an expense exceeds your budget!

#### Expense Categories
- **Materials**: Physical items (lumber, paint, fixtures)
- **Labor**: Work performed (contractor fees, hourly work)

#### Quick Edit
- Click on any expense in the list
- Use the quick edit dropdown to update
- Changes save automatically

### Room Management

#### Adding Rooms
1. Open a project
2. Go to the **Rooms** tab
3. Click **"+ Add Room"**
4. Enter:
   - Room name (e.g., "Master Bedroom")
   - Floor number
   - Dimensions (optional)
   - Initial condition (1-5 scale)

#### Room Conditions
- **1**: Poor - Major work needed
- **2**: Fair - Significant repairs required
- **3**: Good - Minor updates needed
- **4**: Very Good - Cosmetic only
- **5**: Excellent - Move-in ready

### Reports & Analytics

#### Viewing Reports
1. Click **Reports** in the sidebar
2. Choose report type:
   - **Budget Summary**: Overall financial status
   - **Expense Timeline**: Spending over time
   - **Room Analysis**: Cost per room breakdown
   - **Category Breakdown**: Materials vs Labor

#### Exporting Data
1. Go to Reports
2. Click **"Export"** button
3. Choose format:
   - **Excel** (.xlsx) - Full spreadsheet
   - **CSV** - Simple data format
   - **PDF** - Formatted report
4. Save to your computer

### Settings & Preferences

#### Dark Mode
1. Click the settings icon (⚙️)
2. Toggle **"Dark Mode"** switch
3. Setting saves automatically

#### Budget Alerts
- Set alert threshold (default: 90%)
- Get notified when approaching budget limits
- Configure per-project or globally

#### Auto-Save
- Enable/disable automatic saving
- Set save interval (default: 30 seconds)

---

## Mobile Usage

### Mobile Interface

The mobile version adapts to your screen size:

```
┌─────────────────┐
│ ☰  Dashboard  ⚙️ │
├─────────────────┤
│ Total Budget    │
│ $750,000        │
│                 │
│ Spent: $425,000 │
│ [▓▓▓▓▓░░░] 57% │
├─────────────────┤
│ [+ Quick Add]   │
│ [📷 Photo]      │
└─────────────────┘
```

**Mobile Features:**
- **Swipe Navigation**: Swipe right for menu
- **Touch Optimized**: Large buttons for easy tapping
- **Responsive Charts**: Tap to view details

### Quick Expense Entry

Perfect for on-site use:

1. Tap **"+ Quick Add"** button
2. Select project from dropdown
3. Enter amount using number pad
4. Optionally:
   - Take a photo of receipt
   - Add voice note
   - Select room
5. Tap **"Save"**

> **Offline Mode**: Expenses save locally and sync when online!

### Photo Capture

#### Taking Photos
1. Tap the **Camera** button (📷)
2. Allow camera permissions if prompted
3. Frame your shot (receipt, room, damage)
4. Tap capture button
5. Review and either:
   - **Retake** if needed
   - **Use Photo** to attach

#### Photo Organization
- Photos automatically tagged with:
  - Project name
  - Room (if selected)
  - Date and time
  - GPS location (if permitted)

### Offline Usage

The app works without internet:

**What Works Offline:**
- ✅ View all projects and expenses
- ✅ Add new expenses
- ✅ Take photos
- ✅ View reports
- ✅ All calculations

**What Needs Internet:**
- ❌ Sync between devices
- ❌ Cloud backup
- ❌ Share features

**Offline Indicator:**
When offline, you'll see: 🔴 **Offline Mode** at the top

---

## Data Management

### Backup & Export

#### Manual Backup
1. Go to **Settings**
2. Click **"Backup Data"**
3. Choose location to save
4. File saved as: `retracker-backup-[date].json`

#### Automatic Backup
1. Enable in Settings
2. Set frequency (daily/weekly)
3. Choose backup location

#### Export Formats
- **JSON**: Complete data with all fields
- **CSV**: Spreadsheet compatible
- **Excel**: Formatted with charts
- **PDF**: Print-ready reports

### Import Data

#### From Backup
1. Go to **Settings**
2. Click **"Import Data"**
3. Select your backup file
4. Review import preview
5. Click **"Import"**

#### From CSV
1. Prepare CSV with columns:
   - Date, Project, Room, Category, Amount, Notes
2. Go to **Settings** > **Import**
3. Select CSV file
4. Map columns if needed
5. Import

### Sync Between Devices

Since this is a free app without servers, use these methods:

#### Method 1: File Transfer
1. Export data from Device A
2. Transfer file via:
   - Email
   - Cloud storage (Google Drive, Dropbox)
   - USB/Cable
3. Import on Device B

#### Method 2: QR Code (Coming Soon)
1. Generate QR code on Device A
2. Scan with Device B
3. Data transfers directly

---

## Tips & Best Practices

### 📝 Project Organization
- Use consistent naming: "Address - Type" (e.g., "123 Main St - Kitchen Remodel")
- Create rooms before adding expenses
- Set realistic budgets with 10-20% contingency

### 💰 Expense Tracking
- Log expenses immediately while on-site
- Take photos of all receipts
- Include vendor info in notes
- Review weekly to stay on budget

### 📸 Photo Management
- Take "before" photos of each room
- Document any issues or damage
- Photograph completed work
- Keep receipt photos organized

### 📊 Reporting
- Review reports weekly
- Export monthly for records
- Share with partners/investors
- Use for tax preparation

### 🔒 Data Safety
- Backup before major updates
- Export important projects
- Keep copies in cloud storage
- Test restore process regularly

---

## Troubleshooting

### Common Issues

#### App Won't Open
- **Desktop**: Right-click > Run as Administrator (Windows) or check Security settings (Mac)
- **Mobile**: Clear browser cache and reinstall PWA

#### Data Not Saving
- Check available storage space
- Ensure auto-save is enabled
- Try manual save
- Export data as backup

#### Camera Not Working
- Check browser permissions
- Ensure HTTPS connection
- Try different browser
- Restart device

#### Offline Sync Issues
- Ensure good internet connection
- Check for app updates
- Export and re-import data
- Clear app cache

### Getting Help

1. **Check FAQ**: See [FAQ.md](FAQ.md)
2. **GitHub Issues**: Report bugs
3. **Community Forum**: Ask questions
4. **Email Support**: support@example.com

### Error Messages

| Error | Solution |
|-------|----------|
| "Storage Full" | Delete old photos or export data |
| "Camera Permission Denied" | Go to Settings > Permissions |
| "Invalid Data Format" | Check import file format |
| "Budget Exceeded" | Review and adjust expenses |

---

## Keyboard Shortcuts (Desktop)

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | New Project |
| `Ctrl/Cmd + E` | New Expense |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + F` | Search |
| `Ctrl/Cmd + P` | Print Report |
| `Esc` | Close Modal |

---

## Updates

The app updates automatically:
- **Desktop**: Check for updates in Settings
- **PWA**: Updates on page refresh
- **No app store** updates needed!

---

**Need more help?** Check our [Quick Start Guide](QUICK_START.md) or [FAQ](FAQ.md)!