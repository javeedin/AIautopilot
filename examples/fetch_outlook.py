#!/usr/bin/env python3
"""
Example: Fetching emails from Microsoft 365/Outlook using Microsoft Graph API
"""

from email_fetcher import EmailProviderFactory

# Create Outlook provider with Azure AD credentials
provider = EmailProviderFactory.create('outlook', {
    'client_id': 'your-client-id',
    'client_secret': 'your-client-secret',
    'tenant_id': 'your-tenant-id',
    'auth_type': 'delegated'
})

# Authenticate and fetch emails
with provider:
    # List all folders
    folders = provider.list_folders()
    print(f"Available folders: {folders}\n")

    # Fetch last 5 emails
    emails = provider.fetch_emails(
        folder='INBOX',
        limit=5
    )

    print(f"Fetched {len(emails)} emails:\n")

    for email in emails:
        print(f"Subject: {email.subject}")
        print(f"From: {email.sender}")
        print(f"To: {', '.join(email.recipients)}")
        print(f"Date: {email.timestamp}")
        print(f"Read: {email.is_read}")

        if email.has_attachments:
            print(f"Attachments: {len(email.attachments)}")
            for att in email.attachments:
                print(f"  - {att.filename} ({att.size} bytes)")

        print("-" * 80)
