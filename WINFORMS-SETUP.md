# WinForms WebView Setup Guide

This guide explains how to integrate the Email Fetcher application into a WinForms desktop application using WebView2.

## Overview

The application now supports **Desktop Mode**, which allows it to run directly in a WinForms WebView without requiring a separate web server. The OAuth flows have been adapted to work in desktop contexts.

## Prerequisites

1. Visual Studio 2019 or later
2. .NET Framework 4.7.2 or .NET 6.0+
3. Microsoft Edge WebView2 Runtime
4. NuGet Package: `Microsoft.Web.WebView2`

## Step 1: Configure config.js

Set the application mode to 'desktop':

```javascript
window.CONFIG = {
    APP_MODE: 'desktop',  // Important: Set to 'desktop'
    GOOGLE_CLIENT_ID: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    OUTLOOK_CLIENT_ID: 'YOUR_OUTLOOK_CLIENT_ID'
};
```

## Step 2: Setup OAuth Credentials for Desktop

### Google Gmail API (Desktop App)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. **Important**: Choose **"Desktop app"** (NOT Web application)
6. Name it: "Email Fetcher Desktop"
7. Click Create
8. Copy the **Client ID** and paste into config.js

**Note**: Desktop apps don't need redirect URIs configured - Google handles this automatically with the out-of-band (OOB) flow.

### Microsoft Outlook/Office 365 (Desktop App)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure:
   - Name: "Email Fetcher Desktop"
   - Account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Select **"Mobile and desktop applications"** platform
   - Add URI: `http://localhost`
5. Copy **Application (client) ID** to config.js
6. Go to **API permissions**:
   - Add **Microsoft Graph** → **Delegated permissions**
   - Add: `Mail.Read` and `User.Read`
   - Grant admin consent if prompted
7. Go to **Authentication** → **Advanced settings**
   - Enable **"Allow public client flows"** = Yes

## Step 3: WinForms Implementation

### Basic WinForms Setup

```csharp
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System;
using System.IO;
using System.Windows.Forms;

namespace EmailFetcherApp
{
    public partial class MainForm : Form
    {
        private WebView2 webView;

        public MainForm()
        {
            InitializeComponent();
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            // Initialize WebView2
            webView = new WebView2
            {
                Dock = DockStyle.Fill
            };
            this.Controls.Add(webView);

            await webView.EnsureCoreWebView2Async(null);

            // Get the path to your HTML files
            string appPath = Path.Combine(Application.StartupPath, "EmailFetcher");
            string indexPath = Path.Combine(appPath, "index.html");

            // Navigate to the local HTML file
            webView.CoreWebView2.Navigate("file:///" + indexPath.Replace("\\", "/"));

            // Optional: Handle navigation events
            webView.NavigationStarting += WebView_NavigationStarting;
        }

        private void WebView_NavigationStarting(object sender,
            CoreWebView2NavigationStartingEventArgs e)
        {
            // You can intercept navigation here if needed
            Console.WriteLine($"Navigating to: {e.Uri}");
        }
    }
}
```

### Project Structure

Organize your files like this:

```
YourWinFormsProject/
├── bin/
│   └── Debug/
│       └── EmailFetcher/
│           ├── index.html
│           ├── style.css
│           ├── app.js
│           └── config.js
├── MainForm.cs
├── MainForm.Designer.cs
└── Program.cs
```

### Copy Files to Output Directory

In your `.csproj` file, add:

```xml
<ItemGroup>
  <None Update="EmailFetcher\**\*">
    <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
  </None>
</ItemGroup>
```

Or manually: Right-click each file → Properties → Copy to Output Directory → "Copy if newer"

## Step 4: Advanced Configuration

### Enable Developer Tools (for debugging)

```csharp
private async void InitializeWebView()
{
    await webView.EnsureCoreWebView2Async(null);

    // Enable dev tools (F12)
    webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

    // Open dev tools automatically (optional)
    // webView.CoreWebView2.OpenDevToolsWindow();

    webView.CoreWebView2.Navigate("file:///" + indexPath.Replace("\\", "/"));
}
```

### Handle External Links

Prevent OAuth popups from opening in external browser:

```csharp
private void InitializeWebView()
{
    // ...

    webView.CoreWebView2.NewWindowRequested += (sender, e) =>
    {
        // Open in same WebView instead of new window
        e.Handled = true;
        webView.CoreWebView2.Navigate(e.Uri);
    };
}
```

### JavaScript-C# Communication (Optional)

If you want to communicate between JavaScript and C#:

