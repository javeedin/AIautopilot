// ===== reports.js =====
console.log('*** reports.js LOADED ***');

// Load Reports Page
async function loadReports() {
    try {
        console.log('loadReports() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updateReportsSummary();
        createReportsCharts();

        console.log('Reports page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadReports():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updateReportsSummary() {
    const stats = DataLoader.getStats();
    if (!stats) return;

    document.getElementById('total-features-report').textContent = Utils.formatNumber(stats.features);
    document.getElementById('completion-rate-report').textContent = stats.completionRate + '%';
    document.getElementById('priority-critical').textContent = Utils.formatNumber(stats.priorityCritical);
    document.getElementById('priority-high').textContent = Utils.formatNumber(stats.priorityHigh);
}

function createReportsCharts() {
    createModuleComparisonChart();
    createStatusDistributionChart();
}

function createModuleComparisonChart() {
    const canvas = document.getElementById('moduleComparisonChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const moduleStats = DataLoader.getModuleStats();

    const data = moduleStats.slice(0, 10); // Top 10 modules

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(m => m.id),
            datasets: [{
                label: 'Features',
                data: data.map(m => m.features),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
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
                            return `Features: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
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

function createStatusDistributionChart() {
    const canvas = document.getElementById('statusDistributionChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stats = DataLoader.getStats();

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Not Started', 'In Progress', 'Code Complete', 'Production'],
            datasets: [{
                data: [
                    stats.notStarted,
                    stats.inProgress,
                    stats.codeComplete,
                    stats.production
                ],
                backgroundColor: [
                    'rgba(148, 163, 184, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgba(148, 163, 184, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
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

// Load reports on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadReports function...');
    if (typeof loadReports === 'function') {
        await DataLoader.loadAllData();
        loadReports();
    }
});
