"""Tests for email models"""

import pytest
from datetime import datetime
from email_fetcher.models import Email, EmailAttachment, EmailPriority


class TestEmailAttachment:
    """Test EmailAttachment model"""

    def test_create_attachment(self):
        """Test creating an email attachment"""
        attachment = EmailAttachment(
            filename="test.pdf",
            content_type="application/pdf",
            size=1024
        )

        assert attachment.filename == "test.pdf"
        assert attachment.content_type == "application/pdf"
        assert attachment.size == 1024
        assert attachment.data is None

    def test_attachment_repr(self):
        """Test attachment string representation"""
        attachment = EmailAttachment(
            filename="document.pdf",
            content_type="application/pdf",
            size=2048
        )

        repr_str = repr(attachment)
        assert "document.pdf" in repr_str
        assert "application/pdf" in repr_str
        assert "2048" in repr_str


class TestEmail:
    """Test Email model"""

    def test_create_email(self):
        """Test creating an email"""
        email = Email(
            id="123",
            subject="Test Subject",
            sender="sender@example.com",
            recipients=["recipient@example.com"],
            body_text="Test body"
        )

        assert email.id == "123"
        assert email.subject == "Test Subject"
        assert email.sender == "sender@example.com"
        assert email.recipients == ["recipient@example.com"]
        assert email.body_text == "Test body"

    def test_email_with_attachments(self):
        """Test email with attachments"""
        attachment = EmailAttachment(
            filename="test.pdf",
            content_type="application/pdf",
            size=1024
        )

        email = Email(
            id="123",
            subject="Test",
            sender="sender@example.com",
            recipients=["recipient@example.com"],
            attachments=[attachment]
        )

        assert email.has_attachments is True
        assert len(email.attachments) == 1
        assert email.attachments[0].filename == "test.pdf"

    def test_email_without_attachments(self):
        """Test email without attachments"""
        email = Email(
            id="123",
            subject="Test",
            sender="sender@example.com",
            recipients=["recipient@example.com"]
        )

        assert email.has_attachments is False
        assert len(email.attachments) == 0

    def test_email_body_property(self):
        """Test email body property"""
        # Text body only
        email1 = Email(
            id="1",
            subject="Test",
            sender="test@example.com",
            recipients=["r@example.com"],
            body_text="Text content",
            body_html=""
        )
        assert email1.body == "Text content"

        # HTML body only
        email2 = Email(
            id="2",
            subject="Test",
            sender="test@example.com",
            recipients=["r@example.com"],
            body_text="",
            body_html="<p>HTML content</p>"
        )
        assert email2.body == "<p>HTML content</p>"

        # Both text and HTML (prefers text)
        email3 = Email(
            id="3",
            subject="Test",
            sender="test@example.com",
            recipients=["r@example.com"],
            body_text="Text content",
            body_html="<p>HTML content</p>"
        )
        assert email3.body == "Text content"

    def test_email_priority(self):
        """Test email priority"""
        email = Email(
            id="123",
            subject="Important",
            sender="sender@example.com",
            recipients=["recipient@example.com"],
            priority=EmailPriority.HIGH
        )

        assert email.priority == EmailPriority.HIGH

    def test_email_repr(self):
        """Test email string representation"""
        email = Email(
            id="123",
            subject="Test Subject",
            sender="sender@example.com",
            recipients=["recipient@example.com"],
            timestamp=datetime(2024, 1, 1, 12, 0, 0)
        )

        repr_str = repr(email)
        assert "123" in repr_str
        assert "sender@example.com" in repr_str
