# Git Operations Guide

## Overview
The WMS Auto Pilot now includes built-in Git integration, allowing you to push changes directly to your GitHub repository without leaving the application.

## Features

### 🔐 Secure Credential Storage
- Store GitHub credentials locally in your browser
- Personal Access Token authentication
- Optional "Remember Me" functionality

### 📊 Repository Status
- View repository information
- List all branches
- See recent commits
- Monitor repository activity

### 🚀 Push Operations
- Select files to commit
- Write commit messages with templates
- Push changes directly to GitHub
- Real-time operation feedback

### 📜 Commit History
- View recent commits
- See commit details and authors
- Track changes over time

## Setup Instructions

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" (classic)
3. Give it a descriptive name (e.g., "WMS Auto Pilot")
4. Select the following scopes:
   - ✅ `repo` (Full control of private repositories)
     - This includes:
       - repo:status
       - repo_deployment
       - public_repo
       - repo:invite
       - security_events
5. Click "Generate token"
6. **IMPORTANT:** Copy the token immediately - you won't be able to see it again!

### Step 2: Configure Git Settings

1. Open WMS Auto Pilot
2. Click the **Git Operations** button (🔶 GitHub icon) in the header
3. Go to the **Settings** tab
4. Fill in the following information:

   - **GitHub Username**: Your GitHub username (e.g., `john-doe`)
   - **Personal Access Token**: Paste the token you created in Step 1
   - **Repository Owner**: The username or organization that owns the repo
   - **Repository Name**: The name of your repository (e.g., `wms-autopilot-modular`)
   - **Branch**: The branch to push to (default: `main`)

5. Check "Remember credentials" if you want to save them
6. Click **Test Connection** to verify your settings
7. Click **Save Configuration** once the test succeeds

## Usage

### Viewing Repository Status

1. Click the **Git Operations** button
2. Go to the **Status** tab
3. Click **Refresh Status**

You'll see:
- Repository information (name, description, stars, etc.)
- All available branches
- Recent commits with authors and timestamps

### Committing and Pushing Changes

1. Click the **Git Operations** button
2. Go to the **Operations** tab
3. The file list will show all project files
4. Select the files you want to commit (all are selected by default)
5. Write a commit message, or use a quick template:
   - **Feature** - `feat: ` for new features
   - **Fix** - `fix: ` for bug fixes
   - **Docs** - `docs: ` for documentation
   - **Style** - `style: ` for styling changes
   - **Refactor** - `refactor: ` for code refactoring
   - **Update** - `Update: ` for general updates
6. Click **Commit & Push**
7. Wait for the operation to complete

### Viewing Commit History

1. Click the **Git Operations** button
2. Go to the **History** tab
3. Click **Load History**

You'll see the last 20 commits with:
- Commit message
- Author name and email
- Commit date and time
- Short SHA
- Link to view on GitHub

## Important Notes

### Security
- Your Personal Access Token is stored locally in your browser's localStorage
- Never share your token with anyone
- You can clear credentials at any time from the Settings tab
- Tokens can be revoked from GitHub settings if compromised

### Limitations
- This feature works with GitHub only (not GitLab, Bitbucket, etc.)
- File content pushing is simplified - in production, you'd need proper file reading
- Pull operations show information but don't actually download files (web limitation)
- Large binary files are not supported

### Best Practices
1. **Commit Often**: Make small, frequent commits
2. **Write Clear Messages**: Describe what changed and why
3. **Use Templates**: Standardize your commit messages
4. **Review Before Pushing**: Double-check selected files
5. **Test Connection First**: Always verify credentials before pushing

## Troubleshooting

### "Connection failed"
- Check your GitHub username and token
- Verify the repository owner and name are correct
- Ensure your token has `repo` scope
- Check if the repository exists and you have access

### "Push failed"
- Verify you have write access to the repository
- Check if the branch exists
- Ensure your token hasn't expired
- Try refreshing the repository status first

### Token Expired
- Personal Access Tokens can expire based on your settings
- Generate a new token and update your configuration
- Consider setting a longer expiration or no expiration

### Repository Not Found
- Double-check the owner and repository names
- Verify the repository is not archived
- Ensure you have the correct access permissions

## Advanced Usage

### Commit Message Conventions

Follow conventional commit format for better changelog generation:

```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat: Add Git integration feature

Added comprehensive Git operations including:
- Repository status viewing
- Commit and push functionality
- Commit history display

Closes #123
```

```
fix: Resolve authentication token issue

Fixed bug where tokens with special characters
weren't being properly encoded.
```

## API Reference

The Git module exposes the following JavaScript API:

```javascript
// Access the Git operations module
window.GitOps

// Test connection
await GitOps.testConnection()

// Get repository status
await GitOps.getStatus()

// Push files
await GitOps.pushFiles(files, commitMessage)

// Get commit history
await GitOps.getHistory(limit)

// Get file content
await GitOps.getFileContent(path)

// Update file
await GitOps.updateFile(path, content, message, sha)
```

## Support

For issues or questions:
1. Check this documentation first
2. Review GitHub's [Personal Access Token documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
3. Ensure your repository settings allow API access
4. Test with GitHub's API directly if issues persist

---

**Note:** This feature requires an active internet connection and a valid GitHub account with repository access.
