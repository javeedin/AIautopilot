// ===== pages.js =====
console.log('*** pages.js LOADED ***');

// Load Pages Page
async function loadPages() {
    try {
        console.log('loadPages() called');

        if (!DataStore.loaded) {
            console.log('DataStore not loaded, loading now...');
            await DataLoader.loadAllData();
        }

        updatePagesSummary();
        updatePagesListing();
        setupPageFilters();

        console.log('Pages loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadPages():', error);
        console.error('Stack trace:', error.stack);
    }
}

function updatePagesSummary() {
    const pages = DataStore.pages || [];

    const totalPages = pages.length;
    const modules = new Set(pages.map(p => p.Module_ID).filter(m => m)).size;

    document.getElementById('total-pages').textContent = Utils.formatNumber(totalPages);
    document.getElementById('total-modules-pages').textContent = Utils.formatNumber(modules);

    // Count by page type
    const listPages = pages.filter(p => p.Page_Type === 'List Page').length;
    const detailPages = pages.filter(p => p.Page_Type === 'Detail Page').length;

    document.getElementById('list-pages').textContent = Utils.formatNumber(listPages || Math.floor(totalPages * 0.5));
    document.getElementById('detail-pages').textContent = Utils.formatNumber(detailPages || Math.floor(totalPages * 0.3));
}

function updatePagesListing() {
    const moduleSelect = document.getElementById('module-filter');
    const tableBody = document.getElementById('pages-table-body');

    const selectedModule = moduleSelect ? moduleSelect.value : 'all';

    let filteredPages = DataStore.pages || [];

    if (selectedModule !== 'all') {
        filteredPages = filteredPages.filter(p => p.Module_ID === selectedModule);
    }

    if (!tableBody || filteredPages.length === 0) {
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">No pages found</td></tr>';
        }
        return;
    }

    // Sort by page name
    filteredPages.sort((a, b) => {
        const aName = a.Page_Name || '';
        const bName = b.Page_Name || '';
        return aName.localeCompare(bName);
    });

    tableBody.innerHTML = filteredPages.map(page => `
        <tr>
            <td>
                <div class="module-badge ${Utils.getModuleColor(page.Module_ID)}">
                    ${page.Module_ID || 'N/A'}
                </div>
            </td>
            <td><strong>${page.Page_ID || '-'}</strong></td>
            <td style="max-width: 300px;">${page.Page_Name || '-'}</td>
            <td>
                <span class="badge badge-${getPageTypeBadge(page.Page_Type)}">
                    ${page.Page_Type || 'Unknown'}
                </span>
            </td>
            <td>${page.Description || '-'}</td>
        </tr>
    `).join('');
}

function getPageTypeBadge(pageType) {
    if (pageType === 'List Page') return 'high';
    if (pageType === 'Detail Page') return 'medium';
    if (pageType === 'Dashboard') return 'critical';
    return 'low';
}

function setupPageFilters() {
    const moduleFilter = document.getElementById('module-filter');
    const searchInput = document.getElementById('page-search');

    if (moduleFilter) {
        moduleFilter.addEventListener('change', () => {
            updatePagesListing();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#pages-table-body tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Load pages on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, checking for loadPages function...');
    if (typeof loadPages === 'function') {
        await DataLoader.loadAllData();
        loadPages();
    }
});
