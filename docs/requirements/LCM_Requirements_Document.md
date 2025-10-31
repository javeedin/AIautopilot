# Landed Cost Management Module - Requirements Document

## Executive Summary

The Landed Cost Management (LCM) module provides comprehensive capabilities for calculating, allocating, and managing all costs associated with acquiring and receiving purchased goods. This includes freight, insurance, duties, customs, handling charges, and other indirect costs that contribute to the total "landed cost" of inventory.

**Module Code:** LCM
**Version:** 1.0
**Last Updated:** October 26, 2025

## Module Overview

### Purpose
The Landed Cost Management module enables organizations to:
- Capture all costs associated with international and domestic procurement
- Automatically calculate and allocate landed costs to purchase receipts
- Track freight, duties, customs, insurance, and handling charges
- Ensure accurate inventory valuation including all acquisition costs
- Comply with customs regulations and trade compliance requirements
- Analyze total cost of ownership (TCO) for suppliers and products
- Support duty drawback and free trade agreement (FTA) claims
- Integrate landed costs with inventory, purchasing, and cost management

### Key Features
- Landed cost element definition
- Automated freight calculation
- Duty and tariff management
- Customs valuation
- Insurance cost tracking
- Brokerage fee management
- Multi-currency landed cost support
- Proration rules and allocation methods
- Accrual and variance handling
- TCO analysis and reporting
- Trade compliance integration
- Duty drawback processing

---

## 1. Landed Cost Setup

### 1.1 Landed Cost Elements
**Requirement ID:** LCM-001

**Description:**
Define landed cost elements to categorize different types of costs that contribute to total landed cost.

**Functional Requirements:**
- Create landed cost element types
- Define standard landed cost elements:
  - Freight charges
  - Duty charges
  - Customs fees
  - Brokerage fees
  - Insurance costs
  - Handling charges
  - Storage/demurrage fees
  - Compliance costs
- Set element attributes (taxable, duty-eligible, etc.)
- Map elements to GL accounts
- Define element calculation methods
- Enable/disable elements
- Create element hierarchies
- Support custom landed cost elements

**Business Rules:**
- Each element must map to a GL account
- Elements can be mandatory or optional
- Calculation method determines how cost is allocated
- Element settings consistent across cost books

### 1.2 Allocation Rules
**Requirement ID:** LCM-002

**Description:**
Define rules for allocating landed costs to purchase order lines and receipts.

**Functional Requirements:**
- Create allocation rule definitions
- Support multiple allocation bases:
  - Quantity
  - Weight
  - Volume
  - Unit cost
  - Line amount
  - Custom formulas
- Define allocation methods:
  - Direct allocation
  - Proportional allocation
  - Stepped allocation
- Set allocation priorities
- Configure rounding rules
- Support multi-level allocations
- Enable allocation overrides

**Business Rules:**
- Allocation base must be measurable
- Total allocated cost must equal total landed cost
- Allocation method consistent for element type
- Overrides require authorization

---

## 2. Freight Management

### 2.1 Freight Charge Capture
**Requirement ID:** LCM-010

**Description:**
Capture freight charges from carriers, freight forwarders, and internal transportation.

**Functional Requirements:**
- Record freight charges by shipment
- Support multiple freight charge types:
  - Ocean freight
  - Air freight
  - Ground freight
  - Rail freight
  - Courier/express
- Link freight to purchase orders
- Link freight to ASNs (Advanced Shipping Notices)
- Capture freight from carrier invoices
- Support prepaid and collect freight terms
- Handle multi-leg freight charges
- Track freight by carrier
- Record freight payment terms

**Business Rules:**
- Freight charges must link to PO or receipt
- FOB terms determine freight responsibility
- Prepaid freight included in landed cost
- Collect freight may be estimated then actualized

### 2.2 Freight Rate Management
**Requirement ID:** LCM-011

**Description:**
Maintain freight rates and automatically calculate estimated freight costs.

**Functional Requirements:**
- Create carrier rate tables
- Define rates by:
  - Origin/destination
  - Weight breaks
  - Volume breaks
  - Service level
- Support multiple rate structures:
  - Per unit rates
  - Percentage rates
  - Tiered rates
  - Zone-based rates
- Set rate effective dates
- Maintain rate history
- Calculate estimated freight
- Compare estimated vs. actual freight
- Support rate negotiations tracking

