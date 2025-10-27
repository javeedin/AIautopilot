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
                    localRepoPath = fixedPath;
                    projectManagementPath = fixedProjectPath;
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
                }

                // Clone or pull repository
                await CloneOrUpdateRepository();

                if (!Directory.Exists(projectManagementPath))
                {
                    MessageBox.Show(
                        $"Failed to clone repository or project-management folder not found.\n\n" +
                        $"Expected folder: {projectManagementPath}",
                        "Repository Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    return;
                }

                // Setup module URLs
                SetupModuleUrls();

                // Open Project Management tab by default
                await CreateNewTab("📊 Project Management", "project-management");
            }
            catch (Exception ex)
            {
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
                // Create new WebView2
                var webView = new WebView2();

                // Create tab item
                var tabItem = new TabItem
                {
                    Header = tabTitle,
                    Content = webView
                };

                // Add to tab control
                tabControl.Items.Add(tabItem);
                tabControl.SelectedItem = tabItem;

                // Initialize WebView2
                string cacheDir = Path.Combine(localRepoPath, "WebView2Cache");
                await InitializeWebView(webView, cacheDir);

                // Navigate to URL
                if (moduleUrls.ContainsKey(moduleKey))
                {
                    string url = moduleUrls[moduleKey];
                    if (File.Exists(url))
                    {
                        MessageBox.Show($"Navigating to: {url}", "Debug Info", MessageBoxButton.OK, MessageBoxImage.Information);
                        webView.CoreWebView2.Navigate(new Uri(url).AbsoluteUri);
                    }
                    else
                    {
                        MessageBox.Show($"File not found:\n{url}", "File Missing", MessageBoxButton.OK, MessageBoxImage.Warning);
                    }
                }
                else
                {
                    MessageBox.Show($"Module key '{moduleKey}' not found in moduleUrls dictionary.\n\nAvailable keys: {string.Join(", ", moduleUrls.Keys)}",
                        "Module Key Error", MessageBoxButton.OK, MessageBoxImage.Warning);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error creating tab: {ex.Message}\n\n{ex.StackTrace}",
                    "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task InitializeWebView(WebView2 webView, string cacheDir)
        {
            try
            {
                await InitializeWebViewCore(webView, cacheDir);
            }
            catch (Exception ex)
            {
                // Try clearing cache and retry
                try
                {
                    if (Directory.Exists(cacheDir))
                    {
                        Directory.Delete(cacheDir, recursive: true);
                    }
                    await Task.Delay(500);
                    await InitializeWebViewCore(webView, cacheDir);
                }
                catch (Exception retryEx)
                {
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
            Directory.CreateDirectory(cacheDir);
            var env = await CoreWebView2Environment.CreateAsync(null, cacheDir, null);
            await webView.EnsureCoreWebView2Async(env);

            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
        }

        private async Task CloneOrUpdateRepository()
        {
            try
            {
                if (!Directory.Exists(localRepoPath))
                {
                    Repository.Clone(REPO_URL, localRepoPath, new CloneOptions
                    {
                        BranchName = BRANCH_NAME,
                        Checkout = true
                    });
                }
                else if (Directory.Exists(Path.Combine(localRepoPath, ".git")))
                {
                    using (var repo = new Repository(localRepoPath))
                    {
                        var remote = repo.Network.Remotes["origin"];
                        var refSpecs = remote.FetchRefSpecs.Select(x => x.Specification);
                        Commands.Fetch(repo, remote.Name, refSpecs, null, null);

                        var branch = repo.Branches[BRANCH_NAME];
                        if (branch != null)
                        {
                            Commands.Checkout(repo, branch);
                            var signature = new Signature("ERP Manager", "erp@local.com", DateTimeOffset.Now);
                            repo.Reset(ResetMode.Hard, branch.Tip);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Git operation failed: {ex.Message}",
                    "Git Error", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
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
