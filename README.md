# Email Fetcher - Gmail & Outlook Integration

A modern, lightweight application for fetching and viewing emails from Gmail and Outlook/Office 365 accounts. Built with pure HTML, CSS, and JavaScript - no frameworks required.

**Supports both Web Browsers and Desktop Applications** (WinForms WebView, Electron, etc.)

## Features

- **Multiple Email Provider Support**
  - Gmail (Google Workspace)
  - Outlook / Office 365

- **Secure OAuth 2.0 Authentication**
  - Google OAuth for Gmail
  - Microsoft MSAL for Outlook

- **Email Management**
  - Fetch and display emails from connected accounts
  - View email metadata (sender, subject, date, preview)
  - Track read/unread status
  - Multiple account support with easy switching
  - Real-time email statistics

- **Modern UI**
  - Clean, responsive design
  - Mobile-friendly interface
  - Gradient theme
  - Loading states and animations

## Quick Start

### Choose Your Platform

**For Web Browser:** See instructions below
**For WinForms Desktop App:** See [WINFORMS-SETUP.md](WINFORMS-SETUP.md)

### Prerequisites (Web Browser Mode)

1. A web server to host the application (Python's built-in server, Node.js http-server, or any web server)
2. Google Cloud Console account (for Gmail integration)
3. Microsoft Azure account (for Outlook integration)

### Prerequisites (Desktop Mode)

1. Visual Studio with .NET and WebView2
2. Google Cloud Console account with "Desktop app" credentials
3. Microsoft Azure account with "Mobile and desktop applications" credentials
4. See [WINFORMS-SETUP.md](WINFORMS-SETUP.md) for complete setup

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/javeedin/AIautopilot.git
   cd AIautopilot
   ```

2. Set up API credentials (see Configuration section below)

3. Start a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8080

   # Using Python 2
   python -m SimpleHTTPServer 8080

   # Using Node.js (install http-server first: npm install -g http-server)
   http-server -p 8080

   # Using PHP
   php -S localhost:8080
   ```

4. Open your browser and navigate to `http://localhost:8080`

## Configuration

### Application Mode

In `config.js`, set your application mode:

```javascript
window.CONFIG = {
    APP_MODE: 'desktop',  // Use 'desktop' for WinForms/Electron, 'web' for browsers
    // ... other settings
};
```

### Google Gmail API Setup (Web Browser)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Gmail API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins:
     - `http://localhost:8080` (for local development)
     - Your production domain (e.g., `https://yourdomain.com`)
   - Add authorized redirect URIs:
     - `http://localhost:8080` (for local development)
     - Your production domain
5. Copy the Client ID
6. Open `config.js` and replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your Client ID

### Google Gmail API Setup (Desktop/WinForms)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Gmail API
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - **Choose "Desktop app"** (not Web application)
   - Name it (e.g., "Email Fetcher Desktop")
5. Copy the Client ID
6. Open `config.js` and set:
   ```javascript
   APP_MODE: 'desktop',
   GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com'
   ```

See [WINFORMS-SETUP.md](WINFORMS-SETUP.md) for complete desktop integration guide.

### Microsoft Outlook/Office 365 Setup (Web Browser)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure your app:
   - Name: Email Fetcher (or your preferred name)
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: "Single-page application (SPA)"
     - URI: `http://localhost:8080` (for local development)
5. After registration, copy the "Application (client) ID"
6. Configure API permissions:
   - Go to "API permissions"
   - Click "Add a permission" > "Microsoft Graph" > "Delegated permissions"
   - Add these permissions:
     - `Mail.Read` - Read user mail
     - `User.Read` - Sign in and read user profile
   - Click "Grant admin consent" if you have admin rights
7. Open `config.js` and replace `YOUR_OUTLOOK_CLIENT_ID_HERE` with your Application ID

### Microsoft Outlook/Office 365 Setup (Desktop/WinForms)

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations"
3. Click "New registration"
4. Configure:
   - Name: Email Fetcher Desktop
   - Account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI: Select **"Mobile and desktop applications"** platform
   - Add URI: `http://localhost`
5. Copy the "Application (client) ID"
6. Configure API permissions:
   - Add `Mail.Read` and `User.Read`
7. Enable "Allow public client flows" in Authentication settings
8. Open `config.js` and set:
   ```javascript
   APP_MODE: 'desktop',
   OUTLOOK_CLIENT_ID: 'your-application-id'
   ```

See [WINFORMS-SETUP.md](WINFORMS-SETUP.md) for complete desktop integration guide.

### Example config.js (Web Mode)

```javascript
window.CONFIG = {
    APP_MODE: 'web',
    GOOGLE_CLIENT_ID: '123456789-abcdefghijk.apps.googleusercontent.com',
    OUTLOOK_CLIENT_ID: 'abcd1234-5678-90ef-ghij-klmnopqrstuv'
};
```

### Example config.js (Desktop Mode)

```javascript
window.CONFIG = {
    APP_MODE: 'desktop',
    GOOGLE_CLIENT_ID: '123456789-abcdefghijk.apps.googleusercontent.com',
    OUTLOOK_CLIENT_ID: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
    DESKTOP_REDIRECT_URI: 'http://127.0.0.1:8080/oauth-callback.html'
};
```

## Usage

1. **Connect an Account**
   - Click "Connect Gmail" or "Connect Outlook"
   - Sign in with your account credentials
   - Grant the requested permissions

2. **Fetch Emails**
   - Select an account from the dropdown (if you have multiple)
   - Click "Fetch Emails"
   - View your emails in the list below

3. **Switch Accounts**
   - Use the account selector dropdown to switch between connected accounts
   - Click "Fetch Emails" again to load emails from the selected account

4. **Logout**
   - Click "Logout" to disconnect all accounts

## Project Structure

```
AIautopilot/
├── index.html          # Main HTML file
├── style.css           # Styles and responsive design
├── app.js              # Application logic and API integration
├── config.js           # API credentials configuration
└── README.md           # This file
```

## Security Notes

- **Access Tokens**: Current implementation stores tokens in memory during the session. In production, consider using more secure storage methods.
- **HTTPS**: Always use HTTPS in production to protect authentication tokens
- **Token Refresh**: Implement token refresh logic for long-running sessions
- **Scope Limitations**: The app only requests read-only access to emails

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Getting "400 Error" from Gmail?

This is the most common issue. See the detailed [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for step-by-step fixes.

**Quick checklist:**
1. Gmail API is enabled in Google Cloud Console
2. OAuth consent screen is configured
3. Authorized JavaScript origins = `http://localhost:8080` (exact match)
4. Client ID is copied correctly to config.js
5. Running from web server (not file://)

### Gmail Connection Issues

- Ensure Gmail API is enabled in Google Cloud Console
- Verify authorized JavaScript origins match your domain exactly (no trailing slash)
- Check that the OAuth consent screen is configured
- Make sure you're using the correct Client ID
- **Must run from web server** - `python -m http.server 8080`
- Check browser console (F12) for detailed error messages

### Outlook Connection Issues

- Verify API permissions are granted (Mail.Read, User.Read)
- Ensure redirect URI matches exactly (including protocol and port)
- Check that the app registration is configured for "Accounts in any organizational directory and personal Microsoft accounts"
- Clear browser cache and try again

### CORS Errors

- Make sure you're running the app through a web server (not opening HTML file directly)
- Verify your domain is added to authorized origins in API settings

## Technologies Used

- HTML5
- CSS3 (Flexbox, Grid, Animations)
- Vanilla JavaScript (ES6+)
- Google OAuth 2.0
- Microsoft MSAL (Microsoft Authentication Library)
- Gmail API
- Microsoft Graph API

## Platform Support

- **Web Browsers**: Chrome, Firefox, Safari, Edge (all modern versions)
- **Desktop**: WinForms with WebView2 (see [WINFORMS-SETUP.md](WINFORMS-SETUP.md))
- **Desktop**: Electron (similar setup to WinForms)
- **Desktop**: Any platform with embedded browser/WebView support

## Future Enhancements

- Email composition and sending
- Email search and filtering
- Attachment preview
- Email labels/categories management
- Dark mode toggle
- Email notifications
- Offline support with service workers
- Token refresh mechanism
- Desktop app installer

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.