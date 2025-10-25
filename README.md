# WMS Auto Pilot v4

🚀 **Warehouse Management System - Auto Pilot Module**

A powerful, modular web application for managing warehouse operations, executing database queries, and generating reports.

---

## ✨ Features

- 🔍 **Smart Query Execution** - Execute SQL queries with real-time results
- 📊 **Data Grid** - Advanced data grid with DevExpress integration
- 📝 **Procedure Management** - Save, manage, and execute PL/SQL procedures
- 📄 **Report Generation** - Export data to PDF and Excel
- 🎨 **Theme Support** - Light and Dark themes
- 💾 **Auto-Save** - Automatic saving of queries and configurations
- 🔧 **Customizable** - Fully customizable columns and filters
- 🔶 **Git Integration** - Push changes directly to GitHub from the application

---

## 🏗️ Architecture

This is a **modular, frontend-only** application organized as follows:

```
wms-autopilot/
├── index.html                 # Main entry point
├── assets/
│   ├── css/                   # Stylesheets (5 files)
│   └── js/                    # JavaScript modules (11 files)
├── components/                # Reusable HTML components
├── docs/                      # Documentation
└── scripts/                   # Deployment scripts
```

---

## 🚀 Quick Start

### Option 1: Open Locally
1. Download or clone this repository
2. Open `index.html` in your web browser
3. Start using the application!

### Option 2: Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Select `main` branch as source
4. Your app will be live at `https://YOUR_USERNAME.github.io/wms-autopilot/`

### Option 3: Use with .NET WinForms
```csharp
webView.CoreWebView2.Navigate("https://YOUR_USERNAME.github.io/wms-autopilot/");
```

---

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for external libraries)
- Oracle Database connection (for database features)

---

## 🛠️ Configuration

Edit `assets/js/config.js` to configure:

```javascript
const CONFIG = {
    DATABASE: {
        HOST: 'your-database-host',
        PORT: '1521',
        SERVICE: 'your-service',
        USERNAME: 'your-username',
        PASSWORD: 'your-password'
    }
};
```

---

## 🔶 Git Operations

Push your changes directly to GitHub without leaving the application!

### Quick Setup
1. Click the **Git Operations** button (🔶) in the header
2. Generate a Personal Access Token from [GitHub Settings](https://github.com/settings/tokens)
3. Configure your repository details
4. Test connection and start pushing!

**Features:**
- ✅ Secure credential storage
- 📊 Repository status viewing  
- 🚀 Commit and push operations
- 📜 Commit history display
- 🎯 File selection for commits
- 📝 Commit message templates

See the [Git Operations Guide](docs/GIT_OPERATIONS.md) for detailed instructions.

---

## 📚 Documentation

- [Git Operations Guide](docs/GIT_OPERATIONS.md) - **NEW!**
- [API Documentation](docs/API_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🎨 Themes

Toggle between Light and Dark themes using the theme switcher in the header.

---

## 🔒 Security Note

⚠️ **Important**: Never commit sensitive credentials to Git. Use environment variables or secure configuration management.

---

## 📦 Dependencies

### External Libraries
- **jQuery** - DOM manipulation
- **DevExpress DataGrid** - Advanced data grid
- **Chart.js** - Data visualization
- **jsPDF** - PDF generation
- **Font Awesome** - Icons

All dependencies are loaded via CDN.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- DevExpress for the amazing data grid
- Font Awesome for icons
- Inter font family

---

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Version**: 4.0  
**Last Updated**: 2025-01-24
