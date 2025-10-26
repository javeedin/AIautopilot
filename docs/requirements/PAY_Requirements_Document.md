# Payroll Module - Requirements Document

## Executive Summary

The Payroll (PAY) module provides comprehensive capabilities for processing employee payroll, calculating earnings and deductions, managing tax compliance, generating pay statements, and integrating with time tracking and benefits systems. This module ensures accurate, timely, and compliant payroll processing.

**Module Code:** PAY
**Version:** 1.0
**Last Updated:** October 26, 2025

## Module Overview

### Purpose
The Payroll module enables organizations to:
- Process regular and off-cycle payroll runs
- Calculate gross-to-net pay accurately
- Manage earnings, deductions, and taxes
- Ensure tax compliance (federal, state, local)
- Generate paychecks and direct deposits
- Process garnishments and child support
- Handle retroactive payments
- Support multi-state and international payroll
- Integrate with time tracking and benefits
- Generate payroll reports and tax filings
- Provide employee pay transparency

### Key Features
- Payroll processing engine
- Earnings and deductions management
- Tax calculation and withholding
- Direct deposit and check processing
- Garnishment processing
- Retroactive pay adjustments
- Year-end processing (W-2, 1099)
- Payroll reports and analytics
- Employee pay inquiry
- Tax filing and remittance
- Multi-state payroll
- Integration with GL, HCM, Time & Attendance

---

## 1. Payroll Setup

### 1.1 Payroll Configuration
**Requirement ID:** PAY-001

**Description:**
Configure payroll system parameters and processing rules.

**Functional Requirements:**
- Define payroll parameters:
  - Company tax ID (EIN)
  - Pay frequency (Weekly, Biweekly, Semi-monthly, Monthly)
  - Pay schedule
  - Pay periods
  - Pay dates
  - Check date vs. pay date
  - Calendar settings
- Configure payroll defaults:
  - Standard hours
  - Overtime rules
  - Holiday pay rules
  - Default GL accounts
- Set up payroll processing rules
- Define rounding rules
- Configure retroactive processing
- Set up payroll calendar

**Business Rules:**
- Pay frequency consistent for employee group
- Pay periods non-overlapping
- Check date typically day after pay period end
- All parameters effective dated

### 1.2 Payroll Entities
**Requirement ID:** PAY-002

**Description:**
Define payroll entities for legal and tax reporting.

**Functional Requirements:**
- Create payroll entities:
  - Company
  - Legal entity
  - Tax entity
  - Payroll group
- Link entities to tax IDs
- Define entity attributes:
  - Entity name
  - Tax ID (EIN)
  - State unemployment ID
  - Workers comp ID
  - Addresses for tax filing
- Map employees to entities
- Support multi-entity payroll
- Generate entity reports

**Business Rules:**
- Tax ID unique per entity
- Employees assigned to one primary entity
- Entity determines tax jurisdiction
- Entity required for tax filings

### 1.3 Pay Groups
**Requirement ID:** PAY-003

**Description:**
Group employees with similar pay characteristics for processing.

**Functional Requirements:**
- Create pay groups
- Define pay group attributes:
  - Pay frequency
  - Pay schedule
  - Payment method defaults
  - Processing rules
- Assign employees to pay groups
- Support multiple pay groups
- Process by pay group
- Generate pay group reports

**Business Rules:**
- Pay group determines processing schedule
- Employees can change pay groups
- Pay group affects payment timing
- All group changes effective dated

---

## 2. Earnings Management

### 2.1 Earning Codes
**Requirement ID:** PAY-010

**Description:**
Define earning types for regular pay, overtime, bonuses, and other compensation.

**Functional Requirements:**
- Create earning code library:
  - Regular pay
  - Overtime (1.5x, 2x)
  - Shift differential
  - Bonus
  - Commission
  - Holiday pay
  - PTO payout
  - Severance
  - Retro pay
  - Allowances
- Define earning attributes:
  - Earning code
  - Description
  - Calculation method
  - Rate basis (Hourly, Flat, Percentage)
  - Tax treatment
  - Subject to deductions
  - GL account mapping
- Support taxable/non-taxable earnings
- Enable earning calculation rules
- Configure earning limits

**Business Rules:**
- Earning codes standardized
- Tax treatment per IRS regulations
- Overtime calculated per FLSA
- Earnings tracked for reporting

### 2.2 Salary and Wage Calculation
**Requirement ID:** PAY-011

**Description:**
Calculate employee gross pay based on salary or hourly rates.

