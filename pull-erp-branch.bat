@echo off
echo ========================================
echo Pulling ERP Multi-Tab Architecture Branch
echo ========================================
echo.

cd /d C:\javeed\Aiautopilot

echo Current directory: %CD%
echo.

echo Step 1: Fetching all branches from remote...
git fetch origin
echo.

echo Step 2: Checking out the ERP branch...
git checkout claude/erp-multi-tab-architecture-011CUXKZzfk2hZKHdsWDycQD
echo.

echo Step 3: Pulling latest changes...
git pull origin claude/erp-multi-tab-architecture-011CUXKZzfk2hZKHdsWDycQD
echo.

echo Step 4: Verifying erp-app folder exists...
if exist erp-app (
    echo SUCCESS! erp-app folder found!
    dir erp-app
) else (
    echo ERROR: erp-app folder not found!
    echo Current branch:
    git branch --show-current
)

echo.
echo ========================================
echo Done! Press any key to exit...
pause
