# Database Column Standards - Oracle Fusion ERP

## Standard Column Categories

### 1. WHO Columns (All Tables)
Every table **MUST** include these standard audit columns:

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| CREATED_BY | NUMBER(15) | NOT NULL | | User ID who created the record |
| CREATION_DATE | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Record creation timestamp |
| LAST_UPDATED_BY | NUMBER(15) | NOT NULL | | User ID who last updated |
| LAST_UPDATE_DATE | TIMESTAMP | NOT NULL | CURRENT_TIMESTAMP | Last update timestamp |
| LAST_UPDATE_LOGIN | NUMBER(15) | NULL | | Session ID of last update |
| OBJECT_VERSION_NUMBER | NUMBER(9) | NOT NULL | 1 | Optimistic locking version |

### 2. Multi-Org Columns (Transactional Tables)
Transactional tables **MUST** include:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| BU_ID | NUMBER(15) | NOT NULL | Business Unit reference |
| ORG_ID | NUMBER(15) | NOT NULL/NULL | Operating Unit (context-dependent) |
| LEGAL_ENTITY_ID | NUMBER(15) | NOT NULL/NULL | Legal Entity reference |
| LEDGER_ID | NUMBER(15) | NOT NULL/NULL | Ledger reference (financial tables) |

**Usage Pattern:**
- **GL Tables**: LEDGER_ID (primary org context)
- **AP/AR/PO Tables**: ORG_ID, BU_ID, LEGAL_ENTITY_ID
- **HCM Tables**: BU_ID, LEGAL_ENTITY_ID
- **Inventory Tables**: ORG_ID (inventory organization)

### 3. Effective Dating Columns (Master Data Tables)
Master data tables support effective dating:

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| EFFECTIVE_START_DATE | DATE | NOT NULL | | Effective start date |
| EFFECTIVE_END_DATE | DATE | NULL | 31-DEC-4712 | Effective end date (high date = active) |
| EFFECTIVE_LATEST_CHANGE | VARCHAR2(1) | NULL | Y | Latest effective record flag (Y/N) |
| EFFECTIVE_SEQUENCE | NUMBER(9) | NULL | 1 | Sequence within effective dates |

### 4. Currency Columns (Financial Tables)
Tables with amounts must include:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| CURRENCY_CODE | VARCHAR2(15) | NOT NULL | ISO currency code |
| ENTERED_DR | NUMBER(20,2) | NULL | Debit in entered currency |
| ENTERED_CR | NUMBER(20,2) | NULL | Credit in entered currency |
| ACCOUNTED_DR | NUMBER(20,2) | NULL | Debit in ledger currency |
| ACCOUNTED_CR | NUMBER(20,2) | NULL | Credit in ledger currency |
| EXCHANGE_RATE | NUMBER(20,10) | NULL | Currency conversion rate |
| EXCHANGE_RATE_TYPE | VARCHAR2(30) | NULL | Rate type (Corporate/User/Spot) |
| EXCHANGE_DATE | DATE | NULL | Rate effective date |

### 5. Status and Workflow Columns
Tables requiring workflow approval:

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| STATUS | VARCHAR2(30) | NULL | varies | Business status |
| POSTING_STATUS | VARCHAR2(30) | NULL | NOT_POSTED | GL posting status |
| APPROVAL_STATUS | VARCHAR2(30) | NULL | NEEDS_APPROVAL | Approval workflow status |
| APPROVED_BY | NUMBER(15) | NULL | | User who approved |
| APPROVED_DATE | TIMESTAMP | NULL | | Approval timestamp |
| POSTED_FLAG | VARCHAR2(1) | NULL | N | Posted to GL flag (Y/N) |
| POSTED_DATE | TIMESTAMP | NULL | | GL posting timestamp |
| POSTED_BY | NUMBER(15) | NULL | | User who posted |

**Common Status Values:**
- **Document Status**: DRAFT, APPROVED, REJECTED, CANCELLED, COMPLETED
- **Posting Status**: NOT_POSTED, POSTING, POSTED, ERROR
- **Payment Status**: UNPAID, PARTIALLY_PAID, FULLY_PAID
- **Approval Status**: NEEDS_APPROVAL, PENDING, APPROVED, REJECTED

