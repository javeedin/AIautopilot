#!/usr/bin/env python3
"""
Example: Fetching emails from any IMAP server
"""

from datetime import datetime, timedelta
from email_fetcher import EmailProviderFactory

# Create IMAP provider
provider = EmailProviderFactory.create('imap', {
    'host': 'imap.example.com',
    'port': 993,
    'username': 'your-email@example.com',
    'password': 'your-password',
    'use_ssl': True
})

# Authenticate and fetch emails
with provider:
    # Fetch emails from the last 7 days
    since = datetime.now() - timedelta(days=7)

    emails = provider.fetch_emails(
        folder='INBOX',
        limit=20,
        since=since,
        unread_only=False
    )

    print(f"Fetched {len(emails)} emails from the last 7 days:\n")

    for email in emails:
        print(f"[{'READ' if email.is_read else 'UNREAD'}] {email.subject}")
        print(f"From: {email.sender}")
        print(f"Date: {email.timestamp}")

        if email.body_text:
            preview = email.body_text[:150].replace('\n', ' ')
            print(f"Preview: {preview}...")

        print("-" * 80)

    # Get a specific email and mark as read
    if emails:
        specific_email = provider.get_email(emails[0].id)
        print(f"\nFull email body:\n{specific_email.body}")

        # Mark as read
        provider.mark_as_read(specific_email.id)
        print(f"\nMarked email as read: {specific_email.id}")
