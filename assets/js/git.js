// Git Operations Module
window.GitOps = {
    config: {
        username: '',
        token: '',
        owner: '',
        repo: '',
        branch: 'main'
    },
    
    // GitHub API base URL
    apiBase: 'https://api.github.com',
    
    // Debug log storage
    debugLogs: [],
    
    // Add debug log entry
    addDebugLog: function(type, endpoint, request, response, error = null) {
        const log = {
            timestamp: new Date().toISOString(),
            type: type,
            endpoint: endpoint,
            request: request,
            response: response,
            error: error
        };
        this.debugLogs.push(log);
        // Keep only last 20 logs
        if (this.debugLogs.length > 20) {
            this.debugLogs.shift();
        }
        console.log('Git Debug Log:', log);
        return log;
    },
    
    // Initialize and load saved config
    init: function() {
        this.loadConfig();
        console.log("✅ Git Operations module loaded");
    },
    
    // Load configuration from localStorage
    loadConfig: function() {
        const saved = localStorage.getItem('git-config');
        if (saved) {
            try {
                this.config = JSON.parse(saved);
                this.populateForm();
            } catch (e) {
                console.error('Failed to load git config:', e);
            }
        }
    },
    
    // Save configuration to localStorage
    saveConfig: function(data) {
        this.config = {...this.config, ...data};
        if (document.getElementById('git-save-credentials')?.checked) {
            localStorage.setItem('git-config', JSON.stringify(this.config));
        }
    },
    
    // Clear saved configuration
    clearConfig: function() {
        this.config = {
            username: '',
            token: '',
            owner: '',
            repo: '',
            branch: 'main'
        };
        localStorage.removeItem('git-config');
        this.populateForm();
    },
    
    // Populate form fields with saved config
    populateForm: function() {
        document.getElementById('git-username').value = this.config.username || '';
        document.getElementById('git-token').value = this.config.token || '';
        document.getElementById('git-owner').value = this.config.owner || '';
        document.getElementById('git-repo').value = this.config.repo || '';
        document.getElementById('git-branch').value = this.config.branch || 'main';
    },
    
    // Get current config from form
    getFormConfig: function() {
        return {
            username: document.getElementById('git-username').value.trim(),
            token: document.getElementById('git-token').value.trim(),
            owner: document.getElementById('git-owner').value.trim(),
            repo: document.getElementById('git-repo').value.trim(),
            branch: document.getElementById('git-branch').value.trim() || 'main'
        };
    },
    
    // Validate configuration
    validateConfig: function(config) {
        const required = ['username', 'token', 'owner', 'repo'];
        for (let field of required) {
            if (!config[field]) {
                return { valid: false, message: `${field} is required` };
            }
        }
        return { valid: true };
    },
    
    // Make GitHub API request
    apiRequest: async function(endpoint, method = 'GET', body = null) {
        const config = this.config;
        const url = `${this.apiBase}${endpoint}`;
        
        const headers = {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'WMS-AutoPilot/4.1'
        };
        
        const options = {
            method,
            headers
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        // Log request details
        const requestLog = {
            method: method,
            url: url,
            headers: {
                ...headers,
                'Authorization': `Bearer ${config.token.substring(0, 10)}...` // Hide token in logs
            },
            body: body
        };
        
        try {
            const response = await fetch(url, options);
            
            let responseData = null;
            let responseText = '';
            
            try {
                responseText = await response.text();
                if (responseText) {
                    responseData = JSON.parse(responseText);
                }
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                responseData = { raw: responseText };
            }
            
            // Log response
            this.addDebugLog(
                response.ok ? 'SUCCESS' : 'ERROR',
                endpoint,
                requestLog,
                {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    data: responseData
                },
                response.ok ? null : responseData
            );
            
            if (!response.ok) {
                const errorMsg = responseData?.message || responseText || response.statusText;
                throw new Error(`GitHub API Error (${response.status}): ${errorMsg}`);
            }
            
            return responseData;
        } catch (error) {
            // Log error
            this.addDebugLog(
                'ERROR',
                endpoint,
                requestLog,
                null,
                error.message
            );
            throw error;
        }
    },
    
    // Test GitHub connection
    testConnection: async function() {
        try {
            const config = this.getFormConfig();
            const validation = this.validateConfig(config);
            
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            // Temporarily use form config for test
            const savedConfig = {...this.config};
            this.config = config;
            
            // Test by getting repository info
            const repo = await this.apiRequest(`/repos/${config.owner}/${config.repo}`);
            
            // Restore config
            this.config = savedConfig;
            
            return {
                success: true,
                message: `Successfully connected to ${repo.full_name}`,
                data: repo
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Get repository status
    getStatus: async function() {
        try {
            const repo = await this.apiRequest(`/repos/${this.config.owner}/${this.config.repo}`);
            const branches = await this.apiRequest(`/repos/${this.config.owner}/${this.config.repo}/branches`);
            const commits = await this.apiRequest(`/repos/${this.config.owner}/${this.config.repo}/commits?per_page=5`);
            
            return {
                success: true,
                data: {
                    repo,
                    branches,
                    commits
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Get file content from repository
    getFileContent: async function(path) {
        try {
            const response = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`
            );
            
            // Decode base64 content
            const content = atob(response.content);
            
            return {
                success: true,
                data: {
                    content,
                    sha: response.sha,
                    path: response.path
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Create or update a file
    updateFile: async function(path, content, message, sha = null) {
        try {
            const body = {
                message: message,
                content: btoa(unescape(encodeURIComponent(content))), // Encode to base64
                branch: this.config.branch
            };
            
            if (sha) {
                body.sha = sha;
            }
            
            const result = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/contents/${path}`,
                'PUT',
                body
            );
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Get list of files in directory
    listFiles: async function(path = '') {
        try {
            const contents = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/contents/${path}?ref=${this.config.branch}`
            );
            
            return {
                success: true,
                data: contents
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Get commit history
    getHistory: async function(limit = 20) {
        try {
            const commits = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/commits?per_page=${limit}&sha=${this.config.branch}`
            );
            
            return {
                success: true,
                data: commits
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },
    
    // Push multiple files
    pushFiles: async function(files, commitMessage) {
        try {
            console.log('📡 Starting GitHub push...');
            console.log(`   Files: ${files.length}`);
            console.log(`   Message: "${commitMessage}"`);
            console.log(`   Repo: ${this.config.owner}/${this.config.repo}`);
            console.log(`   Branch: ${this.config.branch}`);
            
            // Get the latest commit SHA
            console.log('  📡 Getting latest commit SHA...');
            const refResponse = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/git/ref/heads/${this.config.branch}`
            );
            const latestCommitSha = refResponse.object.sha;
            console.log(`  ✅ Latest commit: ${latestCommitSha.substring(0, 7)}`);
            
            // Get the tree SHA of the latest commit
            console.log('  📡 Getting tree SHA...');
            const commitResponse = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/git/commits/${latestCommitSha}`
            );
            const baseTreeSha = commitResponse.tree.sha;
            console.log(`  ✅ Base tree: ${baseTreeSha.substring(0, 7)}`);
            
            // Create blobs for each file
            console.log('  📡 Creating blobs...');
            const tree = [];
            for (const file of files) {
                try {
                    const blobResponse = await this.apiRequest(
                        `/repos/${this.config.owner}/${this.config.repo}/git/blobs`,
                        'POST',
                        {
                            content: btoa(unescape(encodeURIComponent(file.content))),
                            encoding: 'base64'
                        }
                    );
                    
                    tree.push({
                        path: file.path,
                        mode: '100644',
                        type: 'blob',
                        sha: blobResponse.sha
                    });
                    console.log(`  ✅ Blob created: ${file.path}`);
                } catch (error) {
                    console.error(`  ❌ Blob failed: ${file.path}`, error);
                    throw new Error(`Failed to create blob for ${file.path}: ${error.message}`);
                }
            }
            
            if (tree.length === 0) {
                throw new Error('No blobs were created');
            }
            
            // Create new tree
            console.log('  📡 Creating tree...');
            const treeResponse = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/git/trees`,
                'POST',
                {
                    base_tree: baseTreeSha,
                    tree: tree
                }
            );
            console.log(`  ✅ Tree created: ${treeResponse.sha.substring(0, 7)}`);
            
            // Create new commit
            console.log('  📡 Creating commit...');
            const newCommitResponse = await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/git/commits`,
                'POST',
                {
                    message: commitMessage,
                    tree: treeResponse.sha,
                    parents: [latestCommitSha]
                }
            );
            console.log(`  ✅ Commit created: ${newCommitResponse.sha.substring(0, 7)}`);
            
            // Update reference
            console.log('  📡 Updating branch reference...');
            await this.apiRequest(
                `/repos/${this.config.owner}/${this.config.repo}/git/refs/heads/${this.config.branch}`,
                'PATCH',
                {
                    sha: newCommitResponse.sha
                }
            );
            console.log('  ✅ Branch updated successfully!');
            
            return {
                success: true,
                message: 'Files pushed successfully',
                data: newCommitResponse
            };
        } catch (error) {
            console.error('❌ Push error:', error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    },
    
    // Get current project files to push
    getCurrentProjectFiles: function() {
        // This function collects all the current project files
        // In a real implementation, you would scan the actual file system
        // For now, we'll provide a way to select specific files
        
        const projectStructure = [
            'index.html',
            'assets/css/variables.css',
            'assets/css/base.css',
            'assets/css/components.css',
            'assets/css/layout.css',
            'assets/css/grid.css',
            'assets/js/config.js',
            'assets/js/storage.js',
            'assets/js/api.js',
            'assets/js/database.js',
            'assets/js/procedures.js',
            'assets/js/grid.js',
            'assets/js/reports.js',
            'assets/js/validators.js',
            'assets/js/theme.js',
            'assets/js/ui.js',
            'assets/js/git.js',
            'assets/js/main.js',
            'README.md'
        ];
        
        return projectStructure;
    }
};

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GitOps.init());
} else {
    GitOps.init();
}

console.log("✅ Git module loaded");
