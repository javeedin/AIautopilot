// ===== development-readiness.js =====
console.log('*** development-readiness.js LOADED ***');

// Load Development Readiness Page
async function loadDevelopmentReadiness() {
    try {
        console.log('loadDevelopmentReadiness() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updateReadinessSummary();
        setupReadinessFilters();
        updateReadinessListing();

        console.log('Development readiness page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadDevelopmentReadiness():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updateReadinessSummary() {
    const items = DataStore.developmentReadiness || [];

    const readyCount = items.filter(i => i.Status === 'Ready').length;
    const inProgressCount = items.filter(i => i.Status === 'In Progress').length;
    const missingCount = items.filter(i => i.Status === 'Missing').length;

    // Calculate overall percentage (average of all completeness values)
    const totalPercent = items.reduce((sum, item) => sum + parseInt(item.Completeness_Percent || 0), 0);
    const overallPercent = items.length > 0 ? Math.round(totalPercent / items.length) : 0;

    document.getElementById('ready-count').textContent = Utils.formatNumber(readyCount);
    document.getElementById('in-progress-count').textContent = Utils.formatNumber(inProgressCount);
    document.getElementById('missing-count').textContent = Utils.formatNumber(missingCount);
    document.getElementById('overall-percent').textContent = overallPercent + '%';
}

function setupReadinessFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const items = DataStore.developmentReadiness || [];

    // Get unique categories
    const categories = [...new Set(items.map(i => i.Category).filter(c => c))];

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function updateReadinessListing() {
    const tableBody = document.getElementById('readiness-table-body');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');

    let items = DataStore.developmentReadiness || [];

    // Apply filters
    if (categoryFilter.value !== 'all') {
        items = items.filter(i => i.Category === categoryFilter.value);
    }
    if (statusFilter.value !== 'all') {
        items = items.filter(i => i.Status === statusFilter.value);
    }
    if (priorityFilter.value !== 'all') {
        items = items.filter(i => i.Priority === priorityFilter.value);
    }

    // Update count
    document.getElementById('filtered-count').textContent = `${Utils.formatNumber(items.length)} items`;

    if (items.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No items found</td></tr>';
        return;
    }

    // Render table
    tableBody.innerHTML = items.map(item => {
        const statusBadge = getReadinessStatusBadge(item.Status);
        const priorityBadge = Utils.getPriorityBadge(item.Priority);
        const percentColor = getPercentColor(parseInt(item.Completeness_Percent || 0));
        const blockerIcon = item.Blocker && item.Blocker !== 'None' ? '🚫' : '';

        return `
        <tr style="${item.Status === 'Missing' ? 'background: #fff5f5;' : ''}">
            <td><strong>${item.Category || '-'}</strong></td>
            <td>${item.Item || '-'}</td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${item.Completeness_Percent || 0}%; height: 100%; background: ${percentColor}; transition: width 0.3s;"></div>
                    </div>
                    <span style="min-width: 40px; text-align: right; font-weight: 600; color: ${percentColor};">
                        ${item.Completeness_Percent || 0}%
                    </span>
                </div>
            </td>
            <td>${priorityBadge}</td>
            <td>${item.Owner || 'TBD'}</td>
            <td>${blockerIcon} ${item.Blocker || 'None'}</td>
            <td style="max-width: 300px; font-size: 12px; color: #666;">${item.Notes || '-'}</td>
        </tr>
    `;
    }).join('');
}

function getReadinessStatusBadge(status) {
    const badges = {
        'Ready': '<span class="status-badge completed">✅ Ready</span>',
        'In Progress': '<span class="status-badge in-progress">🔨 In Progress</span>',
        'Missing': '<span class="status-badge not-started">❌ Missing</span>',
        'Partial': '<span class="status-badge in-progress">⚠️ Partial</span>'
    };
    return badges[status] || `<span class="status-badge">${status}</span>`;
}

function getPercentColor(percent) {
    if (percent >= 80) return '#10b981'; // Green
    if (percent >= 50) return '#f59e0b'; // Orange
    if (percent >= 20) return '#ef4444'; // Red
    return '#6b7280'; // Gray
}

function refreshData() {
    window.location.reload();
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, calling loadDevelopmentReadiness()...');
    loadDevelopmentReadiness();
});
