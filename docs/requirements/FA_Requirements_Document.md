# Fixed Assets Module - Requirements Document

## Executive Summary

The Fixed Assets (FA) module provides comprehensive capabilities for managing the complete lifecycle of fixed assets from acquisition through disposal. This module handles asset capitalization, depreciation, transfers, retirements, and compliance with accounting standards and tax regulations.

**Module Code:** FA
**Version:** 1.0
**Last Updated:** October 26, 2025

## Module Overview

### Purpose
The Fixed Assets module enables organizations to:
- Track and manage all fixed assets throughout their lifecycle
- Calculate and record depreciation using multiple methods
- Ensure compliance with GAAP, IFRS, and tax regulations
- Support multiple depreciation books for different reporting requirements
- Manage asset additions, transfers, retirements, and disposals
- Track asset locations, custodians, and maintenance
- Generate asset reports for financial and operational purposes
- Support asset impairment and revaluation
- Integrate with AP, GL, and other modules
- Manage asset groups, categories, and hierarchies

### Key Features
- Asset master data management
- Multiple depreciation methods (Straight-line, Declining balance, Units of production, Sum-of-years digits, MACRS)
- Multiple asset books (Corporate, Tax, IFRS, etc.)
- Asset additions and acquisitions
- Asset transfers between locations and cost centers
- Asset retirements and disposals
- Depreciation processing and posting
- Asset physical inventory
- Asset impairment testing
- Lease asset management
- Construction in progress (CIP)
- Asset revaluation
- Comprehensive asset reporting

---

## 1. Asset Setup

### 1.1 Asset Categories
**Requirement ID:** FA-001

**Description:**
Define asset categories to classify and group assets for accounting, reporting, and management purposes.

**Functional Requirements:**
- Create asset category master
- Define category attributes:
  - Category name and description
  - Category type (Tangible, Intangible, Natural Resources)
  - Useful life range
  - Default depreciation method
  - Capitalization threshold
  - GL account defaults
- Support category hierarchies
- Set category-level controls
- Define reporting categories
- Enable/disable categories
- Map categories to tax classes
- Create subcategories

**Standard Asset Categories:**
- Land
- Buildings
- Leasehold Improvements
- Machinery and Equipment
- Furniture and Fixtures
- Vehicles
- Computer Equipment
- Software
- Office Equipment
- Construction in Progress

**Business Rules:**
- Categories determine default accounting treatment
- Capitalization threshold per category
- Assets inherit category defaults
- Category changes restricted for assets in service

### 1.2 Asset Books
**Requirement ID:** FA-002

**Description:**
Set up multiple asset books to support different depreciation and reporting requirements.

**Functional Requirements:**
- Create asset books
- Define book purposes:
  - Corporate (GAAP)
  - Tax
  - IFRS
  - Regulatory
  - Management
- Set book parameters:
  - Fiscal calendar
  - Depreciation conventions
  - Basis rules
  - Retirement conventions
  - Prorate conventions
- Configure GL integration per book
- Define primary book
- Enable/disable books
- Support book-specific depreciation methods

**Business Rules:**
- Minimum one asset book required
- Primary book used for GL posting
- Tax book follows tax regulations
- Book methods can differ
- All books track same physical assets

### 1.3 Depreciation Methods
**Requirement ID:** FA-003

**Description:**
Configure depreciation methods available for calculating asset depreciation.

**Functional Requirements:**
- Define depreciation methods:
  - Straight-Line
  - Declining Balance (150%, 200%)
  - Sum-of-Years-Digits
  - Units of Production
  - MACRS (Modified Accelerated Cost Recovery System)
  - ACRS
  - Custom methods
- Set method parameters
- Define depreciation rules
- Configure proration options
- Support half-year conventions
- Support mid-quarter conventions
- Define bonus depreciation rules
- Enable method changes with proper accounting

**Business Rules:**
- Method determines depreciation calculation
- Tax methods must comply with regulations
- Method changes require approval
- Proration based on in-service date

---

## 2. Asset Acquisition

### 2.1 Asset Addition
**Requirement ID:** FA-010

**Description:**
Add new assets to the fixed asset system.

**Functional Requirements:**
- Create asset master records
- Capture asset details:
  - Asset number (auto or manual)
  - Asset description
  - Asset category
  - Serial number
  - Model number
  - Manufacturer
  - Purchase date
  - In-service date
  - Original cost
  - Quantity
  - Location
  - Custodian/responsible party
  - Supplier
  - PO/Invoice reference
