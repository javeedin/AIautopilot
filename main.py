#!/usr/bin/env python3
"""
AIautopilot Email Fetcher - Main entry point

This module provides a command-line interface and programmatic API
for fetching emails from various providers.
"""

import argparse
import sys
from datetime import datetime, timedelta
from typing import Optional

from email_fetcher import EmailProviderFactory
from email_fetcher.config import EmailConfig
from email_fetcher.exceptions import EmailFetcherError


def fetch_emails_cli():
    """Command-line interface for email fetching"""
    parser = argparse.ArgumentParser(
        description='AIautopilot Email Fetcher - Fetch emails from multiple providers'
    )

    parser.add_argument(
        '--provider',
        type=str,
        choices=['gmail', 'outlook', 'imap'],
        help='Email provider (default: from config or environment)'
    )

    parser.add_argument(
        '--config',
        type=str,
        help='Path to configuration file (YAML or JSON)'
    )

    parser.add_argument(
        '--folder',
        type=str,
        default='INBOX',
        help='Folder to fetch from (default: INBOX)'
    )

    parser.add_argument(
        '--limit',
        type=int,
        default=10,
        help='Maximum number of emails to fetch (default: 10)'
    )

    parser.add_argument(
        '--unread-only',
        action='store_true',
        help='Fetch only unread emails'
    )

    parser.add_argument(
        '--since-days',
        type=int,
        help='Fetch emails from the last N days'
    )

    parser.add_argument(
        '--list-folders',
        action='store_true',
        help='List all available folders'
    )

    parser.add_argument(
        '--mark-read',
        type=str,
        help='Mark specific email as read (provide email ID)'
    )

    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose output'
    )

    args = parser.parse_args()

    try:
        # Create provider
        if args.config:
            provider = EmailProviderFactory.create_from_config(args.config)
        elif args.provider:
            provider = EmailProviderFactory.create(args.provider)
        else:
            provider = EmailProviderFactory.create_from_env()

        # Authenticate
        if args.verbose:
            print(f"Authenticating with {provider.__class__.__name__}...")

        with provider:
            # List folders
            if args.list_folders:
                folders = provider.list_folders()
                print(f"\nAvailable folders ({len(folders)}):")
                for folder in folders:
                    print(f"  - {folder}")
                return

            # Mark as read
            if args.mark_read:
                success = provider.mark_as_read(args.mark_read)
                if success:
                    print(f"Email {args.mark_read} marked as read")
                else:
                    print(f"Failed to mark email {args.mark_read} as read")
                return

            # Fetch emails
            since = None
            if args.since_days:
                since = datetime.now() - timedelta(days=args.since_days)

            if args.verbose:
                print(f"Fetching emails from {args.folder}...")

            emails = provider.fetch_emails(
                folder=args.folder,
                limit=args.limit,
                since=since,
                unread_only=args.unread_only
            )

            # Display results
            print(f"\nFetched {len(emails)} email(s):\n")
            print("=" * 80)

            for i, email in enumerate(emails, 1):
                print(f"\n[{i}] {email.subject}")
                print(f"    From: {email.sender}")
                print(f"    To: {', '.join(email.recipients[:3])}" +
                      (f" (+{len(email.recipients) - 3} more)" if len(email.recipients) > 3 else ""))
                print(f"    Date: {email.timestamp}")
                print(f"    Read: {'Yes' if email.is_read else 'No'}")

                if email.has_attachments:
                    print(f"    Attachments: {len(email.attachments)}")
                    for att in email.attachments[:3]:
                        print(f"      - {att.filename} ({att.size} bytes)")

                if args.verbose and email.body_text:
                    preview = email.body_text[:200].replace('\n', ' ')
                    print(f"    Preview: {preview}...")

                print("    " + "-" * 76)

    except EmailFetcherError as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nInterrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def fetch_emails_programmatic(
    provider: str = 'imap',
    config_file: Optional[str] = None,
    folder: str = 'INBOX',
    limit: int = 50,
    unread_only: bool = False
):
    """
    Programmatic API for fetching emails.

    Args:
        provider: Email provider name
        config_file: Path to configuration file
        folder: Folder to fetch from
        limit: Maximum number of emails
        unread_only: Fetch only unread emails

    Returns:
        List of Email objects

    Example:
        from main import fetch_emails_programmatic

        emails = fetch_emails_programmatic(
            provider='gmail',
            config_file='config.yaml',
            limit=10
        )

        for email in emails:
            print(f"Subject: {email.subject}")
            print(f"From: {email.sender}")
    """
    try:
        if config_file:
            provider_instance = EmailProviderFactory.create_from_config(config_file)
        else:
            provider_instance = EmailProviderFactory.create(provider)

        with provider_instance:
            emails = provider_instance.fetch_emails(
                folder=folder,
                limit=limit,
                unread_only=unread_only
            )
            return emails

    except EmailFetcherError as e:
        raise
    except Exception as e:
        raise EmailFetcherError(f"Failed to fetch emails: {str(e)}")


if __name__ == '__main__':
    fetch_emails_cli()