**Functional Requirements:**
- Calculate salary earnings:
  - Annual salary / pay periods
  - Prorated for partial periods
  - Handle salary changes mid-period
- Calculate hourly earnings:
  - Hours × hourly rate
  - Regular time
  - Overtime
  - Double time
  - Support multiple rates
- Apply shift differentials
- Calculate piece rate pay
- Handle negative earnings

**Business Rules:**
- Salary prorated based on days worked
- Overtime = Hours × Rate × Multiplier
- Shift diff added to base rate
- Minimum wage requirements met

### 2.3 Supplemental Pay
**Requirement ID:** PAY-012

**Description:**
Process supplemental payments like bonuses, commissions, and awards.

**Functional Requirements:**
- Process one-time bonuses
- Calculate commissions
- Process awards and prizes
- Handle retention bonuses
- Process sign-on bonuses
- Support different tax withholding methods:
  - Aggregate method
  - Flat rate method (22%)
- Post supplemental pay to GL
- Generate supplemental pay reports

**Business Rules:**
- Supplemental pay taxed per IRS rules
- Flat rate often used for bonuses
- Commissions calculated from sales data
- Awards may have tax implications

---

## 3. Deduction Management

### 3.1 Deduction Codes
**Requirement ID:** PAY-020

**Description:**
Define deduction types for taxes, benefits, garnishments, and voluntary deductions.

**Functional Requirements:**
- Create deduction code library:
  - Federal income tax
  - State income tax
  - Local income tax
  - Social Security (FICA)
  - Medicare
  - Health insurance
  - Dental insurance
  - Vision insurance
  - 401(k) contributions
  - HSA contributions
  - FSA contributions
  - Life insurance
  - Disability insurance
  - Garnishments
  - Child support
  - Union dues
  - Charitable contributions
- Define deduction attributes:
  - Deduction code
  - Description
  - Calculation method
  - Priority
  - Limits
  - Subject to taxes
  - GL account mapping
- Support pre-tax and post-tax deductions
- Configure deduction calculation rules

**Business Rules:**
- Deductions processed in priority order
- Statutory deductions mandatory
- Voluntary deductions require authorization
- Pre-tax deductions reduce taxable income

### 3.2 Tax Withholding
**Requirement ID:** PAY-021

**Description:**
Calculate federal, state, and local tax withholding.

**Functional Requirements:**
- Calculate federal income tax:
  - Use W-4 information
  - Support 2020+ W-4 format
  - Apply federal tax tables
  - Handle supplemental withholding
- Calculate state income tax:
  - Multi-state withholding
  - Reciprocal agreements
  - State tax tables
- Calculate local income tax:
  - City/county taxes
  - School district taxes
- Calculate FICA:
  - Social Security (6.2% up to wage base)
  - Medicare (1.45% no limit)
  - Additional Medicare (0.9% over threshold)
- Support tax exemptions
- Handle tax levy

**Business Rules:**
- W-4 determines federal withholding
- State withholding per residency and work location
- FICA withheld every paycheck
- Social Security has annual wage base limit
- Medicare has no wage limit

### 3.3 Benefit Deductions
**Requirement ID:** PAY-022

**Description:**
Process deductions for employee benefits.

**Functional Requirements:**
- Calculate health insurance deductions
- Process 401(k) contributions:
  - Pre-tax traditional
  - Roth (post-tax)
  - Employer match
  - Catch-up contributions
- Process HSA contributions
- Process FSA deductions
- Calculate life insurance premiums
- Process disability insurance
- Handle benefit enrollment changes
- Prorate deductions for partial periods
- Track annual limits (401k, HSA, FSA)

**Business Rules:**
- Benefit deductions per enrollment elections
- 401(k) annual limits enforced ($23,000 in 2024)
- HSA limits enforced ($4,150 individual in 2024)
- FSA limits enforced ($3,200 in 2024)
- Employer match calculated per plan rules

---

## 4. Garnishment Processing

### 4.1 Garnishment Management
**Requirement ID:** PAY-030

**Description:**
Process court-ordered garnishments and child support.

**Functional Requirements:**
- Record garnishment orders:
  - Garnishment type (Child support, Tax levy, Creditor, Student loan)
  - Case number
  - Issuing court
  - Payee information
  - Calculation method
  - Amount or percentage
  - Start and end dates
  - Maximum percentage of disposable income
