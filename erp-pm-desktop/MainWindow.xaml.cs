using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using LibGit2Sharp;
using Newtonsoft.Json;

namespace ERPProjectManager
{
    public partial class MainWindow : Window
    {
        private string localRepoPath;
        private string projectManagementPath;
        private const string REPO_URL = "https://github.com/javeedin/AIautopilot.git";
        private const string BRANCH_NAME = "claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx";

        private bool dataInjected = false;
        private int navigationCount = 0;

        public MainWindow()
        {
            InitializeComponent();
            Closing += MainWindow_Closing;
            InitializeAsync();
        }

        private async void InitializeAsync()
        {
            try
            {
                // Check if user has downloaded to the fixed location
                string fixedPath = @"C:\javeed\Aiautopilot";
                string fixedProjectPath = Path.Combine(fixedPath, "project-management");

                if (Directory.Exists(fixedProjectPath))
                {
                    // Use the fixed path if it exists
                    localRepoPath = fixedPath;
                    projectManagementPath = fixedProjectPath;
                    UpdateStatus($"Using project from: {localRepoPath}");
                }
                else
                {
                    // Fallback to AppData location
                    string appDataPath = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                        "ERPProjectManager"
                    );
                    Directory.CreateDirectory(appDataPath);

                    localRepoPath = Path.Combine(appDataPath, "AIautopilot");
                    projectManagementPath = Path.Combine(localRepoPath, "project-management");
                    UpdateStatus("Initializing application...");
                }

                // Clone or pull repository FIRST
                await CloneOrUpdateRepository();

                if (!Directory.Exists(projectManagementPath))
                {
                    MessageBox.Show(
                        "Failed to clone repository or project-management folder not found.\n\n" +
                        $"Expected folder: {projectManagementPath}",
                        "Repository Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    return;
                }

                // Initialize WebView2
                await InitializeWebView();

                // Load CSV data in C#
                await LoadAndInjectData();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing application: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task InitializeWebView()
        {
            UpdateStatus("Initializing WebView2...");

            try
            {
                string cacheDir = Path.Combine(localRepoPath, "WebView2Cache");
                Directory.CreateDirectory(cacheDir);

                var env = await CoreWebView2Environment.CreateAsync(null, cacheDir, null);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;

                // Add ALL navigation event handlers for debugging
                webView.CoreWebView2.NavigationStarting += (s, e) =>
                {
                    UpdateStatus($"🔵 NavigationStarting: {e.Uri}");
                };

                webView.CoreWebView2.SourceChanged += (s, e) =>
                {
                    UpdateStatus($"🟢 SourceChanged: {webView.CoreWebView2.Source}");
                };

                webView.CoreWebView2.ContentLoading += (s, e) =>
                {
                    UpdateStatus($"🟡 ContentLoading started");
                };

                webView.CoreWebView2.DOMContentLoaded += (s, e) =>
                {
                    UpdateStatus($"🟠 DOMContentLoaded fired");
                };

                webView.CoreWebView2.NavigationCompleted += async (s, e) =>
                {
                    try
                    {
                        navigationCount++;
                        UpdateStatus($"✅ NavigationCompleted #{navigationCount} - Success: {e.IsSuccess}, HttpStatus: {e.HttpStatusCode}");

                        if (e.IsSuccess)
                        {
                            // Only inject data on the FIRST successful navigation
                            if (!dataInjected)
                            {
                                UpdateStatus($"Page loaded successfully (navigation #{navigationCount}), injecting data...");
                                await Task.Delay(100); // Small delay to ensure page is fully ready
                                await InjectDataIntoPage();
                                dataInjected = true;
                                UpdateStatus("Data injection complete! Dashboard should now be visible.");
                            }
                            else
                            {
                                UpdateStatus($"Navigation #{navigationCount} completed, but data already injected. Skipping re-injection.");
                            }
                        }
                        else
                        {
                            UpdateStatus($"Navigation #{navigationCount} failed with status: {e.HttpStatusCode}");
                            MessageBox.Show(
                                $"Navigation failed!\n\nSuccess: {e.IsSuccess}\nHTTP Status: {e.HttpStatusCode}",
                                "Navigation Error",
                                MessageBoxButton.OK,
                                MessageBoxImage.Warning);
                        }
                    }
                    catch (Exception ex)
                    {
                        UpdateStatus($"Error in NavigationCompleted #{navigationCount}: {ex.Message}");
                        MessageBox.Show(
                            $"Error in NavigationCompleted event:\n\n{ex.Message}\n\n{ex.StackTrace}",
                            "Navigation Error",
                            MessageBoxButton.OK,
                            MessageBoxImage.Error);
                    }
                };

                UpdateStatus("WebView2 initialized");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WebView2: {ex.Message}\n\n" +
                    "Download: https://go.microsoft.com/fwlink/p/?LinkId=2124703",
                    "WebView2 Error", MessageBoxButton.OK, MessageBoxImage.Error);
                throw;
            }
        }

        private async Task LoadAndInjectData()
        {
            try
            {
                UpdateStatus("Loading CSV data...");

                // Load the website first
                string indexPath = Path.Combine(projectManagementPath, "index.html");
                UpdateStatus($"Looking for index.html at: {indexPath}");

                if (!File.Exists(indexPath))
                {
                    MessageBox.Show($"index.html not found at: {indexPath}",
                        "Missing Files", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                UpdateStatus($"Found index.html, navigating...");

                if (webView?.CoreWebView2 == null)
                {
                    MessageBox.Show("WebView2 CoreWebView2 is NULL! Cannot navigate.",
                        "WebView2 Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                string fileUri = new Uri(indexPath).AbsoluteUri;
                UpdateStatus($"Navigating to: {fileUri}");

                webView.CoreWebView2.Navigate(fileUri);

                UpdateStatus("Navigate() called successfully, waiting for NavigationCompleted event...");
            }
            catch (Exception ex)
            {
                UpdateStatus($"ERROR in LoadAndInjectData: {ex.Message}");
                MessageBox.Show($"Error loading data: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task InjectDataIntoPage()
        {
            try
            {
                UpdateStatus("Reading CSV files...");

                // Read all CSV files
                var validationSummary = ReadCsvFile(Path.Combine(localRepoPath, "docs/tracking/Feature_Validation_Summary.csv"));
                var pages = ReadCsvFile(Path.Combine(localRepoPath, "docs/requirements/Application_Pages_Inventory.csv"));
                var tables = ReadCsvFile(Path.Combine(localRepoPath, "docs/requirements/Database_Tables_Master.csv"));

                // Read module validation files
                var validations = new Dictionary<string, List<Dictionary<string, string>>>();
                string[] modules = { "GL", "UR", "AP", "AR", "PO", "INV", "OM", "CM",
                                    "LCM", "PDM", "CSH", "FA", "HCM", "PAY", "ABS", "REC" };

                foreach (var module in modules)
                {
                    string modulePath = Path.Combine(localRepoPath,
                        $"docs/tracking/feature_validation/{module}_Feature_Validation.csv");
                    if (File.Exists(modulePath))
                    {
                        validations[module] = ReadCsvFile(modulePath);
                    }
                }

                // Create JSON data object
                var dataObject = new
                {
                    validationSummary,
                    pages,
                    tables,
                    validations
                };

                UpdateStatus($"Loaded {validationSummary.Count} summary records, {pages.Count} pages, {tables.Count} tables, {validations.Count} modules");

                string jsonData = JsonConvert.SerializeObject(dataObject);

                UpdateStatus("Injecting data into page...");

                // First, test if script execution works
                try
                {
                    await webView.CoreWebView2.ExecuteScriptAsync("console.log('C# SCRIPT EXECUTION TEST - If you see this, script execution works!');");
                    UpdateStatus("Script execution test passed");
                }
                catch (Exception testEx)
                {
                    MessageBox.Show($"Script execution test FAILED:\n\n{testEx.Message}",
                        "Script Execution Error", MessageBoxButton.OK, MessageBoxImage.Error);
                    return;
                }

                // Wait a bit for JavaScript to fully load
                await Task.Delay(500);

                // Inject into JavaScript
                string script = $@"
                    console.log('=== C# DATA INJECTION START ===');

                    // Set the data
                    window.CSHARP_DATA = {jsonData};

                    console.log('CSHARP_DATA injected successfully');
                    console.log('Validation Summary rows:', window.CSHARP_DATA.validationSummary.length);
                    console.log('Pages rows:', window.CSHARP_DATA.pages.length);
                    console.log('Tables rows:', window.CSHARP_DATA.tables.length);
                    console.log('Modules loaded:', Object.keys(window.CSHARP_DATA.validations));
                    console.log('Total features:', Object.values(window.CSHARP_DATA.validations).flat().length);

                    // Trigger data load if DataLoader is available
                    if (typeof DataLoader !== 'undefined' && typeof DataLoader.loadAllData === 'function') {{
                        console.log('Calling DataLoader.loadAllData()...');
                        DataLoader.loadAllData().then(function() {{
                            console.log('DataLoader.loadAllData() completed');

                            // Load the dashboard
                            if (typeof loadDashboard === 'function') {{
                                console.log('Calling loadDashboard()...');
                                loadDashboard();
                                console.log('loadDashboard() called');
                            }} else {{
                                console.error('loadDashboard function not found!');
                            }}
                        }});
                    }} else {{
                        console.error('DataLoader not available yet!');

                        // Try direct population as fallback
                        if (typeof DataStore !== 'undefined') {{
                            console.log('Populating DataStore directly...');
                            DataStore.validationSummary = window.CSHARP_DATA.validationSummary;
                            DataStore.pages = window.CSHARP_DATA.pages;
                            DataStore.tables = window.CSHARP_DATA.tables;
                            DataStore.validations = window.CSHARP_DATA.validations;
                            DataStore.loaded = true;
                            console.log('DataStore populated:', DataStore);

                            if (typeof loadDashboard === 'function') {{
                                console.log('Calling loadDashboard()...');
                                loadDashboard();
                            }}
                        }}
                    }}

                    console.log('=== C# DATA INJECTION END ===');
                ";

                // Execute the injection script
                try
                {
                    var result = await webView.CoreWebView2.ExecuteScriptAsync(script);
                    UpdateStatus($"Data injected successfully! Result: {result}");

                    // Log to console that injection completed
                    await webView.CoreWebView2.ExecuteScriptAsync(
                        "console.log('C#: Data injection script executed successfully');");
                }
                catch (Exception scriptEx)
                {
                    MessageBox.Show(
                        $"Failed to execute injection script:\n\n{scriptEx.Message}\n\n" +
                        $"JSON size: {jsonData.Length} characters\n\n" +
                        $"This might be due to JSON being too large for ExecuteScriptAsync.",
                        "Script Injection Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    throw;
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error injecting data: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
                UpdateStatus("Failed to inject data");
            }
        }

        private List<Dictionary<string, string>> ReadCsvFile(string filePath)
        {
            var result = new List<Dictionary<string, string>>();

            if (!File.Exists(filePath))
            {
                Console.WriteLine($"CSV file not found: {filePath}");
                return result;
            }

            try
            {
                var lines = File.ReadAllLines(filePath);
                if (lines.Length == 0) return result;

                // Parse header
                var headers = ParseCsvLine(lines[0]);

                // Parse data rows
                for (int i = 1; i < lines.Length; i++)
                {
                    if (string.IsNullOrWhiteSpace(lines[i])) continue;

                    var values = ParseCsvLine(lines[i]);
                    var row = new Dictionary<string, string>();

                    for (int j = 0; j < Math.Min(headers.Count, values.Count); j++)
                    {
                        row[headers[j]] = values[j];
                    }

                    result.Add(row);
                }

                Console.WriteLine($"Loaded {result.Count} rows from {Path.GetFileName(filePath)}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading CSV {filePath}: {ex.Message}");
            }

            return result;
        }

        private List<string> ParseCsvLine(string line)
        {
            var result = new List<string>();
            bool inQuotes = false;
            var currentField = new System.Text.StringBuilder();

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];

                if (c == '"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField.ToString());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }

            result.Add(currentField.ToString());
            return result;
        }

        private async Task CloneOrUpdateRepository()
        {
            await Task.Run(() =>
            {
                try
                {
                    if (Directory.Exists(localRepoPath) && Directory.Exists(Path.Combine(localRepoPath, ".git")))
                    {
                        Dispatcher.Invoke(() => UpdateStatus("Updating repository..."));
                        PullRepository();
                    }
                    else
                    {
                        Dispatcher.Invoke(() => UpdateStatus("Cloning repository..."));
                        CloneRepository();
                    }

                    Dispatcher.Invoke(() => UpdateStatus("Repository ready"));
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() =>
                    {
                        UpdateStatus($"Git error: {ex.Message}");
                        MessageBox.Show($"Git operation failed: {ex.Message}",
                            "Git Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                    });
                }
            });
        }

        private void CloneRepository()
        {
            var cloneOptions = new CloneOptions
            {
                BranchName = BRANCH_NAME,
                OnTransferProgress = (progress) =>
                {
                    double percentage = (100.0 * progress.ReceivedObjects) / progress.TotalObjects;
                    Dispatcher.Invoke(() => UpdateStatus(
                        $"Downloading: {percentage:F0}% ({progress.ReceivedObjects}/{progress.TotalObjects})"));
                    return true;
                }
            };

            Repository.Clone(REPO_URL, localRepoPath, cloneOptions);
        }

        private void PullRepository()
        {
            using (var repo = new Repository(localRepoPath))
            {
                var branch = repo.Branches[BRANCH_NAME];
                if (branch == null)
                {
                    var remote = repo.Network.Remotes["origin"];
                    var refSpecs = remote.FetchRefSpecs.Select(x => x.Specification);
                    Commands.Fetch(repo, remote.Name, refSpecs, null, "Fetching");

                    branch = repo.Branches[$"origin/{BRANCH_NAME}"];
                    if (branch != null)
                    {
                        repo.Branches.Add(BRANCH_NAME, branch.Tip);
                        branch = repo.Branches[BRANCH_NAME];
                    }
                }

                if (branch != null)
                {
                    Commands.Checkout(repo, branch);

                    var signature = new Signature("ERP PM App", "app@erp-pm.local", DateTimeOffset.Now);
                    var pullOptions = new PullOptions();
                    Commands.Pull(repo, signature, pullOptions);
                }
            }
        }

        private void UpdateStatus(string message)
        {
            statusText.Text = message;
            statusBar.Visibility = Visibility.Visible;
        }

        private async void DownloadButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Set fixed path
                localRepoPath = @"C:\javeed\Aiautopilot";
                projectManagementPath = Path.Combine(localRepoPath, "project-management");

                UpdateStatus($"Downloading to {localRepoPath}...");

                // Create directory if it doesn't exist
                Directory.CreateDirectory(Path.GetDirectoryName(localRepoPath));

                // Clone or update
                await CloneOrUpdateRepository();

                // Verify project-management folder exists
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

                // Reload the page with new data
                dataInjected = false; // Reset flag to allow re-injection
                navigationCount = 0; // Reset counter
                await LoadAndInjectData();

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
                UpdateStatus("Download failed");
            }
        }

        private async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            UpdateStatus("Refreshing...");
            dataInjected = false; // Reset flag to allow re-injection
            navigationCount = 0; // Reset counter
            await CloneOrUpdateRepository();
            await LoadAndInjectData();
        }

        private void ReloadButton_Click(object sender, RoutedEventArgs e)
        {
            if (webView?.CoreWebView2 != null)
            {
                webView.CoreWebView2.Reload();
            }
        }

        private void BackButton_Click(object sender, RoutedEventArgs e)
        {
            if (webView?.CoreWebView2 != null && webView.CoreWebView2.CanGoBack)
            {
                webView.CoreWebView2.GoBack();
            }
        }

        private void ForwardButton_Click(object sender, RoutedEventArgs e)
        {
            if (webView?.CoreWebView2 != null && webView.CoreWebView2.CanGoForward)
            {
                webView.CoreWebView2.GoForward();
            }
        }

        private async void HomeButton_Click(object sender, RoutedEventArgs e)
        {
            dataInjected = false; // Reset flag to allow re-injection
            navigationCount = 0; // Reset counter
            await LoadAndInjectData();
        }

        private void DevToolsButton_Click(object sender, RoutedEventArgs e)
        {
            if (webView?.CoreWebView2 != null)
            {
                webView.CoreWebView2.OpenDevToolsWindow();
            }
        }

        private void OpenFolderButton_Click(object sender, RoutedEventArgs e)
        {
            if (Directory.Exists(projectManagementPath))
            {
                System.Diagnostics.Process.Start("explorer.exe", projectManagementPath);
            }
        }

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Nothing to clean up anymore
        }
    }
}
