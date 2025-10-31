# Order Management (OM) Module - Requirements Document

## Document Information
- **Document Version:** 1.0
- **Date:** October 26, 2025
- **Module:** Order Management (OM)
- **ERP System:** Custom ERP (Oracle Fusion-like)

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Module Overview](#module-overview)
3. [Customer and Product Setup](#customer-and-product-setup)
4. [Sales Order Management](#sales-order-management)
5. [Order Promising](#order-promising)
6. [Pricing and Discounts](#pricing-and-discounts)
7. [Order Fulfillment](#order-fulfillment)
8. [Shipping and Delivery](#shipping-and-delivery)
9. [Returns and RMAs](#returns-and-rmas)
10. [Invoicing](#invoicing)
11. [Back Orders and Allocations](#back-orders-and-allocations)
12. [Sales Commissions](#sales-commissions)
13. [Period Close Process](#period-close-process)
14. [Integration Points](#integration-points)
15. [Reporting and Analytics](#reporting-and-analytics)
16. [Security and Access Control](#security-and-access-control)

---

## 1. Executive Summary

The Order Management module manages the complete order-to-cash process from quote through order entry, fulfillment, shipping, and invoicing. It provides real-time inventory visibility, flexible pricing, and seamless integration with AR and Inventory modules.

Key capabilities:
- Sales order management
- Real-time ATP (Available to Promise)
- Flexible pricing and discounting
- Pick, pack, and ship processing
- Return merchandise authorizations
- Order orchestration and workflow
- Integration with AR, Inventory, and GL

---

## 2. Module Overview

### 2.1 Purpose
Manage all sales order activities from order capture through fulfillment and invoicing. Provide visibility into order status and enable efficient order processing.

### 2.2 Key Objectives
- Streamline order-to-cash process
- Ensure on-time delivery
- Optimize inventory allocation
- Flexible pricing management
- Real-time order visibility
- Automate order workflows
- Integrate billing and revenue recognition
- Support omnichannel selling

---

## 3. Customer and Product Setup

### 3.1 Customer Setup
- Customer master (from AR)
- Ship-to addresses
- Bill-to addresses
- Payment terms
- Credit limits
- Preferred shipping method
- Customer pricing groups
- Customer discount groups

### 3.2 Product Setup
- Item master (from Inventory)
- Saleable items
- Product categories
- Product bundles/kits
- Substitute items
- Cross-sell items
- Upsell items

---

## 4. Sales Order Management

### 4.1 Order Entry
- Order number (auto-generated)
- Order date
- Order type (Standard, Return, Transfer, Internal)
- Customer and ship-to
- Requested delivery date
- Order source (Web, Phone, EDI, Manual)
- Sales channel (Direct, Partner, Online)
- Salesperson
- Payment terms
- Shipping method
- Order status
- Special instructions

### 4.2 Order Lines
- Line number
- Item or description
- Quantity ordered
- Unit of measure
- Unit price
- Line amount
- Requested ship date
- Requested delivery date
- Warehouse/fulfillment location
- Tax code
- Revenue account
- Project reference
- Line status
- Shipping instructions

### 4.3 Order Types
- **Standard Order:** Regular sales order
- **Rush Order:** Expedited processing
- **Drop Ship:** Ship direct from supplier
- **Back Order:** Partial fulfillment
- **Blanket Order:** Framework agreement
- **Internal Order:** Inter-company transfer
- **Return Order:** Customer returns

### 4.4 Order Status
- Draft
- Entered
- Booked
- Awaiting Fulfillment
- Picking
- Picked
- Shipped
- Partially Shipped
- Invoiced
- Closed
- Cancelled

### 4.5 Order Holds
- **Credit Hold:** Customer over credit limit
- **Manual Hold:** User-placed hold
- **Payment Hold:** Unpaid invoices
- **Shipping Hold:** Special shipping requirements
- **Quality Hold:** Product quality issue
- **Price Hold:** Price approval required
- Hold release workflow

---

## 5. Order Promising

### 5.1 ATP (Available to Promise)
- Real-time inventory check
- Multi-warehouse ATP
- ATP by date
- ATP reservation
- ATP inquiry
- Substitute item suggestion

### 5.2 Promising Rules
- Check inventory first
- Check expected receipts
- Check supply chain
- Promise date calculation
- Lead time consideration
- Capable to Promise (CTP)

### 5.3 Reservation
- Hard reservation (committed)
- Soft reservation (planned)
- Reservation expiration
- Reservation release
- Reservation transfer

---

## 6. Pricing and Discounts

### 6.1 Pricing Methods
- **List Price:** Standard catalog price
- **Customer Price:** Customer-specific pricing
- **Contract Price:** Agreement-based pricing
- **Promotional Price:** Limited-time pricing
- **Tiered Pricing:** Quantity-based pricing
- **Matrix Pricing:** Multi-dimensional pricing

### 6.2 Price Lists
- Price list header
- Effective dates
- Currency
- Customer assignment
- Item prices
- Price list precedence
- Price list versions

### 6.3 Discounts
- Line-level discounts
- Order-level discounts
- Customer discounts
- Promotional discounts
- Volume discounts
- Early payment discounts
- Discount approval workflow

### 6.4 Price Calculation
- Base price determination
- Discount application
- Tax calculation
- Freight calculation
- Total order value
- Price override authority

---

## 7. Order Fulfillment

### 7.1 Pick Processing
- Pick wave creation
- Pick list generation
- Batch picking
- Zone picking
- Wave picking
- Pick confirmation
- Mobile picking
- Barcode scanning

### 7.2 Pack Processing
- Packing slip generation
- Package configuration
- Package weight/dimensions
- Packing materials
- Serial number capture
- Package labeling
- Pack confirmation

### 7.3 Allocation
- Inventory allocation rules
- Priority-based allocation
- FIFO allocation
- Customer priority
- Order priority
- Partial allocation

---

## 8. Shipping and Delivery

### 8.1 Shipment Processing
- Shipment consolidation
- Carrier selection
- Shipping method
- Freight calculation
- Shipping labels
- Bill of lading
- Packing slip
- Commercial invoice (export)

### 8.2 Carrier Integration
- Carrier rate shopping
- Carrier tracking integration
- Shipping label generation
- Tracking number capture
- Delivery confirmation
- Proof of delivery (POD)

### 8.3 Shipping Documents
- Packing slip
- Bill of lading
- Commercial invoice
- Certificate of origin
- Customs documents
- Dangerous goods declaration

### 8.4 Freight Management
- Freight calculation
- Freight by weight/volume
- Freight zones
- Free freight thresholds
- Freight billing (Prepaid, Collect, Third Party)
- Freight reconciliation

---

## 9. Returns and RMAs

### 9.1 RMA Creation
- Return authorization number
- Original order reference
- Return reason codes
- Return quantity
- Return type (Credit, Replace, Repair)
- Return shipping method
- RMA approval workflow
- RMA expiration

### 9.2 Return Reasons
- Defective/Damaged
- Wrong item ordered
- Customer changed mind
- Overshipment
- Quality issue
- Other

### 9.3 Return Processing
- Return receipt
- Return inspection
- Return disposition (Restock, Scrap, Return to Vendor)
- Credit memo creation
- Replacement order
- Refund processing
- Restocking fee

### 9.4 Return Authorization
- RMA approval workflow
- Approval limits
- Return period validation
- Product eligibility
- Warranty validation

---

## 10. Invoicing

### 10.1 Invoice Creation
- Auto-invoice on shipment
- Invoice consolidation
- Partial invoicing
- Milestone invoicing
- Recurring invoicing
- Invoice approval
- Invoice to AR transfer

### 10.2 Invoice Types
- **Ship and Debit:** Invoice after shipment
- **Advance Invoice:** Invoice before shipment
- **Milestone Invoice:** Progress billing
- **Recurring Invoice:** Subscription billing
- **Credit Invoice:** Return credit

### 10.3 Invoice Grouping
- Group by customer
- Group by ship-to
- Group by order
- Separate by warehouse
- Invoice consolidation rules

---

## 11. Back Orders and Allocations

### 11.1 Back Order Management
- Automatic back order creation
- Back order notification
- Back order fulfillment priority
- Partial shipment vs. complete shipment
- Back order cancellation
- Back order aging

### 11.2 Allocation Rules
- Allocation priority (FIFO, Customer priority)
- Fair share allocation
- Allocation by customer class
- Allocation by geography
- Allocation override

---

## 12. Sales Commissions

### 12.1 Commission Setup
- Commission plans
- Commission rates
- Commission basis (Sales, Margin, Quantity)
- Commission tiers
- Split commissions
- Territory-based commissions

### 12.2 Commission Calculation
- Commission accrual
- Commission calculation period
- Commission adjustment
- Commission reporting
- Commission payment

---

## 13. Period Close Process

### 13.1 OM Close Activities
1. Order entry cutoff
2. Shipment cutoff
3. Revenue recognition
4. Unbilled shipments
5. Unshipped orders
6. Order backlog analysis
7. Commission accrual
8. AR transfer verification
9. GL reconciliation
10. Close OM period

### 13.2 Revenue Recognition
- Ship and debit revenue
- Point in time recognition
- Over time recognition
- Deferred revenue
- Unbilled revenue accrual

---

## 14. Integration Points

### 14.1 AR Integration
- Auto-invoice generation
- Invoice transfer to AR
- Credit limit checking
- Customer master sync
- Payment application

### 14.2 Inventory Integration
- ATP inquiry
- Inventory reservation
- Pick confirmation
- Ship confirmation
- Inventory reduction
- Return receipt

### 14.3 GL Integration
- Revenue posting
- COGS posting
- Deferred revenue
- Unbilled revenue
- Freight revenue

### 14.4 CRM Integration
- Customer data
- Opportunity to order
- Order status to CRM
- Service order creation

---

## 15. Reporting and Analytics

### 15.1 Standard Reports
- Open Orders Report
- Order Status Report
- Backlog Report
- Shipment Register
- Pick List
- Packing Slip
- Invoice Register
- Sales Analysis
- Commission Report
- On-Time Delivery
- Order Fill Rate

### 15.2 Analytics
- Sales by customer/product/region
- Order cycle time
- Order fulfillment rate
- On-time delivery %
- Perfect order %
- Backlog analysis
- Sales trends
- Product performance

---

## 16. Security and Access Control

### 16.1 OM Roles
- OM Administrator
- Sales Manager
- Sales Representative
- Order Entry Clerk
- Warehouse Manager
- Shipping Clerk
- Customer Service Rep

### 16.2 Function Security
- Order entry privileges
- Order approval authority
- Price override authority
- Discount approval
- Hold release authority
- Credit limit override
- Shipping confirmation
- RMA approval

### 16.3 Data Security
- Customer access restrictions
- Order visibility by salesperson
- Warehouse access
- Business unit access

---

**End of Document**
