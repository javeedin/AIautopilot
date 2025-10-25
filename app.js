// Email Fetcher Application
// Supports Gmail (Google) and Outlook (Microsoft) integration

class EmailFetcher {
    constructor() {
        this.accounts = [];
        this.currentAccount = null;
        this.googleAuth = null;
        this.msalInstance = null;
        this.init();
    }

    init() {
        // Initialize Microsoft Authentication Library
        this.initMSAL();

        // Set up event listeners
        this.setupEventListeners();

        // Check for existing sessions
        this.checkExistingSessions();
    }

    initMSAL() {
        const msalConfig = {
            auth: {
                clientId: window.CONFIG.OUTLOOK_CLIENT_ID,
                authority: 'https://login.microsoftonline.com/common',
                redirectUri: window.location.origin
            },
            cache: {
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false
            }
        };

        if (window.msal) {
            this.msalInstance = new msal.PublicClientApplication(msalConfig);
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
    }

    // Google Authentication
    authenticateGoogle() {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: window.CONFIG.GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/gmail.readonly',
            callback: (response) => {
                if (response.access_token) {
                    this.handleGoogleAuth(response.access_token);
                }
            }
        });
        client.requestAccessToken();
    }

    async handleGoogleAuth(accessToken) {
        try {
            // Get user info
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
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
            this.showStatus('Failed to connect to Gmail', 'error');
        }
    }

    // Outlook Authentication
    async authenticateOutlook() {
        if (!this.msalInstance) {
            this.showStatus('Outlook authentication not configured. Please check config.js', 'error');
            return;
        }

        const loginRequest = {
            scopes: ['Mail.Read', 'User.Read']
        };

        try {
            const loginResponse = await this.msalInstance.loginPopup(loginRequest);
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
            this.showStatus('Failed to connect to Outlook', 'error');
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
            // Tokens expire, so this is just for the session
            sessionOnly: true
        }));
        localStorage.setItem('emailFetcherAccounts', JSON.stringify(accountsToSave));
    }

    checkExistingSessions() {
        // Check if there are any stored accounts
        const stored = localStorage.getItem('emailFetcherAccounts');
        if (stored) {
            // Note: Tokens will likely be expired, user will need to re-authenticate
            console.log('Found stored session data, but tokens may be expired. Please re-authenticate.');
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.emailFetcher = new EmailFetcher();
});
