# Page Composer - Visual Page Designer Specification

## Overview
A visual, low-code page designer that allows users to create ERP pages through a drag-and-drop interface. The composer generates JSON/XML metadata that can be used by AI to generate actual working code.

## Purpose
- **Speed up development**: Visually design pages instead of hand-coding
- **Reduce errors**: Standardized page structures
- **Enable AI code generation**: JSON/XML format is easy for AI to parse and generate code from
- **Empower business users**: Allow non-developers to design pages

## Module Location
**Project Management Website** → New Module: "Page Composer"

---

## Features

### 1. Page Management
- **New Page**: Create a new page from templates
- **View Pages**: Browse existing page definitions by module
- **Edit Page**: Modify existing page definitions
- **Delete Page**: Remove page definitions
- **Export**: Download page definition as JSON/XML
- **Import**: Upload existing page definitions

### 2. Page Templates

#### Template 1: Free-Form Page
**Description**: Single-record form with customizable fields

**Workflow**:
1. User selects "Free-form Page"
2. System asks for:
   - Module name (dropdown: GL, AP, AR, etc.)
   - Page name (e.g., "Invoice Entry")
   - Base table (dropdown from database tables)
3. System auto-generates form fields from table columns
4. User customizes each field:
   - Field type: Text, LOV, Date Picker, Number, Link, Auto-fetch
   - Label
   - Required/Optional
   - Default value
   - Validation rules
   - Display order
   - Width/Layout

**Output**: JSON definition with field metadata

#### Template 2: Master-Detail Page
**Description**: Header form with multiple detail grids in tabs

**Workflow**:
1. User selects "Master-Detail Page"
2. **Master Section Setup**:
   - Select master table (e.g., PO_Headers)
   - Configure header fields (same as free-form)
3. **Detail Section Setup**:
   - Add tab pages (e.g., "Line Items", "Distributions", "Attachments")
   - For each tab:
     - Select detail table (e.g., PO_Lines)
     - Configure grid columns
     - Set filter options
     - Define relationships (foreign keys)
4. **Validation Setup**:
   - Field validations
   - Cross-field validations
   - Tab-level validations

**Output**: JSON definition with master-detail hierarchy

---

## Component Types

### Input Components
1. **Text Box**: Single-line text input
2. **Text Area**: Multi-line text input
3. **Number Input**: Numeric input with min/max
4. **Date Picker**: Calendar selector
5. **LOV (List of Values)**: Dropdown from table or static list
6. **Checkbox**: Boolean true/false
7. **Radio Button Group**: Single selection from options
8. **Link**: Clickable link to another page
9. **Auto-Fetch Field**: Automatically populated from another table/API

### Display Components
10. **Label**: Static text
11. **Separator**: Horizontal line
12. **Section Header**: Grouped fields

### Grid Components
13. **Data Grid**: Tabular data display with:
    - Sortable columns
    - Filterable columns
    - Pagination
    - Inline editing (optional)
    - Row selection
    - Export to Excel

### Layout Components
14. **Tab Container**: Multiple tabs
15. **Accordion**: Collapsible sections
16. **Panel**: Grouped content with border

---

## Visual Designer Interface

### Layout
```
+----------------------------------------------------------+
|  Top Bar: [Module] [Page Name] [Template]  [Save] [Preview] |
+----------------------------------------------------------+
|          |                                                 |
| Component|                Canvas Area                     |
| Palette  |         (Drag & Drop Here)                     |
|          |                                                 |
| [Text]   |  +----------------------------------+           |
| [LOV]    |  | Field 1: [__________]            |           |
| [Date]   |  | Field 2: [__________]            |           |
| [Grid]   |  | Field 3: [▼]                     |           |
| [Tab]    |  +----------------------------------+           |
|          |                                                 |
+----------+-------------------------------------------------+
|          Property Panel                                   |
|  Field: "Customer Name"                                  |
|  Type: [Text ▼]                                          |
|  Required: [✓]                                            |
|  Max Length: [100]                                        |
+----------------------------------------------------------+
```

### Property Panel (Right Side)
Shows properties for selected component:
- **General**: Name, Label, Description
- **Data**: Table, Column, Data Type
- **Validation**: Required, Pattern, Min/Max, Custom
- **Layout**: Width, Position, Visible, Enabled
- **Events**: onChange, onClick, onLoad

---

## JSON Schema Structure

