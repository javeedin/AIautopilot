"""
Generic IMAP email provider implementation
"""

import imaplib
import email
from email.header import decode_header
from typing import List, Optional, Dict, Any
from datetime import datetime
import ssl

from ..base import EmailProvider
from ..models import Email, EmailAttachment, EmailPriority
from ..exceptions import (
    AuthenticationError,
    ConnectionError as EmailConnectionError,
    EmailNotFoundError,
    ConfigurationError
)


class IMAPProvider(EmailProvider):
    """Generic IMAP email provider for any IMAP-compatible email service"""

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize IMAP provider.

        Args:
            config: Configuration dictionary with:
                - host: IMAP server hostname
                - port: IMAP server port (default: 993 for SSL, 143 for non-SSL)
                - username: Email username/address
                - password: Email password
                - use_ssl: Whether to use SSL (default: True)
                - folder_encoding: Folder name encoding (default: 'utf-7')
        """
        super().__init__(config)
        self.connection = None
        self._validate_config()

    def _validate_config(self) -> None:
        """Validate required configuration"""
        required_fields = ['host', 'username', 'password']
        for field in required_fields:
            if field not in self.config:
                raise ConfigurationError(
                    f"IMAP provider requires '{field}' in config"
                )

    def authenticate(self) -> bool:
        """Authenticate with IMAP server"""
        try:
            use_ssl = self.config.get('use_ssl', True)
            host = self.config['host']
            port = self.config.get('port', 993 if use_ssl else 143)

            # Create connection
            if use_ssl:
                context = ssl.create_default_context()
                self.connection = imaplib.IMAP4_SSL(
                    host, port, ssl_context=context
                )
            else:
                self.connection = imaplib.IMAP4(host, port)

            # Login
            username = self.config['username']
            password = self.config['password']
            self.connection.login(username, password)

            self._authenticated = True
            return True

        except imaplib.IMAP4.error as e:
            raise AuthenticationError(f"IMAP authentication failed: {str(e)}")
        except Exception as e:
            raise EmailConnectionError(f"IMAP connection failed: {str(e)}")

    def fetch_emails(
        self,
        folder: str = "INBOX",
        limit: Optional[int] = None,
        since: Optional[datetime] = None,
        unread_only: bool = False
    ) -> List[Email]:
        """Fetch emails from IMAP server"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        try:
            # Select folder
            self.connection.select(folder, readonly=True)

            # Build search criteria
            criteria = []
            if unread_only:
                criteria.append('UNSEEN')
            if since:
                date_str = since.strftime("%d-%b-%Y")
                criteria.append(f'SINCE {date_str}')

            search_query = ' '.join(criteria) if criteria else 'ALL'

            # Search for messages
            status, messages = self.connection.search(None, search_query)
            if status != 'OK':
                raise EmailConnectionError("Failed to search emails")

            email_ids = messages[0].split()

            # Apply limit
            if limit:
                email_ids = email_ids[-limit:]

            emails = []
            for email_id in reversed(email_ids):  # Most recent first
                try:
                    email_obj = self.get_email(email_id.decode())
                    emails.append(email_obj)
                except Exception as e:
                    print(f"Warning: Failed to fetch email {email_id}: {e}")
                    continue

            return emails

        except imaplib.IMAP4.error as e:
            raise EmailConnectionError(f"IMAP fetch failed: {str(e)}")
        except Exception as e:
            raise EmailConnectionError(f"Failed to fetch emails: {str(e)}")

    def get_email(self, email_id: str) -> Email:
        """Get a specific email by ID"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated. Call authenticate() first.")

        try:
            # Fetch email
            status, msg_data = self.connection.fetch(email_id, '(RFC822 FLAGS)')
            if status != 'OK':
                raise EmailNotFoundError(f"Email not found: {email_id}")

            # Parse email
            raw_email = msg_data[0][1]
            email_message = email.message_from_bytes(raw_email)

            # Parse flags
            flags_str = msg_data[0][0].decode()
            is_read = '\\Seen' in flags_str

            return self._parse_message(email_id, email_message, is_read)

        except imaplib.IMAP4.error as e:
            raise EmailNotFoundError(f"Email not found: {email_id}")
        except Exception as e:
            raise EmailConnectionError(f"Failed to get email: {str(e)}")

    def _parse_message(self, email_id: str, msg: email.message.Message, is_read: bool) -> Email:
        """Parse email.message.Message into Email object"""

        # Decode header
        def decode_header_value(header_value):
            if header_value is None:
                return ""
            decoded_parts = decode_header(header_value)
            decoded_string = ""
            for part, encoding in decoded_parts:
                if isinstance(part, bytes):
                    decoded_string += part.decode(encoding or 'utf-8', errors='ignore')
                else:
                    decoded_string += part
            return decoded_string

        # Extract basic fields
        subject = decode_header_value(msg.get('Subject', '(No Subject)'))
        sender = decode_header_value(msg.get('From', ''))
        to_header = decode_header_value(msg.get('To', ''))
        cc_header = decode_header_value(msg.get('Cc', ''))
        bcc_header = decode_header_value(msg.get('Bcc', ''))

        recipients = [r.strip() for r in to_header.split(',') if r.strip()]
        cc = [c.strip() for c in cc_header.split(',') if c.strip()]
        bcc = [b.strip() for b in bcc_header.split(',') if b.strip()]

        # Parse timestamp
        timestamp = None
        date_str = msg.get('Date')
        if date_str:
            try:
                from email.utils import parsedate_to_datetime
                timestamp = parsedate_to_datetime(date_str)
            except Exception:
                pass

        # Extract body
        body_text = ""
        body_html = ""
        attachments = []

        if msg.is_multipart():
            for part in msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition", ""))

                # Check if it's an attachment
                if "attachment" in content_disposition:
                    filename = part.get_filename()
                    if filename:
                        attachment = EmailAttachment(
                            filename=decode_header_value(filename),
                            content_type=content_type,
                            size=len(part.get_payload(decode=True) or b''),
                            data=part.get_payload(decode=True)
                        )
                        attachments.append(attachment)
                elif content_type == "text/plain" and not body_text:
                    try:
                        body_text = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except Exception:
                        pass
                elif content_type == "text/html" and not body_html:
                    try:
                        body_html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                    except Exception:
                        pass
        else:
            # Not multipart
            content_type = msg.get_content_type()
            try:
                payload = msg.get_payload(decode=True)
                if payload:
                    decoded = payload.decode('utf-8', errors='ignore')
                    if content_type == "text/html":
                        body_html = decoded
                    else:
                        body_text = decoded
            except Exception:
                pass

        # Determine priority
        priority = EmailPriority.NORMAL
        importance = msg.get('Importance', '').lower()
        priority_header = msg.get('X-Priority', '')

        if importance == 'high' or priority_header == '1':
            priority = EmailPriority.HIGH
        elif importance == 'low' or priority_header == '5':
            priority = EmailPriority.LOW

        return Email(
            id=email_id,
            subject=subject,
            sender=sender,
            recipients=recipients,
            cc=cc,
            bcc=bcc,
            body_text=body_text,
            body_html=body_html,
            timestamp=timestamp,
            attachments=attachments,
            is_read=is_read,
            priority=priority,
            in_reply_to=msg.get('In-Reply-To'),
            references=msg.get('References', '').split() if msg.get('References') else [],
            headers={k: v for k, v in msg.items()}
        )

    def mark_as_read(self, email_id: str) -> bool:
        """Mark email as read"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            self.connection.store(email_id, '+FLAGS', '\\Seen')
            return True
        except Exception as e:
            print(f"Failed to mark email as read: {e}")
            return False

    def mark_as_unread(self, email_id: str) -> bool:
        """Mark email as unread"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            self.connection.store(email_id, '-FLAGS', '\\Seen')
            return True
        except Exception as e:
            print(f"Failed to mark email as unread: {e}")
            return False

    def list_folders(self) -> List[str]:
        """List all IMAP folders"""
        if not self.is_authenticated():
            raise AuthenticationError("Not authenticated.")

        try:
            status, folders = self.connection.list()
            if status != 'OK':
                raise EmailConnectionError("Failed to list folders")

            folder_names = []
            for folder in folders:
                # Parse folder name from IMAP response
                # Format: (flags) "delimiter" "folder_name"
                folder_str = folder.decode()
                parts = folder_str.split('"')
                if len(parts) >= 3:
                    folder_name = parts[-2]
                    folder_names.append(folder_name)

            return folder_names

        except Exception as e:
            raise EmailConnectionError(f"Failed to list folders: {e}")

    def disconnect(self) -> None:
        """Disconnect from IMAP server"""
        if self.connection:
            try:
                self.connection.close()
                self.connection.logout()
            except Exception:
                pass
            finally:
                self.connection = None
                self._authenticated = False
