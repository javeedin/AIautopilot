using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using Microsoft.Web.WebView2.Core;
using LibGit2Sharp;

namespace ERPProjectManager
{
    /// <summary>
    /// ERP Project Management Desktop Application
    /// - Clones/Pulls from Git repository
    /// - Runs local HTTP server
    /// - Displays in WebView2
    /// </summary>
    public partial class MainWindow : Window
    {
        private string localRepoPath;
        private string projectManagementPath;
        private HttpListener httpListener;
        private Thread serverThread;
        private const int HTTP_PORT = 8765;
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

                // Clone or pull repository FIRST
                await CloneOrUpdateRepository();

                // Check if repository was cloned successfully
                if (!Directory.Exists(projectManagementPath))
                {
                    MessageBox.Show(
                        "Failed to clone repository or project-management folder not found.\n\n" +
                        "Please check:\n" +
                        "1. Internet connection\n" +
                        "2. Repository URL is correct\n" +
                        "3. Branch exists in repository\n\n" +
                        $"Expected folder: {projectManagementPath}",
                        "Repository Error",
                        MessageBoxButton.OK,
                        MessageBoxImage.Error);
                    return;
                }

                // Initialize WebView2 AFTER repository is ready
                await InitializeWebView();

                // Start HTTP server
                StartHttpServer();

                // Load the project management website
                LoadProjectManagementSite();
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
                // Create WebView2 cache directory
                string cacheDir = Path.Combine(localRepoPath, "WebView2Cache");
                Directory.CreateDirectory(cacheDir);

                // Set up WebView2 environment with user data folder
                var env = await CoreWebView2Environment.CreateAsync(
                    browserExecutableFolder: null,
                    userDataFolder: cacheDir,
                    options: null);

                await webView.EnsureCoreWebView2Async(env);

