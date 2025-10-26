# Cost Management Module - Requirements Document

## Executive Summary

The Cost Management (CM) module provides comprehensive cost accounting capabilities for tracking, analyzing, and managing product costs across the enterprise. This module supports multiple costing methods, overhead allocation, variance analysis, and integration with Inventory, Purchasing, Manufacturing, and General Ledger modules.

**Module Code:** CM
**Version:** 1.0
**Last Updated:** October 26, 2025

## Module Overview

### Purpose
The Cost Management module enables organizations to:
- Track and manage product costs across multiple costing methods
- Calculate and allocate overhead costs to products and services
- Perform variance analysis between standard and actual costs
- Value inventory using multiple costing methodologies
- Generate detailed cost accounting reports
- Support Activity-Based Costing (ABC) analysis
- Process cost transactions and distributions to the General Ledger
- Manage cost updates and rollups across product hierarchies

### Key Features
- Multiple costing methods (Standard, Average, FIFO, LIFO, Actual)
- Cost element definition and management
- Overhead rate calculation and allocation
- Absorption costing and marginal costing
- Activity-Based Costing (ABC)
- Cost processing and distribution
- Inventory valuation methods
- WIP (Work in Process) valuation
- Variance analysis and reporting
- Cost rollup and burden calculations
- Cost update simulations
- Integration with GL, INV, PO, OM, AP modules

---

## 1. Cost Organization Structure

### 1.1 Cost Organization Setup
**Requirement ID:** CM-001

**Description:**
Define cost organizations that align with inventory organizations to manage costing parameters, methods, and processes.

**Functional Requirements:**
- Create cost organizations linked to inventory organizations
- Define costing parameters at organization level
- Set default costing methods per organization
- Configure cost processing options
- Define GL account mappings for cost distributions
- Set cost accounting period calendars
- Configure cost update frequencies
- Define valuation account structures

**Business Rules:**
- Each inventory organization must have one primary cost organization
- Cost organization must inherit legal entity from inventory organization
- Costing methods can vary by organization
- Cost periods must align with GL periods

### 1.2 Cost Book Setup
**Requirement ID:** CM-002

**Description:**
Define multiple cost books to support parallel costing scenarios such as statutory reporting, management reporting, and transfer pricing.

**Functional Requirements:**
- Create multiple cost books per organization
- Define cost book purpose (Primary, Secondary, Simulation)
- Set costing method per cost book
- Configure cost element structures per book
- Define currency for each cost book
- Set up cost book hierarchies
- Enable/disable cost books
- Archive historical cost books

**Business Rules:**
- One primary cost book required per organization
- Secondary books can use different costing methods
- Cost books must share same cost period calendar
- Simulation books don't create GL entries

---

## 2. Costing Methods

### 2.1 Standard Costing
**Requirement ID:** CM-010

**Description:**
Support standard costing methodology where predetermined costs are assigned to materials, labor, and overhead.

**Functional Requirements:**
- Define standard costs by item and cost element
- Set standard cost effective dates
- Maintain standard cost history
- Calculate purchase price variance (PPV)
- Calculate material usage variance
- Calculate labor rate and efficiency variance
- Calculate overhead variance
- Process standard cost updates
- Freeze/unfreeze standard costs
- Roll up standard costs for assemblies

**Business Rules:**
- Standard costs remain constant until explicitly updated
- Variances calculated as difference between actual and standard
- Standard cost changes require cost update process
- All variance accounts must be defined

### 2.2 Average Costing
**Requirement ID:** CM-011

**Description:**
Maintain perpetual average costs that automatically recalculate with each inventory receipt transaction.

**Functional Requirements:**
- Calculate weighted average cost automatically
- Update average cost on receipt transactions
- Handle negative inventory scenarios
- Process average cost adjustments
- Maintain average cost history by period
- Support moving average calculations
- Handle cost absorption for receipts
- Process cost corrections retroactively

**Business Rules:**
- Average cost = Total inventory value / Total quantity on hand
- Average cost recalculates with each receipt
- Issues don't affect average cost
- Negative inventory requires special handling

### 2.3 FIFO Costing
**Requirement ID:** CM-012

