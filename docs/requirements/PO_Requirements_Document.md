# Purchasing (PO) Module - Requirements Document

## Document Information
- **Document Version:** 1.0
- **Date:** October 26, 2025
- **Module:** Purchasing / Purchase Orders (PO)
- **ERP System:** Custom ERP (Oracle Fusion-like)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Module Overview](#module-overview)
3. [Item Master](#item-master)
4. [Purchase Requisitions](#purchase-requisitions)
5. [Purchase Orders](#purchase-orders)
6. [Blanket and Contract Purchase Orders](#blanket-and-contract-purchase-orders)
7. [Approval Workflows](#approval-workflows)
8. [Receiving](#receiving)
9. [Returns to Vendor](#returns-to-vendor)
10. [Supplier Catalogs](#supplier-catalogs)
11. [Procurement Cards](#procurement-cards)
12. [Sourcing and RFQ](#sourcing-and-rfq)
13. [Purchase Order Matching](#purchase-order-matching)
14. [Period Close Process](#period-close-process)
15. [Integration Points](#integration-points)
16. [Reporting and Analytics](#reporting-and-analytics)
17. [Security and Access Control](#security-and-access-control)

---

## 1. Executive Summary

The Purchasing (PO) module manages the procure-to-pay process from requisition through purchase order creation, approval, receiving, and vendor invoice matching. This module ensures proper procurement controls, competitive pricing, and timely delivery of goods and services.

The PO module will support:
- Purchase requisition management
- Purchase order creation and approval
- Multi-currency procurement
- Blanket and contract POs
- Goods and services receiving
- Three-way matching (PO, Receipt, Invoice)
- Supplier catalog integration
- Procurement analytics
- Integration with AP, Inventory, and GL

---

## 2. Module Overview

### 2.1 Purpose
The PO module manages all procurement activities, supplier relationships, and purchasing transactions. It provides controls to ensure authorized purchases, competitive pricing, and proper receipt of goods and services.

### 2.2 Key Objectives
- Streamline requisition-to-PO process
- Enforce procurement policies
- Ensure competitive sourcing
- Automate approval workflows
- Track PO commitments and encumbrances
- Accurate goods receipt
- Support supplier collaboration
- Provide spend visibility
- Enable strategic sourcing
- Maintain compliance and audit trails

### 2.3 Scope
- Item and service catalog management
- Purchase requisition creation and approval
- Purchase order generation and management
- PO approval workflows
- Goods and services receiving
- Returns to vendor
- Supplier catalog integration
- Procurement card (P-Card) management
- RFQ and sourcing
- Integration with AP, Inventory, GL
- Spend analytics

---

## 3. Item Master

### 3.1 Item Definition

**Description:** Central repository for all purchasable items and services.

**Item Types:**
- Raw Materials
- Finished Goods
- Components/Parts
- Consumables/Supplies
- Services
- Expense Items
- Assets/Capital Items

**Features:**
- Item number (auto or manual)
- Item description
- Long description
- Item type
- Category and commodity code
- Unit of measure (UOM)
- Purchase UOM
- Stock UOM
- Conversion factors
- Item status (Active, Inactive, Obsolete)
- Effective dates
- Make/Buy indicator
- Purchasable flag
- Stockable flag
- Asset item flag

### 3.2 Item Categories

**Features:**
- Category hierarchy
- Commodity codes
- GL account mapping
- Buyer assignment
- Approval routing by category
- Spend category
- Tax category

### 3.3 Item Suppliers

**Description:** Maintain approved suppliers for items.

**Features:**
- Multiple suppliers per item
- Preferred supplier designation
- Supplier part number
- Lead time
- Minimum order quantity (MOQ)
- Order multiples
- Price breaks
- Supplier ranking
- Effective dates

### 3.4 Item Pricing

**Features:**
- Standard cost
- Last purchase price
- Average purchase price
- Price lists
- Price breaks (quantity-based)
- Promotional pricing
- Blanket PO pricing
- Contract pricing

---

## 4. Purchase Requisitions

### 4.1 Requisition Creation

**Description:** Request for purchase of goods or services.

**Creation Methods:**
1. **Manual Entry:** User creates requisition
2. **Copy from Template:** Reuse previous requisitions
3. **From Catalog:** Select from catalog
4. **Auto-generated:** From min/max reorder, MRP
5. **Import:** CSV, Excel import

**Features:**
- Requisition number (auto-generated)
- Requisition date
- Requester
- Need-by date
- Deliver-to location
- Business unit
- Department/Cost center
- Requisition type (Purchase, Transfer)
- Requisition status
- Multiple line items
- Attachments
- Notes and justification

### 4.2 Requisition Lines

**Features:**
- Line number
- Item or description (free-form)
- Quantity
- Unit of measure
- Estimated unit price
- Line amount
- Category code
- Account code distribution
- Project/Grant reference
- Asset flag
- Suggested supplier
- Need-by date
- Specifications

### 4.3 Requisition Approval

**Features:**
- Multi-level approval workflow
- Amount-based routing
- Department/budget approval
- Manager hierarchy approval
- Category-specific routing
- Approval delegation
- Email notifications
- Mobile approval
- Rejection routing
- Approval history

### 4.4 Requisition to PO Conversion

**Features:**
- Manual PO creation from requisition
- Auto PO creation
- Combine multiple requisitions
- Split requisition to multiple POs
- Supplier selection
- Price negotiation update
- PO creation workflow

---

## 5. Purchase Orders

### 5.1 PO Creation

**Description:** Generate purchase orders to suppliers.

**Creation Methods:**
1. **From Requisition:** Convert approved requisition
2. **Manual PO:** Direct PO creation
3. **Copy PO:** Copy from existing PO
4. **Auto-generation:** From forecasts, min/max
5. **Blanket PO Release:** Release against blanket
6. **Import:** File-based PO import

**Features:**
- PO number (auto-generated)
- PO type (Standard, Blanket, Contract, Planned)
- PO date
- Supplier and supplier site
- Buyer
- Ship-to location
- Bill-to location
- Payment terms
- Freight terms (FOB, CIF, etc.)
- Shipping method
- Currency
- Exchange rate
- Requisition reference
- PO status
- Approval status

### 5.2 PO Lines

**Features:**
- Line number
- Line type (Goods, Services, Amount-based)
- Item or description
- Quantity
- Unit of measure
- Unit price
- Line amount
- Tax code and amount
- Need-by date
- Promised date
- Account distribution
- Project/Grant reference
- Asset flag
- Receiving options (Inspection, Receipt routing)
- Requisition line reference

### 5.3 PO Pricing

**Features:**
- Negotiated pricing
- Contract pricing
- Catalog pricing
- Price tolerance checking
- Price variance analysis
- Price history
- Discount terms
- Freight and handling charges
- Tax calculation
- Total PO amount

### 5.4 PO Terms and Conditions

**Features:**
- Standard terms and conditions
- Supplier-specific terms
- Payment terms
- Delivery terms (Incoterms)
- Warranty terms
- Quality requirements
- Compliance requirements
- Special instructions
- Attachments (specs, drawings)

### 5.5 PO Modifications

**Description:** Change orders to existing POs.

**Features:**
- PO amendment/revision
- Change order number
- Revision history
- Quantity changes
- Price changes
- Date changes
- Line additions/deletions
- Supplier notification
- Re-approval if required
- Change reason tracking

---

## 6. Blanket and Contract Purchase Orders

### 6.1 Blanket Purchase Orders

**Description:** Long-term agreement for repeated purchases.

**Features:**
- Agreement amount or quantity
- Effective dates (start/end)
- Blanket PO terms
- Release mechanism
- Release approval
- Committed amount tracking
- Remaining amount/quantity
- Auto-renewal option
- Price protection
- Minimum release quantity

### 6.2 Contract Purchase Orders

**Description:** Master agreement with terms and pricing.

**Features:**
- Contract terms and conditions
- Price lists/schedules
- Volume commitments
- Tiered pricing
- Service level agreements
- Performance metrics
- Contract renewal terms
- Contract modifications
- Contract compliance tracking

### 6.3 Blanket/Contract Releases

**Features:**
- Release against blanket/contract
- Release approval (if required)
- Remaining balance check
- Release quantity/amount
- Delivery schedule
- Release tracking
- Automatic release creation

---

## 7. Approval Workflows

### 7.1 Requisition Approval Workflow

**Approval Rules:**
- Amount thresholds
- Department/cost center
- Category-based routing
- Budget approval
- Manager hierarchy
- Special item approval (assets, software licenses)
- Emergency purchase approval

**Features:**
- Multi-level approval
- Parallel approvals
- Serial approvals
- Ad-hoc approver
- Approval delegation
- Escalation rules
- Email notifications
- Mobile approval
- Approval timeout
- Rejection workflow
- Approval history

### 7.2 PO Approval Workflow

**Approval Rules:**
- PO amount thresholds
- Supplier approval (new suppliers)
- Price variance approval
- Contract compliance
- Budget approval
- Change order approval
- Blanket release approval

**Features:**
- Same workflow capabilities as requisition
- Supplier hold check
- Dual approval for high-value POs
- CFO approval for capital purchases

### 7.3 Approval Limits

**Features:**
- Role-based approval limits
- User-specific limits
- Category-specific limits
- Cumulative approval tracking
- Temporary limit increase
- Approval matrix configuration

---

## 8. Receiving

### 8.1 Receipt Entry

**Description:** Record receipt of goods and services.

**Receipt Methods:**
1. **Manual Receipt:** User enters receipt
2. **Mobile Receipt:** Warehouse mobile app
3. **Barcode Scanning:** Scan to receive
4. **ASN Receipt:** Advance Ship Notice integration
5. **Auto-Receipt:** Automatic upon delivery

**Features:**
- Receipt number (auto-generated)
- Receipt date
- PO reference
- Supplier
- Packing slip number
- Bill of lading
- Carrier
- Received by
- Receipt location
- Receipt type (Goods, Services)
- Receipt status

### 8.2 Receipt Lines

**Features:**
- PO line reference
- Item
- Quantity received
- Unit of measure
- Quantity ordered (reference)
- Quantity outstanding
- Over/Under receipt handling
- Receipt tolerance
- Lot/Serial number (if applicable)
- Receipt inspection flag
- Receipt routing (Direct, Inspection, Temp storage)
- Packing slip line reference

### 8.3 Receipt Tolerances

**Features:**
- Over-receipt tolerance (%)
- Under-receipt tolerance (%)
- Tolerance by item/category
- Tolerance enforcement
- Exception handling
- Over-receipt approval

### 8.4 Receipt Inspection

**Description:** Quality inspection of received goods.

**Features:**
- Inspection requirement flag
- Inspection routing
- Quality hold
- Inspection results recording
- Accept/Reject decision
- Partial acceptance
- Return to vendor from inspection
- Inspection approval
- Move to stock after approval

### 8.5 Receipt Corrections

**Features:**
- Receipt reversal
- Receipt quantity adjustment
- Return to receiving
- Reason codes
- Correction approval
- Accounting impact

---

## 9. Returns to Vendor

### 9.1 RTV Creation

**Description:** Return goods to vendor for credit or replacement.

**Return Reasons:**
- Defective/Damaged
- Wrong item shipped
- Overshipment
- Not ordered
- Quality failure
- Other

**Features:**
- RTV number (auto-generated)
- Return date
- Supplier
- Original PO reference
- Original receipt reference
- Return reason
- Return quantity
- Return authorization number (from supplier)
- Credit or replacement
- Return shipping method
- RTV approval

### 9.2 RTV Processing

**Features:**
- Inventory update (if applicable)
- Credit memo expectation
- Replacement PO creation
- Shipping document generation
- Supplier notification
- RTV tracking
- Credit memo matching to RTV
- RTV closure

---

## 10. Supplier Catalogs

### 10.1 Catalog Setup

**Description:** Maintain supplier catalogs for easy requisitioning.

**Features:**
- Catalog name
- Supplier
- Effective dates
- Catalog type (Punchout, Hosted, Offline)
- Category mapping
- Search capability
- Item images
- Item specifications
- Catalog update frequency

### 10.2 Catalog Items

**Features:**
- Supplier item number
- Item description
- Category
- Unit price
- UOM
- Lead time
- Availability
- Promotional pricing
- Item attributes
- Comparison shopping

### 10.3 Punchout Catalogs

**Description:** Integration with supplier e-commerce sites.

**Features:**
- Punchout URL
- Authentication
- Shopping cart integration
- Auto-requisition creation
- Price and availability update
- Order status tracking

---

## 11. Procurement Cards

### 11.1 P-Card Setup

**Description:** Corporate procurement card program management.

**Features:**
- P-Card issuer integration
- Card assignment to employees
- Card limits (transaction, daily, monthly)
- Merchant category restrictions
- Card activation/deactivation
- Lost/stolen card management
- Card expiration tracking

### 11.2 P-Card Transactions

**Features:**
- Transaction feed import
- Transaction matching to receipts
- Employee expense assignment
- GL account coding
- Project/Grant assignment
- Receipt attachment requirement
- Transaction reconciliation
- Dispute management

### 11.3 P-Card Reconciliation

**Features:**
- Cardholder reconciliation
- Manager approval
- Unreconciled transaction tracking
- Automated GL posting
- Statement reconciliation
- Payment processing

---

## 12. Sourcing and RFQ

### 12.1 RFQ Creation

**Description:** Request for Quotation from suppliers.

**Features:**
- RFQ number
- RFQ type (Standard, Auction, Negotiation)
- RFQ date
- Response due date
- Requirements specification
- Item list
- Quantity and specifications
- Evaluation criteria
- Terms and conditions
- Supplier selection
- RFQ distribution

### 12.2 Quote Receipt

**Features:**
- Supplier quote submission
- Quote comparison
- Price analysis
- Supplier rating
- Award recommendation
- Negotiation
- Quote acceptance
- Declined supplier notification

### 12.3 Supplier Selection

**Features:**
- Total cost analysis
- Quality consideration
- Delivery time consideration
- Supplier performance history
- Risk assessment
- Award decision
- PO creation from RFQ
- Contract negotiation

---

## 13. Purchase Order Matching

### 13.1 Two-Way Matching

**Description:** Match invoice to PO (price and quantity).

**Features:**
- PO to invoice matching
- Quantity variance tolerance
- Price variance tolerance
- Match approval workflow
- Exception handling
- Force match capability

### 13.2 Three-Way Matching

**Description:** Match invoice to PO and receipt.

**Features:**
- PO, Receipt, Invoice matching
- Quantity verification
- Price verification
- Full vs. partial matching
- Match variance reporting
- Automated matching
- Exception queue

### 13.3 Four-Way Matching

**Description:** Match invoice to PO, receipt, and inspection.

**Features:**
- Inspection verification
- Quality acceptance check
- Complete matching
- Inspection variance handling

---

## 14. Period Close Process

### 14.1 PO Period Close Activities

**Close Activities:**
1. Receipt cutoff
2. Receipt accrual (uninvoiced receipts)
3. PO commitment review
4. Open PO analysis
5. Receiving report completion
6. Variance analysis
7. Accrual calculation
8. GL reconciliation
9. Close procurement period

### 14.2 PO Accruals

**Features:**
- Uninvoiced receipt accrual
- Goods in transit accrual
- Period-end accrual journal
- Accrual reversal
- Accrual reconciliation

### 14.3 Commitment Tracking

**Features:**
- Open PO commitment
- Encumbrance accounting
- Budget consumption
- Commitment aging
- Commitment reporting

---

## 15. Integration Points

### 15.1 Accounts Payable Integration

**Features:**
- PO data transfer to AP
- Invoice matching to PO
- Receipt data for matching
- PO closure from AP
- Accrual posting

### 15.2 Inventory Integration

**Features:**
- Receipt update to inventory
- Inventory valuation
- Lot/serial tracking
- Item master synchronization
- Stock level visibility in PO

### 15.3 General Ledger Integration

**Features:**
- Encumbrance posting
- Receipt accrual posting
- Variance posting
- Budget checking
- Account validation

### 15.4 Requisition Integration

**Features:**
- Requisition to PO conversion
- Requisition status update
- Requester notification

---

## 16. Reporting and Analytics

### 16.1 Standard Reports

**Operational Reports:**
- Open Purchase Orders
- PO by Supplier
- PO by Buyer
- Receipt Register
- Unmatched Receipts
- Open Requisitions
- Requisition Aging
- PO Commitment Report
- RTV Register
- Blanket PO Utilization

**Management Reports:**
- Spend Analysis (by supplier, category, buyer)
- Purchase Price Variance
- Supplier Performance
- Lead Time Analysis
- PO Cycle Time
- Approval Cycle Time
- Buyer Performance
- Maverick Spending
- Contract Compliance
- Savings Opportunity

**Compliance Reports:**
- PO Audit Trail
- Approval History
- Budget vs. Commitment
- SOX Compliance Reports

### 16.2 Analytics

**Features:**
- Spend analytics
- Supplier analytics
- Category spend analysis
- Price trend analysis
- Savings tracking
- Compliance metrics
- Procurement KPIs
- Forecasting

### 16.3 Dashboards

**Features:**
- Procurement dashboard
- Buyer workbench
- Approval queue
- Exception dashboard
- Spend dashboard
- Supplier dashboard
- Real-time data
- Drill-down capability

---

## 17. Security and Access Control

### 17.1 PO-Specific Roles

**Standard Roles:**
- **Procurement Administrator:** Full PO access
- **Procurement Manager:** Oversight and approval
- **Buyer:** PO creation and management
- **Requisitioner:** Create and submit requisitions
- **Approver:** Approve requisitions/POs
- **Receiver:** Goods receipt entry
- **Procurement Analyst:** Read-only reporting

### 17.2 Function Security

**Features:**
- Requisition creation privileges
- PO creation privileges
- Approval authority
- Receipt entry privileges
- PO modification authority
- Supplier selection authority
- Price override authority
- Budget override
- Force match authority

### 17.3 Data Security

**Features:**
- Business unit access
- Department/cost center access
- Supplier access restrictions
- Buyer assignment
- Category-based security
- PO data security

### 17.4 Approval Limits

**Features:**
- Requisition approval limits
- PO approval limits
- Category-specific limits
- Role-based limits
- User-specific limits
- Cumulative limits

### 17.5 Audit Trail

**Features:**
- Requisition creation/modification audit
- PO audit trail
- Approval audit trail
- Receipt audit
- Price change audit
- Supplier change audit
- User activity logging

---

## 18. Advanced Features

### 18.1 Supplier Collaboration Portal

**Features:**
- PO visibility for suppliers
- ASN submission
- Invoice submission
- Catalog updates
- Performance metrics visibility
- Communication center

### 18.2 Mobile Procurement

**Features:**
- Mobile requisition
- Mobile approval
- Mobile receiving
- Barcode scanning
- Photo capture
- Mobile notifications

### 18.3 Predictive Analytics

**Features:**
- Demand forecasting
- Price prediction
- Supplier risk prediction
- Savings opportunity identification
- Automated sourcing recommendations

---

## 19. Technical Requirements

### 19.1 Performance Requirements

- Requisition creation: < 3 seconds
- PO creation: < 5 seconds
- Receipt processing: < 2 seconds
- Support 10,000+ active POs
- Process 50,000+ requisitions/month
- Support 500+ concurrent users

### 19.2 Integration Requirements

- Real-time AP integration
- Real-time Inventory integration
- GL posting (real-time or batch)
- EDI PO transmission
- XML/JSON APIs
- Catalog punchout integration

### 19.3 Data Retention

- Online PO history: 7 years
- Receipt history: 7 years
- Audit trail: Per requirements
- Archived data: Unlimited

---

## 20. Compliance and Standards

### 20.1 Regulatory Compliance

- SOX compliance
- Procurement regulations
- Contract compliance
- Audit trail requirements
- GDPR (supplier data)

### 20.2 Industry Standards

- EDI standards (X12, EDIFACT)
- cXML for catalogs
- Punchout standards

---

## Document Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | October 26, 2025 | AI Development Team | Initial PO requirements |

---

**End of Document**
