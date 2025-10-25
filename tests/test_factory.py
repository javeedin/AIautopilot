"""Tests for EmailProviderFactory"""

import pytest
import tempfile
import yaml

from email_fetcher.factory import EmailProviderFactory
from email_fetcher.providers import GmailProvider, OutlookProvider, IMAPProvider
from email_fetcher.exceptions import ConfigurationError


class TestEmailProviderFactory:
    """Test EmailProviderFactory class"""

    def test_create_gmail_provider(self):
        """Test creating Gmail provider"""
        config = {
            'credentials_file': 'test_credentials.json'
        }

        provider = EmailProviderFactory.create('gmail', config)
        assert isinstance(provider, GmailProvider)

    def test_create_outlook_provider(self):
        """Test creating Outlook provider"""
        config = {
            'client_id': 'test-client-id',
            'tenant_id': 'test-tenant-id'
        }

        provider = EmailProviderFactory.create('outlook', config)
        assert isinstance(provider, OutlookProvider)

    def test_create_imap_provider(self):
        """Test creating IMAP provider"""
        config = {
            'host': 'imap.example.com',
            'username': 'test@example.com',
            'password': 'password'
        }

        provider = EmailProviderFactory.create('imap', config)
        assert isinstance(provider, IMAPProvider)

    def test_create_with_alias(self):
        """Test creating provider with alias names"""
        config = {
            'client_id': 'test-client-id',
            'tenant_id': 'test-tenant-id'
        }

        # Test aliases
        provider1 = EmailProviderFactory.create('microsoft', config)
        assert isinstance(provider1, OutlookProvider)

        provider2 = EmailProviderFactory.create('office365', config)
        assert isinstance(provider2, OutlookProvider)

        provider3 = EmailProviderFactory.create('google', {'credentials_file': 'test.json'})
        assert isinstance(provider3, GmailProvider)

    def test_invalid_provider(self):
        """Test creating provider with invalid name"""
        with pytest.raises(ConfigurationError):
            EmailProviderFactory.create('invalid', {})

    def test_create_from_config_file(self):
        """Test creating provider from config file"""
        config_data = {
            'provider': 'imap',
            'imap': {
                'host': 'imap.example.com',
                'username': 'test@example.com',
                'password': 'password'
            }
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(config_data, f)
            config_file = f.name

        try:
            provider = EmailProviderFactory.create_from_config(config_file)
            assert isinstance(provider, IMAPProvider)
        finally:
            import os
            os.unlink(config_file)

    def test_list_providers(self):
        """Test listing supported providers"""
        providers = EmailProviderFactory.list_providers()

        assert 'gmail' in providers
        assert 'outlook' in providers
        assert 'imap' in providers
        assert 'google' in providers
        assert 'microsoft' in providers
        assert 'office365' in providers
