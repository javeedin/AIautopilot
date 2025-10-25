"""
AIautopilot Email Fetcher

A comprehensive email fetching integration system supporting multiple providers.
"""

from .models import Email, EmailAttachment
from .base import EmailProvider
from .factory import EmailProviderFactory
from .exceptions import (
    EmailFetcherError,
    AuthenticationError,
    ConnectionError,
    ConfigurationError
)

__version__ = "1.0.0"
__all__ = [
    "Email",
    "EmailAttachment",
    "EmailProvider",
    "EmailProviderFactory",
    "EmailFetcherError",
    "AuthenticationError",
    "ConnectionError",
    "ConfigurationError"
]
