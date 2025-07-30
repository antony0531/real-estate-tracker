# ❓ Frequently Asked Questions (FAQ)

## Table of Contents
- [General Questions](#general-questions)
- [Installation & Setup](#installation--setup)
- [Features & Usage](#features--usage)
- [Mobile/PWA Questions](#mobilepwa-questions)
- [Data & Storage](#data--storage)
- [Troubleshooting](#troubleshooting)
- [Privacy & Security](#privacy--security)

---

## General Questions

### Q: Is Real Estate Tracker really free?
**A:** Yes! 100% free forever. No subscriptions, no ads, no premium features. It's open-source software.

### Q: Do I need internet to use it?
**A:** No! After initial setup, the app works completely offline. Internet is only needed for:
- First-time installation
- Syncing between devices (manual)
- Downloading updates

### Q: What platforms does it support?
**A:** 
- ✅ Windows (10 and up)
- ✅ macOS (10.15 and up)
- ✅ Linux (Ubuntu, Fedora, etc.)
- ✅ iPhone/iPad (via PWA)
- ✅ Android (via PWA)
- ✅ Any modern web browser

### Q: Who is this app for?
**A:** Perfect for:
- House flippers
- Real estate investors
- General contractors
- DIY renovators
- Property managers
- Anyone tracking renovation costs

---

## Installation & Setup

### Q: How do I install on iPhone/iPad?
**A:** 
1. Open **Safari** (must be Safari, not Chrome)
2. Visit the app URL
3. Tap the **Share** button
4. Scroll down and tap **"Add to Home Screen"**
5. Name it and tap **Add**

### Q: Why can't I install on iPhone using Chrome?
**A:** Apple only allows PWA installation through Safari. This is an iOS limitation, not our app.

### Q: Is there an app store version?
**A:** No, and here's why:
- Keeps the app 100% free (no $99/year developer fees)
- Instant updates (no app store approval delays)
- Works the same as an app store app
- No Apple/Google taking 30% cut

### Q: How much storage space does it need?
**A:** 
- Initial install: ~50MB
- Per project: ~1-2MB
- Per photo: ~200KB-1MB
- Total for average user: <500MB

### Q: Can I install it on multiple devices?
**A:** Yes! Install on unlimited devices. Use export/import to sync data.

---

## Features & Usage

### Q: How many projects can I track?
**A:** Unlimited! No restrictions on:
- Number of projects
- Number of expenses
- Number of photos
- Number of rooms

### Q: Can multiple people use the same project?
**A:** Currently, it's designed for single users. For teams:
1. Export project data
2. Share the file
3. Others import it
4. Merge changes manually

Multi-user sync is planned for the future.

### Q: What's the difference between Material and Labor expenses?
**A:** 
- **Materials**: Physical items you buy (lumber, paint, fixtures)
- **Labor**: Work performed (contractor fees, hourly workers)

This helps with:
- Tax categorization
- Budget planning
- Cost analysis

### Q: Can I track multiple properties at once?
**A:** Yes! Create separate projects for each property. The dashboard shows all projects together.

### Q: How do room conditions work?
**A:** Rate rooms 1-5:
- **1 - Poor**: Gut renovation needed
- **2 - Fair**: Major repairs required  
- **3 - Good**: Minor updates needed
- **4 - Very Good**: Cosmetic only
- **5 - Excellent**: Move-in ready

### Q: Can I add custom categories?
**A:** Currently limited to Material/Labor. Custom categories coming in future update.

---

## Mobile/PWA Questions

### Q: What's a PWA?
**A:** Progressive Web App - a website that acts like a native app:
- Installs on your home screen
- Works offline
- Sends notifications
- Access device features (camera)
- No app store needed!

### Q: Does the mobile version have all features?
**A:** Yes! The mobile version has:
- ✅ All desktop features
- ✅ Camera integration
- ✅ Touch-optimized interface
- ✅ Offline support
- ✅ Quick entry modes

### Q: How do I update the mobile app?
**A:** Updates happen automatically! The app checks for updates when you open it. No app store updates needed.

### Q: Can I use it on tablet?
**A:** Yes! Works great on:
- iPad (all sizes)
- Android tablets
- Surface tablets
- Any tablet with a browser

### Q: Why does it say "Add to Home Screen" instead of "Install"?
**A:** Different browsers use different terms:
- Safari: "Add to Home Screen"
- Chrome: "Install App"
- Edge: "Install"
- Firefox: "Add to Home screen"

All do the same thing!

---

## Data & Storage

### Q: Where is my data stored?
**A:** 
- **Desktop**: Local SQLite database in your user folder
- **Mobile**: Browser's IndexedDB (local storage)
- **Never**: On our servers (we don't have any!)

Your data never leaves your device unless you export it.

### Q: How do I backup my data?
**A:** 
1. Go to **Settings**
2. Click **"Backup Data"**
3. Save the file somewhere safe (cloud drive, USB, etc.)

We recommend weekly backups!

### Q: Can I sync between devices?
**A:** Since there's no server, sync is manual:
1. Export from Device A
2. Transfer file (email, cloud, etc.)
3. Import on Device B

Automatic P2P sync coming soon!

### Q: What happens if I clear browser data?
**A:** On mobile, clearing browser data will delete app data. Always backup first! Desktop app data is safe from browser clears.

### Q: How do I move data to a new phone?
**A:** 
1. On old phone: Settings → Export → Save file
2. Transfer file to new phone
3. On new phone: Settings → Import → Select file

### Q: Is there a size limit for photos?
**A:** Photos are automatically compressed to ~200KB-1MB. You can store thousands of photos.

---

## Troubleshooting

### Q: The app won't open on Mac
**A:** macOS security blocking it:
1. Right-click the app
2. Select "Open"
3. Click "Open" in the dialog
4. Or: System Preferences → Security → "Open Anyway"

### Q: Camera isn't working
**A:** 
1. Check browser permissions
2. Make sure you're using HTTPS (not HTTP)
3. Try a different browser
4. Restart your device

### Q: Data seems to be missing
**A:** Check:
1. Correct project selected?
2. Filter settings?
3. Try refreshing (Ctrl/Cmd + R)
4. Check backups

### Q: App is running slowly
**A:** Try:
1. Close unused projects
2. Archive old photos
3. Export and reimport data
4. Clear app cache
5. Restart app

### Q: Can't export to Excel
**A:** 
1. Make sure you have data to export
2. Check available disk space
3. Try CSV format instead
4. Disable popup blocker

### Q: Budget alerts not working
**A:** Check:
1. Alerts enabled in Settings?
2. Threshold set correctly?
3. Project has a budget set?
4. Notifications allowed?

---

## Privacy & Security

### Q: Is my data private?
**A:** Absolutely! 
- All data stored locally on your device
- No cloud servers
- No analytics or tracking
- No account required
- You own your data

### Q: Is it secure?
**A:** Yes:
- Data encrypted at rest
- No network transmission
- No third-party access
- Regular security updates
- Open source (auditable)

### Q: Do you collect any data?
**A:** No! We don't collect:
- Personal information
- Usage analytics  
- Project data
- Location data
- Any data at all

### Q: Can I use it for commercial properties?
**A:** Yes! Use it for any properties:
- Residential
- Commercial
- Industrial
- Mixed-use
- Land development

### Q: Is it GDPR/privacy compliant?
**A:** Yes! Since we don't collect data, we're automatically compliant with:
- GDPR
- CCPA
- PIPEDA
- All privacy laws

---

## Still Have Questions?

### 📧 Contact Options
- GitHub Issues: [Report bugs or request features]
- Email: support@example.com
- Community Forum: [Coming soon]

### 📚 More Resources
- [User Guide](USER_GUIDE.md) - Complete documentation
- [Quick Start](QUICK_START.md) - Get started in 5 minutes
- [Developer Docs](DEVELOPER_GUIDE.md) - For contributors

### 🤝 Want to Help?
This is open source! You can:
- Report bugs
- Suggest features
- Contribute code
- Improve documentation
- Spread the word!

---

**Remember**: This app is made by the community, for the community. Forever free! 🎉