using System;
using System.IO;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using Microsoft.Web.WebView2.Core;
using LibGit2Sharp;

namespace ERPProjectManager
{
    /// <summary>
    /// ERP Project Management Desktop Application
    /// - Clones/Pulls from Git repository
    /// - Serves project-management website
    /// - Displays in WebView2
    /// </summary>
    public partial class MainWindow : Window
    {
        private string localRepoPath;
        private string projectManagementPath;
        private const string REPO_URL = "https://github.com/javeedin/AIautopilot.git"; // Change to your repo URL
        private const string BRANCH_NAME = "claude/erp-requirements-doc-011CUVadTJwLEN4PTi77Yxsx";

        public MainWindow()
        {
            InitializeComponent();
            InitializeAsync();
        }

        private async void InitializeAsync()
        {
            try
            {
                // Set up paths
                string appDataPath = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "ERPProjectManager"
                );
                Directory.CreateDirectory(appDataPath);

                localRepoPath = Path.Combine(appDataPath, "AIautopilot");
                projectManagementPath = Path.Combine(localRepoPath, "project-management");

                // Update status
                UpdateStatus("Initializing application...");

                // Initialize WebView2
                await InitializeWebView();

                // Clone or pull repository
                await CloneOrUpdateRepository();

                // Load the project management website
                LoadProjectManagementSite();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error initializing application: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private async Task InitializeWebView()
        {
            UpdateStatus("Initializing WebView2...");

            // Set up WebView2 environment
            var env = await CoreWebView2Environment.CreateAsync(null,
                Path.Combine(localRepoPath, "WebView2Cache"), null);

            await webView.EnsureCoreWebView2Async(env);

            // Enable Dev Tools (F12)
            webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
            webView.CoreWebView2.Settings.IsWebMessageEnabled = true;

            // Handle navigation events
            webView.CoreWebView2.NavigationStarting += (s, e) =>
            {
                UpdateStatus($"Loading: {e.Uri}");
            };

            webView.CoreWebView2.NavigationCompleted += (s, e) =>
            {
                if (e.IsSuccess)
                {
                    UpdateStatus("Ready");
                }
                else
                {
                    UpdateStatus($"Navigation failed: {e.WebErrorStatus}");
                }
            };

            UpdateStatus("WebView2 initialized");
        }

        private async Task CloneOrUpdateRepository()
        {
            await Task.Run(() =>
            {
                try
                {
                    if (Directory.Exists(localRepoPath) && Directory.Exists(Path.Combine(localRepoPath, ".git")))
                    {
                        // Repository exists, pull latest changes
                        Dispatcher.Invoke(() => UpdateStatus("Updating repository from Git..."));
                        PullRepository();
                    }
                    else
                    {
                        // Clone repository
                        Dispatcher.Invoke(() => UpdateStatus("Cloning repository from Git..."));
                        CloneRepository();
                    }

                    Dispatcher.Invoke(() => UpdateStatus("Repository ready"));
                }
                catch (Exception ex)
                {
                    Dispatcher.Invoke(() =>
                    {
                        UpdateStatus($"Git error: {ex.Message}");
                        MessageBox.Show($"Git operation failed: {ex.Message}\n\nPlease check your internet connection and repository URL.",
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
                OnProgress = (output) =>
                {
                    Dispatcher.Invoke(() => UpdateStatus($"Cloning: {output}"));
                    return true;
                },
                OnTransferProgress = (progress) =>
                {
                    double percentage = (100.0 * progress.ReceivedObjects) / progress.TotalObjects;
                    Dispatcher.Invoke(() => UpdateStatus($"Downloading: {percentage:F0}% ({progress.ReceivedObjects}/{progress.TotalObjects} objects)"));
                    return true;
                }
            };

            Repository.Clone(REPO_URL, localRepoPath, cloneOptions);
        }

        private void PullRepository()
        {
            using (var repo = new Repository(localRepoPath))
            {
                // Checkout the specific branch
                var branch = repo.Branches[BRANCH_NAME];
                if (branch == null)
                {
                    // Fetch the branch if it doesn't exist locally
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

                    // Pull latest changes
                    var signature = new Signature("ERP PM App", "app@erp-pm.local", DateTimeOffset.Now);
                    var pullOptions = new PullOptions
                    {
                        FetchOptions = new FetchOptions
                        {
                            OnProgress = (output) =>
                            {
                                Dispatcher.Invoke(() => UpdateStatus($"Fetching: {output}"));
                                return true;
                            }
                        }
                    };

                    Commands.Pull(repo, signature, pullOptions);
                }
            }
        }

        private void LoadProjectManagementSite()
        {
            try
            {
                // Check if project-management folder exists
                if (!Directory.Exists(projectManagementPath))
                {
                    MessageBox.Show("Project management website not found in repository.\n\n" +
                        "Please ensure the 'project-management' folder exists in the repository.",
                        "Missing Files", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // Load index.html
                string indexPath = Path.Combine(projectManagementPath, "index.html");
                if (!File.Exists(indexPath))
                {
                    MessageBox.Show("index.html not found in project-management folder.",
                        "Missing Files", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // Set virtual host mapping to allow loading local files with proper CORS
                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "erp-pm.local",
                    projectManagementPath,
                    CoreWebView2HostResourceAccessKind.Allow
                );

                // Navigate to the local site
                webView.CoreWebView2.Navigate("https://erp-pm.local/index.html");

                UpdateStatus("Loading project management website...");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading website: {ex.Message}", "Error",
                    MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void UpdateStatus(string message)
        {
            statusText.Text = message;
            statusBar.Visibility = Visibility.Visible;
        }

        // Button event handlers
        private async void RefreshButton_Click(object sender, RoutedEventArgs e)
        {
            UpdateStatus("Refreshing from Git...");
            await CloneOrUpdateRepository();
            LoadProjectManagementSite();
        }

        private void ReloadButton_Click(object sender, RoutedEventArgs e)
        {
            if (webView?.CoreWebView2 != null)
            {
                webView.CoreWebView2.Reload();
                UpdateStatus("Reloading page...");
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

        private void HomeButton_Click(object sender, RoutedEventArgs e)
        {
            LoadProjectManagementSite();
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
    }
}