**Description:**
Support First-In-First-Out costing methodology where oldest costs are relieved first.

**Functional Requirements:**
- Maintain cost layers by receipt date
- Relieve oldest cost layers first on issues
- Track quantity and cost per layer
- Handle partial layer consumption
- Maintain layer history
- Process layer adjustments
- Support lot-specific FIFO
- Generate FIFO valuation reports

**Business Rules:**
- Cost layers created for each receipt transaction
- Oldest layer consumed first on issues
- Layer must be fully consumed before moving to next
- Negative layers not permitted

### 2.4 LIFO Costing
**Requirement ID:** CM-013

**Description:**
Support Last-In-First-Out costing methodology where newest costs are relieved first.

**Functional Requirements:**
- Maintain cost layers by receipt date
- Relieve newest cost layers first on issues
- Track quantity and cost per layer
- Handle partial layer consumption
- Maintain layer history
- Process layer adjustments
- Calculate LIFO reserve
- Generate LIFO valuation reports

**Business Rules:**
- Cost layers created for each receipt transaction
- Newest layer consumed first on issues
- LIFO reserve calculated for financial reporting
- Year-end LIFO adjustments may be required

### 2.5 Actual Costing
**Requirement ID:** CM-014

**Description:**
Support actual costing where real costs are captured and allocated based on actual transactions.

**Functional Requirements:**
- Capture actual material costs from receipts
- Capture actual labor costs from time entries
- Capture actual overhead costs
- Allocate costs to products/jobs
- Process actual cost accounting
- Calculate actual vs. budget variances
- Support job costing
- Generate actual cost reports

**Business Rules:**
- Actual costs determined after transactions occur
- May require period-end cost allocation process
- Overhead allocated using actual rates
- Variances measured against budget or standard

---

## 3. Cost Elements

### 3.1 Cost Element Definition
**Requirement ID:** CM-020

**Description:**
Define cost elements to categorize and track different components of product cost.

**Functional Requirements:**
- Create cost element structures
- Define standard cost elements (Material, Labor, Overhead, etc.)
- Create custom cost element categories
- Set cost element attributes
- Define GL account mapping per element
- Enable/disable cost elements
- Set cost element hierarchies
- Configure element calculation rules

**Standard Cost Elements:**
- Material Cost
- Material Overhead
- Labor Cost
- Labor Overhead
- Outside Processing Cost
- Overhead Cost
- General and Administrative (G&A)

**Business Rules:**
- Minimum required: Material, Labor, Overhead
- Each element must map to GL account
- Element structure consistent across items in organization
- Cost element changes require cost update process

### 3.2 Cost Component Classes
**Requirement ID:** CM-021

**Description:**
Group cost elements into cost component classes for reporting and analysis.

**Functional Requirements:**
- Define cost component classes
- Assign cost elements to classes
- Create class hierarchies
- Configure rollup rules
- Define variance accounts by class
- Support multi-level classifications
- Enable class-based reporting
- Set default classes per item category

---

## 4. Overhead Management

### 4.1 Overhead Rate Setup
**Requirement ID:** CM-030

**Description:**
Define and maintain overhead rates for allocating indirect costs to products and activities.

**Functional Requirements:**
- Create overhead rate structures
- Define overhead pools and bases
- Calculate overhead rates (planned and actual)
- Set rate effective dates
- Support multiple overhead methods:
  - Percentage of material cost
  - Percentage of labor cost
  - Per unit rate
  - Activity-based rates
- Maintain overhead rate history
- Process overhead rate updates
- Calculate overhead variances

**Business Rules:**
- Overhead rates can be fixed or variable
- Rates must have effective date ranges
- Actual overhead rates calculated periodically
- Overhead applied based on activity level

### 4.2 Overhead Allocation
**Requirement ID:** CM-031

**Description:**
Allocate overhead costs to products, jobs, or cost centers based on defined allocation rules.

**Functional Requirements:**
- Define allocation bases
- Create allocation rules
- Process overhead allocations
- Support multiple allocation methods:
  - Direct allocation
  - Step-down allocation
  - Reciprocal allocation
  - Activity-based allocation
