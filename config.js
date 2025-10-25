// Configuration file for Email Fetcher
// Replace the placeholder values with your actual API credentials

window.CONFIG = {
    // Application mode: 'web' or 'desktop'
    // Use 'desktop' when running in WinForms WebView or other desktop contexts
    APP_MODE: 'desktop', // Change to 'web' for browser-based usage

    // Google OAuth 2.0 Client ID
    // For desktop apps, use "Desktop app" type credentials from Google Cloud Console
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',

    // Microsoft Azure App Client ID
    // Configure for "Mobile and desktop applications" in Azure Portal
    OUTLOOK_CLIENT_ID: 'YOUR_OUTLOOK_CLIENT_ID_HERE',

    // Redirect URIs for desktop mode (don't change these unless needed)
    DESKTOP_REDIRECT_URI: 'http://127.0.0.1:8080/oauth-callback.html',

    // Alternative: Use custom URI scheme if you configure it in your WinForms app
    // DESKTOP_REDIRECT_URI: 'myapp://oauth-callback'
};

// Instructions for DESKTOP/WINFORMS WEBVIEW:
//
// FOR GOOGLE GMAIL API (Desktop App):
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Gmail API
// 4. Go to Credentials > Create Credentials > OAuth client ID
// 5. Choose "Desktop app" (NOT Web application)
// 6. Name it (e.g., "Email Fetcher Desktop")
// 7. Copy the Client ID and paste it above
// 8. No redirect URIs needed for desktop app type
//
// FOR MICROSOFT OUTLOOK/OFFICE 365 (Desktop App):
// 1. Go to https://portal.azure.com/
// 2. Navigate to Azure Active Directory > App registrations
// 3. Click "New registration"
// 4. Name your app and select "Accounts in any organizational directory and personal Microsoft accounts"
// 5. Set Redirect URI to "Mobile and desktop applications" platform
// 6. Add redirect URI: http://localhost
// 7. After registration, copy the "Application (client) ID" and paste it above
// 8. Go to "API permissions" and add:
//    - Microsoft Graph > Delegated permissions > Mail.Read
//    - Microsoft Graph > Delegated permissions > User.Read
// 9. Enable "Allow public client flows" in Authentication > Advanced settings
//
// FOR WEB BROWSER (when APP_MODE = 'web'):
// 1. Use "Web application" type for Google OAuth
// 2. Add authorized JavaScript origins: your domain
// 3. For Microsoft, use "Single-page application" platform