- Calculate garnishment amounts
- Apply garnishment priority rules
- Process multiple garnishments
- Generate remittance
- Track garnishment payments
- Report garnishment history

**Garnishment Priority:**
1. Tax levies
2. Bankruptcy orders
3. Child support (current)
4. Child support (arrears)
5. Student loans
6. Creditor garnishments

**Business Rules:**
- Garnishments calculated on disposable income
- Federal limits: 25% of disposable income (creditor)
- Child support: up to 50-60% depending on circumstances
- Priority determines processing order
- Multiple garnishments may reduce each other

### 4.2 Child Support
**Requirement ID:** PAY-031

**Description:**
Process child support withholding orders.

**Functional Requirements:**
- Record child support orders
- Calculate withholding amount
- Apply income withholding limits
- Handle multiple support orders
- Generate child support payments
- Report to state disbursement units
- Track payment history
- Handle order modifications

**Business Rules:**
- Withholding per court order
- Medical support included
- Limits: 50% if supporting another family, 60% if not
- Current support takes priority over arrears
- Remit to state within 7 days

---

## 5. Payroll Processing

### 5.1 Payroll Run
**Requirement ID:** PAY-040

**Description:**
Execute payroll calculation for a pay period.

**Functional Requirements:**
- Initiate payroll run
- Select pay group and pay period
- Import time and attendance data
- Calculate gross pay
- Calculate deductions
- Calculate taxes
- Calculate net pay
- Generate pay register
- Support simulation mode
- Enable payroll corrections
- Validate payroll calculations
- Post payroll to GL
- Generate payment file
- Lock payroll after processing

**Payroll Calculation Flow:**
1. Import time data
2. Calculate gross earnings
3. Calculate pre-tax deductions
4. Calculate taxable wages
5. Calculate taxes
6. Calculate post-tax deductions
7. Calculate garnishments
8. Calculate net pay
9. Generate payments

**Business Rules:**
- Payroll run per pay period
- Simulation before final
- Corrections before posting
- Posted payroll locked
- GL entries balanced

### 5.2 Off-Cycle Payroll
**Requirement ID:** PAY-041

**Description:**
Process off-cycle payments outside regular payroll schedule.

**Functional Requirements:**
- Initiate off-cycle run
- Select employees for processing
- Define payment reason:
  - Termination final pay
  - Bonus payment
  - Commission payment
  - Correction payment
  - Retro payment
- Calculate earnings and deductions
- Calculate taxes
- Generate payment
- Post to GL
- Update year-to-date totals

**Business Rules:**
- Off-cycle for exceptions only
- Manual review required
- All calculations same as regular payroll
- YTD totals updated
- Separate GL posting if needed

### 5.3 Retroactive Processing
**Requirement ID:** PAY-042

**Description:**
Process retroactive pay adjustments for prior periods.

**Functional Requirements:**
- Identify retroactive changes:
  - Salary increases backdated
  - Missed earnings
  - Benefit correction
  - Tax withholding correction
- Calculate retro pay amount
- Determine applicable pay periods
- Recalculate earnings and deductions
- Calculate additional taxes
- Process retro payment
- Update year-to-date totals
- Generate retro pay report

**Business Rules:**
- Retro pay taxed in current period
- Prior period YTD totals updated
- Tax recalculation may be needed
- Documented reason required

---

## 6. Payment Processing

### 6.1 Direct Deposit
**Requirement ID:** PAY-050

**Description:**
Process electronic payment of wages via ACH.

**Functional Requirements:**
- Maintain employee bank account info:
  - Bank name
  - Routing number
  - Account number
  - Account type (Checking/Savings)
  - Allocation (Amount or Percentage)
- Support multiple bank accounts
- Generate ACH file (NACHA format)
- Prenote new accounts
- Transmit file to bank
- Receive ACH confirmations
- Handle ACH returns
- Track payment status
- Generate direct deposit reports

**Business Rules:**
- Bank account info encrypted
- Prenote 5-day wait before payment
- ACH files submitted 1-2 days before pay date
- Returns processed immediately
- Notification to employee on returns

### 6.2 Check Processing
**Requirement ID:** PAY-051

**Description:**
Print and issue payroll checks.

**Functional Requirements:**
- Generate payroll checks
- Print checks with pay stub
- Assign check numbers
- Support manual checks
- Handle voided checks
- Manage check stock
- Generate check register
- Support positive pay file
- Track outstanding checks
- Reconcile cleared checks

**Business Rules:**
- Check numbers sequential
- Voided numbers not reused
- Check stock secured
- Positive pay recommended
- Outstanding checks aged

