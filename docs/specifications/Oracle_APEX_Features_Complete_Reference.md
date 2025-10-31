# Oracle APEX Features - Complete Reference Guide

## Document Purpose
This document provides a comprehensive analysis of Oracle Application Express (APEX) features, architecture, and components. This will serve as the foundation for building our ERP Page Composer with APEX-like capabilities.

**Version**: 1.0
**Date**: 2025-10-27
**Based on**: Oracle APEX 24.2 (Latest as of 2024-2025)

---

## Table of Contents
1. [APEX Architecture Overview](#apex-architecture-overview)
2. [Page Designer Interface](#page-designer-interface)
3. [Page Types](#page-types)
4. [Region Types](#region-types)
5. [Item Types](#item-types)
6. [Processes](#processes)
7. [Validations](#validations)
8. [Computations](#computations)
9. [Dynamic Actions](#dynamic-actions)
10. [Shared Components](#shared-components)
11. [Authorization & Security](#authorization--security)
12. [Templates & Themes](#templates--themes)
13. [Data Sources](#data-sources)
14. [Navigation](#navigation)
15. [AI Features (APEX 24.x)](#ai-features)
16. [Workflows](#workflows)
17. [Interactive Components](#interactive-components)

---

## 1. APEX Architecture Overview

### Core Concepts
Oracle APEX is a **low-code development platform** that enables developers to build enterprise applications rapidly using declarative components. It runs entirely in the Oracle Database and generates HTML, CSS, and JavaScript automatically.

### Architecture Layers
```
┌─────────────────────────────────────────┐
│     Web Browser (User Interface)        │
├─────────────────────────────────────────┤
│     Web Server (Apache/Tomcat/ORDS)    │
├─────────────────────────────────────────┤
│     APEX Engine (PL/SQL Logic)          │
├─────────────────────────────────────────┤
│     Oracle Database (Data & Metadata)   │
└─────────────────────────────────────────┘
```

### Development Philosophy
- **Declarative-First**: Build using wizards and properties, not code
- **SQL-Centric**: Direct integration with database tables and queries
- **Component-Based**: Reusable regions, items, and processes
- **Template-Driven**: Themes control the look and feel
- **Progressive Enhancement**: Start simple, add complexity as needed

---

## 2. Page Designer Interface

### Main Components

#### A. Three-Pane Layout
```
┌──────────────┬──────────────────────┬──────────────┐
│              │                      │              │
│  Rendering   │      Layout          │  Property    │
│  Tree        │      (Canvas)        │  Editor      │
│  (Left)      │      (Center)        │  (Right)     │
│              │                      │              │
└──────────────┴──────────────────────┴──────────────┘
```

#### B. Rendering Tree (Left Pane)
**Purpose**: Hierarchical view of all page components

**Structure**:
- Page
  - Page Rendering
    - Regions
      - Items
      - Buttons
    - Sub-regions
  - Page Processing
    - Validations
    - Processes
    - Branches
  - Shared Components
    - Breadcrumbs
    - Lists
    - Navigation

**Features**:
- ✅ Drag-and-drop to reorder
- ✅ Right-click context menus
- ✅ Search/filter components
- ✅ Copy/paste components
- ✅ Show/hide sections

#### C. Layout/Canvas (Center Pane)
**Purpose**: Visual representation of page layout

**Features**:
- ✅ WYSIWYG preview (approximate)
- ✅ Drag-and-drop from gallery
- ✅ Drag-and-drop to reorder
- ✅ Grid-based positioning
- ✅ Visual feedback (yellow highlight on drop)
- ✅ Responsive breakpoint preview
- ✅ Region sizing handles

**Display Modes**:
- Grid Layout: Shows exact positioning
- Component View: Shows hierarchy
- Preview Mode: Shows runtime appearance

#### D. Property Editor (Right Pane)
**Purpose**: Edit attributes of selected component

**Features**:
- ✅ Grouped properties (Identification, Settings, Source, etc.)
- ✅ Context-sensitive help
- ✅ Required fields marked with red triangle
- ✅ LOV pickers for predefined values
- ✅ Code editor for SQL/PL/SQL
- ✅ Quick picks for common values
- ✅ Search within properties
- ✅ Property inheritance indicators

**Property Groups**:
- Identification (Name, Type, Title)
- Layout (Position, Sequence, Parent Region)
- Source (SQL Query, Table, Static Content)
- Settings (Display properties, behavior)
- Validation (Required, format, constraints)
- Advanced (JavaScript, custom attributes)
- Help Text (inline help for end users)
- Security (Authorization schemes, conditions)

#### E. Toolbar (Top)
**Actions Available**:
- 📄 Create: Page items, regions, buttons, processes
- 💾 Save: Save page changes
- 🏃 Run: Execute page
- ↩️ Undo/Redo: History of changes
- 🔍 Find: Search page components
- 🎨 Theme Roller: Live theme customization
- ⚙️ Utilities: Import/export, delete page
- 👁️ View: Toggle panes, fullscreen mode

---

## 3. Page Types

### Overview
APEX provides page wizards to create different types of pages quickly.

### 3.1 Blank Page
**Description**: Empty page with no pre-built components

**Use Cases**:
- Custom dashboards
- Landing pages
- Completely custom layouts

**Default Components**: None (manually add regions/items)

---

### 3.2 Report Pages

#### Interactive Report
**Description**: Feature-rich report with built-in search, filtering, sorting, download

**Built-in Features**:
- ✅ Column sorting
- ✅ Search bar
- ✅ Column filters
- ✅ Column selection (hide/show)
- ✅ Highlighting rules
- ✅ Aggregations (sum, avg, count)
- ✅ Grouping
- ✅ Pivot mode
- ✅ Chart view
- ✅ Download (CSV, PDF, Excel)
- ✅ Save report layouts (private/public)
- ✅ Subscriptions (email reports)

**Source**: SQL Query

**When to Use**: General-purpose reports with end-user customization

#### Classic Report
**Description**: Simple SQL-based report

**Features**:
- ✅ Column headers
- ✅ Row templates
- ✅ Pagination
- ✅ CSV export
- ✅ Link columns

**When to Use**: Simple read-only reports, embedded reports

#### Faceted Search Report
**Description**: Report with left-side facets for filtering

**Components**:
- Faceted Search region (filters)
- Report/Cards region (results)

**When to Use**: E-commerce style filtering, catalog browsing

---

### 3.3 Form Pages

#### Form on Table
**Description**: Single-record form for insert/update/delete on one table

**Auto-Generated**:
- ✅ Form region with items for each column
- ✅ Create/Save/Delete buttons
- ✅ Automatic DML processing
- ✅ Validations for NOT NULL columns
- ✅ Primary key handling
- ✅ Audit columns (created_by, created_date)

**Wizard Options**:
- Include all columns or select specific
- Item types (text, select list, date picker)
- Primary key source (sequence, trigger, identity column)

#### Form on Table with Report
**Description**: Two-page application - report page + form page

**Pages Created**:
1. Report page: Lists all records with edit link
2. Form page: Edit single record

**Navigation**: Automatic bidirectional links

**When to Use**: Standard CRUD applications

#### Modal Dialog Form
**Description**: Form opens in popup overlay instead of new page

**Benefits**:
- ✅ No page navigation
- ✅ Context preserved
- ✅ Modern UX
- ✅ Mobile-friendly

#### Master-Detail Form
**Description**: One master record with multiple detail records

**Structure**:
- Master region (single record form)
- Detail region (grid or sub-form)
- Relationship handling (foreign keys)

**Example**: Order Header + Order Lines

**Wizard Creates**:
- Master form items
- Detail interactive grid
- Synchronization processes
- Parent-child relationship validation

---

### 3.4 Calendar Pages

#### Classic Calendar
**Description**: Month/week/day view of date-based data

**Data Requirements**:
- Date column (required)
- Display column (event title)
- Optional: Start/end time, color coding

**Views**:
- Month view
- Week view
- Day view
- List view

**Features**:
- ✅ Drag-and-drop events
- ✅ Resize events
- ✅ Click to create
- ✅ Color coding
- ✅ Event popups

---

### 3.5 Chart Pages

**Types Available**:
- Bar Chart
- Column Chart
- Line Chart
- Area Chart
- Pie/Donut Chart
- Scatter Plot
- Bubble Chart
- Range Chart
- Combo Chart
- Gantt Chart

**Data Source**: SQL Query

**Features**:
- ✅ Multiple series
- ✅ Drill-down links
- ✅ Tooltips
- ✅ Legends
- ✅ Animations
- ✅ Responsive sizing
- ✅ Download as image

---

### 3.6 Dashboard Pages

**Description**: Multi-region page with KPIs, charts, and summary data

**Common Components**:
- Region Display Selector (tabs)
- Charts
- Reports
- Static Content
- Badge Lists

---

### 3.7 Tree Page

**Description**: Hierarchical data displayed as expandable tree

**Data Requirements**:
- Hierarchical SQL (START WITH / CONNECT BY)
- Node ID
- Parent ID
- Display value

**Features**:
- ✅ Expand/collapse nodes
- ✅ Search tree
- ✅ Select node (fires event)
- ✅ Icons per node

---

### 3.8 Wizard Pages

**Description**: Multi-step process with progress indicator

**Structure**:
- Page 1: Step 1 inputs
- Page 2: Step 2 inputs
- Page 3: Step 3 inputs
- Page 4: Confirmation/completion

**Features**:
- ✅ Progress stepper
- ✅ Navigation buttons (Next, Previous, Submit)
- ✅ Session state management
- ✅ Validation per step

---

### 3.9 Login Page

**Description**: Authentication page

**Built-in Features**:
- ✅ Username/password fields
- ✅ Remember me checkbox
- ✅ Forgot password link
- ✅ Logo/branding
- ✅ Authentication scheme integration
- ✅ Password show/hide toggle
- ✅ Captcha integration

---

## 4. Region Types

Regions are containers for content on a page.

### 4.1 Form Region
**Purpose**: Display and edit single row of data

**Data Sources**:
- Table/View
- SQL Query
- PL/SQL Function
- REST Data Source
- Local Database

**Features**:
- ✅ Automatic item generation
- ✅ Lost update detection
- ✅ Row locking
- ✅ Audit columns

---

### 4.2 Interactive Report
(See Page Types section for details)

---

### 4.3 Interactive Grid
**Purpose**: Editable grid with Excel-like functionality

**Features**:
- ✅ Inline editing
- ✅ Add/delete rows
- ✅ Copy/paste from Excel
- ✅ Keyboard navigation (arrow keys, Tab)
- ✅ Aggregations (sum, count, avg)
- ✅ Sorting (multi-column)
- ✅ Filtering
- ✅ Cell highlighting
- ✅ Frozen columns
- ✅ Column reordering
- ✅ Save/load layouts
- ✅ Validation on cell change
- ✅ Master-detail support

**Editable Modes**:
- Cell-level editing
- Row-level editing
- Batch editing

---

### 4.4 Classic Report
Simple read-only report

---

### 4.5 Cards Region
**Purpose**: Display data as information tiles/cards

**Layout Options**:
- Grid (multiple cards per row)
- List (one card per row)
- Carousel (swipeable)

**Card Content**:
- Title
- Subtitle
- Body text
- Media (image/icon)
- Badges
- Actions (buttons)

**Use Cases**:
- Product catalogs
- Employee directories
- Task lists
- News feeds

---

### 4.6 Chart Region
(See Page Types section)

---

### 4.7 Tree Region
Hierarchical data display

---

### 4.8 List Region
**Purpose**: Display navigation or data as list

**List Types**:
- Unordered list (bullets)
- Ordered list (numbers)
- Badge list (inline badges)
- Links list
- Media list (with icons)

**Data Source**:
- Static list (shared component)
- SQL query

---

### 4.9 List View
**Purpose**: Mobile-optimized list for navigation

**Features**:
- ✅ Icon per item
- ✅ Badge count
- ✅ Supplemental info
- ✅ Chevron for drill-down
- ✅ Swipe actions

---

### 4.10 Static Content
**Purpose**: Display HTML, text, or container for items

**Use Cases**:
- Instructions
- Rich text content
- Layout container
- Placeholder regions

---

### 4.11 HTML (Legacy)
Static HTML content

---

### 4.12 Breadcrumb
Navigation trail showing page hierarchy

---

### 4.13 Calendar
(See Page Types section)

---

### 4.14 Map Region
**Purpose**: Display geographic data on map

**Map Types**:
- Points (markers)
- Lines
- Polygons
- Heatmap

**Providers**:
- Oracle Maps
- Google Maps
- MapBox

---

### 4.15 Timeline
**Purpose**: Display chronological events

**Styles**:
- Vertical timeline
- Horizontal timeline

**Content**:
- Date/time
- Title
- Description
- User/avatar

---

### 4.16 Tabular Form (Legacy)
Editable multi-row form (replaced by Interactive Grid)

---

### 4.17 Search Region (APEX 24.2+)
**Purpose**: Unified search across multiple data sources

**Features**:
- ✅ Search multiple tables simultaneously
- ✅ Vector search (Oracle 23ai)
- ✅ Semantic similarity search
- ✅ Relevance ranking
- ✅ Highlighted results
- ✅ Facet filters

---

### 4.18 Faceted Search
**Purpose**: Filter data using sidebar facets

**Facet Types**:
- Checkbox
- Radio
- Range slider
- Date range
- Input field

**Use Cases**:
- E-commerce filtering
- Document search
- Advanced data exploration

---

### 4.19 Smart Filters (APEX 24.x)
Enhanced filtering with suggestions and autocomplete

---

### 4.20 Help Text Region
Display context-sensitive help

---

### 4.21 URL Region
**Purpose**: Embed external content via iframe

**Sources**:
- Website URL
- PDF file
- Video embed

---

### 4.22 Column Toggle Report
Mobile-responsive report where users can show/hide columns

---

### 4.23 Reflow Report
Mobile-responsive report that stacks columns vertically

---

### 4.24 JET Chart (Oracle JET)
Advanced charting using Oracle JavaScript Extension Toolkit

---

### 4.25 Plug-in Regions
Custom regions created by developers or downloaded from APEX community

**Examples**:
- D3 visualizations
- Custom grids
- Gantt charts
- Kanban boards

---

## 5. Item Types

Items are form fields that store page and session state.

### 5.1 Text Field
**Description**: Single-line text input

**Properties**:
- Max length
- Placeholder text
- Autocomplete (on/off)
- Trim spaces
- Submit on Enter

**Use Cases**: Name, email, ID, short text

---

### 5.2 Textarea
**Description**: Multi-line text input

**Properties**:
- Rows/columns
- Max length
- Character counter
- Resizable

**Use Cases**: Comments, descriptions, notes

---

### 5.3 Number Field
**Description**: Numeric input

**Properties**:
- Min/max value
- Step increment
- Decimal places
- Format mask (currency, percentage)
- Thousands separator

**Use Cases**: Quantity, price, age

---

### 5.4 Date Picker (APEX 24.2+)
**Description**: New modern calendar selector

**Features**:
- ✅ Fast performance
- ✅ Accessible (ARIA)
- ✅ Lightweight
- ✅ Keyboard navigation
- ✅ Date range selection
- ✅ Min/max dates
- ✅ Disabled dates
- ✅ Multiple date formats

---

### 5.5 Select List (Dropdown)
**Description**: Single-selection from list

**Data Sources**:
- Static values
- SQL query (LOV)
- Shared LOV component

**Properties**:
- Display null option
- Null display text
- Page items to submit (cascading LOV)
- Redirect to URL on change

**Variants**:
- Native select
- Select2 (enhanced with search)
- Popup LOV (modal dialog)

---

### 5.6 Shuttle
**Description**: Move items between two lists (available ↔ selected)

**Use Cases**: Multi-select with visual representation

---

### 5.7 Radio Group
**Description**: Single selection from visible options

**Layout**:
- Vertical
- Horizontal

**Data Source**: Static or LOV

---

### 5.8 Checkbox
**Description**: Single yes/no toggle

**Values**:
- Checked value (e.g., "Y")
- Unchecked value (e.g., "N")

---

### 5.9 Checkbox Group
**Description**: Multiple selection checkboxes

**Use Cases**: Select multiple categories, features

---

### 5.10 Switch
**Description**: Modern toggle switch (on/off)

**Use Cases**: Boolean settings, active/inactive flags

---

### 5.11 Star Rating
**Description**: Visual rating selector (1-5 stars)

**Properties**:
- Number of stars (default 5)
- Precision (whole, half, quarter)
- Read-only mode

---

### 5.12 Slider
**Description**: Visual numeric selector

**Properties**:
- Min/max value
- Step
- Display value label

---

### 5.13 Color Picker
**Description**: Visual color selector

**Formats**:
- Hex (#FF5733)
- RGB
- HSL

---

### 5.14 Password
**Description**: Obscured text input

**Features**:
- Show/hide toggle
- Strength indicator (optional)
- Autocomplete (off by default)

---

### 5.15 File Browse (Upload)
**Description**: File upload control

**Properties**:
- Accepted file types
- Max file size
- Multiple files
- Storage type (table, APEX_APPLICATION_TEMP_FILES)

**NEW: Image Upload (APEX 23.2+)**
- Image preview
- Cropping
- Drag-and-drop

---

### 5.16 Rich Text Editor
**Description**: WYSIWYG editor for formatted content

**Features**:
- Bold, italic, underline
- Lists (ordered/unordered)
- Links
- Images
- Tables
- Source code view

**Editor**: CKEditor

---

### 5.17 QR Code Generator (APEX 23.2+)
**Description**: Display data as QR code

**Use Cases**:
- URLs
- Contact info (vCard)
- WiFi credentials

---

### 5.18 Combobox (APEX 23.2+)
**Description**: Combination of text input + dropdown

**Features**:
- Type to search
- Select from list
- Add new values (optional)

---

### 5.19 Display Only

**Types**:
- Display Only: Shows item value as text
- Display Image: Shows image from URL or BLOB
- Display Only (Saves State): Display-only but retains value in session

---

### 5.20 Hidden
**Description**: Stores value without displaying

**Use Cases**:
- Primary keys
- State management
- Passing parameters

---

### 5.21 Popup LOV (List of Values)
**Description**: Modal dialog for selecting value

**Features**:
- Search
- Pagination
- Multiple columns
- Filters
- Return multiple values

**When to Use**: Large datasets, complex selection criteria

---

### 5.22 Autocomplete
**Description**: Text field with suggestions as you type

**Data Source**: SQL query, static, REST API

**Properties**:
- Min characters to trigger
- Max results
- Display/return columns
- Match type (contains, starts with)

---

### 5.23 Cascading LOV
**Description**: Dependent dropdown (parent-child relationship)

**Example**:
- Country (parent) → State (child) → City (grandchild)

**Configuration**:
- Parent item
- WHERE clause with bind variables

---

### 5.24 Plug-in Items
Custom items created by community or developers

**Popular Plug-ins**:
- Apex Select2
- Date Range Picker
- Input Mask
- Signature pad
- Markdown editor

---

## 6. Processes

Processes execute PL/SQL logic or perform actions when a page is submitted or loaded.

### Process Types

#### 6.1 Form - Automatic Row Processing (DML)
**Description**: Auto-generated insert/update/delete for form

**Generated Automatically**: When creating Form on Table

**Actions**:
- Fetch row (on page load)
- Process row (on submit - INSERT/UPDATE based on PK)
- Delete row (on Delete button)

#### 6.2 Execute Code
**Description**: Run custom PL/SQL code

**When to Use**:
- Custom business logic
- Call stored procedures
- Complex calculations
- Data transformations

**Example**:
```sql
BEGIN
    -- Calculate order total
    :P10_TOTAL := :P10_QUANTITY * :P10_UNIT_PRICE;

    -- Apply discount
    IF :P10_DISCOUNT_PCT > 0 THEN
        :P10_TOTAL := :P10_TOTAL * (1 - :P10_DISCOUNT_PCT/100);
    END IF;
END;
```

#### 6.3 Close Dialog
**Description**: Close modal dialog page

**Options**:
- Return items to parent page
- Refresh parent region

#### 6.4 Clear Session State
**Description**: Clear cached values

**Options**:
- Current page items
- Specific items
- All items in application

#### 6.5 Execute Server-side Code (AJAX)
**Description**: Run PL/SQL asynchronously

**Use Cases**:
- Populate cascading LOV
- Validate data without submitting
- Fetch data for dynamic region

#### 6.6 Send Email
**Description**: Send email via APEX_MAIL API

**Configuration**:
- From/To/CC/BCC
- Subject
- Body (plain text or HTML)
- Attachments

#### 6.7 Invoke API
**Description**: Call REST API or Web Service

**Methods**: GET, POST, PUT, DELETE

**Configuration**:
- URL
- Headers
- Request body
- Response handling

#### 6.8 Run Page Submission Process Only
**Description**: Execute SQL DML (INSERT/UPDATE/DELETE)

#### 6.9 Data Manipulation (SQL)
**Description**: Execute single DML statement

**Example**:
```sql
UPDATE orders
   SET status = 'APPROVED'
     , approved_by = :APP_USER
     , approved_date = SYSDATE
 WHERE order_id = :P10_ORDER_ID;
```

### Process Timing Points

**Page Load (Rendering)**:
- Before Header
- After Header
- Before Regions
- After Regions
- Before Footer
- After Footer

**Page Submit (Processing)**:
- Before Validations
- After Validations
- Processing
- After Processing

**AJAX Callback**:
- On Demand

---

## 7. Validations

Validations ensure data quality before processing.

### Validation Types

#### 7.1 Not Null
**Description**: Ensures item has a value

**Message**: "Must have value"

#### 7.2 Item is Numeric
**Description**: Validates number format

#### 7.3 Item is Integer
**Description**: Validates whole number

#### 7.4 Item is in Range
**Description**: Min/max check

**Example**: Age between 18 and 65

#### 7.5 Item is Date
**Description**: Validates date format

**Format Mask**: DD-MON-YYYY, MM/DD/YYYY, etc.

#### 7.6 Regular Expression
**Description**: Pattern matching

**Examples**:
- Email: `^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$`
- Phone: `^\d{3}-\d{3}-\d{4}$`
- SSN: `^\d{3}-\d{2}-\d{4}$`

#### 7.7 PL/SQL Function Returning Boolean
**Description**: Custom validation logic

**Return**: TRUE (valid) or FALSE (invalid)

**Example**:
```sql
DECLARE
    l_count NUMBER;
BEGIN
    SELECT COUNT(*)
      INTO l_count
      FROM employees
     WHERE email = :P10_EMAIL
       AND employee_id != :P10_EMPLOYEE_ID;

    RETURN l_count = 0; -- TRUE if email unique
END;
```

#### 7.8 PL/SQL Expression
**Description**: Simple boolean expression

**Example**: `:P10_START_DATE < :P10_END_DATE`

#### 7.9 SQL - Rows Returned
**Description**: Validate by querying database

**Query Returns Rows**: INVALID
**Query Returns No Rows**: VALID

**Example** (Check for duplicate):
```sql
SELECT 1
  FROM customers
 WHERE customer_name = :P10_NAME
   AND customer_id != :P10_ID
```

#### 7.10 Item Not Null (Row Level)
For tabular forms/interactive grids

#### 7.11 Compare Two Items
**Description**: Ensure two items match

**Example**: Password confirmation

#### 7.12 Item Length
**Description**: Character count validation

**Options**:
- Exact length
- Min length
- Max length
- Between min and max

### Validation Timing
- On Submit (after button click)
- On Blur (when item loses focus) - **Inline validation**
- On Demand (AJAX)

### Error Display
- Inline with field (next to item)
- Notification (page-level message)
- Both

---

## 8. Computations

Computations assign values to items during page rendering or processing.

### Computation Types

#### 8.1 SQL Query (Single Return Value)
**Example**:
```sql
SELECT full_name
  FROM employees
 WHERE employee_id = :P10_EMPLOYEE_ID
```

#### 8.2 SQL Query (Return Colon Separated Value)
Multiple values separated by colon

#### 8.3 PL/SQL Function Body
**Example**:
```sql
DECLARE
    l_total NUMBER;
BEGIN
    l_total := :P10_SUBTOTAL + :P10_TAX - :P10_DISCOUNT;
    RETURN l_total;
END;
```

#### 8.4 PL/SQL Expression
**Example**: `:P10_QUANTITY * :P10_UNIT_PRICE`

#### 8.5 Static Assignment
Assign fixed value

**Example**: `NEW` for status on insert

#### 8.6 Item Value
Copy value from another item

### Computation Points
- Before Header
- Before Regions
- Before Footer
- After Submit
- Before Validations
- After Validations

---

## 9. Dynamic Actions

Dynamic Actions provide client-side interactivity without JavaScript coding.

### Event Types

#### Browser Events
- Click
- Double Click
- Change
- Get Focus (focus)
- Lose Focus (blur)
- Key Press
- Key Down
- Key Up
- Mouse Enter
- Mouse Leave
- Mouse Move

#### Framework Events
- Page Load
- Before Refresh
- After Refresh
- Before Region Type Initialization
- After Region Type Initialization

#### Component Events
- Selection Change (for IR/IG)
- Add Row (Interactive Grid)
- Delete Row (Interactive Grid)
- Dialog Closed (modal dialog)

#### Custom Events
Define your own events

### Action Types

#### 9.1 Show
**Description**: Make element visible

**Affected Elements**:
- Item
- Region
- Button
- jQuery selector

**Options**:
- Animation (fade, slide, none)
- Duration (fast, slow, custom ms)

#### 9.2 Hide
**Description**: Make element invisible

#### 9.3 Enable
**Description**: Make item editable

#### 9.4 Disable
**Description**: Make item read-only

#### 9.5 Set Value
**Description**: Assign value to item

**Value Sources**:
- Static value
- JavaScript expression
- SQL Query
- PL/SQL Function
- Item value
- Dialog return item

#### 9.6 Execute JavaScript Code
**Description**: Run custom JavaScript

**Example**:
```javascript
console.log('Button clicked!');
apex.message.alert('Processing...');
```

#### 9.7 Execute PL/SQL Code
**Description**: Run server-side code via AJAX

**Options**:
- Items to Submit (send to server)
- Items to Return (get back from server)
- Show Spinner (loading indicator)

#### 9.8 Submit Page
**Description**: Submit form to server

**Options**:
- Request (button value)
- Show Processing (spinner)

#### 9.9 Cancel Event
**Description**: Prevent default browser behavior

**Example**: Prevent form submit on Enter key

#### 9.10 Refresh
**Description**: Reload region data

**Use Cases**:
- Refresh report after insert
- Reload chart after filter change
- Update LOV after dependent change

#### 9.11 Clear
**Description**: Clear item value

#### 9.12 Set Focus
**Description**: Move cursor to item

#### 9.13 Alert
**Description**: Show alert dialog

#### 9.14 Confirm
**Description**: Show confirmation dialog

**Example**: "Are you sure you want to delete?"

#### 9.15 Execute Server-side Code
AJAX call without page submit

#### 9.16 Generate Text with AI (APEX 24.2+)
**Description**: Call AI to generate text

**Use Cases**:
- Auto-complete descriptions
- Generate summaries
- Translate text

#### 9.17 Navigate to URL
**Description**: Redirect to page/URL

#### 9.18 Scroll to Element
**Description**: Smooth scroll to region/item

#### 9.19 Add Class
**Description**: Add CSS class to element

**Example**: Highlight invalid fields with `error` class

#### 9.20 Remove Class
**Description**: Remove CSS class

#### 9.21 Set Style
**Description**: Change CSS properties

**Example**: `background-color: red; font-weight: bold;`

#### 9.22 Resize
**Description**: Change element dimensions

#### 9.23 Send AJAX Request
**Description**: Custom AJAX to Application Process

#### 9.24 Close Dialog
**Description**: Close modal dialog

#### 9.25 Open Region
**Description**: Expand collapsed region

#### 9.26 Close Region
**Description**: Collapse region

#### 9.27 Plug-in Actions
Custom actions from plug-ins

### True/False Actions
Dynamic Actions can have **True Actions** (when event fires) and **False Actions** (else condition)

**Example**:
```
Event: Change on P10_COUNTRY
Condition: Value = 'USA'
TRUE: Show P10_STATE
FALSE: Hide P10_STATE
```

---

## 10. Shared Components

Reusable elements across the application.

### 10.1 Lists of Values (LOVs)

**Types**:

#### Static LOV
**Definition**: Hardcoded values

**Example**:
```
Display        Return
--------       ------
Active         A
Inactive       I
Pending        P
```

#### Dynamic LOV (SQL Query)
**Definition**: Query from database

**Example**:
```sql
SELECT department_name AS d,
       department_id AS r
  FROM departments
 ORDER BY department_name
```

*d = display, r = return*

#### Cascading LOV
Parent-child relationship

**Parent**: P10_COUNTRY
**Child Query**:
```sql
SELECT state_name AS d,
       state_code AS r
  FROM states
 WHERE country_code = :P10_COUNTRY
 ORDER BY state_name
```

### 10.2 Lists

**Purpose**: Navigation menus, tabs, sidebar menus

**List Entries**:
- Label
- Target (page, URL)
- Icon
- Image
- Conditions (when to show)
- Authorization

**List Types (Templates)**:
- Navigation Menu (sidebar)
- Navigation Bar (top menu)
- Tabs
- Breadcrumb
- Badge List
- Media List
- Links List

### 10.3 Breadcrumbs

**Purpose**: Navigation trail (Home > Admin > Users > Edit)

**Hierarchy**:
- Entry 1: Home → Page 1
- Entry 2: Customers → Page 10
- Entry 3: Edit Customer → Page 20

**Dynamic Breadcrumb**: Based on page parameters

### 10.4 Navigation Bar

**Purpose**: Top-right menu (user menu, logout, settings)

**Default Entries**:
- User name (display only)
- Logout
- Settings
- Help

### 10.5 Navigation Menu

**Purpose**: Sidebar/main menu

**Structure**:
- Parent entries (headers)
- Child entries (pages)
- Nested sub-menus

**Properties**:
- Icon
- Badge (count, status)
- Authorization
- Condition

### 10.6 Templates

**Purpose**: Control HTML structure of components

**Template Types**:
- Page Templates (HTML structure)
- Region Templates (region container)
- Report Templates (report layout)
- List Templates (list rendering)
- Label Templates (item label)
- Button Templates (button style)
- Breadcrumb Templates
- Calendar Templates
- Popup LOV Templates

**Substitution Strings**: `#REGION_STATIC_ID#`, `#TITLE#`, `#BODY#`

### 10.7 Themes

**Purpose**: Collection of templates for consistent look

**APEX Built-in Themes**:
- Universal Theme (default, modern, responsive)

**Theme Styles**:
- Vita (default)
- Vita - Slate
- Vita - Dark
- Vita - Red
- Custom styles (Theme Roller)

### 10.8 Theme Roller

**Purpose**: Live theme customization

**Customizable**:
- Primary color
- Accent color
- Body background
- Header background
- Button styles
- Font family
- Border radius
- Shadows

**Output**: Custom CSS

### 10.9 Application Items

**Purpose**: Global variables (session-level)

**Example**: `G_USER_ROLE`, `G_FISCAL_YEAR`

**Scope**: Entire application

### 10.10 Application Processes

**Purpose**: Shared logic executed at application level

**Timing**:
- On New Session (login)
- On Logout
- Before Header
- After Footer
- On Demand (AJAX)

**Use Cases**:
- Load user preferences
- Set global variables
- Audit logging

### 10.11 Build Options

**Purpose**: Feature flags (enable/disable features)

**Example**:
- DEBUG_MODE
- SHOW_ADMIN_FEATURES

**Status**: Include / Exclude

**Applied To**: Pages, regions, items, buttons

### 10.12 Authorization Schemes

**Purpose**: Security checks (access control)

**Types**:

#### Exists SQL Query
**Example**:
```sql
SELECT 1
  FROM user_roles
 WHERE username = :APP_USER
   AND role = 'ADMIN'
```

#### PL/SQL Function Returning Boolean
**Example**:
```sql
RETURN APEX_UTIL.GET_AUTHENTICATION_RESULT = APEX_AUTHENTICATION.SUCCESS;
```

#### Is in Role or Group
Check LDAP/SSO role

**Applied To**:
- Application
- Page
- Region
- Button
- List entry
- Tab

### 10.13 Build Options

Include/exclude features based on build settings

### 10.14 Security Attributes

Global security settings

### 10.15 User Interface Attributes

Global UI settings

---

## 11. Authorization & Security

### 11.1 Authentication Schemes

**Purpose**: Verify user identity

**Built-in Schemes**:
- Application Express Accounts (APEX workspace users)
- Database Accounts (Oracle DB users)
- LDAP Directory
- Social Sign-On (Google, Facebook, Oracle)
- SSO (Single Sign-On)
- No Authentication (public)
- Custom (PL/SQL)

**Login Process**:
1. User enters credentials
2. Authentication scheme validates
3. Session established
4. User redirected to home page

### 11.2 Authorization Schemes
(See Shared Components section)

### 11.3 Session Management

**Session State**:
- Stored in database tables
- Keyed by session ID
- Cached item values
- User context

**Session Protection**:
- Checksum (URL tampering prevention)
- Rejoin sessions (only from same IP)
- Maximum session length
- Idle timeout

### 11.4 Input Protection

**Cross-Site Scripting (XSS) Protection**:
- Automatic HTML escaping
- Restricted item display
- Item security attribute

**SQL Injection Protection**:
- Bind variables (automatic)
- No string concatenation in SQL

### 11.5 Access Control

**Purpose**: Restrict access based on roles

**Roles**:
- Administrator
- Contributor
- Reader

**Implementation**:
- Authorization schemes
- Page authorization
- Button/region conditions

### 11.6 Page Access Protection

**Options**:
- Unrestricted (public)
- Arguments Must Have Checksum
- No Arguments Allowed
- No URL Access

---

## 12. Templates & Themes

### 12.1 Universal Theme

**Purpose**: Default responsive theme

**Features**:
- ✅ Mobile-first design
- ✅ Responsive breakpoints
- ✅ Accessibility (WCAG 2.1)
- ✅ Modern UI components
- ✅ Customizable with Theme Roller
- ✅ Icon library (Font APEX, Font Awesome)

### 12.2 Page Templates

**Types**:
- Standard
- Modal Dialog
- Wizard Modal
- Left Side Column
- Right Side Column
- Left and Right Side Columns

**Components**:
- Header
- Navigation menu
- Breadcrumb
- Body
- Footer
- Inline dialog
- Success message
- Error notification

### 12.3 Region Templates

**Display Types**:
- Standard
- Blank with Attributes
- Tabs Container
- Carousel Container
- Collapsible
- Hero
- Inline Dialog

### 12.4 Report Templates

**Layouts**:
- Standard
- Value Attribute Pairs
- Badge List
- Media List
- Content Row
- Search Results
- Timeline

### 12.5 List Templates

**Styles**:
- Navigation Menu
- Top Navigation Menu
- Navigation Bar
- Wizard Progress
- Badge List
- Media List
- Cards

### 12.6 Button Templates

**Styles**:
- Text
- Icon
- Text with Icon
- Hot (primary action)
- Danger (destructive)

**Sizes**:
- Large
- Normal
- Small
- Tiny

### 12.7 Item Label Templates

**Options**:
- Above item
- Left of item (inline)
- Hidden
- Optional
- Required

### 12.8 Responsive Breakpoints

**Breakpoints**:
- 640px: Mobile
- 768px: Tablet
- 1024px: Laptop
- 1280px: Desktop

**Region Display**:
- Show/hide per breakpoint
- Responsive column spans

---

## 13. Data Sources

### 13.1 Local Database (SQL Query)

**Standard approach**: Direct query against database tables

**Example**:
```sql
SELECT employee_id,
       first_name,
       last_name,
       email,
       salary
  FROM employees
 WHERE department_id = :P10_DEPT_ID
 ORDER BY last_name
```

### 13.2 Table / View

**Simplest form**: Map directly to table

**Auto DML**: Automatic insert/update/delete

### 13.3 PL/SQL Function Returning SQL Query

**Purpose**: Dynamic SQL generation

**Example**:
```sql
RETURN 'SELECT * FROM ' || :P10_TABLE_NAME || ' WHERE status = ''ACTIVE''';
```

### 13.4 REST Data Source (APEX 23.x+)

**Purpose**: Integrate with REST APIs

**Configuration**:
- Base URL
- Authentication (OAuth 2, Basic, Custom)
- Endpoint paths
- Parameters
- Response parsing

**Supported Operations**:
- GET (fetch)
- POST (create)
- PUT/PATCH (update)
- DELETE (remove)

**Use Cases**:
- Fusion Apps integration
- Third-party APIs (Salesforce, Stripe)
- Microservices

**NEW: Fusion Apps Support (APEX 23.2)**
- Query Fusion Apps REST APIs
- Insert/update/delete Fusion Apps data
- Direct integration with Oracle Cloud ERP/HCM

### 13.5 JSON Data Source (APEX 24.2+)

**Purpose**: Work with JSON data directly

**Sources**:
- Table with JSON columns
- Oracle 23ai Duality Views
- JSON Collection Tables
- JSON Collection Views

**Features**:
- Parse JSON paths
- Map to regions
- Auto-generate forms from JSON

### 13.6 Web Source Module (Legacy)

**Purpose**: SOAP Web Services

**Configuration**:
- WSDL URL
- Operation
- Input parameters
- SOAP envelope

### 13.7 Plugin Data Source

Custom data sources created by developers

---

## 14. Navigation

### 14.1 Page Navigation

**Methods**:
- Direct link (anchor tag)
- Button with page target
- Dynamic Action (Navigate to URL)
- Branch (after processing)
- JavaScript: `apex.navigation.redirect()`

**URL Syntax**:
```
f?p=APP_ID:PAGE_ID:SESSION::REQUEST:ITEM_NAME:ITEM_VALUE
```

**Example**:
```
f?p=100:20:&SESSION.::EDIT:P20_ID:500
```

### 14.2 Breadcrumbs
(See Shared Components section)

### 14.3 Navigation Menu
(See Shared Components section)

### 14.4 Tabs

**Types**:
- Standard Tabs (region template)
- Tab Set (page-level component)

**Configuration**:
- Tab label
- Target page
- Current tab indicator

### 14.5 Navigation Bar
(See Shared Components section)

### 14.6 Branches

**Purpose**: Redirect after page processing

**Branch Types**:
- Page or URL (redirect)
- Page in this application
- URL redirect
- Function returning URL

**Branch Points**:
- After Processing
- After Submit
- Before Computation
- Before Validations
- After Validations

**Example**:
```
After successful insert, branch to:
Page: 20
Set Items: P20_ID = :P10_NEW_ID
```

---

## 15. AI Features (APEX 24.x)

### 15.1 APEX AI Assistant (APEX 24.1)

**Purpose**: Conversational AI development companion

**Capabilities**:
- Generate SQL queries
- Optimize SQL
- Explain SQL
- Debug SQL errors
- Generate PL/SQL code
- Write JavaScript
- Create HTML/CSS
- Generate app blueprints
- Create pages from description

**Usage**:
- Sidebar panel in Page Designer
- Natural language input
- Code suggestions
- Inline help

**Example Prompts**:
- "Create a report showing top 10 customers by revenue"
- "Write validation to check if email is unique"
- "Generate chart for sales by month"

### 15.2 AI Integration in Applications (APEX 24.1)

**Purpose**: Add AI to your own apps

**Configuration**:
- AI Provider (OpenAI, Cohere, Oracle Generative AI)
- API Key
- Model selection

**APEX_AI API**:
```sql
DECLARE
    l_response CLOB;
BEGIN
    l_response := APEX_AI.GENERATE(
        p_provider => 'OpenAI',
        p_prompt   => 'Summarize this text: ' || :P10_INPUT,
        p_model    => 'gpt-4'
    );
    :P10_OUTPUT := l_response;
END;
```

**Dynamic Action**: Generate Text with AI (APEX 24.2)

**Use Cases**:
- Auto-complete descriptions
- Generate summaries
- Sentiment analysis
- Translation
- Content recommendations

### 15.3 Vector Search (APEX 24.2 + Oracle 23ai)

**Purpose**: Semantic similarity search

**Configuration**:
- AI Configuration (embeddings model)
- Vector index on table
- Search Region with Vector Search type

**Use Cases**:
- Find similar documents
- Semantic product search
- Knowledge base search

**Example**:
User searches "laptop for programming"
Returns: "High-performance workstation", "Developer notebook", "Coding computer"

(Traditional keyword search would miss these)

### 15.4 RAG (Retrieval-Augmented Generation)

**Purpose**: AI with custom knowledge base

**Setup**:
1. Create AI Configuration
2. Add RAG data sources (tables, docs)
3. Generate embeddings
4. Query with context

**Use Cases**:
- Customer support chatbots
- Internal documentation assistant
- Product recommendations

---

## 16. Workflows (APEX 23.2+)

### 16.1 Workflow Designer

**Purpose**: Visual workflow automation

**Interface**:
- Drag-and-drop canvas
- Activity palette
- Connection lines

**Activities**:
- Human Task (approval)
- Invoke API (REST call)
- Execute Code (PL/SQL)
- Switch (conditional routing)
- Send Mail
- Wait
- Start
- End

### 16.2 Workflow Features

**Conditional Routing**:
```
If amount > 10000:
    → Manager Approval
Else:
    → Auto-approve
```

**Human Approvals**:
- Task assignment (user, role, group)
- Email notification
- Task inbox
- Approve/reject actions
- Comments

**REST API Integration**:
- Call external services
- Send webhooks
- Microservices orchestration

**Vacation Rules (APEX 24.1)**:
- Substitute approvers during absence
- Date range
- Delegation rules

### 16.3 Workflow Diagram Region (APEX 24.1)

**Purpose**: Embed workflow status in app

**Display**:
- Current step highlighted
- Completed steps (green)
- Pending steps (grey)
- Progress indicator

**Use Cases**:
- Order approval status
- Document review process
- Onboarding checklist

---

## 17. Interactive Components

### 17.1 Interactive Report (IR)

**End-User Features**:
- Column Sort (click header)
- Search (keyword across all columns)
- Filter (per-column filters)
- Row Actions (edit, delete, custom)
- Control Break (grouping)
- Aggregations (sum, avg, count, max, min)
- Compute (calculated columns)
- Highlight Rules (conditional formatting)
- Chart View (pivot chart)
- Group By (pivot table)
- Flashback (historical data)
- Download (CSV, HTML, Email, PDF, Excel)
- Subscription (scheduled email)
- Save Report (named filters)

**Developer Features**:
- Column link to page/URL
- Custom display (HTML expression, PL/SQL)
- Conditional display
- Icon column
- Download formats

### 17.2 Interactive Grid (IG)

**End-User Features**:
- All Interactive Report features PLUS:
- Inline editing (cell-level)
- Add row
- Delete row
- Copy/paste from Excel
- Keyboard navigation
- Multiple row selection
- Undo/redo edits
- Aggregate view
- Save layout

**Developer Features**:
- Editable columns
- LOV in cells
- Validations (client + server)
- Master-detail (synchronized grids)
- Toolbar buttons (custom actions)
- Selection actions (process selected)

**Edit Modes**:
- Row edit (single row form)
- Cell edit (inline)
- Batch edit (edit multiple, save all)

### 17.3 Cards Region

**Layout Modes**:
- Grid (responsive columns)
- List (stacked)
- Carousel (swipe)
- Masonry (Pinterest-style)

**Card Content**:
- Primary key (hidden)
- Title
- Subtitle
- Body
- Media (image/icon)
- Badges (status, count)
- Actions (buttons)

**User Actions**:
- Click to drill down
- Swipe (carousel mode)
- Expand/collapse

### 17.4 Faceted Search

**Facet Types**:
- Checkbox (multiple selection)
- Radio (single selection)
- Range Slider (numeric range)
- Date Range
- Input Field (text search)

**Configuration**:
- Data source (SQL)
- Facet label
- Display order
- Collapsed by default

**User Experience**:
- Check facet → Results filter instantly
- Multiple facets combine (AND logic)
- Clear all filters button

### 17.5 Tree

**Features**:
- Expand/collapse nodes
- Lazy loading (load children on expand)
- Search tree
- Select node (triggers event)
- Icons per level
- Tooltip on hover

**Data Structure**:
```sql
SELECT id, parent_id, label, icon
  FROM tree_data
START WITH parent_id IS NULL
CONNECT BY PRIOR id = parent_id
```

### 17.6 Calendar

**Views**:
- Month
- Week
- Day
- List

**Event Handling**:
- Click event → Navigate to detail page
- Drag event → Update date (triggers AJAX)
- Resize event → Update duration
- Create event (click on blank)

**Customization**:
- Color coding (by status, priority)
- All-day events
- Multi-day events
- Recurring events

---

## Summary: APEX Core Principles

### 1. **Declarative Development**
Build with wizards and properties, not hand-coding.

### 2. **SQL-Centric**
Everything starts with SQL queries. The database is the foundation.

### 3. **Component Reusability**
Shared components (LOVs, templates, lists) avoid duplication.

### 4. **Progressive Disclosure**
Start simple (use defaults), add complexity as needed (customize properties).

### 5. **Template-Driven UI**
Themes and templates control appearance. Change theme, change entire app style.

### 6. **Session State Management**
APEX automatically manages item values across pages.

### 7. **Security by Default**
Built-in protection against XSS, SQL injection, CSRF.

### 8. **Rapid Prototyping**
Create functional prototype in hours, refine over time.

### 9. **Mobile-First & Responsive**
Universal Theme is responsive out-of-the-box.

### 10. **Extensibility**
Plug-ins allow unlimited custom functionality.

---

## APEX Development Workflow

```
1. Create Application
   ↓
2. Define Data Sources (tables, REST APIs)
   ↓
3. Create Pages (wizards)
   ↓
4. Add Regions (reports, forms, charts)
   ↓
5. Add Items (inputs)
   ↓
6. Define Processes (DML, custom logic)
   ↓
7. Add Validations (data quality)
   ↓
8. Configure Dynamic Actions (interactivity)
   ↓
9. Set Authorization (security)
   ↓
10. Customize Theme (branding)
   ↓
11. Test & Deploy
```

---

## APEX vs Traditional Development

| Aspect | Traditional (HTML/JS/Backend) | Oracle APEX |
|--------|-------------------------------|-------------|
| **Development Speed** | Weeks/months | Hours/days |
| **Code Volume** | Thousands of lines | Minimal (declarative) |
| **UI Framework** | Manual integration | Built-in (Universal Theme) |
| **Database Integration** | ORM, APIs | Direct SQL |
| **Security** | Manual implementation | Built-in |
| **Responsive Design** | Media queries, frameworks | Automatic |
| **Deployment** | Complex (app server, DB, web server) | Single database |
| **Maintenance** | High | Low |
| **Learning Curve** | Steep (HTML, CSS, JS, backend language, DB) | Moderate (SQL + APEX concepts) |

---

## APEX Limitations

### 1. Database Dependency
Must use Oracle Database (11g+). Cannot use MySQL, PostgreSQL, etc.

### 2. Complexity for Highly Custom UI
Very custom designs may require heavy template modification.

### 3. Learning Curve for Advanced Features
Workflows, plug-ins, advanced customization require expertise.

### 4. Performance at Scale
Very high-volume applications (millions of users) may need architecture adjustments.

### 5. Offline Support
Limited offline capabilities (PWA helps but not full native app support).

---

## Document Version Control

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial comprehensive feature documentation |

---

**End of Oracle APEX Features Reference Document**

---

**Next Document**: Page Composer Requirements Document (based on this APEX analysis)