- Support bulk asset additions
- Generate asset tags/labels
- Assign depreciation methods per book
- Set useful life per book
- Calculate and set depreciation start date
- Link to AP invoice or PO
- Attach asset documents (warranty, title, etc.)

**Business Rules:**
- Asset number must be unique
- In-service date starts depreciation
- Cost from AP invoice or manual entry
- Asset capitalized if exceeds threshold
- Below threshold assets expensed

### 2.2 Asset Sourcing from AP
**Requirement ID:** FA-011

**Description:**
Create assets directly from Accounts Payable invoices for capital purchases.

**Functional Requirements:**
- Flag AP invoice lines as capital
- Create asset from AP invoice
- Populate asset cost from invoice amount
- Link asset to invoice for traceability
- Support multiple assets from one invoice
- Support invoice line splitting to assets
- Accrue asset if not yet in service
- Capitalize upon in-service
- Handle landed costs and installation costs
- Process AP invoice-to-asset matching

**Business Rules:**
- AP capital line creates asset or CIP
- Asset cost includes all capitalized costs
- Asset not depreciated until in service
- Link maintained for audit trail

### 2.3 Construction in Progress (CIP)
**Requirement ID:** FA-012

**Description:**
Track assets under construction before capitalization as fixed assets.

**Functional Requirements:**
- Create CIP projects
- Track CIP costs:
  - Materials
  - Labor
  - Overhead
  - Interest costs
  - Engineering/design
  - Permits and fees
- Allocate costs to CIP
- Transfer CIP to fixed assets upon completion
- Support partial transfers
- Capitalize interest per rules
- Generate CIP reports
- Track CIP aging
- Set CIP completion criteria

**Business Rules:**
- CIP not depreciated
- Costs accumulated until project complete
- Interest capitalized per policy
- Transfer to asset places in service
- CIP projects reviewed regularly

---

## 3. Asset Depreciation

### 3.1 Depreciation Calculation
**Requirement ID:** FA-020

**Description:**
Calculate depreciation expense for all assets using configured methods.

**Functional Requirements:**
- Calculate depreciation per book
- Support multiple depreciation methods
- Handle proration for partial periods
- Apply depreciation conventions
- Calculate bonus depreciation (tax)
- Calculate Section 179 expense (tax)
- Handle salvage value
- Support depreciation caps
- Recalculate on method/life changes
- Generate depreciation schedules
- Support manual depreciation overrides
- Handle catch-up depreciation
- Process mass depreciation

**Depreciation Formulas:**
- **Straight-Line:** (Cost - Salvage) / Useful Life
- **Declining Balance:** Book Value × Rate
- **Units of Production:** (Cost - Salvage) × (Units This Period / Total Lifetime Units)
- **Sum-of-Years-Digits:** (Cost - Salvage) × (Remaining Life / SYD)

**Business Rules:**
- Depreciation starts on in-service date
- Depreciation stops when fully depreciated or retired
- Net book value cannot go below salvage value
- Tax depreciation follows IRS rules

### 3.2 Depreciation Processing
**Requirement ID:** FA-021

**Description:**
Run periodic depreciation processing to record depreciation expense.

**Functional Requirements:**
- Run depreciation by period
- Process by book
- Calculate depreciation for all assets
- Generate depreciation journals
- Post to GL
- Handle depreciation errors
- Support depreciation simulation
- Generate processing logs
- Enable period reopening
- Support prior period adjustments
- Mass depreciation processing
- Validate before posting

**Business Rules:**
- Depreciation run monthly/annually per book
- Posted depreciation cannot be deleted
- Errors corrected and reprocessed
- Simulation validates before live run

### 3.3 Depreciation Adjustment
**Requirement ID:** FA-022

**Description:**
Adjust depreciation for errors, changes in estimates, or accounting corrections.

**Functional Requirements:**
- Create depreciation adjustments
- Adjust current period depreciation
- Process catch-up depreciation
- Handle changes in useful life
- Handle changes in salvage value
- Recalculate depreciation prospectively
- Document adjustment reasons
- Require approval for adjustments
- Post adjustment entries
- Generate adjustment reports

**Business Rules:**
- Adjustments documented with reason
- Significant adjustments require approval
- Changes applied prospectively (unless error correction)
- Prior periods reopened only for errors

---

## 4. Asset Transfers

### 4.1 Inter-Location Transfers
**Requirement ID:** FA-030

**Description:**
Transfer assets between physical locations while maintaining accounting records.