- Calculate allocated overhead amounts
- Generate overhead allocation reports
- Post overhead to GL
- Track under/over absorbed overhead

**Business Rules:**
- Allocation base must be measurable
- Allocation runs at defined frequencies
- Over/under absorbed overhead cleared to variance accounts
- Allocation methods consistent within cost book

### 4.3 Activity-Based Costing (ABC)
**Requirement ID:** CM-032

**Description:**
Support Activity-Based Costing methodology for more accurate overhead allocation based on cost drivers.

**Functional Requirements:**
- Define activities and cost pools
- Identify cost drivers
- Capture activity consumption data
- Calculate activity costs
- Allocate costs based on driver consumption
- Support multi-level ABC hierarchies
- Generate ABC analysis reports
- Compare ABC costs to traditional costing
- Process ABC allocations

**Business Rules:**
- Each activity must have defined cost driver
- Driver quantities must be measurable
- ABC can run parallel to traditional costing
- Activity costs allocated based on actual consumption

---

## 5. Cost Processing

### 5.1 Cost Accounting Cycle
**Requirement ID:** CM-040

**Description:**
Process cost transactions through the cost accounting cycle including receipt accounting, issue accounting, and variance processing.

**Functional Requirements:**
- Process material receipt transactions
- Process material issue transactions
- Calculate cost of goods sold (COGS)
- Process inventory adjustments
- Calculate work in process (WIP) costs
- Process completed production
- Calculate and post variances
- Generate cost accounting entries
- Post cost entries to GL
- Support cost accounting period close

**Business Rules:**
- Cost accounting follows inventory transactions
- All transactions must be costed before period close
- Variances calculated and posted at period end
- Cost entries must balance by cost element

### 5.2 Cost Transaction Processor
**Requirement ID:** CM-041

**Description:**
Automated processor to create cost accounting distributions for inventory and manufacturing transactions.

**Functional Requirements:**
- Queue transactions for cost processing
- Apply costing method to each transaction
- Calculate cost distributions
- Create GL accounting entries
- Handle cost errors and exceptions
- Support transaction reprocessing
- Generate processing logs
- Enable processing by organization/date range
- Support parallel processing
- Validate cost distributions

**Business Rules:**
- Transactions processed in chronological order
- Failed transactions logged for review
- Distributions created per cost element
- Processing can be manual or scheduled

### 5.3 Inventory Valuation
**Requirement ID:** CM-042

**Description:**
Calculate inventory valuation using defined costing methods for financial reporting.

**Functional Requirements:**
- Calculate on-hand inventory value
- Value inventory by item, location, lot, serial
- Generate inventory valuation reports
- Support multiple valuation methods simultaneously
- Calculate inventory reserve requirements
- Value obsolete and slow-moving inventory
- Generate inventory aging by cost
- Support lower of cost or market (LCM) valuation
- Calculate inventory turnover metrics

**Business Rules:**
- Valuation calculated at period end
- Valuation method must match cost book method
- Negative inventory flagged for resolution
- Valuation reports reconcile to GL

---

## 6. Cost Updates

### 6.1 Standard Cost Updates
**Requirement ID:** CM-050

**Description:**
Process standard cost updates including simulation, approval, and implementation of new standard costs.

**Functional Requirements:**
- Create cost update requests
- Simulate cost changes
- Calculate cost change impact
- Review and approve cost updates
- Implement approved cost updates
- Generate cost change variance
- Update item costs in batch
- Rollup assembly costs
- Maintain cost change history
- Post cost change adjustments to GL

**Business Rules:**
- Cost updates require approval
- Simulation doesn't affect actual costs
- Cost changes effective on specified date
- Cost change variance posted to designated accounts

### 6.2 Cost Rollup
**Requirement ID:** CM-051

**Description:**
Calculate rolled-up costs for assemblies and finished goods based on component costs and overhead.

**Functional Requirements:**
- Roll up costs from components to assemblies
- Include material, labor, overhead costs
- Apply overhead rates during rollup
- Handle multi-level bills of material
- Calculate shrinkage and scrap factors
- Support alternate BOM rollups
- Generate cost rollup reports
- Identify cost rollup errors
- Support manual cost overrides
- Save rollup results to cost books

