#!/usr/bin/env python3
"""
Example: Using configuration file to fetch emails
"""

from email_fetcher import EmailProviderFactory
from email_fetcher.config import EmailConfig

# Method 1: Create provider directly from config file
provider = EmailProviderFactory.create_from_config('config/email_config.yaml')

with provider:
    emails = provider.fetch_emails(limit=5)

    print(f"Fetched {len(emails)} emails:\n")
    for email in emails:
        print(f"- {email.subject}")


# Method 2: Load config separately for more control
config = EmailConfig('config/email_config.yaml')
provider_name = config.get_provider_name()
provider_config = config.get_provider_config()

print(f"\nUsing provider: {provider_name}")

provider = EmailProviderFactory.create(provider_name, provider_config)

with provider:
    folders = provider.list_folders()
    print(f"\nAvailable folders: {folders}")