### 6. Descriptive Flexfield (DFF) Columns
All tables should include extensibility columns:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| ATTRIBUTE_CATEGORY | VARCHAR2(30) | NULL | Flexfield context |
| ATTRIBUTE1 | VARCHAR2(150) | NULL | User-defined attribute 1 |
| ATTRIBUTE2 | VARCHAR2(150) | NULL | User-defined attribute 2 |
| ATTRIBUTE3 | VARCHAR2(150) | NULL | User-defined attribute 3 |
| ATTRIBUTE4 | VARCHAR2(150) | NULL | User-defined attribute 4 |
| ATTRIBUTE5 | VARCHAR2(150) | NULL | User-defined attribute 5 |
| ... | ... | ... | Additional attributes as needed |
| ATTRIBUTE10 | VARCHAR2(150) | NULL | User-defined attribute 10 |
| ATTRIBUTE15 | VARCHAR2(150) | NULL | User-defined attribute 15 |

**Standard DFF Counts:**
- **Header tables**: 15 attributes (ATTRIBUTE1-ATTRIBUTE15)
- **Line tables**: 10 attributes (ATTRIBUTE1-ATTRIBUTE10)
- **Reference tables**: 5 attributes (ATTRIBUTE1-ATTRIBUTE5)

### 7. Concurrent Program Columns
Tables updated by concurrent programs:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| REQUEST_ID | NUMBER(15) | NULL | Concurrent request ID |
| PROGRAM_APPLICATION_ID | NUMBER(15) | NULL | Program application |
| PROGRAM_ID | NUMBER(15) | NULL | Concurrent program ID |
| PROGRAM_UPDATE_DATE | TIMESTAMP | NULL | Program update timestamp |

### 8. Reference and External System Columns
For integration and traceability:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| REFERENCE1 | VARCHAR2(240) | NULL | Reference field 1 |
| REFERENCE2 | VARCHAR2(240) | NULL | Reference field 2 |
| REFERENCE3 | VARCHAR2(240) | NULL | Reference field 3 |
| REFERENCE4 | VARCHAR2(240) | NULL | Reference field 4 |
| REFERENCE5 | VARCHAR2(240) | NULL | Reference field 5 |
| EXTERNAL_REFERENCE | VARCHAR2(240) | NULL | External system reference |
| SOURCE | VARCHAR2(30) | NULL | Data source (MANUAL/IMPORT/EDI/API) |

### 9. GL Subledger Link Columns
For subledger accounting integration:

| Column Name | Data Type | Nullable | Description |
|------------|-----------|----------|-------------|
| GL_SL_LINK_ID | NUMBER(15) | NULL | Subledger link ID |
| GL_SL_LINK_TABLE | VARCHAR2(30) | NULL | Subledger table name |
| CODE_COMBINATION_ID | NUMBER(15) | NOT NULL | GL account combination |
| SUBLEDGER_DOC_SEQUENCE_ID | NUMBER(15) | NULL | Document sequence |

### 10. Reversal and Cancellation Columns
For financial transactions:

| Column Name | Data Type | Nullable | Default | Description |
|------------|-----------|----------|---------|-------------|
| REVERSED_FLAG | VARCHAR2(1) | NULL | N | Transaction reversed (Y/N) |
| REVERSAL_DATE | DATE | NULL | | Reversal date |
| REVERSAL_PERIOD_ID | NUMBER(15) | NULL | | Period in which reversed |
| REVERSAL_METHOD | VARCHAR2(30) | NULL | | CHANGE_SIGN/DELETE |
| PARENT_TRANSACTION_ID | NUMBER(15) | NULL | | Original transaction if reversal |
| CANCELLED_FLAG | VARCHAR2(1) | NULL | N | Transaction cancelled (Y/N) |
| CANCELLED_DATE | TIMESTAMP | NULL | | Cancellation timestamp |
| CANCELLED_BY | NUMBER(15) | NULL | | User who cancelled |

## Table-Specific Column Examples

