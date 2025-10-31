#!/usr/bin/env python3
"""Generate ERP module dashboards with original style and all pages from CSV"""

import csv
import os
from collections import defaultdict

# Module definitions
MODULES = [
    ("GL", "General Ledger", "💰", "Manage your financial accounting and reporting"),
    ("AP", "Accounts Payable", "💸", "Track and manage vendor invoices and payments"),
    ("AR", "Accounts Receivable", "💵", "Manage customer invoices, receipts, and collections"),
    ("PO", "Purchase Orders", "📦", "Create and track purchase orders and requisitions"),
    ("INV", "Inventory", "📊", "Manage inventory items, stock levels, and movements"),
    ("HCM", "Human Capital Management", "👥", "Manage employees, positions, and organizational structure"),
    ("PAY", "Payroll", "💰", "Process payroll, calculate taxes, and generate payslips"),
    ("CSH", "Cash Management", "💵", "Monitor cash positions, bank accounts, and forecasting"),
    ("FA", "Fixed Assets", "🏢", "Track and depreciate fixed assets and capital expenditures"),
    ("OM", "Order Management", "📱", "Process sales orders, shipping, and fulfillment"),
    ("ABS", "Absence Management", "📊", "Track employee absences, leave balances, and requests"),
    ("REC", "Recruitment", "🎯", "Manage job requisitions, candidates, and hiring process"),
    ("CM", "Contract Management", "🤝", "Create and manage contracts, terms, and obligations"),
    ("PDM", "Product Data Management", "🛠️", "Maintain product definitions, BOMs, and specifications"),
    ("LCM", "Lifecycle Management", "📋", "Manage product lifecycle stages and workflows"),
    ("UR", "User Roles", "👤", "Define user roles, permissions, and access controls"),
]

CATEGORY_ICONS = {
    "Setup": "⚙️",
    "Transactions": "📝",
    "Operations": "⚡",
    "Reports": "📊",
    "Inquiry": "🔍",
    "Analytics": "📈",
    "Budgets": "💼",
    "Dashboard": "📊",
    "Workflow": "🔄",
    "Process": "⚙️",
    "Upload": "📤",
    "Form": "📋",
    "List": "📃",
    "Checklist": "✅",
}

CSV_FILE = "docs/requirements/Application_Pages_Inventory.csv"
OUTPUT_DIR = "erp-app/modules"

def html_escape(text):
    """Escape HTML special characters"""
    if not text:
        return ""
    return (text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace('"', "&quot;")
                .replace("'", "&#39;"))

def load_pages_from_csv():
    """Load all pages from CSV, organized by module"""
    module_pages = defaultdict(lambda: defaultdict(list))

    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            module_id = row['Module_ID'].strip()
            if not module_id:
                continue

            page_category = row['Page_Category'].strip()
            page_data = {
                'id': row['Page_ID'].strip(),
                'name': row['Page_Name'].strip(),
                'type': row['Page_Type'].strip(),
                'description': row['Description'].strip(),
            }

            module_pages[module_id][page_category].append(page_data)

    return module_pages

def generate_sidebar_html(module_code, pages_by_category):
    """Generate sidebar HTML with menu items"""
    sidebar_html = '''        <!-- Sidebar Menu -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-content">
                <div class="sidebar-section">
                    <div class="sidebar-section-title">Navigation</div>
                    <ul class="sidebar-menu">
                        <li class="sidebar-menu-item" onclick="goBack()">
                            <span class="sidebar-menu-icon">←</span>
                            <span class="sidebar-menu-text">Main Dashboard</span>
                        </li>
                        <li class="sidebar-menu-item active">
                            <span class="sidebar-menu-icon">📊</span>
                            <span class="sidebar-menu-text">Dashboard</span>
                        </li>
                    </ul>
                </div>
'''

    # Add sidebar sections for key categories
    key_categories = ["Setup", "Transactions", "Operations", "Reports"]

    for category in key_categories:
        if category in pages_by_category:
            pages = pages_by_category[category][:5]  # Top 5 pages per category in sidebar
            cat_icon = CATEGORY_ICONS.get(category, "📄")

            sidebar_html += f'''
                <div class="sidebar-section">
                    <div class="sidebar-section-title">{category}</div>
                    <ul class="sidebar-menu">
'''

            for page in pages:
                page_icon = "📄"
                if "List" in page['name']:
                    page_icon = "📋"
                elif "Form" in page['name'] or "Entry" in page['name']:
                    page_icon = "✏️"
                elif "Report" in page['name']:
                    page_icon = "📊"
                elif page['type'] == "Form":
                    page_icon = "📝"
                elif page['type'] == "List":
                    page_icon = "📃"

                sidebar_html += f'''                        <li class="sidebar-menu-item" onclick="openPage('{page['id']}')">
                            <span class="sidebar-menu-icon">{page_icon}</span>
                            <span class="sidebar-menu-text">{html_escape(page['name'])}</span>
                        </li>
'''

            sidebar_html += '''                    </ul>
                </div>
'''

    sidebar_html += '''            </div>
        </div>
'''

    return sidebar_html

