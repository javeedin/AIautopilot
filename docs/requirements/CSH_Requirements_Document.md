# Cash Management Module - Requirements Document

## Executive Summary

The Cash Management (CSH) module provides comprehensive capabilities for managing cash and bank accounts, processing cash transactions, reconciling bank statements, forecasting cash positions, and optimizing cash utilization across the enterprise. This module integrates with Accounts Payable, Accounts Receivable, and General Ledger to provide complete visibility and control over cash flow.

**Module Code:** CSH
**Version:** 1.0
**Last Updated:** October 26, 2025

## Module Overview

### Purpose
The Cash Management module enables organizations to:
- Manage bank accounts and relationships across multiple banks and currencies
- Process cash receipts and payments efficiently
- Automate bank statement reconciliation
- Monitor cash positions in real-time
- Forecast cash flow for liquidity planning
- Optimize cash deployment and investment
- Manage intercompany cash transfers
- Control bank fees and charges
- Support treasury operations
- Ensure bank account security and controls

### Key Features
- Bank account management
- Cash receipt processing
- Cash disbursement management
- Bank statement reconciliation
- Cash position reporting
- Cash forecasting and projections
- Sweep accounts and pooling
- Bank fee management
- Intercompany cash transfers
- Lockbox processing
- Positive pay file generation
- Multi-currency cash management
- Bank integration (BAI2, MT940, etc.)
- Treasury workstation

---

## 1. Bank Account Setup

### 1.1 Bank Master Setup
**Requirement ID:** CSH-001

**Description:**
Maintain master data for banks and financial institutions where organization holds accounts.

**Functional Requirements:**
- Create bank master records
- Capture bank information:
  - Bank name
  - Bank identification (ABA/routing number, SWIFT code, IBAN)
  - Bank address and contact details
  - Relationship manager information
  - Primary contact for operations
- Set bank preferences
- Define bank holidays
- Manage bank documents and agreements
- Track bank ratings
- Maintain bank contact history
- Enable/disable banks

**Business Rules:**
- Bank ID must be unique
- Routing/SWIFT codes validated
- Bank contacts must be current
- Inactive banks cannot have new accounts

### 1.2 Bank Account Setup
**Requirement ID:** CSH-002

**Description:**
Set up and maintain bank accounts for cash management operations.

**Functional Requirements:**
- Create bank account records
- Capture account details:
  - Account number
  - Account name
  - Account type (Checking, Savings, Money Market, etc.)
  - Account currency
  - Account purpose
  - Account opening and closing dates
  - Account status (Active, Inactive, Closed)
- Link accounts to GL cash accounts
- Set account authorization limits
- Define signatories and approval levels
- Configure account for:
  - AR receipts
  - AP payments
  - Payroll
  - Wire transfers
- Set overdraft limits
- Maintain account documentation
- Track account balances

**Business Rules:**
- Account number unique within bank
- Each account linked to one GL account
- Account currency must match GL account currency
- Closed accounts cannot process transactions

### 1.3 Bank Account Security
**Requirement ID:** CSH-003

**Description:**
Implement security controls for bank account access and transactions.

**Functional Requirements:**
- Define account access roles:
  - View only
  - Initiate transactions
  - Approve transactions
  - Reconcile statements
  - Modify account setup
- Set transaction limits by user
- Configure dual authorization requirements
- Implement maker-checker workflows
- Define approval hierarchies by amount
- Log all account access
- Generate security audit reports
- Support segregation of duties
- Enable account-level permissions

**Business Rules:**
- High-value transactions require dual approval
- Maker cannot be checker
- Access logged for audit
- Permissions reviewed periodically

---

## 2. Cash Receipts

### 2.1 Cash Receipt Entry
**Requirement ID:** CSH-010

**Description:**
Record cash receipts from customers and other sources.

**Functional Requirements:**
- Create cash receipt records
- Capture receipt details:
  - Receipt date
  - Receipt amount and currency
  - Payment method (Cash, Check, Wire, ACH, etc.)
  - Bank account for deposit
  - Payer information
  - Reference numbers
