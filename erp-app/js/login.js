// ERP Login Page JavaScript

console.log('=== ERP Login Page v1.0 Loaded ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing login page...');

    const form = document.getElementById('login-form');
    const instanceInput = document.getElementById('instance');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const alertContainer = document.getElementById('alert-container');

    // Pre-fill for demo (remove in production)
    if (window.location.search.includes('demo=1')) {
        instanceInput.value = 'PROD';
        usernameInput.value = 'admin';
        passwordInput.value = 'demo123';
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Login form submitted');

        const instance = instanceInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!instance || !username || !password) {
            showAlert('error', 'All fields are required');
            return;
        }

        // Disable button
        loginBtn.disabled = true;
        loginBtn.textContent = 'Signing in...';

        try {
            // Call C# backend to authenticate
            const result = await authenticateWithBackend(instance, username, password);

            if (result.success) {
                console.log('Login successful!', result);
                showAlert('success', 'Login successful! Redirecting...');

                // Store session info (C# will manage actual session)
                sessionStorage.setItem('username', username);
                sessionStorage.setItem('instance', instance);
                sessionStorage.setItem('fullName', result.fullName || username);
                sessionStorage.setItem('role', result.role || 'User');

                // Redirect to main dashboard
                setTimeout(() => {
                    window.location.href = 'main-dashboard.html';
                }, 1000);
            } else {
                console.error('Login failed:', result.message);
                showAlert('error', result.message || 'Invalid credentials');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Sign In';
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('error', 'An error occurred. Please try again.');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Sign In';
        }
    });

    // Show alert message
    function showAlert(type, message) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;

        if (type === 'success') {
            setTimeout(() => {
                alertContainer.innerHTML = '';
            }, 3000);
        }
    }

    // Authenticate with C# backend
    async function authenticateWithBackend(instance, username, password) {
        // Try to call C# method if available
        if (window.chrome && window.chrome.webview) {
            try {
                console.log('Calling C# authentication method...');

                // Post message to C# backend
                const authRequest = {
                    action: 'login',
                    instance,
                    username,
                    password
                };

                window.chrome.webview.postMessage(authRequest);

                // Wait for C# response
                return await waitForAuthResponse();
            } catch (error) {
                console.error('Error calling C# backend:', error);
            }
        }

        // Fallback: Mock authentication for demo
        console.warn('C# backend not available, using mock authentication');
        return mockAuthentication(instance, username, password);
    }

    // Wait for authentication response from C#
    function waitForAuthResponse(timeout = 5000) {
        return new Promise((resolve) => {
            const handler = (event) => {
                if (event.data && event.data.action === 'loginResponse') {
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            window.addEventListener('message', handler);

            // Timeout fallback
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, message: 'Authentication timeout' });
            }, timeout);
        });
    }

    // Mock authentication (for demo/testing)
    function mockAuthentication(instance, username, password) {
        console.log('Mock authentication:', { instance, username });

        // Accept any non-empty credentials for demo
        if (instance && username && password) {
            return {
                success: true,
                message: 'Login successful',
                fullName: username + ' (User)',
                role: username.toLowerCase().includes('admin') ? 'Administrator' : 'User',
                sessionToken: 'mock-token-' + Date.now()
            };
        } else {
            return {
                success: false,
                message: 'Invalid credentials'
            };
        }
    }

    // Focus on first input
    instanceInput.focus();

    console.log('Login page initialization complete');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Log when page is ready
console.log('Login page script loaded successfully');
