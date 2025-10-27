// ===== validations.js =====
console.log('*** validations.js LOADED ***');

// Load Validations Page
async function loadValidations() {
    try {
        console.log('loadValidations() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updateValidationSummary();
        updateModuleValidations();
        setupFilters();

        console.log('Validations page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadValidations():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updateValidationSummary() {
    const stats = DataLoader.getStats();
    if (!stats) return;

    document.getElementById('total-features').textContent = Utils.formatNumber(stats.features);
    document.getElementById('not-started').textContent = Utils.formatNumber(stats.notStarted);
    document.getElementById('in-progress').textContent = Utils.formatNumber(stats.inProgress);
    document.getElementById('code-complete').textContent = Utils.formatNumber(stats.codeComplete);
    document.getElementById('production').textContent = Utils.formatNumber(stats.production);
    document.getElementById('blocked').textContent = Utils.formatNumber(stats.blocked);
}

function updateModuleValidations() {
    const moduleSelect = document.getElementById('module-filter');
    const tableBody = document.getElementById('validations-table-body');

    const selectedModule = moduleSelect ? moduleSelect.value : 'all';

    let allFeatures = [];

    if (selectedModule === 'all') {
        // Get all features from all modules
        Object.entries(DataStore.validations).forEach(([moduleId, features]) => {
            features.forEach(feature => {
                allFeatures.push({
                    ...feature,
                    Module_ID: feature.Module_ID || moduleId
                });
            });
        });
    } else {
        // Get features from selected module
        allFeatures = DataStore.validations[selectedModule] || [];
    }

    if (!tableBody || allFeatures.length === 0) {
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No validation data available</td></tr>';
        }
        return;
    }

    // Sort by Feature_ID
    allFeatures.sort((a, b) => {
        const aId = a.Feature_ID || '';
        const bId = b.Feature_ID || '';
        return aId.localeCompare(bId);
    });

    tableBody.innerHTML = allFeatures.map(feature => `
        <tr>
            <td>
                <div class="module-badge ${Utils.getModuleColor(feature.Module_ID)}">
                    ${feature.Module_ID}
                </div>
            </td>
            <td><strong>${feature.Feature_ID || '-'}</strong></td>
            <td style="max-width: 300px;">${feature.Feature_Name || '-'}</td>
            <td>${Utils.getPriorityBadge(feature.Priority)}</td>
            <td>${Utils.getStatusBadge(feature.Coding_Status || 'Not Started')}</td>
            <td>${Utils.getStatusBadge(feature.Implementation_Status || 'Not Started')}</td>
            <td>
                ${feature.Unit_Testing_Status === 'Complete' ?
                    '<span class="status-badge completed">✓ Done</span>' :
                    '<span class="status-badge not-started">Pending</span>'}
            </td>
            <td>
                ${feature.All_OK_Status === 'Yes' ?
                    '<span class="status-badge completed">✓ YES</span>' :
                    '<span class="status-badge not-started">NO</span>'}
            </td>
        </tr>
    `).join('');
}

function setupFilters() {
    const moduleFilter = document.getElementById('module-filter');
    const searchInput = document.getElementById('validation-search');

    if (moduleFilter) {
        moduleFilter.addEventListener('change', () => {
            updateModuleValidations();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#validations-table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load validations on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadValidations function...');
    if (typeof loadValidations === 'function') {
        await DataLoader.loadAllData();
        loadValidations();
    }
});
