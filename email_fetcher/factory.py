"""
Factory for creating email provider instances
"""

from typing import Dict, Any, Optional

from .base import EmailProvider
from .providers import GmailProvider, OutlookProvider, IMAPProvider
from .config import EmailConfig
from .exceptions import ConfigurationError


class EmailProviderFactory:
    """
    Factory class for creating email provider instances.

    Supports Gmail, Outlook, and generic IMAP providers.
    """

    PROVIDERS = {
        'gmail': GmailProvider,
        'outlook': OutlookProvider,
        'imap': IMAPProvider,
        'google': GmailProvider,  # Alias
        'microsoft': OutlookProvider,  # Alias
        'office365': OutlookProvider,  # Alias
        'generic': IMAPProvider,  # Alias
    }

    @classmethod
    def create(
        cls,
        provider: str,
        config: Optional[Dict[str, Any]] = None,
        config_file: Optional[str] = None
    ) -> EmailProvider:
        """
        Create an email provider instance.

        Args:
            provider: Provider name ('gmail', 'outlook', 'imap')
            config: Provider configuration dictionary (optional)
            config_file: Path to configuration file (optional)

        Returns:
            EmailProvider instance

        Raises:
            ConfigurationError: If provider is invalid or config is missing

        Examples:
            # Create with explicit config
            provider = EmailProviderFactory.create('gmail', {
                'credentials_file': 'credentials.json'
            })

            # Create from config file
            provider = EmailProviderFactory.create('imap',
                config_file='email_config.yaml')

            # Create using environment variables
            provider = EmailProviderFactory.create('imap')
        """
        provider = provider.lower()

        if provider not in cls.PROVIDERS:
            raise ConfigurationError(
                f"Unknown provider: {provider}. "
                f"Supported providers: {', '.join(set(cls.PROVIDERS.keys()))}"
            )

        # Load configuration if not provided
        if config is None:
            email_config = EmailConfig(config_file)
            config = email_config.get_provider_config(provider)

        # Get provider class and create instance
        provider_class = cls.PROVIDERS[provider]
        return provider_class(config)

    @classmethod
    def create_from_config(cls, config_file: str) -> EmailProvider:
        """
        Create email provider from configuration file.
        Uses the default provider specified in the config.

        Args:
            config_file: Path to configuration file

        Returns:
            EmailProvider instance
        """
        email_config = EmailConfig(config_file)
        provider_name = email_config.get_provider_name()
        provider_config = email_config.get_provider_config(provider_name)

        return cls.create(provider_name, provider_config)

    @classmethod
    def create_from_env(cls) -> EmailProvider:
        """
        Create email provider from environment variables.

        Returns:
            EmailProvider instance

        Raises:
            ConfigurationError: If required environment variables are missing
        """
        email_config = EmailConfig()
        provider_name = email_config.get_provider_name()
        provider_config = email_config.get_provider_config(provider_name)

        return cls.create(provider_name, provider_config)

    @classmethod
    def list_providers(cls) -> list:
        """Get list of supported providers"""
        return list(set(cls.PROVIDERS.keys()))
