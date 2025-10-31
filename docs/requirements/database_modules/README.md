# Module-Specific Database Column Specifications

## Overview

This directory contains detailed column-level specifications for all database tables, organized by module. Each CSV file provides complete column definitions following Oracle Fusion ERP standards.

## File Naming Convention

`{MODULE}_Module_Database_Columns.csv`

Examples:
- `GL_Module_Database_Columns.csv`
- `AP_Module_Database_Columns.csv`
- `HCM_Module_Database_Columns.csv`

## CSV Structure

Each CSV file contains the following columns:

| Column Name | Description |
|-------------|-------------|
| Table_ID | Unique table identifier (e.g., GL-T001) |
| Module_ID | Module code (GL, AP, AR, HCM, etc.) |
| Table_Name | Physical table name |
| Column_Name | Physical column name |
| Data_Type | Oracle data type with precision |
| Nullable | NOT NULL or NULL |
| Default_Value | Default value if any |
| Description | Column description |
| Column_Category | Category: PK, FK, Business, WHO, MultiOrg, DFF, EffectiveDating |
| Column_Order | Sequential column order in table |

## Column Categories

### PK (Primary Key)
- Primary key column(s) for the table
- Always NUMBER(15) except for code-based PKs

### FK (Foreign Key)
- Reference to another table's primary key
- Enforces referential integrity

### Business
- Core business data columns
- Transaction data, amounts, dates, status fields

### WHO (Audit Columns)
- Standard audit columns on every table:
  - CREATED_BY
  - CREATION_DATE
  - LAST_UPDATED_BY
  - LAST_UPDATE_DATE
  - LAST_UPDATE_LOGIN
  - OBJECT_VERSION_NUMBER
  - REQUEST_ID (optional)
  - PROGRAM_APPLICATION_ID (optional)
  - PROGRAM_ID (optional)
  - PROGRAM_UPDATE_DATE (optional)

### MultiOrg
- Multi-organization access control columns:
  - BU_ID (Business Unit)
  - ORG_ID (Operating Unit)
  - LEDGER_ID (Ledger)
  - LEGAL_ENTITY_ID (Legal Entity)

### DFF (Descriptive Flexfields)
- User-extensible attributes:
  - ATTRIBUTE_CATEGORY
  - ATTRIBUTE1 through ATTRIBUTE5/10/15

### EffectiveDating
- Temporal data columns:
  - EFFECTIVE_START_DATE
  - EFFECTIVE_END_DATE
  - EFFECTIVE_LATEST_CHANGE
  - EFFECTIVE_SEQUENCE

## Module List

### Financial Modules
1. **GL** - General Ledger (16 tables, ~381 columns)
2. **AP** - Accounts Payable (12 tables)
3. **AR** - Accounts Receivable (12 tables)
4. **CM** - Cost Management (12 tables)
5. **CSH** - Cash Management (14 tables)
6. **FA** - Fixed Assets (18 tables)

### Supply Chain Modules
7. **PO** - Purchasing (12 tables)
8. **INV** - Inventory (12 tables)
9. **OM** - Order Management (12 tables)
10. **LCM** - Landed Cost Management (12 tables)
11. **PDM** - Product Management (12 tables)

### Human Capital Management Modules
12. **HCM** - Human Capital Management (21 tables)
13. **PAY** - Payroll (20 tables)
14. **ABS** - Absence Management (12 tables)
15. **REC** - Recruitment (16 tables)

### Security Module
16. **UR** - User and Role Management (10 tables)

## Oracle Fusion Standards Applied

All column specifications follow Oracle Fusion ERP standards:

### 1. WHO Columns
Every table includes standard audit columns for tracking changes.

### 2. Multi-Org Security
Transactional tables include BU_ID and org context columns based on module:
- **GL**: LEDGER_ID
- **AP/AR/PO**: ORG_ID, BU_ID, LEGAL_ENTITY_ID
- **HCM/PAY**: BU_ID, LEGAL_ENTITY_ID
- **INV**: ORG_ID (inventory organization)

### 3. Status and Workflow
- **STATUS**: Business status (DRAFT/ACTIVE/INACTIVE)
- **POSTING_STATUS**: GL posting status (NOT_POSTED/POSTED)
- **APPROVAL_STATUS**: Workflow approval status
- **PAYMENT_STATUS**: Payment tracking (UNPAID/PAID)
- Corresponding user/date stamps (APPROVED_BY, APPROVED_DATE, etc.)

### 4. Currency Handling
Financial tables include:
- **CURRENCY_CODE**: ISO currency code
- **EXCHANGE_RATE**: Conversion rate
- **EXCHANGE_RATE_TYPE**: Rate type
- **EXCHANGE_DATE**: Rate effective date
- **ENTERED_DR/CR**: Amounts in entered currency
- **ACCOUNTED_DR/CR**: Amounts in ledger currency

