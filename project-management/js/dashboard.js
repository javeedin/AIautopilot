// ===== Dashboard Specific Functions =====

let moduleProgressChart = null;
let priorityChart = null;

// Load Dashboard
async function loadDashboard() {
    if (!DataStore.loaded) {
        await DataLoader.loadAllData();
    }

    updateKPIs();
    updateStatusCards();
    updatePriorityList();
    updateModulesTable();
    createCharts();
}

// Update KPI Cards
function updateKPIs() {
    const stats = DataLoader.getStats();
    if (!stats) return;

    // Update KPI values
    document.getElementById('total-modules').textContent = stats.modules;
    document.getElementById('total-features').textContent = Utils.formatNumber(stats.features);
    document.getElementById('total-pages').textContent = Utils.formatNumber(stats.pages);
    document.getElementById('total-tables').textContent = Utils.formatNumber(stats.tables) + '+';

    // Update completion rate
    const completionRate = parseFloat(stats.completionRate);
    document.getElementById('completion-rate').textContent = completionRate.toFixed(1) + '%';
    document.getElementById('completion-bar').style.width = completionRate + '%';
}

// Update Status Cards
function updateStatusCards() {
    const stats = DataLoader.getStats();
    if (!stats) return;

    document.getElementById('status-not-started').textContent = Utils.formatNumber(stats.notStarted);
    document.getElementById('status-in-progress').textContent = Utils.formatNumber(stats.inProgress);
    document.getElementById('status-complete').textContent = Utils.formatNumber(stats.codeComplete);
    document.getElementById('status-testing').textContent = Utils.formatNumber(stats.testing);
    document.getElementById('status-production').textContent = Utils.formatNumber(stats.production);
    document.getElementById('status-blocked').textContent = Utils.formatNumber(stats.blocked);
}

// Update Priority List
function updatePriorityList() {
    const moduleStats = DataLoader.getModuleStats();
    if (!moduleStats || moduleStats.length === 0) return;

    const priorityList = document.getElementById('priority-list');
    if (!priorityList) return;

    // Filter modules with critical or high priority features
    const priorityModules = moduleStats
        .filter(m => m.critical > 0 || m.high > 0)
        .sort((a, b) => (b.critical + b.high) - (a.critical + a.high))
        .slice(0, 8);

    priorityList.innerHTML = priorityModules.map(module => `
        <div class="priority-item">
            <div class="priority-module">
                <div class="priority-icon">${module.id}</div>
                <div class="priority-info">
                    <h4>${module.name}</h4>
                    <p>${module.features} features</p>
                </div>
            </div>
            <div class="priority-count">
                <span class="count">${module.critical + module.high}</span>
                <span class="label">High Priority</span>
            </div>
        </div>
    `).join('');
}

// Update Modules Table
function updateModulesTable() {
    const moduleStats = DataLoader.getModuleStats();
    if (!moduleStats || moduleStats.length === 0) return;

    const tableBody = document.getElementById('modules-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = moduleStats.map(module => `
        <tr>
            <td>
                <div class="module-name">
                    <div class="module-badge ${Utils.getModuleColor(module.id)}">${module.id}</div>
                    <div class="module-info">
                        <h4>${module.name}</h4>
                        <p>${module.id}</p>
                    </div>
                </div>
            </td>
            <td><strong>${Utils.formatNumber(module.features)}</strong></td>
            <td>
                ${module.critical > 0 ?
                    `<span class="badge badge-critical">${module.critical}</span>` :
                    '<span class="badge badge-low">0</span>'}
            </td>
            <td>
                ${module.high > 0 ?
                    `<span class="badge badge-high">${module.high}</span>` :
                    '<span class="badge badge-low">0</span>'}
            </td>
            <td>${Utils.formatNumber(module.pages)}</td>
            <td>${Utils.formatNumber(module.tables)}</td>
            <td>${Utils.getStatusBadge(module.completed > 0 ? 'In Progress' : 'Not Started')}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${module.progress}%"></div>
                </div>
                <span style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; display: inline-block;">
                    ${module.progress}%
                </span>
            </td>
        </tr>
    `).join('');

    // Add search functionality
    const searchInput = document.getElementById('module-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Create Charts
function createCharts() {
    createModuleProgressChart();
    createPriorityChart();
}

// Create Module Progress Chart
function createModuleProgressChart() {
    const canvas = document.getElementById('moduleProgressChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const moduleStats = DataLoader.getModuleStats();

    // Destroy existing chart
    if (moduleProgressChart) {
        moduleProgressChart.destroy();
    }

    // Prepare data
    const labels = moduleStats.map(m => m.id);
    const data = moduleStats.map(m => parseFloat(m.progress));
    const colors = moduleStats.map(m => {
        const progress = parseFloat(m.progress);
        if (progress === 0) return 'rgba(148, 163, 184, 0.8)';
        if (progress < 30) return 'rgba(239, 68, 68, 0.8)';
        if (progress < 70) return 'rgba(245, 158, 11, 0.8)';
        return 'rgba(16, 185, 129, 0.8)';
    });

    moduleProgressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Completion %',
                data: data,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.8', '1')),
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Completion: ${context.parsed.y.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Create Priority Chart
function createPriorityChart() {
    const canvas = document.getElementById('priorityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stats = DataLoader.getStats();

    // Destroy existing chart
    if (priorityChart) {
        priorityChart.destroy();
    }

    priorityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Critical', 'High', 'Medium', 'Low'],
            datasets: [{
                data: [
                    stats.priorityCritical,
                    stats.priorityHigh,
                    stats.priorityMedium,
                    stats.priorityLow
                ],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(148, 163, 184, 0.8)'
                ],
                borderColor: [
                    'rgba(239, 68, 68, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(148, 163, 184, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Chart Filter
document.addEventListener('DOMContentLoaded', () => {
    const chartFilter = document.getElementById('chart-filter');
    if (chartFilter) {
        chartFilter.addEventListener('change', (e) => {
            const filterValue = e.target.value;
            // TODO: Implement filtering logic
            console.log('Filter changed:', filterValue);
            // For now, just reload the chart
            createModuleProgressChart();
        });
    }
});

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for data to load
    setTimeout(() => {
        if (DataStore.loaded) {
            loadDashboard();
        } else {
            // Retry after a second
            setTimeout(() => {
                if (DataStore.loaded) {
                    loadDashboard();
                }
            }, 1000);
        }
    }, 500);
});