### 6.3 Pay Cards
**Requirement ID:** PAY-052

**Description:**
Support payroll debit cards as payment method.

**Functional Requirements:**
- Issue pay cards to employees
- Load wages to cards
- Generate card funding file
- Track card balances
- Handle card fees
- Support card replacement
- Provide card access
- Generate card reports

**Business Rules:**
- Pay cards optional
- Fees disclosed to employees
- Immediate wage access
- No bank account required

---

## 7. Payroll Reporting

### 7.1 Pay Statements
**Requirement ID:** PAY-060

**Description:**
Generate employee pay statements (pay stubs).

**Functional Requirements:**
- Generate pay statements each pay period
- Include pay stub details:
  - Employee info
  - Pay period dates
  - Pay date
  - Earnings detail (current and YTD)
  - Deductions detail (current and YTD)
  - Tax withholding (current and YTD)
  - Gross pay, deductions, net pay
  - Employer contributions
  - Leave balances
  - Payment method
- Support electronic pay stubs
- Print paper pay stubs
- Enable employee self-service access
- Retain pay stub history
- Support reprints

**Business Rules:**
- Pay stub provided each pay period
- Electronic or paper
- Retained per retention policy
- Accessible to employees

### 7.2 Payroll Reports
**Requirement ID:** PAY-061

**Description:**
Comprehensive payroll reporting for operations and compliance.

**Standard Reports:**
- Payroll Register
- Deduction Register
- Tax Register
- Garnishment Register
- Payroll Summary by Department
- Payroll Summary by GL Account
- Labor Cost Distribution
- Benefits Deduction Report
- 401(k) Report
- Quarter-to-Date Report
- Year-to-Date Report

**Functional Requirements:**
- Generate reports on demand
- Schedule recurring reports
- Export to Excel, PDF
- Support drill-down
- Parameterized reporting
- Multi-period comparison

### 7.3 Payroll Analytics
**Requirement ID:** PAY-062

**Description:**
Analytics dashboards for payroll metrics and insights.

**Functional Requirements:**
- Payroll cost analytics
- Labor cost by department
- Overtime analysis
- Headcount and FTE reporting
- Average wage analysis
- Turnover cost analysis
- Payroll trend analysis
- Budget vs. actual payroll

**Key Metrics:**
- Total payroll cost
- Average wage
- Overtime percentage
- Labor cost percentage
- Cost per FTE
- Payroll accuracy rate

---

## 8. Tax Compliance

### 8.1 Tax Filing and Remittance
**Requirement ID:** PAY-070

**Description:**
Manage tax filing and payment obligations.

**Functional Requirements:**
- Calculate tax liabilities:
  - Federal income tax
  - State income tax
  - FICA (Social Security and Medicare)
  - State unemployment (SUTA)
  - Federal unemployment (FUTA)
  - Local taxes
- Generate tax deposit schedules
- Support deposit frequencies:
  - Monthly depositor
  - Semi-weekly depositor
- Generate tax payment vouchers
- Track tax payments
- Generate tax reports:
  - Form 941 (Quarterly federal)
  - Form 940 (Annual FUTA)
  - State quarterly returns
  - State annual reconciliations
- File taxes electronically (EFTPS)
- Track filing deadlines

**Business Rules:**
- Taxes deposited per IRS schedule
- Semi-weekly if liability >$50k annually
- Monthly if liability <$50k
- Quarterly filing Form 941
- Annual filing Form 940 and W-2s

### 8.2 W-2 Processing
**Requirement ID:** PAY-071

**Description:**
Generate and file annual W-2 wage and tax statements.

**Functional Requirements:**
- Generate W-2 forms for all employees
- Include W-2 data:
  - Wages, tips, compensation (Box 1)
  - Federal income tax withheld (Box 2)
  - Social Security wages and tax (Boxes 3,4)
  - Medicare wages and tax (Boxes 5,6)
  - State wages and tax
  - Local wages and tax
- Support W-2c for corrections
- Print W-2 forms
- Provide electronic W-2s to employees
- File W-2s with SSA
- Generate W-3 transmittal
- File state W-2s
- Retain W-2 copies

**Business Rules:**
- W-2 to employees by Jan 31
- W-2 filed with SSA by Jan 31
- Corrections via W-2c
- Retain copies 4 years

### 8.3 1099 Processing
**Requirement ID:** PAY-072

**Description:**
Generate 1099 forms for contractors and vendors.

