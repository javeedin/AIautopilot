// Table Data (loaded from CSV)
let tablesData = [];

// Load tables from CSV
async function loadTablesData() {
    try {
        const response = await fetch('../docs/requirements/Database_Tables_Master.csv');
        const csvText = await response.text();

        const lines = csvText.split('\n');
        const headers = lines[0].split(',');

        tablesData = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const values = lines[i].split(',');
            if (values.length < 3) continue;

            tablesData.push({
                tableId: values[0],
                moduleId: values[1],
                moduleName: values[2],
                tableName: values[3],
                description: values[4],
                primaryKey: values[5]
            });
        }

        console.log(`Loaded ${tablesData.length} tables`);
    } catch (error) {
        console.error('Error loading tables:', error);
        // Fallback: Create sample data
        tablesData = createSampleTables();
    }
}

// Create sample tables if CSV load fails
function createSampleTables() {
    return [
        { tableId: 'GL-T001', moduleId: 'GL', tableName: 'GL_LEDGERS', description: 'Ledger master configuration', primaryKey: 'LEDGER_ID' },
        { tableId: 'GL-T003', moduleId: 'GL', tableName: 'GL_ACCOUNTS', description: 'Account master data', primaryKey: 'ACCOUNT_ID' },
        { tableId: 'GL-T007', moduleId: 'GL', tableName: 'GL_JOURNALS', description: 'Journal headers', primaryKey: 'JOURNAL_ID' },
        { tableId: 'GL-T008', moduleId: 'GL', tableName: 'GL_JOURNAL_LINES', description: 'Journal line details', primaryKey: 'JOURNAL_LINE_ID' },
        { tableId: 'GL-T010', moduleId: 'GL', tableName: 'GL_CURRENCIES', description: 'Currency master', primaryKey: 'CURRENCY_CODE' },
        { tableId: 'AP-T001', moduleId: 'AP', tableName: 'AP_SUPPLIERS', description: 'Supplier master data', primaryKey: 'SUPPLIER_ID' },
        { tableId: 'AP-T002', moduleId: 'AP', tableName: 'AP_INVOICES', description: 'Invoice headers', primaryKey: 'INVOICE_ID' },
        { tableId: 'AP-T003', moduleId: 'AP', tableName: 'AP_INVOICE_LINES', description: 'Invoice line details', primaryKey: 'INVOICE_LINE_ID' },
        { tableId: 'AR-T001', moduleId: 'AR', tableName: 'AR_CUSTOMERS', description: 'Customer master data', primaryKey: 'CUSTOMER_ID' },
        { tableId: 'AR-T002', moduleId: 'AR', tableName: 'AR_INVOICES', description: 'Customer invoices', primaryKey: 'INVOICE_ID' },
        { tableId: 'PO-T001', moduleId: 'PO', tableName: 'PO_HEADERS', description: 'Purchase order headers', primaryKey: 'PO_HEADER_ID' },
        { tableId: 'PO-T002', moduleId: 'PO', tableName: 'PO_LINES', description: 'Purchase order lines', primaryKey: 'PO_LINE_ID' }
    ];
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadTablesData();
    loadPages();
});
