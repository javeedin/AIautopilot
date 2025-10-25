# Git Integration - Architecture & Visual Guide

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     WMS Auto Pilot v4.1                          │
│                  Frontend Application (HTML/JS)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ User Interaction
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ Settings │  │   Data   │  │    AI    │  │  🔶 Git Ops   │ │
│  │  Button  │  │  Sources │  │  Config  │  │    Button      │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Click Git Button
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Git Operations Modal                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Settings    │   Status     │  Operations  │   History    │ │
│  ├──────────────┼──────────────┼──────────────┼──────────────┤ │
│  │ • Username   │ • Repo Info  │ • Files List │ • Commits    │ │
│  │ • Token      │ • Branches   │ • Message    │ • Authors    │ │
│  │ • Owner      │ • Commits    │ • Templates  │ • Dates      │ │
│  │ • Repo       │ • Stats      │ • Push       │ • Links      │ │
│  │ • Branch     │              │              │              │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Uses
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Git Operations Module                       │
│                        (assets/js/git.js)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    window.GitOps                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Config Management                                   │  │  │
│  │  │  • loadConfig()    • saveConfig()                  │  │  │
│  │  │  • validateConfig() • clearConfig()                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ GitHub API Integration                              │  │  │
│  │  │  • testConnection() • getStatus()                  │  │  │
│  │  │  • getFileContent() • updateFile()                 │  │  │
│  │  │  • pushFiles()      • getHistory()                 │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ Storage Management                                  │  │  │
│  │  │  • localStorage (credentials)                      │  │  │
│  │  │  • Session data                                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Calls
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub REST API v3                          │
│                   https://api.github.com                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Repository Operations                                     │  │
│  │  GET  /repos/:owner/:repo                                │  │
│  │  GET  /repos/:owner/:repo/branches                       │  │
│  │  GET  /repos/:owner/:repo/commits                        │  │
│  │  GET  /repos/:owner/:repo/contents/:path                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Git Operations                                            │  │
│  │  POST  /repos/:owner/:repo/git/blobs                     │  │
│  │  POST  /repos/:owner/:repo/git/trees                     │  │
│  │  POST  /repos/:owner/:repo/git/commits                   │  │
│  │  PATCH /repos/:owner/:repo/git/refs/heads/:branch        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Updates
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      GitHub Repository                           │
│                    github.com/:owner/:repo                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Branches                                                │  │
│  │ • Commits                                                 │  │
│  │ • Files                                                   │  │
│  │ • History                                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Configuration Flow
```
User Input
    ↓
Form Fields
    ↓
GitOps.getFormConfig()
    ↓
GitOps.validateConfig()
    ↓
[Valid?] ──No──→ Show Error
    ↓ Yes
GitOps.saveConfig()
    ↓
localStorage
    ↓
Success Message
```

### Push Operation Flow
```
User Selects Files
    ↓
User Writes Message
    ↓
Click "Commit & Push"
    ↓
commitAndPushChanges()
    ↓
GitOps.pushFiles()
    ├─→ Get latest commit SHA
    ├─→ Create blobs for files
    ├─→ Create new tree
    ├─→ Create new commit
    └─→ Update branch reference
    ↓
[Success?] ──No──→ Show Error
    ↓ Yes
Update UI
    ↓
Refresh Status
```

### Status Retrieval Flow
```
Click "Refresh Status"
    ↓
refreshGitStatus()
    ↓
GitOps.getStatus()
    ├─→ Get repo info
    ├─→ Get branches
    └─→ Get recent commits
    ↓
Parse Response
    ↓
Generate HTML
    ↓
Update Container
```

---

## 📁 File Relationships

```
index.html
    │
    ├─→ Includes: assets/js/git.js
    │       │
    │       └─→ Exports: window.GitOps
    │
    ├─→ Includes: assets/js/main.js
    │       │
    │       ├─→ Uses: window.GitOps
    │       │
    │       └─→ Functions:
    │           ├─ openGitModal()
    │           ├─ saveGitConfig()
    │           ├─ testGitConnection()
    │           ├─ refreshGitStatus()
    │           ├─ commitAndPushChanges()
    │           └─ loadGitHistory()
    │
    └─→ Contains:
        └─→ Git Operations Modal
            ├─→ Settings Tab
            ├─→ Status Tab
            ├─→ Operations Tab
            └─→ History Tab
```

