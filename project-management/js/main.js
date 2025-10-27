// ===== main.js Version V1.7 =====
console.log('*** main.js VERSION V1.7 LOADED ***');

// ===== Configuration =====
const CONFIG = {
    // Check if running on localhost (C# app with HTTP server) or file:// protocol
    dataPath: window.location.protocol === 'file:' ? '../docs/' : '/docs/',
    csvFiles: {
        requirements: 'requirements/ERP_Requirements.csv',
        validationSummary: 'tracking/Feature_Validation_Summary.csv',
        pages: 'requirements/Application_Pages_Inventory.csv',
        tablesDetailed: 'requirements/Database_Tables_Detailed.csv',
        tablesMaster: 'requirements/Database_Tables_Master.csv'
    },
    validationModules: [
        'GL', 'UR', 'AP', 'AR', 'PO', 'INV', 'OM', 'CM',
        'LCM', 'PDM', 'CSH', 'FA', 'HCM', 'PAY', 'ABS', 'REC'
    ]
};

// ===== Global Data Store =====
const DataStore = {
    requirements: null,
    validations: {},
    validationSummary: null,
    pages: null,
    tables: null,
    tablesDetailed: null, // Column-level details for each table
    loaded: false
};

// ===== Utility Functions =====
const Utils = {
    // Format numbers with commas
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    // Calculate percentage
    percentage(value, total) {
        if (total === 0) return '0.0';
        return ((value / total) * 100).toFixed(1);
    },

    // Parse CSV file
    async parseCSV(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const csvText = await response.text();

            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => resolve(results.data),
                    error: (error) => reject(error)
                });
            });
        } catch (error) {
            console.error(`Error loading CSV from ${filePath}:`, error);
            return [];
        }
    },

    // Show loading state
    showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        }
    },

    // Show error state
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <h3 class="empty-state-title">Error Loading Data</h3>
                    <p class="empty-state-description">${message}</p>
                </div>
            `;
        }
    },

    // Show empty state
    showEmpty(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <h3 class="empty-state-title">No Data</h3>
                    <p class="empty-state-description">${message}</p>
                </div>
            `;
        }
    },

    // Get module color class
    getModuleColor(moduleId) {
        const colors = {
            'GL': 'gl', 'UR': 'ur', 'AP': 'ap', 'AR': 'ar',
            'PO': 'po', 'INV': 'inv', 'OM': 'om', 'CM': 'cm',
            'LCM': 'lcm', 'PDM': 'pdm', 'CSH': 'csh', 'FA': 'fa',
            'HCM': 'hcm', 'PAY': 'pay', 'ABS': 'abs', 'REC': 'rec'
        };
        return colors[moduleId] || 'gl';
    },

    // Get module name
    getModuleName(moduleId) {
        const names = {
            'GL': 'General Ledger',
            'UR': 'User Management',
            'AP': 'Accounts Payable',
            'AR': 'Accounts Receivable',
            'PO': 'Purchasing',
            'INV': 'Inventory',
            'OM': 'Order Management',
            'CM': 'Cost Management',
            'LCM': 'Landed Cost',
            'PDM': 'Product Management',
            'CSH': 'Cash Management',
            'FA': 'Fixed Assets',
            'HCM': 'Human Capital',
            'PAY': 'Payroll',
            'ABS': 'Absence',
            'REC': 'Recruitment'
        };
        return names[moduleId] || moduleId;
    },

    // Get priority badge HTML
    getPriorityBadge(priority) {
        const badges = {
            'Critical': '<span class="badge badge-critical">Critical</span>',
            'High': '<span class="badge badge-high">High</span>',
            'Medium': '<span class="badge badge-medium">Medium</span>',
            'Low': '<span class="badge badge-low">Low</span>'
        };
        return badges[priority] || '<span class="badge badge-medium">-</span>';
    },

    // Get status badge HTML
    getStatusBadge(status) {
        const badges = {
            'Not Started': '<span class="status-badge not-started">⏸️ Not Started</span>',
            'In Progress': '<span class="status-badge in-progress">🔄 In Progress</span>',
            'Code Complete': '<span class="status-badge completed">✔️ Complete</span>',
            'Production': '<span class="status-badge completed">🚀 Production</span>'
        };
        return badges[status] || '<span class="status-badge not-started">Not Started</span>';
    }
};