### GL_JOURNALS - Complete Column List
```sql
-- Primary Key
JOURNAL_ID NUMBER(15) NOT NULL PRIMARY KEY

-- Multi-Org Context
LEDGER_ID NUMBER(15) NOT NULL
BU_ID NUMBER(15) NOT NULL

-- Business Columns
JOURNAL_NAME VARCHAR2(240)
JOURNAL_NUMBER VARCHAR2(50) NOT NULL UNIQUE
PERIOD_ID NUMBER(15) NOT NULL
JOURNAL_DATE DATE NOT NULL
EFFECTIVE_DATE DATE
DESCRIPTION VARCHAR2(1000)

-- Currency
CURRENCY_CODE VARCHAR2(15) NOT NULL
CONVERSION_DATE DATE
CONVERSION_RATE NUMBER(20,10)
CONVERSION_RATE_TYPE VARCHAR2(30)

-- Amounts
CONTROL_TOTAL NUMBER(20,2)
RUNNING_TOTAL_DR NUMBER(20,2)
RUNNING_TOTAL_CR NUMBER(20,2)
RUNNING_TOTAL_ACCOUNTED_DR NUMBER(20,2)
RUNNING_TOTAL_ACCOUNTED_CR NUMBER(20,2)

-- Status and Workflow
STATUS VARCHAR2(30) DEFAULT 'DRAFT'
POSTING_STATUS VARCHAR2(30) DEFAULT 'NOT_POSTED'
APPROVAL_STATUS VARCHAR2(30)
BALANCED_FLAG VARCHAR2(1) DEFAULT 'N'

-- Posting Information
POSTED_DATE TIMESTAMP
POSTED_BY NUMBER(15)
POSTED_FLAG VARCHAR2(1) DEFAULT 'N'

-- Approval Information
APPROVED_BY NUMBER(15)
APPROVED_DATE TIMESTAMP

-- Reversal Information
REVERSED_FLAG VARCHAR2(1) DEFAULT 'N'
REVERSAL_PERIOD_ID NUMBER(15)
REVERSAL_DATE DATE
REVERSAL_METHOD VARCHAR2(30)
PARENT_JOURNAL_ID NUMBER(15)

-- Source and Category
SOURCE VARCHAR2(50) NOT NULL
CATEGORY VARCHAR2(50)
ACTUAL_FLAG VARCHAR2(1) DEFAULT 'A'

-- Additional Business
BUDGET_VERSION_ID NUMBER(15)
ENCUMBRANCE_TYPE_ID NUMBER(15)
JE_BATCH_ID NUMBER(15)
EXTERNAL_REFERENCE VARCHAR2(240)
TAX_STATUS_CODE VARCHAR2(30)

-- DFF Attributes
ATTRIBUTE_CATEGORY VARCHAR2(30)
ATTRIBUTE1 VARCHAR2(150)
ATTRIBUTE2 VARCHAR2(150)
ATTRIBUTE3 VARCHAR2(150)
ATTRIBUTE4 VARCHAR2(150)
ATTRIBUTE5 VARCHAR2(150)

-- WHO Columns
CREATED_BY NUMBER(15) NOT NULL
CREATION_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATED_BY NUMBER(15) NOT NULL
LAST_UPDATE_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATE_LOGIN NUMBER(15)
OBJECT_VERSION_NUMBER NUMBER(9) NOT NULL DEFAULT 1

-- Concurrent Program
REQUEST_ID NUMBER(15)
PROGRAM_APPLICATION_ID NUMBER(15)
PROGRAM_ID NUMBER(15)
PROGRAM_UPDATE_DATE TIMESTAMP
```

