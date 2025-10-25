#!/bin/bash
# WMS Auto Pilot - Deployment Script (Bash)
# Run this script to deploy to GitHub

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="wms-autopilot"

echo -e "${CYAN}============================================${NC}"
echo -e "${CYAN}  WMS Auto Pilot - GitHub Deployment${NC}"
echo -e "${CYAN}============================================${NC}"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Error: Git is not installed${NC}"
    echo -e "${YELLOW}Please install Git first${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Git is installed${NC}"

# Get GitHub username
read -p "Enter your GitHub username: " USERNAME

echo ""
echo -e "${YELLOW}📋 Configuration:${NC}"
echo -e "   GitHub Username: ${USERNAME}"
echo -e "   Repository Name: ${REPO_NAME}"
echo ""

read -p "Continue with deployment? (Y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}🚀 Starting deployment...${NC}"
echo ""

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}📦 Initializing Git repository...${NC}"
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

# Add all files
echo -e "${YELLOW}📝 Adding files to Git...${NC}"
git add .
echo -e "${GREEN}✅ Files added${NC}"

# Commit
echo -e "${YELLOW}💾 Committing changes...${NC}"
git commit -m "Initial commit: Modular WMS Auto Pilot v4"
echo -e "${GREEN}✅ Changes committed${NC}"

# Set main branch
echo -e "${YELLOW}🌿 Setting main branch...${NC}"
git branch -M main
echo -e "${GREEN}✅ Main branch set${NC}"

# Add remote
REMOTE_URL="https://github.com/${USERNAME}/${REPO_NAME}.git"
echo -e "${YELLOW}🔗 Adding remote repository...${NC}"
echo -e "   URL: ${REMOTE_URL}"

if git remote get-url origin &> /dev/null; then
    git remote set-url origin $REMOTE_URL
    echo -e "${GREEN}✅ Remote URL updated${NC}"
else
    git remote add origin $REMOTE_URL
    echo -e "${GREEN}✅ Remote added${NC}"
fi

# Push to GitHub
echo ""
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
echo -e "   (You may be prompted for GitHub credentials)"
echo ""

if git push -u origin main; then
    echo ""
    echo -e "${GREEN}============================================${NC}"
    echo -e "${GREEN}  ✅ Deployment Successful!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo ""
    echo -e "${CYAN}🌐 Your application is now on GitHub!${NC}"
    echo -e "   Repository: https://github.com/${USERNAME}/${REPO_NAME}"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo -e "   1. Go to your repository on GitHub"
    echo -e "   2. Go to Settings → Pages"
    echo -e "   3. Select 'main' branch as source"
    echo -e "   4. Your app will be live at:"
    echo -e "      ${CYAN}https://${USERNAME}.github.io/${REPO_NAME}/${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Please check the error messages above${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo -e "   - Repository doesn't exist on GitHub (create it first)"
    echo -e "   - Authentication failed (check your credentials)"
    echo -e "   - Network connection issues"
    echo ""
    exit 1
fi
