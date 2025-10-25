"""
Data models for email fetching
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum


class EmailPriority(Enum):
    """Email priority levels"""
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"


@dataclass
class EmailAttachment:
    """Represents an email attachment"""
    filename: str
    content_type: str
    size: int  # Size in bytes
    content_id: Optional[str] = None
    data: Optional[bytes] = None  # Actual file data

    def __repr__(self) -> str:
        return f"EmailAttachment(filename='{self.filename}', type='{self.content_type}', size={self.size})"


@dataclass
class Email:
    """Represents an email message"""
    id: str
    subject: str
    sender: str
    recipients: List[str]
    cc: List[str] = field(default_factory=list)
    bcc: List[str] = field(default_factory=list)
    body_text: str = ""
    body_html: str = ""
    timestamp: Optional[datetime] = None
    attachments: List[EmailAttachment] = field(default_factory=list)
    labels: List[str] = field(default_factory=list)
    is_read: bool = False
    folder: str = "INBOX"
    priority: EmailPriority = EmailPriority.NORMAL
    in_reply_to: Optional[str] = None
    references: List[str] = field(default_factory=list)
    headers: Dict[str, Any] = field(default_factory=dict)

    def __repr__(self) -> str:
        return (
            f"Email(id='{self.id}', "
            f"subject='{self.subject[:50]}...', "
            f"from='{self.sender}', "
            f"to={len(self.recipients)} recipient(s), "
            f"timestamp={self.timestamp})"
        )

    @property
    def has_attachments(self) -> bool:
        """Check if email has attachments"""
        return len(self.attachments) > 0

    @property
    def body(self) -> str:
        """Get email body, preferring text over HTML"""
        return self.body_text or self.body_html
