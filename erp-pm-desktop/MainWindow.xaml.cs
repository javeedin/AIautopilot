using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.Wpf;
using LibGit2Sharp;

namespace ERPProjectManager
{
    public partial class MainWindow : Window
    {
        private string localRepoPath;
        private string projectManagementPath;
        private const string REPO_URL = "https://github.com/javeedin/AIautopilot.git";
        private const string BRANCH_NAME = "claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx";

        private Dictionary<string, string> moduleUrls = new Dictionary<string, string>();
        private List<string> logs = new List<string>();

        public MainWindow()
        {
            InitializeComponent();
            Closing += MainWindow_Closing;
            InitializeAsync();
        }

        private void Log(string message)
        {
            string timestamp = DateTime.Now.ToString("HH:mm:ss.fff");
            string logEntry = $"[{timestamp}] {message}";
            logs.Add(logEntry);

            // Update status bar
            Dispatcher.Invoke(() =>
            {
                if (statusText != null)
                {
                    statusText.Text = message;
                }
            });
        }

        private void LogViewerButton_Click(object sender, RoutedEventArgs e)
        {
            var logWindow = new Window
            {
                Title = "Application Logs",
                Width = 800,
                Height = 600,
                Background = System.Windows.Media.Brushes.Black,
                WindowStartupLocation = WindowStartupLocation.CenterOwner,
                Owner = this
            };

            var textBox = new TextBox
            {
                Text = string.Join(Environment.NewLine, logs),
                IsReadOnly = true,
                VerticalScrollBarVisibility = ScrollBarVisibility.Auto,
                HorizontalScrollBarVisibility = ScrollBarVisibility.Auto,
                FontFamily = new System.Windows.Media.FontFamily("Consolas"),
                FontSize = 12,
                Foreground = System.Windows.Media.Brushes.LimeGreen,
                Background = System.Windows.Media.Brushes.Black,
                Padding = new Thickness(10)
            };

            logWindow.Content = textBox;
            logWindow.ShowDialog();
        }