def generate_dashboard(module_code, module_name, module_icon, module_desc, pages_by_category):
    """Generate HTML dashboard for a module"""
    output_file = os.path.join(OUTPUT_DIR, f"{module_code.lower()}-dashboard.html")

    # Count total pages
    total_pages = sum(len(pages) for pages in pages_by_category.values())
    total_categories = len(pages_by_category)

    # Sort categories
    sorted_categories = sorted(pages_by_category.keys())

    # Generate sidebar
    sidebar_html = generate_sidebar_html(module_code, pages_by_category)

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{module_code} Module - {module_name}</title>
    <link rel="stylesheet" href="../css/erp-main.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }}
        .kpi-card {{
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }}
        .kpi-value {{
            font-size: 32px;
            font-weight: 700;
            color: #2563eb;
            margin-bottom: 8px;
        }}
        .kpi-label {{
            font-size: 14px;
            color: #6b7280;
        }}
        .feature-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 32px;
        }}
        .feature-card {{
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s;
            border-left: 4px solid #2563eb;
        }}
        .feature-card:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }}
        .feature-icon {{
            font-size: 32px;
            margin-bottom: 12px;
        }}
        .feature-name {{
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1f2937;
        }}
        .feature-category {{
            display: inline-block;
            font-size: 12px;
            padding: 4px 12px;
            background: #e0e7ff;
            color: #3730a3;
            border-radius: 12px;
            margin-bottom: 12px;
        }}
        .section-title {{
            font-size: 20px;
            font-weight: 700;
            margin: 32px 0 16px 0;
            color: #1f2937;
        }}
        .page-type-badge {{
            display: inline-block;
            font-size: 11px;
            padding: 2px 8px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 10px;
            margin-left: 8px;
        }}
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="top-bar-left">
                <button class="hamburger-btn" id="hamburger-btn">☰</button>
                <h1 class="top-bar-title">{module_icon} {module_name}</h1>
            </div>
            <div class="top-bar-right">
                <button class="btn" id="autopilot-btn" style="background: #8b5cf6; color: white;">
                    🤖 Autopilot
                </button>
                <button class="btn" onclick="goBack()" style="background: #6b7280; color: white;">
                    ← Back to Main
                </button>
                <div class="user-info">
                    <div class="user-avatar" id="user-avatar">U</div>
                    <div class="user-details">
                        <div class="user-name" id="user-name">User</div>
                        <div class="user-role" id="user-role">Role</div>
                    </div>
                </div>
                <button class="btn btn-logout" id="logout-btn">Logout</button>
            </div>
        </div>

{sidebar_html}

        <!-- Main Content -->
        <div class="main-content" id="main-content">
            <h2 style="font-size: 28px; font-weight: 700; margin-bottom: 8px;">{module_name} Dashboard</h2>
            <p style="color: #6b7280; margin-bottom: 32px;">{module_desc}</p>

            <!-- KPI Cards -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <div class="kpi-value">{total_pages}</div>
                    <div class="kpi-label">Total Pages</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{total_categories}</div>
                    <div class="kpi-label">Categories</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">0</div>
                    <div class="kpi-label">Implemented</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">Phase 2</div>
                    <div class="kpi-label">Status</div>
                </div>
            </div>
