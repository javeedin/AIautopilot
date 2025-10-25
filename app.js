// Email Fetcher Application
// Supports Gmail (Google) and Outlook (Microsoft) integration
// Works in both web browsers and desktop WebView (WinForms, Electron, etc.)

class EmailFetcher {
    constructor() {
        this.accounts = [];
        this.currentAccount = null;
        this.msalInstance = null;
        this.isDesktopMode = false;
        this.init();
    }

    init() {
        // Determine if running in desktop mode
        this.isDesktopMode = window.CONFIG?.APP_MODE === 'desktop';

        // Validate configuration and environment
        this.validateSetup();

        // Initialize Microsoft Authentication Library
        this.initMSAL();

        // Set up event listeners
        this.setupEventListeners();

        // Check for OAuth callback
        this.checkOAuthCallback();

        // Check for existing sessions
        this.checkExistingSessions();
    }

    validateSetup() {
        const issues = [];

        // Check if running from file:// protocol (only warn in web mode)
        if (!this.isDesktopMode && window.location.protocol === 'file:') {
            issues.push('⚠️ You are running from file:// protocol. Please use a web server (e.g., python -m http.server 8080)');
        }

        // Check if config is loaded
        if (!window.CONFIG) {
            issues.push('⚠️ Config file not loaded. Make sure config.js is loaded before app.js');
        } else {
            // Check Google Client ID
            if (!window.CONFIG.GOOGLE_CLIENT_ID || window.CONFIG.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
                issues.push('⚠️ Google Client ID not configured in config.js');
            }

            // Check Outlook Client ID
            if (!window.CONFIG.OUTLOOK_CLIENT_ID || window.CONFIG.OUTLOOK_CLIENT_ID.includes('YOUR_OUTLOOK_CLIENT_ID')) {
                issues.push('⚠️ Outlook Client ID not configured in config.js');
            }

            // Show mode indicator
            const modeIndicator = document.createElement('div');
            modeIndicator.className = 'mode-indicator';
            modeIndicator.textContent = `Mode: ${this.isDesktopMode ? 'Desktop/WebView' : 'Web Browser'}`;
            document.querySelector('header').appendChild(modeIndicator);
        }

        if (issues.length > 0) {
            const warningDiv = document.createElement('div');
            warningDiv.className = 'setup-warning';
            warningDiv.innerHTML = `
                <h3>⚙️ Setup Required</h3>
                <ul>
                    ${issues.map(issue => `<li>${issue}</li>`).join('')}
                </ul>
                <p>See README.md for setup instructions.</p>
            `;
            document.querySelector('.auth-section').prepend(warningDiv);
        }
    }

    initMSAL() {
        if (!window.CONFIG || !window.CONFIG.OUTLOOK_CLIENT_ID) return;

        const msalConfig = {
            auth: {
                clientId: window.CONFIG.OUTLOOK_CLIENT_ID,
                authority: 'https://login.microsoftonline.com/common',
                redirectUri: this.isDesktopMode ? 'http://localhost' : window.location.origin
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false
            }
        };

        if (window.msal) {
            try {
                this.msalInstance = new msal.PublicClientApplication(msalConfig);
            } catch (error) {
                console.error('MSAL initialization error:', error);
            }
        }
    }