- Link receipts to AR invoices
- Process unapplied cash
- Handle on-account receipts
- Support partial payments
- Process overpayments
- Generate receipt documents
- Post receipts to GL
- Track receipt status

**Business Rules:**
- Receipt must have deposit account
- Receipts posted to AR and GL
- Unapplied cash held in clearing account
- Receipt currency must match or be convertible

### 2.2 Lockbox Processing
**Requirement ID:** CSH-011

**Description:**
Process electronic lockbox files from banks to automate receipt application.

**Functional Requirements:**
- Import lockbox files (BAI2, XML, etc.)
- Parse lockbox transactions
- Match receipts to invoices automatically
- Apply matching rules:
  - Invoice number match
  - Customer number match
  - Amount match
- Handle exceptions
- Generate exception reports
- Reprocess corrected exceptions
- Post lockbox receipts
- Reconcile lockbox to bank statement
- Track lockbox volumes

**Business Rules:**
- Lockbox files processed daily
- Auto-matching reduces manual effort
- Exceptions reviewed before posting
- Lockbox deposits reconciled to statements

### 2.3 Credit Card Processing
**Requirement ID:** CSH-012

**Description:**
Process credit card receipts from payment gateways and processors.

**Functional Requirements:**
- Integrate with payment gateways
- Capture credit card transactions
- Process card authorizations
- Handle card captures and settlements
- Manage card refunds
- Process chargebacks
- Reconcile card batches
- Track card fees
- Support multiple card types
- Comply with PCI DSS
- Generate card reports

**Business Rules:**
- Card data encrypted and secure
- PCI compliance mandatory
- Card fees deducted from settlement
- Chargebacks reverse revenue and cash

---

## 3. Cash Disbursements

### 3.1 Payment Processing
**Requirement ID:** CSH-020

**Description:**
Process payments to suppliers, employees, and other payees.

**Functional Requirements:**
- Create payment batches
- Select invoices for payment
- Apply payment terms and discounts
- Generate payment proposals
- Approve payment batches
- Execute payments by method:
  - Check printing
  - ACH/EFT
  - Wire transfer
  - Virtual card
- Manage payment status
- Handle payment errors
- Void and reissue payments
- Post payments to GL
- Generate payment confirmations

**Business Rules:**
- Payments require approval
- Payment methods per supplier preference
- Payment dates respect terms and discounts
- Voided payments reversed in GL

### 3.2 Check Management
**Requirement ID:** CSH-021

**Description:**
Print, issue, and track checks for payments.

**Functional Requirements:**
- Configure check layouts
- Print checks on secure stock
- Assign check numbers
- Track check inventory
- Manage check stock
- Print check registers
- Handle check voids
- Process stop payments
- Track outstanding checks
- Reconcile cleared checks
- Generate check reports
- Support MICR printing

**Business Rules:**
- Check numbers sequential
- Voided check numbers not reused
- Check stock secured
- Outstanding checks aged and researched

### 3.3 Electronic Payments (ACH/Wire)
**Requirement ID:** CSH-022

**Description:**
Generate and transmit electronic payment files to banks.

**Functional Requirements:**
- Create ACH payment files (NACHA format)
- Create wire transfer files (ISO 20022, proprietary)
- Validate payment file format
- Encrypt payment files
- Transmit files to bank via:
  - SFTP
  - Bank portal
  - SWIFT network
- Receive payment confirmations
- Track payment status
- Handle payment returns
- Reconcile electronic payments
- Generate payment reports

**Business Rules:**
- Payment files validated before transmission
- Files encrypted for security
- Payment confirmations matched to payments
- Returns processed promptly

---

## 4. Bank Reconciliation

### 4.1 Bank Statement Import
**Requirement ID:** CSH-030

**Description:**
Import electronic bank statements for reconciliation.

**Functional Requirements:**
- Import bank statements (BAI2, MT940, etc.)
- Parse statement transactions
- Load statement data to reconciliation system
- Validate statement balances
- Handle multi-currency statements
- Support multiple statement formats
- Archive statement files
- Generate import logs
- Handle import errors