### AP_INVOICES - Complete Column List
```sql
-- Primary Key
INVOICE_ID NUMBER(15) NOT NULL PRIMARY KEY

-- Multi-Org Context
ORG_ID NUMBER(15) NOT NULL
BU_ID NUMBER(15) NOT NULL
LEDGER_ID NUMBER(15) NOT NULL
LEGAL_ENTITY_ID NUMBER(15)

-- Supplier Information
SUPPLIER_ID NUMBER(15) NOT NULL
SUPPLIER_SITE_ID NUMBER(15) NOT NULL

-- Document Information
INVOICE_NUMBER VARCHAR2(50) NOT NULL
INVOICE_TYPE VARCHAR2(30) DEFAULT 'STANDARD'
INVOICE_DATE DATE NOT NULL
GL_DATE DATE NOT NULL
DUE_DATE DATE
DESCRIPTION VARCHAR2(1000)

-- Payment Terms
TERMS_ID NUMBER(15)
TERMS_DATE DATE

-- Currency and Amounts
INVOICE_CURRENCY_CODE VARCHAR2(15) NOT NULL
PAYMENT_CURRENCY_CODE VARCHAR2(15)
EXCHANGE_RATE NUMBER(20,10)
EXCHANGE_RATE_TYPE VARCHAR2(30)
EXCHANGE_DATE DATE

INVOICE_AMOUNT NUMBER(20,2) NOT NULL
BASE_AMOUNT NUMBER(20,2)
TAX_AMOUNT NUMBER(20,2) DEFAULT 0
AMOUNT_PAID NUMBER(20,2) DEFAULT 0
DISCOUNT_AMOUNT_TAKEN NUMBER(20,2) DEFAULT 0
AMOUNT_APPLICABLE_TO_DISCOUNT NUMBER(20,2)

-- Status and Workflow
PAYMENT_STATUS VARCHAR2(30) DEFAULT 'UNPAID'
APPROVAL_STATUS VARCHAR2(30) DEFAULT 'NEEDS_APPROVAL'
POSTING_STATUS VARCHAR2(30) DEFAULT 'NOT_POSTED'
WFAPPROVAL_STATUS VARCHAR2(30)

-- Approval Information
APPROVED_DATE TIMESTAMP
APPROVED_BY NUMBER(15)

-- Posting Information
POSTED_DATE TIMESTAMP
POSTED_FLAG VARCHAR2(1) DEFAULT 'N'

-- Cancellation
CANCELLED_DATE TIMESTAMP
CANCELLED_BY NUMBER(15)
CANCELLED_AMOUNT NUMBER(20,2)

-- Payment Information
PAYMENT_METHOD_CODE VARCHAR2(30)
PAYMENT_PRIORITY NUMBER(2)
PAY_GROUP_LOOKUP_CODE VARCHAR2(30)
EXTERNAL_BANK_ACCOUNT_ID NUMBER(15)
REMITTANCE_BANK_ACCOUNT_ID NUMBER(15)

-- Source and References
SOURCE VARCHAR2(30) DEFAULT 'MANUAL'
VOUCHER_NUMBER VARCHAR2(50)
DOC_CATEGORY_CODE VARCHAR2(30)
INVOICE_RECEIVED_DATE DATE
GOODS_RECEIVED_DATE DATE
INVOICE_TYPE_LOOKUP_CODE VARCHAR2(30)

REFERENCE_1 VARCHAR2(240)
REFERENCE_2 VARCHAR2(240)

-- Additional
REQUESTER_ID NUMBER(15)

-- DFF Attributes (15 for headers)
ATTRIBUTE_CATEGORY VARCHAR2(30)
ATTRIBUTE1 VARCHAR2(150)
ATTRIBUTE2 VARCHAR2(150)
ATTRIBUTE3 VARCHAR2(150)
ATTRIBUTE4 VARCHAR2(150)
ATTRIBUTE5 VARCHAR2(150)
ATTRIBUTE6 VARCHAR2(150)
ATTRIBUTE7 VARCHAR2(150)
ATTRIBUTE8 VARCHAR2(150)
ATTRIBUTE9 VARCHAR2(150)
ATTRIBUTE10 VARCHAR2(150)

-- WHO Columns
CREATED_BY NUMBER(15) NOT NULL
CREATION_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATED_BY NUMBER(15) NOT NULL
LAST_UPDATE_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATE_LOGIN NUMBER(15)
OBJECT_VERSION_NUMBER NUMBER(9) NOT NULL DEFAULT 1
REQUEST_ID NUMBER(15)
PROGRAM_APPLICATION_ID NUMBER(15)
PROGRAM_ID NUMBER(15)
PROGRAM_UPDATE_DATE TIMESTAMP
```

