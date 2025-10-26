# 🚀 Quick Start Guide - ERP Project Manager Desktop

## ⚡ Super Fast Setup (5 minutes)

### Prerequisites
1. **Windows 10 or later** (version 1809+)
2. **.NET 6.0 SDK** - Download from: https://dotnet.microsoft.com/download/dotnet/6.0

### Step 1: Install .NET 6.0 SDK
```
1. Go to: https://dotnet.microsoft.com/download/dotnet/6.0
2. Download "SDK x64" installer
3. Run installer
4. Restart terminal/command prompt
```

Verify installation:
```bash
dotnet --version
# Should show: 6.0.x or higher
```

### Step 2: Build the Application

**Option A - Using Batch File (Easiest)**
```
1. Double-click: build.bat
2. Wait for build to complete (1-2 minutes)
3. Done!
```

**Option B - Using Command Line**
```bash
cd erp-pm-desktop
dotnet restore
dotnet build --configuration Release
```

### Step 3: Run the Application

**Option A - Using Batch File**
```
Double-click: run.bat
```

**Option B - Using Command Line**
```bash
dotnet run
```

**Option C - Run Executable Directly**
```
Navigate to: bin\Release\net6.0-windows\
Run: ERPProjectManager.exe
```

### Step 4: First Launch

On first run, the app will:
1. ✅ Create folder in `%LocalAppData%\ERPProjectManager`
2. ✅ Clone Git repository (1-2 minutes, shows progress)
3. ✅ Load project management website
4. ✅ Display dashboard

**That's it!** You're done! 🎉

---

## 🎯 What Happens Next?

### Automatic Git Clone
- Repository URL: `https://github.com/javeedin/AIautopilot.git`
- Branch: `claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx`
- Progress shown in status bar
- Takes 1-2 minutes (depends on internet speed)

### Dashboard Loads
- Shows all 16 modules
- Displays 2,118 features
- Charts and KPIs
- Real-time data from CSV files

---

## 🖱️ How to Use

### Navigation
- **Home** button - Go to dashboard
- **Back/Forward** - Navigate pages
- **Reload** - Refresh current page

### Update Data
1. Click **"📥 Update from Git"** button
2. App pulls latest changes
3. Website reloads automatically
4. See updated data

### Debug
1. Click **"🔧 DevTools"** button
2. Opens Chrome DevTools
3. View console, errors, network

### Access Files
1. Click **"📁 Open Folder"** button
2. Opens Windows Explorer
3. Browse project files

---

## 🔧 Configuration

### Change Repository URL
Edit `MainWindow.xaml.cs` line 18:
```csharp
private const string REPO_URL = "YOUR_GIT_URL";
```

### Change Branch
Edit `MainWindow.xaml.cs` line 19:
```csharp
private const string BRANCH_NAME = "YOUR_BRANCH";
```

---

## 📁 Data Location

All data stored in:
```
C:\Users\YourName\AppData\Local\ERPProjectManager\
├── AIautopilot\              (Git repository)
│   ├── docs\                 (CSV files)
│   └── project-management\   (Website)
└── WebView2Cache\            (Browser cache)
```

---

## ❓ Troubleshooting

### "WebView2 Runtime not found"
**Solution:**
1. Install from: https://developer.microsoft.com/microsoft-edge/webview2/
2. Restart application

### "Git clone failed"
**Solution:**
1. Check internet connection
2. Verify repository URL
3. Try accessing repo in browser
4. Check firewall settings

### "Website doesn't load"
**Solution:**
1. Click "Update from Git"
2. Check DevTools (F12) for errors
3. Verify `project-management` folder exists

### "CSV files not loading"
**Solution:**
1. Open DevTools (F12)
2. Check Console for errors
3. Verify `docs` folder exists in repository

---

## 🎓 Tips & Tricks

### Keyboard Shortcuts
- **F5** - Reload page
- **F12** - Open DevTools
- **Alt+Left** - Go back
- **Alt+Right** - Go forward

### Daily Workflow
1. Launch app
2. Click "Update from Git"
3. Browse features/modules
4. Track progress
5. Export reports as needed

### Update Website Code
1. Make changes to HTML/CSS/JS in Git
2. Click "Update from Git" in app
3. Changes appear immediately
4. No app rebuild needed!

### Update App Code
1. Make changes to C# files
2. Close app
3. Run `build.bat` again
4. Launch updated app

---

## 📊 What You Get

### Full Dashboard
- 5 KPI cards (modules, features, pages, tables, completion)
- Module progress bar chart
- Priority distribution pie chart
- Development status overview
- Searchable module table

### Features Page
- All 2,118 features listed
- Filter by module, priority
- Search by feature name/ID
- Pagination (50 per page)
- Export to CSV

### Real-time Updates
- Data from Git CSV files
- Updates with one click
- No manual file copying
- Always current

---

## 🚀 Next Steps

1. ✅ Build and run the app (you're here!)
2. ⏭️ Browse the dashboard
3. ⏭️ Explore features page
4. ⏭️ Update from Git to see changes
5. ⏭️ Customize as needed

---

## 📞 Need Help?

**Common Issues:**
- Check README.md for detailed troubleshooting
- Open DevTools (F12) to see errors
- Verify .NET 6.0 is installed
- Ensure internet connection for Git

**Still Stuck?**
- Review the full README.md
- Check Windows Event Viewer
- Contact development team

---

**Version**: 1.0.0
**Platform**: Windows 10+ with .NET 6.0
**Status**: Production Ready ✅
**Build Time**: ~2 minutes
**First Run Time**: ~2-3 minutes (includes Git clone)
**Subsequent Runs**: <1 second

🎉 **Enjoy your ERP Project Manager!** 🎉