**Business Rules:**
- Rates must have effective date ranges
- Most specific rate takes precedence
- Rate updates don't affect historical transactions
- Estimated freight can be overridden

### 2.3 Freight Audit
**Requirement ID:** LCM-012

**Description:**
Audit freight invoices against expected charges and identify discrepancies.

**Functional Requirements:**
- Compare freight invoice to estimated freight
- Flag variances exceeding tolerance
- Track freight claim opportunities
- Audit carrier accessorial charges
- Validate freight classifications
- Review duty/tariff applications
- Generate freight audit reports
- Process freight corrections
- Track freight savings from audits

**Business Rules:**
- Variances beyond tolerance require review
- Approved variances adjust landed cost
- Freight claims tracked separately
- Audit findings require documentation

---

## 3. Duty and Customs Management

### 3.1 Harmonized Tariff Classification
**Requirement ID:** LCM-020

**Description:**
Maintain Harmonized Tariff Schedule (HTS) classifications for imported items.

**Functional Requirements:**
- Assign HTS codes to items
- Maintain HTS code library
- Support country-specific classifications
- Track classification ruling letters
- Set duty rates by HTS code
- Define preferential tariff programs
- Support Schedule B (export classification)
- Handle classification changes
- Maintain classification history
- Validate HTS code format

**Business Rules:**
- Each imported item requires HTS code
- Classification determines duty rate
- Preferential programs may reduce duty
- Classification changes prospective only

### 3.2 Duty Calculation
**Requirement ID:** LCM-021

**Description:**
Automatically calculate import duties based on customs valuation and tariff rates.

**Functional Requirements:**
- Calculate duty on customs value
- Support multiple duty types:
  - Ad valorem duty (percentage)
  - Specific duty (per unit)
  - Compound duty (combination)
- Apply preferential duty rates
- Calculate anti-dumping duties
- Calculate countervailing duties
- Handle duty exemptions
- Support duty deferral programs
- Calculate estimated duties
- Actualize duties from entry documents

**Business Rules:**
- Duty calculated on customs value, not PO price
- Preferential treatment requires certification
- Exemptions require documentation
- Actual duty may differ from estimate

### 3.3 Customs Valuation
**Requirement ID:** LCM-022

**Description:**
Determine customs value for imported goods in accordance with WTO valuation methods.

**Functional Requirements:**
- Calculate transaction value
- Apply valuation adjustments:
  - Assists (tools, dies, molds)
  - Royalties and license fees
  - Subsequent proceeds
  - Packing costs
  - Selling commissions
- Support alternative valuation methods
- Document valuation method used
- Maintain valuation records
- Handle related party transactions
- Generate customs value declarations

**Business Rules:**
- Transaction value is primary method
- Adjustments must be documented
- Related party transactions may require special valuation
- Valuation method determines duty

### 3.4 Free Trade Agreements
**Requirement ID:** LCM-023

**Description:**
Manage Free Trade Agreement (FTA) programs for duty reduction or elimination.

**Functional Requirements:**
- Define FTA programs (USMCA, CAFTA, etc.)
- Set up country pairs and rules of origin
- Track certificates of origin
- Calculate preferential duty rates
- Validate origin criteria compliance
- Generate FTA documentation
- Track FTA utilization rates
- Calculate duty savings from FTAs
- Support multiple simultaneous FTAs

**Business Rules:**
- FTA benefits require valid certificate
- Rules of origin must be met
- Preferential rates override standard rates
- Certificates expire and must be renewed

---

## 4. Other Landed Cost Components

### 4.1 Insurance Costs
**Requirement ID:** LCM-030

**Description:**
Track and allocate insurance costs for goods in transit and storage.

**Functional Requirements:**
- Capture cargo insurance costs
- Calculate insurance based on:
  - Percentage of shipment value
  - Per unit rates
  - Flat fees per shipment
- Link insurance to shipments
- Track insurance providers
- Allocate insurance to receipts
- Handle insurance claims
- Generate insurance reports

**Business Rules:**
- Insurance allocated to all items in shipment
- Insurance claims reduce landed cost
- Allocation typically based on value
- Insurance may be mandatory for certain goods

### 4.2 Brokerage and Clearance Fees
**Requirement ID:** LCM-031

**Description:**
Manage customs brokerage and clearance fees from brokers and agents.