### HCM_EMPLOYEES - Complete Column List
```sql
-- Primary Key
EMPLOYEE_ID NUMBER(15) NOT NULL PRIMARY KEY

-- Multi-Org Context
BU_ID NUMBER(15) NOT NULL
LEGAL_ENTITY_ID NUMBER(15) NOT NULL

-- Person Information
PERSON_ID NUMBER(15) NOT NULL
EMPLOYEE_NUMBER VARCHAR2(50) NOT NULL UNIQUE

-- Name
FIRST_NAME VARCHAR2(100) NOT NULL
LAST_NAME VARCHAR2(100) NOT NULL
MIDDLE_NAME VARCHAR2(100)
FULL_NAME VARCHAR2(240)
DISPLAY_NAME VARCHAR2(240)

-- Employment Dates
HIRE_DATE DATE NOT NULL
ORIGINAL_HIRE_DATE DATE
TERMINATION_DATE DATE
TERMINATION_REASON VARCHAR2(30)

-- Employment Information
EMPLOYEE_STATUS VARCHAR2(30) DEFAULT 'ACTIVE'
EMPLOYMENT_TYPE VARCHAR2(30)
EMPLOYMENT_CATEGORY VARCHAR2(30)

-- Contact Information
WORK_EMAIL VARCHAR2(240)
PERSONAL_EMAIL VARCHAR2(240)
WORK_PHONE VARCHAR2(50)
MOBILE_PHONE VARCHAR2(50)

-- Organizational
MANAGER_ID NUMBER(15)
USER_ID NUMBER(15)

-- Effective Dating
EFFECTIVE_START_DATE DATE NOT NULL
EFFECTIVE_END_DATE DATE DEFAULT TO_DATE('31-DEC-4712','DD-MON-YYYY')
EFFECTIVE_LATEST_CHANGE VARCHAR2(1) DEFAULT 'Y'
EFFECTIVE_SEQUENCE NUMBER(9) DEFAULT 1

-- Additional Flags
REHIRE_FLAG VARCHAR2(1) DEFAULT 'N'

-- Payroll Related
BENEFIT_GROUP_ID NUMBER(15)
PAYROLL_ID NUMBER(15)
PAY_FREQUENCY VARCHAR2(30)

-- DFF Attributes
ATTRIBUTE_CATEGORY VARCHAR2(30)
ATTRIBUTE1 VARCHAR2(150)
ATTRIBUTE2 VARCHAR2(150)
ATTRIBUTE3 VARCHAR2(150)
ATTRIBUTE4 VARCHAR2(150)
ATTRIBUTE5 VARCHAR2(150)

-- WHO Columns
CREATED_BY NUMBER(15) NOT NULL
CREATION_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATED_BY NUMBER(15) NOT NULL
LAST_UPDATE_DATE TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
LAST_UPDATE_LOGIN NUMBER(15)
OBJECT_VERSION_NUMBER NUMBER(9) NOT NULL DEFAULT 1
```

## Data Type Standards

### Standard Data Types

| Purpose | Data Type | Notes |
|---------|-----------|-------|
| ID columns | NUMBER(15) | All primary and foreign keys |
| Amounts (currency) | NUMBER(20,2) | 2 decimal places for money |
| Quantities | NUMBER(20,4) | 4 decimal places for quantities |
| Percentages | NUMBER(5,2) | e.g., 99.99% |
| Rates (exchange) | NUMBER(20,10) | High precision for rates |
| Codes (short) | VARCHAR2(30) | Lookup codes, status values |
| Codes (long) | VARCHAR2(50) | Document numbers, IDs |
| Names | VARCHAR2(240) | Standard name field |
| Short names | VARCHAR2(100) | Abbreviated names |
| Descriptions | VARCHAR2(1000) | Short descriptions |
| Long text | CLOB | Long descriptions, notes |
| Flags | VARCHAR2(1) | Y/N values |
| Dates | DATE | Date only (no time) |
| Timestamps | TIMESTAMP | Date with time |
| Version number | NUMBER(9) | Optimistic locking |

### High Date Convention
Oracle Fusion uses **31-DEC-4712** as the "high date" to indicate:
- Active/current record (for EFFECTIVE_END_DATE)
- No end date/indefinite

## Naming Conventions

### Table Names
- Format: `{MODULE}_{ENTITY}`
- Examples: GL_JOURNALS, AP_INVOICES, HCM_EMPLOYEES
- Use plural form for entity tables
- Use singular for configuration/setup tables

