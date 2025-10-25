# WMS Auto Pilot - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Database Connection](#database-connection)
3. [Executing Queries](#executing-queries)
4. [Managing Procedures](#managing-procedures)
5. [Working with Data Grid](#working-with-data-grid)
6. [Generating Reports](#generating-reports)
7. [Customization](#customization)

---

## Getting Started

### Opening the Application
1. Open `index.html` in your web browser
2. The application will load with the default light theme
3. All features are accessible from the main interface

### Interface Overview
- **Header**: Theme toggle, connection settings, and actions
- **SQL Editor**: Write and execute SQL queries
- **Data Grid**: View and manipulate query results
- **Procedures Panel**: Manage saved procedures

---

## Database Connection

### Setting Up Connection
1. Click the **Settings** icon in the header
2. Enter your database credentials:
   - Host
   - Port
   - Service Name
   - Username
   - Password
3. Click **Test Connection**
4. Once successful, click **Save**

⚠️ **Security Note**: Credentials are stored in browser localStorage. Never use production credentials in shared environments.

---

## Executing Queries

### Writing Queries
1. Click **New Query** or press `Ctrl+N`
2. Write your SQL query in the editor
3. Use the toolbar for common operations

### Running Queries
1. Click **Execute** or press `F5`
2. Results appear in the data grid below
3. Use WHERE clause for filtering

### Query Tips
- Use `SELECT *` to get all columns
- Add `WHERE` clause for filtering
- Use `ORDER BY` for sorting
- Limit results with `ROWNUM` or `FETCH FIRST`

---

## Managing Procedures

### Creating a Procedure
1. Write your PL/SQL code
2. Click **Save As Procedure**
3. Enter a name and description
4. Click **Save**

### Using Saved Procedures
1. Click **Procedures** to view all
2. Select a procedure to load it
3. Edit if needed
4. Click **Execute** to run

### Organizing Procedures
- Use clear, descriptive names
- Add comments for complex logic
- Group related procedures

---

## Working with Data Grid

### Basic Operations
- **Sort**: Click column headers
- **Filter**: Use the filter row
- **Search**: Use the search box
- **Select**: Click rows to select

### Column Management
1. Click **Column Editor**
2. Add, remove, or reorder columns
3. Set column formats:
   - Number
   - Currency
   - Date
   - Percentage
   - Badge

### Customizing Columns
- **Width**: Set column width
- **Format**: Choose display format
- **Alignment**: Left, center, right
- **Fixed**: Pin columns to left/right

---

## Generating Reports

### Export to Excel
1. Click **Export to Excel**
2. Choose export options
3. File downloads automatically

### Export to PDF
1. Click **Export to PDF**
2. Configure:
   - Orientation (portrait/landscape)
   - Page size
   - Title
3. Click **Generate**
4. PDF downloads automatically

### Report Tips
- Filter data before exporting
- Use column editor to show only needed columns
- Add meaningful titles to reports

---

## Customization

### Themes
Click the theme toggle in header to switch between:
- ☀️ Light Theme
- 🌙 Dark Theme

Theme preference is saved automatically.

### Layout
- Resize panels by dragging dividers
- Collapse/expand side panels
- Full screen mode available

### Settings
Access settings to configure:
- Auto-save interval
- Result set limits
- Default theme
- Grid preferences

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F5` | Execute query |
| `Ctrl+N` | New query |
| `Ctrl+S` | Save procedure |
| `Ctrl+E` | Export to Excel |
| `Ctrl+P` | Export to PDF |
| `Ctrl+/` | Toggle comments |
| `Esc` | Close modal |

---

## Troubleshooting

### Connection Issues
- Verify database is running
- Check firewall settings
- Confirm credentials are correct
- Ensure database service is accessible

### Query Errors
- Check SQL syntax
- Verify table/column names
- Ensure proper permissions
- Check for reserved keywords

### Performance Issues
- Limit result set size
- Use WHERE clauses effectively
- Close unused browser tabs
- Clear browser cache

---

## Best Practices

### Security
- Never share credentials
- Use read-only accounts when possible
- Log out when done
- Don't save production credentials

### Query Performance
- Always use WHERE clauses
- Limit result sets
- Avoid SELECT *
- Use indexes effectively

### Organization
- Name procedures clearly
- Add comments to complex queries
- Group related procedures
- Archive old procedures

---

## Support

For issues or questions:
1. Check this guide
2. Review [API Documentation](API_DOCUMENTATION.md)
3. Check [GitHub Issues](https://github.com/yourusername/wms-autopilot/issues)
4. Contact support

---

**Version**: 4.0  
**Last Updated**: 2025-01-24