                // Enable Dev Tools (F12)
                webView.CoreWebView2.Settings.AreDevToolsEnabled = true;
                webView.CoreWebView2.Settings.IsWebMessageEnabled = true;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;

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
                        MessageBox.Show(
                            $"Failed to load page: {e.WebErrorStatus}\n\n" +
                            "Click DevTools button to see errors.",
                            "Navigation Error",
                            MessageBoxButton.OK,
                            MessageBoxImage.Warning);
                    }
                };

                // Handle console messages for debugging
                webView.CoreWebView2.WebMessageReceived += (s, e) =>
                {
                    Console.WriteLine($"WebView Message: {e.WebMessageAsJson}");
                };

                UpdateStatus("WebView2 initialized");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to initialize WebView2: {ex.Message}\n\n" +
                    "Please install WebView2 Runtime from:\n" +
                    "https://developer.microsoft.com/microsoft-edge/webview2/\n\n" +
                    "Download: https://go.microsoft.com/fwlink/p/?LinkId=2124703",
                    "WebView2 Error", MessageBoxButton.OK, MessageBoxImage.Error);
                throw;
            }
        }

        private void StartHttpServer()
        {
            try
            {
                UpdateStatus($"Starting HTTP server on port {HTTP_PORT}...");

                httpListener = new HttpListener();
                httpListener.Prefixes.Add($"http://localhost:{HTTP_PORT}/");
                httpListener.Start();

                serverThread = new Thread(HandleRequests)
                {
                    IsBackground = true,
                    Name = "HTTP Server Thread"
                };
                serverThread.Start();

                UpdateStatus($"HTTP server running on http://localhost:{HTTP_PORT}");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Failed to start HTTP server: {ex.Message}\n\n" +
                    $"Port {HTTP_PORT} may be in use. Try closing other applications.",
                    "Server Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void HandleRequests()
        {
            while (httpListener != null && httpListener.IsListening)
            {
                try
                {
                    var context = httpListener.GetContext();
                    ThreadPool.QueueUserWorkItem(_ => ProcessRequest(context));
                }
                catch (Exception ex)
                {
                    if (httpListener != null && httpListener.IsListening)
                    {
                        Console.WriteLine($"Server error: {ex.Message}");
                    }
                }
            }
        }

        private void ProcessRequest(HttpListenerContext context)
        {
            try
            {
                var request = context.Request;
                var response = context.Response;

                // Get the requested path
                string requestedPath = request.Url.AbsolutePath.TrimStart('/');

                // Default to index.html
                if (string.IsNullOrEmpty(requestedPath))
                {
                    requestedPath = "index.html";
                }

                // Resolve file path
                string filePath;

                // Handle paths starting with docs/ - go to repository root
                if (requestedPath.StartsWith("docs/"))
                {
                    filePath = Path.Combine(localRepoPath, requestedPath);
                }
                else
                {
                    // Everything else is in project-management folder
                    filePath = Path.Combine(projectManagementPath, requestedPath);
                }

                // Normalize the path
                filePath = Path.GetFullPath(filePath);

                // Security check - ensure we're not accessing files outside our directories
                if (!filePath.StartsWith(localRepoPath))
                {
                    response.StatusCode = 403;
                    response.Close();
                    return;
                }

                if (File.Exists(filePath))
                {
                    // Set content type
                    string extension = Path.GetExtension(filePath).ToLowerInvariant();
                    response.ContentType = GetContentType(extension);

                    // Enable CORS
                    response.Headers.Add("Access-Control-Allow-Origin", "*");
                    response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                    response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");

                    // Read and send file
                    byte[] fileBytes = File.ReadAllBytes(filePath);
                    response.ContentLength64 = fileBytes.Length;
                    response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                    response.StatusCode = 200;

                    Dispatcher.Invoke(() => UpdateStatus($"Served: {requestedPath}"));
                }
                else
                {
                    // File not found
                    response.StatusCode = 404;
                    byte[] errorBytes = System.Text.Encoding.UTF8.GetBytes($"File not found: {requestedPath}");
                    response.ContentLength64 = errorBytes.Length;
                    response.OutputStream.Write(errorBytes, 0, errorBytes.Length);

                    Console.WriteLine($"404 Not Found: {filePath}");
                }

                response.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Request processing error: {ex.Message}");
                try
                {
                    context.Response.StatusCode = 500;
                    context.Response.Close();
                }
                catch { }
            }
        }

        private string GetContentType(string extension)
        {
            return extension switch
            {
                ".html" => "text/html",
                ".htm" => "text/html",
                ".css" => "text/css",
                ".js" => "application/javascript",
                ".json" => "application/json",
                ".png" => "image/png",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".gif" => "image/gif",
                ".svg" => "image/svg+xml",
                ".ico" => "image/x-icon",
                ".csv" => "text/csv",
                ".txt" => "text/plain",
                ".xml" => "text/xml",
                ".pdf" => "application/pdf",
                ".woff" => "font/woff",
                ".woff2" => "font/woff2",
                ".ttf" => "font/ttf",
                ".eot" => "application/vnd.ms-fontobject",
                _ => "application/octet-stream"
            };
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
                        MessageBox.Show($"Git operation failed: {ex.Message}\n\n" +
                            "Please check your internet connection and repository URL.\n\n" +
                            "You can continue using cached data if available.",
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
                    Dispatcher.Invoke(() => UpdateStatus(
                        $"Downloading: {percentage:F0}% ({progress.ReceivedObjects}/{progress.TotalObjects} objects)"));
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
                    MessageBox.Show(
                        "Project management website not found in repository.\n\n" +
                        $"Expected path:\n{projectManagementPath}\n\n" +
                        "Please click 'Update from Git' button to download the repository.",
                        "Missing Files",
                        MessageBoxButton.OK,
                        MessageBoxImage.Warning);
                    return;
                }

                // Check if index.html exists
                string indexPath = Path.Combine(projectManagementPath, "index.html");
                if (!File.Exists(indexPath))
                {
                    MessageBox.Show(
                        $"index.html not found!\n\n" +
                        $"Expected at: {indexPath}\n\n" +
                        "Please click 'Update from Git' button to download.",
                        "Missing Files",
                        MessageBoxButton.OK,
                        MessageBoxImage.Warning);
                    return;
                }

                // Check if WebView2 is initialized
                if (webView?.CoreWebView2 == null)
                {
                    MessageBox.Show(
                        "WebView2 not initialized yet.\n\n" +
                        "Please wait for initialization to complete.",
                        "Not Ready",
                        MessageBoxButton.OK,
                        MessageBoxImage.Warning);
                    return;
                }

                // Load index.html from HTTP server
                string url = $"http://localhost:{HTTP_PORT}/index.html";
                webView.CoreWebView2.Navigate(url);

                UpdateStatus("Loading project management website...");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Error loading website: {ex.Message}\n\n{ex.StackTrace}",
                    "Error",
                    MessageBoxButton.OK,
                    MessageBoxImage.Error);
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

        private void MainWindow_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            // Stop HTTP server
            try
            {
                if (httpListener != null && httpListener.IsListening)
                {
                    httpListener.Stop();
                    httpListener.Close();
                }
            }
            catch { }
        }
    }
}