**Business Rules:**
- Rollup follows BOM structure bottom-up
- Component costs must exist before rollup
- Overhead applied per rollup rules
- Circular BOM references prevented

### 6.3 Mass Cost Updates
**Requirement ID:** CM-052

**Description:**
Perform mass updates to costs based on item categories, cost elements, or percentage changes.

**Functional Requirements:**
- Select items for mass update by criteria
- Apply percentage or fixed amount changes
- Update by cost element
- Preview update results
- Validate cost changes
- Process updates in batch
- Generate update logs
- Rollback failed updates
- Schedule recurring updates
- Support global cost inflation updates

**Business Rules:**
- Mass updates require authorization
- Updates can be filtered by item attributes
- Preview mandatory before execution
- Update logs maintained for audit

---

## 7. Variance Analysis

### 7.1 Purchase Price Variance
**Requirement ID:** CM-060

**Description:**
Calculate and analyze variances between purchase order prices and standard costs.

**Functional Requirements:**
- Calculate PPV on receipt transactions
- Post PPV to designated variance accounts
- Generate PPV reports by supplier, item, category
- Track cumulative PPV by period
- Analyze PPV trends
- Set PPV tolerance levels
- Flag significant PPV for review
- Support PPV accrual accounting

**Business Rules:**
- PPV = (Actual PO Price - Standard Cost) × Quantity
- PPV calculated at receipt time
- Favorable variance = Actual < Standard
- Unfavorable variance = Actual > Standard

### 7.2 Material Usage Variance
**Requirement ID:** CM-061

**Description:**
Track variances between actual material consumption and standard material requirements.

**Functional Requirements:**
- Calculate material usage variance
- Track variance by product and component
- Identify excess consumption
- Generate usage variance reports
- Analyze variance causes
- Set usage tolerance limits
- Alert on significant variances
- Link variance to quality issues

**Business Rules:**
- Usage Variance = (Actual Qty - Standard Qty) × Standard Cost
- Calculated at production completion
- Variances posted to designated accounts
- Scrap and rework tracked separately

### 7.3 Cost Variance Reporting
**Requirement ID:** CM-062

**Description:**
Comprehensive variance reporting across all cost elements and variance types.

**Functional Requirements:**
- Generate variance summary reports
- Drill down to variance details
- Compare actual vs. standard costs
- Analyze variance trends over time
- Create variance dashboards
- Export variance data
- Schedule automated variance reports
- Set variance alert thresholds
- Support variance analysis by dimension

**Variance Types Tracked:**
- Purchase Price Variance
- Material Usage Variance
- Labor Rate Variance
- Labor Efficiency Variance
- Overhead Spending Variance
- Overhead Volume Variance
- Total Cost Variance

---

## 8. WIP (Work in Process) Costing

### 8.1 WIP Valuation
**Requirement ID:** CM-070

**Description:**
Calculate and maintain work in process inventory valuation for manufacturing environments.

**Functional Requirements:**
- Track WIP by job/order
- Calculate material costs in WIP
- Calculate labor costs in WIP
- Apply overhead to WIP
- Value WIP at period end
- Generate WIP valuation reports
- Support multiple WIP valuation methods
- Process WIP adjustments
- Transfer costs from WIP to finished goods

**Business Rules:**
- WIP valued using same method as inventory
- WIP costs accumulate until job completion
- Completed jobs transfer cost to FG inventory
- Scrapped WIP written off to expense

### 8.2 Job Costing
**Requirement ID:** CM-071

**Description:**
Track costs by individual jobs or production orders for detailed cost analysis.

**Functional Requirements:**
- Create job cost sheets
- Capture direct material costs by job
- Capture direct labor costs by job
- Allocate overhead to jobs
- Track job status and completion
- Calculate job profitability
- Generate job cost reports
- Compare estimated vs. actual job costs
- Close completed jobs
- Archive job cost history

**Business Rules:**
- Each job must have unique identifier
- Costs captured in real-time
- Job costs closed only when job completed
- Job variances analyzed at completion

---