```csharp
// In C#
private async void InitializeWebView()
{
    await webView.EnsureCoreWebView2Async(null);

    // Add C# object to JavaScript
    webView.CoreWebView2.AddHostObjectToScript("hostApp", new HostApp());

    webView.CoreWebView2.Navigate("file:///" + indexPath.Replace("\\", "/"));
}

[ClassInterface(ClassInterfaceType.AutoDual)]
[ComVisible(true)]
public class HostApp
{
    public void ShowMessage(string message)
    {
        MessageBox.Show(message);
    }
}
```

```javascript
// In JavaScript (app.js)
// Call C# from JavaScript
if (window.chrome.webview) {
    window.chrome.webview.hostObjects.hostApp.ShowMessage('Hello from JavaScript!');
}
```

## Step 5: Testing

1. Build your WinForms project
2. Ensure all HTML/CSS/JS files are copied to output directory
3. Run the application
4. You should see "Mode: Desktop/WebView" in the top-right corner
5. Click "Connect Gmail" or "Connect Outlook"
6. OAuth will open in the WebView itself
7. Sign in and grant permissions
8. You'll be redirected back and emails will load

## Troubleshooting

### Issue: OAuth window doesn't close after authentication

**Solution**: The app uses Google's out-of-band (OOB) flow for desktop apps. After authentication, Google will show a page with a token. The app should automatically detect this and continue. If not:

1. Check browser console (F12) for errors
2. Verify you're using "Desktop app" type credentials from Google
3. Make sure config.js has `APP_MODE: 'desktop'`

### Issue: "file://" protocol errors

**Solution**: WebView2 should handle file:// protocol fine. If you see errors:

1. Ensure WebView2 Runtime is installed
2. Check that all files (index.html, app.js, config.js, style.css) are in the same directory
3. Verify file paths in your C# code

### Issue: External libraries not loading

The app loads:
- Google API library (accounts.google.com/gsi/client)
- Microsoft MSAL library (alcdn.msauth.net)

**Solution**: Ensure WebView has internet access:

```csharp
webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
// Allow external resources
```

### Issue: CORS errors

Desktop mode uses direct API calls that shouldn't have CORS issues. If you see them:

1. Verify you're using correct API endpoints
2. Check that tokens are being sent correctly
3. Enable developer tools to see detailed errors

## Alternative: Using HTTP Server Mode

If you prefer, you can still run a local server and point WebView to it:

```csharp
// Start a simple HTTP server or use IIS Express
webView.CoreWebView2.Navigate("http://localhost:8080/index.html");
```

Then set `APP_MODE: 'web'` in config.js and use "Web application" type credentials.

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage. For production:
   - Consider encrypting tokens
   - Use Windows Credential Manager
   - Implement token refresh logic

2. **Client Secret**: Desktop apps are "public clients" and don't need client secrets

3. **HTTPS**: For production, consider hosting on HTTPS or using signed desktop credentials

## Example Complete C# Code

```csharp
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System;
using System.IO;
using System.Windows.Forms;

namespace EmailFetcherApp
{
    public partial class MainForm : Form
    {
        private WebView2 webView;

        public MainForm()
        {
            InitializeComponent();
            this.Text = "Email Fetcher";
            this.Size = new System.Drawing.Size(1200, 800);
            InitializeWebView();
        }

        private async void InitializeWebView()
        {
            webView = new WebView2
            {
                Dock = DockStyle.Fill
            };
            this.Controls.Add(webView);

            await webView.EnsureCoreWebView2Async(null);

            // Configure settings
            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
            webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;

            // Handle new windows
            webView.CoreWebView2.NewWindowRequested += (s, e) =>
            {
                e.Handled = true;
                webView.CoreWebView2.Navigate(e.Uri);
            };

            // Navigate to local HTML
            string appPath = Path.Combine(Application.StartupPath, "EmailFetcher");
            string indexPath = Path.Combine(appPath, "index.html");

            if (File.Exists(indexPath))
            {
                webView.CoreWebView2.Navigate("file:///" + indexPath.Replace("\\", "/"));
            }
            else
            {
                MessageBox.Show($"index.html not found at: {indexPath}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
```

## Next Steps

- Implement token refresh
- Add offline support
- Create installer with all dependencies
- Add error logging
- Implement auto-update mechanism

## Support

For issues specific to WinForms integration, check:
- [WebView2 Documentation](https://docs.microsoft.com/microsoft-edge/webview2/)
- [WinForms WebView2 Guide](https://docs.microsoft.com/microsoft-edge/webview2/get-started/winforms)
