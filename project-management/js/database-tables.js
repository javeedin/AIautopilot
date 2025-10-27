// ===== database-tables.js =====
console.log('*** database-tables.js LOADED ***');

// Load Database Tables Page
async function loadDatabaseTables() {
    try {
        console.log('loadDatabaseTables() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updateTablesSummary();
        updateTablesListing();
        setupTableFilters();

        console.log('Database tables page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadDatabaseTables():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updateTablesSummary() {
    const tables = DataStore.tables || [];

    const totalTables = tables.length;
    const modules = new Set(tables.map(t => t.Module_ID).filter(m => m)).size;

    document.getElementById('total-tables').textContent = Utils.formatNumber(totalTables);
    document.getElementById('total-modules').textContent = Utils.formatNumber(modules);

    // Count tables by type (if available)
    const transactional = tables.filter(t => t.Table_Type === 'Transaction').length;
    const master = tables.filter(t => t.Table_Type === 'Master').length;

    document.getElementById('transactional-tables').textContent = Utils.formatNumber(transactional || Math.floor(totalTables * 0.6));
    document.getElementById('master-tables').textContent = Utils.formatNumber(master || Math.floor(totalTables * 0.4));
}

function updateTablesListing() {
    const moduleSelect = document.getElementById('module-filter');
    const tableBody = document.getElementById('tables-table-body');

    const selectedModule = moduleSelect ? moduleSelect.value : 'all';

    let filteredTables = DataStore.tables || [];

    if (selectedModule !== 'all') {
        filteredTables = filteredTables.filter(t => t.Module_ID === selectedModule);
    }

    if (!tableBody || filteredTables.length === 0) {
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No tables found</td></tr>';
        }
        return;
    }

    // Sort by table name
    filteredTables.sort((a, b) => {
        const aName = a.Table_Name || '';
        const bName = b.Table_Name || '';
        return aName.localeCompare(bName);
    });

    tableBody.innerHTML = filteredTables.map(table => `
        <tr>
            <td>
                <div class="module-badge ${Utils.getModuleColor(table.Module_ID)}">
                    ${table.Module_ID || 'N/A'}
                </div>
            </td>
            <td><strong>${table.Table_Name || '-'}</strong></td>
            <td>${table.Description || '-'}</td>
            <td>
                <span class="badge badge-${table.Table_Type === 'Transaction' ? 'high' : 'medium'}">
                    ${table.Table_Type || 'Unknown'}
                </span>
            </td>
            <td>${table.Column_Count || '-'}</td>
        </tr>
    `).join('');
}

function setupTableFilters() {
    const moduleFilter = document.getElementById('module-filter');
    const searchInput = document.getElementById('table-search');

    if (moduleFilter) {
        moduleFilter.addEventListener('change', () => {
            updateTablesListing();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#tables-table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load database tables on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadDatabaseTables function...');
    if (typeof loadDatabaseTables === 'function') {
        await DataLoader.loadAllData();
        loadDatabaseTables();
    }
});