**Functional Requirements:**
- Capture brokerage fees by shipment
- Track customs clearance charges
- Record exam and inspection fees
- Manage broker relationships
- Link fees to customs entries
- Allocate fees to PO lines
- Validate broker invoices
- Generate broker performance reports

**Business Rules:**
- Brokerage fees allocated to entry
- Fees must link to specific shipment
- Broker invoice required for payment
- Fees allocated to receipts

### 4.3 Handling and Storage Charges
**Requirement ID:** LCM-032

**Description:**
Track warehouse handling, container fees, and storage charges.

**Functional Requirements:**
- Capture container handling charges
- Record warehouse receiving fees
- Track demurrage and detention charges
- Manage per diem storage costs
- Allocate handling to receipts
- Link charges to shipments/containers
- Track container deposits and returns
- Generate handling cost reports

**Business Rules:**
- Handling charges allocated on arrival
- Demurrage incurs if containers not returned timely
- Storage charges accrue daily
- Charges allocate to goods in container

---

## 5. Landed Cost Processing

### 5.1 Landed Cost Accruals
**Requirement ID:** LCM-040

**Description:**
Accrue estimated landed costs at time of receipt before actual invoices received.

**Functional Requirements:**
- Calculate estimated landed costs
- Accrue landed costs at receipt
- Post accruals to GL
- Track accrued vs. actual costs
- Clear accruals on invoice receipt
- Calculate accrual variances
- Adjust inventory value for accruals
- Generate accrual reports

**Business Rules:**
- Accruals based on historical averages or rates
- Accrued costs adjust inventory value
- Variances posted when actual invoice received
- Accruals cleared within defined period

### 5.2 Landed Cost Allocation
**Requirement ID:** LCM-041

**Description:**
Allocate landed costs to purchase order lines and inventory receipts.

**Functional Requirements:**
- Apply allocation rules to shipments
- Distribute costs across PO lines
- Update receipt costs with landed costs
- Recalculate unit costs
- Post allocation entries to GL
- Handle partial receipts
- Support reallocation if needed
- Generate allocation reports
- Audit allocation calculations

**Business Rules:**
- Allocation follows defined rules
- Unit cost includes allocated landed cost
- Allocations post to inventory and GL
- Reallocation requires authorization

### 5.3 Landed Cost Variances
**Requirement ID:** LCM-042

**Description:**
Track and reconcile variances between estimated and actual landed costs.

**Functional Requirements:**
- Calculate landed cost variances
- Identify variance causes
- Post variances to GL
- Analyze variance trends
- Set variance tolerance levels
- Flag significant variances
- Process variance adjustments
- Generate variance reports
- Support variance approvals

**Business Rules:**
- Variance = Actual - Estimated
- Material variances require investigation
- Variances posted to designated accounts
- Tolerances set by cost element

---

## 6. Shipment Tracking

### 6.1 Shipment Management
**Requirement ID:** LCM-050

**Description:**
Track shipments from origin to destination including all associated costs.

**Functional Requirements:**
- Create shipment records
- Link shipments to POs
- Track shipment status
- Record bill of lading information
- Track containers and pallets
- Monitor shipment milestones
- Capture arrival dates
- Link shipments to receipts
- Generate shipment reports

**Business Rules:**
- Shipments link to one or more POs
- Shipment status updates trigger notifications
- Arrival triggers receipt processing
- Shipment costs allocated on receipt

### 6.2 In-Transit Tracking
**Requirement ID:** LCM-051

**Description:**
Track goods in-transit and manage in-transit inventory visibility.

**Functional Requirements:**
- Create in-transit records on shipment
- Track estimated arrival dates
- Update in-transit status
- Provide in-transit inventory visibility
- Clear in-transit on receipt
- Handle in-transit delays
- Accrue costs for in-transit goods
- Generate in-transit reports

**Business Rules:**
- In-transit created at shipment/export
- Goods not available until received
- In-transit valued at PO price plus estimated landed
- Cleared on physical receipt

---

## 7. Trade Compliance

### 7.1 Import/Export Compliance
**Requirement ID:** LCM-060

**Description:**
Ensure compliance with import/export regulations and trade laws.