---

## 🎨 Component Hierarchy

```
Git Operations Button (Header)
    │
    └─→ onClick: openGitModal()
            │
            ↓
    Git Operations Modal
        │
        ├─→ Settings Tab
        │   ├─→ Username Input
        │   ├─→ Token Input
        │   ├─→ Owner Input
        │   ├─→ Repo Input
        │   ├─→ Branch Input
        │   ├─→ Remember Checkbox
        │   ├─→ Test Button → testGitConnection()
        │   ├─→ Save Button → saveGitConfig()
        │   └─→ Clear Button → clearGitConfig()
        │
        ├─→ Status Tab
        │   ├─→ Refresh Button → refreshGitStatus()
        │   └─→ Status Container
        │       ├─→ Repo Info Card
        │       ├─→ Branches List
        │       └─→ Recent Commits
        │
        ├─→ Operations Tab
        │   ├─→ Files List Container
        │   │   └─→ File Checkboxes
        │   ├─→ Commit Message Textarea
        │   ├─→ Template Buttons
        │   │   ├─→ feat: → setCommitMessage('feat: ')
        │   │   ├─→ fix: → setCommitMessage('fix: ')
        │   │   └─→ [others]
        │   ├─→ Commit & Push Button → commitAndPushChanges()
        │   └─→ Pull Button → pullLatestChanges()
        │
        └─→ History Tab
            ├─→ Load Button → loadGitHistory()
            └─→ History Container
                └─→ Commit Cards
```

---

## 💾 Data Storage Structure

### localStorage Structure
```javascript
{
  "git-config": {
    "username": "john-doe",
    "token": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "owner": "john-doe",
    "repo": "wms-autopilot-modular",
    "branch": "main"
  }
}
```

### Session Variables
```javascript
// In memory during session
window.GitOps = {
  config: {
    username: "",
    token: "",
    owner: "",
    repo: "",
    branch: "main"
  },
  apiBase: "https://api.github.com"
}
```

---

## 🔌 API Endpoints Mapping

### Repository Information
```
Function: GitOps.getStatus()
Endpoint: GET /repos/:owner/:repo
Response: Repository object
Usage: Display repo info in Status tab
```

### List Branches
```
Function: GitOps.getStatus()
Endpoint: GET /repos/:owner/:repo/branches
Response: Array of branch objects
Usage: Show all branches in Status tab
```

### Get Commits
```
Function: GitOps.getHistory()
Endpoint: GET /repos/:owner/:repo/commits
Response: Array of commit objects
Usage: Display commit history
```

### Create Blob
```
Function: GitOps.pushFiles()
Endpoint: POST /repos/:owner/:repo/git/blobs
Payload: { content, encoding }
Usage: Create file blob for commit
```

### Create Tree
```
Function: GitOps.pushFiles()
Endpoint: POST /repos/:owner/:repo/git/trees
Payload: { tree[], base_tree }
Usage: Create tree with all blobs
```

### Create Commit
```
Function: GitOps.pushFiles()
Endpoint: POST /repos/:owner/:repo/git/commits
Payload: { message, tree, parents }
Usage: Create commit object
```

### Update Reference
```
Function: GitOps.pushFiles()
Endpoint: PATCH /repos/:owner/:repo/git/refs/heads/:branch
Payload: { sha }
Usage: Update branch to new commit
```

---

## 🎯 Function Call Chain

### Initialization Chain
```
Page Load
    ↓
git.js loads
    ↓
GitOps.init()
    ↓
GitOps.loadConfig()
    ↓
Parse localStorage
    ↓
Populate GitOps.config
```

### Connection Test Chain
```
User clicks "Test Connection"
    ↓
testGitConnection()
    ↓
GitOps.getFormConfig()
    ↓
GitOps.validateConfig()
    ↓
GitOps.testConnection()
    ↓
GitOps.apiRequest('/repos/:owner/:repo')
    ↓
fetch() with GitHub API
    ↓
Parse response
    ↓
Show result message
```

