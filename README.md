# AIautopilot

A comprehensive email fetching integration system supporting multiple email providers including Gmail, Microsoft 365/Outlook, and generic IMAP servers.

## Features

- **Multiple Provider Support**
  - Gmail / Google Workspace (via Gmail API)
  - Microsoft 365 / Outlook (via Microsoft Graph API)
  - Generic IMAP (any IMAP-compatible email server)

- **Unified API**
  - Consistent interface across all providers
  - Easy to switch between providers
  - Context manager support for automatic cleanup

- **Flexible Configuration**
  - Configuration files (YAML/JSON)
  - Environment variables
  - Programmatic configuration

- **Rich Email Data**
  - Full email metadata (subject, sender, recipients, timestamps)
  - Email body (both text and HTML)
  - Attachment information
  - Labels/folders
  - Read/unread status

- **Advanced Features**
  - Filter by date range
  - Fetch only unread emails
  - Mark emails as read/unread
  - List available folders
  - Attachment support

## Installation

```bash
# Clone the repository
git clone https://github.com/javeedin/AIautopilot.git
cd AIautopilot

# Install dependencies
pip install -r requirements.txt
```

## Quick Start

### Using Configuration File

1. Copy the example configuration:
```bash
cp config/email_config.example.yaml config/email_config.yaml
```

2. Edit `config/email_config.yaml` with your credentials

3. Fetch emails:
```bash
python main.py --config config/email_config.yaml --limit 10
```

### Using Environment Variables

```bash
# Set environment variables
export EMAIL_PROVIDER=imap
export IMAP_HOST=imap.example.com
export IMAP_USERNAME=your-email@example.com
export IMAP_PASSWORD=your-password

# Fetch emails
python main.py --limit 10
```

### Programmatic Usage

```python
from email_fetcher import EmailProviderFactory

# Create provider
provider = EmailProviderFactory.create('gmail', {
    'credentials_file': 'credentials.json'
})

# Fetch emails
with provider:
    emails = provider.fetch_emails(limit=10, unread_only=True)

    for email in emails:
        print(f"Subject: {email.subject}")
        print(f"From: {email.sender}")
        print(f"Date: {email.timestamp}")
```

## Configuration

### Gmail Configuration

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Gmail API
3. Create OAuth 2.0 credentials
4. Download credentials as `credentials.json`

Configuration:
```yaml
provider: gmail
gmail:
  credentials_file: credentials.json
  token_file: token.json
```

### Outlook Configuration

1. Register an app in [Azure Portal](https://portal.azure.com/)
2. Configure API permissions (Mail.Read, Mail.ReadWrite)
3. Get client ID, tenant ID, and client secret

Configuration:
```yaml
provider: outlook
outlook:
  client_id: your-client-id
  client_secret: your-client-secret
  tenant_id: your-tenant-id
  auth_type: delegated
```

### IMAP Configuration

Configuration:
```yaml
provider: imap
imap:
  host: imap.example.com
  port: 993
  username: your-email@example.com
  password: your-password
  use_ssl: true
```

## Command-Line Usage

```bash
# Fetch emails
python main.py --provider imap --limit 10

# Fetch only unread emails
python main.py --unread-only --limit 5

# Fetch emails from last 7 days
python main.py --since-days 7

# List available folders
python main.py --list-folders

# Fetch from specific folder
python main.py --folder "Sent Items" --limit 5

# Mark email as read
python main.py --mark-read <email-id>

# Verbose output
python main.py --verbose
```

## API Reference

### EmailProvider

Base class for all email providers.

```python
class EmailProvider(ABC):
    def authenticate(self) -> bool
    def fetch_emails(folder: str, limit: int, since: datetime, unread_only: bool) -> List[Email]
    def get_email(email_id: str) -> Email
    def mark_as_read(email_id: str) -> bool
    def mark_as_unread(email_id: str) -> bool
    def list_folders(self) -> List[str]
    def disconnect(self) -> None
```

### Email Model

```python
@dataclass
class Email:
    id: str
    subject: str
    sender: str
    recipients: List[str]
    cc: List[str]
    bcc: List[str]
    body_text: str
    body_html: str
    timestamp: datetime
    attachments: List[EmailAttachment]
    labels: List[str]
    is_read: bool
    folder: str
    priority: EmailPriority
    headers: Dict[str, Any]
```

### EmailProviderFactory

Factory for creating email providers.

```python
# Create from explicit config
provider = EmailProviderFactory.create('gmail', config_dict)

# Create from config file
provider = EmailProviderFactory.create_from_config('config.yaml')

# Create from environment variables
provider = EmailProviderFactory.create_from_env()

# List supported providers
providers = EmailProviderFactory.list_providers()
```

## Examples

See the `examples/` directory for complete examples:

- `fetch_gmail.py` - Gmail integration example
- `fetch_outlook.py` - Outlook integration example
- `fetch_imap.py` - IMAP integration example
- `use_config_file.py` - Configuration file usage

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=email_fetcher --cov-report=html

# Run specific test
pytest tests/test_gmail.py
```

## Project Structure

```
AIautopilot/
├── email_fetcher/           # Main package
│   ├── __init__.py
│   ├── base.py             # Base provider interface
│   ├── models.py           # Data models
│   ├── exceptions.py       # Custom exceptions
│   ├── config.py           # Configuration management
│   ├── factory.py          # Provider factory
│   └── providers/          # Provider implementations
│       ├── gmail.py
│       ├── outlook.py
│       └── imap_provider.py
├── config/                 # Configuration files
├── examples/               # Usage examples
├── tests/                  # Unit tests
├── main.py                 # CLI entry point
├── requirements.txt        # Dependencies
└── README.md              # This file
```

## Security Considerations

- Never commit credentials or API keys to version control
- Use environment variables or secure credential storage
- Enable 2FA on email accounts
- Use app-specific passwords when possible
- Store OAuth tokens securely
- Rotate credentials regularly

## Troubleshooting

### Gmail Authentication Issues

- Ensure Gmail API is enabled in Google Cloud Console
- Check OAuth consent screen configuration
- Verify redirect URIs are configured correctly
- Delete `token.json` and re-authenticate if needed

### Outlook Authentication Issues

- Verify app registration in Azure Portal
- Check API permissions are granted and consented
- Ensure tenant ID is correct
- For delegated auth, user must have appropriate licenses

### IMAP Connection Issues

- Verify IMAP is enabled on the email account
- Check firewall/network connectivity
- Confirm correct host and port
- Try with and without SSL
- Check for rate limiting

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/javeedin/AIautopilot/issues
- Documentation: See examples/ directory

## Roadmap

- [ ] Support for sending emails
- [ ] Email search functionality
- [ ] Attachment download
- [ ] Email threading/conversation support
- [ ] Webhook support for real-time email notifications
- [ ] Additional providers (Yahoo, iCloud, etc.)
- [ ] Email caching and synchronization
- [ ] Advanced filtering and sorting