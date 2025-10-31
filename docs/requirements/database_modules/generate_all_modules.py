#!/usr/bin/env python3
"""
Comprehensive Oracle Fusion ERP Module Column Generator
Generates complete column specifications for all 16 modules
"""

import csv
import sys
from pathlib import Path

# Standard WHO columns (every table)
WHO_COLUMNS = [
    ("CREATED_BY", "NUMBER(15)", "NOT NULL", "", "User who created the record", "WHO"),
    ("CREATION_DATE", "TIMESTAMP", "NOT NULL", "CURRENT_TIMESTAMP", "Record creation timestamp", "WHO"),
    ("LAST_UPDATED_BY", "NUMBER(15)", "NOT NULL", "", "User who last updated", "WHO"),
    ("LAST_UPDATE_DATE", "TIMESTAMP", "NOT NULL", "CURRENT_TIMESTAMP", "Last update timestamp", "WHO"),
    ("LAST_UPDATE_LOGIN", "NUMBER(15)", "NULL", "", "Last update login session", "WHO"),
    ("OBJECT_VERSION_NUMBER", "NUMBER(9)", "NOT NULL", "1", "Optimistic locking version", "WHO"),
]

CONCURRENT_COLUMNS = [
    ("REQUEST_ID", "NUMBER(15)", "NULL", "", "Concurrent request ID", "WHO"),
    ("PROGRAM_APPLICATION_ID", "NUMBER(15)", "NULL", "", "Program application ID", "WHO"),
    ("PROGRAM_ID", "NUMBER(15)", "NULL", "", "Concurrent program ID", "WHO"),
    ("PROGRAM_UPDATE_DATE", "TIMESTAMP", "NULL", "", "Program update date", "WHO"),
]

def dff(count=5):
    """Generate DFF columns"""
    cols = [("ATTRIBUTE_CATEGORY", "VARCHAR2(30)", "NULL", "", "DFF category", "DFF")]
    for i in range(1, count + 1):
        cols.append((f"ATTRIBUTE{i}", "VARCHAR2(150)", "NULL", "", f"DFF attribute {i}", "DFF"))
    return cols

def effective_dating():
    """Generate effective dating columns"""
    return [
        ("EFFECTIVE_START_DATE", "DATE", "NULL", "", "Effective start date", "EffectiveDating"),
        ("EFFECTIVE_END_DATE", "DATE", "NULL", "31-DEC-4712", "Effective end date", "EffectiveDating"),
        ("EFFECTIVE_LATEST_CHANGE", "VARCHAR2(1)", "NULL", "Y", "Latest record (Y/N)", "EffectiveDating"),
        ("EFFECTIVE_SEQUENCE", "NUMBER(9)", "NULL", "1", "Effective sequence", "EffectiveDating"),
    ]

# Quick helper functions for common column patterns
def pk(name): return (name, "NUMBER(15)", "NOT NULL", "", "Primary key", "PK")
def fk(name, desc=""): return (name, "NUMBER(15)", "NOT NULL" if "NOT NULL" in desc else "NULL", "", desc or f"{name} reference", "FK")
def code(name, size=30): return (name, f"VARCHAR2({size})", "NOT NULL", "", f"{name}", "Business")
def name_col(col_name, size=240): return (col_name, f"VARCHAR2({size})", "NOT NULL", "", f"{col_name}", "Business")
def desc_col(): return ("DESCRIPTION", "VARCHAR2(1000)", "NULL", "", "Description", "Business")
def status(): return ("STATUS", "VARCHAR2(30)", "NULL", "ACTIVE", "Status", "Business")
def amt(name): return (name, "NUMBER(20,2)", "NULL", "0", f"{name}", "Business")
def qty(name): return (name, "NUMBER(20,4)", "NULL", "", f"{name}", "Business")
def date_col(name): return (name, "DATE", "NOT NULL" if "DATE" in name.upper() and "END" not in name.upper() else "NULL", "", f"{name}", "Business")
def flag(name): return (name, "VARCHAR2(1)", "NULL", "N", f"{name} (Y/N)", "Business")

