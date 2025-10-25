"""
Gmail/Google Workspace email provider implementation
"""

import base64
import os
from typing import List, Optional, Dict, Any
from datetime import datetime
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from ..base import EmailProvider
from ..models import Email, EmailAttachment, EmailPriority
from ..exceptions import (
    AuthenticationError,
    ConnectionError,
    EmailNotFoundError,
    RateLimitError,
    ConfigurationError
)


class GmailProvider(EmailProvider):
    """Gmail/Google Workspace email provider using Gmail API"""

    # Gmail API scopes
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
              'https://www.googleapis.com/auth/gmail.modify']

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Gmail provider.

        Args:
            config: Configuration dictionary with:
                - credentials_file: Path to OAuth credentials JSON
                - token_file: Path to store/load token (optional)
                - user_email: Email address to access (for delegated access)
        """
        super().__init__(config)
        self.service = None
        self.credentials = None
        self._validate_config()

    def _validate_config(self) -> None:
        """Validate required configuration"""
        if 'credentials_file' not in self.config:
            raise ConfigurationError("Gmail provider requires 'credentials_file' in config")

        if not os.path.exists(self.config['credentials_file']):
            raise ConfigurationError(
                f"Credentials file not found: {self.config['credentials_file']}"
            )

    def authenticate(self) -> bool:
        """Authenticate with Gmail using OAuth 2.0"""
        try:
            token_file = self.config.get('token_file', 'token.json')

            # Load existing credentials
            if os.path.exists(token_file):
                self.credentials = Credentials.from_authorized_user_file(
                    token_file, self.SCOPES
                )

            # Refresh or get new credentials
            if not self.credentials or not self.credentials.valid:
                if self.credentials and self.credentials.expired and self.credentials.refresh_token:
                    self.credentials.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.config['credentials_file'], self.SCOPES
                    )
                    self.credentials = flow.run_local_server(port=0)

                # Save credentials
                with open(token_file, 'w') as token:
                    token.write(self.credentials.to_json())

            # Build service
            self.service = build('gmail', 'v1', credentials=self.credentials)
            self._authenticated = True
            return True

        except Exception as e:
            raise AuthenticationError(f"Gmail authentication failed: {str(e)}")

    def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: Optional[int] = None,
        since: Optional[datetime] = None,
        unread_only: bool = False
    ) -> List[Email]:
        """Fetch emails from Gmail"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        try:
            # Build query
            query_parts = []
            if folder != "INBOX":
                query_parts.append(f"label:{folder}")
            if unread_only:
                query_parts.append("is:unread")
            if since:
                date_str = since.strftime("%Y/%m/%d")
                query_parts.append(f"after:{date_str}")

            query = " ".join(query_parts) if query_parts else None

            # Fetch message IDs
            results = self.service.users().messages().list(
                userId='me',
                q=query,
                maxResults=limit
            ).execute()

            messages = results.get('messages', [])
            emails = []

            # Fetch full message details
            for msg in messages:
                try:
                    email = self.get_email(msg['id'])
                    emails.append(email)
                except Exception as e:
                    print(f"Warning: Failed to fetch email {msg['id']}: {e}")
                    continue

            return emails

        except HttpError as e:
            if e.resp.status == 429:
                raise RateLimitError("Gmail API rate limit exceeded")
            raise ConnectionError(f"Gmail API error: {str(e)}")
        except Exception as e:
            raise ConnectionError(f"Failed to fetch emails: {str(e)}")

    def get_email(self, email_id: str) -> Email:
        """Get a specific email by ID"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        try:
            message = self.service.users().messages().get(
                userId='me',
                id=email_id,
                format='full'
            ).execute()

            return self._parse_message(message)

        except HttpError as e:
            if e.resp.status == 404:
                raise EmailNotFoundError(f"Email not found: {email_id}")
            raise ConnectionError(f"Failed to get email: {str(e)}")

    def _parse_message(self, message: Dict) -> Email:
        """Parse Gmail API message into Email object"""
        headers = {h['name']: h['value'] for h in message['payload']['headers']}

        # Extract basic fields
        subject = headers.get('Subject', '(No Subject)')
        sender = headers.get('From', '')
        to = headers.get('To', '').split(',')
        cc = headers.get('Cc', '').split(',') if 'Cc' in headers else []
        bcc = headers.get('Bcc', '').split(',') if 'Bcc' in headers else []

        # Parse timestamp
        timestamp = None
        if 'internalDate' in message:
            timestamp = datetime.fromtimestamp(int(message['internalDate']) / 1000)

        # Extract body
        body_text, body_html = self._extract_body(message['payload'])

        # Extract attachments
        attachments = self._extract_attachments(message['payload'])

        # Labels
        labels = message.get('labelIds', [])
        is_read = 'UNREAD' not in labels

        return Email(
            id=message['id'],
            subject=subject,
            sender=sender,
            recipients=[r.strip() for r in to if r.strip()],
            cc=[c.strip() for c in cc if c.strip()],
            bcc=[b.strip() for b in bcc if b.strip()],
            body_text=body_text,
            body_html=body_html,
            timestamp=timestamp,
            attachments=attachments,
            labels=labels,
            is_read=is_read,
            headers=headers,
            in_reply_to=headers.get('In-Reply-To'),
            references=headers.get('References', '').split() if 'References' in headers else []
        )

    def _extract_body(self, payload: Dict) -> tuple[str, str]:
        """Extract text and HTML body from message payload"""
        body_text = ""
        body_html = ""

        if 'parts' in payload:
            for part in payload['parts']:
                mime_type = part.get('mimeType', '')
                if mime_type == 'text/plain' and 'data' in part.get('body', {}):
                    body_text += base64.urlsafe_b64decode(
                        part['body']['data']
                    ).decode('utf-8', errors='ignore')
                elif mime_type == 'text/html' and 'data' in part.get('body', {}):
                    body_html += base64.urlsafe_b64decode(
                        part['body']['data']
                    ).decode('utf-8', errors='ignore')
                elif 'parts' in part:
                    # Recursive for multipart
                    text, html = self._extract_body(part)
                    body_text += text
                    body_html += html
        elif 'body' in payload and 'data' in payload['body']:
            mime_type = payload.get('mimeType', '')
            body_data = base64.urlsafe_b64decode(
                payload['body']['data']
            ).decode('utf-8', errors='ignore')
            if mime_type == 'text/plain':
                body_text = body_data
            elif mime_type == 'text/html':
                body_html = body_data

        return body_text, body_html

    def _extract_attachments(self, payload: Dict) -> List[EmailAttachment]:
        """Extract attachments from message payload"""
        attachments = []

        if 'parts' in payload:
            for part in payload['parts']:
                if part.get('filename'):
                    attachment = EmailAttachment(
                        filename=part['filename'],
                        content_type=part.get('mimeType', 'application/octet-stream'),
                        size=part.get('body', {}).get('size', 0),
                        content_id=part.get('body', {}).get('attachmentId')
                    )
                    attachments.append(attachment)

        return attachments

    def mark_as_read(self, email_id: str) -> bool:
        """Mark email as read"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            self.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as e:
            print(f"Failed to mark email as read: {e}")
            return False

    def mark_as_unread(self, email_id: str) -> bool:
        """Mark email as unread"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            self.service.users().messages().modify(
                userId='me',
                id=email_id,
                body={'addLabelIds': ['UNREAD']}
            ).execute()
            return True
        except HttpError as e:
            print(f"Failed to mark email as unread: {e}")
            return False

    def list_folders(self) -> List[str]:
        """List all Gmail labels/folders"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            results = self.service.users().labels().list(userId='me').execute()
            labels = results.get('labels', [])
            return [label['name'] for label in labels]
        except HttpError as e:
            raise ConnectionError(f"Failed to list folders: {e}")

    def disconnect(self) -> None:
        """Disconnect from Gmail"""
        self.service = None
        self.credentials = None
        self._authenticated = False