### Column Names
- Use descriptive names
- Avoid abbreviations unless standard (GL, AP, AR, ID, etc.)
- Use underscores to separate words
- Primary key: `{TABLE}_ID` (e.g., EMPLOYEE_ID)
- Foreign key: `{REFERENCED_TABLE}_ID` (e.g., MANAGER_ID references EMPLOYEE_ID)
- Flags: End with `_FLAG` (e.g., POSTED_FLAG)
- Dates: End with `_DATE` (e.g., INVOICE_DATE)
- Timestamps: End with `_DATE` (e.g., CREATION_DATE)
- Codes: End with `_CODE` (e.g., CURRENCY_CODE)
- Numbers: End with `_NUMBER` (e.g., INVOICE_NUMBER)
- Amounts: End with `_AMOUNT` (e.g., INVOICE_AMOUNT)

### Index Names
- Format: `IDX_{TABLE}_{COLUMN(S)}`
- Examples: IDX_GL_JOURNALS_PERIOD, IDX_AP_INV_SUPPLIER

### Constraint Names
- Primary Key: `{TABLE}_PK`
- Foreign Key: `FK_{TABLE}_{REFERENCED_TABLE}`
- Unique: `UNQ_{TABLE}_{COLUMN}`
- Check: `CHK_{TABLE}_{CONDITION}`

## Required Indexes

### Standard Indexes for All Tables

1. **Primary Key Index** (automatic)
   - On {TABLE}_ID

2. **WHO Column Indexes**
   - IDX_{TABLE}_CREATED_BY
   - IDX_{TABLE}_CREATION_DATE

3. **Multi-Org Indexes**
   - IDX_{TABLE}_BU_ID
   - IDX_{TABLE}_ORG_ID
   - IDX_{TABLE}_LEDGER_ID

4. **Foreign Key Indexes**
   - On all FK columns

5. **Status Indexes**
   - IDX_{TABLE}_STATUS
   - IDX_{TABLE}_POSTING_STATUS
   - IDX_{TABLE}_APPROVAL_STATUS

6. **Date Indexes**
   - On primary date columns (INVOICE_DATE, JOURNAL_DATE, etc.)

7. **Business Key Indexes**
   - On unique business identifiers (EMPLOYEE_NUMBER, INVOICE_NUMBER, etc.)

## Constraints

### Standard Constraints

1. **Primary Key**
   - Every table must have a primary key
   - Use NUMBER(15) surrogate keys

2. **Foreign Keys**
   - Define all referential integrity
   - Use ON DELETE CASCADE or ON DELETE SET NULL judiciously
   - Most should have no ON DELETE action

3. **Unique Constraints**
   - On business keys (EMPLOYEE_NUMBER, etc.)
   - Composite where needed (e.g., LEDGER_ID + JOURNAL_NUMBER)

4. **Check Constraints**
   - Status value validation
   - Date range validation
   - Flag value validation (Y/N only)

5. **Not Null Constraints**
   - All WHO columns except LAST_UPDATE_LOGIN
   - All primary keys
   - Required business columns

## Example Complete Table DDL