## 9. Cost Accounting Reports

### 9.1 Standard Cost Reports
**Requirement ID:** CM-080

**Description:**
Generate comprehensive cost accounting reports for analysis and decision-making.

**Standard Reports:**
- Item Cost Summary
- Cost Element Detail Report
- Standard vs. Actual Cost Comparison
- Cost Change History Report
- Overhead Rate Report
- Overhead Allocation Report
- Inventory Valuation Report
- COGS Report
- WIP Valuation Report
- Cost Variance Summary
- Cost Rollup Report
- ABC Analysis Report

**Functional Requirements:**
- Generate reports on demand or scheduled
- Export reports to Excel, PDF
- Support drill-down capabilities
- Filter reports by multiple dimensions
- Compare costs across periods
- Generate graphical cost analysis
- Create custom report templates
- Save report parameters
- Schedule recurring reports
- Email reports automatically

### 9.2 Cost Analytics and Dashboards
**Requirement ID:** CM-081

**Description:**
Provide real-time cost analytics and visual dashboards for cost monitoring and analysis.

**Functional Requirements:**
- Create cost analytics dashboards
- Display key cost metrics and KPIs
- Show cost trends and variances
- Support interactive analysis
- Enable ad-hoc cost queries
- Create what-if cost scenarios
- Compare costs across business units
- Analyze cost drivers
- Generate predictive cost analytics
- Export analytics data

**Key Metrics:**
- Total Product Cost
- Cost by Element
- Variance %
- Cost Trend
- Margin %
- Inventory Turn
- WIP Value
- Overhead Rate

---

## 10. Integration Points

### 10.1 Integration with Inventory Management
**Requirement ID:** CM-090

**Description:**
Seamless integration with Inventory module for real-time cost updates based on inventory transactions.

**Integration Points:**
- Receive item costs for valuation
- Update costs on inventory receipts
- Calculate COGS on inventory issues
- Process inventory adjustment costs
- Value on-hand inventory
- Support lot/serial cost tracking
- Sync item master data
- Process interorg transfer costs

### 10.2 Integration with Purchasing
**Requirement ID:** CM-091

**Description:**
Integration with Purchasing module to capture receipt costs and calculate purchase price variances.

**Integration Points:**
- Receive PO costs for standard cost comparison
- Calculate PPV on receipts
- Process landed costs from PO
- Handle returns to vendor costing
- Support consignment costing
- Process drop shipment costs
- Apply PO price updates
- Track freight and duty costs

### 10.3 Integration with General Ledger
**Requirement ID:** CM-092

**Description:**
Post cost accounting distributions to General Ledger for financial reporting.

**Integration Points:**
- Create cost accounting journals
- Post inventory valuation entries
- Post variance entries
- Post COGS entries
- Post WIP entries
- Post overhead allocation entries
- Reconcile cost subledger to GL
- Support multiple GL books
- Generate audit trail

### 10.4 Integration with Order Management
**Requirement ID:** CM-093

**Description:**
Provide cost information for profitability analysis and pricing decisions.

**Integration Points:**
- Provide item costs for margin calculation
- Support cost-plus pricing
- Calculate order profitability
- Analyze customer profitability by cost
- Support quotation costing
- Provide cost data for revenue recognition
- Track sales discounts impact on margin

---

## 11. Period Close Process

### 11.1 Cost Period Management
**Requirement ID:** CM-100

**Description:**
Manage cost accounting periods and control period close process.

**Functional Requirements:**
- Define cost accounting periods
- Open/close cost periods
- Align cost periods with GL periods
- Set period close deadlines
- Control transaction entry by period
- Process period-end accruals
- Generate period-end reports
- Archive closed period data
- Support retroactive period adjustments
- Validate period close completion

**Business Rules:**
- Cost periods must match GL periods
- Prior periods can be reopened with authorization
- Transactions not allowed in closed periods
- Period close checklist must be completed

### 11.2 Period Close Checklist
**Requirement ID:** CM-101

**Description:**
Systematic checklist to ensure all cost accounting activities completed before period close.

