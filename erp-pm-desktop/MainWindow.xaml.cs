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
                string appDataPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "ERPProjectManager"
                );
                Directory.CreateDirectory(appDataPath);

                localRepoPath = Path.Combine(appDataPath, "AIautopilot");
                projectManagementPath = Path.Combine(localRepoPath, "project-management");

                UpdateStatus("Initializing application...");

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

                webView.CoreWebView2.NavigationCompleted += async (s, e) =>
                {
                    if (e.IsSuccess)
                    {
                        UpdateStatus("Page loaded, injecting data...");
                        await InjectDataIntoPage();
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
                if (!File.Exists(indexPath))
                {
                    MessageBox.Show($"index.html not found at: {indexPath}",
                        "Missing Files", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                webView.CoreWebView2.Navigate(new Uri(indexPath).AbsoluteUri);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading data: {ex.Message}",
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

                await webView.CoreWebView2.ExecuteScriptAsync(script);

                UpdateStatus("Data injected successfully! Check DevTools (F12) for details.");
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

        private async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            UpdateStatus("Refreshing...");
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
