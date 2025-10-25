"""
Configuration management for email fetcher
"""

import os
import json
import yaml
from typing import Dict, Any, Optional
from pathlib import Path

from .exceptions import ConfigurationError


class EmailConfig:
    """Email configuration manager"""

    def __init__(self, config_file: Optional[str] = None):
        """
        Initialize configuration manager.

        Args:
            config_file: Path to configuration file (JSON or YAML)
                        If not provided, will look for environment variables
        """
        self.config_file = config_file
        self.config = {}

        if config_file:
            self.load_from_file(config_file)
        else:
            self.load_from_env()

    def load_from_file(self, config_file: str) -> None:
        """Load configuration from file"""
        if not os.path.exists(config_file):
            raise ConfigurationError(f"Config file not found: {config_file}")

        file_path = Path(config_file)
        suffix = file_path.suffix.lower()

        try:
            with open(config_file, 'r') as f:
                if suffix in ['.yaml', '.yml']:
                    self.config = yaml.safe_load(f)
                elif suffix == '.json':
                    self.config = json.load(f)
                else:
                    raise ConfigurationError(
                        f"Unsupported config file format: {suffix}. "
                        "Use .yaml, .yml, or .json"
                    )
        except Exception as e:
            raise ConfigurationError(f"Failed to load config file: {str(e)}")

    def load_from_env(self) -> None:
        """Load configuration from environment variables"""
        self.config = {
            'provider': os.getenv('EMAIL_PROVIDER', 'imap'),
            'gmail': {
                'credentials_file': os.getenv('GMAIL_CREDENTIALS_FILE'),
                'token_file': os.getenv('GMAIL_TOKEN_FILE', 'token.json'),
            },
            'outlook': {
                'client_id': os.getenv('OUTLOOK_CLIENT_ID'),
                'client_secret': os.getenv('OUTLOOK_CLIENT_SECRET'),
                'tenant_id': os.getenv('OUTLOOK_TENANT_ID'),
                'auth_type': os.getenv('OUTLOOK_AUTH_TYPE', 'delegated'),
            },
            'imap': {
                'host': os.getenv('IMAP_HOST'),
                'port': int(os.getenv('IMAP_PORT', '993')),
                'username': os.getenv('IMAP_USERNAME'),
                'password': os.getenv('IMAP_PASSWORD'),
                'use_ssl': os.getenv('IMAP_USE_SSL', 'true').lower() == 'true',
            },
            'fetch_options': {
                'default_folder': os.getenv('EMAIL_DEFAULT_FOLDER', 'INBOX'),
                'default_limit': int(os.getenv('EMAIL_DEFAULT_LIMIT', '50')),
                'unread_only': os.getenv('EMAIL_UNREAD_ONLY', 'false').lower() == 'true',
            }
        }

    def get_provider_config(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Get configuration for a specific provider.

        Args:
            provider: Provider name ('gmail', 'outlook', 'imap')
                     If not provided, uses the default provider from config

        Returns:
            Provider configuration dictionary
        """
        if not provider:
            provider = self.config.get('provider', 'imap')

        provider = provider.lower()

        if provider not in ['gmail', 'outlook', 'imap']:
            raise ConfigurationError(
                f"Invalid provider: {provider}. "
                "Supported providers: gmail, outlook, imap"
            )

        if provider not in self.config:
            raise ConfigurationError(
                f"No configuration found for provider: {provider}"
            )

        return self.config[provider]

    def get_fetch_options(self) -> Dict[str, Any]:
        """Get default fetch options"""
        return self.config.get('fetch_options', {
            'default_folder': 'INBOX',
            'default_limit': 50,
            'unread_only': False
        })

    def get_provider_name(self) -> str:
        """Get the default provider name"""
        return self.config.get('provider', 'imap')

    def validate_provider_config(self, provider: str) -> bool:
        """
        Validate that required configuration exists for a provider.

        Args:
            provider: Provider name to validate

        Returns:
            True if configuration is valid

        Raises:
            ConfigurationError: If configuration is invalid or missing
        """
        config = self.get_provider_config(provider)

        if provider == 'gmail':
            if not config.get('credentials_file'):
                raise ConfigurationError(
                    "Gmail provider requires 'credentials_file' in configuration"
                )

        elif provider == 'outlook':
            required = ['client_id', 'tenant_id']
            for field in required:
                if not config.get(field):
                    raise ConfigurationError(
                        f"Outlook provider requires '{field}' in configuration"
                    )

        elif provider == 'imap':
            required = ['host', 'username', 'password']
            for field in required:
                if not config.get(field):
                    raise ConfigurationError(
                        f"IMAP provider requires '{field}' in configuration"
                    )

        return True

    def to_dict(self) -> Dict[str, Any]:
        """Get full configuration as dictionary"""
        return self.config.copy()

    def __repr__(self) -> str:
        provider = self.get_provider_name()
        return f"EmailConfig(provider='{provider}', config_file='{self.config_file}')"
