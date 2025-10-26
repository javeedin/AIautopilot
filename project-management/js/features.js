// ===== Features Page Functions =====

let allFeatures = [];
let filteredFeatures = [];
let currentPage = 1;
const featuresPerPage = 50;

// Load Features
async function loadFeatures() {
    if (!DataStore.loaded) {
        await DataLoader.loadAllData();
    }

    // Collect all features from all modules
    allFeatures = [];
    Object.entries(DataStore.validations).forEach(([moduleId, features]) => {
        if (features && Array.isArray(features)) {
            features.forEach(feature => {
                allFeatures.push({
                    ...feature,
                    Module_ID: moduleId
                });
            });
        }
    });

    // Initial display
    filteredFeatures = [...allFeatures];
    populateFilters();
    updateFeaturesSummary();
    displayFeatures();
    setupFilterListeners();
}

// Populate Filter Dropdowns
function populateFilters() {
    const moduleFilter = document.getElementById('module-filter');
    if (moduleFilter) {
        const modules = [...new Set(allFeatures.map(f => f.Module_ID))].sort();
        modules.forEach(module => {
            const option = document.createElement('option');
            option.value = module;
            option.textContent = `${module} - ${Utils.getModuleName(module)}`;
            moduleFilter.appendChild(option);
        });
    }
}

// Update Features Summary
function updateFeaturesSummary() {
    document.getElementById('displayed-features').textContent = Utils.formatNumber(filteredFeatures.length);
    document.getElementById('critical-features').textContent = Utils.formatNumber(
        filteredFeatures.filter(f => f.Priority === 'Critical').length
    );
    document.getElementById('high-features').textContent = Utils.formatNumber(
        filteredFeatures.filter(f => f.Priority === 'High').length
    );
    document.getElementById('completed-features').textContent = Utils.formatNumber(
        filteredFeatures.filter(f => f.All_OK_Status === 'Yes').length
    );
}

// Display Features in Table
function displayFeatures() {
    const tableBody = document.getElementById('features-table-body');
    if (!tableBody) return;

    const start = (currentPage - 1) * featuresPerPage;
    const end = start + featuresPerPage;
    const paginatedFeatures = filteredFeatures.slice(start, end);

    if (paginatedFeatures.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9">
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3 class="empty-state-title">No Features Found</h3>
                        <p class="empty-state-description">Try adjusting your filters</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = paginatedFeatures.map(feature => `
        <tr>
            <td><strong>${feature.Feature_ID}</strong></td>
            <td>
                <span class="badge badge-info">${feature.Module_ID}</span>
            </td>
            <td style="max-width: 300px;">
                <div style="font-weight: 500; margin-bottom: 4px;">${feature.Feature_Name}</div>
            </td>
            <td>${Utils.getPriorityBadge(feature.Priority)}</td>
            <td>
                <span class="badge ${getCodingStatusClass(feature.Coding_Status)}">
                    ${feature.Coding_Status}
                </span>
            </td>
            <td>
                <span class="badge ${getImplStatusClass(feature.Implementation_Status)}">
                    ${feature.Implementation_Status}
                </span>
            </td>
            <td>
                <span class="badge ${getTestStatusClass(feature.UAT_Status)}">
                    ${feature.UAT_Status}
                </span>
            </td>
            <td>
                ${feature.All_OK_Status === 'Yes' ?
                    '<span class="badge badge-success">✅ Yes</span>' :
                    '<span class="badge badge-warning">❌ No</span>'}
            </td>
            <td>${feature.Assigned_To || 'TBD'}</td>
        </tr>
    `).join('');

    updatePagination();
}

// Get Status Class
function getCodingStatusClass(status) {
    const classes = {
        'Not Started': 'badge-low',
        'In Progress': 'badge-info',
        'Code Complete': 'badge-success',
        'Code Review': 'badge-warning'
    };
    return classes[status] || 'badge-low';
}

function getImplStatusClass(status) {
    const classes = {
        'Not Started': 'badge-low',
        'Dev': 'badge-info',
        'QA': 'badge-warning',
        'Staging': 'badge-high',
        'Production': 'badge-success'
    };
    return classes[status] || 'badge-low';
}

function getTestStatusClass(status) {
    const classes = {
        'Not Started': 'badge-low',
        'In Progress': 'badge-info',
        'Passed': 'badge-success',
        'Failed': 'badge-danger'
    };
    return classes[status] || 'badge-low';
}

// Update Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredFeatures.length / featuresPerPage);
    const paginationInfo = document.getElementById('pagination-info');
    const paginationControls = document.getElementById('pagination-controls');

    if (paginationInfo) {
        const start = (currentPage - 1) * featuresPerPage + 1;
        const end = Math.min(currentPage * featuresPerPage, filteredFeatures.length);
        paginationInfo.textContent = `Showing ${start}-${end} of ${filteredFeatures.length} features`;
    }

    if (paginationControls) {
        let html = '';

        // Previous button
        html += `<button class="btn-secondary" ${currentPage === 1 ? 'disabled' : ''}
                 onclick="changePage(${currentPage - 1})">« Previous</button>`;

        // Page numbers
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="btn-secondary ${i === currentPage ? 'btn-primary' : ''}"
                     onclick="changePage(${i})">${i}</button>`;
        }

        // Next button
        html += `<button class="btn-secondary" ${currentPage === totalPages ? 'disabled' : ''}
                 onclick="changePage(${currentPage + 1})">Next »</button>`;

        paginationControls.innerHTML = html;
    }
}

// Change Page
function changePage(page) {
    const totalPages = Math.ceil(filteredFeatures.length / featuresPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayFeatures();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Setup Filter Listeners
function setupFilterListeners() {
    // Module filter
    document.getElementById('module-filter')?.addEventListener('change', applyFilters);

    // Priority filter
    document.getElementById('priority-filter')?.addEventListener('change', applyFilters);

    // Search filter
    document.getElementById('feature-search')?.addEventListener('input', applyFilters);
}

// Apply Filters
function applyFilters() {
    const moduleFilter = document.getElementById('module-filter')?.value;
    const priorityFilter = document.getElementById('priority-filter')?.value;
    const searchFilter = document.getElementById('feature-search')?.value.toLowerCase();

    filteredFeatures = allFeatures.filter(feature => {
        // Module filter
        if (moduleFilter && feature.Module_ID !== moduleFilter) return false;

        // Priority filter
        if (priorityFilter && feature.Priority !== priorityFilter) return false;

        // Search filter
        if (searchFilter) {
            const searchText = `${feature.Feature_ID} ${feature.Feature_Name}`.toLowerCase();
            if (!searchText.includes(searchFilter)) return false;
        }

        return true;
    });

    currentPage = 1;
    updateFeaturesSummary();
    displayFeatures();
}

// Export to CSV
function exportToCSV() {
    const csv = Papa.unparse(filteredFeatures);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `features_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Load on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (DataStore.loaded) {
            loadFeatures();
        } else {
            setTimeout(() => {
                if (DataStore.loaded) {
                    loadFeatures();
                }
            }, 1000);
        }
    }, 500);
});