**Business Rules:**
- Statements imported daily
- Statement balance validated
- Import errors logged and resolved
- Statement files retained per policy

### 4.2 Automatic Reconciliation
**Requirement ID:** CSH-031

**Description:**
Automatically match bank statement transactions to cash transactions in the system.

**Functional Requirements:**
- Match statement lines to transactions
- Apply matching rules:
  - Exact amount match
  - Date range match
  - Check number match
  - Reference number match
  - Fuzzy matching
- Mark matched items as reconciled
- Identify unmatched statement items
- Identify unmatched system transactions
- Calculate reconciliation differences
- Generate reconciliation reports
- Support one-to-many matching
- Support many-to-one matching

**Business Rules:**
- Auto-matching reduces manual effort
- Multiple matching passes for different rules
- Unmatched items reviewed manually
- Reconciliation differences investigated

### 4.3 Manual Reconciliation
**Requirement ID:** CSH-032

**Description:**
Manually reconcile unmatched items and complete bank reconciliation.

**Functional Requirements:**
- Display unmatched statement items
- Display unmatched system transactions
- Manually match items
- Create adjusting entries
- Record bank charges
- Record interest income
- Record other bank transactions
- Mark reconciliation complete
- Approve reconciliation
- Post reconciliation entries to GL
- Archive reconciled statements
- Generate reconciliation reports

**Business Rules:**
- Unmatched items must be resolved
- Adjustments posted to GL
- Reconciliation approved before closing
- Reconciliation documented for audit

---

## 5. Cash Position Management

### 5.1 Cash Position Reporting
**Requirement ID:** CSH-040

**Description:**
Real-time visibility to cash positions across all bank accounts.

**Functional Requirements:**
- Display current cash balances
- Show available balances
- Display balances by:
  - Bank account
  - Bank
  - Currency
  - Legal entity
  - Business unit
- Drill down to transaction details
- Compare to prior periods
- Show intraday positions
- Generate cash position dashboards
- Export cash position data
- Support multi-currency views

**Business Rules:**
- Positions updated real-time
- Available balance = Ledger balance - Outstanding items
- Multi-currency converted to base currency
- Historical positions maintained

### 5.2 Cash Concentration
**Requirement ID:** CSH-041

**Description:**
Concentrate cash from multiple accounts into central accounts for optimization.

**Functional Requirements:**
- Define concentration structures
- Set up sweep rules
- Configure target balances
- Automate cash transfers
- Generate concentration reports
- Track transfer costs
- Optimize concentration timing
- Support zero-balance accounts
- Handle multi-currency sweeps
- Reconcile concentration transfers

**Business Rules:**
- Sweep thresholds minimize transfers
- Target balances maintain minimum liquidity
- Transfer costs considered in optimization
- Concentration executed daily

### 5.3 Investment Management
**Requirement ID:** CSH-042

**Description:**
Manage short-term investments of excess cash.

**Functional Requirements:**
- Identify investable cash
- Create investment proposals
- Approve investments
- Execute investments
- Track investment positions
- Monitor investment performance
- Process investment maturities
- Receive investment income
- Generate investment reports
- Support investment types:
  - Money market funds
  - Commercial paper
  - Treasury bills
  - Certificates of deposit
  - Repurchase agreements

**Business Rules:**
- Only excess cash invested
- Investment risk within policy
- Investments tracked separately from operating cash
- Investment income posted to GL

---

## 6. Cash Forecasting

### 6.1 Cash Flow Forecasting
**Requirement ID:** CSH-050

**Description:**
Forecast cash inflows and outflows for liquidity planning.

**Functional Requirements:**
- Generate cash forecasts
- Forecast time horizons:
  - Daily (next 30 days)
  - Weekly (next 90 days)
  - Monthly (next 12 months)
- Forecast sources:
  - Expected AR receipts
  - Scheduled AP payments
  - Payroll schedules
  - Debt service
  - Capital expenditures
  - Tax payments
