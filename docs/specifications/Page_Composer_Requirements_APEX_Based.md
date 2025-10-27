# Page Composer - Requirements Document (APEX-Based)

## Document Purpose
This document defines the functional and technical requirements for building an APEX-like visual page designer for our ERP system. Based on comprehensive analysis of Oracle APEX 24.2 features.

**Version**: 1.0
**Date**: 2025-10-27
**Referenced Documents**:
- Oracle_APEX_Features_Complete_Reference.md
- Page_Composer_Specification.md

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Core Objectives](#core-objectives)
3. [Feature Requirements](#feature-requirements)
4. [User Interface Requirements](#user-interface-requirements)
5. [Technical Architecture](#technical-architecture)
6. [Data Model](#data-model)
7. [Implementation Phases](#implementation-phases)
8. [Success Criteria](#success-criteria)

---

## 1. Executive Summary

### Vision
Build a visual, low-code page designer that empowers users to create ERP pages through an intuitive drag-and-drop interface, generating standardized JSON metadata that AI can convert into production-ready code.

### Inspiration
Oracle APEX has proven that declarative, SQL-centric, component-based development can dramatically accelerate application delivery (10x-100x faster than traditional coding). We will adopt APEX's proven principles while tailoring to our ERP needs.

### Key Differentiator
Unlike APEX (which generates runtime pages), our Page Composer generates **AI-parseable JSON metadata** that is then converted to **static HTML/JS/CSS pages** via AI code generation. This provides:
- ✅ Better version control (source code, not metadata DB)
- ✅ Easier customization (edit generated code directly)
- ✅ No runtime dependency
- ✅ AI-powered code generation with best practices

---

## 2. Core Objectives

### Primary Goals
1. **Reduce development time from hours to minutes** for standard ERP pages
2. **Eliminate repetitive coding** for common page patterns
3. **Ensure consistency** across all generated pages
4. **Enable non-developers** to design pages
5. **Generate high-quality, maintainable code** via AI

### Non-Goals (Out of Scope)
- ❌ Runtime page rendering (like APEX) - we generate static code
- ❌ Workflow engine (separate feature)
- ❌ Report builder (may add later)
- ❌ Mobile app builder
- ❌ User authentication (handled by ERP framework)

---

## 3. Feature Requirements

### 3.1 Page Designer Interface

#### REQ-001: Three-Pane Layout (MANDATORY)
**Description**: APEX-style interface with rendering tree, canvas, and property editor

**Requirements**:
```
┌──────────────┬──────────────────────┬──────────────┐
│              │                      │              │
│  Component   │      Canvas          │  Property    │
│  Tree        │      (Layout)        │  Editor      │
│  (Left)      │      (Center)        │  (Right)     │
│  250px       │      (Fluid)         │  350px       │
│              │                      │              │
└──────────────┴──────────────────────┴──────────────┘
```

**Component Tree (Left Pane)**:
- ✅ Hierarchical tree view
- ✅ Drag-and-drop to reorder
- ✅ Right-click context menu
- ✅ Search/filter components
- ✅ Icons for component types
- ✅ Expand/collapse sections
- ✅ Copy/paste components
- ✅ Delete confirmation

**Structure**:
```
📄 Page
  📋 Page Rendering
    📦 Header Region
      📝 Field: Customer Name
      📝 Field: Customer Code
      🔘 Button: Save
    📦 Details Region (Grid)
      📊 Column: Line #
      📊 Column: Product
      📊 Column: Quantity
  ⚙️ Page Processing
    ✅ Validation: Customer Code unique
    ⚡ Process: Save Customer
    🔀 Branch: Redirect to list
```

**Canvas (Center Pane)**:
- ✅ Visual page layout
- ✅ Drag-and-drop from palette
- ✅ Drag-and-drop to reorder
- ✅ Grid-based positioning
- ✅ Visual feedback on hover (highlight drop zones)
- ✅ Region resize handles
- ✅ Responsive breakpoint preview
- ✅ Zoom in/out (50%, 75%, 100%, 125%, 150%)

**Property Editor (Right Pane)**:
- ✅ Context-sensitive (updates on selection)
- ✅ Grouped properties (expandable sections)
- ✅ Required fields marked (red asterisk)
- ✅ LOV pickers for dropdowns
- ✅ Code editor for SQL/JavaScript
- ✅ Help text (tooltip)
- ✅ Validation feedback (inline errors)
- ✅ Search properties

**Property Groups**:
```
📋 Identification
  - Name
  - Type
  - Title
  - Sequence

📐 Layout
  - Parent Region
  - Position
  - Column Span
  - Alignment

🗄️ Source
  - Source Type (Table, SQL, Static)
  - Table Name
  - SQL Query
  - REST Endpoint

⚙️ Settings
  - Display Type
  - Required
  - Default Value
  - Read Only

✅ Validation
  - Required
  - Data Type
  - Pattern
  - Custom Validation

🔒 Security
  - Authorization Scheme
  - Condition Type
  - Condition Expression

❓ Help
  - Help Text
  - Tooltip
```

---

### 3.2 Page Types

#### REQ-002: Support Core Page Templates (MANDATORY)

##### 1. Free-form Page
**Description**: Single-record form

**Use Cases**:
- Customer Entry
- Employee Details
- Account Setup

**Components**:
- Form Region
- Fields (text, LOV, date, number, etc.)
- Buttons (Save, Cancel, Delete)

**Auto-Generated**:
- ✅ Form HTML
- ✅ Field validations (client + server)
- ✅ Save process (INSERT/UPDATE based on PK)
- ✅ Delete process
- ✅ Cancel action
- ✅ Success/error messages

##### 2. Master-Detail Page
**Description**: Header form + detail grid

**Use Cases**:
- Purchase Order (Header + Lines)
- Invoice (Header + Line Items)
- Employee (Header + Assignments)

**Components**:
- Master Form Region
- Detail Grid Region (tab)
- Relationship Configuration

**Auto-Generated**:
- ✅ Master form HTML
- ✅ Detail grid HTML
- ✅ Foreign key handling
- ✅ Synchronized save (master then details)
- ✅ Add/delete detail rows
- ✅ Tab navigation

##### 3. Report Page (List)
**Description**: Multi-row data display

**Use Cases**:
- Customer List
- Invoice List
- Product Catalog

**Components**:
- Table/Grid Region
- Search bar
- Filters
- Pagination
- Action buttons (Edit, Delete)

**Auto-Generated**:
- ✅ Data table HTML
- ✅ Column sorting
- ✅ Search functionality
- ✅ Filters (per column)
- ✅ Pagination controls
- ✅ Export (CSV, Excel)

##### 4. Report + Form (List + Edit)
**Description**: Two-page app - list and detail

**Pages Created**:
1. List page (report)
2. Detail page (form)

**Navigation**: Automatic links

**Use Cases**: Standard CRUD operations

##### 5. Dashboard Page
**Description**: KPI cards + charts + summary

**Components**:
- KPI Cards Region
- Chart Regions
- Summary Regions

**Use Cases**: Module dashboards

##### 6. Wizard Page (Multi-Step)
**Description**: Multi-page process with progress

**Components**:
- Progress Stepper
- Step regions
- Navigation buttons

**Use Cases**:
- Setup wizards
- Multi-step submissions

---

### 3.3 Component Palette

#### REQ-003: Draggable Component Library (MANDATORY)

**Organization**:
```
📦 REGIONS
  📋 Form
  📊 Interactive Grid
  📃 Classic Report
  🃏 Cards
  📈 Chart
  🌳 Tree
  📅 Calendar
  📝 Static Content

📝 ITEMS (Form Fields)
  ⌨️ Text Field
  📝 Textarea
  🔢 Number
  📅 Date Picker
  ⏰ DateTime Picker
  🎨 Color Picker
  ☑️ Checkbox
  🔘 Radio Group
  📋 Select List (LOV)
  🔄 Shuttle
  ⭐ Rating
  🎚️ Slider
  🔐 Password
  📁 File Upload
  🖼️ Image Upload
  🖊️ Rich Text Editor
  🔗 Link

🔘 BUTTONS
  💾 Save
  ❌ Cancel
  🗑️ Delete
  ➕ Add Row
  🔍 Search
  📥 Download
  🔄 Refresh

📊 DATA DISPLAY
  📋 Label
  🖼️ Display Image
  💬 Display Text
  🏷️ Badge
  📊 Progress Bar

🎯 LAYOUT
  📦 Region Container
  🗂️ Tab Container
  📂 Accordion
  ➗ Separator
  🔲 Panel
```

**Drag-and-Drop Behavior**:
1. User clicks component in palette
2. Drags to canvas
3. Drop zones highlight (yellow border)
4. On drop:
   - Component added to tree
   - Component rendered on canvas
   - Property editor opens for configuration
5. Default properties applied (can customize)

---

### 3.4 Item Types (Form Fields)

#### REQ-004: Support Essential Item Types (MANDATORY)

##### Text Field
**Properties**:
- Label
- Placeholder
- Max Length
- Required (Y/N)
- Default Value
- Pattern (regex)
- Help Text

**Validations**:
- Not Null
- Min/Max Length
- Regular Expression

##### Textarea
**Properties**:
- Rows (height)
- Max Length
- Character Counter (Y/N)
- Resizable (Y/N)

##### Number Input
**Properties**:
- Min Value
- Max Value
- Step (increment)
- Decimal Places
- Format Mask (e.g., $999,999.99)
- Thousands Separator

**Validations**:
- Numeric
- Range

##### Date Picker
**Properties**:
- Format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- Min Date
- Max Date
- Default (Today, Custom)

**Validations**:
- Date Format
- Date Range

##### Select List (LOV - List of Values)
**Properties**:
- Display Null (Y/N)
- Null Display Text
- Multiple Selection (Y/N)
- Searchable (Y/N)

**LOV Source Types**:
1. **Static List**
   ```
   Display       Return
   Active        A
   Inactive      I
   ```

2. **SQL Query**
   ```sql
   SELECT customer_name AS display_value,
          customer_id AS return_value
     FROM customers
    WHERE status = 'ACTIVE'
    ORDER BY customer_name
   ```

3. **Table-Based**
   - Select table
   - Select display column
   - Select return column
   - Optional WHERE clause

4. **Cascading LOV** (Parent-Child)
   - Parent Item: P10_COUNTRY
   - Child Query: `WHERE country_id = :P10_COUNTRY`

##### Checkbox
**Properties**:
- Label
- Checked Value (e.g., "Y")
- Unchecked Value (e.g., "N")
- Default State

##### Radio Group
**Properties**:
- Orientation (Horizontal, Vertical)
- Options (LOV)

##### File Upload
**Properties**:
- Accepted File Types (e.g., .pdf, .jpg, .png)
- Max File Size (MB)
- Multiple Files (Y/N)
- Storage Table
- BLOB Column

##### Switch (Toggle)
**Properties**:
- On Label
- Off Label
- On Value
- Off Value
- Default

##### Auto-Fetch Field
**Description**: Auto-populated from another table/API

**Example**: Select Customer → Auto-fill Address, Phone

**Configuration**:
- Trigger Item (when this changes)
- Source Type (SQL Query, REST API)
- Source Query/Endpoint
- Target Items (which fields to populate)

**Example SQL**:
```sql
SELECT address,
       phone,
       email
  INTO :P10_ADDRESS,
       :P10_PHONE,
       :P10_EMAIL
  FROM customers
 WHERE customer_id = :P10_CUSTOMER_ID;
```

---

### 3.5 Grid/Table Component

#### REQ-005: Interactive Grid (MANDATORY)

**Features Required**:
- ✅ Display data in tabular format
- ✅ Column sorting
- ✅ Column filtering
- ✅ Pagination
- ✅ Row selection
- ✅ Inline editing (optional)
- ✅ Add row button
- ✅ Delete row button
- ✅ Export (CSV, Excel)

**Column Types**:
- Text
- Number
- Date
- LOV (dropdown in cell)
- Link
- Checkbox
- Display Only

**Editable Mode**:
- Read-only
- Cell-level edit
- Row-level edit
- Batch edit

**Configuration**:
```json
{
  "gridId": "detail_grid",
  "sourceTable": "PO_LINES",
  "columns": [
    {
      "name": "line_number",
      "header": "Line #",
      "dataType": "number",
      "width": "80px",
      "editable": false,
      "sortable": true
    },
    {
      "name": "product_id",
      "header": "Product",
      "dataType": "lov",
      "width": "200px",
      "editable": true,
      "required": true,
      "lov": {
        "sourceTable": "PRODUCTS",
        "displayColumn": "PRODUCT_NAME",
        "returnColumn": "PRODUCT_ID"
      }
    },
    {
      "name": "quantity",
      "header": "Qty",
      "dataType": "number",
      "width": "100px",
      "editable": true,
      "min": 1,
      "max": 9999
    }
  ],
  "features": {
    "filtering": true,
    "sorting": true,
    "pagination": true,
    "pageSize": 10,
    "inlineEdit": true,
    "addRow": true,
    "deleteRow": true,
    "export": true
  }
}
```

---

### 3.6 Validations

#### REQ-006: Comprehensive Validation System (MANDATORY)

**Validation Types**:

##### 1. Field-Level Validations
**Required**:
- Not Null
- Error Message: "{field} is required"

**Data Type**:
- Is Numeric
- Is Integer
- Is Date
- Is Email
- Is URL

**Length**:
- Min Length
- Max Length
- Exact Length

**Range**:
- Min Value
- Max Value

**Pattern (Regex)**:
- Email: `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$`
- Phone: `^\d{3}-\d{3}-\d{4}$`
- Zip: `^\d{5}(-\d{4})?$`
- Custom

##### 2. Cross-Field Validations
**Compare Fields**:
- Field A = Field B (e.g., Password confirmation)
- Field A < Field B (e.g., Start Date < End Date)
- Field A + Field B = Field C (e.g., Totals)

**Custom Logic (SQL)**:
```sql
SELECT CASE
         WHEN :P10_START_DATE >= :P10_END_DATE THEN
           'Start date must be before end date'
         ELSE NULL
       END
  FROM dual
```

##### 3. Database Validations
**Unique Check**:
```sql
SELECT COUNT(*)
  FROM customers
 WHERE customer_code = :P10_CUSTOMER_CODE
   AND customer_id != NVL(:P10_CUSTOMER_ID, -1)
```
*Error if count > 0*

**Existence Check**:
```sql
SELECT COUNT(*)
  FROM departments
 WHERE department_id = :P10_DEPARTMENT_ID
```
*Error if count = 0*

##### 4. Custom Validations (PL/SQL Function)
```sql
FUNCTION validate_credit_limit(
    p_customer_id   NUMBER,
    p_order_amount  NUMBER
) RETURN VARCHAR2
IS
    l_credit_limit  NUMBER;
    l_outstanding   NUMBER;
BEGIN
    SELECT credit_limit,
           outstanding_balance
      INTO l_credit_limit,
           l_outstanding
      FROM customers
     WHERE customer_id = p_customer_id;

    IF l_outstanding + p_order_amount > l_credit_limit THEN
        RETURN 'Order exceeds credit limit';
    END IF;

    RETURN NULL; -- Valid
END;
```

**Validation Timing**:
- On Submit (server-side)
- On Blur (client-side, immediate)
- On Change (real-time)

**Validation Display**:
- Inline (next to field)
- Notification banner (top of page)
- Both

---

### 3.7 Processes

#### REQ-007: Page Processing Logic (MANDATORY)

**Process Types**:

##### 1. Automatic DML (Form on Table)
**Auto-Generated for Free-form Page**:
```javascript
// On Page Load: Fetch Record
if (recordId) {
    fetchRecord(recordId);
}

// On Save: INSERT or UPDATE
function save() {
    if (recordId) {
        updateRecord(recordId, formData);
    } else {
        insertRecord(formData);
    }
}

// On Delete: DELETE
function deleteRecord() {
    if (confirm('Delete this record?')) {
        callAPI('/api/customers/' + recordId, 'DELETE');
    }
}
```

##### 2. Custom Process (PL/SQL)
**Example**: Calculate Order Total
```sql
BEGIN
    :P10_TOTAL := :P10_QUANTITY * :P10_UNIT_PRICE;

    IF :P10_DISCOUNT_PCT > 0 THEN
        :P10_TOTAL := :P10_TOTAL * (1 - :P10_DISCOUNT_PCT / 100);
    END IF;

    :P10_TAX := :P10_TOTAL * 0.10; -- 10% tax
    :P10_GRAND_TOTAL := :P10_TOTAL + :P10_TAX;
END;
```

##### 3. Execute SQL
```sql
UPDATE orders
   SET status = 'APPROVED',
       approved_by = :APP_USER,
       approved_date = SYSDATE
 WHERE order_id = :P10_ORDER_ID;
```

##### 4. Call API
**REST API Call**:
```json
{
  "processType": "invokeAPI",
  "method": "POST",
  "url": "/api/orders",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "orderId": ":P10_ORDER_ID",
    "status": ":P10_STATUS"
  },
  "onSuccess": "showSuccessMessage",
  "onError": "showErrorMessage"
}
```

##### 5. Send Email
```json
{
  "processType": "sendEmail",
  "to": ":P10_CUSTOMER_EMAIL",
  "subject": "Order Confirmation - :P10_ORDER_NUMBER",
  "body": "Thank you for your order...",
  "attachments": []
}
```

**Process Execution Points**:
- Before Page Load
- After Page Load
- Before Submit
- After Validations (if all pass)
- After Submit

---

### 3.8 Dynamic Actions (Client-side Interactivity)

#### REQ-008: Declarative JavaScript (MANDATORY)

**Purpose**: Add interactivity without writing JavaScript code

**Event Types**:
- Change (field value changes)
- Click (button/link clicked)
- Focus (field gets focus)
- Blur (field loses focus)
- Page Load
- Selection Change (grid row selected)

**Action Types**:

##### Show/Hide
**Config**:
- Event: Change on P10_CUSTOMER_TYPE
- Condition: Value = 'CORPORATE'
- True Action: Show P10_TAX_ID
- False Action: Hide P10_TAX_ID

##### Enable/Disable
**Config**:
- Event: Change on P10_EDIT_MODE
- Condition: Value = 'VIEW'
- Action: Disable All Fields

##### Set Value
**Config**:
- Event: Change on P10_COUNTRY
- Action: Set Value
- Item: P10_STATE
- Value Type: SQL Query
- Query: `SELECT default_state FROM countries WHERE country_id = :P10_COUNTRY`

##### Execute JavaScript
**Config**:
- Event: Click on Calculate Button
- Action: Execute JavaScript
- Code:
```javascript
var qty = apex.item('P10_QUANTITY').getValue();
var price = apex.item('P10_PRICE').getValue();
var total = qty * price;
apex.item('P10_TOTAL').setValue(total);
```

##### Refresh Region
**Config**:
- Event: Click on Search Button
- Action: Refresh
- Region: Customer Report

##### Submit Page
**Config**:
- Event: Click on Save Button
- Action: Submit Page
- Request: SAVE

##### Call AJAX Process
**Config**:
- Event: Change on P10_PRODUCT
- Action: Execute Server-side Code
- Items to Submit: P10_PRODUCT
- Code:
```sql
BEGIN
    SELECT unit_price
      INTO :P10_UNIT_PRICE
      FROM products
     WHERE product_id = :P10_PRODUCT;
END;
```
- Items to Return: P10_UNIT_PRICE

**Generated JavaScript**:
```javascript
// Dynamic Action: Show/Hide based on condition
apex.item('P10_CUSTOMER_TYPE').onChange(function() {
    if (apex.item('P10_CUSTOMER_TYPE').getValue() === 'CORPORATE') {
        apex.item('P10_TAX_ID').show();
    } else {
        apex.item('P10_TAX_ID').hide();
    }
});
```

---

### 3.9 Shared Components

#### REQ-009: Reusable Elements (HIGH PRIORITY)

##### Lists of Values (LOVs)
**Purpose**: Centralized dropdown data sources

**Types**:
1. **Static LOV**
   ```
   Status (LOV_STATUS)
   ------------------
   Active    | A
   Inactive  | I
   Pending   | P
   ```

2. **Dynamic LOV (SQL)**
   ```sql
   -- LOV_CUSTOMERS
   SELECT customer_name AS display,
          customer_id AS value
     FROM customers
    WHERE status = 'ACTIVE'
    ORDER BY customer_name
   ```

3. **Table-Based LOV**
   - Table: DEPARTMENTS
   - Display: DEPARTMENT_NAME
   - Return: DEPARTMENT_ID
   - Filter: WHERE ACTIVE_FLAG = 'Y'

**Usage**: Select "LOV_CUSTOMERS" in field configuration

**Benefits**:
- ✅ Single definition, used everywhere
- ✅ Easy maintenance (change once, update all)
- ✅ Consistency

##### Master Tables List
**Purpose**: Table browser for quick selection

**Stored in JSON**:
```json
{
  "tables": [
    {
      "tableName": "CUSTOMERS",
      "module": "AR",
      "displayName": "Customers",
      "primaryKey": "CUSTOMER_ID",
      "displayColumn": "CUSTOMER_NAME",
      "columns": [
        {
          "name": "CUSTOMER_ID",
          "dataType": "NUMBER",
          "nullable": false
        },
        {
          "name": "CUSTOMER_NAME",
          "dataType": "VARCHAR2",
          "length": 100,
          "nullable": false
        }
      ]
    }
  ]
}
```

**Used In**:
- Table selection wizard
- LOV configuration
- Grid column mapping

---

### 3.10 Templates

#### REQ-010: UI Templates (MEDIUM PRIORITY)

**Purpose**: Control page HTML structure

**Template Types**:

##### 1. Page Template
**Structure**:
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{PAGE_TITLE}}</title>
    <link rel="stylesheet" href="/css/erp-main.css">
</head>
<body>
    <div class="top-bar">
        <h1>{{PAGE_TITLE}}</h1>
        <div class="user-menu">{{USER_INFO}}</div>
    </div>

    <div class="main-content">
        {{REGIONS}}
    </div>

    <script src="/js/erp-framework.js"></script>
    {{CUSTOM_JS}}
</body>
</html>
```

##### 2. Region Template
```html
<div class="region {{REGION_CSS_CLASS}}" id="{{REGION_ID}}">
    <div class="region-header">
        <h3>{{REGION_TITLE}}</h3>
    </div>
    <div class="region-body">
        {{REGION_CONTENT}}
    </div>
</div>
```

##### 3. Form Item Template
```html
<div class="form-group">
    <label for="{{ITEM_ID}}" class="{{LABEL_CSS}}">
        {{ITEM_LABEL}}
        {{#if REQUIRED}}<span class="required">*</span>{{/if}}
    </label>
    <input type="{{ITEM_TYPE}}"
           id="{{ITEM_ID}}"
           name="{{ITEM_NAME}}"
           class="form-control {{ITEM_CSS}}"
           placeholder="{{PLACEHOLDER}}"
           {{#if REQUIRED}}required{{/if}}
           {{#if READONLY}}readonly{{/if}}>
    <div class="error-message" id="{{ITEM_ID}}_error"></div>
    {{#if HELP_TEXT}}
    <small class="form-text">{{HELP_TEXT}}</small>
    {{/if}}
</div>
```

##### 4. Button Template
```html
<button type="{{BUTTON_TYPE}}"
        id="{{BUTTON_ID}}"
        class="btn {{BUTTON_CSS_CLASS}}"
        {{#if ONCLICK}}onclick="{{ONCLICK}}"{{/if}}>
    {{#if ICON}}<span class="icon">{{ICON}}</span>{{/if}}
    {{BUTTON_LABEL}}
</button>
```

##### 5. Grid Column Template
```html
<td class="{{COLUMN_CSS}}">
    {{#if LINK}}
    <a href="{{LINK}}">{{VALUE}}</a>
    {{else}}
    {{VALUE}}
    {{/if}}
</td>
```

---

## 4. User Interface Requirements

### 4.1 Toolbar

#### REQ-011: Page Designer Toolbar (MANDATORY)

**Buttons**:
```
[ 💾 Save ] [ ▶️ Preview ] [ 📥 Export ] [ 📤 Import ] [ 🗑️ Delete ] [ ↩️ Undo ] [ ↪️ Redo ] [ 🔍 Zoom: 100% ▼ ] [ ⚙️ Settings ]
```

**Actions**:
- **Save**: Save page definition (JSON to database/file)
- **Preview**: Open preview mode with sample data
- **Export**: Download JSON definition
- **Import**: Upload JSON definition
- **Delete**: Delete page definition
- **Undo**: Revert last change (history stack)
- **Redo**: Reapply change
- **Zoom**: 50%, 75%, 100%, 125%, 150%
- **Settings**: Page-level settings

---

### 4.2 Component Palette

#### REQ-012: Collapsible Palette (MANDATORY)

**Layout**:
```
┌─────────────────┐
│ 🔍 Search       │
├─────────────────┤
│ ▼ Regions       │
│   📋 Form       │
│   📊 Grid       │
│   📈 Chart      │
├─────────────────┤
│ ▼ Items         │
│   ⌨️ Text       │
│   📅 Date       │
│   📋 LOV        │
├─────────────────┤
│ ▼ Buttons       │
│   💾 Save       │
│   ❌ Cancel     │
└─────────────────┘
```

**Features**:
- Search components
- Collapse/expand groups
- Tooltip on hover (component description)
- Drag-and-drop to canvas

---

### 4.3 Canvas

#### REQ-013: Visual Layout Editor (MANDATORY)

**Grid System**:
- 12-column responsive grid
- Drag to resize columns
- Snap to grid

**Drop Zones**:
- Highlight on hover (yellow border)
- Show insertion line between components
- Prevent invalid drops (e.g., button inside button)

**Context Menu (Right-click)**:
- Edit Properties
- Duplicate
- Delete
- Move Up/Down
- Copy/Paste

---

### 4.4 Property Editor

#### REQ-014: Context-Sensitive Properties (MANDATORY)

**Features**:
- Auto-update on selection
- Collapsible groups
- Required field indicators (red asterisk)
- Validation on blur
- Quick picks (common values)
- Code editor for SQL/JavaScript (syntax highlighting)
- LOV picker (modal dialog)
- Help icon (tooltip)

**Example Property Editor for Text Field**:
```
┌─────────────────────────────┐
│ 📝 Text Field Properties    │
├─────────────────────────────┤
│ ▼ Identification            │
│   Name*: customer_name      │
│   Label*: Customer Name     │
│   ID: P10_CUSTOMER_NAME     │
│                             │
│ ▼ Source                    │
│   Table: CUSTOMERS          │
│   Column: CUSTOMER_NAME     │
│                             │
│ ▼ Settings                  │
│   Required: ☑               │
│   Max Length: 100           │
│   Placeholder: Enter name   │
│                             │
│ ▼ Validation                │
│   Pattern: [A-Za-z ]+       │
│   Error: Letters only       │
│                             │
│ ▼ Help                      │
│   Help Text: Customer       │
│   legal name                │
└─────────────────────────────┘
```

---

### 4.5 Preview Mode

#### REQ-015: Live Preview with Sample Data (HIGH PRIORITY)

**Features**:
- ✅ Render page with realistic data
- ✅ Auto-generate sample data based on field types
- ✅ Interactive (can click, type, submit)
- ✅ Switch between desktop/tablet/mobile view
- ✅ Show validation errors
- ✅ Test dynamic actions
- ✅ Close preview (return to designer)

**Sample Data Generation Rules**:

| Field Type | Sample Data |
|-----------|-------------|
| Text | "Sample Corporation", "John Doe" |
| Email | "john.doe@example.com" |
| Phone | "(555) 123-4567" |
| Number | Random 1-1000 |
| Currency | Random $100-$10,000 |
| Date | Today ± random days |
| Checkbox | Random true/false |
| LOV | Random from available values |

**Example Generated Data**:
```json
{
  "sampleData": [
    {
      "customer_id": 1001,
      "customer_name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "(555) 234-5678",
      "credit_limit": 50000,
      "balance": 12500,
      "created_date": "2025-01-15"
    },
    {
      "customer_id": 1002,
      "customer_name": "Globex Industries",
      "email": "info@globex.com",
      "phone": "(555) 345-6789",
      "credit_limit": 75000,
      "balance": 32100,
      "created_date": "2025-02-20"
    }
  ]
}
```

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### REQ-016: Technology Choices (MANDATORY)

**Frontend**:
- HTML5
- CSS3 (with CSS Grid, Flexbox)
- JavaScript (ES6+)
- No framework dependency (Vanilla JS for portability)
- Optional: Vue.js or React for advanced features

**Backend**:
- Node.js + Express (lightweight API server)
- OR: Python Flask/FastAPI
- OR: .NET Core C# (for integration with ERP desktop app)

**Database**:
- SQLite (for development)
- PostgreSQL or SQL Server (for production)
- MongoDB (for JSON storage, optional)

**File Storage**:
- JSON files (for page definitions)
- Version control (Git) for definitions

**Libraries**:
- **Drag-and-Drop**: SortableJS, interact.js
- **Code Editor**: Monaco Editor, CodeMirror, Ace Editor
- **UI Components**: Native HTML5 (custom styled)
- **Charts**: Chart.js, ApexCharts (if needed)
- **Icons**: Font Awesome, Feather Icons

---

### 5.2 Data Storage

#### REQ-017: Hybrid Storage Approach (MANDATORY)

**Option 1: Database-Centric (Like APEX)**
```sql
CREATE TABLE PAGE_DEFINITIONS (
    page_id VARCHAR(20) PRIMARY KEY,
    module VARCHAR(10),
    page_name VARCHAR(100),
    page_type VARCHAR(20),
    definition JSONB, -- PostgreSQL JSONB
    created_by VARCHAR(50),
    created_date TIMESTAMP,
    modified_date TIMESTAMP
);
```

**Option 2: File-Based (Recommended)**
```
/page-definitions/
  GL/
    GL-P001_customer_entry.json
    GL-P002_account_list.json
  AP/
    AP-P001_invoice_entry.json
  ...
```

**Benefits of File-Based**:
- ✅ Version control (Git)
- ✅ Easy backup
- ✅ Portable (no DB dependency)
- ✅ Diff/merge capabilities
- ✅ Easy inspection

**Hybrid Approach** (Best of both):
- Store in database for runtime access
- Export to files for version control
- Import from files for deployment

---

### 5.3 JSON Schema

#### REQ-018: Standardized Page Definition Format (MANDATORY)

**Complete Page Definition Example**:
```json
{
  "pageId": "GL-P001",
  "module": "GL",
  "pageName": "Customer Entry Form",
  "pageType": "free-form",
  "version": "1.0",
  "createdBy": "admin",
  "createdDate": "2025-10-27T10:30:00Z",
  "modifiedDate": "2025-10-27T15:45:00Z",

  "dataSource": {
    "type": "table",
    "table": "CUSTOMERS",
    "primaryKey": "CUSTOMER_ID",
    "sequence": "CUSTOMERS_SEQ"
  },

  "layout": {
    "template": "standard-form",
    "columns": 2,
    "spacing": "normal",
    "responsive": true
  },

  "regions": [
    {
      "regionId": "customer_form",
      "regionName": "Customer Information",
      "regionType": "form",
      "sequence": 10,
      "displayPoint": "body",

      "items": [
        {
          "itemId": "P1_CUSTOMER_ID",
          "itemName": "Customer ID",
          "itemType": "hidden",
          "sourceColumn": "CUSTOMER_ID",
          "sequence": 10
        },
        {
          "itemId": "P1_CUSTOMER_NAME",
          "itemName": "Customer Name",
          "itemType": "text",
          "sourceColumn": "CUSTOMER_NAME",
          "sequence": 20,
          "required": true,
          "maxLength": 100,
          "placeholder": "Enter customer name",
          "helpText": "Legal name of the customer",
          "layout": {
            "row": 1,
            "column": 1,
            "columnSpan": 2
          },
          "validation": {
            "required": true,
            "message": "Customer name is required",
            "pattern": "^[A-Za-z0-9 ,.'-]+$",
            "patternMessage": "Invalid characters in name"
          }
        },
        {
          "itemId": "P1_EMAIL",
          "itemName": "Email",
          "itemType": "text",
          "sourceColumn": "EMAIL",
          "sequence": 30,
          "required": true,
          "maxLength": 100,
          "layout": {
            "row": 2,
            "column": 1
          },
          "validation": {
            "dataType": "email",
            "message": "Invalid email format"
          }
        },
        {
          "itemId": "P1_PHONE",
          "itemName": "Phone",
          "itemType": "text",
          "sourceColumn": "PHONE",
          "sequence": 40,
          "maxLength": 20,
          "layout": {
            "row": 2,
            "column": 2
          },
          "validation": {
            "pattern": "^\\d{3}-\\d{3}-\\d{4}$",
            "patternMessage": "Format: 555-555-5555"
          }
        },
        {
          "itemId": "P1_COUNTRY",
          "itemName": "Country",
          "itemType": "selectList",
          "sourceColumn": "COUNTRY_ID",
          "sequence": 50,
          "required": true,
          "layout": {
            "row": 3,
            "column": 1
          },
          "lov": {
            "lovId": "LOV_COUNTRIES",
            "type": "sql",
            "query": "SELECT country_name, country_id FROM countries ORDER BY country_name"
          }
        },
        {
          "itemId": "P1_STATE",
          "itemName": "State",
          "itemType": "selectList",
          "sourceColumn": "STATE_ID",
          "sequence": 60,
          "layout": {
            "row": 3,
            "column": 2
          },
          "lov": {
            "lovId": "LOV_STATES_BY_COUNTRY",
            "type": "sql",
            "query": "SELECT state_name, state_id FROM states WHERE country_id = :P1_COUNTRY ORDER BY state_name",
            "cascadingParent": "P1_COUNTRY"
          }
        },
        {
          "itemId": "P1_CREDIT_LIMIT",
          "itemName": "Credit Limit",
          "itemType": "number",
          "sourceColumn": "CREDIT_LIMIT",
          "sequence": 70,
          "layout": {
            "row": 4,
            "column": 1
          },
          "format": {
            "type": "currency",
            "symbol": "$",
            "decimals": 2
          },
          "validation": {
            "min": 0,
            "max": 1000000,
            "message": "Credit limit must be between $0 and $1,000,000"
          }
        },
        {
          "itemId": "P1_STATUS",
          "itemName": "Status",
          "itemType": "radioGroup",
          "sourceColumn": "STATUS",
          "sequence": 80,
          "defaultValue": "A",
          "layout": {
            "row": 4,
            "column": 2
          },
          "lov": {
            "type": "static",
            "values": [
              {"display": "Active", "value": "A"},
              {"display": "Inactive", "value": "I"}
            ]
          }
        }
      ],

      "buttons": [
        {
          "buttonId": "save_button",
          "buttonLabel": "Save",
          "buttonType": "submit",
          "cssClass": "btn-primary",
          "icon": "💾",
          "sequence": 10,
          "action": {
            "type": "submit",
            "request": "SAVE"
          }
        },
        {
          "buttonId": "cancel_button",
          "buttonLabel": "Cancel",
          "buttonType": "button",
          "cssClass": "btn-secondary",
          "icon": "❌",
          "sequence": 20,
          "action": {
            "type": "navigate",
            "page": "GL-P002"
          }
        },
        {
          "buttonId": "delete_button",
          "buttonLabel": "Delete",
          "buttonType": "button",
          "cssClass": "btn-danger",
          "icon": "🗑️",
          "sequence": 30,
          "condition": {
            "type": "itemNotNull",
            "item": "P1_CUSTOMER_ID"
          },
          "action": {
            "type": "submit",
            "request": "DELETE",
            "confirmMessage": "Are you sure you want to delete this customer?"
          }
        }
      ]
    }
  ],

  "validations": [
    {
      "validationId": "check_unique_email",
      "validationType": "sql",
      "sequence": 10,
      "message": "Email already exists",
      "query": "SELECT COUNT(*) FROM customers WHERE email = :P1_EMAIL AND customer_id != NVL(:P1_CUSTOMER_ID, -1)",
      "condition": "rowsReturned > 0"
    },
    {
      "validationId": "check_credit_vs_balance",
      "validationType": "plsql",
      "sequence": 20,
      "message": "Cannot reduce credit limit below current balance",
      "function": "RETURN :P1_CREDIT_LIMIT >= NVL(:P1_CURRENT_BALANCE, 0);",
      "condition": {
        "type": "itemNotNull",
        "item": "P1_CUSTOMER_ID"
      }
    }
  ],

  "processes": [
    {
      "processId": "fetch_customer",
      "processName": "Fetch Customer Data",
      "processType": "automaticRowFetch",
      "sequence": 10,
      "timing": "beforeHeader",
      "condition": {
        "type": "itemNotNull",
        "item": "P1_CUSTOMER_ID"
      }
    },
    {
      "processId": "save_customer",
      "processName": "Save Customer",
      "processType": "automaticRowProcessing",
      "sequence": 10,
      "timing": "afterSubmit",
      "request": "SAVE",
      "successMessage": "Customer saved successfully",
      "errorHandling": {
        "displayLocation": "inline",
        "stopExecution": true
      }
    },
    {
      "processId": "delete_customer",
      "processName": "Delete Customer",
      "processType": "sql",
      "sequence": 20,
      "timing": "afterSubmit",
      "request": "DELETE",
      "sql": "DELETE FROM customers WHERE customer_id = :P1_CUSTOMER_ID",
      "successMessage": "Customer deleted successfully"
    }
  ],

  "dynamicActions": [
    {
      "actionId": "cascade_state",
      "actionName": "Cascade State LOV",
      "event": "change",
      "triggerItem": "P1_COUNTRY",
      "sequence": 10,
      "actions": [
        {
          "actionType": "clearValue",
          "affectedItem": "P1_STATE"
        },
        {
          "actionType": "refresh",
          "affectedItem": "P1_STATE"
        }
      ]
    },
    {
      "actionId": "calculate_available_credit",
      "actionName": "Calculate Available Credit",
      "event": "change",
      "triggerItem": "P1_CREDIT_LIMIT",
      "sequence": 20,
      "actions": [
        {
          "actionType": "executeServerCode",
          "code": "BEGIN :P1_AVAILABLE_CREDIT := :P1_CREDIT_LIMIT - NVL(:P1_CURRENT_BALANCE, 0); END;",
          "itemsToSubmit": ["P1_CREDIT_LIMIT", "P1_CURRENT_BALANCE"],
          "itemsToReturn": ["P1_AVAILABLE_CREDIT"]
        },
        {
          "actionType": "show",
          "affectedItem": "P1_AVAILABLE_CREDIT"
        }
      ]
    }
  ],

  "branches": [
    {
      "branchId": "after_save",
      "branchName": "Return to List",
      "branchType": "redirect",
      "sequence": 10,
      "timing": "afterProcessing",
      "request": "SAVE",
      "target": {
        "page": "GL-P002",
        "clearCache": true
      }
    }
  ],

  "authorization": {
    "scheme": "MUST_BE_ADMIN",
    "condition": null
  },

  "helpText": {
    "pageHelp": "Use this form to create or edit customer records. All required fields must be filled before saving."
  },

  "metadata": {
    "generatedBy": "PageComposer v1.0",
    "schemaVersion": "1.0"
  }
}
```

---

## 6. Data Model

### 6.1 Database Schema

#### REQ-019: Database Tables (MANDATORY)

```sql
-- Page Definitions
CREATE TABLE PAGE_DEFINITIONS (
    page_id VARCHAR(20) PRIMARY KEY,
    module VARCHAR(10) NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    page_type VARCHAR(20) NOT NULL,
    template_id VARCHAR(20),
    definition JSONB NOT NULL,
    version VARCHAR(10) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
    created_by VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_by VARCHAR(50),
    modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_date TIMESTAMP,
    CONSTRAINT chk_page_type CHECK (page_type IN ('free-form', 'master-detail', 'report', 'report-form', 'dashboard', 'wizard')),
    CONSTRAINT chk_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Page Templates
CREATE TABLE PAGE_TEMPLATES (
    template_id VARCHAR(20) PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_type VARCHAR(20) NOT NULL,
    description TEXT,
    template_json JSONB NOT NULL,
    preview_image VARCHAR(200),
    is_default BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_template_type CHECK (template_type IN ('page', 'region', 'item', 'button', 'report'))
);

-- Component Library
CREATE TABLE COMPONENT_LIBRARY (
    component_id VARCHAR(20) PRIMARY KEY,
    component_name VARCHAR(50) NOT NULL,
    component_type VARCHAR(20) NOT NULL,
    category VARCHAR(20),
    icon VARCHAR(50),
    default_properties JSONB,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT chk_component_type CHECK (component_type IN ('region', 'item', 'button', 'process', 'validation'))
);

-- Lists of Values (Shared LOVs)
CREATE TABLE LOVS (
    lov_id VARCHAR(20) PRIMARY KEY,
    lov_name VARCHAR(100) NOT NULL,
    lov_type VARCHAR(20) NOT NULL,
    lov_source JSONB NOT NULL,
    description TEXT,
    is_global BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(50),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_lov_type CHECK (lov_type IN ('static', 'sql', 'table', 'rest'))
);

-- Database Tables Metadata (for table browser)
CREATE TABLE DB_TABLES_METADATA (
    table_name VARCHAR(100) PRIMARY KEY,
    module VARCHAR(10),
    display_name VARCHAR(100),
    description TEXT,
    primary_key VARCHAR(50),
    display_column VARCHAR(50),
    is_audited BOOLEAN DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Database Columns Metadata
CREATE TABLE DB_COLUMNS_METADATA (
    table_name VARCHAR(100),
    column_name VARCHAR(100),
    data_type VARCHAR(50),
    max_length INTEGER,
    nullable BOOLEAN,
    default_value VARCHAR(200),
    display_label VARCHAR(100),
    help_text TEXT,
    sequence INTEGER,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE,
    fk_table VARCHAR(100),
    fk_column VARCHAR(100),
    PRIMARY KEY (table_name, column_name),
    FOREIGN KEY (table_name) REFERENCES DB_TABLES_METADATA(table_name)
);

-- Page Generation History (AI code generation tracking)
CREATE TABLE PAGE_GENERATION_LOG (
    generation_id SERIAL PRIMARY KEY,
    page_id VARCHAR(20) NOT NULL,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    generator VARCHAR(50) DEFAULT 'AI', -- 'AI' or 'Manual'
    generator_version VARCHAR(20),
    definition_hash VARCHAR(64),
    generated_files JSONB,
    generation_time_ms INTEGER,
    status VARCHAR(20), -- 'success', 'failed'
    error_message TEXT,
    FOREIGN KEY (page_id) REFERENCES PAGE_DEFINITIONS(page_id)
);

-- Indexes
CREATE INDEX idx_page_module ON PAGE_DEFINITIONS(module);
CREATE INDEX idx_page_status ON PAGE_DEFINITIONS(status);
CREATE INDEX idx_page_type ON PAGE_DEFINITIONS(page_type);
CREATE INDEX idx_db_tables_module ON DB_TABLES_METADATA(module);
CREATE INDEX idx_gen_log_page ON PAGE_GENERATION_LOG(page_id);
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1) ✅ COMPLETE
- [x] Create Page Composer module structure
- [x] Add to navigation menu
- [x] Build page listing UI
- [x] Create New Page wizard
- [x] Implement page export/import
- [x] LocalStorage persistence

### Phase 2: Page Designer Interface (Week 2-3)
- [ ] Build three-pane layout (tree, canvas, properties)
- [ ] Implement component tree with drag-drop
- [ ] Create property editor with grouped sections
- [ ] Build visual canvas with grid layout
- [ ] Implement toolbar with save/preview/export
- [ ] Add undo/redo functionality

### Phase 3: Component Palette & Items (Week 4)
- [ ] Create draggable component palette
- [ ] Implement text field component
- [ ] Implement select list (LOV) component
- [ ] Implement date picker component
- [ ] Implement number input component
- [ ] Implement textarea component
- [ ] Implement checkbox/radio components
- [ ] Implement all 15+ item types

### Phase 4: Regions & Layout (Week 5)
- [ ] Implement form region
- [ ] Implement grid region (table)
- [ ] Implement tab container
- [ ] Implement cards region
- [ ] Implement static content region
- [ ] Layout management (rows, columns, responsive)

### Phase 5: Data Integration (Week 6)
- [ ] Build table browser
- [ ] Create LOV editor
- [ ] Implement table-to-form mapping wizard
- [ ] Auto-generate items from table columns
- [ ] Configure data sources (SQL, REST)

### Phase 6: Validations & Processes (Week 7)
- [ ] Validation editor
- [ ] Process configuration
- [ ] Dynamic action builder
- [ ] Branch configuration

### Phase 7: Preview & Sample Data (Week 8)
- [ ] Live preview mode
- [ ] Sample data generator
- [ ] Preview interaction testing
- [ ] Responsive preview (desktop/tablet/mobile)

### Phase 8: AI Code Generation (Week 9)
- [ ] JSON to HTML generator
- [ ] JSON to JavaScript generator
- [ ] JSON to CSS generator
- [ ] API endpoint generator
- [ ] Complete page package output

### Phase 9: Advanced Features (Week 10)
- [ ] Master-detail page wizard
- [ ] Report page generator
- [ ] Chart integration
- [ ] Template customization
- [ ] Theme support

### Phase 10: Testing & Polish (Week 11-12)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation
- [ ] Tutorial videos
- [ ] Sample page library

---

## 8. Success Criteria

### 8.1 Functional Requirements Met
- ✅ User can create a free-form page in under 5 minutes
- ✅ User can create a master-detail page in under 10 minutes
- ✅ Generated JSON is parseable by AI without errors
- ✅ AI can generate working code from JSON in under 2 minutes
- ✅ Preview mode accurately represents final page
- ✅ 95% of common ERP pages can be built without custom code

### 8.2 Performance Benchmarks
- Page designer loads in < 2 seconds
- Component drag-drop is smooth (60fps)
- Preview renders in < 3 seconds
- JSON export/import in < 1 second
- AI code generation in < 60 seconds

### 8.3 Code Quality
- Generated code passes linting (ESLint, Prettier)
- Generated code is well-commented
- Generated code follows ERP coding standards
- Generated code is maintainable (can be edited)

### 8.4 User Experience
- Intuitive interface (minimal training needed)
- Context-sensitive help throughout
- Error messages are clear and actionable
- Undo/redo works reliably
- No data loss (auto-save)

---

## 9. Comparison: Our Page Composer vs Oracle APEX

| Feature | Oracle APEX | Our Page Composer |
|---------|-------------|-------------------|
| **Development Model** | Runtime metadata | Static code generation |
| **Output** | Database-stored pages | HTML/JS/CSS files |
| **Deployment** | APEX engine + Oracle DB | Standard web server |
| **Customization** | Template editing | Direct code editing |
| **Version Control** | Export/import | Git-native |
| **AI Integration** | APEX AI Assistant (24.1+) | Full AI code generation |
| **Database** | Oracle only | Any database |
| **Learning Curve** | Moderate | Low (familiar HTML/JS) |
| **Cost** | Oracle DB license | Free/open-source |
| **Runtime Performance** | Excellent | Excellent (static files) |
| **Flexibility** | High (within APEX) | Very High (edit anything) |

---

## 10. Next Steps

### Immediate Actions
1. ✅ Review this requirements document
2. ✅ Get user approval on scope
3. Begin Phase 2 implementation:
   - Design three-pane layout mockup
   - Set up development environment
   - Create component tree UI
   - Build property editor framework

### Documentation Needed
- [ ] UI/UX Design Mockups (Figma/Sketch)
- [ ] API Specification
- [ ] JSON Schema Documentation
- [ ] Developer Guide (how to extend)
- [ ] User Guide (how to use Page Composer)

---

**Document Version**: 1.0
**Status**: READY FOR IMPLEMENTATION
**Approval Required From**: Project Manager, Lead Developer

---

**End of Requirements Document**
