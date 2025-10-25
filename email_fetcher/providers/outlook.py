"""
Microsoft 365/Outlook email provider implementation using Microsoft Graph API
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import json

from msal import ConfidentialClientApplication, PublicClientApplication
import requests

from ..base import EmailProvider
from ..models import Email, EmailAttachment, EmailPriority
from ..exceptions import (
    AuthenticationError,
    ConnectionError,
    EmailNotFoundError,
    RateLimitError,
    ConfigurationError
)


class OutlookProvider(EmailProvider):
    """Microsoft 365/Outlook provider using Microsoft Graph API"""

    GRAPH_API_ENDPOINT = "https://graph.microsoft.com/v1.0"
    SCOPES = ["https://graph.microsoft.com/Mail.Read",
              "https://graph.microsoft.com/Mail.ReadWrite"]

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Outlook provider.

        Args:
            config: Configuration dictionary with:
                - client_id: Azure AD application client ID
                - client_secret: Client secret (for confidential client)
                - tenant_id: Azure AD tenant ID
                - username: User email (for delegated access)
                - auth_type: 'delegated' or 'application' (default: delegated)
        """
        super().__init__(config)
        self.access_token = None
        self.app = None
        self._validate_config()

    def _validate_config(self) -> None:
        """Validate required configuration"""
        required_fields = ['client_id', 'tenant_id']
        for field in required_fields:
            if field not in self.config:
                raise ConfigurationError(
                    f"Outlook provider requires '{field}' in config"
                )

        auth_type = self.config.get('auth_type', 'delegated')
        if auth_type not in ['delegated', 'application']:
            raise ConfigurationError(
                f"Invalid auth_type: {auth_type}. Must be 'delegated' or 'application'"
            )

    def authenticate(self) -> bool:
        """Authenticate with Microsoft Graph API"""
        try:
            auth_type = self.config.get('auth_type', 'delegated')

            if auth_type == 'application':
                # Application (daemon) authentication
                self.app = ConfidentialClientApplication(
                    client_id=self.config['client_id'],
                    client_credential=self.config.get('client_secret'),
                    authority=f"https://login.microsoftonline.com/{self.config['tenant_id']}"
                )

                result = self.app.acquire_token_for_client(
                    scopes=["https://graph.microsoft.com/.default"]
                )
            else:
                # Delegated (user) authentication
                self.app = PublicClientApplication(
                    client_id=self.config['client_id'],
                    authority=f"https://login.microsoftonline.com/{self.config['tenant_id']}"
                )

                # Try to get token from cache
                accounts = self.app.get_accounts()
                if accounts:
                    result = self.app.acquire_token_silent(self.SCOPES, account=accounts[0])
                else:
                    result = None

                # If no cached token, use interactive flow
                if not result:
                    result = self.app.acquire_token_interactive(scopes=self.SCOPES)

            if "access_token" in result:
                self.access_token = result["access_token"]
                self._authenticated = True
                return True
            else:
                error = result.get("error_description", result.get("error", "Unknown error"))
                raise AuthenticationError(f"Outlook authentication failed: {error}")

        except Exception as e:
            raise AuthenticationError(f"Outlook authentication failed: {str(e)}")

    def _make_request(self, endpoint: str, method: str = "GET", params: Dict = None) -> Dict:
        """Make authenticated request to Microsoft Graph API"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

        url = f"{self.GRAPH_API_ENDPOINT}{endpoint}"

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=params)
            elif method == "PATCH":
                response = requests.patch(url, headers=headers, json=params)
            else:
                response = requests.request(method, url, headers=headers, json=params)

            if response.status_code == 429:
                raise RateLimitError("Microsoft Graph API rate limit exceeded")

            response.raise_for_status()
            return response.json() if response.content else {}

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                raise EmailNotFoundError("Resource not found")
            raise ConnectionError(f"Graph API request failed: {str(e)}")
        except Exception as e:
            raise ConnectionError(f"Request failed: {str(e)}")

    def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: Optional[int] = None,
        since: Optional[datetime] = None,
        unread_only: bool = False
    ) -> List[Email]:
        """Fetch emails from Outlook"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        # Build filter query
        filters = []
        if unread_only:
            filters.append("isRead eq false")
        if since:
            date_str = since.strftime("%Y-%m-%dT%H:%M:%SZ")
            filters.append(f"receivedDateTime ge {date_str}")

        params = {
            "$top": limit or 50,
            "$orderby": "receivedDateTime desc"
        }
        if filters:
            params["$filter"] = " and ".join(filters)

        # Determine endpoint
        if folder == "INBOX":
            endpoint = "/me/mailFolders/inbox/messages"
        else:
            # Search for folder by name
            folder_id = self._get_folder_id(folder)
            endpoint = f"/me/mailFolders/{folder_id}/messages"

        try:
            result = self._make_request(endpoint, params=params)
            messages = result.get('value', [])

            emails = []
            for msg in messages:
                email = self._parse_message(msg)
                emails.append(email)

            return emails

        except Exception as e:
            raise ConnectionError(f"Failed to fetch emails: {str(e)}")

    def get_email(self, email_id: str) -> Email:
        """Get a specific email by ID"""
        try:
            message = self._make_request(f"/me/messages/{email_id}")
            return self._parse_message(message)
        except Exception as e:
            raise EmailNotFoundError(f"Email not found: {email_id}")

    def _parse_message(self, message: Dict) -> Email:
        """Parse Microsoft Graph message into Email object"""
        # Extract recipients
        recipients = [r['emailAddress']['address'] for r in message.get('toRecipients', [])]
        cc = [r['emailAddress']['address'] for r in message.get('ccRecipients', [])]
        bcc = [r['emailAddress']['address'] for r in message.get('bccRecipients', [])]

        # Parse timestamp
        timestamp = None
        if 'receivedDateTime' in message:
            timestamp = datetime.fromisoformat(
                message['receivedDateTime'].replace('Z', '+00:00')
            )

        # Extract body
        body_content = message.get('body', {})
        body_type = body_content.get('contentType', 'text')
        body_text = ""
        body_html = ""

        if body_type == 'html':
            body_html = body_content.get('content', '')
        else:
            body_text = body_content.get('content', '')

        # Extract attachments
        attachments = []
        if message.get('hasAttachments', False):
            for att in message.get('attachments', []):
                attachment = EmailAttachment(
                    filename=att.get('name', 'unknown'),
                    content_type=att.get('contentType', 'application/octet-stream'),
                    size=att.get('size', 0),
                    content_id=att.get('id')
                )
                attachments.append(attachment)

        # Determine priority
        importance = message.get('importance', 'normal')
        priority_map = {
            'low': EmailPriority.LOW,
            'normal': EmailPriority.NORMAL,
            'high': EmailPriority.HIGH
        }
        priority = priority_map.get(importance, EmailPriority.NORMAL)

        # Get sender
        sender = message.get('from', {}).get('emailAddress', {}).get('address', '')

        return Email(
            id=message['id'],
            subject=message.get('subject', '(No Subject)'),
            sender=sender,
            recipients=recipients,
            cc=cc,
            bcc=bcc,
            body_text=body_text,
            body_html=body_html,
            timestamp=timestamp,
            attachments=attachments,
            labels=message.get('categories', []),
            is_read=message.get('isRead', False),
            folder=message.get('parentFolderId', 'INBOX'),
            priority=priority,
            in_reply_to=message.get('conversationId'),
            headers={}
        )

    def _get_folder_id(self, folder_name: str) -> str:
        """Get folder ID by name"""
        result = self._make_request("/me/mailFolders")
        folders = result.get('value', [])

        for folder in folders:
            if folder['displayName'].lower() == folder_name.lower():
                return folder['id']

        raise EmailNotFoundError(f"Folder not found: {folder_name}")

    def mark_as_read(self, email_id: str) -> bool:
        """Mark email as read"""
        try:
            self._make_request(
                f"/me/messages/{email_id}",
                method="PATCH",
                params={"isRead": True}
            )
            return True
        except Exception as e:
            print(f"Failed to mark email as read: {e}")
            return False

    def mark_as_unread(self, email_id: str) -> bool:
        """Mark email as unread"""
        try:
            self._make_request(
                f"/me/messages/{email_id}",
                method="PATCH",
                params={"isRead": False}
            )
            return True
        except Exception as e:
            print(f"Failed to mark email as unread: {e}")
            return False

    def list_folders(self) -> List[str]:
        """List all Outlook folders"""
        try:
            result = self._make_request("/me/mailFolders")
            folders = result.get('value', [])
            return [folder['displayName'] for folder in folders]
        except Exception as e:
            raise ConnectionError(f"Failed to list folders: {e}")

    def disconnect(self) -> None:
        """Disconnect from Outlook"""
        self.access_token = None
        self.app = None
        self._authenticated = False
