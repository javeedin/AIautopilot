# Deployment Guide

## Overview
This guide explains how to deploy WMS Auto Pilot to various platforms.

---

## Deployment Options

### 1. GitHub Pages (Recommended) 🌐

**Pros:**
- ✅ Free hosting
- ✅ HTTPS by default
- ✅ Custom domain support
- ✅ Automatic deployment

**Steps:**

#### A. Using Deployment Script
```powershell
# Windows PowerShell
cd wms-autopilot
.\scripts\deploy.ps1
```

```bash
# Linux/Mac
cd wms-autopilot
./scripts/deploy.sh
```

#### B. Manual Deployment
1. Create repository on GitHub:
   ```
   Repository name: wms-autopilot
   Visibility: Public (for GitHub Pages)
   ```

2. Initialize and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/wms-autopilot.git
   git push -u origin main
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Click Save

4. Access your app:
   ```
   https://YOUR_USERNAME.github.io/wms-autopilot/
   ```

---

### 2. Local Development 💻

**Use Case:** Testing and development

**Steps:**
1. Clone/download the repository
2. Open `index.html` in a browser
3. Or use a local server:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (with http-server)
npx http-server

# PHP
php -S localhost:8000
```

4. Access: `http://localhost:8000`

---

### 3. .NET WinForms Integration 🖥️

**Use Case:** Embed in desktop application

**Code Example:**
```csharp
using Microsoft.Web.WebView2.WinForms;
using Microsoft.Web.WebView2.Core;

public class WMSBrowserForm : Form
{
    private WebView2 webView;
    
    public WMSBrowserForm()
    {
        InitializeComponent();
        InitializeWebView();
    }
    
    private async void InitializeWebView()
    {
        webView = new WebView2();
        webView.Dock = DockStyle.Fill;
        this.Controls.Add(webView);
        
        await webView.EnsureCoreWebView2Async();
        
        // Option 1: Load from GitHub Pages
        webView.CoreWebView2.Navigate(
            "https://YOUR_USERNAME.github.io/wms-autopilot/"
        );
        
        // Option 2: Load local file
        // string htmlPath = Path.Combine(
        //     Application.StartupPath, 
        //     "wms-autopilot", 
        //     "index.html"
        // );
        // webView.CoreWebView2.Navigate(
        //     new Uri(htmlPath).AbsoluteUri
        // );
    }
}
```

---

### 4. Static Hosting Services ☁️

#### Netlify
1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop `wms-autopilot` folder
3. Done! Your site is live

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd wms-autopilot
vercel
```

#### GitHub Raw (Direct Access)
```
https://raw.githubusercontent.com/YOUR_USERNAME/wms-autopilot/main/index.html
```
⚠️ Not recommended for production (no caching, no CDN)

---

## Configuration

### Before Deployment

#### 1. Update Configuration
Edit `assets/js/config.js`:
```javascript
const CONFIG = {
    API_BASE_URL: 'https://your-production-api.com/api',
    DATABASE: {
        // Update with production values
    }
};
```

#### 2. Remove Sensitive Data
- Never commit credentials
- Use environment variables
- Review `.gitignore`

#### 3. Test Locally
```bash
# Run local server
python -m http.server 8000

# Open browser
# http://localhost:8000
```

---

## Post-Deployment

### 1. Verify Deployment
- ✅ All CSS files load
- ✅ All JS files load
- ✅ External libraries load
- ✅ No console errors
- ✅ Theme toggle works
- ✅ Modals open/close

### 2. Test Features
- [ ] Database connection
- [ ] Query execution
- [ ] Procedure management
- [ ] Data grid display
- [ ] Excel export
- [ ] PDF export
- [ ] Theme switching

### 3. Performance Check
- Page load time < 3 seconds
- No JavaScript errors
- Responsive design works
- All icons display

---

## Troubleshooting

### Issue: CSS Not Loading
**Solution:**
- Check file paths in `index.html`
- Ensure paths are relative
- Verify files exist

### Issue: JavaScript Errors
**Solution:**
- Open browser console (F12)
- Check for 404 errors
- Verify script loading order

### Issue: GitHub Pages 404
**Solution:**
- Ensure repository is public
- Check Pages settings
- Wait 5-10 minutes for deployment
- Clear browser cache

### Issue: CORS Errors
**Solution:**
- Use relative paths
- Avoid absolute URLs
- Check API CORS settings

---

## Continuous Deployment

### Automated Updates

1. Make changes locally
2. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
3. GitHub Pages auto-deploys (1-2 minutes)

### Version Control

```bash
# Create a new version
git tag -a v4.0 -m "Version 4.0"
git push origin v4.0

# List versions
git tag
```

---

## Custom Domain (Optional)

### GitHub Pages
1. Buy domain (e.g., wms-autopilot.com)
2. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153
   ```
3. Add CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: YOUR_USERNAME.github.io
   ```
4. In repository settings → Pages:
   - Custom domain: your-domain.com
   - Save
   - Wait for DNS propagation (up to 24 hours)

---

## Rollback

### Revert to Previous Version
```bash
# View commit history
git log

# Revert to specific commit
git revert COMMIT_HASH

# Or reset (dangerous!)
git reset --hard COMMIT_HASH
git push --force
```

---

## Security Checklist

- [ ] No hardcoded credentials
- [ ] HTTPS enabled
- [ ] `.gitignore` configured
- [ ] Sensitive data removed
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Input validation in place

---

## Performance Optimization

### Tips:
1. **Minify** CSS and JavaScript (optional)
2. **CDN** - Use CDNs for libraries
3. **Caching** - GitHub Pages handles this
4. **Image Optimization** - Compress images
5. **Lazy Loading** - Load resources as needed

---

## Monitoring

### GitHub Stats
- Check repository insights
- Monitor traffic
- Review popular content

### User Feedback
- Enable GitHub Issues
- Create feedback form
- Monitor error logs

---

## Support

For deployment issues:
1. Check this guide
2. Review [GitHub Pages documentation](https://docs.github.com/en/pages)
3. Open an issue on GitHub
4. Check deployment logs

---

**Version**: 4.0  
**Last Updated**: 2025-01-24
