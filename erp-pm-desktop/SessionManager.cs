using System;
using System.Timers;

namespace ERPProjectManager
{
    /// <summary>
    /// Manages user session, authentication, and timeout for ERP application.
    /// Secure session management in C# layer (not exposed to JavaScript).
    /// </summary>
    public class SessionManager
    {
        private static SessionManager _instance;
        private static readonly object _lock = new object();

        private string _sessionToken;
        private DateTime _lastActivity;
        private Timer _timeoutTimer;

        // Session configuration
        private const int SESSION_TIMEOUT_MINUTES = 30;
        private const int CHECK_INTERVAL_MS = 60000; // Check every minute

        // Session properties
        public bool IsAuthenticated { get; private set; }
        public string Username { get; private set; }
        public string InstanceName { get; private set; }
        public string UserRole { get; private set; }
        public string FullName { get; private set; }
        public DateTime LoginTime { get; private set; }

        // Events
        public event EventHandler SessionExpired;
        public event EventHandler<SessionEventArgs> SessionChanged;

        /// <summary>
        /// Singleton instance
        /// </summary>
        public static SessionManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    lock (_lock)
                    {
                        if (_instance == null)
                        {
                            _instance = new SessionManager();
                        }
                    }
                }
                return _instance;
            }
        }

        private SessionManager()
        {
            IsAuthenticated = false;
            _timeoutTimer = new Timer(CHECK_INTERVAL_MS);
            _timeoutTimer.Elapsed += OnTimerElapsed;
        }

        /// <summary>
        /// Authenticate user with username, password, and instance
        /// </summary>
        public LoginResult Login(string username, string password, string instanceName)
        {
            try
            {
                // TODO: Replace with actual Oracle APEX API authentication
                // For mock run, use simple validation
                if (string.IsNullOrWhiteSpace(username) ||
                    string.IsNullOrWhiteSpace(password) ||
                    string.IsNullOrWhiteSpace(instanceName))
                {
                    return new LoginResult
                    {
                        Success = false,
                        Message = "All fields are required"
                    };
                }

                // Mock authentication - Replace with actual API call
                if (ValidateMockCredentials(username, password, instanceName))
                {
                    // Create session
                    _sessionToken = GenerateSessionToken();
                    Username = username;
                    InstanceName = instanceName;
                    UserRole = DetermineUserRole(username); // Mock role assignment
                    FullName = GetFullName(username); // Mock full name
                    LoginTime = DateTime.Now;
                    _lastActivity = DateTime.Now;
                    IsAuthenticated = true;

                    // Start timeout monitoring
                    _timeoutTimer.Start();

                    // Raise session changed event
                    SessionChanged?.Invoke(this, new SessionEventArgs
                    {
                        Type = SessionEventType.Login,
                        Username = Username,
                        Timestamp = DateTime.Now
                    });

                    return new LoginResult
                    {
                        Success = true,
                        Message = "Login successful",
                        SessionToken = _sessionToken,
                        Username = Username,
                        FullName = FullName,
                        Role = UserRole
                    };
                }
                else
                {
                    return new LoginResult
                    {
                        Success = false,
                        Message = "Invalid credentials or instance"
                    };
                }
            }
            catch (Exception ex)
            {
                return new LoginResult
                {
                    Success = false,
                    Message = $"Authentication error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// Logout and clear session
        /// </summary>
        public void Logout()
        {
            if (IsAuthenticated)
            {
                SessionChanged?.Invoke(this, new SessionEventArgs
                {
                    Type = SessionEventType.Logout,
                    Username = Username,
                    Timestamp = DateTime.Now
                });
            }

            ClearSession();
        }

        /// <summary>
        /// Update last activity timestamp to keep session alive
        /// </summary>
        public void UpdateActivity()
        {
            if (IsAuthenticated)
            {
                _lastActivity = DateTime.Now;
            }
        }

        /// <summary>
        /// Get current session token for API calls
        /// </summary>
        public string GetSessionToken()
        {
            return IsAuthenticated ? _sessionToken : null;
        }

        /// <summary>
        /// Get minutes until session expires
        /// </summary>
        public int GetMinutesUntilExpiry()
        {
            if (!IsAuthenticated) return 0;

            var minutesIdle = (DateTime.Now - _lastActivity).TotalMinutes;
            return Math.Max(0, (int)(SESSION_TIMEOUT_MINUTES - minutesIdle));
        }

        private void OnTimerElapsed(object sender, ElapsedEventArgs e)
        {
            if (!IsAuthenticated) return;

            var minutesIdle = (DateTime.Now - _lastActivity).TotalMinutes;

            if (minutesIdle >= SESSION_TIMEOUT_MINUTES)
            {
                // Session expired
                SessionExpired?.Invoke(this, EventArgs.Empty);

                SessionChanged?.Invoke(this, new SessionEventArgs
                {
                    Type = SessionEventType.Timeout,
                    Username = Username,
                    Timestamp = DateTime.Now
                });

                ClearSession();
            }
        }

        private void ClearSession()
        {
            _sessionToken = null;
            Username = null;
            InstanceName = null;
            UserRole = null;
            FullName = null;
            IsAuthenticated = false;
            _timeoutTimer.Stop();
        }

        private string GenerateSessionToken()
        {
            return Guid.NewGuid().ToString("N") + "-" + DateTime.Now.Ticks.ToString("X");
        }

        // ===== MOCK AUTHENTICATION METHODS =====
        // TODO: Replace with actual Oracle APEX API integration

        private bool ValidateMockCredentials(string username, string password, string instanceName)
        {
            // Mock validation - Accept any non-empty credentials
            // In production, this would call Oracle APEX authentication API
            return !string.IsNullOrEmpty(username) &&
                   !string.IsNullOrEmpty(password) &&
                   !string.IsNullOrEmpty(instanceName);
        }

        private string DetermineUserRole(string username)
        {
            // Mock role assignment
            if (username.ToLower().Contains("admin"))
                return "System Administrator";
            else if (username.ToLower().Contains("manager"))
                return "GL Manager";
            else
                return "GL Accountant";
        }

        private string GetFullName(string username)
        {
            // Mock full name - Replace with actual API lookup
            return $"{username} (User)";
        }
    }

    /// <summary>
    /// Result of login attempt
    /// </summary>
    public class LoginResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string SessionToken { get; set; }
        public string Username { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
    }

    /// <summary>
    /// Session event arguments
    /// </summary>
    public class SessionEventArgs : EventArgs
    {
        public SessionEventType Type { get; set; }
        public string Username { get; set; }
        public DateTime Timestamp { get; set; }
    }

    /// <summary>
    /// Types of session events
    /// </summary>
    public enum SessionEventType
    {
        Login,
        Logout,
        Timeout,
        ActivityUpdate
    }
}
