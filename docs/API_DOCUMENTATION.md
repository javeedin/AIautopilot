# API Documentation

## Overview
This document describes the internal JavaScript API modules used in WMS Auto Pilot.

---

## Modules

### 1. CONFIG (config.js)
Configuration management module.

```javascript
// Access configuration
const apiUrl = APP_CONFIG.API_BASE_URL;
const dbConfig = APP_CONFIG.DATABASE;
```

**Properties:**
- `API_BASE_URL` - API endpoint base URL
- `DATABASE` - Database connection settings
- `FEATURES` - Feature flags
- `UI` - UI configuration

---

### 2. Storage (storage.js)
LocalStorage management (placeholder - to be implemented).

```javascript
// Save data
Storage.set('key', value);

// Get data
const data = Storage.get('key', defaultValue);

// Remove data
Storage.remove('key');
```

---

### 3. API (api.js)
API communication layer (placeholder - to be implemented).

```javascript
// Make API call
const response = await API.get('/endpoint');
const result = await API.post('/endpoint', data);
```

---

### 4. Database (database.js)
Database query execution (placeholder - to be implemented).

```javascript
// Execute query
const result = await Database.executeQuery('SELECT * FROM table');

// Test connection
const isConnected = await Database.testConnection(credentials);
```

---

### 5. Procedures (procedures.js)
PL/SQL procedure management (placeholder - to be implemented).

```javascript
// Load procedures
await Procedures.loadAll();

// Save procedure
await Procedures.save(procedure);

// Execute procedure
const result = await Procedures.execute(id, params);
```

---

### 6. Grid (grid.js)
DevExpress grid management (placeholder - to be implemented).

```javascript
// Initialize grid
Grid.init('gridContainer', config);

// Set data
Grid.setData(data);

// Export
Grid.exportToExcel();
```

---

### 7. Reports (reports.js)
Report generation (placeholder - to be implemented).

```javascript
// Generate PDF
Reports.generatePDF(data, config);

// Generate Excel
Reports.generateExcel(data, config);
```

---

### 8. Validators (validators.js)
Input validation (placeholder - to be implemented).

```javascript
// Validate SQL
const result = Validators.validateSQL(sql);

// Validate connection
const result = Validators.validateConnection(credentials);
```

---

### 9. Theme (theme.js)
Theme management (placeholder - to be implemented).

```javascript
// Toggle theme
Theme.toggle();

// Apply theme
Theme.apply('dark');
```

---

### 10. UI (ui.js)
UI utilities (placeholder - to be implemented).

```javascript
// Show notification
UI.showNotification('Message', 'success');

// Open modal
UI.openModal('modalId');

// Close modal
UI.closeModal('modalId');
```

---

## Current State

⚠️ **Note**: Most modules are currently placeholders. The full implementation is in `main.js`. 

Future updates will properly split the functionality into these modules for better organization and maintainability.

---

## Usage Example

```javascript
// Wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    Theme.init();
    
    // Load saved procedures
    await Procedures.loadAll();
    
    // Initialize grid
    Grid.init('gridContainer');
    
    // Show success message
    UI.showNotification('Application loaded!', 'success');
});
```

---

**Last Updated**: 2025-01-24
