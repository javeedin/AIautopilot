console.log('*** dev-activity-log.js LOADED ***');

async function loadDevActivityLog() {
    try {
        if (!DataStore.loaded) await DataLoader.loadAllData();

        const activities = DataStore.devActivityLog || [];

        const totalActivities = activities.length;
        const completed = activities.filter(a => a.Status === 'Completed').length;
        const failed = activities.filter(a => a.Status === 'Failed').length;

        const totalMinutes = activities.reduce((sum, a) => sum + parseInt(a.Time_Spent_Minutes || 0), 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        document.getElementById('total-activities').textContent = Utils.formatNumber(totalActivities);
        document.getElementById('completed-activities').textContent = Utils.formatNumber(completed);
        document.getElementById('failed-activities').textContent = Utils.formatNumber(failed);
        document.getElementById('total-time').textContent = totalHours + 'h';

        setupActivityFilters();
        updateActivityListing();

        console.log('Dev activity log page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadDevActivityLog():', error);
    }
}

function setupActivityFilters() {
    const moduleFilter = document.getElementById('module-filter');
    const actionFilter = document.getElementById('action-filter');
    const activities = DataStore.devActivityLog || [];

    const modules = [...new Set(activities.map(a => a.Module_ID).filter(m => m))];
    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module;
        option.textContent = module;
        moduleFilter.appendChild(option);
    });

    const actionTypes = [...new Set(activities.map(a => a.Action_Type).filter(a => a))];
    actionTypes.forEach(action => {
        const option = document.createElement('option');
        option.value = action;
        option.textContent = action;
        actionFilter.appendChild(option);
    });
}

function updateActivityListing() {
    const tbody = document.getElementById('activity-table-body');
    const moduleFilter = document.getElementById('module-filter');
    const pageFilter = document.getElementById('page-filter');
    const actionFilter = document.getElementById('action-filter');
    const statusFilter = document.getElementById('status-filter');

    let activities = DataStore.devActivityLog || [];

    if (moduleFilter.value !== 'all') {
        activities = activities.filter(a => a.Module_ID === moduleFilter.value);
    }
    if (pageFilter.value.trim()) {
        activities = activities.filter(a => a.Page_ID && a.Page_ID.includes(pageFilter.value.trim()));
    }
    if (actionFilter.value !== 'all') {
        activities = activities.filter(a => a.Action_Type === actionFilter.value);
    }
    if (statusFilter.value !== 'all') {
        activities = activities.filter(a => a.Status === statusFilter.value);
    }

    // Sort by timestamp descending (newest first)
    activities.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    document.getElementById('filtered-count').textContent = `${Utils.formatNumber(activities.length)} activities`;

    if (activities.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px;">No activities found</td></tr>';
        return;
    }

    tbody.innerHTML = activities.map(activity => {
        const statusBadge = getActivityStatusBadge(activity.Status);
        const actionIcon = getActionIcon(activity.Action_Type);
        const errorDisplay = activity.Error_Details
            ? `<div style="color: #ef4444; font-size: 11px;">
                 <strong>Line ${activity.Error_Line_Number}:</strong> ${activity.Error_Details}
               </div>`
            : '-';

        const rowStyle = activity.Status === 'Failed' ? 'background: #fff5f5;' :
                        activity.Status === 'In Progress' ? 'background: #eff6ff;' : '';

        return `
        <tr style="${rowStyle}">
            <td style="font-size: 11px;">${formatTimestamp(activity.Timestamp)}</td>
            <td><div class="module-badge ${Utils.getModuleColor(activity.Module_ID)}">${activity.Module_ID || '-'}</div></td>
            <td><strong>${activity.Page_ID || '-'}</strong></td>
            <td>${activity.Feature_ID || '-'}</td>
            <td>${actionIcon} ${activity.Action_Type || '-'}</td>
            <td style="font-size: 12px; max-width: 300px;">${activity.Action_Description || '-'}</td>
            <td><strong>${activity.Time_Spent_Minutes || 0}</strong> min</td>
            <td>${statusBadge}</td>
            <td style="font-size: 11px; max-width: 250px;">${errorDisplay}</td>
        </tr>
    `;
    }).join('');
}

function getActivityStatusBadge(status) {
    const badges = {
        'Completed': '<span class="status-badge completed">✅ Completed</span>',
        'In Progress': '<span class="status-badge in-progress">🔄 In Progress</span>',
        'Failed': '<span class="status-badge not-started">❌ Failed</span>'
    };
    return badges[status] || `<span class="status-badge">${status}</span>`;
}

function getActionIcon(actionType) {
    const icons = {
        'Requirements Review': '📋',
        'Database Analysis': '🗄️',
        'Wireframe Design': '🎨',
        'API Specification': '📝',
        'Backend API Development': '⚙️',
        'API Testing': '🧪',
        'Frontend Page Structure': '🏗️',
        'Filter Implementation': '🔍',
        'Data Grid Implementation': '📊',
        'Bug Fix': '🐛',
        'Action Buttons': '🔘',
        'Export Feature': '📤',
        'Testing': '✅',
        'Documentation': '📚',
        'Code Review': '👀',
        'Error': '❌'
    };
    return icons[actionType] || '📌';
}

function formatTimestamp(timestamp) {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

document.addEventListener('DOMContentLoaded', loadDevActivityLog);