**Functional Requirements:**
- Create transfer requests
- Select assets for transfer
- Define source and destination locations
- Record transfer date
- Update asset location
- Maintain transfer history
- Generate transfer documents
- Track assets in transit
- Support bulk transfers
- Approve transfers
- Update custodian information
- No depreciation impact for location transfers

**Business Rules:**
- Transfer doesn't affect depreciation
- Transfer documented for audit
- Physical movement tracked
- Custodian updated with location

### 4.2 Inter-Cost Center Transfers
**Requirement ID:** FA-031

**Description:**
Transfer assets between cost centers, changing accounting assignment.

**Functional Requirements:**
- Create cost center transfer
- Select assets to transfer
- Define source and destination cost centers
- Record transfer effective date
- Update GL account assignments
- Recalculate depreciation allocation
- Post transfer entries to GL
- Maintain transfer history
- Require approval for transfers
- Generate transfer reports

**Business Rules:**
- Transfer changes depreciation expense allocation
- Transfer effective on specified date
- GL entries created for transfer
- Historical cost center retained for reporting

### 4.3 Inter-Company Transfers
**Requirement ID:** FA-032

**Description:**
Transfer assets between legal entities with proper intercompany accounting.

**Functional Requirements:**
- Create intercompany transfer
- Define source and destination entities
- Determine transfer price
- Retire asset in source entity
- Add asset in destination entity
- Calculate gain/loss on transfer
- Create intercompany receivable/payable
- Post entries in both entities
- Eliminate on consolidation
- Document transfer pricing
- Support tax basis tracking

**Business Rules:**
- Transfer price per policy (book value, FMV, etc.)
- Gain/loss recognized in source entity
- Destination cost = transfer price
- Transfer pricing must support tax compliance

---

## 5. Asset Retirements and Disposals

### 5.1 Asset Retirement
**Requirement ID:** FA-040

**Description:**
Retire assets from service and remove from active asset records.

**Functional Requirements:**
- Create retirement transaction
- Select assets to retire
- Define retirement date
- Specify retirement reason:
  - Sale
  - Disposal/scrap
  - Lost/stolen
  - Trade-in
  - Full depreciation
- Calculate gain/loss on retirement
- Calculate final depreciation
- Update asset status to retired
- Post retirement entries to GL
- Remove from depreciation processing
- Retain retired asset records
- Generate retirement documents

**Gain/Loss Calculation:**
- Proceeds - Net Book Value = Gain (if positive) or Loss (if negative)
- Net Book Value = Cost - Accumulated Depreciation

**Business Rules:**
- Retirement stops depreciation
- Gain/loss recognized in period of retirement
- Retired assets retained for history
- Cannot retire assets with NBV > 0 without reason

### 5.2 Asset Sale
**Requirement ID:** FA-041

**Description:**
Process asset sales including proceeds and gain/loss recognition.

**Functional Requirements:**
- Record asset sale transaction
- Capture sale details:
  - Sale date
  - Buyer information
  - Sale price (proceeds)
  - Sale expenses
- Calculate net proceeds
- Calculate gain/loss on sale
- Link to AR invoice (if applicable)
- Post sale entries to GL
- Update asset status
- Generate sale documents
- Track sales tax

**Business Rules:**
- Gain/loss = Net proceeds - NBV
- Sale date determines final depreciation
- Proceeds received through AR or cash
- Sales tax handled per regulations

### 5.3 Asset Disposal
**Requirement ID:** FA-042

**Description:**
Process asset disposals for scrapped, damaged, or obsolete assets.

**Functional Requirements:**
- Create disposal transaction
- Record disposal details:
  - Disposal date
  - Disposal method
  - Disposal cost (if any)
  - Environmental compliance
- Calculate loss on disposal
- Post disposal entries
- Update asset status
- Generate disposal documents
- Track disposal costs
- Document disposal compliance

**Business Rules:**
- Disposal typically results in loss
- Disposal costs expensed
- Environmental disposal requirements followed
- Disposal documented for audit

---

## 6. Asset Physical Inventory

### 6.1 Physical Inventory Process
**Requirement ID:** FA-050

**Description:**
Conduct physical inventory counts of fixed assets to verify existence and location.

**Functional Requirements:**
- Create physical inventory events
- Generate count sheets
- Assign counters
- Support mobile counting apps
- Record count results
- Compare to asset records
- Identify missing assets
- Identify found assets (unrecorded)
- Update asset locations
- Generate variance reports
- Adjust asset records
- Document inventory process

**Business Rules:**
- Physical inventory conducted annually minimum
- Variances investigated
- Missing assets researched before write-off
- Found assets capitalized if meet threshold

### 6.2 Asset Verification
**Requirement ID:** FA-051

