# General Ledger (GL) Module - Requirements Document

## Document Information
- **Document Version:** 1.0
- **Date:** October 26, 2025
- **Module:** General Ledger (GL)
- **ERP System:** Custom ERP (Oracle Fusion-like)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Module Overview](#module-overview)
3. [Organization Structure](#organization-structure)
4. [Chart of Accounts](#chart-of-accounts)
5. [Calendar Management](#calendar-management)
6. [Currency Management](#currency-management)
7. [Journal Management](#journal-management)
8. [Period Close Process](#period-close-process)
9. [Consolidation](#consolidation)
10. [Allocations](#allocations)
11. [Revaluation](#revaluation)
12. [Intercompany Transactions](#intercompany-transactions)
13. [Budget Management](#budget-management)
14. [Reporting & Analytics](#reporting-analytics)
15. [Security & Access Control](#security-access-control)
16. [Integration Points](#integration-points)

---

## 1. Executive Summary

The General Ledger (GL) module is the foundation of the ERP system, serving as the central repository for all financial transactions. This module will capture, record, and report financial data across the organization, providing accurate and timely financial information for decision-making.

The GL module will support:
- Multi-entity, multi-currency operations
- Flexible chart of accounts structure
- Automated journal processing
- Period close and consolidation
- Comprehensive financial reporting
- Integration with all other financial modules (AP, AR, FA, CM)

---

## 2. Module Overview

### 2.1 Purpose
The GL module manages all financial transactions and maintains the organization's complete financial records. It provides the foundation for financial reporting, compliance, and analysis.

### 2.2 Key Objectives
- Maintain accurate and complete financial records
- Support multiple legal entities and business units
- Enable multi-currency transactions and reporting
- Automate routine accounting processes
- Provide real-time financial visibility
- Support statutory and management reporting
- Ensure audit trail and compliance

### 2.3 Scope
- Organization structure setup and maintenance
- Chart of accounts configuration
- Journal entry and processing
- Period management and close
- Financial consolidation
- Allocations and revaluations
- Intercompany accounting
- Budget management
- Financial reporting and analytics

---

## 3. Organization Structure

### 3.1 Enterprise
**Description:** The highest level of the organizational hierarchy representing the entire business enterprise.

**Features:**
- Unique enterprise identifier
- Enterprise name and description
- Base currency definition
- Enterprise-level configurations
- Master data repository

### 3.2 Legal Entities
**Description:** Legally registered organizations that can own assets and be liable for debts.

**Features:**
- Legal entity registration details
- Tax identification numbers
- Legal address information
- Regulatory reporting requirements
- Association with enterprise
- Primary ledger assignment
- Multiple legal entities support

**Attributes:**
- Legal Entity Name
- Legal Entity Type
- Registration Number
- Tax ID
- Address (Country, State, City, ZIP)
- Establishment Date
- Legal Nature (Corporation, Partnership, etc.)

### 3.3 Business Units
**Description:** Operational divisions of the organization that can perform business functions.

**Features:**
- Business unit identification
- Assignment to legal entity
- Chart of accounts association
- Calendar assignment
- Default currency
- Organizational hierarchy
- Business unit manager assignment
- Cost center designation

**Dependencies:**
- Requires Chart of Accounts
- Requires Calendar
- Requires Currency setup
- Associated with Legal Entity

**Attributes:**
- Business Unit Code
- Business Unit Name
- Legal Entity
- Chart of Accounts
- Calendar
- Default Currency
- Manager
- Location
- Active/Inactive Status

---

## 4. Chart of Accounts

### 4.1 Overview
The Chart of Accounts (COA) is the framework for capturing and organizing financial transactions. It uses a segmented structure for flexibility and detailed reporting.

### 4.2 Account Structure

#### 4.2.1 Segments
**Description:** Individual components of the accounting flexfield structure.

**Segment Types:**
- **Company Segment:** Identifies the legal entity or company
- **Cost Center Segment:** Identifies the department or cost center
- **Account Segment:** Identifies the natural account (GL account)
- **Product Segment:** Identifies product lines or services
- **Project Segment:** Identifies projects or initiatives
- **Intercompany Segment:** Identifies trading partners for IC transactions
- **Location Segment:** Identifies geographical locations
- **Future Segment:** Reserved for future use

**Features:**
- Segment naming and ordering
- Segment length definition (fixed or variable)
- Segment separators (configurable)
- Required vs. optional segments
- Segment qualifiers
- Cross-validation rules

#### 4.2.2 Value Sets
**Description:** Defines the valid values for each segment.

**Value Set Types:**
- Independent Value Set
- Dependent Value Set
- Table-validated Value Set
- Special Value Set
- Pair Value Set

**Features:**
- Value set name and description
- Validation type
- Value format (numeric, alphanumeric, special characters)
- Maximum value length
- Value ranges
- Default values
- Security rules
- Parent-child relationships

#### 4.2.3 Account Types
**Description:** Classification of accounts based on financial statement categories.

**Account Types:**
1. **Assets**
   - Current Assets
   - Fixed Assets
   - Intangible Assets
   - Other Assets

2. **Liabilities**
   - Current Liabilities
   - Long-term Liabilities
   - Other Liabilities

3. **Equity**
   - Share Capital
   - Retained Earnings
   - Other Equity

4. **Revenue/Income**
   - Operating Revenue
   - Non-operating Revenue
   - Other Income

5. **Expenses**
   - Operating Expenses
   - Cost of Goods Sold
   - Administrative Expenses
   - Other Expenses

**Features:**
- Account type assignment to account segment values
- Debit/Credit natural balance
- Financial statement mapping
- Account category assignment
- Sub-categories definition

### 4.3 Account Combinations
**Description:** Valid combinations of segment values forming complete GL accounts.

**Features:**
- Dynamic combination creation
- Cross-validation rules
- Allowed/disallowed combinations
- Account combination approval workflow
- Mass account generation
- Account alias/description
- Active date ranges
- Enabled/disabled status

### 4.4 Account Hierarchies
**Description:** Parent-child relationships for rollup reporting.

**Features:**
- Multiple hierarchy support
- Parent-child relationships
- Rollup groups
- Summary accounts
- Detail accounts
- Version control
- Effective dating

---

## 5. Calendar Management

### 5.1 Calendar Types

#### 5.1.1 Fiscal Calendar
**Description:** Custom fiscal period calendar based on business requirements.

**Features:**
- Configurable fiscal year start
- Variable period lengths
- 12-month or 13-period structures
- 4-4-5 or 5-4-4 period patterns
- Adjusting periods
- Multiple fiscal calendars
- Future year generation

**Attributes:**
- Calendar Name
- Calendar Type (Fiscal/Gregorian)
- Fiscal Year Start Month
- Number of Periods
- Period Naming Convention

#### 5.1.2 Calendar Year
**Description:** Standard calendar year from January to December.

**Features:**
- January to December periods
- Standard month-end dates
- Year-end processing
- Leap year handling

### 5.2 Period Management
**Description:** Management of accounting periods within calendars.

**Features:**
- Period name and number
- Period start and end dates
- Period type (standard, adjustment)
- Quarter and year assignment
- Period status (Never Opened, Open, Closed, Permanently Closed)
- Multiple period open simultaneously
- Period access by ledger
- Adjustment period configuration

**Period Statuses:**
- **Never Opened:** Period not yet available for transactions
- **Future Enterable:** Period open for specific transaction types
- **Open:** Period fully open for all transactions
- **Closed:** Period closed but can be reopened
- **Permanently Closed:** Period locked, cannot be reopened

---

## 6. Currency Management

### 6.1 Currency Setup
**Description:** Definition and management of currencies used across the organization.

**Features:**
- Currency code (ISO standard)
- Currency name and description
- Currency symbol
- Precision (decimal places)
- Minimum accountable unit
- Euro adoption details
- Active/inactive status
- Effective date ranges

### 6.2 Exchange Rates

#### 6.2.1 Rate Types
**Description:** Different types of exchange rates for various purposes.

**Rate Types:**
- Corporate Rate
- Spot Rate
- User Rate
- Historical Rate
- Budget Rate
- Average Rate
- Period-End Rate

**Features:**
- Rate type definition
- Rate source
- Rate application
- Default rate type by ledger

#### 6.2.2 Daily Rates
**Description:** Daily exchange rate maintenance and calculation.

**Features:**
- From/To currency pairs
- Conversion date
- Conversion rate
- Inverse rate calculation
- Rate effectivity
- Mass rate upload
- Rate override capability
- Cross-rate calculation
- Euro triangulation

### 6.3 Multi-Currency Processing
**Description:** Handling of foreign currency transactions.

**Features:**
- Entered currency (transaction currency)
- Functional currency (ledger currency)
- Reporting currency (secondary ledger)
- Automatic currency conversion
- Exchange rate variance tracking
- Realized/unrealized gains and losses
- Currency translation for consolidation

---

## 7. Journal Management

### 7.1 Journal Categories
**Description:** Classification of journal entries by source and type.

**Features:**
- Category name and description
- Category type (Manual, Imported, Automatic)
- Source system
- Default balancing segment
- Approval requirement
- Reversal method
- Effective date rules

**Standard Categories:**
- Manual Journals
- AP Invoices
- AR Invoices
- Cash Management
- Fixed Assets
- Allocations
- Revaluations
- Consolidation
- Intercompany
- Budget Journals

### 7.2 Journal Sources
**Description:** Origin systems and processes that create journal entries.

**Features:**
- Source name
- Source description
- Import reference tracking
- Freeze journal name option
- Require journal approval
- Allow auto-posting

### 7.3 Journal Entry

#### 7.3.1 Manual Journal Entry
**Description:** User-created journal entries for adjustments and corrections.

**Features:**
- Journal header information
- Journal name (manual/automatic)
- Journal description
- Journal category and source
- Accounting date
- Period name
- Currency
- Conversion rate
- Reversal information
- Journal lines entry
- Account combination selection
- Debit/Credit amounts
- Line description
- Statistical amounts
- Multi-line entry
- Copy journal functionality
- Template journals
- Recurring journals

**Journal Header Fields:**
- Journal Name
- Batch Name
- Category
- Source
- Accounting Date
- Period
- Currency
- Description
- Control Total
- Reversal Method (No Reversal, Manual, Automatic)
- Reversal Date
- Reversal Period

**Journal Line Fields:**
- Line Number
- Account Combination
- Debit Amount
- Credit Amount
- Description
- Statistical Amount
- Reference Fields (Invoice, PO, etc.)
- Tax Information
- Third-party Information

#### 7.3.2 Automated Journal Entry
**Description:** System-generated journal entries from automated processes.

**Features:**
- Auto-generated from subledgers
- Allocation-generated journals
- Revaluation journals
- Consolidation journals
- System-generated descriptions
- Auto-posting capability

### 7.4 Journal Batches
**Description:** Grouping of related journal entries.

**Features:**
- Batch name and description
- Batch status (Entered, Posted, Error)
- Batch control total
- Approval status
- Approval workflow
- Batch posting
- Batch deletion (unposted only)

### 7.5 Journal Processing

#### 7.5.1 Journal Validation
**Description:** Automated validation of journal entries before posting.

**Validation Rules:**
- Account combination validation
- Debit/Credit balance
- Period status check
- Currency validation
- Budget funds checking
- Cross-validation rules
- Intercompany balancing
- Required field validation

#### 7.5.2 Journal Approval
**Description:** Workflow-based approval of journal entries.

**Features:**
- Multi-level approval
- Approval hierarchy
- Amount-based approval limits
- Category-based routing
- Email notifications
- Rejection with comments
- Approval history tracking
- Delegate approval authority

#### 7.5.3 Journal Posting
**Description:** Process of committing journal entries to the GL.

**Features:**
- Individual journal posting
- Batch posting
- Automatic posting
- Posting validation
- Error handling and reporting
- Posting reversal
- Summarization options
- Concurrent posting
- Real-time balance updates

### 7.6 Journal Reversals
**Description:** Automatic reversal of journal entries.

**Reversal Methods:**
- No Reversal
- Manual Reversal
- Automatic Reversal (next period)
- Automatic Reversal (same period, different date)

**Features:**
- Reversal date specification
- Reversal period specification
- Reversal tracking
- Original journal reference
- Same absolute amounts, opposite sign

### 7.7 Recurring Journals
**Description:** Template journals that repeat on a regular schedule.

**Features:**
- Recurring formula definition
- Frequency (Monthly, Quarterly, Annually)
- Start and end dates
- Variable amount formulas
- Automatic generation
- Generation schedule
- Amount modification before posting
- Approval workflow

---

## 8. Period Close Process

### 8.1 Period Close Overview
**Description:** Month-end, quarter-end, and year-end closing procedures.

### 8.2 Period Close Checklist
**Description:** Configurable checklist of tasks for period close.

**Features:**
- Task definition and sequencing
- Task assignment
- Task dependencies
- Task status tracking
- Task completion validation
- Automated task execution
- Email notifications
- Exception reporting
- Close schedule calendar
- Historical close tracking

**Standard Tasks:**
1. Subledger transaction cut-off
2. Subledger reconciliation
3. Subledger transfer to GL
4. Manual journal entry
5. Accruals and deferrals
6. Bank reconciliation
7. Intercompany reconciliation and elimination
8. Foreign currency revaluation
9. Allocations
10. Budget vs. Actual review
11. Financial statement review
12. Account reconciliations
13. Close periods in subledgers
14. Close period in GL
15. Consolidation
16. Financial reporting

### 8.3 Account Reconciliation
**Description:** Process for reconciling GL accounts.

**Features:**
- Reconciliation templates
- Reconciliation assignment
- Balance comparison
- Variance analysis
- Supporting documentation
- Approval workflow
- Exception reporting
- Automated reconciliation
- Aging analysis
- Reconciliation status tracking

### 8.4 Period Closing
**Description:** Formal closure of accounting periods.

**Features:**
- Period status management
- Subledger close validation
- Period close by ledger
- Multiple period open support
- Adjustment period processing
- Year-end close
- Close reversal (reopen)
- Permanent close (year-end)
- Automated closing procedures
- Close audit trail

---

## 9. Consolidation

### 9.1 Consolidation Overview
**Description:** Combining financial results from multiple legal entities or business units.

### 9.2 Consolidation Methods

#### 9.2.1 Global Consolidation System (GCS)
**Description:** Comprehensive consolidation with eliminations and adjustments.

**Features:**
- Multi-level consolidation hierarchies
- Ownership percentages
- Minority interest calculation
- Equity method accounting
- Elimination entries
- Consolidation adjustments
- Translation adjustments
- Consolidation balances

#### 9.2.2 Simple Consolidation
**Description:** Basic rollup of balances without complex eliminations.

**Features:**
- Balance rollup
- Currency translation
- Reporting hierarchy
- Consolidation mapping

### 9.3 Consolidation Features
- Parent-child relationships
- Consolidation hierarchies
- Ownership tracking
- Minority interest
- Intercompany eliminations
- Currency translation
- Consolidation journals
- Elimination sets
- Consolidation reporting
- Multi-GAAP support

---

## 10. Allocations

### 10.1 Allocation Overview
**Description:** Distribution of costs or revenues across multiple accounts based on defined rules.

### 10.2 Allocation Types

#### 10.2.1 Manual Allocations
**Description:** User-defined allocation rules and formulas.

**Features:**
- Allocation formula definition
- Fixed percentage allocations
- Variable allocation basis
- Step-down allocations
- Reciprocal allocations

#### 10.2.2 Automated Allocations
**Description:** System-generated allocations based on predefined rules.

**Features:**
- Rule-based allocation
- Driver-based allocation (headcount, square footage, etc.)
- Usage-based allocation
- Activity-based costing
- Scheduled execution

### 10.3 Allocation Features
- Allocation rules
- Allocation pools
- Allocation sources
- Allocation targets
- Allocation basis/drivers
- Allocation formulas
- Offset accounts
- Allocation schedules
- Allocation reversal
- Allocation reporting
- Multi-step allocations
- Allocation validation

---

## 11. Revaluation

### 11.1 Foreign Currency Revaluation
**Description:** Adjustment of foreign currency balances to reflect current exchange rates.

**Features:**
- Revaluation process
- Revaluation rate types
- Unrealized gain/loss calculation
- Revaluation accounts
- Period-end rates
- Selective revaluation
- Account selection
- Revaluation reversal
- Revaluation history
- Revaluation reporting

**Process:**
1. Select accounts for revaluation
2. Specify revaluation date
3. Select exchange rate type
4. Calculate unrealized gains/losses
5. Generate revaluation journals
6. Post revaluation journals
7. Reverse in next period (optional)

### 11.2 Balance Sheet Revaluation
**Description:** Revaluation of assets and liabilities.

**Features:**
- Asset revaluation
- Liability revaluation
- Revaluation reserve
- Fair value adjustments

---

## 12. Intercompany Transactions

### 12.1 Intercompany Overview
**Description:** Transactions between legal entities within the same enterprise.

### 12.2 Intercompany Features
- Intercompany segment
- Trading partner identification
- Automatic balancing entries
- Intercompany accounts
- Sender/Receiver methodology
- Intercompany reconciliation
- Intercompany eliminations
- Due to/Due from accounts
- Intercompany reporting
- Automated IC postings
- IC transaction matching
- IC settlement

### 12.3 Intercompany Balancing
**Description:** Automatic creation of balancing entries for IC transactions.

**Features:**
- Balancing segment value rules
- Default IC accounts
- Automatic entry generation
- Balancing validation
- IC clearing accounts

---

## 13. Budget Management

### 13.1 Budget Overview
**Description:** Planning and controlling organizational spending.

### 13.2 Budget Types
- Annual Budget
- Revised Budget
- Supplementary Budget
- Rolling Forecast
- Zero-based Budget

### 13.3 Budget Features
- Budget definition
- Budget periods
- Budget accounts
- Budget amounts (Original, Revised, Current)
- Budget versions
- Budget scenarios
- Budget approval workflow
- Budget upload/download
- Budget journals
- Budget inquiry
- Budget vs. Actual reporting
- Budget variance analysis
- Budget carry-forward
- Budget templates

### 13.4 Funds Control
**Description:** Budget checking and enforcement.

**Features:**
- Funds checking
- Budget consumption
- Funds reservation
- Encumbrance accounting
- Budget override capability
- Budget tolerance rules
- Advisory vs. Absolute control
- Real-time funds checking

---

## 14. Reporting & Analytics

### 14.1 Standard Reports

#### 14.1.1 Financial Statements
- Balance Sheet
- Income Statement (P&L)
- Cash Flow Statement
- Statement of Changes in Equity
- Trial Balance
- Comparative statements
- Consolidated statements

#### 14.1.2 Operational Reports
- General Ledger Detail
- Journal Entry Reports
- Account Analysis
- Account Balance Inquiry
- Transaction Drill-down
- Audit Trail Report
- Posted Journal Register
- Unposted Journal Report
- Budget vs. Actual Report
- Allocation Reports
- Revaluation Reports
- Intercompany Reports

### 14.2 Report Features
- Multi-dimensional reporting
- Real-time data
- Historical period comparison
- Drill-down capability
- Export to Excel/PDF
- Scheduled report generation
- Report security
- Custom report builder
- Dashboard widgets
- KPI tracking

### 14.3 Financial Analytics
- Trend analysis
- Variance analysis
- Ratio analysis
- Profitability analysis
- Cost center analysis
- Segment analysis
- Multi-currency reporting
- Consolidated reporting

---

## 15. Security & Access Control

### 15.1 User Management
**Description:** User setup and access control.

**Features:**
- User creation and maintenance
- User roles and responsibilities
- Password management
- User groups
- User preferences
- Access logging
- User session management

### 15.2 Role-Based Access
**Description:** Access control based on job functions.

**Roles:**
- GL Accountant
- GL Manager
- GL Supervisor
- Financial Analyst
- Controller
- CFO
- Auditor (Read-only)
- System Administrator

### 15.3 Data Security

#### 15.3.1 Ledger Security
**Features:**
- Ledger access control
- Business unit access
- Legal entity access
- Multi-org access

#### 15.3.2 Account Security
**Features:**
- Segment value security
- Account combination security
- Cross-validation security

#### 15.3.3 Function Security
**Features:**
- Menu access control
- Function privileges
- Report access
- Data modification rights
- Posting privileges
- Approval authority

### 15.4 Audit Trail
**Description:** Complete audit trail of all transactions and changes.

**Features:**
- User audit trail
- Transaction audit trail
- Setup change audit trail
- Who-columns (Created By, Created Date, Last Updated By, Last Update Date)
- Journal audit trail
- Period close audit trail
- Security audit trail
- Login audit trail

---

## 16. Integration Points

### 16.1 Subledger Integration
**Description:** Integration with subledger modules.

**Integrated Modules:**
- Accounts Payable (AP)
- Accounts Receivable (AR)
- Fixed Assets (FA)
- Cash Management (CM)
- Order Management (OM)
- Purchasing
- Inventory
- Project Costing
- Payroll

**Features:**
- Automatic journal import
- Subledger accounting
- Transfer to GL
- Reconciliation
- Drill-back to source
- Real-time/batch integration

### 16.2 External System Integration
**Description:** Integration with external systems.

**Integration Methods:**
- API Integration
- File-based Integration (CSV, Excel, XML)
- Web Services
- EDI
- Database links

**Features:**
- Journal import
- Budget import
- Exchange rate import
- Account combination import
- Mass data upload
- Error handling
- Validation
- Transformation rules

---

## 17. Technical Requirements

### 17.1 Performance Requirements
- Support for high-volume transactions (millions of journal lines)
- Real-time balance inquiry
- Concurrent user support (100+ users)
- Fast period close (< 2 hours for month-end)
- Report generation (< 5 minutes for standard reports)

### 17.2 Data Retention
- Online transaction history (5 years minimum)
- Archived transaction history (unlimited)
- Audit trail retention (per regulatory requirements)
- Backup and recovery procedures

### 17.3 System Requirements
- Multi-tenant architecture
- Cloud-ready deployment
- Mobile accessibility
- Browser compatibility
- API-first design
- Scalability
- High availability
- Disaster recovery

---

## 18. Compliance & Standards

### 18.1 Accounting Standards
- GAAP (Generally Accepted Accounting Principles)
- IFRS (International Financial Reporting Standards)
- Local statutory requirements
- Multi-GAAP support

### 18.2 Regulatory Compliance
- SOX (Sarbanes-Oxley) compliance
- Tax compliance
- Statutory reporting
- Audit requirements
- Data privacy regulations (GDPR, etc.)

---

## 19. Future Enhancements

### 19.1 Phase 2 Features
- Advanced consolidation (VIE, equity method)
- Lease accounting (ASC 842, IFRS 16)
- Revenue recognition (ASC 606, IFRS 15)
- Advanced allocations (reciprocal, iterative)
- Predictive analytics
- AI-powered anomaly detection
- Blockchain integration for audit trail

### 19.2 Phase 3 Features
- Advanced budgeting (driver-based, rolling forecasts)
- Profitability and cost management
- Transfer pricing
- Sustainability accounting
- ESG reporting

---

## Document Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | October 26, 2025 | AI Development Team | Initial requirements document |

---

## Appendix

### A. Glossary
- **COA**: Chart of Accounts
- **GL**: General Ledger
- **IC**: Intercompany
- **GAAP**: Generally Accepted Accounting Principles
- **IFRS**: International Financial Reporting Standards
- **SOX**: Sarbanes-Oxley Act
- **AP**: Accounts Payable
- **AR**: Accounts Receivable
- **FA**: Fixed Assets
- **CM**: Cash Management

### B. References
- Oracle Fusion General Ledger Documentation
- GAAP Guidelines
- IFRS Standards
- SOX Compliance Requirements

---

**End of Document**
