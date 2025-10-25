#!/usr/bin/env python3
"""
Example: Fetching emails from Gmail using OAuth authentication
"""

from email_fetcher import EmailProviderFactory

# Create Gmail provider with credentials
provider = EmailProviderFactory.create('gmail', {
    'credentials_file': 'credentials.json',
    'token_file': 'token.json'
})

# Authenticate and fetch emails
with provider:
    # Fetch last 10 unread emails
    emails = provider.fetch_emails(
        folder='INBOX',
        limit=10,
        unread_only=True
    )

    print(f"Fetched {len(emails)} unread emails:\n")

    for email in emails:
        print(f"Subject: {email.subject}")
        print(f"From: {email.sender}")
        print(f"Date: {email.timestamp}")
        print(f"Preview: {email.body[:100]}...")
        print("-" * 80)

        # Mark as read
        # provider.mark_as_read(email.id)