### 5. Effective Dating
Master data tables support temporal tracking:
- **EFFECTIVE_START_DATE**: Record effective start
- **EFFECTIVE_END_DATE**: Record effective end (31-DEC-4712 = active)
- **EFFECTIVE_LATEST_CHANGE**: Latest record flag
- **EFFECTIVE_SEQUENCE**: Sequence number

### 6. Reversal Tracking
Financial transactions include:
- **REVERSED_FLAG**: Transaction reversed indicator
- **REVERSAL_DATE**: Reversal date
- **PARENT_TRANSACTION_ID**: Original transaction reference

### 7. GL Subledger Integration
Subledger tables include:
- **GL_SL_LINK_ID**: Link to GL
- **GL_SL_LINK_TABLE**: Subledger table name
- **CODE_COMBINATION_ID**: Full accounting flexfield
- **SUBLEDGER_DOC_SEQUENCE_ID**: Document sequence

## Data Type Standards

| Purpose | Data Type | Notes |
|---------|-----------|-------|
| IDs | NUMBER(15) | All PKs and FKs |
| Amounts | NUMBER(20,2) | Currency amounts |
| Quantities | NUMBER(20,4) | Item quantities |
| Rates | NUMBER(20,10) | Exchange rates |
| Percentages | NUMBER(5,2) | e.g., 99.99% |
| Codes | VARCHAR2(30) | Lookup codes |
| Numbers | VARCHAR2(50) | Document numbers |
| Names | VARCHAR2(240) | Standard names |
| Descriptions | VARCHAR2(1000) | Short descriptions |
| Long Text | CLOB | Notes, long descriptions |
| Flags | VARCHAR2(1) | Y/N values |
| Dates | DATE | Date only |
| Timestamps | TIMESTAMP | Date with time |
| Version | NUMBER(9) | Optimistic locking |

## Usage Examples

### Reading GL Module Specifications
```sql
-- Load GL module columns
SELECT Table_Name, Column_Name, Data_Type, Nullable, Description
FROM GL_Module_Database_Columns
WHERE Table_Name = 'GL_JOURNALS'
ORDER BY Column_Order;
```

### Finding All WHO Columns
```sql
SELECT DISTINCT Table_Name, Column_Name
FROM {MODULE}_Module_Database_Columns
WHERE Column_Category = 'WHO'
ORDER BY Table_Name, Column_Order;
```

### Finding All Multi-Org Columns
```sql
SELECT Table_Name, Column_Name, Description
FROM {MODULE}_Module_Database_Columns
WHERE Column_Category = 'MultiOrg'
ORDER BY Table_Name, Column_Order;
```

### Generating DDL
Use the column specifications to generate CREATE TABLE statements:

```sql
CREATE TABLE {Table_Name} (
  {Column_Name} {Data_Type} {Nullable} {Default_Value},
  ...
  CONSTRAINT {Table_Name}_PK PRIMARY KEY ({PK_Column})
);
```

## Validation Rules

### Every Table Must Have:
1. ✅ Primary key column (Column_Category = 'PK')
2. ✅ WHO columns (6 minimum: CREATED_BY through OBJECT_VERSION_NUMBER)
3. ✅ Proper data types per standards
4. ✅ Column order starting from 1

### Transactional Tables Must Have:
1. ✅ Multi-Org columns (BU_ID at minimum)
2. ✅ STATUS column
3. ✅ Date/timestamp columns for key business dates
4. ✅ DFF attributes (5-10 minimum)

### Master Data Tables Should Have:
1. ✅ Effective dating columns (if temporal)
2. ✅ Business key with UNIQUE constraint
3. ✅ STATUS column
4. ✅ ENABLED_FLAG or similar

## Cross-Reference

All tables reference back to:
- **Database_Tables_Master.csv**: High-level table metadata
- **Database_Schema.json**: DDL scripts and structure
- **Database_Column_Standards.md**: Detailed standards documentation

## Notes

- **High Date**: Oracle Fusion uses `31-DEC-4712` as the "high date" for open-ended effective dates
- **Null vs Default**: Nullable columns may have defaults (e.g., STATUS default 'ACTIVE')
- **Sequences**: All primary keys use database sequences for ID generation
- **Indexes**: Foreign keys, status columns, and date columns require indexes (not shown in column specs)
- **Constraints**: CHECK constraints enforce valid status values, flag values (Y/N), etc.

## File Sizes

Approximate row counts per module:
- Small modules (UR): ~200 rows
- Medium modules (AP, AR, PO, INV, OM): 300-400 rows
- Large modules (GL, HCM, PAY): 400-600 rows
- Very large modules (FA with leases): 600-800 rows

**Total across all 16 modules**: ~6,500-8,000 column definitions

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Oct 26, 2025 | Initial module-specific column specifications |

---

**Document Owner**: ERP Database Architecture Team
**Last Updated**: October 26, 2025
**Status**: Active - Oracle Fusion ERP Standard