**Functional Requirements:**
- Identify 1099 eligible contractors
- Track 1099 earnings by type:
  - 1099-NEC (Non-employee compensation)
  - 1099-MISC (Miscellaneous income)
- Generate 1099 forms
- Provide 1099s to recipients
- File 1099s with IRS
- Generate 1096 transmittal
- Support 1099 corrections

**Business Rules:**
- 1099 required if >$600 paid
- 1099-NEC for contractor services
- Forms to recipients by Jan 31
- File with IRS by Jan 31 (electronic)
- Retain copies 4 years

---

## 9. Multi-State and International Payroll

### 9.1 Multi-State Payroll
**Requirement ID:** PAY-080

**Description:**
Support employees working in multiple states.

**Functional Requirements:**
- Track employee work states
- Determine state for withholding:
  - Resident state
  - Work state
  - Reciprocal agreements
- Apply state tax rules
- Calculate state unemployment
- Support state disability insurance:
  - CA SDI
  - NY DBL
  - NJ TDI
  - RI TDI
  - HI TDI
- Handle multi-state workers
- Generate state reports

**Business Rules:**
- Withholding typically in work state
- Reciprocal agreements prevent double taxation
- State unemployment in base state
- SDI in applicable states

### 9.2 Local Tax Compliance
**Requirement ID:** PAY-081

**Description:**
Manage city, county, and school district taxes.

**Functional Requirements:**
- Configure local tax jurisdictions
- Calculate local income taxes
- Calculate occupational taxes
- Support resident and work location taxes
- File local tax returns
- Remit local taxes

**Business Rules:**
- Local taxes vary by jurisdiction
- Work location typically determines tax
- Some jurisdictions have resident tax
- Local tax rates change frequently

### 9.3 International Payroll
**Requirement ID:** PAY-082

**Description:**
Support payroll for international employees (future).

**Functional Requirements:**
- Multi-currency payroll
- Country-specific tax calculation
- Social insurance contributions
- Statutory deductions
- Local compliance requirements
- Global reporting

**Business Rules:**
- Country regulations vary significantly
- Currency conversion required
- Local bank accounts needed
- Expatriate tax handling complex

---

## 10. Integration Points

### 10.1 Integration with HCM
**Requirement ID:** PAY-090

**Description:**
Seamless integration with HCM module for employee data.

**Integration Points:**
- Employee master data
- Job and position data
- Compensation data
- Organizational assignment
- Employment status changes
- New hires and terminations

### 10.2 Integration with Time & Attendance
**Requirement ID:** PAY-091

**Description:**
Import time and attendance data for payroll calculation.

**Integration Points:**
- Regular hours worked
- Overtime hours
- PTO hours
- Holiday hours
- Time entry validation
- Approval status

### 10.3 Integration with Benefits
**Requirement ID:** PAY-092

**Description:**
Sync benefit enrollment and calculate benefit deductions.

**Integration Points:**
- Benefit elections
- Benefit costs
- Enrollment changes
- Carrier deductions
- 401(k) contributions
- HSA/FSA deductions

### 10.4 Integration with General Ledger
**Requirement ID:** PAY-093

**Description:**
Post payroll transactions to General Ledger.

**Integration Points:**
- Payroll expense by department
- Tax liability accounts
- Benefit liability accounts
- Garnishment payable accounts
- Net pay payable account
- Employer tax expense
- Employer benefit contributions

---

## 11. Year-End Processing

### 11.1 Year-End Close
**Requirement ID:** PAY-100

**Description:**
Close payroll year and prepare for new year.

**Functional Requirements:**
- Run final payroll of year
- Reconcile YTD totals
- Generate year-end reports
- Process W-2s and 1099s
- File annual tax returns
- Archive year-end data
- Reset YTD counters
- Update tax tables for new year
- Communicate year-end schedule

**Business Rules:**
- All year payrolls must be final
- YTD totals verified before W-2s
- W-2 and 1099 deadlines strict
- Prior year data archived
- New year tables loaded

### 11.2 Quarter-End Processing
**Requirement ID:** PAY-101

**Description:**
Close payroll quarter and file quarterly returns.

**Functional Requirements:**
- Run final payroll of quarter
- Reconcile quarter totals
- Generate quarterly reports
- Prepare Form 941
- Prepare state quarterly returns
- File quarterly returns
- Remit quarterly taxes
- Archive quarter data