// ===== Data Loading Functions =====
const DataLoader = {
    // Load all data
    async loadAllData() {
        try {
            console.log('Loading all data...');

            // Check if data was injected by C# application
            if (window.CSHARP_DATA) {
                console.log('Using data injected from C# application');
                console.log('C# Data:', window.CSHARP_DATA);

                DataStore.validationSummary = window.CSHARP_DATA.validationSummary || [];
                DataStore.pages = window.CSHARP_DATA.pages || [];
                DataStore.tables = window.CSHARP_DATA.tables || [];
                DataStore.tablesDetailed = window.CSHARP_DATA.tablesDetailed || [];
                DataStore.validations = window.CSHARP_DATA.validations || {};

                DataStore.loaded = true;
                console.log('Data loaded from C# successfully!');
                console.log('Total features:', Object.values(DataStore.validations).flat().length);
                console.log('DataStore:', DataStore);

                return true;
            }

            // Otherwise, load from CSV files (for browser mode)
            console.log('Loading from CSV files...');

            // Load validation summary
            DataStore.validationSummary = await Utils.parseCSV(
                `${CONFIG.dataPath}${CONFIG.csvFiles.validationSummary}`
            );

            // Load pages
            DataStore.pages = await Utils.parseCSV(
                `${CONFIG.dataPath}${CONFIG.csvFiles.pages}`
            );

            // Load tables
            DataStore.tables = await Utils.parseCSV(
                `${CONFIG.dataPath}${CONFIG.csvFiles.tablesMaster}`
            );

            // Load validation details for each module
            for (const module of CONFIG.validationModules) {
                const path = window.location.protocol === 'file:'
                    ? `${CONFIG.dataPath}tracking/feature_validation/${module}_Feature_Validation.csv`
                    : `/docs/tracking/feature_validation/${module}_Feature_Validation.csv`;
                DataStore.validations[module] = await Utils.parseCSV(path);
            }

            DataStore.loaded = true;
            console.log('All data loaded successfully!');
            console.log('DataStore:', DataStore);

            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            return false;
        }
    },

    // Get summary statistics
    getStats() {
        if (!DataStore.loaded) return null;

        const stats = {
            modules: CONFIG.validationModules.length,
            features: 0,
            pages: DataStore.pages ? DataStore.pages.length : 0,
            tables: DataStore.tables ? DataStore.tables.length : 0,
            notStarted: 0,
            inProgress: 0,
            codeComplete: 0,
            testing: 0,
            production: 0,
            blocked: 0,
            priorityCritical: 0,
            priorityHigh: 0,
            priorityMedium: 0,
            priorityLow: 0,
            allOkYes: 0,
            allOkNo: 0
        };

        // Calculate from validation data
        Object.values(DataStore.validations).forEach(moduleData => {
            if (moduleData && Array.isArray(moduleData)) {
                stats.features += moduleData.length;

                moduleData.forEach(feature => {
                    // Coding status
                    if (feature.Coding_Status === 'Not Started') stats.notStarted++;
                    else if (feature.Coding_Status === 'In Progress') stats.inProgress++;
                    else if (feature.Coding_Status === 'Code Complete') stats.codeComplete++;

                    // Implementation status
                    if (feature.Implementation_Status === 'Production') stats.production++;

                    // Testing status
                    if (feature.Unit_Testing_Status === 'In Progress' ||
                        feature.Integration_Testing_Status === 'In Progress' ||
                        feature.UAT_Status === 'In Progress') {
                        stats.testing++;
                    }

                    // Blocker status
                    if (feature.Blocker_Status === 'Blocked') stats.blocked++;

                    // Priority
                    if (feature.Priority === 'Critical') stats.priorityCritical++;
                    else if (feature.Priority === 'High') stats.priorityHigh++;
                    else if (feature.Priority === 'Medium') stats.priorityMedium++;
                    else if (feature.Priority === 'Low') stats.priorityLow++;

                    // All OK status
                    if (feature.All_OK_Status === 'Yes') stats.allOkYes++;
                    else stats.allOkNo++;
                });
            }
        });

        stats.completionRate = Utils.percentage(stats.allOkYes, stats.features);

        return stats;
    },

    // Get module statistics
    getModuleStats() {
        if (!DataStore.loaded) return [];

        return CONFIG.validationModules.map(moduleId => {
            const moduleData = DataStore.validations[moduleId] || [];
            const summary = DataStore.validationSummary ?
                DataStore.validationSummary.find(s => s.Module_ID === moduleId) : null;

            return {
                id: moduleId,
                name: Utils.getModuleName(moduleId),
                features: moduleData.length,
                critical: summary ? parseInt(summary.Priority_Critical) || 0 : 0,
                high: summary ? parseInt(summary.Priority_High) || 0 : 0,
                medium: summary ? parseInt(summary.Priority_Medium) || 0 : 0,
                pages: DataStore.pages ?
                    DataStore.pages.filter(p => p.Module_ID === moduleId).length : 0,
                tables: DataStore.tables ?
                    DataStore.tables.filter(t => t.Module_ID === moduleId).length : 0,
                notStarted: moduleData.filter(f => f.Coding_Status === 'Not Started').length,
                completed: moduleData.filter(f => f.All_OK_Status === 'Yes').length,
                progress: Utils.percentage(
                    moduleData.filter(f => f.All_OK_Status === 'Yes').length,
                    moduleData.length
                )
            };
        }).sort((a, b) => b.features - a.features);
    }
};

