#!/bin/bash

# Script to generate ERP module dashboards with actual pages from CSV

CSV_FILE="docs/requirements/Application_Pages_Inventory.csv"
OUTPUT_DIR="erp-app/modules"

# Module definitions: code|name|icon|description
declare -a MODULES=(
    "GL|General Ledger|💰|Manage chart of accounts, journal entries, and financial reporting"
    "AP|Accounts Payable|💸|Track and manage vendor invoices and payments"
    "AR|Accounts Receivable|💵|Manage customer invoices, receipts, and collections"
    "PO|Purchase Orders|📦|Create and track purchase orders and requisitions"
    "INV|Inventory|📊|Manage inventory items, stock levels, and movements"
    "HCM|Human Capital Management|👥|Manage employees, positions, and organizational structure"
    "PAY|Payroll|💰|Process payroll, calculate taxes, and generate payslips"
    "CSH|Cash Management|💵|Monitor cash positions, bank accounts, and forecasting"
    "FA|Fixed Assets|🏢|Track and depreciate fixed assets and capital expenditures"
    "OM|Order Management|📱|Process sales orders, shipping, and fulfillment"
    "ABS|Absence Management|📊|Track employee absences, leave balances, and requests"
    "REC|Recruitment|🎯|Manage job requisitions, candidates, and hiring process"
    "CM|Contract Management|🤝|Create and manage contracts, terms, and obligations"
    "PDM|Product Data Management|🛠️|Maintain product definitions, BOMs, and specifications"
    "LCM|Lifecycle Management|📋|Manage product lifecycle stages and workflows"
    "UR|User Roles|👤|Define user roles, permissions, and access controls"
)