# All module definitions
MODULES = {
    "UR": [
        ("UR-T001", "UR_USERS", [
            pk("USER_ID"), code("USERNAME", 100), code("EMAIL", 240),
            ("PASSWORD_HASH", "VARCHAR2(255)", "NOT NULL", "", "Password hash", "Business"),
            name_col("FIRST_NAME", 100), name_col("LAST_NAME", 100),
            status(), fk("EMPLOYEE_ID", "Employee reference"),
            ("LAST_LOGIN_DATE", "TIMESTAMP", "NULL", "", "Last login", "Business"),
            flag("ACCOUNT_LOCKED_FLAG"),
        ], 5, False, False),
        
        ("UR-T002", "UR_ROLES", [
            pk("ROLE_ID"), name_col("ROLE_NAME", 100), code("ROLE_CODE", 50),
            ("ROLE_TYPE", "VARCHAR2(30)", "NULL", "", "Role type", "Business"),
            desc_col(), status(),
        ], 5, False, False),
        
        ("UR-T003", "UR_PERMISSIONS", [
            pk("PERMISSION_ID"), name_col("PERMISSION_NAME", 100),
            ("OBJECT_TYPE", "VARCHAR2(50)", "NULL", "", "Object type", "Business"),
            ("ACTION", "VARCHAR2(30)", "NULL", "", "Permission action", "Business"),
        ], 3, False, False),
        
        ("UR-T004", "UR_ROLE_PERMISSIONS", [
            pk("ROLE_PERMISSION_ID"), fk("ROLE_ID"), fk("PERMISSION_ID"),
        ], 3, False, False),
        
        ("UR-T005", "UR_USER_ROLES", [
            pk("USER_ROLE_ID"), fk("USER_ID"), fk("ROLE_ID"),
            date_col("START_DATE"), date_col("END_DATE"), status(),
        ], 3, False, False),
    ],

    "AR": [
        ("AR-T001", "AR_CUSTOMERS", [
            pk("CUSTOMER_ID"), code("CUSTOMER_NUMBER", 50), name_col("CUSTOMER_NAME"),
            ("TAX_ID", "VARCHAR2(50)", "NULL", "", "Tax ID", "Business"),
            ("CUSTOMER_TYPE", "VARCHAR2(30)", "NULL", "", "Customer type", "Business"),
            ("PAYMENT_TERMS_ID", "NUMBER(15)", "NULL", "", "Payment terms", "FK"),
            amt("CREDIT_LIMIT"), status(),
        ], 5, False, True),
        
        ("AR-T003", "AR_INVOICES", [
            pk("INVOICE_ID"),
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Operating unit", "MultiOrg"),
            ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit", "MultiOrg"),
            ("LEDGER_ID", "NUMBER(15)", "NOT NULL", "", "Ledger", "FK"),
            fk("CUSTOMER_ID"), code("INVOICE_NUMBER", 50),
            date_col("INVOICE_DATE"), date_col("GL_DATE"), date_col("DUE_DATE"),
            code("CURRENCY_CODE", 15), amt("INVOICE_AMOUNT"), amt("TAX_AMOUNT"),
            amt("AMOUNT_PAID"), 
            ("PAYMENT_STATUS", "VARCHAR2(30)", "NULL", "UNPAID", "Payment status", "Business"),
            ("POSTING_STATUS", "VARCHAR2(30)", "NULL", "NOT_POSTED", "Posting status", "Business"),
            status(),
        ], 10, True, False),
        
        ("AR-T006", "AR_RECEIPTS", [
            pk("RECEIPT_ID"), code("RECEIPT_NUMBER", 50), fk("CUSTOMER_ID"),
            date_col("RECEIPT_DATE"), amt("AMOUNT"),
            ("PAYMENT_METHOD", "VARCHAR2(30)", "NULL", "", "Payment method", "Business"),
            status(),
        ], 10, True, False),
    ],

    "PO": [
        ("PO-T005", "PO_HEADERS", [
            pk("PO_ID"),
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Operating unit", "MultiOrg"),
            ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit", "MultiOrg"),
            code("PO_NUMBER", 50), fk("SUPPLIER_ID"),
            date_col("ORDER_DATE"), code("CURRENCY_CODE", 15),
            amt("TOTAL_AMOUNT"),
            ("PAYMENT_TERMS", "VARCHAR2(50)", "NULL", "", "Payment terms", "Business"),
            ("APPROVAL_STATUS", "VARCHAR2(30)", "NULL", "NEEDS_APPROVAL", "Approval status", "Business"),
            status(),
        ], 10, True, False),
        
        ("PO-T006", "PO_LINES", [
            pk("PO_LINE_ID"), fk("PO_ID"), 
            ("LINE_NUMBER", "NUMBER(10)", "NOT NULL", "", "Line number", "Business"),
            fk("ITEM_ID"), qty("QUANTITY"), amt("UNIT_PRICE"), amt("AMOUNT"),
            date_col("NEED_BY_DATE"),
        ], 10, False, False),
    ],

    "INV": [
        ("INV-T002", "INV_ITEMS", [
            pk("ITEM_ID"), code("ITEM_NUMBER", 100), name_col("ITEM_DESCRIPTION"),
            ("UOM", "VARCHAR2(10)", "NULL", "", "Unit of measure", "Business"),
            ("ITEM_TYPE", "VARCHAR2(30)", "NULL", "", "Item type", "Business"),
            flag("LOT_CONTROL_FLAG"), flag("SERIAL_CONTROL_FLAG"),
            status(),
        ], 5, False, False),
        
        ("INV-T004", "INV_ONHAND_QUANTITIES", [
            pk("ONHAND_ID"), fk("ITEM_ID"), 
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Inventory org", "MultiOrg"),
            ("SUBINVENTORY", "VARCHAR2(30)", "NULL", "", "Subinventory", "Business"),
            fk("LOCATOR_ID", "Locator reference"),
            ("LOT_NUMBER", "VARCHAR2(80)", "NULL", "", "Lot number", "Business"),
            qty("QUANTITY"),
        ], 3, False, False),
        
        ("INV-T005", "INV_TRANSACTIONS", [
            pk("TRANSACTION_ID"), fk("ITEM_ID"),
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Inventory org", "MultiOrg"),
            ("TRANSACTION_TYPE", "VARCHAR2(30)", "NOT NULL", "", "Transaction type", "Business"),
            qty("QUANTITY"), date_col("TRANSACTION_DATE"),
        ], 5, True, False),
    ],

    "OM": [
        ("OM-T005", "OM_ORDERS", [
            pk("ORDER_ID"),
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Operating unit", "MultiOrg"),
            ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit", "MultiOrg"),
            code("ORDER_NUMBER", 50), fk("CUSTOMER_ID"),
            date_col("ORDER_DATE"), code("CURRENCY_CODE", 15),
            amt("TOTAL_AMOUNT"),
            ("APPROVAL_STATUS", "VARCHAR2(30)", "NULL", "APPROVED", "Approval status", "Business"),
            status(),
        ], 10, True, False),
        
        ("OM-T006", "OM_ORDER_LINES", [
            pk("ORDER_LINE_ID"), fk("ORDER_ID"),
            ("LINE_NUMBER", "NUMBER(10)", "NOT NULL", "", "Line number", "Business"),
            fk("ITEM_ID"), qty("QUANTITY"), amt("UNIT_PRICE"), amt("AMOUNT"),
        ], 10, False, False),
    ],

    "CM": [
        ("CM-T003", "CM_ITEM_COSTS", [
            pk("ITEM_COST_ID"), fk("ITEM_ID"),
            ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Inventory org", "MultiOrg"),
            fk("COST_TYPE_ID"), amt("UNIT_COST"),
            date_col("EFFECTIVE_DATE"), status(),
        ], 5, False, True),
    ],

    "LCM": [
        ("LCM-T002", "LCM_SHIPMENTS", [
            pk("SHIPMENT_ID"), code("SHIPMENT_NUMBER", 50), fk("PO_ID", "Purchase order"),
            ("ORIGIN_PORT", "VARCHAR2(100)", "NULL", "", "Origin port", "Business"),
            ("DESTINATION_PORT", "VARCHAR2(100)", "NULL", "", "Destination port", "Business"),
            date_col("SHIPMENT_DATE"), status(),
        ], 5, False, False),
    ],

    "PDM": [
        ("PDM-T001", "PDM_PRODUCTS", [
            pk("PRODUCT_ID"), code("PRODUCT_NUMBER", 100), name_col("PRODUCT_NAME"),
            ("PRODUCT_TYPE", "VARCHAR2(50)", "NULL", "", "Product type", "Business"),
            ("BRAND", "VARCHAR2(100)", "NULL", "", "Brand", "Business"),
            desc_col(), status(),
        ], 10, False, True),
    ],

    "CSH": [
        ("CSH-T001", "CSH_BANK_ACCOUNTS", [
            pk("BANK_ACCOUNT_ID"), code("ACCOUNT_NUMBER", 50), name_col("ACCOUNT_NAME"),
            name_col("BANK_NAME"), code("CURRENCY_CODE", 15),
            ("ACCOUNT_TYPE", "VARCHAR2(30)", "NULL", "", "Account type", "Business"),
            fk("GL_ACCOUNT_ID", "GL account"), status(),
        ], 5, False, False),
        
        ("CSH-T003", "CSH_BANK_STATEMENTS", [
            pk("STATEMENT_ID"), fk("BANK_ACCOUNT_ID"),
            date_col("STATEMENT_DATE"), amt("OPENING_BALANCE"), amt("CLOSING_BALANCE"),
        ], 5, False, False),
    ],

    "FA": [
        ("FA-T003", "FA_ASSETS", [
            pk("ASSET_ID"), code("ASSET_NUMBER", 50), name_col("ASSET_NAME"),
            fk("CATEGORY_ID"), ("SERIAL_NUMBER", "VARCHAR2(100)", "NULL", "", "Serial number", "Business"),
            fk("LOCATION_ID", "Asset location"), date_col("ACQUISITION_DATE"),
            status(),
        ], 10, False, False),
        
        ("FA-T007", "FA_DEPRECIATION_DETAIL", [
            pk("DEPRECIATION_ID"), fk("ASSET_ID"), fk("BOOK_ID"),
            fk("PERIOD_ID"), amt("DEPRECIATION_AMOUNT"),
        ], 5, True, False),
    ],

    "ABS": [
        ("ABS-T001", "ABS_ABSENCE_TYPES", [
            pk("ABSENCE_TYPE_ID"), code("ABSENCE_CODE", 50), name_col("ABSENCE_NAME"),
            flag("PAID_FLAG"), flag("FMLA_QUALIFYING_FLAG"),
            desc_col(), status(),
        ], 5, False, False),
        
        ("ABS-T005", "ABS_ABSENCE_REQUESTS", [
            pk("ABSENCE_REQUEST_ID"), fk("EMPLOYEE_ID"), fk("ABSENCE_TYPE_ID"),
            date_col("START_DATE"), date_col("END_DATE"),
            ("HOURS", "NUMBER(10,2)", "NULL", "", "Hours requested", "Business"),
            ("REASON", "VARCHAR2(1000)", "NULL", "", "Request reason", "Business"),
            ("APPROVAL_STATUS", "VARCHAR2(30)", "NULL", "PENDING", "Approval status", "Business"),
            status(),
        ], 5, False, False),
    ],

    "REC": [
        ("REC-T001", "REC_REQUISITIONS", [
            pk("REQUISITION_ID"), code("REQ_NUMBER", 50), fk("JOB_ID"),
            fk("HIRING_MANAGER_ID", "Hiring manager"), 
            ("OPENINGS", "NUMBER(5)", "NULL", "1", "Number of openings", "Business"),
            date_col("REQUESTED_START_DATE"), status(),
        ], 10, False, False),
        
        ("REC-T005", "REC_CANDIDATES", [
            pk("CANDIDATE_ID"), name_col("FIRST_NAME", 100), name_col("LAST_NAME", 100),
            code("EMAIL", 240), ("PHONE", "VARCHAR2(50)", "NULL", "", "Phone", "Business"),
            ("SOURCE", "VARCHAR2(50)", "NULL", "", "Candidate source", "Business"),
            status(),
        ], 5, False, False),
        
        ("REC-T006", "REC_APPLICATIONS", [
            pk("APPLICATION_ID"), fk("CANDIDATE_ID"), fk("REQUISITION_ID"),
            date_col("APPLICATION_DATE"), 
            ("STAGE", "VARCHAR2(50)", "NULL", "", "Application stage", "Business"),
            status(),
        ], 10, False, False),
    ],
}