        private async void InitializeAsync()
        {
            try
            {
                Log("Application starting - InitializeAsync");

                // Check if user has downloaded to the fixed location
                string fixedPath = @"C:\javeed\Aiautopilot";
                string fixedProjectPath = Path.Combine(fixedPath, "project-management");

                Log($"Checking for fixed path: {fixedPath}");
                if (Directory.Exists(fixedProjectPath))
                {
                    localRepoPath = fixedPath;
                    projectManagementPath = fixedProjectPath;
                    Log($"Using fixed path: {localRepoPath}");
                }
                else
                {
                    string appDataPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "ERPProjectManager"
                    );
                    Directory.CreateDirectory(appDataPath);
                    localRepoPath = Path.Combine(appDataPath, "AIautopilot");
                    projectManagementPath = Path.Combine(localRepoPath, "project-management");
                    Log($"Using AppData path: {localRepoPath}");
                }

                // Clone or pull repository
                Log("Cloning or updating repository...");
                await CloneOrUpdateRepository();

                if (!Directory.Exists(projectManagementPath))
                {
                    Log($"ERROR: project-management folder not found at {projectManagementPath}");
                    MessageBox.Show(
                        $"Failed to clone repository or project-management folder not found.\n\n" +
                        $"Expected folder: {projectManagementPath}",
                        "Repository Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    return;
                }
                Log("Repository ready");

                // Setup module URLs
                Log("Setting up module URLs");
                SetupModuleUrls();

                // Open Project Management tab by default
                Log("Opening default Project Management tab");
                await CreateNewTab("📊 Project Management", "project-management");
            }
            catch (Exception ex)
            {
                Log($"ERROR in InitializeAsync: {ex.Message}");
                MessageBox.Show($"Error initializing application: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void SetupModuleUrls()
        {
            moduleUrls["project-management"] = Path.Combine(projectManagementPath, "index.html");
            moduleUrls["GL"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["AP"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["AR"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["PO"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["INV"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["OM"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["CSH"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["FA"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["HCM"] = Path.Combine(projectManagementPath, "modules.html");
            moduleUrls["PAY"] = Path.Combine(projectManagementPath, "modules.html");
        }

        private async Task CreateNewTab(string tabTitle, string moduleKey)
        {
            try
            {
                Log($"Creating new tab: {tabTitle} (Module: {moduleKey})");

                // Create new WebView2
                var webView = new WebView2();
                Log("WebView2 instance created");

                // Create tab item
                var tabItem = new TabItem
                {
                    Header = tabTitle,
                    Content = webView
                };

                // Add to tab control
                tabControl.Items.Add(tabItem);
                tabControl.SelectedItem = tabItem;
                Log("Tab added to TabControl");

                // Initialize WebView2 with fresh cache
                string cacheDir = Path.Combine(localRepoPath, "WebView2Cache");

                // IMPORTANT: Clear cache to force JavaScript reload (fixes caching issues)
                if (Directory.Exists(cacheDir))
                {
                    try
                    {
                        Log("Clearing WebView2 cache to ensure fresh JavaScript files...");
                        Directory.Delete(cacheDir, recursive: true);
                        Log("Cache cleared successfully");
                    }
                    catch (Exception ex)
                    {
                        Log($"WARNING: Could not clear cache: {ex.Message}");
                    }
                }

                Log($"Initializing WebView2 with cache: {cacheDir}");
                await InitializeWebView(webView, cacheDir);

                // Navigate to URL
                if (webView.CoreWebView2 == null)
                {
                    Log("ERROR: CoreWebView2 is NULL after initialization!");
                    MessageBox.Show("ERROR: CoreWebView2 is NULL after initialization!", "Critical Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }
                Log("CoreWebView2 initialized successfully");

                if (moduleUrls.ContainsKey(moduleKey))
                {
                    string url = moduleUrls[moduleKey];
                    Log($"Module URL found: {url}");

                    if (File.Exists(url))
                    {
                        Log("File exists, converting to URI...");

                        try
                        {
                            // Fix: Properly create file:// URI from Windows file path
                            string normalizedPath = url.Replace("\\", "/");
                            Log($"Normalized path: {normalizedPath}");

                            // Uppercase drive letter if present (e.g., c:/ -> C:/)
                            if (normalizedPath.Length >= 2 && normalizedPath[1] == ':')
                            {
                                normalizedPath = char.ToUpper(normalizedPath[0]) + normalizedPath.Substring(1);
                                Log($"Uppercased drive letter: {normalizedPath}");
                            }

                            // Ensure the path has file:// scheme
                            string fileUri;
                            if (!normalizedPath.StartsWith("file://"))
                            {
                                // Add file:// scheme for local files
                                fileUri = "file:///" + normalizedPath;
                            }
                            else
                            {
                                fileUri = normalizedPath;
                            }

                            Log($"File URI: {fileUri}");

                            Log("Calling Navigate()...");
                            webView.CoreWebView2.Navigate(fileUri);
                            Log("Navigate() completed successfully");
                        }
                        catch (Exception uriEx)
                        {
                            Log($"ERROR creating URI: {uriEx.Message}");
                            MessageBox.Show($"Error creating URI from path:\n{url}\n\nError: {uriEx.Message}",
                                "URI Error", MessageBoxButton.OK, MessageBoxImage.Error);
                        }
                    }
                    else
                    {
                        Log($"ERROR: File not found: {url}");
                        MessageBox.Show($"File not found:\n{url}", "File Missing", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
                else
                {
                    Log($"ERROR: Module key '{moduleKey}' not found. Available: {string.Join(", ", moduleUrls.Keys)}");
                    MessageBox.Show($"Module key '{moduleKey}' not found in moduleUrls dictionary.\n\nAvailable keys: {string.Join(", ", moduleUrls.Keys)}",
                        "Module Key Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                Log($"ERROR creating tab: {ex.Message}");
                MessageBox.Show($"Error creating tab: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task InitializeWebView(WebView2 webView, string cacheDir)
        {
            try
            {
                Log("InitializeWebView: Starting initialization");
                await InitializeWebViewCore(webView, cacheDir);
                Log("InitializeWebView: Completed successfully");
            }
            catch (Exception ex)
            {
                Log($"InitializeWebView: Error occurred: {ex.Message}");
                // Try clearing cache and retry
                try
                {
                    Log("InitializeWebView: Attempting to clear cache and retry");
                    if (Directory.Exists(cacheDir))
                    {
                        Directory.Delete(cacheDir, recursive: true);
                        Log("InitializeWebView: Cache deleted");
                    }
                    await Task.Delay(500);
                    await InitializeWebViewCore(webView, cacheDir);
                    Log("InitializeWebView: Retry successful");
                }
                catch (Exception retryEx)
                {
                    Log($"InitializeWebView: Retry FAILED: {retryEx.Message}");
                    MessageBox.Show(
                        $"Failed to initialize WebView2:\n\n{retryEx.Message}\n\n" +
                        $"Cache location: {cacheDir}\n\n" +
                        "Please manually delete the cache folder and restart the app.\n\n" +
                        "Download WebView2: https://go.microsoft.com/fwlink/p/?LinkId=2124703",
                        "WebView2 Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    throw;
                }
            }
        }

        private async Task InitializeWebViewCore(WebView2 webView, string cacheDir)
        {
            Log($"InitializeWebViewCore: Creating cache directory: {cacheDir}");
            Directory.CreateDirectory(cacheDir);

            Log("InitializeWebViewCore: Creating CoreWebView2Environment");
            var env = await CoreWebView2Environment.CreateAsync(null, cacheDir, null);

            Log("InitializeWebViewCore: Ensuring CoreWebView2 is ready");
            await webView.EnsureCoreWebView2Async(env);

            Log("InitializeWebViewCore: Configuring settings");
            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Settings.IsWebMessageEnabled = true;

            // Add console message handler to capture JavaScript errors
            webView.CoreWebView2.WebMessageReceived += (s, e) =>
            {
                try
                {
                    var json = Newtonsoft.Json.Linq.JObject.Parse(e.WebMessageAsJson);
                    string type = json["type"]?.ToString() ?? "unknown";
                    string message = json["message"]?.ToString() ?? "";

                    string logPrefix = type.ToUpper();
                    if (type == "error")
                    {
                        Log($"JS ERROR: {message}");
                    }
                    else if (type == "warn")
                    {
                        Log($"JS WARN: {message}");
                    }
                    else
                    {
                        Log($"JS LOG: {message}");
                    }
                }
                catch
                {
                    Log($"WebMessage (raw): {e.WebMessageAsJson}");
                }
            };

            // Add navigation event handlers with logging
            webView.CoreWebView2.NavigationStarting += (s, e) =>
            {
                Log($"NavigationStarting: {e.Uri}");
            };

            webView.CoreWebView2.NavigationCompleted += async (s, e) =>
            {
                Log($"NavigationCompleted: Success={e.IsSuccess}, HttpStatus={e.HttpStatusCode}");
                if (!e.IsSuccess)
                {
                    Log($"Navigation FAILED with error code: {e.WebErrorStatus}");
                }
                else
                {
                    // Inject CSV data to avoid CORS issues
                    Log("Navigation successful, injecting CSV data...");
                    await InjectCsvData(webView);

                    // Open DevTools automatically to see console
                    Log("Opening DevTools for debugging...");
                    webView.CoreWebView2.OpenDevToolsWindow();
                }
            };

            // Add console message interception
            webView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync(@"
                (function() {
                    const originalConsoleLog = console.log;
                    const originalConsoleError = console.error;
                    const originalConsoleWarn = console.warn;

                    console.log = function(...args) {
                        originalConsoleLog.apply(console, args);
                        window.chrome.webview.postMessage({type: 'log', message: args.join(' ')});
                    };

                    console.error = function(...args) {
                        originalConsoleError.apply(console, args);
                        window.chrome.webview.postMessage({type: 'error', message: args.join(' ')});
                    };

                    console.warn = function(...args) {
                        originalConsoleWarn.apply(console, args);
                        window.chrome.webview.postMessage({type: 'warn', message: args.join(' ')});
                    };

                    // Catch unhandled errors
                    window.addEventListener('error', function(e) {
                        window.chrome.webview.postMessage({type: 'error', message: 'Uncaught: ' + e.message + ' at ' + e.filename + ':' + e.lineno});
                    });
                })();
            ");

            // Wait a bit to ensure WebView2 is fully ready
            Log("InitializeWebViewCore: Waiting 100ms for WebView2 to be fully ready");
            await Task.Delay(100);
            Log("InitializeWebViewCore: Initialization complete");
        }

        private async Task CloneOrUpdateRepository()
        {
            try
            {
                if (!Directory.Exists(localRepoPath))
                {
                    Log($"Cloning repository to: {localRepoPath}");
                    Repository.Clone(REPO_URL, localRepoPath, new CloneOptions
                    {
                        BranchName = BRANCH_NAME,
                        Checkout = true
                    });
                    Log("Repository cloned successfully");
                }
                else if (Directory.Exists(Path.Combine(localRepoPath, ".git")))
                {
                    Log("Repository exists, updating...");
                    using (var repo = new Repository(localRepoPath))
                    {
                        Log("Fetching latest changes");
                        var remote = repo.Network.Remotes["origin"];
                        var refSpecs = remote.FetchRefSpecs.Select(x => x.Specification);
                        Commands.Fetch(repo, remote.Name, refSpecs, null, null);

                        var branch = repo.Branches[BRANCH_NAME];
                        if (branch != null)
                        {
                            Log($"Checking out branch: {BRANCH_NAME}");
                            Commands.Checkout(repo, branch);
                            var signature = new Signature("ERP Manager", "erp@local.com", DateTimeOffset.Now);
                            repo.Reset(ResetMode.Hard, branch.Tip);
                            Log("Repository updated successfully");
                        }
                        else
                        {
                            Log($"WARNING: Branch {BRANCH_NAME} not found");
                        }
                    }
                }
                else
                {
                    Log("WARNING: Repository path exists but no .git folder found");
                }
            }
            catch (Exception ex)
            {
                Log($"Git operation failed: {ex.Message}");
                MessageBox.Show($"Git operation failed: {ex.Message}",
                    "Git Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        // ===== CSV Data Injection =====

        private async Task InjectCsvData(WebView2 webView)
        {
            try
            {
                Log("Reading CSV files from disk...");

                // Read validation summary
                var validationSummary = await ReadCsvFile(Path.Combine(localRepoPath, "docs/tracking/Feature_Validation_Summary.csv"));
                Log($"Loaded {validationSummary.Count} validation summary records");

                // Read pages
                var pages = await ReadCsvFile(Path.Combine(localRepoPath, "docs/requirements/Application_Pages_Inventory.csv"));
                Log($"Loaded {pages.Count} pages");

                // Read tables
                var tables = await ReadCsvFile(Path.Combine(localRepoPath, "docs/requirements/Database_Tables_Master.csv"));
                Log($"Loaded {tables.Count} tables");

                // Read validation details for each module
                var validations = new Dictionary<string, List<Dictionary<string, string>>>();
                string[] modules = { "GL", "UR", "AP", "AR", "PO", "INV", "OM", "CM", "LCM", "PDM", "CSH", "FA", "HCM", "PAY", "ABS", "REC" };

                foreach (var module in modules)
                {
                    var modulePath = Path.Combine(localRepoPath, $"docs/tracking/feature_validation/{module}_Feature_Validation.csv");
                    if (File.Exists(modulePath))
                    {
                        validations[module] = await ReadCsvFile(modulePath);
                        Log($"Loaded {validations[module].Count} features for module {module}");
                    }
                    else
                    {
                        Log($"WARNING: Module validation file not found: {modulePath}");
                        validations[module] = new List<Dictionary<string, string>>();
                    }
                }

                // Build the data object
                var data = new
                {
                    validationSummary,
                    pages,
                    tables,
                    validations
                };

                // Serialize to JSON
                string jsonData = Newtonsoft.Json.JsonConvert.SerializeObject(data);
                Log($"Serialized data to JSON ({jsonData.Length} characters)");

                // Inject into WebView2
                string script = $"window.CSHARP_DATA = {jsonData}; console.log('C# data injected successfully!');";
                await webView.CoreWebView2.ExecuteScriptAsync(script);
                Log("CSV data injected into WebView2 successfully!");
            }
            catch (Exception ex)
            {
                Log($"ERROR injecting CSV data: {ex.Message}");
                MessageBox.Show($"Error loading CSV data:\n\n{ex.Message}\n\n{ex.StackTrace}",
                    "Data Loading Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task<List<Dictionary<string, string>>> ReadCsvFile(string filePath)
        {
            var result = new List<Dictionary<string, string>>();

            if (!File.Exists(filePath))
            {
                Log($"CSV file not found: {filePath}");
                return result;
            }

            try
            {
                var lines = await File.ReadAllLinesAsync(filePath);
                if (lines.Length == 0) return result;

                // Parse header
                var headers = ParseCsvLine(lines[0]);

                // Parse data rows
                for (int i = 1; i < lines.Length; i++)
                {
                    var values = ParseCsvLine(lines[i]);
                    if (values.Count == 0) continue; // Skip empty lines

                    var row = new Dictionary<string, string>();
                    for (int j = 0; j < headers.Count && j < values.Count; j++)
                    {
                        row[headers[j]] = values[j];
                    }
                    result.Add(row);
                }

                return result;
            }
            catch (Exception ex)
            {
                Log($"Error reading CSV file {filePath}: {ex.Message}");
                return result;
            }
        }

        private List<string> ParseCsvLine(string line)
        {
            var result = new List<string>();
            var current = new System.Text.StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(current.ToString().Trim());
                    current.Clear();
                }
                else
                {
                    current.Append(c);
                }
            }

            result.Add(current.ToString().Trim());
            return result;
        }

        // ===== Event Handlers =====

        private void MenuButton_Click(object sender, RoutedEventArgs e)
        {
            menuPopup.IsOpen = true;
        }

        private async void OpenProjectManagement_Click(object sender, RoutedEventArgs e)
        {
            menuPopup.IsOpen = false;
            await CreateNewTab("📊 Project Management", "project-management");
        }

        private async void OpenModule_Click(object sender, RoutedEventArgs e)
        {
            if (sender is Button button && button.Tag is string moduleId)
            {
                menuPopup.IsOpen = false;

                string tabTitle = GetModuleTitle(moduleId);
                await CreateNewTab(tabTitle, moduleId);
            }
        }

        private string GetModuleTitle(string moduleId)
        {
            var titles = new Dictionary<string, string>
            {
                {"GL", "💰 General Ledger"},
                {"AP", "💸 Accounts Payable"},
                {"AR", "💵 Accounts Receivable"},
                {"PO", "🛒 Purchasing"},
                {"INV", "📦 Inventory"},
                {"OM", "📋 Order Management"},
                {"CSH", "💳 Cash Management"},
                {"FA", "🏢 Fixed Assets"},
                {"HCM", "👥 Human Capital"},
                {"PAY", "💼 Payroll"}
            };

            return titles.ContainsKey(moduleId) ? titles[moduleId] : moduleId;
        }

        private async void DownloadButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                localRepoPath = @"C:\javeed\Aiautopilot";
                projectManagementPath = Path.Combine(localRepoPath, "project-management");

                Directory.CreateDirectory(Path.GetDirectoryName(localRepoPath));
                await CloneOrUpdateRepository();

                if (!Directory.Exists(projectManagementPath))
                {
                    MessageBox.Show(
                        $"Downloaded successfully, but project-management folder not found.\n\n" +
                        $"Expected: {projectManagementPath}",
                        "Warning",
                        MessageBoxButton.OK,
                        MessageBoxImage.Warning);
                    return;
                }

                SetupModuleUrls();

                MessageBox.Show(
                    $"Successfully downloaded to:\n{localRepoPath}\n\n" +
                    "The application will now use this location for all updates.",
                    "Download Complete",
                    MessageBoxButton.OK,
                    MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error downloading from GitHub:\n\n{ex.Message}",
                    "Download Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
            }
        }

        private void DevToolsButton_Click(object sender, RoutedEventArgs e)
        {
            if (tabControl.SelectedItem is TabItem tabItem &&
                tabItem.Content is WebView2 webView &&
                webView.CoreWebView2 != null)
            {
                webView.CoreWebView2.OpenDevToolsWindow();
            }
        }

        private void TabControl_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            // Handle tab selection change if needed
        }

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Cleanup if needed
        }
    }
}
