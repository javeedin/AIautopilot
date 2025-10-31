#!/usr/bin/env python3
"""
Generate module-specific database column specifications for Oracle Fusion ERP

This script creates detailed CSV files for each ERP module showing all columns
for all tables following Oracle Fusion standards.

Usage:
    python generate_module_columns.py [module_code]

    Without argument: generates all modules
    With argument: generates only specified module (e.g., AP, HCM, PAY)
"""

import csv
import sys
from pathlib import Path

# Standard WHO columns that appear in EVERY table
WHO_COLUMNS = [
    ("CREATED_BY", "NUMBER(15)", "NOT NULL", "", "User who created the record", "WHO"),
    ("CREATION_DATE", "TIMESTAMP", "NOT NULL", "CURRENT_TIMESTAMP", "Record creation timestamp", "WHO"),
    ("LAST_UPDATED_BY", "NUMBER(15)", "NOT NULL", "", "User who last updated the record", "WHO"),
    ("LAST_UPDATE_DATE", "TIMESTAMP", "NOT NULL", "CURRENT_TIMESTAMP", "Last update timestamp", "WHO"),
    ("LAST_UPDATE_LOGIN", "NUMBER(15)", "NULL", "", "Last update login session", "WHO"),
    ("OBJECT_VERSION_NUMBER", "NUMBER(9)", "NOT NULL", "1", "Optimistic locking version", "WHO"),
]

# Standard concurrent program columns (transactional tables)
CONCURRENT_COLUMNS = [
    ("REQUEST_ID", "NUMBER(15)", "NULL", "", "Concurrent request ID", "WHO"),
    ("PROGRAM_APPLICATION_ID", "NUMBER(15)", "NULL", "", "Program application ID", "WHO"),
    ("PROGRAM_ID", "NUMBER(15)", "NULL", "", "Concurrent program ID", "WHO"),
    ("PROGRAM_UPDATE_DATE", "TIMESTAMP", "NULL", "", "Program update date", "WHO"),
]

# Standard DFF columns (count varies by table type)
def get_dff_columns(count=5):
    """Generate DFF columns (ATTRIBUTE_CATEGORY + ATTRIBUTE1-N)"""
    columns = [("ATTRIBUTE_CATEGORY", "VARCHAR2(30)", "NULL", "", "Descriptive flexfield category", "DFF")]
    for i in range(1, count + 1):
        columns.append((
            f"ATTRIBUTE{i}",
            "VARCHAR2(150)",
            "NULL",
            "",
            f"Descriptive flexfield attribute {i}",
            "DFF"
        ))
    return columns

# Standard effective dating columns
EFFECTIVE_DATING_COLUMNS = [
    ("EFFECTIVE_START_DATE", "DATE", "NULL", "", "Effective start date", "EffectiveDating"),
    ("EFFECTIVE_END_DATE", "DATE", "NULL", "31-DEC-4712", "Effective end date", "EffectiveDating"),
    ("EFFECTIVE_LATEST_CHANGE", "VARCHAR2(1)", "NULL", "Y", "Latest effective record (Y/N)", "EffectiveDating"),
    ("EFFECTIVE_SEQUENCE", "NUMBER(9)", "NULL", "1", "Effective sequence number", "EffectiveDating"),
]