**Functional Requirements:**
- Validate required import documentation
- Track export control classifications (ECCN)
- Screen denied parties lists
- Verify license requirements
- Maintain compliance records
- Generate compliance reports
- Flag compliance issues
- Support compliance audits
- Track regulatory changes

**Business Rules:**
- Compliance checks mandatory before shipment
- Denied party transactions blocked
- Licenses required before export/import
- Compliance violations reported immediately

### 7.2 Country of Origin Tracking
**Requirement ID:** LCM-061

**Description:**
Track and document country of origin for all imported items.

**Functional Requirements:**
- Capture country of origin by item
- Maintain origin certificates
- Track substantial transformation
- Support multiple origin countries per item
- Validate origin declarations
- Generate origin reports
- Link origin to FTA eligibility
- Archive origin documentation

**Business Rules:**
- Origin determines duty treatment
- Origin must be documented
- Preferential origin may differ from manufacturing origin
- Origin changes must be tracked

### 7.3 Duty Drawback
**Requirement ID:** LCM-062

**Description:**
Manage duty drawback claims for duties paid on imported goods subsequently exported.

**Functional Requirements:**
- Identify drawback-eligible imports
- Track imported goods to export
- Calculate drawback amounts
- Generate drawback claims
- Maintain drawback records
- Process drawback refunds
- Generate drawback reports
- Support unused merchandise drawback
- Support manufacturing drawback

**Business Rules:**
- Drawback claims filed within statutory period
- Goods must be exported or destroyed
- Documentation required for claims
- Drawback typically 99% of duty paid

---

## 8. Reporting and Analytics

### 8.1 Landed Cost Reports
**Requirement ID:** LCM-070

**Description:**
Generate comprehensive landed cost reports for analysis and decision-making.

**Standard Reports:**
- Total Landed Cost by Item
- Landed Cost by Shipment
- Freight Cost Analysis
- Duty Cost Summary
- Landed Cost Variance Report
- Supplier Landed Cost Comparison
- Total Cost of Ownership (TCO)
- Landed Cost Trending
- FTA Utilization Report
- Duty Drawback Opportunity Report

**Functional Requirements:**
- Generate reports on demand or scheduled
- Export reports to Excel, PDF
- Support drill-down capabilities
- Filter reports by multiple dimensions
- Compare costs across periods
- Generate graphical analysis
- Create custom report templates
- Save report parameters
- Email reports automatically

### 8.2 TCO Analysis
**Requirement ID:** LCM-071

**Description:**
Analyze total cost of ownership including all landed cost components.

**Functional Requirements:**
- Calculate TCO by supplier
- Calculate TCO by item
- Compare TCO across suppliers
- Analyze TCO trends
- Identify cost reduction opportunities
- Generate TCO dashboards
- Support what-if TCO scenarios
- Factor quality and lead time into TCO

**Business Rules:**
- TCO includes all acquisition costs
- TCO analysis supports sourcing decisions
- Historical TCO guides future estimates
- Non-cost factors may override lowest TCO

---

## 9. Integration Points

### 9.1 Integration with Purchasing
**Requirement ID:** LCM-080

**Description:**
Seamless integration with Purchasing module for PO and receipt data.

**Integration Points:**
- Receive PO data (items, quantities, prices)
- Link landed costs to PO lines
- Receive shipment/ASN data
- Trigger landed cost allocation on receipt
- Update PO costs with landed costs
- Sync item master data
- Process returns impact on landed cost

### 9.2 Integration with Inventory
**Requirement ID:** LCM-081

**Description:**
Update inventory values with allocated landed costs.

**Integration Points:**
- Update receipt costs with landed costs
- Adjust inventory valuation
- Update average costs
- Create inventory transactions for landed costs
- Sync on-hand quantities
- Handle in-transit inventory
- Process inventory adjustments

### 9.3 Integration with Cost Management
**Requirement ID:** LCM-082

**Description:**
Provide landed cost data to Cost Management for total product costing.

**Integration Points:**
- Feed landed costs to cost elements
- Update item standard costs
- Support cost rollups with landed costs
- Provide variance data
- Enable landed cost analysis in CM

### 9.4 Integration with Accounts Payable
**Requirement ID:** LCM-083

**Description:**
Interface with AP for landed cost invoice processing and payment.

**Integration Points:**
- Create AP invoices for freight/duty/other charges
- Match landed cost invoices to accruals
- Process 3-way match for landed costs
- Track landed cost payments
- Reconcile landed cost accruals to invoices