def generate_csv(module_id, tables, output_dir="."):
    """Generate CSV for a module"""
    output_file = Path(output_dir) / f"{module_id}_Module_Database_Columns.csv"
    
    with open(output_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Table_ID", "Module_ID", "Table_Name", "Column_Name", 
                        "Data_Type", "Nullable", "Default_Value", "Description",
                        "Column_Category", "Column_Order"])
        
        for table_id, table_name, cols, dff_count, has_concurrent, has_eff_date in tables:
            all_cols = list(cols)
            if has_eff_date:
                all_cols.extend(effective_dating())
            all_cols.extend(dff(dff_count))
            all_cols.extend(WHO_COLUMNS)
            if has_concurrent:
                all_cols.extend(CONCURRENT_COLUMNS)
            
            for i, (cname, dtype, nullable, default, desc, cat) in enumerate(all_cols, 1):
                writer.writerow([table_id, module_id, table_name, cname, dtype, 
                               nullable, default, desc, cat, i])
    
    print(f"✓ {module_id}: {len(tables)} tables, {sum(len(t[2])+len(dff(t[3]))+len(WHO_COLUMNS)+(len(CONCURRENT_COLUMNS) if t[4] else 0)+(len(effective_dating()) if t[5] else 0) for t in tables)} columns")

if __name__ == "__main__":
    output_dir = Path(__file__).parent
    for module_id, tables in MODULES.items():
        generate_csv(module_id, tables, output_dir)
    print("\n✅ All modules generated!")
