# Troubleshooting Gmail 400 Error

If you're getting a **"400. That's an error. The server cannot process the request because it is malformed"** error when connecting to Gmail, follow these steps:

## Step-by-Step Fix

### 1. Verify Google Cloud Console Setup

Go to [Google Cloud Console](https://console.cloud.google.com/) and check:

#### A. Enable Gmail API
1. Select your project
2. Go to **APIs & Services > Library**
3. Search for **Gmail API**
4. Click **ENABLE** (if not already enabled)

#### B. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you're using Google Workspace)
3. Fill in:
   - App name: `Email Fetcher` (or your choice)
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. **Skip** adding scopes (we'll do this via code)
6. Add test users if needed
7. Click **Save and Continue**

#### C. Create OAuth 2.0 Client ID
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Choose **Web application**
4. **Important - Set these correctly:**
   - Name: `Email Fetcher Web Client`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:8080
     ```
     (Add your production domain later, e.g., https://yourdomain.com)

   - **Authorized redirect URIs:**
     ```
     http://localhost:8080
     ```
     (Must match exactly - no trailing slash)

5. Click **Create**
6. **Copy the Client ID** (looks like: `123456789-abc...xyz.apps.googleusercontent.com`)

### 2. Update config.js

Open `config.js` and replace the placeholder:

```javascript
window.CONFIG = {
    GOOGLE_CLIENT_ID: '123456789-abcdefghijk.apps.googleusercontent.com',  // Your actual Client ID
    OUTLOOK_CLIENT_ID: 'YOUR_OUTLOOK_CLIENT_ID_HERE'
};
```

### 3. Run from Web Server (NOT file://)

The app MUST run from a web server:

```bash
# Use Python (recommended)
python -m http.server 8080

# OR Node.js
npx http-server -p 8080

# OR PHP
php -S localhost:8080
```

Then access: `http://localhost:8080`

DO NOT open index.html directly (file:// protocol will not work)

### 4. Common Mistakes Checklist

- [ ] Gmail API is enabled in Google Cloud Console
- [ ] OAuth consent screen is configured
- [ ] Authorized JavaScript origins includes `http://localhost:8080` (exact match)
- [ ] Authorized redirect URIs includes `http://localhost:8080` (exact match, no trailing /)
- [ ] Client ID is correctly copied to config.js (no quotes inside the ID)
- [ ] Running from `http://localhost:8080` (not file://)
- [ ] No browser extensions blocking popups
- [ ] Not in incognito/private mode (or third-party cookies are allowed)

### 5. Check Browser Console

Open Developer Tools (F12) and check:

1. **Console tab** - Look for error messages
2. **Network tab** - Check failed requests
3. Look for CORS errors or blocked requests

### 6. Still Not Working?

Try these:

1. **Clear browser cache and cookies**
   ```
   Ctrl+Shift+Delete (Chrome/Edge)
   Cmd+Shift+Delete (Mac)
   ```

2. **Try a different browser**
   - Sometimes browser extensions interfere
   - Try Chrome Incognito with extensions disabled

3. **Verify the URL exactly matches**
   ```
   Google Console: http://localhost:8080
   Browser URL bar: http://localhost:8080
   ```
   (NOT: http://127.0.0.1:8080 or http://localhost:8080/)

4. **Check if port is correct**
   - If using different port, update both:
     - Google Console authorized origins
     - Your browser URL

## Example Working Configuration

**Google Cloud Console:**
```
Authorized JavaScript origins:
  http://localhost:8080

Authorized redirect URIs:
  http://localhost:8080
```

**config.js:**
```javascript
window.CONFIG = {
    GOOGLE_CLIENT_ID: '123456789-abc...xyz.apps.googleusercontent.com'
};
```

**Terminal:**
```bash
python -m http.server 8080
```

**Browser:**
```
http://localhost:8080
```

## Test the Setup

After fixing:
1. Reload the page
2. Check for yellow warning box (should show if config is wrong)
3. Click "Connect Gmail"
4. Google popup should appear
5. Sign in and grant permissions

If you still see the error, please share:
- The exact error message from browser console (F12)
- Your Google Cloud Console settings (screenshot)
- The URL you're accessing
