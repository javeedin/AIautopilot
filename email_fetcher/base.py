"""
Base email provider interface
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
from .models import Email


class EmailProvider(ABC):
    """
    Abstract base class for email providers.
    All email provider implementations must inherit from this class.
    """

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize the email provider with configuration.

        Args:
            config: Provider-specific configuration dictionary
        """
        self.config = config
        self._authenticated = False

    @abstractmethod
    def authenticate(self) -> bool:
        """
        Authenticate with the email provider.

        Returns:
            bool: True if authentication successful

        Raises:
            AuthenticationError: If authentication fails
        """
        pass

    @abstractmethod
    def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: Optional[int] = None,
        since: Optional[datetime] = None,
        unread_only: bool = False
    ) -> List[Email]:
        """
        Fetch emails from the provider.

        Args:
            folder: Folder/mailbox to fetch from (default: INBOX)
            limit: Maximum number of emails to fetch
            since: Only fetch emails after this datetime
            unread_only: Only fetch unread emails

        Returns:
            List of Email objects

        Raises:
            ConnectionError: If connection fails
            EmailFetcherError: For other fetch errors
        """
        pass

    @abstractmethod
    def get_email(self, email_id: str) -> Email:
        """
        Get a specific email by ID.

        Args:
            email_id: Unique identifier for the email

        Returns:
            Email object

        Raises:
            EmailNotFoundError: If email not found
        """
        pass

    @abstractmethod
    def mark_as_read(self, email_id: str) -> bool:
        """
        Mark an email as read.

        Args:
            email_id: Unique identifier for the email

        Returns:
            bool: True if successful
        """
        pass

    @abstractmethod
    def mark_as_unread(self, email_id: str) -> bool:
        """
        Mark an email as unread.

        Args:
            email_id: Unique identifier for the email

        Returns:
            bool: True if successful
        """
        pass

    @abstractmethod
    def list_folders(self) -> List[str]:
        """
        List all available folders/mailboxes.

        Returns:
            List of folder names
        """
        pass

    @abstractmethod
    def disconnect(self) -> None:
        """
        Disconnect from the email provider and cleanup resources.
        """
        pass

    def is_authenticated(self) -> bool:
        """
        Check if provider is authenticated.

        Returns:
            bool: True if authenticated
        """
        return self._authenticated

    def __enter__(self):
        """Context manager entry"""
        self.authenticate()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.disconnect()
