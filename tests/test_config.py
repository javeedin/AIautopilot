"""Tests for configuration management"""

import pytest
import os
import tempfile
import json
import yaml

from email_fetcher.config import EmailConfig
from email_fetcher.exceptions import ConfigurationError


class TestEmailConfig:
    """Test EmailConfig class"""

    def test_load_from_yaml(self):
        """Test loading configuration from YAML file"""
        config_data = {
            'provider': 'imap',
            'imap': {
                'host': 'imap.example.com',
                'username': 'test@example.com',
                'password': 'password123'
            }
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(config_data, f)
            config_file = f.name

        try:
            config = EmailConfig(config_file)
            assert config.get_provider_name() == 'imap'
            imap_config = config.get_provider_config('imap')
            assert imap_config['host'] == 'imap.example.com'
            assert imap_config['username'] == 'test@example.com'
        finally:
            os.unlink(config_file)

    def test_load_from_json(self):
        """Test loading configuration from JSON file"""
        config_data = {
            'provider': 'gmail',
            'gmail': {
                'credentials_file': 'credentials.json',
                'token_file': 'token.json'
            }
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(config_data, f)
            config_file = f.name

        try:
            config = EmailConfig(config_file)
            assert config.get_provider_name() == 'gmail'
            gmail_config = config.get_provider_config('gmail')
            assert gmail_config['credentials_file'] == 'credentials.json'
        finally:
            os.unlink(config_file)

    def test_invalid_config_file(self):
        """Test loading non-existent config file"""
        with pytest.raises(ConfigurationError):
            EmailConfig('nonexistent.yaml')

    def test_unsupported_format(self):
        """Test loading unsupported file format"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write("invalid")
            config_file = f.name

        try:
            with pytest.raises(ConfigurationError):
                EmailConfig(config_file)
        finally:
            os.unlink(config_file)

    def test_get_provider_config(self):
        """Test getting provider-specific configuration"""
        config_data = {
            'provider': 'imap',
            'imap': {
                'host': 'imap.example.com'
            },
            'gmail': {
                'credentials_file': 'creds.json'
            }
        }

        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(config_data, f)
            config_file = f.name

        try:
            config = EmailConfig(config_file)

            # Default provider
            default_config = config.get_provider_config()
            assert default_config['host'] == 'imap.example.com'

            # Specific provider
            gmail_config = config.get_provider_config('gmail')
            assert gmail_config['credentials_file'] == 'creds.json'
        finally:
            os.unlink(config_file)

    def test_invalid_provider(self):
        """Test getting config for invalid provider"""
        config_data = {'provider': 'imap'}

        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as f:
            yaml.dump(config_data, f)
            config_file = f.name

        try:
            config = EmailConfig(config_file)
            with pytest.raises(ConfigurationError):
                config.get_provider_config('invalid')
        finally:
            os.unlink(config_file)

    def test_load_from_env(self):
        """Test loading configuration from environment variables"""
        os.environ['EMAIL_PROVIDER'] = 'imap'
        os.environ['IMAP_HOST'] = 'imap.test.com'
        os.environ['IMAP_USERNAME'] = 'user@test.com'
        os.environ['IMAP_PASSWORD'] = 'pass123'

        try:
            config = EmailConfig()
            assert config.get_provider_name() == 'imap'
            imap_config = config.get_provider_config('imap')
            assert imap_config['host'] == 'imap.test.com'
            assert imap_config['username'] == 'user@test.com'
        finally:
            for key in ['EMAIL_PROVIDER', 'IMAP_HOST', 'IMAP_USERNAME', 'IMAP_PASSWORD']:
                os.environ.pop(key, None)