- Compare forecast to actual
- Analyze forecast variance
- Update forecasts regularly
- Generate forecast reports
- Support scenario analysis

**Business Rules:**
- Forecasts updated weekly minimum
- Actuals compared to forecast for accuracy
- Variances investigated
- Forecast methodology refined over time

### 6.2 Liquidity Analysis
**Requirement ID:** CSH-051

**Description:**
Analyze liquidity to ensure sufficient cash for operations.

**Functional Requirements:**
- Calculate liquidity ratios
- Monitor days cash on hand
- Track working capital
- Analyze cash conversion cycle
- Identify liquidity gaps
- Model liquidity scenarios
- Generate liquidity reports
- Set liquidity alerts
- Track credit facility availability
- Support stress testing

**Business Rules:**
- Minimum liquidity thresholds maintained
- Liquidity alerts trigger actions
- Credit facilities backup for shortfalls
- Liquidity reviewed by management regularly

---

## 7. Bank Fee Management

### 7.1 Bank Fee Capture
**Requirement ID:** CSH-060

**Description:**
Capture and track bank fees and service charges.

**Functional Requirements:**
- Import bank fee data
- Manually enter fees
- Categorize fee types:
  - Account maintenance
  - Transaction fees
  - Wire fees
  - Overdraft fees
  - Analysis charges
  - Compensating balance credits
- Allocate fees to cost centers
- Post fees to GL
- Track fees over time
- Compare fees to agreements

**Business Rules:**
- Fees posted to expense accounts
- Fees allocated per usage
- Fees validated against bank agreements
- Excessive fees investigated

### 7.2 Bank Fee Analysis
**Requirement ID:** CSH-061

**Description:**
Analyze bank fees to identify optimization opportunities.

**Functional Requirements:**
- Generate fee analysis reports
- Compare fees across banks
- Track fee trends
- Identify fee anomalies
- Benchmark fees to market
- Calculate effective cost per transaction
- Generate fee dashboards
- Support fee negotiations
- Track fee reduction initiatives

**Business Rules:**
- Fee analysis performed quarterly
- Opportunities for fee reduction identified
- Fee agreements renegotiated periodically
- Fee optimization improves cash flow

---

## 8. Intercompany Cash Management

### 8.1 Intercompany Transfers
**Requirement ID:** CSH-070

**Description:**
Process cash transfers between legal entities and business units.

**Functional Requirements:**
- Create intercompany transfer requests
- Approve transfer requests
- Execute transfers
- Record intercompany receivables/payables
- Post to GL in both entities
- Support multi-currency transfers
- Calculate interest on balances
- Generate intercompany statements
- Reconcile intercompany accounts
- Track transfer timing and costs

**Business Rules:**
- Transfers documented with proper approvals
- Intercompany accounts reconcile regularly
- Interest charged per policy
- Transfer pricing compliant with tax rules

### 8.2 Intercompany Netting
**Requirement ID:** CSH-071

**Description:**
Net intercompany balances to minimize cash movements and fees.

**Functional Requirements:**
- Identify intercompany balances
- Calculate net positions
- Generate netting proposals
- Approve netting
- Execute netting settlements
- Minimize number of payments
- Track netting savings
- Generate netting reports
- Support multilateral netting
- Handle multi-currency netting

**Business Rules:**
- Netting executed periodically (weekly/monthly)
- Netting reduces transaction costs
- All parties agree to netting
- Netting complies with legal requirements

---

## 9. Positive Pay and Fraud Prevention

### 9.1 Positive Pay
**Requirement ID:** CSH-080

**Description:**
Generate positive pay files to prevent check fraud.

**Functional Requirements:**
- Generate positive pay issue files
- Transmit files to banks
- Receive exception reports from banks
- Review exceptions
- Approve or reject exception items
- Track positive pay status
- Support reverse positive pay
- Generate positive pay reports
- Handle check voids

**Business Rules:**
- Issue files sent before checks presented
- All exceptions reviewed same day
- Fraudulent items rejected
- Legitimate exceptions approved

