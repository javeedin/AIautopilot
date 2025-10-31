// Autopilot Chat Assistant JavaScript

console.log('=== Autopilot Assistant v1.0 Loaded ===');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Autopilot initializing...');

    setupAutopilotHandlers();
    loadChatbotRules();

    console.log('Autopilot initialization complete');
});

// Chatbot rules (loaded from admin page)
let chatbotRules = [];

// Setup autopilot event handlers
function setupAutopilotHandlers() {
    const closeBtn = document.getElementById('close-autopilot-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('autopilot-input');
    const panel = document.getElementById('autopilot-panel');

    // Close button
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('open');
        console.log('Autopilot closed');
    });

    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', () => {
        panel.classList.toggle('fullscreen');
        const isFullscreen = panel.classList.contains('fullscreen');
        fullscreenBtn.textContent = isFullscreen ? '⛶' : '⛶';
        console.log(`Autopilot fullscreen: ${isFullscreen}`);
    });

    // Send button
    sendBtn.addEventListener('click', sendMessage);

    // Enter key to send
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    console.log('Autopilot handlers setup complete');
}

// Send message
function sendMessage() {
    const input = document.getElementById('autopilot-input');
    const messageText = input.value.trim();

    if (!messageText) return;

    console.log('User message:', messageText);

    // Add user message to chat
    addMessage('user', messageText);

    // Clear input
    input.value = '';

    // Process message
    setTimeout(() => {
        processMessage(messageText);
    }, 500);
}

// Add message to chat
function addMessage(sender, text, isSystem = false) {
    const messagesContainer = document.getElementById('autopilot-messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    const avatar = sender === 'user' ? getUserInitial() : '🤖';
    const senderName = sender === 'user' ? 'You' : 'Autopilot';

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
            <div class="message-header">
                <span class="message-sender">${senderName}</span>
                <span class="message-time">${getCurrentTime()}</span>
            </div>
            <div class="message-text">${text}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Process user message
function processMessage(messageText) {
    const lowercaseMessage = messageText.toLowerCase();

    // Check for rule matches
    const matchedRule = findMatchingRule(lowercaseMessage);

    if (matchedRule) {
        // Rule-based response
        addMessage('bot', matchedRule.response);

        // Execute action if defined
        if (matchedRule.action) {
            setTimeout(() => {
                executeAction(matchedRule.action);
            }, 1000);
        }
    } else {
        // Fallback responses
        handleFallbackResponse(lowercaseMessage);
    }
}

// Find matching chatbot rule
function findMatchingRule(message) {
    for (const rule of chatbotRules) {
        if (rule.enabled === false) continue;

        for (const keyword of rule.keywords) {
            if (message.includes(keyword.toLowerCase())) {
                console.log('Matched rule:', rule.name);
                return rule;
            }
        }
    }
    return null;
}

// Handle fallback responses
function handleFallbackResponse(message) {
    let response = '';

    if (message.includes('help')) {
        response = 'I can help you with:<br>' +
            '• Navigating to modules (e.g., "open GL module")<br>' +
            '• Finding pages (e.g., "show currencies page")<br>' +
            '• Quick actions (e.g., "create journal entry")<br>' +
            '<br>What would you like to do?';
    } else if (message.includes('hello') || message.includes('hi')) {
        response = 'Hello! How can I assist you today?';
    } else if (message.includes('thank')) {
        response = 'You\'re welcome! Let me know if you need anything else.';
    } else {
        response = 'I\'m not sure how to help with that. Try asking "help" to see what I can do, or visit Chatbot Admin to add new commands.';
    }

    addMessage('bot', response);
}

// Execute action
function executeAction(action) {
    console.log('Executing action:', action);

    if (action.type === 'navigate') {
        if (action.module) {
            addMessage('bot', `Opening ${action.module} module...`);
            if (typeof openModule === 'function') {
                openModule(action.module);
            }
        } else if (action.page) {
            addMessage('bot', `Navigating to ${action.page}...`);
            window.location.href = action.page;
        }
    } else if (action.type === 'command') {
        if (window.chrome && window.chrome.webview) {
            window.chrome.webview.postMessage({
                action: action.command,
                data: action.data
            });
        }
    }
}

// Load chatbot rules from localStorage
function loadChatbotRules() {
    const stored = localStorage.getItem('chatbotRules');

    if (stored) {
        try {
            chatbotRules = JSON.parse(stored);
            console.log(`Loaded ${chatbotRules.length} chatbot rules`);
        } catch (e) {
            console.error('Error loading chatbot rules:', e);
            chatbotRules = getDefaultRules();
        }
    } else {
        chatbotRules = getDefaultRules();
        saveChatbotRules();
    }
}

// Save chatbot rules to localStorage
function saveChatbotRules() {
    localStorage.setItem('chatbotRules', JSON.stringify(chatbotRules));
    console.log('Chatbot rules saved');
}

// Get default chatbot rules
function getDefaultRules() {
    return [
        {
            id: '1',
            name: 'Open GL Module',
            keywords: ['open gl', 'gl module', 'general ledger'],
            response: 'Opening General Ledger module...',
            action: {
                type: 'navigate',
                module: 'GL'
            },
            enabled: true
        },
        {
            id: '2',
            name: 'Show Currencies',
            keywords: ['currencies', 'currency list', 'show currencies'],
            response: 'Let me open the Currencies page for you.',
            action: {
                type: 'navigate',
                page: 'modules/gl-currencies.html'
            },
            enabled: true
        },
        {
            id: '3',
            name: 'Create Journal Entry',
            keywords: ['create journal', 'new journal', 'journal entry'],
            response: 'Opening Journal Entry form...',
            action: {
                type: 'navigate',
                page: 'modules/gl-journal-entry.html'
            },
            enabled: true
        },
        {
            id: '4',
            name: 'Project Management',
            keywords: ['project management', 'pm dashboard', 'development tracking'],
            response: 'Opening Project Management dashboard...',
            action: {
                type: 'command',
                command: 'openProjectManagement'
            },
            enabled: true
        }
    ];
}

// Helper functions
function getUserInitial() {
    const fullName = sessionStorage.getItem('fullName') || 'User';
    return fullName.charAt(0).toUpperCase();
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Make functions available globally
window.loadChatbotRules = loadChatbotRules;
window.saveChatbotRules = saveChatbotRules;
window.chatbotRules = chatbotRules;

console.log('Autopilot script loaded successfully');
