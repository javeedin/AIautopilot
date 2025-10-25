"""
Custom exceptions for email fetching
"""


class EmailFetcherError(Exception):
    """Base exception for all email fetcher errors"""
    pass


class AuthenticationError(EmailFetcherError):
    """Raised when authentication fails"""
    pass


class ConnectionError(EmailFetcherError):
    """Raised when connection to email server fails"""
    pass


class ConfigurationError(EmailFetcherError):
    """Raised when configuration is invalid or missing"""
    pass


class RateLimitError(EmailFetcherError):
    """Raised when API rate limit is exceeded"""
    pass


class EmailNotFoundError(EmailFetcherError):
    """Raised when requested email is not found"""
    pass