### 9.2 Fraud Detection
**Requirement ID:** CSH-081

**Description:**
Monitor cash transactions for potential fraud.

**Functional Requirements:**
- Define fraud detection rules
- Monitor for unusual transactions
- Flag high-risk items
- Alert on suspicious activity
- Investigate flagged transactions
- Document fraud cases
- Generate fraud reports
- Track fraud losses
- Support fraud prevention training

**Fraud Indicators:**
- Transactions outside normal patterns
- Large or unusual amounts
- Unauthorized users
- After-hours activity
- Multiple small transactions
- Transactions to new payees

---

## 10. Multi-Currency Cash Management

### 10.1 Foreign Currency Accounts
**Requirement ID:** CSH-090

**Description:**
Manage bank accounts in multiple currencies.

**Functional Requirements:**
- Support multi-currency accounts
- Track balances in transaction currency
- Convert to reporting currency
- Handle exchange rate differences
- Revalue currency accounts
- Post revaluation gains/losses
- Generate multi-currency reports
- Support currency hedging
- Track currency exposure

**Business Rules:**
- Functional currency per legal entity
- Revaluation performed monthly
- Gains/losses posted to GL
- Currency risk managed per policy

### 10.2 Foreign Exchange Transactions
**Requirement ID:** CSH-091

**Description:**
Process foreign exchange transactions and currency conversions.

**Functional Requirements:**
- Execute FX spot transactions
- Process forward contracts
- Handle currency swaps
- Record FX gains/losses
- Track FX positions
- Monitor FX exposure
- Generate FX reports
- Support hedge accounting
- Integrate with FX trading platforms

**Business Rules:**
- FX transactions authorized
- FX gains/losses recorded
- Hedge effectiveness tested
- FX risk within policy limits

---

## 11. Treasury Management

### 11.1 Debt Management
**Requirement ID:** CSH-100

**Description:**
Manage short-term and long-term debt obligations.

**Functional Requirements:**
- Record debt instruments
- Track debt balances
- Schedule debt payments
- Calculate interest expense
- Process debt payments
- Track debt covenants
- Monitor debt ratios
- Generate debt reports
- Support debt refinancing
- Maintain debt documentation

**Business Rules:**
- Debt service scheduled in advance
- Covenant compliance monitored
- Interest expense accrued monthly
- Debt capacity managed within policy

### 11.2 Letter of Credit Management
**Requirement ID:** CSH-101

**Description:**
Manage letters of credit for trade finance.

**Functional Requirements:**
- Request letters of credit
- Track LC status
- Monitor LC expiration
- Process LC amendments
- Record LC fees
- Track LC utilization
- Receive LC documents
- Process LC payments
- Close LCs
- Generate LC reports

**Business Rules:**
- LCs authorized before issuance
- LC expiration monitored
- LC fees charged to projects
- LC documents reviewed for compliance

---

## 12. Integration Points

### 12.1 Integration with Accounts Receivable
**Requirement ID:** CSH-110

**Description:**
Integrate with AR for receipt processing and application.

**Integration Points:**
- Import cash receipts to AR
- Apply receipts to invoices
- Clear AR balances
- Sync customer payments
- Update AR aging
- Post receipt entries to GL

### 12.2 Integration with Accounts Payable
**Requirement ID:** CSH-111

**Description:**
Integrate with AP for payment processing.

**Integration Points:**
- Select AP invoices for payment
- Generate payment files
- Update AP balances
- Clear AP invoices
- Post payment entries to GL
- Sync supplier payments

### 12.3 Integration with General Ledger
**Requirement ID:** CSH-112

**Description:**
Post all cash transactions to General Ledger.

**Integration Points:**
- Post cash receipts
- Post cash disbursements
- Post bank charges
- Post reconciliation adjustments
- Post revaluation entries
- Post intercompany transactions
- Reconcile cash subledger to GL

### 12.4 Bank Integration
**Requirement ID:** CSH-113

**Description:**
Electronic integration with banks for statements, payments, and balances.