# Function to generate dashboard HTML for a module
generate_dashboard() {
    local MODULE_CODE=$1
    local MODULE_NAME=$2
    local MODULE_ICON=$3
    local MODULE_DESC=$4
    local OUTPUT_FILE="$OUTPUT_DIR/${MODULE_CODE,,}-dashboard.html"

    echo "Generating dashboard for $MODULE_CODE..."

    # Extract pages for this module from CSV, group by category
    declare -A categories
    declare -A page_data

    # Read CSV and parse pages for this module
    while IFS=',' read -r page_id module_id module_name page_name page_type page_category feature_ids description user_roles menu_path complexity; do
        if [[ "$module_id" == "$MODULE_CODE" ]]; then
            # Clean up fields (remove quotes and trim)
            page_category=$(echo "$page_category" | tr -d '"' | xargs)
            page_name=$(echo "$page_name" | tr -d '"' | xargs)
            page_type=$(echo "$page_type" | tr -d '"' | xargs)
            page_id=$(echo "$page_id" | tr -d '"' | xargs)
            description=$(echo "$description" | tr -d '"' | xargs)

            # Store page info
            if [[ -n "$page_category" && -n "$page_name" ]]; then
                page_key="${page_category}|${page_name}|${page_type}|${page_id}|${description}"
                page_data["$page_key"]=1
                categories["$page_category"]=1
            fi
        fi
    done < <(tail -n +2 "$CSV_FILE")

    # Count pages
    local page_count=${#page_data[@]}

    # Start HTML generation
    cat > "$OUTPUT_FILE" << 'HTMLSTART'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
HTMLSTART

    echo "    <title>$MODULE_ICON $MODULE_NAME - ERP System</title>" >> "$OUTPUT_FILE"

    cat >> "$OUTPUT_FILE" << 'HTMLCSS'
    <link rel="stylesheet" href="../css/erp-main.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        .pages-section {
            margin-top: 30px;
        }

        .category-block {
            background: white;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .category-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #6366f1;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .category-icon {
            font-size: 20px;
        }

        .pages-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 12px;
            margin-top: 15px;
        }

        .page-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .page-card:hover {
            background: #fff;
            border-color: #6366f1;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .page-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
        }

        .page-name {
            font-weight: 500;
            color: #1e293b;
            font-size: 14px;
            flex: 1;
        }

        .page-type-badge {
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 12px;
            background: #e0e7ff;
            color: #4f46e5;
            font-weight: 500;
            white-space: nowrap;
        }

        .page-description {
            font-size: 12px;
            color: #64748b;
            line-height: 1.4;
        }

        .page-id {
            font-size: 11px;
            color: #94a3b8;
            font-family: 'Courier New', monospace;
        }

        .no-pages-message {
            text-align: center;
            padding: 40px;
            color: #64748b;
            font-size: 14px;
        }

        .stats-bar {
            display: flex;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stat-value {
            font-size: 24px;
            font-weight: 700;
        }

        .stat-label {
            font-size: 13px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <!-- Sidebar -->
    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
HTMLCSS

    echo "            <h2>$MODULE_ICON $MODULE_NAME</h2>" >> "$OUTPUT_FILE"

    cat >> "$OUTPUT_FILE" << 'HTMLBODY'
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
HTMLBODY

    echo "            <h1 class=\"top-bar-title\">$MODULE_ICON $MODULE_NAME</h1>" >> "$OUTPUT_FILE"

    cat >> "$OUTPUT_FILE" << 'HTMLTOPBAR'
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
HTMLTOPBAR

    echo "            <div class=\"welcome-section\">" >> "$OUTPUT_FILE"
    echo "                <h2>$MODULE_NAME Dashboard</h2>" >> "$OUTPUT_FILE"
    echo "                <p>$MODULE_DESC</p>" >> "$OUTPUT_FILE"
    echo "            </div>" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "            <div class=\"stats-bar\">" >> "$OUTPUT_FILE"
    echo "                <div class=\"stat-item\">" >> "$OUTPUT_FILE"
    echo "                    <div>" >> "$OUTPUT_FILE"
    echo "                        <div class=\"stat-value\">$page_count</div>" >> "$OUTPUT_FILE"
    echo "                        <div class=\"stat-label\">Total Pages</div>" >> "$OUTPUT_FILE"
    echo "                    </div>" >> "$OUTPUT_FILE"
    echo "                </div>" >> "$OUTPUT_FILE"
    echo "                <div class=\"stat-item\">" >> "$OUTPUT_FILE"
    echo "                    <div>" >> "$OUTPUT_FILE"
    echo "                        <div class=\"stat-value\">${#categories[@]}</div>" >> "$OUTPUT_FILE"
    echo "                        <div class=\"stat-label\">Categories</div>" >> "$OUTPUT_FILE"
    echo "                    </div>" >> "$OUTPUT_FILE"
    echo "                </div>" >> "$OUTPUT_FILE"
    echo "            </div>" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    echo "            <div class=\"pages-section\">" >> "$OUTPUT_FILE"

    if [ $page_count -eq 0 ]; then
        echo "                <div class=\"no-pages-message\">No pages defined for this module yet.</div>" >> "$OUTPUT_FILE"
    else
        # Generate category sections
        # Define category order and icons
        declare -A cat_icons=(
            ["Setup"]="⚙️"
            ["Transactions"]="📝"
            ["Operations"]="⚡"
            ["Reports"]="📊"
            ["Inquiry"]="🔍"
            ["Analytics"]="📈"
            ["Budgets"]="💼"
            ["Dashboard"]="📊"
            ["Workflow"]="🔄"
            ["Process"]="⚙️"
            ["Upload"]="📤"
            ["Form"]="📋"
            ["List"]="📃"
            ["Checklist"]="✅"
        )

        # Sort categories
        sorted_cats=($(for cat in "${!categories[@]}"; do echo "$cat"; done | sort))

        for category in "${sorted_cats[@]}"; do
            # Get icon for category
            cat_icon="${cat_icons[$category]:-📄}"

            echo "                <div class=\"category-block\">" >> "$OUTPUT_FILE"
            echo "                    <div class=\"category-title\">" >> "$OUTPUT_FILE"
            echo "                        <span class=\"category-icon\">$cat_icon</span>" >> "$OUTPUT_FILE"
            echo "                        <span>$category</span>" >> "$OUTPUT_FILE"
            echo "                    </div>" >> "$OUTPUT_FILE"
            echo "                    <div class=\"pages-grid\">" >> "$OUTPUT_FILE"

            # Output pages in this category
            for page_key in "${!page_data[@]}"; do
                IFS='|' read -r pg_cat pg_name pg_type pg_id pg_desc <<< "$page_key"
                if [[ "$pg_cat" == "$category" ]]; then
                    # Sanitize for HTML
                    pg_name_html=$(echo "$pg_name" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
                    pg_desc_html=$(echo "$pg_desc" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
                    pg_id_html=$(echo "$pg_id" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')
                    pg_type_html=$(echo "$pg_type" | sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g; s/"/\&quot;/g')

                    # Create sanitized ID for page navigation
                    page_file_id=$(echo "$pg_id_html" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

                    echo "                        <div class=\"page-card\" onclick=\"openPage('$page_file_id')\">" >> "$OUTPUT_FILE"
                    echo "                            <div class=\"page-card-header\">" >> "$OUTPUT_FILE"
                    echo "                                <div class=\"page-name\">$pg_name_html</div>" >> "$OUTPUT_FILE"
                    echo "                                <div class=\"page-type-badge\">$pg_type_html</div>" >> "$OUTPUT_FILE"
                    echo "                            </div>" >> "$OUTPUT_FILE"
                    if [[ -n "$pg_desc_html" ]]; then
                        echo "                            <div class=\"page-description\">$pg_desc_html</div>" >> "$OUTPUT_FILE"
                    fi
                    echo "                            <div class=\"page-id\">$pg_id_html</div>" >> "$OUTPUT_FILE"
                    echo "                        </div>" >> "$OUTPUT_FILE"
                fi
            done

            echo "                    </div>" >> "$OUTPUT_FILE"
            echo "                </div>" >> "$OUTPUT_FILE"
            echo "" >> "$OUTPUT_FILE"
        done
    fi

    cat >> "$OUTPUT_FILE" << 'HTMLEND'
            </div>
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
            alert('Page ' + pageId + ' will be implemented in the next phase.\n\nThis is a placeholder for the actual page navigation.');
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
HTMLEND

    echo "✓ Generated $OUTPUT_FILE ($page_count pages)"
}

# Main execution
echo "=== ERP Module Dashboard Generator with Pages ==="
echo ""

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Generate dashboard for each module
for module_def in "${MODULES[@]}"; do
    IFS='|' read -r code name icon desc <<< "$module_def"
    generate_dashboard "$code" "$name" "$icon" "$desc"
done

echo ""
echo "=== Dashboard generation complete! ==="
echo "Generated $(echo ${#MODULES[@]}) module dashboards in $OUTPUT_DIR/"
