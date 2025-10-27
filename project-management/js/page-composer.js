// ===== page-composer.js =====
console.log('*** page-composer.js LOADED ***');

// Layout Templates - Define fields for each layout type
const layoutTemplates = {
    customer: {
        title: 'Customer Information',
        icon: '👤',
        sections: [
            {
                name: 'Basic Information',
                fields: [
                    { label: 'Customer Number', type: 'text', width: 'half' },
                    { label: 'Customer Name', type: 'text', width: 'half' },
                    { label: 'Customer Type', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'Tax ID', type: 'text', width: 'half' },
                    { label: 'Credit Limit', type: 'number', width: 'half' }
                ]
            },
            {
                name: 'Contact Information',
                fields: [
                    { label: 'Email', type: 'email', width: 'half' },
                    { label: 'Phone', type: 'tel', width: 'half' },
                    { label: 'Address Line 1', type: 'text', width: 'full' },
                    { label: 'Address Line 2', type: 'text', width: 'full' },
                    { label: 'City', type: 'text', width: 'third' },
                    { label: 'State/Province', type: 'text', width: 'third' },
                    { label: 'Postal Code', type: 'text', width: 'third' }
                ]
            },
            {
                name: 'Billing Information',
                fields: [
                    { label: 'Payment Terms', type: 'select', width: 'half' },
                    { label: 'Payment Method', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'half' },
                    { label: 'Account Manager', type: 'select', width: 'half' }
                ]
            }
        ]
    },
    supplier: {
        title: 'Supplier Information',
        icon: '🏢',
        sections: [
            {
                name: 'Company Details',
                fields: [
                    { label: 'Supplier Number', type: 'text', width: 'half' },
                    { label: 'Supplier Name', type: 'text', width: 'half' },
                    { label: 'Legal Entity Name', type: 'text', width: 'full' },
                    { label: 'Supplier Type', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'Tax Registration Number', type: 'text', width: 'half' },
                    { label: 'Vendor Category', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Contact & Location',
                fields: [
                    { label: 'Primary Contact', type: 'text', width: 'half' },
                    { label: 'Phone Number', type: 'tel', width: 'half' },
                    { label: 'Email Address', type: 'email', width: 'full' },
                    { label: 'Street Address', type: 'text', width: 'full' },
                    { label: 'City', type: 'text', width: 'third' },
                    { label: 'State', type: 'text', width: 'third' },
                    { label: 'Zip Code', type: 'text', width: 'third' }
                ]
            },
            {
                name: 'Payment Terms',
                fields: [
                    { label: 'Payment Terms', type: 'select', width: 'half' },
                    { label: 'Payment Method', type: 'select', width: 'half' },
                    { label: 'Bank Name', type: 'text', width: 'half' },
                    { label: 'Bank Account Number', type: 'text', width: 'half' },
                    { label: 'Routing Number', type: 'text', width: 'half' },
                    { label: 'Swift/BIC Code', type: 'text', width: 'half' }
                ]
            }
        ]
    },
    invoice: {
        title: 'Invoice Details',
        icon: '🧾',
        sections: [
            {
                name: 'Invoice Header',
                fields: [
                    { label: 'Invoice Number', type: 'text', width: 'half' },
                    { label: 'Invoice Date', type: 'date', width: 'half' },
                    { label: 'Due Date', type: 'date', width: 'half' },
                    { label: 'Invoice Type', type: 'select', width: 'half' },
                    { label: 'Customer/Supplier', type: 'select', width: 'half' },
                    { label: 'Payment Terms', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'third' },
                    { label: 'Exchange Rate', type: 'number', width: 'third' },
                    { label: 'Status', type: 'select', width: 'third' }
                ]
            },
            {
                name: 'Invoice Lines',
                fields: [
                    { label: 'Line Item Table', type: 'table', width: 'full',
                      columns: ['Item', 'Description', 'Quantity', 'Unit Price', 'Tax', 'Total'] }
                ]
            },
            {
                name: 'Invoice Totals',
                fields: [
                    { label: 'Subtotal', type: 'number', width: 'half', readonly: true },
                    { label: 'Tax Amount', type: 'number', width: 'half', readonly: true },
                    { label: 'Discount', type: 'number', width: 'half' },
                    { label: 'Total Amount', type: 'number', width: 'half', readonly: true }
                ]
            }
        ]
    },
    transaction: {
        title: 'Transaction Entry',
        icon: '💳',
        sections: [
            {
                name: 'Transaction Header',
                fields: [
                    { label: 'Transaction Number', type: 'text', width: 'half' },
                    { label: 'Transaction Date', type: 'date', width: 'half' },
                    { label: 'Transaction Type', type: 'select', width: 'half' },
                    { label: 'Source', type: 'select', width: 'half' },
                    { label: 'Ledger', type: 'select', width: 'half' },
                    { label: 'Period', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'third' },
                    { label: 'Exchange Rate', type: 'number', width: 'third' },
                    { label: 'Status', type: 'select', width: 'third' }
                ]
            },
            {
                name: 'Transaction Lines',
                fields: [
                    { label: 'Journal Lines Table', type: 'table', width: 'full',
                      columns: ['Account', 'Debit', 'Credit', 'Department', 'Description'] }
                ]
            },
            {
                name: 'Transaction Summary',
                fields: [
                    { label: 'Total Debit', type: 'number', width: 'half', readonly: true },
                    { label: 'Total Credit', type: 'number', width: 'half', readonly: true },
                    { label: 'Difference', type: 'number', width: 'half', readonly: true },
                    { label: 'Description', type: 'textarea', width: 'full' }
                ]
            }
        ]
    },
    employee: {
        title: 'Employee Information',
        icon: '👔',
        sections: [
            {
                name: 'Personal Information',
                fields: [
                    { label: 'Employee Number', type: 'text', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'First Name', type: 'text', width: 'half' },
                    { label: 'Last Name', type: 'text', width: 'half' },
                    { label: 'Date of Birth', type: 'date', width: 'half' },
                    { label: 'Gender', type: 'select', width: 'half' },
                    { label: 'Email', type: 'email', width: 'half' },
                    { label: 'Phone', type: 'tel', width: 'half' }
                ]
            },
            {
                name: 'Job Information',
                fields: [
                    { label: 'Job Title', type: 'text', width: 'half' },
                    { label: 'Department', type: 'select', width: 'half' },
                    { label: 'Manager', type: 'select', width: 'half' },
                    { label: 'Location', type: 'select', width: 'half' },
                    { label: 'Hire Date', type: 'date', width: 'half' },
                    { label: 'Employment Type', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Compensation',
                fields: [
                    { label: 'Salary', type: 'number', width: 'half' },
                    { label: 'Pay Frequency', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'half' },
                    { label: 'Grade', type: 'select', width: 'half' }
                ]
            }
        ]
    },
    product: {
        title: 'Product Information',
        icon: '📦',
        sections: [
            {
                name: 'Product Details',
                fields: [
                    { label: 'Product Code', type: 'text', width: 'half' },
                    { label: 'Product Name', type: 'text', width: 'half' },
                    { label: 'Description', type: 'textarea', width: 'full' },
                    { label: 'Category', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'Unit of Measure', type: 'select', width: 'half' },
                    { label: 'Barcode', type: 'text', width: 'half' }
                ]
            },
            {
                name: 'Pricing & Inventory',
                fields: [
                    { label: 'List Price', type: 'number', width: 'third' },
                    { label: 'Cost Price', type: 'number', width: 'third' },
                    { label: 'Currency', type: 'select', width: 'third' },
                    { label: 'On Hand Quantity', type: 'number', width: 'half' },
                    { label: 'Reorder Level', type: 'number', width: 'half' }
                ]
            },
            {
                name: 'Additional Information',
                fields: [
                    { label: 'Weight', type: 'number', width: 'half' },
                    { label: 'Dimensions', type: 'text', width: 'half' },
                    { label: 'Manufacturer', type: 'text', width: 'half' },
                    { label: 'Supplier', type: 'select', width: 'half' }
                ]
            }
        ]
    },
    order: {
        title: 'Order Information',
        icon: '🛒',
        sections: [
            {
                name: 'Order Header',
                fields: [
                    { label: 'Order Number', type: 'text', width: 'half' },
                    { label: 'Order Date', type: 'date', width: 'half' },
                    { label: 'Customer', type: 'select', width: 'half' },
                    { label: 'Order Type', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'third' },
                    { label: 'Priority', type: 'select', width: 'third' },
                    { label: 'Currency', type: 'select', width: 'third' }
                ]
            },
            {
                name: 'Shipping Information',
                fields: [
                    { label: 'Ship-To Address', type: 'text', width: 'full' },
                    { label: 'City', type: 'text', width: 'third' },
                    { label: 'State', type: 'text', width: 'third' },
                    { label: 'Zip Code', type: 'text', width: 'third' },
                    { label: 'Requested Delivery Date', type: 'date', width: 'half' },
                    { label: 'Shipping Method', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Order Lines',
                fields: [
                    { label: 'Order Lines Table', type: 'table', width: 'full',
                      columns: ['Product', 'Quantity', 'Unit Price', 'Discount', 'Total'] }
                ]
            }
        ]
    },
    payment: {
        title: 'Payment Information',
        icon: '💰',
        sections: [
            {
                name: 'Payment Details',
                fields: [
                    { label: 'Payment Number', type: 'text', width: 'half' },
                    { label: 'Payment Date', type: 'date', width: 'half' },
                    { label: 'Payment Type', type: 'select', width: 'half' },
                    { label: 'Payment Method', type: 'select', width: 'half' },
                    { label: 'Supplier/Customer', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'Amount', type: 'number', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Bank Information',
                fields: [
                    { label: 'Bank Account', type: 'select', width: 'half' },
                    { label: 'Reference Number', type: 'text', width: 'half' },
                    { label: 'Check Number', type: 'text', width: 'half' },
                    { label: 'Exchange Rate', type: 'number', width: 'half' }
                ]
            },
            {
                name: 'Invoice Application',
                fields: [
                    { label: 'Invoice Application Table', type: 'table', width: 'full',
                      columns: ['Invoice Number', 'Invoice Date', 'Invoice Amount', 'Payment Amount', 'Balance'] }
                ]
            }
        ]
    },
    account: {
        title: 'Account Information',
        icon: '💼',
        sections: [
            {
                name: 'Account Details',
                fields: [
                    { label: 'Account Number', type: 'text', width: 'half' },
                    { label: 'Account Name', type: 'text', width: 'half' },
                    { label: 'Account Type', type: 'select', width: 'half' },
                    { label: 'Account Category', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Classification',
                fields: [
                    { label: 'Natural Account', type: 'select', width: 'half' },
                    { label: 'Cost Center', type: 'select', width: 'half' },
                    { label: 'Department', type: 'select', width: 'half' },
                    { label: 'Location', type: 'select', width: 'half' },
                    { label: 'Parent Account', type: 'select', width: 'full' }
                ]
            },
            {
                name: 'Balance Information',
                fields: [
                    { label: 'Opening Balance', type: 'number', width: 'half' },
                    { label: 'Current Balance', type: 'number', width: 'half', readonly: true },
                    { label: 'Budget Amount', type: 'number', width: 'half' },
                    { label: 'YTD Balance', type: 'number', width: 'half', readonly: true }
                ]
            }
        ]
    },
    report: {
        title: 'Report Configuration',
        icon: '📊',
        sections: [
            {
                name: 'Report Parameters',
                fields: [
                    { label: 'Report Name', type: 'text', width: 'full' },
                    { label: 'Report Type', type: 'select', width: 'half' },
                    { label: 'Output Format', type: 'select', width: 'half' },
                    { label: 'Date From', type: 'date', width: 'half' },
                    { label: 'Date To', type: 'date', width: 'half' }
                ]
            },
            {
                name: 'Filters',
                fields: [
                    { label: 'Entity', type: 'select', width: 'half' },
                    { label: 'Department', type: 'select', width: 'half' },
                    { label: 'Status', type: 'select', width: 'half' },
                    { label: 'Currency', type: 'select', width: 'half' }
                ]
            },
            {
                name: 'Display Options',
                fields: [
                    { label: 'Group By', type: 'select', width: 'half' },
                    { label: 'Sort By', type: 'select', width: 'half' },
                    { label: 'Include Charts', type: 'checkbox', width: 'half' },
                    { label: 'Include Totals', type: 'checkbox', width: 'half' }
                ]
            }
        ]
    }
};

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('page-creation-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            generatePageDesign();
        });
    }

    // Real-time preview on layout change
    const layoutSelect = document.getElementById('page-layout');
    if (layoutSelect) {
        layoutSelect.addEventListener('change', () => {
            if (layoutSelect.value) {
                generatePageDesign();
            }
        });
    }
});

function generatePageDesign() {
    const pageName = document.getElementById('page-name').value;
    const pageModule = document.getElementById('page-module').value;
    const pageType = document.getElementById('page-type').value;
    const pageLayout = document.getElementById('page-layout').value;

    if (!pageLayout) {
        alert('Please select a layout template');
        return;
    }

    const template = layoutTemplates[pageLayout];
    if (!template) {
        console.error('Template not found:', pageLayout);
        return;
    }

    // Update layout badge
    const badge = document.getElementById('layout-badge');
    badge.textContent = template.title;
    badge.style.display = 'inline-block';

    // Render the design
    renderDesign(template, pageName, pageModule);
}

function renderDesign(template, pageName, pageModule) {
    const canvas = document.getElementById('designer-canvas');

    const html = `
        <div class="page-preview">
            <div class="preview-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 32px;">${template.icon}</span>
                    <div>
                        <div class="preview-title">${pageName || template.title}</div>
                        <div class="preview-subtitle">${pageModule ? `${pageModule} Module` : 'ERP Application'} • ${template.title}</div>
                    </div>
                </div>
            </div>

            ${template.sections.map(section => `
                <div class="section-title">
                    ${section.name}
                </div>
                ${renderSectionFields(section.fields)}
                ${template.sections.indexOf(section) < template.sections.length - 1 ? '<hr class="section-divider">' : ''}
            `).join('')}

            <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end;">
                <button class="btn-create" style="width: auto; padding: 10px 24px; background: #e0e0e0; color: #333;">
                    Cancel
                </button>
                <button class="btn-create" style="width: auto; padding: 10px 24px;">
                    Save ${template.title}
                </button>
            </div>
        </div>
    `;

    canvas.innerHTML = html;
}

function renderSectionFields(fields) {
    let html = '';
    let currentRow = [];

    fields.forEach((field, index) => {
        if (field.type === 'table') {
            // Close any open row
            if (currentRow.length > 0) {
                html += renderRow(currentRow);
                currentRow = [];
            }

            // Render table
            html += `
                <div class="field-group">
                    <div class="field-label">${field.label}</div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <thead>
                                <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                                    ${field.columns.map(col => `<th style="padding: 10px; text-align: left; font-weight: 600;">${col}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid #eee;">
                                    ${field.columns.map(() => `<td style="padding: 10px; color: #999;">—</td>`).join('')}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (field.type === 'textarea') {
            // Close any open row
            if (currentRow.length > 0) {
                html += renderRow(currentRow);
                currentRow = [];
            }

            html += `
                <div class="field-group">
                    <label class="field-label">${field.label}</label>
                    <textarea class="field-input" rows="3" ${field.readonly ? 'readonly' : ''}></textarea>
                </div>
            `;
        } else {
            // Regular fields - group by width
            currentRow.push(field);

            // Check if we should close this row
            const shouldCloseRow =
                field.width === 'full' ||
                (index === fields.length - 1) ||
                (currentRow.length === 2 && field.width === 'half') ||
                (currentRow.length === 3 && field.width === 'third');

            if (shouldCloseRow) {
                html += renderRow(currentRow);
                currentRow = [];
            }
        }
    });

    return html;
}

function renderRow(fields) {
    if (fields.length === 0) return '';

    const width = fields[0].width;
    const rowClass = width === 'third' ? 'field-row-3' : 'field-row';
    const containerClass = width === 'full' ? 'field-group' : rowClass;

    if (width === 'full') {
        const field = fields[0];
        return `
            <div class="${containerClass}">
                <label class="field-label">${field.label}</label>
                <input type="${field.type}" class="field-input" ${field.readonly ? 'readonly' : ''}>
            </div>
        `;
    }

    return `
        <div class="${containerClass}">
            ${fields.map(field => `
                <div class="field-group" style="margin-bottom: 0;">
                    <label class="field-label">${field.label}</label>
                    ${field.type === 'checkbox' ?
                        `<input type="checkbox" style="width: auto; margin-top: 8px;">` :
                        `<input type="${field.type}" class="field-input" ${field.readonly ? 'readonly' : ''}>`
                    }
                </div>
            `).join('')}
        </div>
    `;
}

console.log('Page Composer initialized successfully!');
