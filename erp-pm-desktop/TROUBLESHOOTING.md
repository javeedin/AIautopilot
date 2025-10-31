# Troubleshooting Guide - ERP Project Manager

## CSV Files Not Loading / Empty Dashboard

### Problem
- Dashboard shows 0 features
- Charts are empty
- No data appearing

### Solution
The updated version includes a **built-in HTTP server** that solves CORS issues!

### What Was Fixed

#### 1. Added HTTP Server (Lines 124-280 in MainWindow.xaml.cs)
```csharp
// Built-in HTTP server on port 8765
private HttpListener httpListener;
private void StartHttpServer() { ... }
private void ProcessRequest(HttpListenerContext context) { ... }
```

**What it does:**
- Runs a local web server on `http://localhost:8765`
- Serves HTML/CSS/JS files from `project-management/` folder
- Serves CSV files from `docs/` folder
- Handles CORS properly
- Stops cleanly when app closes

#### 2. Updated File Serving Logic (Lines 170-253)
```csharp
// Smart path resolution:
if (requestedPath.StartsWith("docs/"))
{
    // CSV files from docs/ folder
    filePath = Path.Combine(localRepoPath, requestedPath);
}
else
{
    // Website files from project-management/ folder
    filePath = Path.Combine(projectManagementPath, requestedPath);
}
```

#### 3. Updated JavaScript (js/main.js)
```javascript
// Auto-detects if running in C# app or browser
dataPath: window.location.protocol === 'file:' ? '../docs/' : '/docs/',
```

### How It Works Now

```
C# Application
    ↓
Starts HTTP Server on port 8765
    ↓
WebView2 navigates to: http://localhost:8765/index.html
    ↓
JavaScript requests CSV: http://localhost:8765/docs/requirements/...
    ↓
HTTP Server reads file from disk
    ↓
Returns file with proper CORS headers
    ↓
Dashboard loads with all data! ✅
```

### Verification Steps

1. **Check HTTP Server Started**
   - Look at status bar after launch
   - Should say: "HTTP server running on http://localhost:8765"

2. **Open DevTools (F12)**
   - Click "DevTools" button or press F12
   - Go to "Network" tab
   - Reload page
   - Should see CSV files loading with HTTP 200 status

3. **Check Console**
   - In DevTools, go to "Console" tab
   - Should see: "All data loaded successfully!"
   - Should see: "DataStore: {validations: {...}, ...}"

4. **Test Manually**
   - Open browser
   - Navigate to: `http://localhost:8765/index.html`
   - Should see dashboard with data

### Common Issues

#### Issue 1: Port 8765 Already in Use
**Symptom**: Error message about port conflict

**Solution**:
1. Close other applications using port 8765
2. Or change port in `MainWindow.xaml.cs` line 24:
```csharp
private const int HTTP_PORT = 9000; // Change to different port
```

#### Issue 2: CSV Files Still Not Loading
**Symptom**: 404 errors in DevTools Network tab

**Check**:
1. Open folder: `%LocalAppData%\ERPProjectManager\AIautopilot`
2. Verify `docs/` folder exists
3. Verify CSV files exist in `docs/requirements/` and `docs/tracking/`
4. Click "Update from Git" to re-download

**Debug**:
1. Open DevTools Console
2. Run: `console.log(CONFIG.dataPath)`
3. Should show: `/docs/` (not `../docs/`)
4. Run: `fetch('/docs/requirements/ERP_Requirements.csv').then(r => r.text()).then(console.log)`
5. Should see CSV content

#### Issue 3: WebView2 Not Working
**Symptom**: Blank screen or error about WebView2

**Solution**:
1. Install WebView2 Runtime: https://developer.microsoft.com/microsoft-edge/webview2/
2. Restart application

#### Issue 4: Git Clone Failed
**Symptom**: Repository not found error

**Solution**:
1. Check internet connection
2. Verify repository URL in code
3. Try manual clone:
```bash
cd %LocalAppData%\ERPProjectManager
git clone https://github.com/javeedin/AIautopilot.git
```

### Manual Testing

#### Test 1: HTTP Server
```bash
# In browser, visit:
http://localhost:8765/index.html

# Should see the dashboard
```