// ===== Refresh Data =====
async function refreshData() {
    const btn = document.querySelector('.btn-refresh');
    if (btn) {
        btn.innerHTML = '<span>🔄</span> Loading...';
        btn.disabled = true;
    }

    await DataLoader.loadAllData();

    // Reload current page
    if (typeof loadDashboard === 'function') {
        loadDashboard();
    } else if (typeof loadFeatures === 'function') {
        loadFeatures();
    } else if (typeof loadValidations === 'function') {
        loadValidations();
    } else if (typeof loadDatabaseTables === 'function') {
        loadDatabaseTables();
    } else if (typeof loadPages === 'function') {
        loadPages();
    }

    if (btn) {
        btn.innerHTML = '<span>🔄</span> Refresh';
        btn.disabled = false;
    }
}

// ===== Initialize on Load =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing application...');

    // If running in C# WebView2 app, wait for data injection
    // Detect by checking if we're on file:// protocol (C# mode) vs http:// (browser mode)
    if (window.location.protocol === 'file:') {
        console.log('Detected file:// protocol - waiting for C# data injection...');

        // Wait up to 2 seconds for C# to inject data
        let attempts = 0;
        const maxAttempts = 20; // 20 attempts * 100ms = 2 seconds

        while (attempts < maxAttempts && !window.CSHARP_DATA) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (window.CSHARP_DATA) {
            console.log('C# data detected! Loading via C# injection...');
        } else {
            console.log('No C# data found after 2 seconds, attempting CSV load...');
        }
    }

    await DataLoader.loadAllData();

    // Initialize the appropriate page view
    console.log('DataStore ready, loading dashboard...');
    console.log('Checking for page load functions...');
    console.log('typeof loadDashboard:', typeof loadDashboard);
    console.log('typeof loadFeatures:', typeof loadFeatures);
    console.log('window.loadDashboard:', window.loadDashboard);

    if (typeof loadDashboard === 'function') {
        console.log('Calling loadDashboard()...');
        loadDashboard();
    } else if (typeof loadFeatures === 'function') {
        console.log('Calling loadFeatures()...');
        loadFeatures();
    } else if (typeof loadValidations === 'function') {
        console.log('Calling loadValidations()...');
        loadValidations();
    } else if (typeof loadDatabaseTables === 'function') {
        console.log('Calling loadDatabaseTables()...');
        loadDatabaseTables();
    } else if (typeof loadPages === 'function') {
        console.log('Calling loadPages()...');
        loadPages();
    } else if (typeof loadModules === 'function') {
        console.log('Calling loadModules()...');
        loadModules();
    } else if (typeof loadReports === 'function') {
        console.log('Calling loadReports()...');
        loadReports();
    } else {
        console.error('NO PAGE LOAD FUNCTION FOUND! Dashboard will not render.');
        console.log('Available functions in window:', Object.keys(window).filter(k => k.includes('load')));
    }
});
