@echo off
REM Build script for ERP Project Manager Desktop Application

echo ========================================
echo ERP Project Manager - Build Script
echo ========================================
echo.

REM Check if .NET SDK is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK is not installed!
    echo Please download and install .NET 6.0 SDK from:
    echo https://dotnet.microsoft.com/download/dotnet/6.0
    pause
    exit /b 1
)

echo [1/4] Checking .NET SDK...
dotnet --version
echo.

echo [2/4] Restoring NuGet packages...
dotnet restore
if errorlevel 1 (
    echo ERROR: Failed to restore packages!
    pause
    exit /b 1
)
echo.

echo [3/4] Building application (Release)...
dotnet build --configuration Release
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [4/4] Build completed successfully!
echo.
echo Output location:
echo bin\Release\net6.0-windows\ERPProjectManager.exe
echo.
echo ========================================
echo Build SUCCESS!
echo ========================================
echo.
echo To run the application:
echo 1. Navigate to: bin\Release\net6.0-windows\
echo 2. Run: ERPProjectManager.exe
echo.
echo Or run: dotnet run
echo.

pause
