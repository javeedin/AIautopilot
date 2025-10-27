// ===== modules.js =====
console.log('*** modules.js LOADED ***');

// Load Modules Page
async function loadModules() {
    try {
        console.log('loadModules() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updateModulesSummary();
        updateModulesGrid();

        console.log('Modules page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadModules():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updateModulesSummary() {
    const moduleStats = DataLoader.getModuleStats();
    if (!moduleStats) return;

    const totalModules = moduleStats.length;
    const totalFeatures = moduleStats.reduce((sum, m) => sum + m.features, 0);
    const totalPages = moduleStats.reduce((sum, m) => sum + m.pages, 0);
    const totalTables = moduleStats.reduce((sum, m) => sum + m.tables, 0);

    document.getElementById('total-modules').textContent = Utils.formatNumber(totalModules);
    document.getElementById('total-features-modules').textContent = Utils.formatNumber(totalFeatures);
    document.getElementById('total-pages-modules').textContent = Utils.formatNumber(totalPages);
    document.getElementById('total-tables-modules').textContent = Utils.formatNumber(totalTables);
}

function updateModulesGrid() {
    const moduleStats = DataLoader.getModuleStats();
    const grid = document.getElementById('modules-grid');

    if (!grid || !moduleStats) return;

    grid.innerHTML = moduleStats.map(module => `
        <div class="module-card">
            <div class="module-card-header">
                <div class="module-badge ${Utils.getModuleColor(module.id)} large">${module.id}</div>
                <h3>${module.name}</h3>
            </div>
            <div class="module-card-body">
                <div class="module-stat">
                    <div class="module-stat-icon">⚙️</div>
                    <div class="module-stat-content">
                        <div class="module-stat-value">${Utils.formatNumber(module.features)}</div>
                        <div class="module-stat-label">Features</div>
                    </div>
                </div>
                <div class="module-stat">
                    <div class="module-stat-icon">📄</div>
                    <div class="module-stat-content">
                        <div class="module-stat-value">${Utils.formatNumber(module.pages)}</div>
                        <div class="module-stat-label">Pages</div>
                    </div>
                </div>
                <div class="module-stat">
                    <div class="module-stat-icon">🗄️</div>
                    <div class="module-stat-content">
                        <div class="module-stat-value">${Utils.formatNumber(module.tables)}</div>
                        <div class="module-stat-label">Tables</div>
                    </div>
                </div>
                <div class="module-stat">
                    <div class="module-stat-icon">🔥</div>
                    <div class="module-stat-content">
                        <div class="module-stat-value">${Utils.formatNumber(module.critical + module.high)}</div>
                        <div class="module-stat-label">Priority</div>
                    </div>
                </div>
            </div>
            <div class="module-card-footer">
                <div class="progress-label">
                    <span>Completion</span>
                    <span class="progress-percent">${module.progress}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${module.progress}%;"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// Load modules on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadModules function...');
    if (typeof loadModules === 'function') {
        await DataLoader.loadAllData();
        loadModules();
    }
});