**Integration Points:**
- Download bank statements (BAI2, MT940, OFX)
- Upload payment files (ACH, wire)
- Retrieve intraday balances
- Receive payment confirmations
- Submit positive pay files
- Receive lockbox files
- Integration protocols: SFTP, API, SWIFT

---

## 13. Reporting and Analytics

### 13.1 Standard Reports
**Requirement ID:** CSH-120

**Description:**
Comprehensive cash management reporting.

**Standard Reports:**
- Bank Account List
- Cash Position Summary
- Cash Flow Statement
- Bank Reconciliation Report
- Outstanding Checks Report
- Cash Forecast Report
- Liquidity Report
- Bank Fee Analysis
- Intercompany Cash Report
- Currency Exposure Report

**Functional Requirements:**
- Generate reports on demand
- Schedule recurring reports
- Export to Excel, PDF
- Drill-down capabilities
- Multi-currency reporting
- Trend analysis
- Comparison reporting

### 13.2 Treasury Dashboard
**Requirement ID:** CSH-121

**Description:**
Real-time treasury dashboard for cash visibility.

**Functional Requirements:**
- Display key cash metrics
- Show cash positions
- Display liquidity indicators
- Forecast vs. actual
- Bank account summary
- Pending transactions
- Alerts and exceptions
- Customizable views
- Mobile access

**Key Metrics:**
- Total cash balance
- Available cash
- Invested cash
- Forecasted cash
- Days cash on hand
- Debt balance
- Net debt

---

## 14. Security and Controls

### 14.1 Cash Management Security
**Requirement ID:** CSH-130

**Description:**
Implement comprehensive security for cash management.

**Security Requirements:**
- Role-based access control
- Segregation of duties
- Transaction limits by user
- Dual authorization for high-value transactions
- Audit logging
- Password policies
- Session timeouts
- Data encryption
- Secure file transmission

**User Roles:**
- Cash Manager
- Cash Analyst
- Bank Reconciler
- Payment Processor
- Payment Approver
- Treasurer
- Read-Only User

### 14.2 Audit and Compliance
**Requirement ID:** CSH-131

**Description:**
Maintain audit trail and ensure compliance.

**Audit Requirements:**
- Log all transactions
- Track user actions
- Maintain change history
- Support audit queries
- Generate audit reports
- Retain data per policy
- Support SOX compliance
- Enable internal controls testing

---

## 15. Technical Requirements

### 15.1 Performance Requirements
- Bank statement import: 100,000 transactions in <10 minutes
- Auto-reconciliation: Match 95%+ of transactions
- Cash position refresh: <30 seconds
- Payment file generation: 10,000 payments in <5 minutes
- Concurrent users: 100+

### 15.2 Data Volume Estimates
- Bank accounts: 1,000+
- Daily transactions: 100,000+
- Bank statements per month: 1,000+
- Payments per month: 50,000+
- Historical data retained: 84 months

### 15.3 Integration Requirements
- Real-time integration with AR, AP
- Daily bank statement imports
- Multiple bank file formats
- Secure file transmission (SFTP, HTTPS)
- API support for bank connections
- SWIFT network connectivity

---

## Appendix

### A. Glossary
- **BAI2:** Bank Administration Institute format for bank statements
- **MT940:** SWIFT message type for bank statements
- **NACHA:** National Automated Clearing House Association (ACH format)
- **Positive Pay:** Fraud prevention service matching issued checks to presented checks
- **Lockbox:** Bank service capturing customer payments
- **Sweep Account:** Automatic transfer of funds to/from account to maintain target balance
- **Days Cash on Hand:** Cash and equivalents divided by daily operating expenses

### B. Related Documents
- Accounts Receivable Requirements
- Accounts Payable Requirements
- General Ledger Requirements
- Treasury Policy Manual

### C. Assumptions
- Organization has relationships with multiple banks
- Electronic bank integration available
- Cash concentrated to minimize idle balances
- Treasury function manages cash centrally
- Multi-currency operations

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Final
**Total Features:** 100+ features across all cash management areas