**Checklist Items:**
1. Process all pending receipts
2. Process all pending issues
3. Complete physical inventory counts
4. Process inventory adjustments
5. Run cost transaction processor
6. Calculate and post variances
7. Process overhead allocations
8. Generate WIP valuation report
9. Reconcile inventory to GL
10. Review and approve cost reports
11. Post cost entries to GL
12. Perform final cost validations
13. Close cost period

---

## 12. Security and Controls

### 12.1 Cost Management Security
**Requirement ID:** CM-110

**Description:**
Implement security controls to protect cost data and ensure proper authorization.

**Security Requirements:**
- Role-based access to cost functions
- Separate duties for cost entry and approval
- Restrict cost update functions
- Audit log for cost changes
- Secure standard cost data
- Control cost report access
- Encrypt sensitive cost data
- Monitor unauthorized access attempts

**User Roles:**
- Cost Accountant
- Cost Manager
- Cost Analyst
- Cost Approver
- Cost Viewer (Read-only)

### 12.2 Cost Audit Trail
**Requirement ID:** CM-111

**Description:**
Maintain comprehensive audit trail for all cost transactions and changes.

**Audit Requirements:**
- Log all cost updates
- Track standard cost changes
- Record variance postings
- Audit overhead allocations
- Log cost method changes
- Track user actions and timestamps
- Maintain change history
- Generate audit reports
- Support compliance audits
- Retain audit data per retention policy

---

## 13. Technical Requirements

### 13.1 Performance Requirements
- Cost transaction processing: 10,000 transactions per hour
- Cost rollup processing: Complete within 2 hours for 100,000 items
- Period close processing: Complete within 4 hours
- Report generation: Standard reports within 30 seconds
- Concurrent user support: 100+ concurrent cost users

### 13.2 Data Volume Estimates
- Items with costs: 500,000+
- Cost transactions per month: 5,000,000+
- Cost elements per item: 10-15
- Historical periods retained: 60 months
- Cost books per organization: 5
- Concurrent cost updates: 1,000+

### 13.3 Integration Requirements
- Real-time integration with Inventory
- Near real-time integration with Purchasing
- Batch integration with GL (configurable frequency)
- API support for external cost systems
- Support for EDI cost updates
- Web services for cost inquiries

---

## 14. Compliance and Standards

### 14.1 Accounting Standards Compliance
- Generally Accepted Accounting Principles (GAAP)
- International Financial Reporting Standards (IFRS)
- Cost Accounting Standards (CAS)
- Sarbanes-Oxley (SOX) compliance
- IRS inventory valuation requirements

### 14.2 Industry-Specific Requirements
- FDA requirements for pharmaceutical costing
- Aerospace and Defense cost accounting standards
- Automotive industry cost standards
- Electronics industry standard costs
- Process manufacturing cost requirements

---

## 15. Reporting Requirements

### 15.1 Regulatory Reports
- Inventory valuation for financial statements
- COGS reporting
- WIP reporting
- Cost variance reporting
- Overhead rate disclosure
- Cost method disclosure

### 15.2 Management Reports
- Product cost analysis
- Cost trend analysis
- Margin analysis by product
- Variance analysis by exception
- Cost reduction opportunity reports
- Make vs. buy analysis
- Profitability by product line

---

## Appendix

### A. Glossary
- **Standard Cost:** Predetermined cost used for inventory valuation
- **Actual Cost:** Real cost incurred based on transactions
- **Variance:** Difference between standard and actual cost
- **Cost Element:** Component of total cost (Material, Labor, Overhead)
- **Cost Rollup:** Calculation of assembly cost from component costs
- **PPV:** Purchase Price Variance
- **WIP:** Work in Process inventory
- **ABC:** Activity-Based Costing
- **COGS:** Cost of Goods Sold

### B. Related Documents
- Inventory Management Requirements
- Purchasing Requirements
- General Ledger Requirements
- Order Management Requirements
- Manufacturing Requirements (if applicable)

### C. Assumptions
- Organization using perpetual inventory system
- GL integration required for all cost postings
- Standard costing primary method for most organizations
- Cost periods align with GL fiscal calendar
- Multi-organization support required

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Final
**Total Features:** 100+ features across all cost management areas
