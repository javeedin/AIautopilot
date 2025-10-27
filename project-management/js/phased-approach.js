console.log('*** phased-approach.js LOADED ***');

async function loadPhasedApproach() {
    try {
        if (!DataStore.loaded) await DataLoader.loadAllData();

        const phases = DataStore.phasedApproach || [];

        const completed = phases.filter(p => p.Status === 'Completed').length;
        const inProgress = phases.filter(p => p.Status === 'In Progress').length;
        const notStarted = phases.filter(p => p.Status === 'Not Started').length;

        const totalProgress = phases.reduce((sum, p) => sum + parseInt(p.Completeness_Percent || 0), 0);
        const overall = phases.length > 0 ? Math.round(totalProgress / phases.length) : 0;

        document.getElementById('completed-phases').textContent = completed;
        document.getElementById('in-progress-phases').textContent = inProgress;
        document.getElementById('pending-phases').textContent = notStarted;
        document.getElementById('overall-progress').textContent = overall + '%';

        const tbody = document.getElementById('phases-table-body');
        tbody.innerHTML = phases.map(phase => {
            const progressBarColor = phase.Status === 'Completed' ? '#10b981' : '#3b82f6';
            return `
            <tr style="${phase.Status === 'In Progress' ? 'background: #eff6ff;' : ''}">
                <td><strong>${phase.Phase_Name || '-'}</strong></td>
                <td style="max-width: 400px;">${phase.Description || '-'}</td>
                <td>${Utils.getStatusBadge(phase.Status)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px;">
                            <div style="width: ${phase.Completeness_Percent || 0}%; height: 100%; background: ${progressBarColor};"></div>
                        </div>
                        <span style="min-width: 40px; text-align: right;">${phase.Completeness_Percent || 0}%</span>
                    </div>
                </td>
                <td>${phase.Target_Date || 'TBD'}</td>
                <td style="font-size: 12px; max-width: 250px;">${phase.Deliverables || '-'}</td>
                <td style="font-size: 12px;">${phase.Dependencies || 'None'}</td>
            </tr>
        `;
        }).join('');

        console.log('Phased approach page loaded successfully!');
    } catch (error) {
        console.error('ERROR in loadPhasedApproach():', error);
    }
}

document.addEventListener('DOMContentLoaded', loadPhasedApproach);
