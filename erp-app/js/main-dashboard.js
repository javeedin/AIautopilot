// ERP Main Dashboard JavaScript

console.log('=== ERP Main Dashboard v1.0 Loaded ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initializing...');

    // Check authentication
    checkAuthentication();

    // Load user info
    loadUserInfo();

    // Setup event listeners
    setupEventListeners();

    console.log('Dashboard initialization complete');
});

// Check if user is authenticated
function checkAuthentication() {
    const username = sessionStorage.getItem('username');
    const instance = sessionStorage.getItem('instance');

    if (!username || !instance) {
        console.log('User not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return false;
    }

    console.log(`Authenticated user: ${username} @ ${instance}`);
    return true;
}

// Load user information
function loadUserInfo() {
    const username = sessionStorage.getItem('username') || 'User';
    const fullName = sessionStorage.getItem('fullName') || username;
    const role = sessionStorage.getItem('role') || 'User';

    // Update UI
    document.getElementById('user-name').textContent = fullName;
    document.getElementById('user-role').textContent = role;

    // Set avatar initial
    const initial = fullName.charAt(0).toUpperCase();
    document.getElementById('user-avatar').textContent = initial;

    console.log('User info loaded:', { username, fullName, role });
}

// Setup event listeners
function setupEventListeners() {
    // Hamburger menu
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');

    hamburgerBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
        console.log('Sidebar toggled');
    });

    // Close sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                mainContent.classList.remove('sidebar-open');
            }
        }
    });

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);

    // Autopilot button
    document.getElementById('autopilot-btn').addEventListener('click', toggleAutopilot);

    console.log('Event listeners setup complete');
}

// Open module
function openModule(moduleId) {
    console.log(`Opening module: ${moduleId}`);

    // Store current module
    sessionStorage.setItem('currentModule', moduleId);

    // Notify C# to open new tab
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            action: 'openModule',
            moduleId: moduleId
        });
    } else {
        // Fallback: Navigate in same window
        window.location.href = `modules/${moduleId.toLowerCase()}-dashboard.html`;
    }
}

// Open Project Management
function openProjectManagement() {
    console.log('Opening Project Management...');

    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            action: 'openProjectManagement'
        });
    } else {
        // Fallback
        window.open('../project-management/index.html', '_blank');
    }
}

// Open Chatbot Admin
function openChatbotAdmin() {
    console.log('Opening Chatbot Admin...');

    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            action: 'openChatbotAdmin'
        });
    } else {
        window.location.href = 'chatbot-admin.html';
    }
}

// Logout
function logout() {
    console.log('Logging out...');

    // Clear session storage
    sessionStorage.clear();

    // Notify C# backend
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            action: 'logout'
        });
    }

    // Redirect to login
    window.location.href = 'login.html';
}

// Toggle Autopilot
function toggleAutopilot() {
    const autopilotPanel = document.getElementById('autopilot-panel');
    autopilotPanel.classList.toggle('open');
    console.log('Autopilot panel toggled');
}

// Update activity (for session timeout)
function updateActivity() {
    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            action: 'updateActivity'
        });
    }
}

// Update activity on user interaction
let activityTimer;
document.addEventListener('mousemove', () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(updateActivity, 30000); // Every 30 seconds
});

document.addEventListener('keypress', () => {
    clearTimeout(activityTimer);
    activityTimer = setTimeout(updateActivity, 30000);
});

// Listen for session expired message from C#
window.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'sessionExpired') {
        alert('Your session has expired. Please log in again.');
        logout();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Dashboard error:', event.error);
});

console.log('Main dashboard script loaded successfully');
