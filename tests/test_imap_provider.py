"""Tests for IMAP provider"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from datetime import datetime

from email_fetcher.providers import IMAPProvider
from email_fetcher.exceptions import (
    AuthenticationError,
    ConnectionError,
    ConfigurationError
)


class TestIMAPProvider:
    """Test IMAPProvider class"""

    def test_init_with_valid_config(self):
        """Test initialization with valid configuration"""
        config = {
            'host': 'imap.example.com',
            'username': 'test@example.com',
            'password': 'password123'
        }

        provider = IMAPProvider(config)
        assert provider.config == config
        assert provider.is_authenticated() is False

    def test_init_missing_required_fields(self):
        """Test initialization with missing required fields"""
        config = {
            'host': 'imap.example.com'
            # Missing username and password
        }

        with pytest.raises(ConfigurationError):
            IMAPProvider(config)

    @patch('email_fetcher.providers.imap_provider.imaplib.IMAP4_SSL')
    def test_authenticate_success(self, mock_imap):
        """Test successful authentication"""
        config = {
            'host': 'imap.example.com',
            'username': 'test@example.com',
            'password': 'password123',
            'use_ssl': True
        }

        mock_connection = Mock()
        mock_imap.return_value = mock_connection

        provider = IMAPProvider(config)
        result = provider.authenticate()

        assert result is True
        assert provider.is_authenticated() is True
        mock_connection.login.assert_called_once_with('test@example.com', 'password123')

    @patch('email_fetcher.providers.imap_provider.imaplib.IMAP4_SSL')
    def test_authenticate_failure(self, mock_imap):
        """Test authentication failure"""
        config = {
            'host': 'imap.example.com',
            'username': 'test@example.com',
            'password': 'wrong_password',
            'use_ssl': True
        }

        mock_connection = Mock()
        mock_connection.login.side_effect = Exception("Authentication failed")
        mock_imap.return_value = mock_connection

        provider = IMAPProvider(config)

        with pytest.raises(AuthenticationError):
            provider.authenticate()

    def test_context_manager(self):
        """Test using provider as context manager"""
        config = {
            'host': 'imap.example.com',
            'username': 'test@example.com',
            'password': 'password123'
        }

        provider = IMAPProvider(config)

        with patch.object(provider, 'authenticate') as mock_auth:
            with patch.object(provider, 'disconnect') as mock_disconnect:
                with provider:
                    pass

                mock_auth.assert_called_once()
                mock_disconnect.assert_called_once()