#### Test 2: CSV Access
```bash
# In browser, visit:
http://localhost:8765/docs/requirements/ERP_Requirements.csv

# Should download/display CSV file
```

#### Test 3: JavaScript Console
```javascript
// In DevTools Console, run:
fetch('/docs/tracking/Feature_Validation_Summary.csv')
  .then(response => response.text())
  .then(data => console.log('CSV Length:', data.length));

// Should show: CSV Length: 1234 (some number)
```

### Debugging with DevTools

1. **Open DevTools**: Click "DevTools" button or F12

2. **Network Tab**:
   - See all file requests
   - Check status codes (200 = success, 404 = not found)
   - View response data

3. **Console Tab**:
   - See JavaScript errors
   - View console.log messages
   - Test fetch commands

4. **Elements Tab**:
   - Inspect HTML structure
   - Verify data is being inserted

### Performance Optimization

#### If Loading is Slow:

1. **Check Network Tab**:
   - Look for slow CSV files
   - Large files may take time

2. **Reduce Data**:
   - Pagination is already enabled (50 items per page)
   - Charts load only summary data

3. **Cache Issue**:
   - Hard refresh: Ctrl+Shift+R
   - Clear cache: Close app, delete WebView2Cache folder

### File Structure Verification

```
%LocalAppData%\ERPProjectManager\
├── AIautopilot\                    ← Git repository
│   ├── .git\                       ← Git metadata (should exist)
│   ├── docs\                       ← DATA FILES (must exist!)
│   │   ├── requirements\
│   │   │   ├── ERP_Requirements.csv ✓
│   │   │   ├── Application_Pages_Inventory.csv ✓
│   │   │   └── Database_Tables_Master.csv ✓
│   │   └── tracking\
│   │       ├── Feature_Validation_Summary.csv ✓
│   │       └── feature_validation\
│   │           ├── GL_Feature_Validation.csv ✓
│   │           ├── AP_Feature_Validation.csv ✓
│   │           └── ... (16 module files) ✓
│   └── project-management\         ← WEBSITE FILES (must exist!)
│       ├── index.html ✓
│       ├── features.html ✓
│       ├── css\
│       │   ├── main.css ✓
│       │   └── dashboard.css ✓
│       └── js\
│           ├── main.js ✓
│           ├── dashboard.js ✓
│           └── features.js ✓
└── WebView2Cache\                  ← Browser cache (auto-created)
```

### Success Indicators

✅ **Everything Working When You See**:
1. Status bar: "Ready"
2. KPI cards show numbers (not 0)
3. Charts display data
4. Module table has 16 rows
5. Features page shows 2,118 features
6. DevTools Console: "All data loaded successfully!"
7. DevTools Network: All CSV files = 200 OK

### Still Not Working?

1. **Delete and Recreate**:
```bash
# Close app
# Delete folder:
rmdir /s "%LocalAppData%\ERPProjectManager"
# Restart app - will re-clone everything
```

2. **Check Application Output**:
   - Run from Visual Studio to see console output
   - Check for exceptions or errors

3. **Verify Repository**:
   - Visit repository in browser
   - Ensure branch exists: `claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx`
   - Ensure `docs/` and `project-management/` folders exist

4. **Contact Support**:
   - Provide DevTools Console output
   - Provide DevTools Network tab screenshot
   - Provide exact error message

---

## Quick Fix Commands

```bash
# If port conflict - kill process on port 8765
netstat -ano | findstr :8765
taskkill /PID <process_id> /F

# If WebView2 issue - reinstall runtime
# Download: https://go.microsoft.com/fwlink/p/?LinkId=2124703

# If Git issue - manual clone
cd %LocalAppData%\ERPProjectManager
git clone https://github.com/javeedin/AIautopilot.git
cd AIautopilot
git checkout claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx

# If all else fails - clean start
rmdir /s "%LocalAppData%\ERPProjectManager"
# Then restart app
```

---

**Version**: 1.1.0 (with HTTP Server fix)
**Last Updated**: October 26, 2025
**Status**: CSV Loading Fixed ✅
