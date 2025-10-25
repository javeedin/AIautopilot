// Configuration Module
const CONFIG = {
    API_BASE_URL: window.location.hostname.includes('localhost') 
        ? 'http://localhost:5000/api'
        : 'https://your-api.com/api',
    
    DATABASE: {
        HOST: '',
        PORT: '1521',
        SERVICE: '',
        USERNAME: '',
        PASSWORD: ''
    },
    
    FEATURES: {
        ENABLE_LOGGING: true,
        ENABLE_AUTO_SAVE: true,
        AUTO_SAVE_INTERVAL: 30000, // 30 seconds
        MAX_RESULTS: 10000
    },
    
    UI: {
        DEFAULT_THEME: 'light',
        ANIMATION_SPEED: 300,
        NOTIFICATION_DURATION: 3000
    }
};

// Export for other modules
window.APP_CONFIG = CONFIG;
console.log('✅ Config module loaded');