```sql
CREATE TABLE GL_JOURNALS (
  -- Primary Key
  JOURNAL_ID NUMBER(15) NOT NULL,

  -- Multi-Org
  LEDGER_ID NUMBER(15) NOT NULL,
  BU_ID NUMBER(15) NOT NULL,

  -- Business Columns
  JOURNAL_NAME VARCHAR2(240),
  JOURNAL_NUMBER VARCHAR2(50) NOT NULL,
  PERIOD_ID NUMBER(15) NOT NULL,
  JOURNAL_DATE DATE NOT NULL,
  EFFECTIVE_DATE DATE,
  CURRENCY_CODE VARCHAR2(15) NOT NULL,
  CONVERSION_DATE DATE,
  CONVERSION_RATE NUMBER(20,10),
  CONVERSION_RATE_TYPE VARCHAR2(30),
  STATUS VARCHAR2(30) DEFAULT 'DRAFT',
  POSTING_STATUS VARCHAR2(30) DEFAULT 'NOT_POSTED',
  SOURCE VARCHAR2(50) NOT NULL,
  CATEGORY VARCHAR2(50),
  DESCRIPTION VARCHAR2(1000),
  CONTROL_TOTAL NUMBER(20,2),
  RUNNING_TOTAL_DR NUMBER(20,2),
  RUNNING_TOTAL_CR NUMBER(20,2),
  BALANCED_FLAG VARCHAR2(1) DEFAULT 'N',
  POSTED_DATE TIMESTAMP,
  POSTED_BY NUMBER(15),
  APPROVED_BY NUMBER(15),
  APPROVED_DATE TIMESTAMP,
  REVERSED_FLAG VARCHAR2(1) DEFAULT 'N',
  REVERSAL_PERIOD_ID NUMBER(15),
  EXTERNAL_REFERENCE VARCHAR2(240),

  -- DFF
  ATTRIBUTE_CATEGORY VARCHAR2(30),
  ATTRIBUTE1 VARCHAR2(150),
  ATTRIBUTE2 VARCHAR2(150),
  ATTRIBUTE3 VARCHAR2(150),
  ATTRIBUTE4 VARCHAR2(150),
  ATTRIBUTE5 VARCHAR2(150),

  -- WHO Columns
  CREATED_BY NUMBER(15) NOT NULL,
  CREATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  LAST_UPDATED_BY NUMBER(15) NOT NULL,
  LAST_UPDATE_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  LAST_UPDATE_LOGIN NUMBER(15),
  OBJECT_VERSION_NUMBER NUMBER(9) DEFAULT 1 NOT NULL,

  -- Constraints
  CONSTRAINT GL_JOURNALS_PK PRIMARY KEY (JOURNAL_ID),
  CONSTRAINT GL_JOURNALS_UNQ UNIQUE (LEDGER_ID, JOURNAL_NUMBER),
  CONSTRAINT FK_GL_JOURNALS_LEDGER FOREIGN KEY (LEDGER_ID)
    REFERENCES GL_LEDGERS(LEDGER_ID),
  CONSTRAINT FK_GL_JOURNALS_PERIOD FOREIGN KEY (PERIOD_ID)
    REFERENCES GL_PERIODS(PERIOD_ID),
  CONSTRAINT CHK_GL_JOURNALS_STATUS
    CHECK (STATUS IN ('DRAFT','POSTED','APPROVED','REJECTED')),
  CONSTRAINT CHK_GL_JOURNALS_POSTING
    CHECK (POSTING_STATUS IN ('NOT_POSTED','POSTING','POSTED','ERROR')),
  CONSTRAINT CHK_GL_JOURNALS_BALANCED
    CHECK (BALANCED_FLAG IN ('Y','N')),
  CONSTRAINT CHK_GL_JOURNALS_REVERSED
    CHECK (REVERSED_FLAG IN ('Y','N'))
);

-- Indexes
CREATE INDEX IDX_GL_JOURNALS_LEDGER ON GL_JOURNALS(LEDGER_ID);
CREATE INDEX IDX_GL_JOURNALS_BU ON GL_JOURNALS(BU_ID);
CREATE INDEX IDX_GL_JOURNALS_PERIOD ON GL_JOURNALS(PERIOD_ID);
CREATE INDEX IDX_GL_JOURNALS_STATUS ON GL_JOURNALS(STATUS);
CREATE INDEX IDX_GL_JOURNALS_POSTING ON GL_JOURNALS(POSTING_STATUS);
CREATE INDEX IDX_GL_JOURNALS_SOURCE ON GL_JOURNALS(SOURCE);
CREATE INDEX IDX_GL_JOURNALS_DATE ON GL_JOURNALS(JOURNAL_DATE);
CREATE INDEX IDX_GL_JOURNALS_CREATED_BY ON GL_JOURNALS(CREATED_BY);

-- Comments
COMMENT ON TABLE GL_JOURNALS IS 'General Ledger journal headers';
COMMENT ON COLUMN GL_JOURNALS.JOURNAL_ID IS 'Primary key';
COMMENT ON COLUMN GL_JOURNALS.POSTING_STATUS IS 'GL posting status: NOT_POSTED, POSTING, POSTED, ERROR';
```

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Purpose:** Oracle Fusion ERP Database Column Standards
