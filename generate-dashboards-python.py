#!/usr/bin/env python3
"""Generate ERP module dashboards with pages from CSV data"""

import csv
import os
from collections import defaultdict

# Module definitions
MODULES = [
    ("GL", "General Ledger", "💰", "Manage chart of accounts, journal entries, and financial reporting"),
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

def generate_dashboard(module_code, module_name, module_icon, module_desc, pages_by_category):
    """Generate HTML dashboard for a module"""
    output_file = os.path.join(OUTPUT_DIR, f"{module_code.lower()}-dashboard.html")

    # Count total pages
    total_pages = sum(len(pages) for pages in pages_by_category.values())
    total_categories = len(pages_by_category)

    # Sort categories
    sorted_categories = sorted(pages_by_category.keys())

    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{module_icon} {module_name} - ERP System</title>
    <link rel="stylesheet" href="../css/erp-main.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .pages-section {{
            margin-top: 30px;
        }}

        .category-block {{
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }}

        .category-title {{
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #6366f1;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .category-icon {{
            font-size: 20px;
        }}

        .pages-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
            margin-top: 15px;
        }}

        .page-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }}

        .page-card:hover {{
            background: #fff;
            border-color: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }}

        .page-card-header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
        }}

        .page-name {{
            font-weight: 500;
            color: #1e293b;
            font-size: 14px;
            flex: 1;
        }}

        .page-type-badge {{
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 12px;
            background: #e0e7ff;
            color: #4f46e5;
            font-weight: 500;
            white-space: nowrap;
        }}

        .page-description {{
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }}

        .page-id {{
            font-size: 11px;
            color: #94a3b8;
            font-family: 'Courier New', monospace;
        }}

        .no-pages-message {{
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 14px;
        }}

        .stats-bar {{
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
        }}

        .stat-item {{
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .stat-value {{
            font-size: 24px;
            font-weight: 700;
        }}

        .stat-label {{
            font-size: 13px;
            opacity: 0.9;
        }}
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h2>{module_icon} {module_name}</h2>
        </div>
        <nav class="sidebar-nav">
            <a href="#" class="nav-item active">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Dashboard</span>
            </a>
            <a href="#" onclick="goBack(); return false;" class="nav-item">
                <span class="nav-icon">🏢</span>
                <span class="nav-label">Main Dashboard</span>
            </a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="main-content" id="main-content">
        <!-- Top Bar -->
        <div class="top-bar">
            <button class="hamburger-btn" id="hamburger-btn">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <h1 class="top-bar-title">{module_icon} {module_name}</h1>
            <div class="top-bar-right">
                <button class="icon-btn" id="autopilot-btn" title="Autopilot Assistant">
                    <span class="icon">🤖</span>
                </button>
                <div class="user-menu">
                    <div class="user-avatar" id="user-avatar">A</div>
                    <div class="user-info">
                        <div class="user-name" id="user-name">Admin User</div>
                        <div class="user-role" id="user-role">Administrator</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Dashboard Content -->
        <div class="dashboard-content">
            <div class="welcome-section">
                <h2>{module_name} Dashboard</h2>
                <p>{module_desc}</p>
            </div>

            <div class="stats-bar">
                <div class="stat-item">
                    <div>
                        <div class="stat-value">{total_pages}</div>
                        <div class="stat-label">Total Pages</div>
                    </div>
                </div>
                <div class="stat-item">
                    <div>
                        <div class="stat-value">{total_categories}</div>
                        <div class="stat-label">Categories</div>
                    </div>
                </div>
            </div>

            <div class="pages-section">
'''

    if total_pages == 0:
        html += '                <div class="no-pages-message">No pages defined for this module yet.</div>\n'
    else:
        for category in sorted_categories:
            cat_icon = CATEGORY_ICONS.get(category, "📄")
            pages = pages_by_category[category]

            html += f'''                <div class="category-block">
                    <div class="category-title">
                        <span class="category-icon">{cat_icon}</span>
                        <span>{html_escape(category)}</span>
                    </div>
                    <div class="pages-grid">
'''

            for page in pages:
                page_id_lower = page['id'].lower().replace('-', '')
                html += f'''                        <div class="page-card" onclick="openPage('{page_id_lower}')">
                            <div class="page-card-header">
                                <div class="page-name">{html_escape(page['name'])}</div>
                                <div class="page-type-badge">{html_escape(page['type'])}</div>
                            </div>
                            <div class="page-description">{html_escape(page['description'])}</div>
                            <div class="page-id">{html_escape(page['id'])}</div>
                        </div>
'''

            html += '''                    </div>
                </div>

'''

    html += '''            </div>
        </div>
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
            alert('Page ' + pageId + ' will be implemented in the next phase.\\n\\nThis is a placeholder for the actual page navigation.');
            // Future: Navigate to actual page
            // window.location.href = pageId + '.html';
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
    </script>
</body>
</html>
'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"✓ Generated {output_file} ({total_pages} pages in {total_categories} categories)")

def main():
    print("=== ERP Module Dashboard Generator with Pages (Python) ===\n")

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