    setupEventListeners() {
        // Google Authentication
        document.getElementById('googleAuthBtn').addEventListener('click', () => {
            this.authenticateGoogle();
        });

        // Outlook Authentication
        document.getElementById('outlookAuthBtn').addEventListener('click', () => {
            this.authenticateOutlook();
        });

        // Fetch emails button
        document.getElementById('fetchEmailsBtn').addEventListener('click', () => {
            this.fetchEmails();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Account selector
        document.getElementById('accountSelector').addEventListener('change', (e) => {
            this.switchAccount(e.target.value);
        });

        // Listen for messages from popup windows (desktop mode)
        window.addEventListener('message', (event) => {
            if (event.data.type === 'oauth_token') {
                this.handleOAuthMessage(event.data);
            }
        });
    }

    // Check if this page is an OAuth callback
    checkOAuthCallback() {
        const hash = window.location.hash;
        const search = window.location.search;

        if (hash && hash.includes('access_token')) {
            // Handle implicit flow callback
            this.handleImplicitFlowCallback(hash);
        } else if (search && search.includes('code=')) {
            // Handle authorization code flow callback
            this.handleAuthCodeCallback(search);
        }
    }

    handleImplicitFlowCallback(hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const state = params.get('state');

        if (accessToken && state) {
            const stateData = JSON.parse(decodeURIComponent(state));

            if (stateData.provider === 'google') {
                localStorage.setItem('google_temp_token', accessToken);
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'oauth_token',
                        provider: 'google',
                        token: accessToken
                    }, '*');
                    window.close();
                } else {
                    // Running in same window (WebView mode)
                    this.handleGoogleAuth(accessToken);
                }
            }
        }
    }

    handleAuthCodeCallback(search) {
        // Handle authorization code (would need backend to exchange for token)
        console.log('Authorization code flow callback - requires backend implementation');
    }

    handleOAuthMessage(data) {
        if (data.provider === 'google' && data.token) {
            this.handleGoogleAuth(data.token);
        }
    }

    // Google Authentication
    authenticateGoogle() {
        // Validate configuration
        if (!window.CONFIG || !window.CONFIG.GOOGLE_CLIENT_ID ||
            window.CONFIG.GOOGLE_CLIENT_ID.includes('YOUR_GOOGLE_CLIENT_ID')) {
            this.showStatus('Please configure your Google Client ID in config.js first!', 'error');
            return;
        }

        if (this.isDesktopMode) {
            // Desktop mode: Use OAuth 2.0 implicit flow with manual URL
            this.authenticateGoogleDesktop();
        } else {
            // Web mode: Use Google's JavaScript library
            this.authenticateGoogleWeb();
        }
    }

    authenticateGoogleDesktop() {
        // Generate random state for CSRF protection
        const state = JSON.stringify({
            provider: 'google',
            timestamp: Date.now()
        });

        // Build OAuth URL for implicit flow (desktop apps)
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', window.CONFIG.GOOGLE_CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob'); // Out-of-band for desktop
        authUrl.searchParams.set('response_type', 'token');
        authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
        authUrl.searchParams.set('state', encodeURIComponent(state));

        // Open in popup or same window
        const authWindow = window.open(authUrl.toString(), 'GoogleAuth', 'width=600,height=700');

        if (!authWindow) {
            // If popup blocked, navigate in same window
            this.showStatus('Opening Google authentication...', 'success');
            setTimeout(() => {
                window.location.href = authUrl.toString();
            }, 1000);
        } else {
            // Poll for token in localStorage (set by callback page)
            const pollInterval = setInterval(() => {
                const token = localStorage.getItem('google_temp_token');
                if (token) {
                    localStorage.removeItem('google_temp_token');
                    clearInterval(pollInterval);
                    this.handleGoogleAuth(token);
                    if (authWindow && !authWindow.closed) {
                        authWindow.close();
                    }
                }
                if (authWindow.closed) {
                    clearInterval(pollInterval);
                }
            }, 500);
        }
    }

    authenticateGoogleWeb() {
        // Check if running from proper protocol
        if (window.location.protocol === 'file:') {
            this.showStatus('Please run from a web server (not file://). Use: python -m http.server 8080', 'error');
            return;
        }

        // Check if Google API is loaded
        if (typeof google === 'undefined' || !google.accounts) {
            // Fallback to manual flow if library not loaded
            this.authenticateGoogleDesktop();
            return;
        }

        try {
            const client = google.accounts.oauth2.initTokenClient({
                client_id: window.CONFIG.GOOGLE_CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/gmail.readonly',
                callback: (response) => {
                    if (response.error) {
                        console.error('Google OAuth error:', response);
                        this.showStatus(`Google authentication failed: ${response.error}`, 'error');
                        return;
                    }
                    if (response.access_token) {
                        this.handleGoogleAuth(response.access_token);
                    }
                },
                error_callback: (error) => {
                    console.error('Google OAuth error callback:', error);
                    this.showStatus(`Google authentication error: ${error.type || 'Unknown error'}`, 'error');
                }
            });
            client.requestAccessToken();
        } catch (error) {
            console.error('Error initializing Google auth:', error);
            // Fallback to manual flow
            this.authenticateGoogleDesktop();
        }
    }

    async handleGoogleAuth(accessToken) {
        try {
            // Get user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!userInfoResponse.ok) {
                throw new Error('Failed to get user info');
            }

            const userInfo = await userInfoResponse.json();

            const account = {
                type: 'google',
                email: userInfo.email,
                name: userInfo.name,
                accessToken: accessToken,
                id: `google_${userInfo.email}`
            };

            this.addAccount(account);
            this.showStatus(`Successfully connected to Gmail: ${userInfo.email}`, 'success');
        } catch (error) {
            console.error('Google auth error:', error);
            this.showStatus('Failed to connect to Gmail: ' + error.message, 'error');
        }
    }

    // Outlook Authentication
    async authenticateOutlook() {
        if (!window.CONFIG || !window.CONFIG.OUTLOOK_CLIENT_ID ||
            window.CONFIG.OUTLOOK_CLIENT_ID.includes('YOUR_OUTLOOK_CLIENT_ID')) {
            this.showStatus('Please configure your Outlook Client ID in config.js first!', 'error');
            return;
        }

        if (!this.msalInstance) {
            this.showStatus('Outlook authentication not configured. Please check config.js', 'error');
            return;
        }

        const loginRequest = {
            scopes: ['Mail.Read', 'User.Read']
        };

        try {
            let loginResponse;
            if (this.isDesktopMode) {
                // Use redirect flow for desktop
                loginResponse = await this.msalInstance.loginPopup(loginRequest);
            } else {
                // Use popup for web
                loginResponse = await this.msalInstance.loginPopup(loginRequest);
            }

            const account = {
                type: 'outlook',
                email: loginResponse.account.username,
                name: loginResponse.account.name,
                accessToken: loginResponse.accessToken,
                id: `outlook_${loginResponse.account.username}`,
                msalAccount: loginResponse.account
            };

            this.addAccount(account);
            this.showStatus(`Successfully connected to Outlook: ${loginResponse.account.username}`, 'success');
        } catch (error) {
            console.error('Outlook auth error:', error);
            this.showStatus('Failed to connect to Outlook: ' + error.message, 'error');
        }
    }

    addAccount(account) {
        // Check if account already exists
        const existingIndex = this.accounts.findIndex(acc => acc.id === account.id);
        if (existingIndex !== -1) {
            this.accounts[existingIndex] = account;
        } else {
            this.accounts.push(account);
        }

        this.currentAccount = account;
        this.updateAccountSelector();
        this.showEmailContainer();
        this.saveToLocalStorage();
    }

    updateAccountSelector() {
        const selector = document.getElementById('accountSelector');
        selector.innerHTML = '<option value="">Select Account</option>';

        this.accounts.forEach(account => {
            const option = document.createElement('option');
            option.value = account.id;
            option.textContent = `${account.type === 'google' ? 'Gmail' : 'Outlook'}: ${account.email}`;
            option.selected = account.id === this.currentAccount?.id;
            selector.appendChild(option);
        });
    }

    switchAccount(accountId) {
        const account = this.accounts.find(acc => acc.id === accountId);
        if (account) {
            this.currentAccount = account;
        }
    }

    showEmailContainer() {
        document.querySelector('.auth-section').style.display = 'none';
        document.getElementById('emailContainer').style.display = 'block';
    }

    async fetchEmails() {
        if (!this.currentAccount) {
            this.showStatus('Please select an account first', 'error');
            return;
        }

        this.showLoading(true);

        try {
            let emails = [];
            if (this.currentAccount.type === 'google') {
                emails = await this.fetchGmailEmails();
            } else if (this.currentAccount.type === 'outlook') {
                emails = await this.fetchOutlookEmails();
            }

            this.displayEmails(emails);
            this.showLoading(false);
        } catch (error) {
            console.error('Error fetching emails:', error);
            this.showStatus(`Error fetching emails: ${error.message}`, 'error');
            this.showLoading(false);
        }
    }

    async fetchGmailEmails() {
        const response = await fetch(
            'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20',
            {
                headers: {
                    'Authorization': `Bearer ${this.currentAccount.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Gmail messages');
        }

        const data = await response.json();
        const messages = data.messages || [];

        // Fetch full details for each message
        const emailPromises = messages.map(msg =>
            fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
                headers: {
                    'Authorization': `Bearer ${this.currentAccount.accessToken}`
                }
            }).then(r => r.json())
        );

        const fullMessages = await Promise.all(emailPromises);
        return this.parseGmailMessages(fullMessages);
    }

    parseGmailMessages(messages) {
        return messages.map(msg => {
            const headers = msg.payload.headers;
            const getHeader = (name) => {
                const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
                return header ? header.value : '';
            };

            return {
                id: msg.id,
                from: getHeader('From'),
                subject: getHeader('Subject'),
                date: new Date(parseInt(msg.internalDate)),
                snippet: msg.snippet,
                unread: msg.labelIds?.includes('UNREAD') || false,
                labels: msg.labelIds || []
            };
        });
    }

    async fetchOutlookEmails() {
        const response = await fetch(
            'https://graph.microsoft.com/v1.0/me/messages?$top=20&$select=subject,from,receivedDateTime,bodyPreview,isRead',
            {
                headers: {
                    'Authorization': `Bearer ${this.currentAccount.accessToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch Outlook messages');
        }

        const data = await response.json();
        return this.parseOutlookMessages(data.value || []);
    }

    parseOutlookMessages(messages) {
        return messages.map(msg => ({
            id: msg.id,
            from: msg.from?.emailAddress?.address || 'Unknown',
            subject: msg.subject || '(No subject)',
            date: new Date(msg.receivedDateTime),
            snippet: msg.bodyPreview || '',
            unread: !msg.isRead,
            labels: []
        }));
    }

    displayEmails(emails) {
        const emailList = document.getElementById('emailList');
        emailList.innerHTML = '';

        if (emails.length === 0) {
            emailList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No emails found</p>';
            return;
        }

        // Update stats
        document.getElementById('totalEmails').textContent = emails.length;
        document.getElementById('unreadEmails').textContent = emails.filter(e => e.unread).length;

        // Display emails
        emails.forEach(email => {
            const emailItem = document.createElement('div');
            emailItem.className = `email-item ${email.unread ? 'unread' : ''}`;

            const fromName = email.from.includes('<')
                ? email.from.split('<')[0].trim()
                : email.from;

            emailItem.innerHTML = `
                <div class="email-header">
                    <div class="email-from">${this.escapeHtml(fromName)}</div>
                    <div class="email-date">${this.formatDate(email.date)}</div>
                </div>
                <div class="email-subject">${this.escapeHtml(email.subject)}</div>
                <div class="email-snippet">${this.escapeHtml(email.snippet)}</div>
                ${email.labels.length > 0 ? `
                    <div class="email-labels">
                        ${email.labels.slice(0, 5).map(label =>
                            `<span class="email-label">${this.escapeHtml(label)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            `;

            emailList.appendChild(emailItem);
        });
    }

    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
        } else if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else if (hours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('authStatus');
        statusDiv.textContent = message;
        statusDiv.className = `auth-status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }

    showLoading(show) {
        document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
        document.getElementById('emailList').style.display = show ? 'none' : 'block';
    }

    logout() {
        if (confirm('Are you sure you want to logout from all accounts?')) {
            this.accounts = [];
            this.currentAccount = null;
            localStorage.removeItem('emailFetcherAccounts');

            document.querySelector('.auth-section').style.display = 'block';
            document.getElementById('emailContainer').style.display = 'none';
            document.getElementById('emailList').innerHTML = '';

            this.showStatus('Logged out successfully', 'success');
        }
    }

    saveToLocalStorage() {
        // Note: In production, don't store access tokens in localStorage
        // This is for demonstration purposes only
        const accountsToSave = this.accounts.map(acc => ({
            ...acc,
            sessionOnly: true
        }));
        localStorage.setItem('emailFetcherAccounts', JSON.stringify(accountsToSave));
    }

    checkExistingSessions() {
        // Check if there are any stored accounts
        const stored = localStorage.getItem('emailFetcherAccounts');
        if (stored) {
            console.log('Found stored session data, but tokens may be expired. Please re-authenticate.');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailFetcher = new EmailFetcher();
});