**Description:**
Verify asset existence, condition, and custodian assignment.

**Functional Requirements:**
- Generate asset verification lists
- Assign verification tasks
- Verify asset details:
  - Physical existence
  - Location
  - Condition
  - Custodian
  - Tag/serial number
- Update asset records
- Flag discrepancies
- Generate verification reports
- Track verification completion
- Support photo documentation

**Business Rules:**
- Verification periodic per policy
- Discrepancies resolved promptly
- Verification documented
- High-value assets verified more frequently

---

## 7. Asset Impairment and Revaluation

### 7.1 Asset Impairment
**Requirement ID:** FA-060

**Description:**
Test assets for impairment and record impairment losses per accounting standards.

**Functional Requirements:**
- Identify impairment indicators
- Test assets for impairment
- Calculate recoverable amount
- Determine impairment loss
- Record impairment charge
- Adjust asset carrying value
- Update depreciation schedules
- Post impairment to GL
- Generate impairment reports
- Document impairment testing
- Support impairment reversal (IFRS)

**Impairment Calculation:**
- Impairment Loss = Carrying Amount - Recoverable Amount
- Recoverable Amount = Higher of Fair Value less Costs to Sell or Value in Use

**Business Rules:**
- Impairment reduces carrying value
- Future depreciation on reduced basis
- GAAP: impairment not reversed
- IFRS: impairment may be reversed

### 7.2 Asset Revaluation
**Requirement ID:** FA-061

**Description:**
Revalue assets to fair value under IFRS revaluation model.

**Functional Requirements:**
- Select assets for revaluation
- Capture fair value
- Calculate revaluation surplus/deficit
- Update asset carrying amount
- Adjust accumulated depreciation
- Record revaluation surplus in OCI
- Post revaluation entries
- Update depreciation basis
- Maintain revaluation history
- Generate revaluation reports

**Business Rules:**
- Revaluation permitted under IFRS
- Entire class revalued consistently
- Revaluation surplus in equity
- Depreciation on revalued amount

---

## 8. Lease Asset Management

### 8.1 Lease Assets (ASC 842 / IFRS 16)
**Requirement ID:** FA-070

**Description:**
Manage right-of-use (ROU) assets and lease liabilities per new lease accounting standards.

**Functional Requirements:**
- Classify leases (operating vs. finance)
- Calculate lease liability
- Calculate ROU asset
- Record lease commencement
- Calculate lease depreciation/amortization
- Calculate interest expense
- Process lease payments
- Allocate payments to principal and interest
- Handle lease modifications
- Process lease terminations
- Generate lease schedules
- Post lease entries to GL

**Lease Calculations:**
- Lease Liability = PV of future lease payments
- ROU Asset = Lease Liability + Initial Direct Costs + Prepayments - Lease Incentives

**Business Rules:**
- Leases >12 months capitalized
- Short-term leases may be expensed
- Finance leases: depreciation + interest
- Operating leases: straight-line expense (GAAP) or depreciation + interest (IFRS)

### 8.2 Lease Modification
**Requirement ID:** FA-071

**Description:**
Process lease modifications and remeasurements.

**Functional Requirements:**
- Identify lease modifications
- Determine modification accounting
- Remeasure lease liability
- Adjust ROU asset
- Recalculate depreciation
- Update lease terms
- Post modification entries
- Generate modification reports
- Document modification

**Business Rules:**
- Modification changes lease terms
- Remeasurement adjusts liability and asset
- Accounting depends on modification type
- Updated schedules prospective

---

## 9. Asset Reporting

### 9.1 Standard Reports
**Requirement ID:** FA-080

**Description:**
Comprehensive fixed asset reporting for financial and operational purposes.

**Standard Reports:**
- Asset Register
- Depreciation Schedule
- Asset Additions Report
- Asset Retirements Report
- Asset Transfer Report
- Depreciation Expense Report
- Asset Listing by Location
- Asset Listing by Category
- Asset Listing by Custodian
- Net Book Value Report
- Fully Depreciated Assets
- Asset Roll Forward
- Projected Depreciation
- Asset Physical Inventory Report
- Asset Missing/Found Report
- Lease Schedule
- Construction in Progress Report

**Functional Requirements:**
- Generate reports on demand
- Schedule recurring reports
- Export to Excel, PDF
- Support drill-down
- Multi-book reporting
- Multi-entity consolidation
- Historical reporting
- Comparative reporting

### 9.2 Asset Analytics
**Requirement ID:** FA-081

**Description:**
Analytics and dashboards for asset portfolio analysis.

