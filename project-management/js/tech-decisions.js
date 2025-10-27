console.log('*** tech-decisions.js LOADED ***');

async function loadTechDecisions() {
    try {
        if (!DataStore.loaded) await DataLoader.loadAllData();

        const decisions = DataStore.techDecisions || [];

        const confirmed = decisions.filter(d => d.Status === 'Confirmed').length;
        const pending = decisions.filter(d => d.Status === 'Pending').length;
        const blockers = decisions.filter(d => d.Blocker_For && d.Blocker_For !== 'None').length;
        const critical = decisions.filter(d => d.Priority === 'Critical').length;

        document.getElementById('confirmed-count').textContent = Utils.formatNumber(confirmed);
        document.getElementById('pending-count').textContent = Utils.formatNumber(pending);
        document.getElementById('blocker-count').textContent = Utils.formatNumber(blockers);
        document.getElementById('critical-count').textContent = Utils.formatNumber(critical);

        setupDecisionFilters();
        updateDecisionsListing();

        console.log('Tech decisions page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadTechDecisions():', error);
    }
}

function setupDecisionFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const decisions = DataStore.techDecisions || [];

    const categories = [...new Set(decisions.map(d => d.Category).filter(c => c))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function updateDecisionsListing() {
    const tbody = document.getElementById('decisions-table-body');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const priorityFilter = document.getElementById('priority-filter');

    let decisions = DataStore.techDecisions || [];

    if (categoryFilter.value !== 'all') {
        decisions = decisions.filter(d => d.Category === categoryFilter.value);
    }
    if (statusFilter.value !== 'all') {
        decisions = decisions.filter(d => d.Status === statusFilter.value);
    }
    if (priorityFilter.value !== 'all') {
        decisions = decisions.filter(d => d.Priority === priorityFilter.value);
    }

    document.getElementById('filtered-count').textContent = `${Utils.formatNumber(decisions.length)} decisions`;

    if (decisions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No decisions found</td></tr>';
        return;
    }

    tbody.innerHTML = decisions.map(decision => {
        const statusBadge = decision.Status === 'Confirmed'
            ? '<span class="status-badge completed">✅ Confirmed</span>'
            : '<span class="status-badge not-started">⏳ Pending</span>';

        const priorityBadge = Utils.getPriorityBadge(decision.Priority);
        const blockerIcon = decision.Blocker_For && decision.Blocker_For !== 'None' ? '🚫' : '';
        const rowStyle = decision.Status === 'Pending' && decision.Priority === 'Critical' ? 'background: #fff5f5;' : '';

        return `
        <tr style="${rowStyle}">
            <td><strong>${decision.Category || '-'}</strong></td>
            <td>${decision.Decision_Item || '-'}</td>
            <td>${statusBadge}</td>
            <td><strong>${decision.Selected_Option || '⚠️ TBD'}</strong></td>
            <td style="font-size: 11px; max-width: 200px;">${decision.Alternative_Options || '-'}</td>
            <td>${priorityBadge}</td>
            <td style="font-size: 12px; max-width: 250px;">${decision.Rationale || '-'}</td>
            <td style="font-size: 12px;">${blockerIcon} ${decision.Blocker_For || 'None'}</td>
        </tr>
    `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', loadTechDecisions);
