// Configuration file for Email Fetcher
// Replace the placeholder values with your actual API credentials

window.CONFIG = {
    // Google OAuth 2.0 Client ID
    // Get this from: https://console.cloud.google.com/apis/credentials
    GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com',

    // Microsoft Azure App Client ID
    // Get this from: https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
    OUTLOOK_CLIENT_ID: 'YOUR_OUTLOOK_CLIENT_ID_HERE'
};

// Instructions:
//
// FOR GOOGLE GMAIL API:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select an existing one
// 3. Enable the Gmail API
// 4. Go to Credentials > Create Credentials > OAuth client ID
// 5. Choose "Web application"
// 6. Add authorized JavaScript origins: http://localhost:8080 (or your domain)
// 7. Add authorized redirect URIs: http://localhost:8080 (or your domain)
// 8. Copy the Client ID and paste it above
//
// FOR MICROSOFT OUTLOOK/OFFICE 365:
// 1. Go to https://portal.azure.com/
// 2. Navigate to Azure Active Directory > App registrations
// 3. Click "New registration"
// 4. Name your app and select "Accounts in any organizational directory and personal Microsoft accounts"
// 5. Set Redirect URI to "Single-page application (SPA)" and add your URL (e.g., http://localhost:8080)
// 6. After registration, copy the "Application (client) ID" and paste it above
// 7. Go to "API permissions" and add:
//    - Microsoft Graph > Delegated permissions > Mail.Read
//    - Microsoft Graph > Delegated permissions > User.Read
// 8. Click "Grant admin consent" if required