# Module table definitions
# Format: module_id: [(table_id, table_name, columns, has_dff_count, has_concurrent, has_effective_dating)]
MODULE_TABLES = {
    "AP": {
        "module_name": "Accounts Payable",
        "tables": [
            ("AP-T001", "AP_SUPPLIERS", [
                ("SUPPLIER_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("SUPPLIER_NUMBER", "VARCHAR2(50)", "NOT NULL", "", "Unique supplier number", "Business"),
                ("SUPPLIER_NAME", "VARCHAR2(240)", "NOT NULL", "", "Supplier name", "Business"),
                ("TAX_ID", "VARCHAR2(50)", "NULL", "", "Tax identification number", "Business"),
                ("SUPPLIER_TYPE", "VARCHAR2(30)", "NULL", "", "INDIVIDUAL/ORGANIZATION", "Business"),
                ("PAYMENT_TERMS_ID", "NUMBER(15)", "NULL", "", "Default payment terms", "FK"),
                ("PAYMENT_METHOD_CODE", "VARCHAR2(30)", "NULL", "", "Default payment method", "Business"),
                ("CURRENCY_CODE", "VARCHAR2(15)", "NULL", "", "Default currency", "Business"),
                ("STATUS", "VARCHAR2(30)", "NULL", "ACTIVE", "ACTIVE/INACTIVE/HOLD", "Business"),
            ], 5, False, True),

            ("AP-T002", "AP_SUPPLIER_SITES", [
                ("SUPPLIER_SITE_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("SUPPLIER_ID", "NUMBER(15)", "NOT NULL", "", "Supplier reference", "FK"),
                ("SITE_NAME", "VARCHAR2(240)", "NOT NULL", "", "Site name", "Business"),
                ("ADDRESS_ID", "NUMBER(15)", "NULL", "", "Address reference", "FK"),
                ("PAYMENT_TERMS_ID", "NUMBER(15)", "NULL", "", "Payment terms", "FK"),
                ("PAYMENT_METHOD_CODE", "VARCHAR2(30)", "NULL", "", "Payment method", "Business"),
                ("REMIT_TO_SITE_FLAG", "VARCHAR2(1)", "NULL", "N", "Remit to site (Y/N)", "Business"),
                ("PAY_SITE_FLAG", "VARCHAR2(1)", "NULL", "Y", "Pay site (Y/N)", "Business"),
                ("PRIMARY_SITE_FLAG", "VARCHAR2(1)", "NULL", "N", "Primary site (Y/N)", "Business"),
                ("STATUS", "VARCHAR2(30)", "NULL", "ACTIVE", "ACTIVE/INACTIVE", "Business"),
            ], 5, False, True),

            ("AP-T003", "AP_INVOICES", [
                ("INVOICE_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("ORG_ID", "NUMBER(15)", "NOT NULL", "", "Operating unit", "MultiOrg"),
                ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit reference", "MultiOrg"),
                ("LEDGER_ID", "NUMBER(15)", "NOT NULL", "", "Ledger reference", "FK"),
                ("LEGAL_ENTITY_ID", "NUMBER(15)", "NULL", "", "Legal entity", "MultiOrg"),
                ("SUPPLIER_ID", "NUMBER(15)", "NOT NULL", "", "Supplier reference", "FK"),
                ("SUPPLIER_SITE_ID", "NUMBER(15)", "NOT NULL", "", "Supplier site reference", "FK"),
                ("INVOICE_NUMBER", "VARCHAR2(50)", "NOT NULL", "", "Invoice number from supplier", "Business"),
                ("INVOICE_TYPE", "VARCHAR2(30)", "NULL", "STANDARD", "STANDARD/CREDIT/DEBIT/PREPAYMENT", "Business"),
                ("INVOICE_DATE", "DATE", "NOT NULL", "", "Invoice date", "Business"),
                ("GL_DATE", "DATE", "NOT NULL", "", "GL accounting date", "Business"),
                ("DUE_DATE", "DATE", "NULL", "", "Payment due date", "Business"),
                ("INVOICE_CURRENCY_CODE", "VARCHAR2(15)", "NOT NULL", "", "Invoice currency", "Business"),
                ("PAYMENT_CURRENCY_CODE", "VARCHAR2(15)", "NULL", "", "Payment currency", "Business"),
                ("EXCHANGE_RATE", "NUMBER(20,10)", "NULL", "", "Currency exchange rate", "Business"),
                ("EXCHANGE_RATE_TYPE", "VARCHAR2(30)", "NULL", "", "Exchange rate type", "Business"),
                ("EXCHANGE_DATE", "DATE", "NULL", "", "Exchange rate date", "Business"),
                ("INVOICE_AMOUNT", "NUMBER(20,2)", "NOT NULL", "", "Total invoice amount", "Business"),
                ("BASE_AMOUNT", "NUMBER(20,2)", "NULL", "", "Amount in ledger currency", "Business"),
                ("TAX_AMOUNT", "NUMBER(20,2)", "NULL", "0", "Total tax amount", "Business"),
                ("AMOUNT_PAID", "NUMBER(20,2)", "NULL", "0", "Amount paid to date", "Business"),
                ("PAYMENT_STATUS", "VARCHAR2(30)", "NULL", "UNPAID", "UNPAID/PARTIALLY_PAID/FULLY_PAID", "Business"),
                ("APPROVAL_STATUS", "VARCHAR2(30)", "NULL", "NEEDS_APPROVAL", "Approval workflow status", "Business"),
                ("POSTING_STATUS", "VARCHAR2(30)", "NULL", "NOT_POSTED", "NOT_POSTED/POSTED/ERROR", "Business"),
                ("POSTED_FLAG", "VARCHAR2(1)", "NULL", "N", "Posted to GL (Y/N)", "Business"),
                ("POSTED_DATE", "TIMESTAMP", "NULL", "", "GL posting date", "Business"),
                ("APPROVED_BY", "NUMBER(15)", "NULL", "", "User who approved", "Business"),
                ("APPROVED_DATE", "TIMESTAMP", "NULL", "", "Approval timestamp", "Business"),
                ("CANCELLED_DATE", "TIMESTAMP", "NULL", "", "Cancellation date", "Business"),
                ("CANCELLED_BY", "NUMBER(15)", "NULL", "", "User who cancelled", "Business"),
                ("DESCRIPTION", "VARCHAR2(1000)", "NULL", "", "Invoice description", "Business"),
                ("SOURCE", "VARCHAR2(30)", "NULL", "MANUAL", "MANUAL/IMPORT/EDI/OCR", "Business"),
                ("VOUCHER_NUMBER", "VARCHAR2(50)", "NULL", "", "Voucher number", "Business"),
                ("PAYMENT_METHOD_CODE", "VARCHAR2(30)", "NULL", "", "Payment method", "Business"),
                ("EXTERNAL_REFERENCE", "VARCHAR2(240)", "NULL", "", "External system reference", "Business"),
            ], 10, True, False),
        ]
    },

    "HCM": {
        "module_name": "Human Capital Management",
        "tables": [
            ("HCM-T001", "HCM_EMPLOYEES", [
                ("EMPLOYEE_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit reference", "MultiOrg"),
                ("LEGAL_ENTITY_ID", "NUMBER(15)", "NOT NULL", "", "Legal entity", "MultiOrg"),
                ("EMPLOYEE_NUMBER", "VARCHAR2(50)", "NOT NULL", "", "Unique employee number", "Business"),
                ("PERSON_ID", "NUMBER(15)", "NOT NULL", "", "Person reference", "FK"),
                ("FIRST_NAME", "VARCHAR2(100)", "NOT NULL", "", "First name", "Business"),
                ("LAST_NAME", "VARCHAR2(100)", "NOT NULL", "", "Last name", "Business"),
                ("MIDDLE_NAME", "VARCHAR2(100)", "NULL", "", "Middle name", "Business"),
                ("FULL_NAME", "VARCHAR2(240)", "NULL", "", "Concatenated full name", "Business"),
                ("HIRE_DATE", "DATE", "NOT NULL", "", "Hire date", "Business"),
                ("TERMINATION_DATE", "DATE", "NULL", "", "Termination date", "Business"),
                ("EMPLOYEE_STATUS", "VARCHAR2(30)", "NULL", "ACTIVE", "ACTIVE/TERMINATED/LOA/SUSPENDED", "Business"),
                ("EMPLOYMENT_TYPE", "VARCHAR2(30)", "NULL", "", "FULL_TIME/PART_TIME/CONTRACT/INTERN", "Business"),
                ("WORK_EMAIL", "VARCHAR2(240)", "NULL", "", "Work email address", "Business"),
                ("WORK_PHONE", "VARCHAR2(50)", "NULL", "", "Work phone number", "Business"),
                ("MANAGER_ID", "NUMBER(15)", "NULL", "", "Manager employee reference", "FK"),
                ("USER_ID", "NUMBER(15)", "NULL", "", "System user reference", "FK"),
            ], 5, False, True),

            ("HCM-T005", "HCM_ORGANIZATIONS", [
                ("ORGANIZATION_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("ORG_CODE", "VARCHAR2(50)", "NOT NULL", "", "Unique org code", "Business"),
                ("ORG_NAME", "VARCHAR2(240)", "NOT NULL", "", "Organization name", "Business"),
                ("PARENT_ORG_ID", "NUMBER(15)", "NULL", "", "Parent organization", "FK"),
                ("ORG_TYPE", "VARCHAR2(30)", "NULL", "", "Organization type", "Business"),
                ("ORG_LEVEL", "NUMBER(3)", "NULL", "", "Level in hierarchy", "Business"),
                ("MANAGER_ID", "NUMBER(15)", "NULL", "", "Organization manager", "FK"),
                ("STATUS", "VARCHAR2(30)", "NULL", "ACTIVE", "ACTIVE/INACTIVE", "Business"),
            ], 5, False, True),
        ]
    },

    "PAY": {
        "module_name": "Payroll",
        "tables": [
            ("PAY-T010", "PAY_PAYROLL_RUNS", [
                ("PAYROLL_RUN_ID", "NUMBER(15)", "NOT NULL", "", "Primary key", "PK"),
                ("BU_ID", "NUMBER(15)", "NOT NULL", "", "Business unit reference", "MultiOrg"),
                ("LEGAL_ENTITY_ID", "NUMBER(15)", "NOT NULL", "", "Legal entity", "MultiOrg"),
                ("PAYROLL_ID", "NUMBER(15)", "NOT NULL", "", "Payroll setup reference", "FK"),
                ("RUN_NUMBER", "VARCHAR2(50)", "NOT NULL", "", "Unique run number", "Business"),
                ("PAY_PERIOD_START", "DATE", "NOT NULL", "", "Pay period start date", "Business"),
                ("PAY_PERIOD_END", "DATE", "NOT NULL", "", "Pay period end date", "Business"),
                ("PAY_DATE", "DATE", "NOT NULL", "", "Payment date", "Business"),
                ("GL_DATE", "DATE", "NOT NULL", "", "GL posting date", "Business"),
                ("RUN_TYPE", "VARCHAR2(30)", "NULL", "REGULAR", "REGULAR/SUPPLEMENTAL/ADJUSTMENT/FINAL", "Business"),
                ("RUN_STATUS", "VARCHAR2(30)", "NULL", "IN_PROGRESS", "IN_PROGRESS/CALCULATED/VALIDATED/POSTED/PAID", "Business"),
                ("POSTING_STATUS", "VARCHAR2(30)", "NULL", "NOT_POSTED", "NOT_POSTED/POSTING/POSTED/ERROR", "Business"),
                ("POSTED_DATE", "TIMESTAMP", "NULL", "", "GL posting timestamp", "Business"),
                ("EMPLOYEE_COUNT", "NUMBER(10)", "NULL", "0", "Number of employees processed", "Business"),
                ("TOTAL_GROSS", "NUMBER(20,2)", "NULL", "0", "Total gross pay", "Business"),
                ("TOTAL_NET", "NUMBER(20,2)", "NULL", "0", "Total net pay", "Business"),
                ("TOTAL_DEDUCTIONS", "NUMBER(20,2)", "NULL", "0", "Total deductions", "Business"),
                ("TOTAL_TAXES", "NUMBER(20,2)", "NULL", "0", "Total taxes withheld", "Business"),
                ("APPROVED_FLAG", "VARCHAR2(1)", "NULL", "N", "Payroll approved (Y/N)", "Business"),
                ("APPROVED_DATE", "TIMESTAMP", "NULL", "", "Approval timestamp", "Business"),
                ("APPROVED_BY", "NUMBER(15)", "NULL", "", "User who approved", "Business"),
            ], 5, True, False),
        ]
    },
}

def generate_module_csv(module_id, output_dir="."):
    """Generate column specification CSV for a specific module"""

    if module_id not in MODULE_TABLES:
        print(f"Error: Module {module_id} not found")
        return False

    module_data = MODULE_TABLES[module_id]
    output_file = Path(output_dir) / f"{module_id}_Module_Database_Columns.csv"

    with open(output_file, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)

        # Write header
        writer.writerow([
            "Table_ID", "Module_ID", "Table_Name", "Column_Name",
            "Data_Type", "Nullable", "Default_Value", "Description",
            "Column_Category", "Column_Order"
        ])

        # Process each table
        for table_def in module_data["tables"]:
            table_id, table_name, columns, dff_count, has_concurrent, has_effective_dating = table_def

            col_order = 1
            all_columns = []

            # Add business columns
            all_columns.extend(columns)

            # Add effective dating if applicable
            if has_effective_dating:
                all_columns.extend(EFFECTIVE_DATING_COLUMNS)

            # Add DFF columns
            all_columns.extend(get_dff_columns(dff_count))

            # Add WHO columns
            all_columns.extend(WHO_COLUMNS)

            # Add concurrent program columns if applicable
            if has_concurrent:
                all_columns.extend(CONCURRENT_COLUMNS)

            # Write all columns
            for col_name, data_type, nullable, default, description, category in all_columns:
                writer.writerow([
                    table_id,
                    module_id,
                    table_name,
                    col_name,
                    data_type,
                    nullable,
                    default,
                    description,
                    category,
                    col_order
                ])
                col_order += 1

    print(f"Generated: {output_file} ({col_order - 1} total columns across {len(module_data['tables'])} tables)")
    return True

def generate_all_modules(output_dir="."):
    """Generate CSVs for all modules"""
    for module_id in MODULE_TABLES.keys():
        generate_module_csv(module_id, output_dir)

if __name__ == "__main__":
    output_directory = Path(__file__).parent

    if len(sys.argv) > 1:
        # Generate specific module
        module_code = sys.argv[1].upper()
        generate_module_csv(module_code, output_directory)
    else:
        # Generate all modules
        print("Generating all module column specifications...")
        generate_all_modules(output_directory)
        print("\nDone! Generated column specifications for all modules.")
