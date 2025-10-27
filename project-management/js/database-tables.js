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
        <tr onclick="showTableDetails('${table.Table_ID}', '${table.Table_Name}')" style="cursor: pointer;">
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

// Show table details modal
function showTableDetails(tableId, tableName) {
    const columns = DataStore.tablesDetailed.filter(col => col.Table_ID === tableId);

    if (!columns || columns.length === 0) {
        alert('No column details available for this table');
        return;
    }

    const modal = document.getElementById('tableDetailsModal');
    const modalTitle = document.getElementById('modalTableName');
    const columnsBody = document.getElementById('modalColumnsBody');
    const ddlText = document.getElementById('modalDDLText');

    modalTitle.textContent = tableName;

    // Populate columns table
    columnsBody.innerHTML = columns.map(col => `
        <tr>
            <td><strong>${col.Column_Name || '-'}</strong></td>
            <td>${col.Data_Type || '-'}</td>
            <td>
                <span class="badge badge-${col.Nullable === 'NOT NULL' ? 'critical' : 'low'}">
                    ${col.Nullable || 'NULL'}
                </span>
            </td>
            <td>${col.Default_Value || '-'}</td>
            <td>${col.Description || '-'}</td>
            <td>
                <span class="badge badge-${col.Column_Category === 'PK' ? 'critical' : 'medium'}">
                    ${col.Column_Category || '-'}
                </span>
            </td>
        </tr>
    `).join('');

    // Generate Oracle DDL
    const ddl = generateOracleDDL(tableName, columns);
    ddlText.textContent = ddl;

    // Show modal
    modal.style.display = 'block';
}

// Generate Oracle CREATE TABLE DDL
function generateOracleDDL(tableName, columns) {
    let ddl = `CREATE TABLE ${tableName} (\n`;

    // Add columns
    const columnDefs = columns.map(col => {
        let def = `    ${col.Column_Name} ${col.Data_Type}`;
        if (col.Default_Value) {
            def += ` DEFAULT ${col.Default_Value}`;
        }
        if (col.Nullable === 'NOT NULL') {
            def += ' NOT NULL';
        }
        return def;
    });

    ddl += columnDefs.join(',\n');

    // Add primary key constraint
    const pkColumns = columns.filter(col => col.Column_Category === 'PK');
    if (pkColumns.length > 0) {
        ddl += `,\n    CONSTRAINT pk_${tableName.toLowerCase()} PRIMARY KEY (${pkColumns.map(c => c.Column_Name).join(', ')})`;
    }

    ddl += '\n);';

    // Add comments
    ddl += `\n\n-- Table Comment\nCOMMENT ON TABLE ${tableName} IS 'Auto-generated from ERP requirements';\n`;

    columns.forEach(col => {
        if (col.Description) {
            ddl += `\nCOMMENT ON COLUMN ${tableName}.${col.Column_Name} IS '${col.Description.replace(/'/g, "''")}';`;
        }
    });

    return ddl;
}

// Close modal
function closeTableModal() {
    document.getElementById('tableDetailsModal').style.display = 'none';
}

// Copy DDL to clipboard
function copyDDL() {
    const ddlText = document.getElementById('modalDDLText');
    navigator.clipboard.writeText(ddlText.textContent).then(() => {
        alert('DDL copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Load database tables on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadDatabaseTables function...');
    if (typeof loadDatabaseTables === 'function') {
        await DataLoader.loadAllData();
        loadDatabaseTables();
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('tableDetailsModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});
