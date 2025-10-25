# Email Fetcher - Gmail & Outlook Integration

A modern, lightweight web application for fetching and viewing emails from Gmail and Outlook/Office 365 accounts. Built with pure HTML, CSS, and JavaScript - no frameworks required.

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

### Prerequisites

1. A web server to host the application (Python's built-in server, Node.js http-server, or any web server)
2. Google Cloud Console account (for Gmail integration)
3. Microsoft Azure account (for Outlook integration)

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

### Google Gmail API Setup

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

### Microsoft Outlook/Office 365 Setup

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

### Example config.js

```javascript
window.CONFIG = {
    GOOGLE_CLIENT_ID: '123456789-abcdefghijk.apps.googleusercontent.com',
    OUTLOOK_CLIENT_ID: 'abcd1234-5678-90ef-ghij-klmnopqrstuv'
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

### Gmail Connection Issues

- Ensure Gmail API is enabled in Google Cloud Console
- Verify authorized JavaScript origins match your domain exactly
- Check that the OAuth consent screen is configured
- Make sure you're using the correct Client ID

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

## Future Enhancements

- Email composition and sending
- Email search and filtering
- Attachment preview
- Email labels/categories management
- Dark mode toggle
- Email notifications
- Offline support with service workers

## License

MIT License - feel free to use this project for your own purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.