### 9.5 Integration with General Ledger
**Requirement ID:** LCM-084

**Description:**
Post landed cost transactions to General Ledger.

**Integration Points:**
- Post landed cost accruals
- Post landed cost allocations
- Post landed cost variances
- Create inventory valuation entries
- Support multi-book accounting
- Provide audit trail to GL

---

## 10. Multi-Currency Support

### 10.1 Multi-Currency Landed Costs
**Requirement ID:** LCM-090

**Description:**
Handle landed costs in multiple currencies with proper conversion and accounting.

**Functional Requirements:**
- Capture landed costs in transaction currency
- Convert to functional currency
- Handle exchange rate fluctuations
- Support triangulation for EMU
- Calculate exchange variances
- Post currency gains/losses
- Support multiple exchange rate types
- Maintain currency history

**Business Rules:**
- Conversion uses rate at transaction date
- Exchange gains/losses posted to designated accounts
- Functional currency used for inventory valuation
- Currency variances tracked separately

---

## 11. Security and Controls

### 11.1 Landed Cost Security
**Requirement ID:** LCM-100

**Description:**
Implement security controls for landed cost data and processes.

**Security Requirements:**
- Role-based access to LCM functions
- Separate duties for cost entry and approval
- Restrict allocation processing
- Audit log for all changes
- Secure customs and trade data
- Control report access
- Encrypt sensitive data
- Monitor unauthorized access

**User Roles:**
- Landed Cost Clerk
- Customs Specialist
- Trade Compliance Officer
- Landed Cost Manager
- Landed Cost Approver

### 11.2 Audit Trail
**Requirement ID:** LCM-101

**Description:**
Maintain comprehensive audit trail for all landed cost transactions.

**Audit Requirements:**
- Log all cost entries and changes
- Track allocation processing
- Record customs entries
- Log FTA claims
- Track user actions and timestamps
- Maintain change history
- Generate audit reports
- Support compliance audits
- Retain audit data per policy

---

## 12. Technical Requirements

### 12.1 Performance Requirements
- Process 1,000 shipments per day
- Allocate landed costs within 1 hour of receipt
- Generate reports within 30 seconds
- Support 50+ concurrent users
- Handle 500,000+ items with HTS codes

### 12.2 Data Volume Estimates
- Shipments per month: 10,000+
- Landed cost transactions per month: 50,000+
- HTS codes maintained: 10,000+
- Freight rates: 100,000+
- Historical periods retained: 84 months

### 12.3 Integration Requirements
- Real-time integration with Purchasing
- Real-time integration with Inventory
- Batch integration with GL
- API support for carrier systems
- EDI support for customs data
- Web services for compliance screening

---

## 13. Compliance and Standards

### 13.1 Regulatory Compliance
- U.S. Customs and Border Protection (CBP) requirements
- WTO Customs Valuation Agreement
- Harmonized Tariff Schedule (HTS) compliance
- Export Administration Regulations (EAR)
- International Traffic in Arms Regulations (ITAR)
- Foreign Trade Regulations (FTR)
- Free Trade Agreement requirements

### 13.2 Industry Standards
- Incoterms 2020
- ISO country and currency codes
- UN/EDIFACT standards for EDI
- WCO (World Customs Organization) standards

---

## Appendix

### A. Glossary
- **Landed Cost:** Total cost of getting goods to destination including freight, duty, insurance, fees
- **HTS Code:** Harmonized Tariff Schedule classification code
- **Duty Drawback:** Refund of duties paid on imported goods subsequently exported
- **FTA:** Free Trade Agreement
- **Customs Value:** Value of goods for duty calculation purposes
- **FOB:** Free on Board - transfer of ownership point
- **TCO:** Total Cost of Ownership
- **CBP:** U.S. Customs and Border Protection
- **Incoterms:** International Commercial Terms

### B. Related Documents
- Purchasing Requirements
- Inventory Management Requirements
- Cost Management Requirements
- Accounts Payable Requirements
- General Ledger Requirements

### C. Assumptions
- Organization engaged in international trade
- Import/export compliance required
- Multiple carriers and freight forwarders
- Duty and customs requirements applicable
- Integration with customs broker systems may be needed

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Final
**Total Features:** 90+ features across all landed cost management areas
