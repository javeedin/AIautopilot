# WMS Auto Pilot - Deployment Script (PowerShell)
# Run this script to deploy to GitHub

param(
    [Parameter(Mandatory=$false)]
    [string]$Username = "",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "wms-autopilot"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  WMS Auto Pilot - GitHub Deployment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Git is not installed" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git is installed" -ForegroundColor Green

# Get GitHub username if not provided
if ([string]::IsNullOrEmpty($Username)) {
    $Username = Read-Host "Enter your GitHub username"
}

Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   GitHub Username: $Username" -ForegroundColor White
Write-Host "   Repository Name: $RepoName" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Continue with deployment? (Y/N)"
if ($confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Cyan
Write-Host ""

# Initialize git if not already
if (!(Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files added" -ForegroundColor Green

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Initial commit: Modular WMS Auto Pilot v4"
Write-Host "✅ Changes committed" -ForegroundColor Green

# Set main branch
Write-Host "🌿 Setting main branch..." -ForegroundColor Yellow
git branch -M main
Write-Host "✅ Main branch set" -ForegroundColor Green

# Add remote
$remoteUrl = "https://github.com/$Username/$RepoName.git"
Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
Write-Host "   URL: $remoteUrl" -ForegroundColor White

$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    git remote set-url origin $remoteUrl
    Write-Host "✅ Remote URL updated" -ForegroundColor Green
} else {
    git remote add origin $remoteUrl
    Write-Host "✅ Remote added" -ForegroundColor Green
}

# Push to GitHub
Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "   (You may be prompted for GitHub credentials)" -ForegroundColor White
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  ✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your application is now on GitHub!" -ForegroundColor Cyan
    Write-Host "   Repository: https://github.com/$Username/$RepoName" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to your repository on GitHub" -ForegroundColor White
    Write-Host "   2. Go to Settings → Pages" -ForegroundColor White
    Write-Host "   3. Select 'main' branch as source" -ForegroundColor White
    Write-Host "   4. Your app will be live at:" -ForegroundColor White
    Write-Host "      https://$Username.github.io/$RepoName/" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "   - Repository doesn't exist on GitHub (create it first)" -ForegroundColor White
    Write-Host "   - Authentication failed (check your credentials)" -ForegroundColor White
    Write-Host "   - Network connection issues" -ForegroundColor White
    Write-Host ""
}