**Business Rules:**
- Quarterly deadlines enforced
- Quarter totals must balance
- Form 941 filed by month end after quarter
- State returns vary by state

---

## 12. Payroll Corrections and Adjustments

### 12.1 Payroll Corrections
**Requirement ID:** PAY-110

**Description:**
Process corrections to payroll errors.

**Functional Requirements:**
- Identify payroll errors
- Determine correction method:
  - Current period adjustment
  - Off-cycle payment
  - Next payroll adjustment
- Calculate correction amount
- Adjust year-to-date totals
- Update employee records
- Reissue payment if needed
- Document correction
- Audit correction

**Business Rules:**
- Corrections processed promptly
- Under/overpayments corrected
- Tax adjustments calculated
- Documentation required
- Employee notified

### 12.2 Manual Adjustments
**Requirement ID:** PAY-111

**Description:**
Process manual payroll adjustments.

**Functional Requirements:**
- Create manual adjustment
- Select adjustment type:
  - Earnings adjustment
  - Deduction adjustment
  - Tax adjustment
- Enter adjustment amount
- Apply to specific pay period
- Update calculations
- Approve adjustment
- Post to GL

**Business Rules:**
- Manual adjustments require approval
- Reason documented
- YTD totals updated
- GL entries balanced

---

## 13. Employee Self-Service

### 13.1 Payroll Inquiry
**Requirement ID:** PAY-120

**Description:**
Enable employees to view their payroll information.

**Functional Requirements:**
- View current pay stub
- View pay history
- View year-to-date totals
- View tax withholding (W-4)
- View direct deposit accounts
- Download pay stubs
- Print pay stubs
- View W-2 online

**Business Rules:**
- Employees see own data only
- Pay stubs available immediately
- History retained online
- Secure access required

### 13.2 Payroll Updates
**Requirement ID:** PAY-121

**Description:**
Allow employees to update certain payroll information.

**Functional Requirements:**
- Update W-4 withholding
- Update state withholding
- Add/modify direct deposit accounts
- View deduction elections
- Update emergency contacts
- Changes submitted for approval
- Effective dating enforced

**Business Rules:**
- Some changes effective immediately
- Some changes require approval
- W-4 changes take effect next payroll
- Direct deposit prenote required

---

## 14. Compliance and Audit

### 14.1 Payroll Compliance
**Requirement ID:** PAY-130

**Description:**
Ensure compliance with wage and hour laws and tax regulations.

**Compliance Requirements:**
- Fair Labor Standards Act (FLSA)
- Equal Pay Act
- Federal and state tax regulations
- Unemployment insurance
- Workers compensation
- ACA reporting (Forms 1095-B, 1095-C)
- Garnishment laws
- Escheatment of unclaimed wages

### 14.2 Payroll Audit
**Requirement ID:** PAY-131

**Description:**
Support payroll audits and maintain audit trail.

**Audit Requirements:**
- Log all payroll changes
- Track manual adjustments
- Record payroll run history
- Maintain calculation audit trail
- Support compliance audits
- Generate audit reports
- Retain audit data per policy
- SOX compliance for payroll

---

## 15. Technical Requirements

### 15.1 Performance Requirements
- Payroll calculation: 10,000 employees in <30 minutes
- Pay stub generation: <10 seconds per employee
- Tax calculation: Real-time
- Report generation: <60 seconds
- Concurrent users: 1,000+

### 15.2 Data Volume Estimates
- Employees on payroll: 100,000+
- Pay periods per year: 26 (biweekly)
- Paychecks per year: 2,600,000+
- Deductions per employee: 10-20
- YTD records: Unlimited
- Historical retention: 7 years minimum

---

## Appendix

### A. Glossary
- **FICA:** Federal Insurance Contributions Act (Social Security and Medicare)
- **FUTA:** Federal Unemployment Tax Act
- **SUTA:** State Unemployment Tax Act
- **YTD:** Year-to-Date
- **QTD:** Quarter-to-Date
- **ACH:** Automated Clearing House
- **NACHA:** National Automated Clearing House Association
- **EFTPS:** Electronic Federal Tax Payment System
- **FLSA:** Fair Labor Standards Act
- **Gross-to-Net:** Calculation from gross wages to net pay

### B. Related Documents
- HCM Requirements
- Time & Attendance Requirements
- Benefits Administration Requirements
- General Ledger Requirements

---

**Document Version:** 1.0
**Last Updated:** October 26, 2025
**Status:** Final
**Total Features:** 110+ features across all payroll areas
