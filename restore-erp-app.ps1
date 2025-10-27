# Force restore erp-app folder from git
Write-Host "================================"
Write-Host "Force Restoring ERP-App Folder"
Write-Host "================================"
Write-Host ""

$repoPath = "C:\javeed\Aiautopilot"
Set-Location $repoPath

Write-Host "Current directory: $pwd"
Write-Host ""

# Check current branch
Write-Host "Step 1: Checking current branch..."
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch"
Write-Host ""

# Fetch latest
Write-Host "Step 2: Fetching from remote..."
git fetch origin
Write-Host ""

# Checkout specific files from remote
Write-Host "Step 3: Force restoring erp-app folder from remote..."
git checkout origin/claude/erp-multi-tab-architecture-011CUXKZzfk2hZKHdsWDycQD -- erp-app
Write-Host ""

# Verify
Write-Host "Step 4: Verifying erp-app folder..."
if (Test-Path "erp-app") {
    Write-Host "SUCCESS! erp-app folder restored!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contents of erp-app:"
    Get-ChildItem erp-app -Recurse | Select-Object FullName
} else {
    Write-Host "ERROR: erp-app folder still missing!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Diagnostic info:"
    Write-Host "Git status:"
    git status
}

Write-Host ""
Write-Host "================================"
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