'''

    if total_pages == 0:
        html += '            <p style="text-align: center; color: #6b7280; padding: 40px;">No pages defined for this module yet.</p>\n'
    else:
        # Generate feature cards by category
        for category in sorted_categories:
            cat_icon = CATEGORY_ICONS.get(category, "📄")
            pages = pages_by_category[category]

            html += f'''
            <!-- {category} Features -->
            <h3 class="section-title">{cat_icon} {category}</h3>
            <div class="feature-grid">
'''

            for page in pages:
                # Pick icon based on page type or name
                page_icon = "📄"
                if page['type'] == "Form":
                    page_icon = "📝"
                elif page['type'] == "List":
                    page_icon = "📃"
                elif page['type'] == "Report":
                    page_icon = "📊"
                elif page['type'] == "Dashboard":
                    page_icon = "📈"
                elif page['type'] == "Grid":
                    page_icon = "⚡"
                elif page['type'] == "Designer":
                    page_icon = "🎨"
                elif page['type'] == "Tree View":
                    page_icon = "🌳"
                elif page['type'] == "Upload":
                    page_icon = "📤"
                elif page['type'] == "Process":
                    page_icon = "⚙️"
                elif page['type'] == "Workflow":
                    page_icon = "🔄"
                elif page['type'] == "Checklist":
                    page_icon = "✅"

                html += f'''                <div class="feature-card" onclick="openPage('{page['id']}')">
                    <div class="feature-category">{html_escape(category)}</div>
                    <div class="feature-icon">{page_icon}</div>
                    <div class="feature-name">
                        {html_escape(page['name'])}
                        <span class="page-type-badge">{html_escape(page['type'])}</span>
                    </div>
                    <p style="font-size: 14px; color: #6b7280;">{html_escape(page['description'])}</p>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 8px; font-family: monospace;">{html_escape(page['id'])}</p>
                </div>

'''

            html += '''            </div>
'''

    html += '''        </div>
    </div>

    <!-- Autopilot Panel -->
    <div class="autopilot-panel" id="autopilot-panel">
        <div class="autopilot-header">
            <h3>🤖 Autopilot Assistant</h3>
            <button class="close-btn" onclick="toggleAutopilot()">&times;</button>
        </div>
        <div class="autopilot-content">
            <div class="chat-messages" id="chat-messages">
                <div class="bot-message">
                    <div class="message-content">
                        <p>Hello! I'm your ERP Autopilot assistant. How can I help you today?</p>
                    </div>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" class="chat-input" placeholder="Ask me anything...">
                <button class="send-btn" onclick="sendMessage()">Send</button>
            </div>
        </div>
    </div>

    <script src="../js/main-dashboard.js"></script>
    <script src="../js/autopilot.js"></script>
    <script>
        function openPage(pageId) {
            console.log('Opening page:', pageId);

            // Check if specific page exists
            if (pageId === 'GL-P018') {
                window.location.href = 'gl-currencies.html';
                return;
            }

            alert('Page ' + pageId + ' will be implemented in the next phase.\\n\\nThis is a placeholder for the actual page navigation.');
        }

        function goBack() {
            if (window.chrome && window.chrome.webview) {
                window.chrome.webview.postMessage({
                    action: 'goBack'
                });
            } else {
                window.history.back();
            }
        }

        // Make sure autopilot button works
        document.addEventListener('DOMContentLoaded', function() {
            const autopilotBtn = document.getElementById('autopilot-btn');
            if (autopilotBtn) {
                autopilotBtn.onclick = toggleAutopilot;
            }
        });
    </script>
</body>
</html>
'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✓ Generated {output_file} ({total_pages} pages in {total_categories} categories)")

def main():
    print("=== ERP Module Dashboard Generator (Original Style) ===\n")

    # Load pages from CSV
    module_pages = load_pages_from_csv()

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Generate dashboard for each module
    for module_code, module_name, module_icon, module_desc in MODULES:
        pages_by_category = module_pages.get(module_code, {})
        generate_dashboard(module_code, module_name, module_icon, module_desc, pages_by_category)

    print(f"\n=== Dashboard generation complete! ===")
    print(f"Generated {len(MODULES)} module dashboards in {OUTPUT_DIR}/")

if __name__ == "__main__":
    main()