**Functional Requirements:**
- Asset portfolio dashboard
- Depreciation analytics
- Asset lifecycle analytics
- Asset utilization metrics
- Replacement analysis
- Asset age analysis
- Category performance
- Location analysis
- Generate trend reports
- Support predictive analytics

**Key Metrics:**
- Total asset value
- Net book value
- Accumulated depreciation
- Average asset age
- Depreciation expense
- Capitalization rate
- Retirement rate
- Asset turnover

---

## 10. Integration Points

### 10.1 Integration with Accounts Payable
**Requirement ID:** FA-090

**Description:**
Integrate with AP to create assets from capital purchases.

**Integration Points:**
- Flag AP invoices as capital
- Create assets from AP invoices
- Link assets to invoices
- Clear AP accrual on asset capitalization
- Sync vendor information
- Process invoice adjustments to assets

### 10.2 Integration with General Ledger
**Requirement ID:** FA-091

**Description:**
Post all asset transactions to General Ledger.

**Integration Points:**
- Post asset additions
- Post depreciation expense
- Post asset retirements
- Post asset transfers
- Post impairment charges
- Post revaluation entries
- Post lease entries
- Reconcile FA subledger to GL
- Support multiple GL books

### 10.3 Integration with Purchasing
**Requirement ID:** FA-092

**Description:**
Link assets to purchase orders for capital procurement.

**Integration Points:**
- Flag PO lines as capital
- Link PO to asset on receipt
- Track capital budgets
- Capital PO approvals
- CIP tracking from PO

---

## 11. Asset Security and Controls

### 11.1 Asset Security
**Requirement ID:** FA-100

**Description:**
Implement security controls for fixed asset management.

**Security Requirements:**
- Role-based access control
- Asset data access by entity/location
- Restrict asset additions
- Restrict retirements
- Restrict transfers
- Restrict depreciation changes
- Audit logging
- Segregation of duties
- Approval workflows

**User Roles:**
- Asset Manager
- Asset Accountant
- Asset Custodian
- Physical Inventory Counter
- Approver
- Read-Only User

### 11.2 Asset Audit Trail
**Requirement ID:** FA-101

**Description:**
Maintain comprehensive audit trail for all asset transactions.

**Audit Requirements:**
- Log all asset changes
- Track depreciation history
- Record transfers
- Document retirements
- Maintain transaction history
- Support audit queries
- Generate audit reports
- Retain per retention policy

---

## 12. Compliance and Standards

### 12.1 Accounting Standards
- US GAAP (ASC 360 - Property, Plant, and Equipment)
- IFRS (IAS 16 - Property, Plant, and Equipment)
- IFRS (IAS 38 - Intangible Assets)
- ASC 842 / IFRS 16 (Leases)
- Sarbanes-Oxley (SOX) compliance

### 12.2 Tax Compliance
- IRS regulations (MACRS, Section 179, Bonus Depreciation)
- Tax basis tracking
- Form 4562 (Depreciation and Amortization)
- Tax depreciation limits
- Alternative Minimum Tax (AMT) considerations

---

## 13. Technical Requirements

### 13.1 Performance Requirements
- Asset depreciation processing: 100,000 assets in <30 minutes
- Asset inquiry response: <2 seconds
- Bulk asset addition: 10,000 assets per hour
- Report generation: <60 seconds for standard reports
- Concurrent users: 100+

### 13.2 Data Volume Estimates
- Total assets: 500,000+
- Active assets: 300,000+
- Asset books: 5-10
- Depreciation transactions per month: 300,000+
- Historical data retained: 120 months
- Annual additions: 50,000+
- Annual retirements: 30,000+

---

## Appendix

### A. Glossary
- **NBV:** Net Book Value (Cost - Accumulated Depreciation)
- **CIP:** Construction in Progress
- **MACRS:** Modified Accelerated Cost Recovery System
- **ROU:** Right-of-Use Asset
- **Salvage Value:** Expected residual value at end of useful life
- **Useful Life:** Expected period of economic benefit
- **Capitalization:** Recording as asset rather than expense
- **Depreciation:** Systematic allocation of cost over useful life

### B. Related Documents
- Accounts Payable Requirements
- General Ledger Requirements
- Purchasing Requirements
- Lease Accounting Policy

### C. Assumptions
- Organization has diverse asset portfolio
- Multiple depreciation books required
- Compliance with GAAP and/or IFRS
- Tax depreciation tracked separately
- Physical asset verification process in place

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Final
**Total Features:** 90+ features across all fixed asset management areas