### Page Definition Schema
```json
{
  "pageId": "GL-P001",
  "moduleName": "GL",
  "pageName": "Chart of Account Entry",
  "pageType": "free-form",
  "baseTable": "GL_ACCOUNTS",
  "version": "1.0",
  "createdBy": "admin",
  "createdDate": "2025-10-27",
  "layout": {
    "columns": 2,
    "spacing": "normal",
    "width": "1200px"
  },
  "fields": [
    {
      "fieldId": "account_code",
      "fieldName": "Account Code",
      "componentType": "text",
      "dataType": "string",
      "sourceColumn": "ACCOUNT_CODE",
      "required": true,
      "maxLength": 20,
      "validation": {
        "pattern": "^[A-Z0-9-]+$",
        "message": "Only uppercase letters, numbers, and hyphens allowed"
      },
      "layout": {
        "row": 1,
        "column": 1,
        "width": "50%"
      }
    },
    {
      "fieldId": "account_name",
      "fieldName": "Account Name",
      "componentType": "text",
      "dataType": "string",
      "sourceColumn": "ACCOUNT_NAME",
      "required": true,
      "maxLength": 100,
      "layout": {
        "row": 1,
        "column": 2,
        "width": "50%"
      }
    },
    {
      "fieldId": "account_type",
      "fieldName": "Account Type",
      "componentType": "lov",
      "dataType": "string",
      "sourceColumn": "ACCOUNT_TYPE",
      "required": true,
      "lovConfig": {
        "type": "static",
        "values": [
          {"value": "ASSET", "label": "Asset"},
          {"value": "LIABILITY", "label": "Liability"},
          {"value": "EQUITY", "label": "Equity"},
          {"value": "REVENUE", "label": "Revenue"},
          {"value": "EXPENSE", "label": "Expense"}
        ]
      },
      "layout": {
        "row": 2,
        "column": 1,
        "width": "50%"
      }
    }
  ],
  "validations": [
    {
      "type": "page-level",
      "rule": "account_code must be unique",
      "message": "Account code already exists"
    }
  ],
  "buttons": [
    {
      "buttonId": "save",
      "label": "Save",
      "type": "primary",
      "action": "save",
      "position": "bottom-right"
    },
    {
      "buttonId": "cancel",
      "label": "Cancel",
      "type": "secondary",
      "action": "cancel",
      "position": "bottom-right"
    }
  ]
}
```

### Master-Detail Schema
```json
{
  "pageId": "PO-P001",
  "moduleName": "PO",
  "pageName": "Purchase Order Entry",
  "pageType": "master-detail",
  "version": "1.0",
  "master": {
    "table": "PO_HEADERS",
    "fields": [
      {
        "fieldId": "po_number",
        "fieldName": "PO Number",
        "componentType": "text",
        "sourceColumn": "PO_NUMBER",
        "required": true
      },
      {
        "fieldId": "vendor",
        "fieldName": "Vendor",
        "componentType": "lov",
        "sourceColumn": "VENDOR_ID",
        "required": true,
        "lovConfig": {
          "type": "table",
          "sourceTable": "VENDORS",
          "displayColumn": "VENDOR_NAME",
          "valueColumn": "VENDOR_ID"
        }
      }
    ]
  },
  "details": [
    {
      "tabId": "lines",
      "tabName": "Line Items",
      "table": "PO_LINES",
      "relationship": {
        "parentKey": "PO_HEADER_ID",
        "childKey": "PO_HEADER_ID"
      },
      "grid": {
        "columns": [
          {
            "columnId": "line_num",
            "header": "Line #",
            "sourceColumn": "LINE_NUMBER",
            "dataType": "number",
            "width": "80px",
            "sortable": true
          },
          {
            "columnId": "item",
            "header": "Item",
            "sourceColumn": "ITEM_ID",
            "dataType": "lov",
            "width": "200px",
            "editable": true,
            "lovConfig": {
              "sourceTable": "ITEMS",
              "displayColumn": "ITEM_NAME",
              "valueColumn": "ITEM_ID"
            }
          },
          {
            "columnId": "quantity",
            "header": "Quantity",
            "sourceColumn": "QUANTITY",
            "dataType": "number",
            "width": "100px",
            "editable": true
          }
        ],
        "features": {
          "filtering": true,
          "sorting": true,
          "pagination": true,
          "inlineEdit": true,
          "export": true
        }
      }
    }
  ]
}
```

---

## Sample Data Generation

### Auto-Generated Sample Data
For preview mode, system generates realistic sample data based on field types:

```json
{
  "sampleData": {
    "account_code": "1010-000-0000",
    "account_name": "Cash - Operating Account",
    "account_type": "ASSET",
    "active": true,
    "created_date": "2025-10-27",
    "balance": 125000.00
  }
}
```