### Push Chain
```
User clicks "Commit & Push"
    ↓
commitAndPushChanges()
    ↓
Collect files and message
    ↓
GitOps.pushFiles(files, message)
    ↓
Get latest commit SHA
    ↓
For each file:
    ↓
    Create blob
    ↓
Create tree with all blobs
    ↓
Create commit with tree
    ↓
Update branch reference
    ↓
Show success/error
    ↓
refreshGitStatus()
```

---

## 🔐 Security Flow

```
User enters credentials
    ↓
Stored in memory (GitOps.config)
    ↓
[Save checkbox checked?]
    ↓ Yes
Save to localStorage
    ↓ No
Clear on page refresh
    ↓
[During API call]
    ↓
Add to Authorization header
    ↓
Send with HTTPS
    ↓
[Clear credentials clicked?]
    ↓
Remove from localStorage
    ↓
Clear from memory
```

---

## 📊 State Management

```
Application States:
├─→ Unconfigured (No credentials)
├─→ Configured (Credentials saved)
├─→ Connected (Connection tested)
├─→ Active (Operation in progress)
└─→ Error (Operation failed)

Tab States:
├─→ Settings
│   ├─→ Empty (no config)
│   ├─→ Filled (config loaded)
│   └─→ Tested (connection verified)
├─→ Status
│   ├─→ Empty (no data)
│   ├─→ Loading (fetching)
│   └─→ Loaded (data displayed)
├─→ Operations
│   ├─→ Ready (files listed)
│   ├─→ Committing (in progress)
│   └─→ Complete (success/error)
└─→ History
    ├─→ Empty (no data)
    ├─→ Loading (fetching)
    └─→ Loaded (commits displayed)
```

---

## 🎨 UI State Transitions

```
Initial State
    │
    ├─→ User clicks Git button
    │       ↓
    │   Modal opens → Settings tab
    │       ↓
    │   User fills form
    │       ↓
    │   User clicks Test
    │       ↓
    │   [Success] → "Save" button enabled
    │       ↓
    │   User clicks Save
    │       ↓
    │   Credentials stored
    │
    ├─→ User switches to Status tab
    │       ↓
    │   User clicks Refresh
    │       ↓
    │   Loading indicator shown
    │       ↓
    │   Data fetched from GitHub
    │       ↓
    │   Status cards displayed
    │
    ├─→ User switches to Operations tab
    │       ↓
    │   Files auto-loaded
    │       ↓
    │   User selects files
    │       ↓
    │   User writes message
    │       ↓
    │   User clicks Push
    │       ↓
    │   [Progress] → Loading indicator
    │       ↓
    │   [Success] → Success message
    │       ↓
    │   Status auto-refreshes
    │
    └─→ User switches to History tab
            ↓
        User clicks Load
            ↓
        Loading indicator shown
            ↓
        Commits fetched
            ↓
        Commit cards displayed
```

---

## 📱 Responsive Design Flow

```
Desktop View (> 768px)
    ↓
Full modal width (xl: max-width)
    ↓
4 tabs horizontal
    ↓
Forms full width
    ↓
Cards in grid

Mobile View (< 768px)
    ↓
Full screen modal
    ↓
4 tabs stacked
    ↓
Forms single column
    ↓
Cards stacked
```

---

## 🔄 Error Handling Flow

```
User Action
    ↓
Function Called
    ↓
Try Block
    ├─→ API Call
    │       ↓
    │   [Success] → Process Response
    │       ↓
    │   Update UI
    │
    └─→ [Catch Error]
            ↓
        Parse Error Message
            ↓
        Check Error Type:
        ├─→ Network Error
        ├─→ Auth Error
        ├─→ Not Found
        └─→ Unknown
            ↓
        Show Error Message
            ↓
        Log to Console
```

---

## 💡 Optimization Points

```
Performance Optimizations:
├─→ Lazy load modal content
├─→ Cache API responses
├─→ Debounce API calls
├─→ Minimize DOM updates
└─→ Use event delegation

Security Optimizations:
├─→ Never log tokens
├─→ Use HTTPS only
├─→ Validate all inputs
├─→ Sanitize outputs
└─→ Clear sensitive data

UX Optimizations:
├─→ Loading indicators
├─→ Success/error feedback
├─→ Auto-save settings
├─→ Remember last tab
└─→ Quick templates
```

---

This architecture diagram shows how all components work together to provide a seamless Git integration experience!