**Generation Rules**:
- **Text**: Random company/person names
- **Number**: Random within min/max range
- **Date**: Recent dates
- **LOV**: Random selection from available values
- **Grid**: 5-10 sample rows

---

## AI Code Generation Integration

### How AI Uses the JSON

**Input**: Page definition JSON
**Output**: Complete working HTML/JavaScript/CSS page

**Generation Steps**:
1. **Parse JSON**: Read page structure
2. **Generate HTML**: Create form structure
3. **Generate CSS**: Style based on layout
4. **Generate JavaScript**:
   - Field validations
   - LOV population
   - Grid initialization
   - Event handlers
   - API calls
5. **Generate Backend**: API endpoints if needed

**Example Prompt to AI**:
```
Generate a complete ERP page based on this JSON definition:
[JSON here]

Requirements:
- Use our standard ERP CSS framework
- Include all validations
- Add proper error handling
- Generate sample API endpoints
- Include inline documentation
```

---

## Database Schema

### Tables Needed

#### PAGE_DEFINITIONS
```sql
CREATE TABLE PAGE_DEFINITIONS (
    PAGE_ID VARCHAR(20) PRIMARY KEY,
    MODULE_NAME VARCHAR(10) NOT NULL,
    PAGE_NAME VARCHAR(100) NOT NULL,
    PAGE_TYPE VARCHAR(20) NOT NULL, -- 'free-form', 'master-detail'
    BASE_TABLE VARCHAR(100),
    DEFINITION_JSON TEXT NOT NULL,
    VERSION VARCHAR(10),
    STATUS VARCHAR(20), -- 'draft', 'published', 'archived'
    CREATED_BY VARCHAR(50),
    CREATED_DATE TIMESTAMP,
    MODIFIED_BY VARCHAR(50),
    MODIFIED_DATE TIMESTAMP
);
```

#### PAGE_TEMPLATES
```sql
CREATE TABLE PAGE_TEMPLATES (
    TEMPLATE_ID VARCHAR(20) PRIMARY KEY,
    TEMPLATE_NAME VARCHAR(100) NOT NULL,
    TEMPLATE_TYPE VARCHAR(20) NOT NULL,
    DESCRIPTION TEXT,
    TEMPLATE_JSON TEXT NOT NULL,
    PREVIEW_IMAGE VARCHAR(200),
    CREATED_DATE TIMESTAMP
);
```

#### COMPONENT_LIBRARY
```sql
CREATE TABLE COMPONENT_LIBRARY (
    COMPONENT_ID VARCHAR(20) PRIMARY KEY,
    COMPONENT_NAME VARCHAR(50) NOT NULL,
    COMPONENT_TYPE VARCHAR(20) NOT NULL,
    ICON VARCHAR(50),
    DEFAULT_PROPERTIES TEXT,
    DESCRIPTION TEXT
);
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create Page Composer module in project management
- [ ] Design and create database tables
- [ ] Build basic page listing UI
- [ ] Create "New Page" wizard

### Phase 2: Free-Form Template (Week 2)
- [ ] Implement free-form page template
- [ ] Create table/column browser
- [ ] Build field property editor
- [ ] Add validation rules editor

### Phase 3: Visual Designer (Week 3)
- [ ] Implement drag-and-drop canvas
- [ ] Create component palette
- [ ] Build property panel
- [ ] Add layout management

### Phase 4: Master-Detail Template (Week 4)
- [ ] Implement master-detail template
- [ ] Create tab manager
- [ ] Build grid configurator
- [ ] Add relationship editor

### Phase 5: Preview & Export (Week 5)
- [ ] Implement live preview mode
- [ ] Create sample data generator
- [ ] Build JSON/XML export
- [ ] Add import functionality

### Phase 6: AI Integration (Week 6)
- [ ] Create code generation API
- [ ] Test AI-based page generation
- [ ] Refine JSON schema
- [ ] Document generation process

---

## Success Criteria

✅ **User can visually design a page in under 5 minutes**
✅ **Generated JSON is parseable by AI**
✅ **AI can generate working code from JSON in under 1 minute**
✅ **Preview mode shows realistic page layout**
✅ **Support for 100+ pages without performance issues**

---

## Future Enhancements

- **Workflow Designer**: Visual workflow builder
- **Report Designer**: Create custom reports
- **Dashboard Composer**: Build custom dashboards
- **Mobile Layout**: Responsive design options
- **Version Control**: Track page definition changes
- **Collaboration**: Multiple users editing simultaneously
- **Template Marketplace**: Share templates with community

---

**Document Version**: 1.0
**Created**: 2025-10-27
**Author**: Claude AI + Javeed
