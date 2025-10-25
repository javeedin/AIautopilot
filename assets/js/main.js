// ==================== GLOBAL VARIABLES ====================
        let wmsData = null;
        let isLoading = false;
        let lastUserPrompt = '';
        let availableDataSources = [];
        let selectedDataSources = [];
        let loadedDataSources = {}; // Stores loaded data by source
        let aiSelectedSources = []; // Sources selected for AI prompting
        let currentSessionId = null;
        let currentTheme = 'light';
        let conversationsCache = [];
        let showFavoritesOnly = false;
        let dataGrids = {}; // Store DevExpress grid instances

        // ==================== PROMPT LEARNING SYSTEM ====================
        let promptLearningDB = {
            prompts: [],          // All stored prompts
            feedback: {},         // User feedback by prompt ID
            patterns: {},         // Learned patterns
            suggestions: [],      // Cached suggestions
            analytics: {
                totalQueries: 0,
                successfulQueries: 0,
                avgResponseTime: 0,
                queryTypes: {},
                commonQueries: []
            }
        };
        
        let currentPromptId = null; // Track current prompt for feedback

        const DEFAULT_DATASOURCE_ENDPOINT = 'https://g09254cbbf8e7af-graysprod.adb.eu-frankfurt-1.oraclecloudapps.com/ords/WKSP_GRAYSAPP/WAREHOUSEMANAGEMENT/AUTOPILOTDATA';

        window.pendingRequests = window.pendingRequests || {};

        // ==================== DYNAMIC PARAMETER MANAGEMENT ====================
        /**
         * Get parameter definitions from selected data sources
         * This replaces the hardcoded DEFAULT_PARAMS approach
         */
        function getDataSourceParameters() {
            const paramMap = new Map();
            
            // Collect all unique parameters from selected data sources
            selectedDataSources.forEach(source => {
                const params = source.parameters || source.PARAMETERS;
                
                if (params && Array.isArray(params)) {
                    params.forEach(param => {
                        const paramName = param.name || param.NAME || param.parameter_name || param.PARAMETER_NAME;
                        if (paramName && !paramMap.has(paramName)) {
                            paramMap.set(paramName, {
                                name: paramName,
                                type: param.type || param.TYPE || 'string',
                                required: param.required || param.REQUIRED || false,
                                defaultValue: param.default_value || param.DEFAULT_VALUE || getDefaultValueByType(param.type || param.TYPE),
                                label: param.label || param.LABEL || formatParameterLabel(paramName),
                                placeholder: param.placeholder || param.PLACEHOLDER || '',
                                description: param.description || param.DESCRIPTION || '',
                                options: param.options || param.OPTIONS || []
                            });
                        }
                    });
                }
            });
            
            return Array.from(paramMap.values());
        }

        /**
         * Get default value based on parameter type
         */
        function getDefaultValueByType(type) {
            const typeUpper = (type || '').toUpperCase();
            
            switch(typeUpper) {
                case 'DATE':
                case 'DATE_FROM':
                    return getDefaultDateFrom();
                case 'DATE_TO':
                    return getDefaultDateTo();
                case 'INSTANCE':
                case 'INSTANCE_NAME':
                    return 'PROD';
                case 'NUMBER':
                case 'INTEGER':
                    return '0';
                case 'BOOLEAN':
                    return 'false';
                default:
                    return '';
            }
        }

        /**
         * Format parameter name to readable label
         */
        function formatParameterLabel(paramName) {
            return paramName
                .replace(/^P_/, '')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');
        }

        /**
         * Get stored parameters for all data sources
         */
        function getStoredParams() {
            const stored = localStorage.getItem('data_source_params');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing stored parameters:', e);
                }
            }
            
            // Return default parameters based on selected data sources
            const params = {};
            const paramDefs = getDataSourceParameters();
            paramDefs.forEach(param => {
                params[param.name] = param.defaultValue;
            });
            return params;
        }

        /**
         * Save parameters to localStorage
         */
        function saveParams(params) {
            localStorage.setItem('data_source_params', JSON.stringify(params));
        }

        /**
         * Date formatting functions
         */
        function getDefaultDateFrom() {
            const date = new Date();
            date.setDate(date.getDate() - 10);
            return formatDateForAPI(date);
        }

        function getDefaultDateTo() {
            return formatDateForAPI(new Date());
        }

        function formatDateForAPI(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
		// ==================== THEME MANAGEMENT ====================
        function initTheme() {
            const savedTheme = localStorage.getItem('theme') || 'light';
            setTheme(savedTheme);
        }

        function setTheme(theme) {
            currentTheme = theme;
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            
            const icon = document.querySelector('.theme-toggle-slider i');
            if (theme === 'dark') {
                icon.className = 'fas fa-moon';
            } else {
                icon.className = 'fas fa-sun';
            }
        }

        function toggleTheme() {
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            setTheme(newTheme);
        }

        // ==================== ENDPOINT CONFIGURATION ====================
        function getDefaultEndpoints() {
            return {
                sessions: { get: '', post: '', put: '', delete: '' },
                messages: { get: '', post: '' },
                search: { get: '' },
                datasources: { get: DEFAULT_DATASOURCE_ENDPOINT }
            };
        }

        function loadEndpointConfig() {
            const saved = localStorage.getItem('endpoint_config');
            return saved ? JSON.parse(saved) : getDefaultEndpoints();
        }

        function saveEndpointConfig(category) {
            const config = loadEndpointConfig();
            
            if (category === 'sessions') {
                config.sessions.get = document.getElementById('endpoint-sessions-get').value;
                config.sessions.post = document.getElementById('endpoint-sessions-post').value;
                config.sessions.put = document.getElementById('endpoint-sessions-put').value;
                config.sessions.delete = document.getElementById('endpoint-sessions-delete').value;
            } else if (category === 'messages') {
                config.messages.get = document.getElementById('endpoint-messages-get').value;
                config.messages.post = document.getElementById('endpoint-messages-post').value;
            } else if (category === 'search') {
                config.search.get = document.getElementById('endpoint-search-get').value;
            } else if (category === 'datasources') {
                config.datasources.get = document.getElementById('endpoint-datasources-get').value;
            }
            
            localStorage.setItem('endpoint_config', JSON.stringify(config));
            showNotification('✅ Configuration saved successfully!', 'success');
        }

        function loadEndpointConfigToForm() {
            const config = loadEndpointConfig();
            
            document.getElementById('endpoint-sessions-get').value = config.sessions.get || '';
            document.getElementById('endpoint-sessions-post').value = config.sessions.post || '';
            document.getElementById('endpoint-sessions-put').value = config.sessions.put || '';
            document.getElementById('endpoint-sessions-delete').value = config.sessions.delete || '';
            
            document.getElementById('endpoint-messages-get').value = config.messages.get || '';
            document.getElementById('endpoint-messages-post').value = config.messages.post || '';
            
            document.getElementById('endpoint-search-get').value = config.search.get || '';
            
            document.getElementById('endpoint-datasources-get').value = config.datasources.get || DEFAULT_DATASOURCE_ENDPOINT;
        }

        // ==================== TEST ENDPOINTS ====================
        function getSampleJSON(category, method) {
            const samples = {
                sessions: {
                    post: {
                        sessionName: 'Test Session - ' + new Date().toLocaleString(),
                        userId: 'test_user',
                        dataSources: JSON.stringify([{ id: 1, name: 'Trip Performance' }])
                    }
                },
                messages: {
                    post: {
                        sessionId: 1,
                        role: 'user',
                        content: 'This is a test message',
                        messageType: 'text',
                        tokensUsed: 15,
                        executionTime: 1250,
                        hasChart: 'N'
                    }
                }
            };
            
            return samples[category]?.[method] || {};
        }

        async function testEndpoint(category, method) {
            const resultDiv = document.getElementById(`test-result-${category}`);
            resultDiv.style.display = 'block';
            resultDiv.className = 'test-result';
            resultDiv.innerHTML = '<div class="spinner"></div> Testing...';
            
            try {
                let endpoint = '';
                let requestData = null;
                
                if (category === 'sessions') {
                    if (method === 'get') {
                        endpoint = document.getElementById('endpoint-sessions-get').value;
                    } else if (method === 'post') {
                        endpoint = document.getElementById('endpoint-sessions-post').value;
                        requestData = getSampleJSON('sessions', 'post');
                    }
                } else if (category === 'messages') {
                    if (method === 'get') {
                        endpoint = document.getElementById('endpoint-messages-get').value;
                        endpoint = endpoint.replace(':id', '1');
                    } else if (method === 'post') {
                        endpoint = document.getElementById('endpoint-messages-post').value;
                        requestData = getSampleJSON('messages', 'post');
                    }
                } else if (category === 'search') {
                    endpoint = document.getElementById('endpoint-search-get').value;
                    const searchTerm = document.getElementById('test-search-term').value || 'test';
                    endpoint += `?q=${encodeURIComponent(searchTerm)}`;
                } else if (category === 'datasources') {
                    endpoint = document.getElementById('endpoint-datasources-get').value;
                }
                
                if (!endpoint) {
                    throw new Error('Endpoint URL is required');
                }
                
                const requestId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                window.pendingRequests[requestId] = function(error, data) {
                    if (error) {
                        resultDiv.className = 'test-result error';
                        resultDiv.innerHTML = `<strong>❌ Error:</strong><pre>${error}</pre>`;
                    } else {
                        try {
                            const parsed = JSON.parse(data);
                            resultDiv.className = 'test-result success';
                            resultDiv.innerHTML = `<strong>✅ Success:</strong><pre>${JSON.stringify(parsed, null, 2)}</pre>`;
                        } catch (e) {
                            resultDiv.className = 'test-result success';
                            resultDiv.innerHTML = `<strong>✅ Response:</strong><pre>${data}</pre>`;
                        }
                    }
                };
                
                const message = {
                    action: method === 'get' ? 'executeGet' : 'executePost',
                    requestId: requestId,
                    fullUrl: endpoint,
                    body: requestData ? JSON.stringify(requestData) : null
                };
                
                if (window.chrome?.webview) {
                    window.chrome.webview.postMessage(message);
                } else {
                    throw new Error('WebView2 not available');
                }
                
            } catch (error) {
                resultDiv.className = 'test-result error';
                resultDiv.innerHTML = `<strong>❌ Error:</strong><pre>${error.message}</pre>`;
            }
        }

        // ==================== NOTIFICATION SYSTEM ====================
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `status-indicator status-${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // ==================== TAB SWITCHING ====================
        function initTabs() {
            const tabs = document.querySelectorAll('.tab');
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    tabs.forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                    
                    tab.classList.add('active');
                    const tabId = tab.getAttribute('data-tab');
                    document.getElementById(`tab-${tabId}`).classList.add('active');
                });
            });
        }

        // ==================== DATA SOURCES WITH PARAMETERS ====================
        async function loadDataSources() {
            const config = loadEndpointConfig();
            const endpoint = config.datasources.get;
            
            if (!endpoint) {
                showNotification('⚠️ Please configure Data Sources endpoint first', 'error');
                document.getElementById('setupModal').classList.add('show');
                return;
            }
            
            const loadingMsg = document.getElementById('dataSourcesLoadingMsg');
            const errorMsg = document.getElementById('dataSourcesErrorMsg');
            const grid = document.getElementById('dataSourcesGrid');

            loadingMsg.style.display = 'block';
            errorMsg.style.display = 'none';
            grid.innerHTML = '';

            const requestId = 'datasources_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                loadingMsg.style.display = 'none';
                
                if (error) {
                    errorMsg.style.display = 'block';
                    errorMsg.textContent = `Failed to load data sources: ${error}`;
                } else {
                    try {
                        let apiData = JSON.parse(data);
                        
                        if (apiData.items && Array.isArray(apiData.items)) {
                            availableDataSources = apiData.items;
                        } else if (Array.isArray(apiData)) {
                            availableDataSources = apiData;
                        } else {
                            throw new Error('Invalid data format');
                        }
                        
                        renderDataSources();
                    } catch (e) {
                        errorMsg.style.display = 'block';
                        errorMsg.textContent = `Error parsing data: ${e.message}`;
                    }
                }
            };
            
            const message = {
                action: 'executeGet',
                requestId: requestId,
                fullUrl: endpoint
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            } else {
                loadingMsg.style.display = 'none';
                errorMsg.style.display = 'block';
                errorMsg.textContent = 'WebView2 not available';
            }
        }

        function renderDataSources() {
            const grid = document.getElementById('dataSourcesGrid');
            grid.innerHTML = '';

            if (availableDataSources.length === 0) {
                grid.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); grid-column: 1/-1;">No data sources available</p>';
                return;
            }

            availableDataSources.forEach(source => {
                const card = document.createElement('div');
                card.style.cssText = `
                    background: var(--card-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    padding: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                `;
                
                const sourceId = source.source_id || source.id || source.SOURCE_ID;
                const sourceName = source.source_name || source.name || source.SOURCE_NAME;
                const sourceDesc = source.source_description || source.description || source.SOURCE_DESCRIPTION || 'No description';
                const sourceType = source.source_type || source.type || source.SOURCE_TYPE;
                
                card.dataset.sourceId = sourceId;
                
                const iconClass = getIconForType(sourceType);
                
                card.innerHTML = `
                    <div style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); display: flex; align-items: center; justify-content: center; margin-bottom: 0.65rem; font-size: 1.1rem; color: white;">
                        <i class="${iconClass}"></i>
                    </div>
                    <div style="color: var(--text-primary); font-size: 0.85rem; font-weight: 700; margin-bottom: 0.4rem;">${sourceName}</div>
                    <div style="color: var(--text-tertiary); font-size: 0.7rem; line-height: 1.3; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${sourceDesc}</div>
                    <span style="display: inline-block; background: rgba(99, 102, 241, 0.2); color: var(--primary-light); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.65rem; font-weight: 600; text-transform: uppercase;">${sourceType}</span>
                `;
                
                card.addEventListener('click', () => toggleDataSource(source, card));
                card.addEventListener('mouseenter', () => {
                    card.style.borderColor = 'var(--primary)';
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                });
                card.addEventListener('mouseleave', () => {
                    if (!card.classList.contains('selected')) {
                        card.style.borderColor = 'var(--border-color)';
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'none';
                    }
                });
                
                grid.appendChild(card);
            });
        }

        function getIconForType(type) {
            const typeUpper = (type || '').toUpperCase();
            const icons = {
                'TRIPS': 'fas fa-truck',
                'INVENTORY': 'fas fa-boxes',
                'ORDERS': 'fas fa-shopping-cart',
                'PICKERS': 'fas fa-users',
                'LOCATIONS': 'fas fa-map-marker-alt',
                'PERFORMANCE': 'fas fa-chart-line',
                'WAREHOUSE': 'fas fa-warehouse'
            };
            return icons[typeUpper] || 'fas fa-database';
        }

        function toggleDataSource(source, card) {
            const sourceId = source.source_id || source.id || source.SOURCE_ID;
            const index = selectedDataSources.findIndex(s => (s.source_id || s.id || s.SOURCE_ID) === sourceId);
            
            if (index > -1) {
                selectedDataSources.splice(index, 1);
                card.classList.remove('selected');
                card.style.borderColor = 'var(--border-color)';
                card.style.background = 'var(--card-bg)';
            } else {
                selectedDataSources.push(source);
                card.classList.add('selected');
                card.style.borderColor = 'var(--secondary)';
                card.style.background = 'rgba(16, 185, 129, 0.1)';
            }
            
            updateSelectedCount();
        }

        function updateSelectedCount() {
            document.getElementById('selectedSourcesCount').textContent = selectedDataSources.length;
            document.getElementById('loadDataBtn').disabled = selectedDataSources.length === 0;
        }

        async function loadSelectedData() {
            if (selectedDataSources.length === 0) {
                alert('Please select at least one data source');
                return;
            }

            // Check if any selected data source has parameters defined
            const paramDefs = getDataSourceParameters();
            
            // If parameters are defined, show the modal with those parameters
            if (paramDefs.length > 0) {
                showParameterModal();
            } else {
                // Always show default parameters for any data source
                // This ensures users can provide parameters for any API endpoint
                showParameterModalWithDefaults();
            }
        }
        
        function showParameterModalWithDefaults() {
            const modal = document.getElementById('dataSourceParamsModal');
            const paramsList = document.getElementById('parametersList');
            const sourceName = selectedDataSources.map(s => s.source_name || s.name || s.SOURCE_NAME).join(', ');
            
            document.getElementById('paramSourceName').textContent = sourceName;
            
            // Show default parameter info
            const infoHTML = `
                <div style="background: rgba(99, 102, 241, 0.1); border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.85rem;">
                    <strong style="color: var(--primary);"><i class="fas fa-info-circle"></i> Default Parameters</strong><br>
                    These are standard parameters for data retrieval.
                </div>
            `;
            
            // Get stored params or use defaults
            const storedParams = getStoredParamsWithDefaults();
            
            // Build default parameter inputs
            paramsList.innerHTML = infoHTML + `
                <div class="form-group">
                    <label>Instance Name <span style="color: var(--danger);">*</span></label>
                    <input type="text" id="param_P_INSTANCE_NAME" class="form-control" 
                           value="${storedParams.P_INSTANCE_NAME || 'PROD'}" 
                           placeholder="e.g., PROD, UAT, DEV">
                    <small class="text-muted">The environment instance to query</small>
                </div>
                
                <div class="form-group">
                    <label>Date From (DD-MM-YYYY) <span style="color: var(--danger);">*</span></label>
                    <input type="text" id="param_P_DATE_FROM" class="form-control" 
                           value="${storedParams.P_DATE_FROM || getDefaultDateFrom()}" 
                           placeholder="DD-MM-YYYY">
                    <small class="text-muted">Start date for the data range</small>
                </div>
                
                <div class="form-group">
                    <label>Date To (DD-MM-YYYY) <span style="color: var(--danger);">*</span></label>
                    <input type="text" id="param_P_DATE_TO" class="form-control" 
                           value="${storedParams.P_DATE_TO || getDefaultDateTo()}" 
                           placeholder="DD-MM-YYYY">
                    <small class="text-muted">End date for the data range</small>
                </div>
            `;
            
            modal.classList.add('show');
            document.getElementById('dataSourcesModal').classList.remove('show');
        }
        
        function getStoredParamsWithDefaults() {
            const stored = localStorage.getItem('data_source_params');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    console.error('Error parsing stored parameters:', e);
                }
            }
            
            // Return defaults
            return {
                P_INSTANCE_NAME: 'PROD',
                P_DATE_FROM: getDefaultDateFrom(),
                P_DATE_TO: getDefaultDateTo()
            };
        }

        function showParameterModal() {
            const modal = document.getElementById('dataSourceParamsModal');
            const paramsList = document.getElementById('parametersList');
            const sourceName = selectedDataSources.map(s => s.source_name || s.name || s.SOURCE_NAME).join(', ');
            
            document.getElementById('paramSourceName').textContent = sourceName;
            
            // Get parameter definitions from selected data sources
            const paramDefs = getDataSourceParameters();
            
            if (paramDefs.length === 0) {
                paramsList.innerHTML = '<p class="text-muted">No parameters required for selected data sources.</p>';
                modal.classList.add('show');
                document.getElementById('dataSourcesModal').classList.remove('show');
                return;
            }
            
            // Load stored or default parameters
            const storedParams = getStoredParams();
            
            // Show parameter info
            const requiredCount = paramDefs.filter(p => p.required).length;
            const infoHTML = `
                <div style="background: rgba(99, 102, 241, 0.1); border-left: 3px solid var(--primary); padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; font-size: 0.85rem;">
                    <strong style="color: var(--primary);"><i class="fas fa-info-circle"></i> Parameter Information</strong><br>
                    Total Parameters: ${paramDefs.length} | Required: ${requiredCount} | Optional: ${paramDefs.length - requiredCount}
                </div>
            `;
            
            // Build parameter inputs dynamically
            const inputsHTML = paramDefs.map(param => {
                const value = storedParams[param.name] || param.defaultValue;
                const requiredStar = param.required ? '<span style="color: var(--danger);">*</span>' : '';
                
                let inputElement = '';
                
                switch (param.type.toUpperCase()) {
                    case 'DATE':
                    case 'DATE_FROM':
                    case 'DATE_TO':
                        inputElement = `
                            <input type="text" 
                                   id="param_${param.name}" 
                                   class="form-control" 
                                   value="${value}" 
                                   placeholder="${param.placeholder || 'DD-MM-YYYY'}"
                                   ${param.required ? 'required' : ''}>
                        `;
                        break;
                    
                    case 'NUMBER':
                    case 'INTEGER':
                        inputElement = `
                            <input type="number" 
                                   id="param_${param.name}" 
                                   class="form-control" 
                                   value="${value}" 
                                   placeholder="${param.placeholder}"
                                   ${param.required ? 'required' : ''}>
                        `;
                        break;
                    
                    case 'BOOLEAN':
                        inputElement = `
                            <select id="param_${param.name}" class="form-control" ${param.required ? 'required' : ''}>
                                <option value="true" ${value === 'true' || value === true ? 'selected' : ''}>Yes</option>
                                <option value="false" ${value === 'false' || value === false ? 'selected' : ''}>No</option>
                            </select>
                        `;
                        break;
                    
                    case 'SELECT':
                    case 'DROPDOWN':
                        const options = param.options || [];
                        inputElement = `
                            <select id="param_${param.name}" class="form-control" ${param.required ? 'required' : ''}>
                                ${options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                            </select>
                        `;
                        break;
                    
                    default:
                        inputElement = `
                            <input type="text" 
                                   id="param_${param.name}" 
                                   class="form-control" 
                                   value="${value}" 
                                   placeholder="${param.placeholder}"
                                   ${param.required ? 'required' : ''}>
                        `;
                }
                
                return `
                    <div class="form-group">
                        <label>${param.label} ${requiredStar}</label>
                        ${inputElement}
                        ${param.description ? `<small class="text-muted">${param.description}</small>` : ''}
                    </div>
                `;
            }).join('');
            
            paramsList.innerHTML = infoHTML + inputsHTML;
            
            modal.classList.add('show');
            document.getElementById('dataSourcesModal').classList.remove('show');
        }

        function resetParameters() {
            const paramDefs = getDataSourceParameters();
            
            if (paramDefs.length > 0) {
                // Reset dynamic parameters
                paramDefs.forEach(param => {
                    const input = document.getElementById(`param_${param.name}`);
                    if (input) {
                        input.value = param.defaultValue;
                    }
                });
            } else {
                // Reset default parameters
                const instanceInput = document.getElementById('param_P_INSTANCE_NAME');
                const dateFromInput = document.getElementById('param_P_DATE_FROM');
                const dateToInput = document.getElementById('param_P_DATE_TO');
                
                if (instanceInput) instanceInput.value = 'PROD';
                if (dateFromInput) dateFromInput.value = getDefaultDateFrom();
                if (dateToInput) dateToInput.value = getDefaultDateTo();
            }
        }

        async function executeDataLoad(customParams = null) {
            const modal = document.getElementById('dataSourceParamsModal');
            modal.classList.remove('show');
            
            // Get parameters dynamically from the form
            let params;
            if (customParams && Object.keys(customParams).length > 0) {
                params = customParams;
            } else {
                params = {};
                const paramDefs = getDataSourceParameters();
                
                if (paramDefs.length > 0) {
                    // Use dynamic parameters
                    paramDefs.forEach(param => {
                        const input = document.getElementById(`param_${param.name}`);
                        if (input) {
                            params[param.name] = input.value;
                        }
                    });
                } else {
                    // Use default parameters (fallback for backward compatibility)
                    const instanceInput = document.getElementById('param_P_INSTANCE_NAME');
                    const dateFromInput = document.getElementById('param_P_DATE_FROM');
                    const dateToInput = document.getElementById('param_P_DATE_TO');
                    
                    if (instanceInput) params.P_INSTANCE_NAME = instanceInput.value;
                    if (dateFromInput) params.P_DATE_FROM = dateFromInput.value;
                    if (dateToInput) params.P_DATE_TO = dateToInput.value;
                }
            }
            
            // Save parameters if checkbox is checked
            if (document.getElementById('saveParamsDefault')?.checked) {
                saveParams(params);
            }
            
            // Create new session for this data loading
            const sessionId = await createNewSession();
            
            // Build parameter display string
            const paramDisplay = Object.keys(params).length > 0
                ? Object.entries(params)
                    .map(([key, value]) => `• ${formatParameterLabel(key)}: <strong>${value}</strong>`)
                    .join('<br>')
                : 'No parameters';
            
            addMessage('assistant', `⏳ Loading ${selectedDataSources.length} data source(s) with parameters:<br>${paramDisplay}`);

            let loadedCount = 0;
            let failedCount = 0;
            let allData = [];
            loadedDataSources = {}; // Reset loaded data sources

            selectedDataSources.forEach((source, index) => {
                setTimeout(() => {
                    const endpoint = source.api_endpoint || source.endpoint || source.API_ENDPOINT;
                    const sourceName = source.source_name || source.name || source.SOURCE_NAME;
                    const sourceId = source.source_id || source.id || source.SOURCE_ID;
                    
                    fetchDataFromSource(endpoint, sourceName, params, (error, data) => {
                        if (error) {
                            failedCount++;
                            addMessage('assistant', `❌ Failed to load ${sourceName}: ${error}`);
                        } else {
                            loadedCount++;
                            allData = allData.concat(data);
                            
                            // Store data by source
                            loadedDataSources[sourceId] = {
                                source: source,
                                data: data,
                                sourceName: sourceName,
                                recordCount: data.length
                            };
                            
                            addMessage('assistant', `✅ Loaded ${sourceName}: ${data.length} records`);
                        }

                        if (loadedCount + failedCount === selectedDataSources.length) {
                            wmsData = allData;
                            
                            // Update status indicator
                            const statusEl = document.getElementById('dataStatus');
                            statusEl.style.display = 'flex';
                            statusEl.className = 'status-indicator status-success';
                            statusEl.querySelector('i').className = 'fas fa-check-circle';
                            statusEl.querySelector('span').textContent = `${allData.length} records`;
                            statusEl.title = 'Click to view data';
                            
                            // Show and update View Data button
                            const viewDataBtn = document.getElementById('viewDataBtn');
                            viewDataBtn.style.display = 'inline-flex';
                            document.getElementById('configureInsightsBtn').style.display = 'inline-flex';
                            document.getElementById('viewDataBtnCount').textContent = `${allData.length}`;
                            
                            // Build list of loaded sources
                            const sourcesList = Object.values(loadedDataSources)
                                .map(s => `${s.sourceName} (${s.recordCount} records)`)
                                .join('<br>• ');
                            
                            addMessage('assistant', `🎉 Total loaded: ${allData.length} records from ${loadedCount} source(s).<br><br>` +
                                `<strong>Data Sources Available:</strong><br>• ${sourcesList}<br><br>` +
                                `<strong>All data sources are selected for AI by default.</strong> Click the green "View Data" button to choose specific sources for AI queries.`);
                            
                            // Generate insights panel
                            generateDataInsights();
                        }
                    });
                }, index * 500);
            });
        }

        function fetchDataFromSource(endpoint, sourceName, params, callback) {
            // Build URL with dynamic parameters
            let fullUrl = endpoint;
            
            // Build query string from all parameters
            if (params && Object.keys(params).length > 0) {
                const queryString = Object.entries(params)
                    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                    .join('&');
                
                // Check if endpoint already has parameters
                if (fullUrl.includes('?')) {
                    fullUrl += '&' + queryString;
                } else {
                    fullUrl += '?' + queryString;
                }
            }
            
            console.log('🔗 Fetching from:', fullUrl);
            
            const requestId = 'load_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                if (error) {
                    callback(error, null);
                } else {
                    try {
                        let apiData = JSON.parse(data);
                        
                        if (apiData.items && Array.isArray(apiData.items)) {
                            apiData = apiData.items;
                        } else if (Array.isArray(apiData)) {
                            // Already an array
                        } else if (apiData.data && Array.isArray(apiData.data)) {
                            apiData = apiData.data;
                        } else {
                            apiData = [apiData];
                        }
                        
                        callback(null, apiData);
                    } catch (e) {
                        callback('Parse error: ' + e.message, null);
                    }
                }
            };
            
            const message = {
                action: 'executeGet',
                requestId: requestId,
                fullUrl: fullUrl
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            } else {
                callback('WebView2 not available', null);
            }
        }
		// ==================== SESSION MANAGEMENT ====================
        async function createNewSession() {
            const config = loadEndpointConfig();
            const endpoint = config.sessions.post;
            
            if (!endpoint) {
                console.warn('Sessions POST endpoint not configured');
                return null;
            }
            
            const dataSourcesUsed = selectedDataSources.map(ds => ({
                id: ds.source_id || ds.id,
                name: ds.source_name || ds.name
            }));
            
            return new Promise((resolve, reject) => {
                const requestId = 'create_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                window.pendingRequests[requestId] = function(error, data) {
                    if (error) {
                        console.error('Failed to create session:', error);
                        resolve(null);
                    } else {
                        try {
                            const parsed = JSON.parse(data);
                            const sessionId = parsed.sessionId || parsed.session_id;
                            currentSessionId = sessionId;
                            console.log('✅ Session created:', sessionId);
                            resolve(sessionId);
                        } catch (e) {
                            console.error('Error parsing session response:', e);
                            resolve(null);
                        }
                    }
                };
                
                const message = {
                    action: 'executePost',
                    requestId: requestId,
                    fullUrl: endpoint,
                    body: JSON.stringify({
                        sessionName: 'Conversation - ' + new Date().toLocaleString(),
                        userId: 'user_' + Date.now(),
                        dataSources: JSON.stringify(dataSourcesUsed)
                    })
                };
                
                if (window.chrome?.webview) {
                    window.chrome.webview.postMessage(message);
                } else {
                    resolve(null);
                }
            });
        }

        async function saveMessageToSession(role, content, messageType = 'text') {
            if (!currentSessionId) {
                console.warn('No active session to save message');
                return;
            }
            
            const config = loadEndpointConfig();
            const endpoint = config.messages.post;
            
            if (!endpoint) {
                console.warn('Messages POST endpoint not configured');
                return;
            }
            
            const requestId = 'save_msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                if (error) {
                    console.error('Failed to save message:', error);
                } else {
                    console.log('✅ Message saved to session');
                }
            };
            
            const message = {
                action: 'executePost',
                requestId: requestId,
                fullUrl: endpoint,
                body: JSON.stringify({
                    sessionId: currentSessionId,
                    role: role,
                    content: content,
                    messageType: messageType,
                    tokensUsed: Math.floor(content.length / 4),
                    executionTime: 0,
                    hasChart: 'N',
                    chartData: null,
                    dataSnapshot: null
                })
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            }
        }

        // ==================== CONVERSATION HISTORY ====================
        async function loadConversationHistory() {
            const config = loadEndpointConfig();
            const endpoint = config.sessions.get;
            
            if (!endpoint) {
                showNotification('⚠️ Please configure Sessions GET endpoint first', 'error');
                document.getElementById('setupModal').classList.add('show');
                return;
            }
            
            const loading = document.getElementById('historyLoading');
            const tree = document.getElementById('conversationTree');
            const empty = document.getElementById('historyEmpty');
            
            loading.style.display = 'flex';
            tree.innerHTML = '';
            empty.style.display = 'none';
            
            const requestId = 'history_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                loading.style.display = 'none';
                
                if (error) {
                    showNotification('❌ Failed to load conversations: ' + error, 'error');
                    empty.style.display = 'block';
                } else {
                    try {
                        const parsed = JSON.parse(data);
                        const sessions = parsed.sessions || parsed.items || [];
                        
                        if (sessions.length === 0) {
                            empty.style.display = 'block';
                        } else {
                            conversationsCache = sessions;
                            renderConversationTree(sessions);
                        }
                    } catch (e) {
                        showNotification('❌ Error parsing conversations: ' + e.message, 'error');
                        empty.style.display = 'block';
                    }
                }
            };
            
            const message = {
                action: 'executeGet',
                requestId: requestId,
                fullUrl: endpoint
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            } else {
                loading.style.display = 'none';
                showNotification('❌ WebView2 not available', 'error');
            }
        }

        function renderConversationTree(sessions) {
            const tree = document.getElementById('conversationTree');
            tree.innerHTML = '';
            
            // Group by date
            const grouped = {};
            sessions.forEach(session => {
                const date = session.sessionDate || session.session_date || new Date().toISOString().split('T')[0];
                if (!grouped[date]) {
                    grouped[date] = [];
                }
                grouped[date].push(session);
            });
            
            // Sort dates descending
            const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));
            
            sortedDates.forEach(date => {
                const dateNode = createDateNode(date, grouped[date]);
                tree.appendChild(dateNode);
            });
        }

        function createDateNode(date, sessions) {
            const li = document.createElement('li');
            li.className = 'tree-node expanded';
            
            const dateFormatted = new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            const header = document.createElement('div');
            header.className = 'tree-node-header';
            header.innerHTML = `
                <i class="fas fa-chevron-down tree-node-icon"></i>
                <strong>${dateFormatted}</strong>
                <span class="text-muted" style="margin-left: 0.5rem;">(${sessions.length} conversation${sessions.length > 1 ? 's' : ''})</span>
            `;
            
            header.addEventListener('click', () => {
                li.classList.toggle('expanded');
                li.classList.toggle('collapsed');
            });
            
            const children = document.createElement('ul');
            children.className = 'tree-node-children';
            
            sessions.forEach(session => {
                const sessionItem = createConversationItem(session);
                children.appendChild(sessionItem);
            });
            
            li.appendChild(header);
            li.appendChild(children);
            
            return li;
        }

        function createConversationItem(session) {
            const li = document.createElement('li');
            
            const div = document.createElement('div');
            div.className = 'conversation-item';
            
            const sessionId = session.sessionId || session.session_id;
            const sessionName = session.sessionName || session.session_name || 'Untitled Conversation';
            const totalMessages = session.totalMessages || session.total_messages || 0;
            const isFavorite = (session.isFavorite || session.is_favorite) === 'Y' || session.isFavorite === true;
            const sessionTime = session.sessionTime || session.session_time || '';
            
            div.innerHTML = `
                <div class="conversation-item-header">
                    <div>
                        <div class="conversation-item-title">${sessionName}</div>
                        <div class="conversation-item-meta">
                            <span><i class="fas fa-comments"></i> ${totalMessages} messages</span>
                            ${sessionTime ? `<span><i class="fas fa-clock"></i> ${sessionTime}</span>` : ''}
                        </div>
                    </div>
                    <div class="conversation-item-actions">
                        <button class="icon-btn favorite-icon ${isFavorite ? 'active' : ''}" 
                                onclick="toggleFavorite(event, ${sessionId})" 
                                title="Toggle Favorite">
                            <i class="fas fa-star"></i>
                        </button>
                        <button class="icon-btn" 
                                onclick="viewConversation(event, ${sessionId})" 
                                title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="icon-btn" 
                                onclick="deleteConversation(event, ${sessionId})" 
                                title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            
            li.appendChild(div);
            return li;
        }

        function filterConversations() {
            const searchTerm = document.getElementById('historySearch').value.toLowerCase();
            const dataSourceFilter = document.getElementById('dataSourceFilter').value;
            const dateRangeFilter = document.getElementById('dateRangeFilter').value;
            
            let filtered = conversationsCache;
            
            if (searchTerm) {
                filtered = filtered.filter(session => {
                    const name = (session.sessionName || session.session_name || '').toLowerCase();
                    const summary = (session.summary || session.session_summary || '').toLowerCase();
                    const tags = (session.tags || session.session_tags || '').toLowerCase();
                    return name.includes(searchTerm) || summary.includes(searchTerm) || tags.includes(searchTerm);
                });
            }
            
            if (dataSourceFilter) {
                filtered = filtered.filter(session => {
                    const sources = session.dataSources || session.data_sources_used || '[]';
                    return sources.includes(dataSourceFilter);
                });
            }
            
            if (dateRangeFilter !== 'all') {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                filtered = filtered.filter(session => {
                    const sessionDate = new Date(session.sessionDate || session.session_date);
                    
                    if (dateRangeFilter === 'today') {
                        return sessionDate >= today;
                    } else if (dateRangeFilter === 'week') {
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return sessionDate >= weekAgo;
                    } else if (dateRangeFilter === 'month') {
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return sessionDate >= monthAgo;
                    }
                    return true;
                });
            }
            
            if (showFavoritesOnly) {
                filtered = filtered.filter(session => {
                    return (session.isFavorite || session.is_favorite) === 'Y' || session.isFavorite === true;
                });
            }
            
            renderConversationTree(filtered);
        }

        function toggleFavoriteFilter() {
            showFavoritesOnly = !showFavoritesOnly;
            filterConversations();
        }

        async function viewConversation(event, sessionId) {
            event.stopPropagation();
            
            const config = loadEndpointConfig();
            let endpoint = config.messages.get;
            
            if (!endpoint) {
                showNotification('⚠️ Please configure Messages GET endpoint first', 'error');
                return;
            }
            
            endpoint = endpoint.replace(':id', sessionId);
            
            document.getElementById('viewConversationModal').classList.add('show');
            document.getElementById('conversationMessages').innerHTML = '<div class="flex-center mt-3"><div class="spinner"></div></div>';
            
            const requestId = 'messages_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                if (error) {
                    document.getElementById('conversationMessages').innerHTML = 
                        `<div class="test-result error">❌ Failed to load messages: ${error}</div>`;
                } else {
                    try {
                        const parsed = JSON.parse(data);
                        const messages = parsed.messages || [];
                        renderConversationMessages(messages);
                    } catch (e) {
                        document.getElementById('conversationMessages').innerHTML = 
                            `<div class="test-result error">❌ Error parsing messages: ${e.message}</div>`;
                    }
                }
            };
            
            const message = {
                action: 'executeGet',
                requestId: requestId,
                fullUrl: endpoint
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            }
        }

        function renderConversationMessages(messages) {
            const container = document.getElementById('conversationMessages');
            container.innerHTML = '';
            
            messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.role || msg.message_role}`;
                
                const role = msg.role || msg.message_role;
                const content = msg.content || msg.message_content;
                
                messageDiv.innerHTML = `
                    <div class="avatar ${role === 'assistant' ? 'bot' : 'user-avatar'}">
                        <i class="fas fa-${role === 'assistant' ? 'robot' : 'user'}"></i>
                    </div>
                    <div class="message-content">
                        ${content}
                        <div class="text-muted text-small mt-1">
                            ${new Date(msg.createdDate || msg.created_date).toLocaleString()}
                        </div>
                    </div>
                `;
                
                container.appendChild(messageDiv);
            });
        }

        async function toggleFavorite(event, sessionId) {
            event.stopPropagation();
            
            const config = loadEndpointConfig();
            let endpoint = config.sessions.put;
            
            if (!endpoint) {
                showNotification('⚠️ Please configure Sessions PUT endpoint first', 'error');
                return;
            }
            
            endpoint = endpoint.replace(':id', sessionId);
            
            const session = conversationsCache.find(s => 
                (s.sessionId || s.session_id) === sessionId
            );
            
            if (!session) return;
            
            const isFavorite = (session.isFavorite || session.is_favorite) === 'Y';
            const newFavoriteStatus = isFavorite ? 'N' : 'Y';
            
            const requestId = 'favorite_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                if (error) {
                    showNotification('❌ Failed to update favorite status', 'error');
                } else {
                    if (session.isFavorite !== undefined) {
                        session.isFavorite = newFavoriteStatus === 'Y';
                    } else {
                        session.is_favorite = newFavoriteStatus;
                    }
                    
                    const btn = event.target.closest('.favorite-icon');
                    if (newFavoriteStatus === 'Y') {
                        btn.classList.add('active');
                        showNotification('⭐ Added to favorites', 'success');
                    } else {
                        btn.classList.remove('active');
                        showNotification('☆ Removed from favorites', 'success');
                    }
                }
            };
            
            const message = {
                action: 'executePut',
                requestId: requestId,
                fullUrl: endpoint,
                body: JSON.stringify({ isFavorite: newFavoriteStatus })
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            }
        }

        async function deleteConversation(event, sessionId) {
            event.stopPropagation();
            
            if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
                return;
            }
            
            const config = loadEndpointConfig();
            let endpoint = config.sessions.delete;
            
            if (!endpoint) {
                showNotification('⚠️ Please configure Sessions DELETE endpoint first', 'error');
                return;
            }
            
            endpoint = endpoint.replace(':id', sessionId);
            
            const requestId = 'delete_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, data) {
                if (error) {
                    showNotification('❌ Failed to delete conversation', 'error');
                } else {
                    showNotification('✅ Conversation deleted', 'success');
                    
                    conversationsCache = conversationsCache.filter(s => 
                        (s.sessionId || s.session_id) !== sessionId
                    );
                    
                    renderConversationTree(conversationsCache);
                }
            };
            
            const message = {
                action: 'executeDelete',
                requestId: requestId,
                fullUrl: endpoint
            };
            
            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            }
        }

        // ==================== AI QUERY ====================
        async function handleSend() {
            const query = document.getElementById('userInput').value.trim();
            if (!query) return;

            if (!wmsData || wmsData.length === 0) {
                addMessage('assistant', '⚠️ Please load data first by clicking "🗂️ Data Sources"');
                return;
            }

            lastUserPrompt = query;
            addMessage('user', query);
            
            await saveMessageToSession('user', query, 'text');
            
            document.getElementById('userInput').value = '';
            document.getElementById('sendBtn').disabled = true;
            
            addLoadingMessage();
            
            const startTime = Date.now();

            try {
                const response = await queryAI(query, wmsData);
                removeLoadingMessage();
                
                const executionTime = Date.now() - startTime;
                
                if (response.error) {
                    addMessage('assistant', `❌ ${response.message}`);
                } else {
                    addMessage('assistant', response.content, true);
                    await saveMessageToSession('assistant', response.content, 'text');
                    
                    // Store prompt in learning system
                    storePrompt(query, response.content, {
                        dataSources: Object.keys(loadedDataSources),
                        executionTime: executionTime
                    });
                }
            } catch (error) {
                removeLoadingMessage();
                addMessage('assistant', `❌ Error: ${error.message}`);
            } finally {
                document.getElementById('sendBtn').disabled = false;
            }
        }

        async function queryAI(userQuery, data) {
            const apiKey = localStorage.getItem('claude_api_key');
            
            if (!apiKey) {
                document.getElementById('apiModal').classList.add('show');
                return {
                    error: true,
                    message: `<strong>AI Not Configured</strong><br><br>Click the key icon to configure Claude API.`
                };
            }

            // Create a smart data summary to avoid token limits
            let dataSnapshot = [];
            let dataDescription = '';
            let statisticalSummary = '';
            
            if (data && data.length > 0) {
                // For large datasets, send only a sample + statistics
                const maxSampleSize = data.length > 1000 ? 100 : Math.min(data.length, 500);
                
                // Get stratified sample (beginning, middle, end for variety)
                const sampleSize = Math.min(maxSampleSize, data.length);
                const step = Math.max(1, Math.floor(data.length / sampleSize));
                dataSnapshot = [];
                for (let i = 0; i < data.length && dataSnapshot.length < sampleSize; i += step) {
                    dataSnapshot.push(data[i]);
                }
                
                // Get column names from first record
                const columns = Object.keys(data[0]);
                
                // Build description of available data
                const sourceNames = [];
                if (Object.keys(loadedDataSources).length > 0) {
                    for (const [sourceId, sourceInfo] of Object.entries(loadedDataSources)) {
                        if (aiSelectedSources.length === 0 || aiSelectedSources.includes(sourceId)) {
                            sourceNames.push(`${sourceInfo.sourceName} (${sourceInfo.recordCount} records)`);
                        }
                    }
                }
                
                dataDescription = sourceNames.length > 0 
                    ? `Data Sources: ${sourceNames.join(', ')}`
                    : `Dataset: ${data.length} records`;
                
                // Generate statistical summary for numeric columns
                const numericStats = {};
                columns.forEach(col => {
                    const values = data.map(row => row[col]).filter(v => !isNaN(parseFloat(v)));
                    if (values.length > 0) {
                        const nums = values.map(v => parseFloat(v));
                        numericStats[col] = {
                            min: Math.min(...nums),
                            max: Math.max(...nums),
                            avg: (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)
                        };
                    }
                });
                
                // Build statistical summary
                if (Object.keys(numericStats).length > 0) {
                    statisticalSummary = '\n\nStatistical Summary (Full Dataset):\n';
                    for (const [col, stats] of Object.entries(numericStats)) {
                        statisticalSummary += `${col}: Min=${stats.min}, Max=${stats.max}, Avg=${stats.avg}\n`;
                    }
                }
            }

            const systemPrompt = `You are an intelligent data analyst assistant. Analyze the provided warehouse management data and answer questions clearly and concisely.

${dataDescription}
Total Records Available: ${data.length}
Sample Size Provided: ${dataSnapshot.length} records ${data.length > dataSnapshot.length ? '(stratified sample from full dataset)' : '(complete dataset)'}
Available Columns: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'None'}${statisticalSummary}

IMPORTANT: You have access to a ${dataSnapshot.length}-record sample from a ${data.length}-record dataset. When answering:
- Use the sample to understand data structure and patterns
- Acknowledge when you're working with a sample
- Provide insights based on the sample but note they represent the larger dataset
- For exact counts/totals of the full dataset, note that you're estimating based on the sample

Rules:
1. Answer questions directly based on the data provided
2. Use HTML formatting for better readability: <strong>, <br>, <ul>, <li>, <table class="data-table">
3. Be concise but informative
4. If asked about data not present, clearly state what data is available
5. Show relevant statistics and insights
6. Format numbers with proper separators (e.g., 1,234.56)
7. When showing tables, use the data-table class for proper styling
8. Always mention you're working with a sample when the dataset is large`;

            return new Promise((resolve, reject) => {
                const requestId = 'claude_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                
                window.pendingRequests[requestId] = function(error, response) {
                    if (error) {
                        resolve({
                            error: true,
                            message: `<strong>AI Error:</strong> ${error}`
                        });
                    } else {
                        try {
                            const result = JSON.parse(response);
                            const content = result.content[0].text;
                            resolve({ type: 'text', content });
                        } catch (e) {
                            resolve({
                                error: true,
                                message: `Parse error: ${e.message}`
                            });
                        }
                    }
                };
                
                const message = {
                    action: 'claudeApiRequest',
                    requestId: requestId,
                    apiKey: apiKey,
                    userQuery: userQuery,
                    systemPrompt: systemPrompt,
                    dataJson: JSON.stringify(dataSnapshot)
                };
                
                if (window.chrome?.webview) {
                    window.chrome.webview.postMessage(message);
                } else {
                    reject(new Error('WebView2 not available'));
                }
            });
        }

        // ==================== CLAUDE API MANAGEMENT ====================
        async function saveApiKey() {
            const key = document.getElementById('apiKeyInputModal').value.trim();
            const statusMsg = document.getElementById('apiStatusMsg');
            
            if (!key) {
                statusMsg.style.display = 'block';
                statusMsg.className = 'test-result error';
                statusMsg.innerHTML = '❌ Please enter an API key';
                return;
            }

            if (!key.startsWith('sk-ant-')) {
                statusMsg.style.display = 'block';
                statusMsg.className = 'test-result error';
                statusMsg.innerHTML = '❌ Invalid API key format. Key should start with "sk-ant-"';
                return;
            }

            document.getElementById('saveApiKeyBtn').disabled = true;
            statusMsg.style.display = 'block';
            statusMsg.className = 'test-result';
            statusMsg.innerHTML = '<div class="spinner"></div> Testing API key...';

            const requestId = 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            window.pendingRequests[requestId] = function(error, response) {
                document.getElementById('saveApiKeyBtn').disabled = false;
                
                if (error) {
                    statusMsg.className = 'test-result error';
                    statusMsg.innerHTML = `❌ ${error}`;
                } else {
                    localStorage.setItem('claude_api_key', key);
                    statusMsg.className = 'test-result success';
                    statusMsg.innerHTML = '✅ API key saved and verified!';
                    updateApiStatus();
                    
                    setTimeout(() => {
                        document.getElementById('apiModal').classList.remove('show');
                        addMessage('assistant', '✅ <strong>AI Enabled!</strong><br><br>You can now ask me any question about your warehouse data.');
                    }, 2000);
                }
            };

            const message = {
                action: "claudeApiTest",
                requestId: requestId,
                apiKey: key
            };

            if (window.chrome?.webview) {
                window.chrome.webview.postMessage(message);
            } else {
                document.getElementById('saveApiKeyBtn').disabled = false;
                statusMsg.className = 'test-result error';
                statusMsg.innerHTML = '❌ WebView2 not available.';
            }
        }

        function removeApiKey() {
            if (confirm('Remove Claude API key?')) {
                localStorage.removeItem('claude_api_key');
                document.getElementById('apiKeyInputModal').value = '';
                updateApiStatus();
                document.getElementById('apiModal').classList.remove('show');
                addMessage('assistant', '🔒 API key removed.');
            }
        }

        function updateApiStatus() {
            const hasKey = !!localStorage.getItem('claude_api_key');
            const btn = document.getElementById('configApiBtn');
            
            if (hasKey) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i>';
                btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                btn.title = 'AI Enabled';
            } else {
                btn.innerHTML = '<i class="fas fa-key"></i>';
                btn.style.background = 'var(--bg-tertiary)';
                btn.title = 'Configure AI';
            }
        }

        // ==================== MESSAGE DISPLAY ====================
        function addMessage(role, content, showExportButtons = false) {
            const div = document.createElement('div');
            div.className = `message ${role}`;
            
            const avatar = document.createElement('div');
            avatar.className = `avatar ${role === 'assistant' ? 'bot' : 'user-avatar'}`;
            avatar.innerHTML = role === 'assistant' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.style.position = 'relative';
            
            // Add export buttons if this is an assistant message with results
            if (role === 'assistant' && showExportButtons) {
                const messageId = 'msg_' + Date.now();
                div.id = messageId;
                
                const exportButtons = document.createElement('div');
                exportButtons.className = 'export-buttons';
                exportButtons.style.cssText = `
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    display: flex;
                    gap: 0.5rem;
                    z-index: 10;
                `;
                
                // PDF Button
                const pdfBtn = document.createElement('button');
                pdfBtn.className = 'export-btn';
                pdfBtn.innerHTML = '<i class="fas fa-file-pdf"></i>';
                pdfBtn.title = 'Download as PDF';
                pdfBtn.style.cssText = `
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 0.4rem 0.6rem;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                pdfBtn.onmouseover = () => pdfBtn.style.background = '#b91c1c';
                pdfBtn.onmouseout = () => pdfBtn.style.background = '#dc2626';
                pdfBtn.onclick = () => exportMessageAsPDF(messageId);
                
                // Excel Button
                const excelBtn = document.createElement('button');
                excelBtn.className = 'export-btn';
                excelBtn.innerHTML = '<i class="fas fa-file-excel"></i>';
                excelBtn.title = 'Download as Excel';
                excelBtn.style.cssText = `
                    background: #16a34a;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 0.4rem 0.6rem;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                excelBtn.onmouseover = () => excelBtn.style.background = '#15803d';
                excelBtn.onmouseout = () => excelBtn.style.background = '#16a34a';
                excelBtn.onclick = () => exportMessageAsExcel(messageId);
                
                // Share Button
                const shareBtn = document.createElement('button');
                shareBtn.className = 'export-btn';
                shareBtn.innerHTML = '<i class="fas fa-share-alt"></i>';
                shareBtn.title = 'Share';
                shareBtn.style.cssText = `
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 0.4rem 0.6rem;
                    cursor: pointer;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                `;
                shareBtn.onmouseover = () => shareBtn.style.background = '#1d4ed8';
                shareBtn.onmouseout = () => shareBtn.style.background = '#2563eb';
                shareBtn.onclick = () => shareMessage(messageId);
                
                exportButtons.appendChild(pdfBtn);
                exportButtons.appendChild(excelBtn);
                exportButtons.appendChild(shareBtn);
                
                contentDiv.appendChild(exportButtons);
            }
            
            // Add the actual content
            const textContent = document.createElement('div');
            textContent.innerHTML = content;
            textContent.style.paddingTop = showExportButtons ? '2.5rem' : '0';
            contentDiv.appendChild(textContent);
            
            // Add feedback buttons for assistant messages with export buttons
            if (role === 'assistant' && showExportButtons) {
                const feedbackDiv = document.createElement('div');
                feedbackDiv.className = 'feedback-buttons';
                feedbackDiv.style.cssText = `
                    margin-top: 1rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.85rem;
                `;
                
                const label = document.createElement('span');
                label.textContent = 'Was this helpful?';
                label.style.color = 'var(--text-tertiary)';
                label.style.fontSize = '0.8rem';
                
                // Thumbs Up Button
                const thumbsUpBtn = document.createElement('button');
                thumbsUpBtn.className = 'feedback-btn';
                thumbsUpBtn.innerHTML = '<i class="fas fa-thumbs-up"></i> Yes';
                thumbsUpBtn.title = 'This was helpful';
                thumbsUpBtn.style.cssText = `
                    background: transparent;
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    padding: 0.35rem 0.75rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                `;
                thumbsUpBtn.onclick = function() {
                    this.style.background = 'var(--success)';
                    this.style.color = 'white';
                    this.style.borderColor = 'var(--success)';
                    this.disabled = true;
                    thumbsDownBtn.disabled = true;
                    thumbsDownBtn.style.opacity = '0.5';
                    recordFeedback(currentPromptId, 'thumbs_up');
                    showNotification('👍 Thanks for your feedback!', 'success');
                };
                thumbsUpBtn.onmouseover = function() {
                    if (!this.disabled) {
                        this.style.background = 'rgba(16, 185, 129, 0.1)';
                        this.style.borderColor = 'var(--success)';
                        this.style.color = 'var(--success)';
                    }
                };
                thumbsUpBtn.onmouseout = function() {
                    if (!this.disabled) {
                        this.style.background = 'transparent';
                        this.style.borderColor = 'var(--border-color)';
                        this.style.color = 'var(--text-secondary)';
                    }
                };
                
                // Thumbs Down Button
                const thumbsDownBtn = document.createElement('button');
                thumbsDownBtn.className = 'feedback-btn';
                thumbsDownBtn.innerHTML = '<i class="fas fa-thumbs-down"></i> No';
                thumbsDownBtn.title = 'This needs improvement';
                thumbsDownBtn.style.cssText = `
                    background: transparent;
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 6px;
                    padding: 0.35rem 0.75rem;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                `;
                thumbsDownBtn.onclick = function() {
                    this.style.background = 'var(--danger)';
                    this.style.color = 'white';
                    this.style.borderColor = 'var(--danger)';
                    this.disabled = true;
                    thumbsUpBtn.disabled = true;
                    thumbsUpBtn.style.opacity = '0.5';
                    recordFeedback(currentPromptId, 'thumbs_down');
                    showNotification('👎 Thanks for your feedback. We\'ll improve!', 'info');
                };
                thumbsDownBtn.onmouseover = function() {
                    if (!this.disabled) {
                        this.style.background = 'rgba(239, 68, 68, 0.1)';
                        this.style.borderColor = 'var(--danger)';
                        this.style.color = 'var(--danger)';
                    }
                };
                thumbsDownBtn.onmouseout = function() {
                    if (!this.disabled) {
                        this.style.background = 'transparent';
                        this.style.borderColor = 'var(--border-color)';
                        this.style.color = 'var(--text-secondary)';
                    }
                };
                
                feedbackDiv.appendChild(label);
                feedbackDiv.appendChild(thumbsUpBtn);
                feedbackDiv.appendChild(thumbsDownBtn);
                
                contentDiv.appendChild(feedbackDiv);
            }
            
            if (role === 'user') {
                div.appendChild(contentDiv);
                div.appendChild(avatar);
            } else {
                div.appendChild(avatar);
                div.appendChild(contentDiv);
            }
            
            document.getElementById('messages').appendChild(div);
            document.getElementById('messagesContainer').scrollTop = document.getElementById('messagesContainer').scrollHeight;
        }

        function addLoadingMessage() {
            const div = document.createElement('div');
            div.className = 'message assistant';
            div.id = 'loadingMsg';
            
            div.innerHTML = `
                <div class="avatar bot">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="spinner"></div>
                        <span>Processing...</span>
                    </div>
                </div>
            `;
            
            document.getElementById('messages').appendChild(div);
            document.getElementById('messagesContainer').scrollTop = document.getElementById('messagesContainer').scrollHeight;
        }

        function removeLoadingMessage() {
            const msg = document.getElementById('loadingMsg');
            if (msg) msg.remove();
        }

        function clearChat() {
            if (confirm('Clear all messages?')) {
                document.getElementById('messages').innerHTML = `
                    <div class="message assistant">
                        <div class="avatar bot">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">Chat cleared! 🧹</div>
                    </div>
                `;
                currentSessionId = null;
            }
        }

        // ==================== EXPORT FUNCTIONS ====================
        
        function exportMessageAsPDF(messageId) {
            const messageEl = document.getElementById(messageId);
            if (!messageEl) {
                showNotification('❌ Message not found', 'error');
                return;
            }
            
            // Get the text content (without HTML tags)
            const content = messageEl.querySelector('.message-content').innerText;
            
            // Create a simple text representation for PDF
            const lines = content.split('\n').filter(line => line.trim());
            
            // Create PDF content
            let pdfContent = 'WMS Auto Pilot - Export\n';
            pdfContent += '='.repeat(50) + '\n\n';
            pdfContent += 'Date: ' + new Date().toLocaleString() + '\n\n';
            pdfContent += lines.join('\n');
            
            // Create a blob and download
            const blob = new Blob([pdfContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wms-export-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('✅ Downloaded as text file (PDF export requires additional library)', 'success');
        }
        
        function exportMessageAsExcel(messageId) {
            const messageEl = document.getElementById(messageId);
            if (!messageEl) {
                showNotification('❌ Message not found', 'error');
                return;
            }
            
            // Get the content
            const contentEl = messageEl.querySelector('.message-content');
            
            // Try to extract tables or structured data
            const tables = contentEl.querySelectorAll('table');
            
            if (tables.length > 0) {
                // Export table data
                const table = tables[0];
                let csv = '';
                
                // Get headers
                const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText);
                if (headers.length > 0) {
                    csv += headers.join(',') + '\n';
                }
                
                // Get rows
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td')).map(td => {
                        const text = td.innerText.replace(/,/g, ';'); // Replace commas
                        return `"${text}"`;
                    });
                    csv += cells.join(',') + '\n';
                });
                
                // Download CSV
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wms-export-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('✅ Downloaded as CSV file', 'success');
            } else {
                // Export as text-based CSV
                const content = contentEl.innerText;
                const lines = content.split('\n').filter(line => line.trim());
                
                let csv = 'WMS Auto Pilot Export\n';
                csv += new Date().toLocaleString() + '\n\n';
                lines.forEach(line => {
                    csv += `"${line.replace(/"/g, '""')}"\n`;
                });
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `wms-export-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('✅ Downloaded as CSV file', 'success');
            }
        }
        
        function shareMessage(messageId) {
            const messageEl = document.getElementById(messageId);
            if (!messageEl) {
                showNotification('❌ Message not found', 'error');
                return;
            }
            
            // Get the text content
            const content = messageEl.querySelector('.message-content').innerText;
            
            // Try to use Web Share API if available
            if (navigator.share) {
                navigator.share({
                    title: 'WMS Auto Pilot - Insights',
                    text: content
                })
                .then(() => showNotification('✅ Shared successfully', 'success'))
                .catch((error) => {
                    if (error.name !== 'AbortError') {
                        console.error('Share failed:', error);
                        copyToClipboardFallback(content);
                    }
                });
            } else {
                // Fallback: Copy to clipboard
                copyToClipboardFallback(content);
            }
        }
        
        function copyToClipboardFallback(text) {
            // Create temporary textarea
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                showNotification('✅ Copied to clipboard! You can now share it.', 'success');
            } catch (err) {
                console.error('Copy failed:', err);
                showNotification('❌ Failed to copy. Please select and copy manually.', 'error');
            }
            
            document.body.removeChild(textarea);
        }

        // ==================== PROMPT LEARNING SYSTEM FUNCTIONS ====================
        
        /**
         * Initialize prompt learning system from localStorage
         */
        function initPromptLearning() {
            const stored = localStorage.getItem('wms_prompt_learning');
            if (stored) {
                try {
                    promptLearningDB = JSON.parse(stored);
                    console.log('✅ Prompt learning system loaded:', promptLearningDB.analytics.totalQueries, 'queries');
                } catch (e) {
                    console.error('Error loading prompt learning data:', e);
                }
            }
        }
        
        /**
         * Save prompt learning data to localStorage
         */
        function savePromptLearning() {
            try {
                localStorage.setItem('wms_prompt_learning', JSON.stringify(promptLearningDB));
            } catch (e) {
                console.error('Error saving prompt learning data:', e);
            }
        }
        
        /**
         * Store a new prompt and response
         */
        function storePrompt(userQuery, aiResponse, metadata = {}) {
            const promptId = 'prompt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            const promptRecord = {
                id: promptId,
                timestamp: new Date().toISOString(),
                userQuery: userQuery,
                aiResponse: aiResponse,
                dataSourcesUsed: metadata.dataSources || Object.keys(loadedDataSources),
                executionTime: metadata.executionTime || 0,
                responseLength: aiResponse.length,
                queryType: classifyQuery(userQuery),
                sessionId: currentSessionId,
                userFeedback: null // Will be filled when user provides feedback
            };
            
            // Store prompt
            promptLearningDB.prompts.push(promptRecord);
            
            // Update analytics
            promptLearningDB.analytics.totalQueries++;
            const queryType = promptRecord.queryType;
            promptLearningDB.analytics.queryTypes[queryType] = (promptLearningDB.analytics.queryTypes[queryType] || 0) + 1;
            
            // Keep only last 1000 prompts (memory management)
            if (promptLearningDB.prompts.length > 1000) {
                promptLearningDB.prompts = promptLearningDB.prompts.slice(-1000);
            }
            
            // Save to storage
            savePromptLearning();
            
            // Set as current prompt for feedback
            currentPromptId = promptId;
            
            // Update patterns
            updateQueryPatterns(userQuery);
            
            // Update badge
            updateLearningBadge();
            
            console.log('📝 Stored prompt:', promptId, '| Type:', queryType);
            
            return promptId;
        }
        
        /**
         * Classify query type using simple keyword matching
         */
        function classifyQuery(query) {
            const lowerQuery = query.toLowerCase();
            
            // Analytical queries
            if (lowerQuery.match(/trend|pattern|analyze|analysis|compare|correlation|insight|forecast/)) {
                return 'analytical';
            }
            
            // Operational queries
            if (lowerQuery.match(/show|list|display|get|find|how many|count|total/)) {
                return 'operational';
            }
            
            // Predictive queries
            if (lowerQuery.match(/predict|forecast|estimate|will|when will|expected|future/)) {
                return 'predictive';
            }
            
            // Alert/Anomaly queries
            if (lowerQuery.match(/alert|anomaly|unusual|problem|issue|wrong|error|outlier/)) {
                return 'alert';
            }
            
            // Aggregation queries
            if (lowerQuery.match(/sum|average|min|max|group by|aggregate|total/)) {
                return 'aggregation';
            }
            
            return 'general';
        }
        
        /**
         * Update query patterns for auto-suggestions
         */
        function updateQueryPatterns(query) {
            const normalized = normalizeQuery(query);
            
            if (!promptLearningDB.patterns[normalized]) {
                promptLearningDB.patterns[normalized] = {
                    query: query,
                    count: 0,
                    lastUsed: new Date().toISOString(),
                    avgSatisfaction: 0,
                    successRate: 0
                };
            }
            
            promptLearningDB.patterns[normalized].count++;
            promptLearningDB.patterns[normalized].lastUsed = new Date().toISOString();
            
            savePromptLearning();
        }
        
        /**
         * Normalize query for pattern matching
         */
        function normalizeQuery(query) {
            return query.toLowerCase()
                .replace(/[0-9]+/g, 'N') // Replace numbers with N
                .replace(/today|yesterday|last week|this month/gi, 'TIME')
                .replace(/\b(show|list|display|get)\b/gi, 'SHOW')
                .trim();
        }
        
        /**
         * Record user feedback for a prompt
         */
        function recordFeedback(promptId, feedbackType, rating = null) {
            if (!promptId) return;
            
            // Find the prompt
            const prompt = promptLearningDB.prompts.find(p => p.id === promptId);
            if (!prompt) return;
            
            // Store feedback
            prompt.userFeedback = {
                type: feedbackType, // 'thumbs_up', 'thumbs_down', 'rating'
                rating: rating,
                timestamp: new Date().toISOString()
            };
            
            // Update analytics
            if (feedbackType === 'thumbs_up' || (rating && rating >= 4)) {
                promptLearningDB.analytics.successfulQueries++;
            }
            
            // Update pattern satisfaction
            const normalized = normalizeQuery(prompt.userQuery);
            if (promptLearningDB.patterns[normalized]) {
                const pattern = promptLearningDB.patterns[normalized];
                const currentAvg = pattern.avgSatisfaction || 0;
                const currentCount = pattern.count;
                
                let satisfactionScore = 0;
                if (feedbackType === 'thumbs_up') satisfactionScore = 5;
                else if (feedbackType === 'thumbs_down') satisfactionScore = 1;
                else if (rating) satisfactionScore = rating;
                
                pattern.avgSatisfaction = ((currentAvg * (currentCount - 1)) + satisfactionScore) / currentCount;
                pattern.successRate = feedbackType === 'thumbs_up' ? pattern.successRate + 1 : pattern.successRate;
            }
            
            savePromptLearning();
            
            console.log('👍 Feedback recorded:', feedbackType, '| Rating:', rating);
        }
        
        /**
         * Get query suggestions based on learning
         */
        function getQuerySuggestions(partial = '') {
            const suggestions = [];
            const lowerPartial = partial.toLowerCase();
            
            // Get patterns sorted by frequency and satisfaction
            const patterns = Object.values(promptLearningDB.patterns)
                .sort((a, b) => {
                    const scoreA = a.count * (a.avgSatisfaction || 3);
                    const scoreB = b.count * (b.avgSatisfaction || 3);
                    return scoreB - scoreA;
                });
            
            // Find matching patterns
            for (const pattern of patterns) {
                if (!partial || pattern.query.toLowerCase().includes(lowerPartial)) {
                    suggestions.push({
                        query: pattern.query,
                        count: pattern.count,
                        satisfaction: pattern.avgSatisfaction,
                        type: 'learned'
                    });
                    
                    if (suggestions.length >= 5) break;
                }
            }
            
            // Add default suggestions if not enough learned ones
            if (suggestions.length < 3) {
                const defaults = [
                    'What are the top 10 orders today?',
                    'Show me inventory levels',
                    'Analyze delivery performance this week',
                    'List all pending orders',
                    'What are the best selling products?'
                ];
                
                defaults.forEach(def => {
                    if (!partial || def.toLowerCase().includes(lowerPartial)) {
                        if (!suggestions.find(s => s.query === def)) {
                            suggestions.push({
                                query: def,
                                count: 0,
                                satisfaction: 0,
                                type: 'default'
                            });
                        }
                    }
                });
            }
            
            return suggestions.slice(0, 5);
        }
        
        /**
         * Get analytics dashboard data
         */
        function getPromptAnalytics() {
            const analytics = promptLearningDB.analytics;
            
            // Calculate success rate
            const successRate = analytics.totalQueries > 0 
                ? (analytics.successfulQueries / analytics.totalQueries * 100).toFixed(1)
                : 0;
            
            // Get most common query types
            const queryTypes = Object.entries(analytics.queryTypes)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            // Get most popular queries
            const popularQueries = Object.values(promptLearningDB.patterns)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
                .map(p => ({
                    query: p.query,
                    count: p.count,
                    satisfaction: p.avgSatisfaction
                }));
            
            // Recent queries
            const recentQueries = promptLearningDB.prompts
                .slice(-10)
                .reverse()
                .map(p => ({
                    query: p.userQuery,
                    type: p.queryType,
                    timestamp: p.timestamp,
                    feedback: p.userFeedback
                }));
            
            return {
                totalQueries: analytics.totalQueries,
                successfulQueries: analytics.successfulQueries,
                successRate: successRate,
                queryTypes: queryTypes,
                popularQueries: popularQueries,
                recentQueries: recentQueries,
                patternsLearned: Object.keys(promptLearningDB.patterns).length
            };
        }
        
        /**
         * Clear old learning data (maintenance)
         */
        function clearOldPromptData(daysToKeep = 30) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            const before = promptLearningDB.prompts.length;
            promptLearningDB.prompts = promptLearningDB.prompts.filter(p => {
                return new Date(p.timestamp) > cutoffDate;
            });
            const after = promptLearningDB.prompts.length;
            
            savePromptLearning();
            
            console.log(`🧹 Cleaned up ${before - after} old prompts`);
            return before - after;
        }
        
        /**
         * Export learning data
         */
        function exportLearningData() {
            const analytics = getPromptAnalytics();
            
            let report = '=== WMS Auto Pilot - Learning Analytics ===\n\n';
            report += `Generated: ${new Date().toLocaleString()}\n\n`;
            report += `SUMMARY\n`;
            report += `─────────────────────────────────────\n`;
            report += `Total Queries: ${analytics.totalQueries}\n`;
            report += `Successful: ${analytics.successfulQueries} (${analytics.successRate}%)\n`;
            report += `Patterns Learned: ${analytics.patternsLearned}\n\n`;
            
            report += `QUERY TYPES\n`;
            report += `─────────────────────────────────────\n`;
            analytics.queryTypes.forEach(([type, count]) => {
                report += `${type}: ${count} queries\n`;
            });
            
            report += `\nPOPULAR QUERIES\n`;
            report += `─────────────────────────────────────\n`;
            analytics.popularQueries.forEach((q, i) => {
                report += `${i + 1}. "${q.query}" (${q.count} times, ${q.satisfaction.toFixed(1)} satisfaction)\n`;
            });
            
            // Download as file
            const blob = new Blob([report], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wms-learning-analytics-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('✅ Learning analytics exported', 'success');
        }

        // ==================== LEARNING ANALYTICS UI ====================
        
        function openLearningAnalytics() {
            document.getElementById('learningAnalyticsModal').classList.add('show');
            refreshLearningAnalytics();
        }
        
        function closeLearningAnalytics() {
            document.getElementById('learningAnalyticsModal').classList.remove('show');
        }
        
        function refreshLearningAnalytics() {
            const analytics = getPromptAnalytics();
            
            // Update stats cards
            document.getElementById('statTotalQueries').textContent = analytics.totalQueries;
            document.getElementById('statSuccessRate').textContent = analytics.successRate + '%';
            document.getElementById('statSuccessfulQueries').textContent = analytics.successfulQueries;
            document.getElementById('statPatternsLearned').textContent = analytics.patternsLearned;
            
            // Calculate average response time
            const avgTime = promptLearningDB.prompts.length > 0
                ? promptLearningDB.prompts.reduce((sum, p) => sum + (p.executionTime || 0), 0) / promptLearningDB.prompts.length
                : 0;
            document.getElementById('statAvgResponseTime').textContent = Math.round(avgTime) + 'ms';
            
            // Update learning badge
            document.getElementById('learningBadge').textContent = analytics.totalQueries;
            
            // Populate Query Types
            populateQueryTypes(analytics.queryTypes);
            
            // Populate Popular Queries
            populatePopularQueries(analytics.popularQueries);
            
            // Populate Recent Activity
            populateRecentActivity(analytics.recentQueries);
        }
        
        function populateQueryTypes(queryTypes) {
            const container = document.getElementById('queryTypesContent');
            
            if (queryTypes.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-inbox" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>No query data yet</p>
                    </div>
                `;
                return;
            }
            
            const total = queryTypes.reduce((sum, [_, count]) => sum + count, 0);
            const colors = {
                analytical: '#6366f1',
                operational: '#10b981',
                predictive: '#f59e0b',
                alert: '#ef4444',
                aggregation: '#8b5cf6',
                general: '#64748b'
            };
            const icons = {
                analytical: 'fa-chart-line',
                operational: 'fa-list-check',
                predictive: 'fa-crystal-ball',
                alert: 'fa-exclamation-triangle',
                aggregation: 'fa-calculator',
                general: 'fa-comment'
            };
            
            let html = '';
            queryTypes.forEach(([type, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const color = colors[type] || '#64748b';
                const icon = icons[type] || 'fa-comment';
                
                html += `
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid ${color};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas ${icon}" style="color: ${color};"></i>
                                <span style="font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${type}</span>
                            </div>
                            <span style="font-weight: 700; color: var(--text-primary);">${count}</span>
                        </div>
                        <div style="background: var(--bg-tertiary); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="background: ${color}; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="margin-top: 0.25rem; font-size: 0.75rem; color: var(--text-tertiary); text-align: right;">
                            ${percentage}% of total
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        function populatePopularQueries(popularQueries) {
            const container = document.getElementById('popularQueriesContent');
            
            if (popularQueries.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-search" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>No queries yet</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            popularQueries.forEach((q, index) => {
                const stars = '⭐'.repeat(Math.round(q.satisfaction));
                
                html += `
                    <div style="margin-bottom: 0.75rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; transition: all 0.2s; cursor: pointer;" onmouseover="this.style.background='var(--hover-bg)'" onmouseout="this.style.background='var(--bg-secondary)'">
                        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0;">
                                ${index + 1}
                            </div>
                            <div style="flex: 1;">
                                <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 0.25rem; line-height: 1.4;">
                                    "${q.query}"
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--text-tertiary);">
                                    <span><i class="fas fa-fire"></i> ${q.count} times</span>
                                    <span>${stars} ${q.satisfaction.toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            container.innerHTML = html;
        }
        
        function populateRecentActivity(recentQueries) {
            const container = document.getElementById('recentActivityContent');
            
            if (recentQueries.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: var(--text-tertiary);">
                        <i class="fas fa-clock" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                        <p>No recent activity</p>
                    </div>
                `;
                return;
            }
            
            const typeColors = {
                analytical: '#6366f1',
                operational: '#10b981',
                predictive: '#f59e0b',
                alert: '#ef4444',
                aggregation: '#8b5cf6',
                general: '#64748b'
            };
            
            let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
            recentQueries.forEach(q => {
                const date = new Date(q.timestamp);
                const timeAgo = getTimeAgo(date);
                const color = typeColors[q.type] || '#64748b';
                
                const feedbackIcon = q.feedback 
                    ? (q.feedback.type === 'thumbs_up' ? '<i class="fas fa-thumbs-up" style="color: #10b981;"></i>' : '<i class="fas fa-thumbs-down" style="color: #ef4444;"></i>')
                    : '<i class="fas fa-minus" style="color: var(--text-tertiary);"></i>';
                
                html += `
                    <div style="padding: 1rem; background: var(--bg-secondary); border-radius: 8px; border-left: 3px solid ${color};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <div style="flex: 1;">
                                <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 0.5rem;">
                                    "${q.query}"
                                </div>
                                <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.75rem; color: var(--text-tertiary);">
                                    <span style="background: ${color}; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; text-transform: capitalize;">
                                        ${q.type}
                                    </span>
                                    <span><i class="fas fa-clock"></i> ${timeAgo}</span>
                                </div>
                            </div>
                            <div style="font-size: 1.2rem;">
                                ${feedbackIcon}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            
            container.innerHTML = html;
        }
        
        function getTimeAgo(date) {
            const seconds = Math.floor((new Date() - date) / 1000);
            
            if (seconds < 60) return 'Just now';
            if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
            if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
            if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
            return date.toLocaleDateString();
        }
        
        function clearLearningData() {
            if (!confirm('⚠️ Are you sure you want to clear all learning data? This cannot be undone.')) {
                return;
            }
            
            // Reset learning database
            promptLearningDB = {
                prompts: [],
                feedback: {},
                patterns: {},
                suggestions: [],
                analytics: {
                    totalQueries: 0,
                    successfulQueries: 0,
                    avgResponseTime: 0,
                    queryTypes: {},
                    commonQueries: []
                }
            };
            
            savePromptLearning();
            refreshLearningAnalytics();
            
            showNotification('🧹 All learning data cleared', 'success');
        }
        
        function updateLearningBadge() {
            const badge = document.getElementById('learningBadge');
            if (badge) {
                badge.textContent = promptLearningDB.analytics.totalQueries;
            }
        }


        // ==================== DATA VIEWER FUNCTIONS ====================
        function openDataViewer() {
            if (Object.keys(loadedDataSources).length === 0) {
                showNotification('⚠️ No data loaded yet', 'error');
                return;
            }
            
            const modal = document.getElementById('dataViewerModal');
            const tabsContainer = document.getElementById('dataViewerTabs');
            const contentContainer = document.getElementById('dataViewerContent');
            
            // Clear existing content
            tabsContainer.innerHTML = '';
            contentContainer.innerHTML = '';
            dataGrids = {};
            
            // Create tabs and content for each data source
            let firstTab = true;
            for (const [sourceId, sourceData] of Object.entries(loadedDataSources)) {
                const { source, data, sourceName, recordCount } = sourceData;
                
                // Create tab
                const tab = document.createElement('div');
                tab.className = `data-tab ${firstTab ? 'active' : ''}`;
                tab.innerHTML = `
                    <span>${sourceName}</span>
                    <span class="data-tab-badge">${recordCount}</span>
                `;
                tab.onclick = () => switchDataTab(sourceId);
                tabsContainer.appendChild(tab);
                
                // Create tab content
                const tabContent = document.createElement('div');
                tabContent.className = `data-tab-content ${firstTab ? 'active' : ''}`;
                tabContent.id = `tab-content-${sourceId}`;
                tabContent.innerHTML = `
                    <div class="data-source-info">
                        <div class="data-stats">
                            <div class="data-stat">
                                <i class="fas fa-table"></i>
                                <strong>${recordCount}</strong> records
                            </div>
                            <div class="data-stat">
                                <i class="fas fa-columns"></i>
                                <strong>${data.length > 0 ? Object.keys(data[0]).length : 0}</strong> columns
                            </div>
                            <div class="data-stat">
                                <i class="fas fa-database"></i>
                                <strong>${sourceName}</strong>
                            </div>
                        </div>
                        <div class="data-source-actions">
                            <button class="use-for-ai-btn ${aiSelectedSources.includes(sourceId) ? 'active' : ''}" 
                                    onclick="toggleAISource('${sourceId}')" 
                                    id="ai-btn-${sourceId}">
                                <i class="fas fa-robot"></i>
                                ${aiSelectedSources.includes(sourceId) ? 'Selected for AI' : 'Use for AI Prompting'}
                            </button>
                            <button class="btn btn-secondary" onclick="exportDataSource('${sourceId}')">
                                <i class="fas fa-download"></i> Export
                            </button>
                        </div>
                    </div>
                    <div class="data-grid-container" id="grid-${sourceId}"></div>
                `;
                contentContainer.appendChild(tabContent);
                
                firstTab = false;
            }
            
            // Initialize DevExpress grids
            setTimeout(() => {
                for (const [sourceId, sourceData] of Object.entries(loadedDataSources)) {
                    initializeDataGrid(sourceId, sourceData.data);
                }
            }, 100);
            
            modal.classList.add('show');
        }
        
        function initializeDataGrid(sourceId, data) {
            if (data.length === 0) {
                document.getElementById(`grid-${sourceId}`).innerHTML = '<p class="text-muted text-center p-4">No data available</p>';
                return;
            }
            
            // Get columns from first record
            const columns = Object.keys(data[0]).map(key => ({
                dataField: key,
                caption: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                width: 150
            }));
            
            try {
                const grid = $(`#grid-${sourceId}`).dxDataGrid({
                    dataSource: data,
                    columns: columns,
                    showBorders: true,
                    showRowLines: true,
                    showColumnLines: true,
                    rowAlternationEnabled: true,
                    columnAutoWidth: true,
                    allowColumnReordering: true,
                    allowColumnResizing: true,
                    columnResizingMode: 'widget',
                    wordWrapEnabled: false,
                    paging: {
                        pageSize: 50
                    },
                    pager: {
                        showPageSizeSelector: true,
                        allowedPageSizes: [20, 50, 100, 200, 500],
                        showInfo: true,
                        showNavigationButtons: true
                    },
                    filterRow: {
                        visible: true
                    },
                    headerFilter: {
                        visible: true
                    },
                    searchPanel: {
                        visible: true,
                        width: 240,
                        placeholder: 'Search...'
                    },
                    export: {
                        enabled: true,
                        fileName: loadedDataSources[sourceId].sourceName
                    },
                    columnChooser: {
                        enabled: true,
                        mode: 'select'
                    },
                    columnFixing: {
                        enabled: true
                    },
                    selection: {
                        mode: 'multiple',
                        showCheckBoxesMode: 'always'
                    },
                    hoverStateEnabled: true,
                    height: '100%'
                }).dxDataGrid('instance');
                
                dataGrids[sourceId] = grid;
            } catch (error) {
                console.error('Error initializing grid:', error);
                document.getElementById(`grid-${sourceId}`).innerHTML = `<p class="text-danger text-center p-4">Error loading grid: ${error.message}</p>`;
            }
        }
        
        function switchDataTab(sourceId) {
            // Update tabs
            document.querySelectorAll('.data-tab').forEach(tab => tab.classList.remove('active'));
            event.target.closest('.data-tab').classList.add('active');
            
            // Update tab contents
            document.querySelectorAll('.data-tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-content-${sourceId}`).classList.add('active');
            
            // Refresh grid if needed
            if (dataGrids[sourceId]) {
                dataGrids[sourceId].repaint();
            }
        }
        
        function toggleAISource(sourceId) {
            const index = aiSelectedSources.indexOf(sourceId);
            const btn = document.getElementById(`ai-btn-${sourceId}`);
            
            if (index > -1) {
                aiSelectedSources.splice(index, 1);
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-robot"></i> Use for AI Prompting';
                showNotification(`✅ Removed ${loadedDataSources[sourceId].sourceName} from AI context`, 'success');
            } else {
                aiSelectedSources.push(sourceId);
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-robot"></i> Selected for AI';
                showNotification(`✅ ${loadedDataSources[sourceId].sourceName} selected for AI prompting`, 'success');
            }
            
            updateAIDataContext();
        }
        
        function updateAIDataContext() {
            // Update wmsData to only include selected sources
            if (aiSelectedSources.length === 0) {
                // If nothing selected, use all data
                wmsData = [];
                for (const sourceData of Object.values(loadedDataSources)) {
                    wmsData = wmsData.concat(sourceData.data);
                }
            } else {
                // Use only selected sources
                wmsData = [];
                for (const sourceId of aiSelectedSources) {
                    if (loadedDataSources[sourceId]) {
                        wmsData = wmsData.concat(loadedDataSources[sourceId].data);
                    }
                }
            }
            
            console.log(`🤖 AI Context updated: ${wmsData.length} records from ${aiSelectedSources.length || 'all'} source(s)`);
        }
        
        function exportDataSource(sourceId) {
            if (dataGrids[sourceId]) {
                dataGrids[sourceId].exportToExcel();
            }
        }
        
        function exportAllData() {
            const allData = [];
            for (const sourceData of Object.values(loadedDataSources)) {
                allData.push(...sourceData.data);
            }
            
            // Convert to CSV
            if (allData.length === 0) {
                showNotification('⚠️ No data to export', 'error');
                return;
            }
            
            const headers = Object.keys(allData[0]);
            const csv = [
                headers.join(','),
                ...allData.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all-data-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showNotification('✅ Data exported successfully', 'success');
        }
        
        function closeDataViewer() {
            document.getElementById('dataViewerModal').classList.remove('show');
        }

		// ==================== EVENT LISTENERS & INITIALIZATION ====================

// ==================== INSIGHTS PANEL ====================

function toggleInsightsPanel() {
    const panel = document.getElementById('insightsPanel');
    const toggleBtn = document.getElementById('insightsToggleBtn');
    
    panel.classList.toggle('open');
    
    if (panel.classList.contains('open')) {
        toggleBtn.innerHTML = '<i class="fas fa-times"></i>';
        toggleBtn.title = 'Hide Insights';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-chart-bar"></i>';
        toggleBtn.title = 'Show Insights';
    }
}

document.getElementById('insightsToggleBtn').addEventListener('click', toggleInsightsPanel);

function generateDataInsights() {
    const contentDiv = document.getElementById('insightsPanelContent');
    
    if (Object.keys(loadedDataSources).length === 0) {
        contentDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem 2rem; color: var(--text-tertiary);">
                <i class="fas fa-database" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Load data to see insights and quick prompts</p>
            </div>
        `;
        // Hide toggle button
        document.getElementById('insightsToggleBtn').classList.remove('show');
        return;
    }
    
    // Build data source selector
    let html = '<div class="data-source-selector">';
    html += '<label><i class="fas fa-database"></i> Select Data Source</label>';
    html += '<select id="insightSourceSelect" onchange="updateInsightsForSource()">';
    
    // Get currently selected source if dropdown exists
    const currentSelect = document.getElementById('insightSourceSelect');
    const currentSourceId = currentSelect ? currentSelect.value : null;
    
    // Add "All Sources" option
    const allSelected = (!currentSourceId || currentSourceId === 'all') ? 'selected' : '';
    const totalRecords = Object.values(loadedDataSources).reduce((sum, s) => sum + s.recordCount, 0);
    html += `<option value="all" ${allSelected}>All Data Sources (${totalRecords} records)</option>`;
    
    // Add individual sources
    for (const [sourceId, sourceInfo] of Object.entries(loadedDataSources)) {
        const selected = currentSourceId === sourceId ? 'selected' : '';
        html += `<option value="${sourceId}" ${selected}>${sourceInfo.sourceName} (${sourceInfo.recordCount} records)</option>`;
    }
    
    html += '</select>';
    html += '</div>';
    
    contentDiv.innerHTML = html;
    
    // If we had a previous selection and it still exists, use it. Otherwise use "all"
    let sourceToShow = 'all';
    if (currentSourceId && (currentSourceId === 'all' || loadedDataSources[currentSourceId])) {
        sourceToShow = currentSourceId;
    }
    updateInsightsForSource(sourceToShow);
    
    // Show toggle button and auto-open panel
    document.getElementById('insightsToggleBtn').classList.add('show');
    document.getElementById('insightsPanel').classList.add('open');
    document.getElementById('insightsToggleBtn').innerHTML = '<i class="fas fa-times"></i>';
    document.getElementById('insightsToggleBtn').title = 'Hide Insights';
}

function updateInsightsForSource(sourceId = null) {
    const selectEl = document.getElementById('insightSourceSelect');
    if (!sourceId) {
        sourceId = selectEl.value;
    }
    
    // Update the dropdown to show correct selection
    if (selectEl && selectEl.value !== sourceId) {
        selectEl.value = sourceId;
    }
    
    const contentDiv = document.getElementById('insightsPanelContent');
    const selectorHTML = contentDiv.querySelector('.data-source-selector').outerHTML;
    
    // Handle "All Sources" option
    if (sourceId === 'all') {
        // Combine all data sources
        let allData = [];
        let sourceNames = [];
        
        for (const [id, sourceInfo] of Object.entries(loadedDataSources)) {
            // Add source identifier to each record
            const dataWithSource = sourceInfo.data.map(record => ({
                ...record,
                _SOURCE: sourceInfo.sourceName,
                _SOURCE_ID: id
            }));
            allData = allData.concat(dataWithSource);
            sourceNames.push(sourceInfo.sourceName);
        }
        
        // Use default analysis for combined data
        const insights = analyzeDataSource(allData, `All Sources (${sourceNames.join(', ')})`, 'all');
        contentDiv.innerHTML = selectorHTML + insights;
        return;
    }
    
    // Handle individual source
    const sourceInfo = loadedDataSources[sourceId];
    if (!sourceInfo) return;
    
    const data = sourceInfo.data;
    
    // Check if there are configured insights for this source
    const configuredInsights = insightsConfigurations[sourceId] || [];
    
    if (configuredInsights.length > 0) {
        // Use configured insights
        updateInsightsForSourceWithConfig(sourceId);
    } else {
        // Use default analysis
        const insights = analyzeDataSource(data, sourceInfo.sourceName, sourceId);
        contentDiv.innerHTML = selectorHTML + insights;
    }
}

function analyzeDataSource(data, sourceName, sourceId) {
    if (!data || data.length === 0) {
        return '<p style="text-align: center; color: var(--text-tertiary); padding: 2rem;">No data available</p>';
    }
    
    const columns = Object.keys(data[0]);
    const numericColumns = [];
    const textColumns = [];
    
    // Classify columns (excluding internal _SOURCE fields)
    columns.forEach(col => {
        if (col.startsWith('_SOURCE')) return; // Skip internal fields
        
        const sampleValues = data.slice(0, 100).map(row => row[col]);
        const numericCount = sampleValues.filter(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v))).length;
        
        if (numericCount > sampleValues.length * 0.8) {
            numericColumns.push(col);
        } else {
            textColumns.push(col);
        }
    });
    
    // Calculate statistics for numeric columns
    const numericStats = {};
    numericColumns.forEach(col => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v) && isFinite(v));
        if (values.length > 0) {
            numericStats[col] = {
                min: Math.min(...values),
                max: Math.max(...values),
                avg: (values.reduce((a, b) => a + b, 0) / values.length),
                sum: values.reduce((a, b) => a + b, 0)
            };
        }
    });
    
    // Find top values for text columns
    const topValues = {};
    textColumns.slice(0, 3).forEach(col => {
        const valueCounts = {};
        data.forEach(row => {
            const val = row[col];
            if (val) valueCounts[val] = (valueCounts[val] || 0) + 1;
        });
        const sorted = Object.entries(valueCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        if (sorted.length > 0) topValues[col] = sorted;
    });
    
    // Build HTML
    let html = '';
    
    // If this is "All Sources", show breakdown
    if (sourceId === 'all' && data[0]._SOURCE) {
        const sourceBreakdown = {};
        data.forEach(row => {
            const source = row._SOURCE;
            if (source) {
                sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
            }
        });
        
        html += `
            <div class="insight-section">
                <div class="insight-section-title">
                    <i class="fas fa-database"></i> Data Sources Breakdown
                </div>
        `;
        
        Object.entries(sourceBreakdown).forEach(([source, count]) => {
            const percentage = ((count / data.length) * 100).toFixed(1);
            html += `
                <div class="insight-stat" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--border-color);">
                    <span class="insight-stat-label" style="flex: 1;">${source}</span>
                    <span class="insight-stat-value" style="font-size: 0.9rem;">${count.toLocaleString()} records (${percentage}%)</span>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // Overview Section
    html += `
        <div class="insight-section">
            <div class="insight-section-title">
                <i class="fas fa-info-circle"></i> Overview
            </div>
            <div class="insight-stat">
                <span class="insight-stat-label">Total Records</span>
                <span class="insight-stat-value">${data.length.toLocaleString()}</span>
            </div>
            <div class="insight-stat">
                <span class="insight-stat-label">Total Columns</span>
                <span class="insight-stat-value">${columns.filter(c => !c.startsWith('_SOURCE')).length}</span>
            </div>
            <div class="insight-stat">
                <span class="insight-stat-label">Numeric Fields</span>
                <span class="insight-stat-value">${numericColumns.length}</span>
            </div>
            <div class="insight-stat">
                <span class="insight-stat-label">Text Fields</span>
                <span class="insight-stat-value">${textColumns.length}</span>
            </div>
        </div>
    `;
    
    // Numeric Statistics (top 3)
    if (Object.keys(numericStats).length > 0) {
        html += `
            <div class="insight-section">
                <div class="insight-section-title">
                    <i class="fas fa-calculator"></i> Key Metrics
                </div>
        `;
        
        Object.entries(numericStats).slice(0, 3).forEach(([col, stats]) => {
            html += `
                <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    <div style="font-weight: 600; color: var(--primary); margin-bottom: 0.5rem; font-size: 0.9rem;">
                        ${formatParameterLabel(col)}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-tertiary);">Min:</span>
                            <strong style="color: var(--text-primary);">${formatNumber(stats.min)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-tertiary);">Max:</span>
                            <strong style="color: var(--text-primary);">${formatNumber(stats.max)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-tertiary);">Avg:</span>
                            <strong style="color: var(--text-primary);">${formatNumber(stats.avg)}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-tertiary);">Total:</span>
                            <strong style="color: var(--success);">${formatNumber(stats.sum)}</strong>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    // Top Values (first text column)
    if (Object.keys(topValues).length > 0) {
        const firstCol = Object.keys(topValues)[0];
        const topEntries = topValues[firstCol];
        
        html += `
            <div class="insight-section">
                <div class="insight-section-title">
                    <i class="fas fa-star"></i> Top ${formatParameterLabel(firstCol)}
                </div>
                <ul class="insight-list">
        `;
        
        topEntries.forEach(([value, count], idx) => {
            const percentage = ((count / data.length) * 100).toFixed(1);
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•';
            html += `<li>${medal} <strong>${value}</strong> - ${count.toLocaleString()} (${percentage}%)</li>`;
        });
        
        html += '</ul></div>';
    }
    
    // Quick Prompts Section
    const prompts = generateQuickPrompts(data, sourceName, sourceId, numericStats, topValues);
    
    html += `
        <div class="insight-section quick-prompts-section">
            <div class="insight-section-title">
                <i class="fas fa-bolt"></i> Quick Insights
                <span style="margin-left: auto; font-size: 0.7rem; font-weight: normal; color: var(--success);">Instant • No AI</span>
            </div>
    `;
    
    prompts.forEach(prompt => {
        html += `
            <div class="quick-prompt" onclick="executeQuickPrompt('${prompt.id}', '${sourceId}')">
                <div class="quick-prompt-title">
                    <i class="${prompt.icon}"></i> ${prompt.title}
                    <span class="quick-prompt-badge">⚡ Instant</span>
                </div>
                <div class="quick-prompt-desc">${prompt.description}</div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // AI Prompts Section
    html += `
        <div class="insight-section" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1)); border: 2px solid var(--primary);">
            <div class="insight-section-title">
                <i class="fas fa-robot"></i> Ask AI for More
                <span style="margin-left: auto; font-size: 0.7rem; font-weight: normal; color: var(--primary);">Uses Claude API</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                Want deeper insights? Ask AI to analyze this data:
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="btn btn-sm" onclick="askAIAboutData('${sourceId}', 'patterns')" style="font-size: 0.8rem; padding: 0.5rem 0.75rem;">
                    <i class="fas fa-search"></i> Find Patterns
                </button>
                <button class="btn btn-sm" onclick="askAIAboutData('${sourceId}', 'insights')" style="font-size: 0.8rem; padding: 0.5rem 0.75rem;">
                    <i class="fas fa-lightbulb"></i> Key Insights
                </button>
                <button class="btn btn-sm" onclick="askAIAboutData('${sourceId}', 'anomalies')" style="font-size: 0.8rem; padding: 0.5rem 0.75rem;">
                    <i class="fas fa-exclamation-circle"></i> Anomalies
                </button>
            </div>
        </div>
    `;
    
    return html;
}

function generateQuickPrompts(data, sourceName, sourceId, numericStats, topValues) {
    const prompts = [];
    const columns = Object.keys(data[0]);
    
    // Summary
    prompts.push({
        id: 'summary',
        icon: 'fas fa-list-ul',
        title: 'Complete Summary',
        description: 'Comprehensive overview with all statistics'
    });
    
    // Distribution
    if (Object.keys(numericStats).length > 0) {
        prompts.push({
            id: 'distribution',
            icon: 'fas fa-chart-bar',
            title: 'Value Ranges',
            description: 'Min, max, quartiles for all numeric fields'
        });
    }
    
    // Top items
    if (Object.keys(topValues).length > 0) {
        prompts.push({
            id: 'topitems',
            icon: 'fas fa-trophy',
            title: 'Top Values',
            description: 'Most frequent items with counts and percentages'
        });
    }
    
    // Comparison
    if (Object.keys(numericStats).length >= 2) {
        prompts.push({
            id: 'comparison',
            icon: 'fas fa-balance-scale',
            title: 'Compare Metrics',
            description: 'Side-by-side comparison of key numbers'
        });
    }
    
    // Outliers
    if (Object.keys(numericStats).length > 0) {
        prompts.push({
            id: 'outliers',
            icon: 'fas fa-exclamation-triangle',
            title: 'Find Outliers',
            description: 'Identify unusual or extreme values'
        });
    }
    
    return prompts;
}

function formatNumber(num) {
    if (typeof num !== 'number') return num;
    if (num % 1 !== 0) return num.toFixed(2);
    return num.toLocaleString();
}

function executeQuickPrompt(promptId, sourceId) {
    const sourceData = loadedDataSources[sourceId];
    if (!sourceData) return;
    
    const data = sourceData.data;
    const sourceName = sourceData.sourceName;
    let result = '';
    
    switch (promptId) {
        case 'summary':
            result = generateSummaryInsight(data, sourceName);
            break;
        case 'distribution':
            result = generateDistributionInsight(data, sourceName);
            break;
        case 'topitems':
            result = generateTopItemsInsight(data, sourceName);
            break;
        case 'comparison':
            result = generateComparisonInsight(data, sourceName);
            break;
        case 'outliers':
            result = generateOutliersInsight(data, sourceName);
            break;
    }
    
    addMessage('assistant', result, true);
    toggleInsightsPanel();
    
    // Scroll to bottom
    const container = document.getElementById('messagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

function generateSummaryInsight(data, sourceName) {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => {
        const values = data.slice(0, 10).map(row => row[col]);
        return values.some(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    });
    
    let html = `<strong>📊 ${sourceName} - Complete Summary</strong><br><br>`;
    
    html += `<div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">`;
    html += `<strong>Dataset Overview:</strong><br>`;
    html += `• Total Records: <strong>${data.length.toLocaleString()}</strong><br>`;
    html += `• Total Columns: <strong>${columns.length}</strong><br>`;
    html += `• Numeric Fields: <strong>${numericCols.length}</strong><br>`;
    html += `• Text Fields: <strong>${columns.length - numericCols.length}</strong>`;
    html += `</div>`;
    
    if (numericCols.length > 0) {
        html += `<strong>Numeric Statistics:</strong><br>`;
        html += '<table class="data-table" style="width: 100%; margin-top: 0.5rem;">';
        html += '<thead><tr><th>Field</th><th>Min</th><th>Max</th><th>Average</th><th>Total</th></tr></thead><tbody>';
        
        numericCols.slice(0, 8).forEach(col => {
            const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v) && isFinite(v));
            if (values.length > 0) {
                const min = Math.min(...values);
                const max = Math.max(...values);
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const sum = values.reduce((a, b) => a + b, 0);
                html += `<tr>
                    <td><strong>${formatParameterLabel(col)}</strong></td>
                    <td>${formatNumber(min)}</td>
                    <td>${formatNumber(max)}</td>
                    <td>${formatNumber(avg)}</td>
                    <td>${formatNumber(sum)}</td>
                </tr>`;
            }
        });
        
        html += '</tbody></table>';
    }
    
    html += '<br><div style="background: rgba(99, 102, 241, 0.1); padding: 0.75rem; border-radius: 6px; font-size: 0.9rem;">';
    html += '💡 <strong>Tip:</strong> Click other quick insights for detailed breakdowns, or ask AI for deeper analysis!';
    html += '</div>';
    
    return html;
}

function generateDistributionInsight(data, sourceName) {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => {
        const values = data.slice(0, 10).map(row => row[col]);
        return values.some(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    });
    
    let html = `<strong>📈 ${sourceName} - Value Ranges & Distribution</strong><br><br>`;
    
    numericCols.slice(0, 5).forEach(col => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v) && isFinite(v));
        if (values.length === 0) return;
        
        const sorted = values.sort((a, b) => a - b);
        const min = sorted[0];
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const median = sorted[Math.floor(sorted.length * 0.5)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const max = sorted[sorted.length - 1];
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        
        html += `<div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">`;
        html += `<strong style="color: var(--primary);">${formatParameterLabel(col)}</strong><br><br>`;
        html += `<table class="data-table" style="width: 100%;">`;
        html += `<tr><td>Minimum</td><td style="text-align: right;"><strong>${formatNumber(min)}</strong></td></tr>`;
        html += `<tr><td>25th Percentile</td><td style="text-align: right;"><strong>${formatNumber(q1)}</strong></td></tr>`;
        html += `<tr><td>Median (50th)</td><td style="text-align: right;"><strong>${formatNumber(median)}</strong></td></tr>`;
        html += `<tr><td>Mean (Average)</td><td style="text-align: right;"><strong>${formatNumber(mean)}</strong></td></tr>`;
        html += `<tr><td>75th Percentile</td><td style="text-align: right;"><strong>${formatNumber(q3)}</strong></td></tr>`;
        html += `<tr><td>Maximum</td><td style="text-align: right;"><strong>${formatNumber(max)}</strong></td></tr>`;
        html += `<tr><td>Range</td><td style="text-align: right;"><strong>${formatNumber(max - min)}</strong></td></tr>`;
        html += `</table></div>`;
    });
    
    return html;
}

function generateTopItemsInsight(data, sourceName) {
    const columns = Object.keys(data[0]);
    const textCols = columns.filter(col => {
        const values = data.slice(0, 10).map(row => row[col]);
        return !values.some(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    });
    
    let html = `<strong>🏆 ${sourceName} - Top Values by Category</strong><br><br>`;
    
    textCols.slice(0, 3).forEach(col => {
        const valueCounts = {};
        data.forEach(row => {
            const val = row[col];
            if (val) valueCounts[val] = (valueCounts[val] || 0) + 1;
        });
        
        const sorted = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        if (sorted.length === 0) return;
        
        html += `<div style="margin-bottom: 1.5rem;">`;
        html += `<strong style="color: var(--primary); font-size: 1rem;">${formatParameterLabel(col)}</strong><br><br>`;
        html += '<table class="data-table" style="width: 100%;">';
        html += '<thead><tr><th>Rank</th><th>Value</th><th>Count</th><th>Percentage</th></tr></thead><tbody>';
        
        sorted.forEach(([value, count], idx) => {
            const percentage = ((count / data.length) * 100).toFixed(1);
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1);
            html += `<tr>
                <td style="text-align: center;">${medal}</td>
                <td><strong>${value}</strong></td>
                <td style="text-align: right;">${count.toLocaleString()}</td>
                <td style="text-align: right;">${percentage}%</td>
            </tr>`;
        });
        
        html += '</tbody></table></div>';
    });
    
    return html;
}

function generateComparisonInsight(data, sourceName) {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => {
        const values = data.slice(0, 10).map(row => row[col]);
        return values.some(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    }).slice(0, 5);
    
    let html = `<strong>⚖️ ${sourceName} - Metric Comparison</strong><br><br>`;
    
    html += '<table class="data-table" style="width: 100%;">';
    html += '<thead><tr><th>Metric</th><th>Min</th><th>Max</th><th>Average</th><th>Range</th><th>Total</th></tr></thead><tbody>';
    
    numericCols.forEach(col => {
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v) && isFinite(v));
        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const range = max - min;
            const sum = values.reduce((a, b) => a + b, 0);
            html += `<tr>
                <td><strong>${formatParameterLabel(col)}</strong></td>
                <td>${formatNumber(min)}</td>
                <td>${formatNumber(max)}</td>
                <td>${formatNumber(avg)}</td>
                <td>${formatNumber(range)}</td>
                <td style="color: var(--success); font-weight: 700;">${formatNumber(sum)}</td>
            </tr>`;
        }
    });
    
    html += '</tbody></table>';
    
    return html;
}

function generateOutliersInsight(data, sourceName) {
    const columns = Object.keys(data[0]);
    const numericCols = columns.filter(col => {
        const values = data.slice(0, 10).map(row => row[col]);
        return values.some(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)));
    }).slice(0, 3);
    
    let html = `<strong>⚠️ ${sourceName} - Outlier Detection</strong><br><br>`;
    
    numericCols.forEach(col => {
        const values = data.map((row, idx) => ({ value: parseFloat(row[col]), index: idx, row: row }))
            .filter(v => !isNaN(v.value) && isFinite(v.value));
        
        if (values.length === 0) return;
        
        const sorted = values.map(v => v.value).sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const outliers = values.filter(v => v.value < lowerBound || v.value > upperBound).slice(0, 10);
        
        html += `<div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">`;
        html += `<strong style="color: var(--primary);">${formatParameterLabel(col)}</strong><br><br>`;
        html += `<div style="font-size: 0.9rem; margin-bottom: 0.75rem;">`;
        html += `• Normal Range: <strong>${formatNumber(lowerBound)} - ${formatNumber(upperBound)}</strong><br>`;
        html += `• Outliers Found: <strong>${outliers.length}</strong> records`;
        html += `</div>`;
        
        if (outliers.length > 0) {
            html += '<table class="data-table" style="width: 100%; font-size: 0.85rem;">';
            html += '<thead><tr><th>Row</th><th>Value</th><th>Status</th></tr></thead><tbody>';
            outliers.forEach(o => {
                const status = o.value < lowerBound ? 'Below' : 'Above';
                const color = o.value < lowerBound ? 'var(--warning)' : 'var(--danger)';
                html += `<tr>
                    <td>${o.index + 1}</td>
                    <td><strong>${formatNumber(o.value)}</strong></td>
                    <td style="color: ${color};">${status} Range</td>
                </tr>`;
            });
            html += '</tbody></table>';
        } else {
            html += `<div style="color: var(--success); font-weight: 600;">✓ No significant outliers detected</div>`;
        }
        
        html += `</div>`;
    });
    
    return html;
}

function askAIAboutData(sourceId, type) {
    const sourceData = loadedDataSources[sourceId];
    if (!sourceData) return;
    
    let question = '';
    
    switch (type) {
        case 'patterns':
            question = `What interesting patterns or trends do you see in the ${sourceData.sourceName} data?`;
            break;
        case 'insights':
            question = `Give me the top 5 key insights from the ${sourceData.sourceName} data`;
            break;
        case 'anomalies':
            question = `Are there any anomalies or unusual patterns in the ${sourceData.sourceName} data?`;
            break;
    }
    
    document.getElementById('userInput').value = question;
    toggleInsightsPanel();
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('userInput').focus();
    }, 300);
}
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 WMS Auto Pilot v4 Initialized');
            
            // Initialize theme
            initTheme();
            
            // Initialize tabs
            initTabs();
            
            // Load endpoint configuration
            loadEndpointConfigToForm();
            
            // Update API status
            updateApiStatus();
            
            // Initialize Prompt Learning System
            initPromptLearning();
            updateLearningBadge();
            console.log('🧠 Prompt Learning System initialized');
            
            // Theme Toggle
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);
            
            // Header Buttons
            document.getElementById('conversationHistoryBtn').addEventListener('click', () => {
                document.getElementById('conversationHistoryModal').classList.add('show');
                loadConversationHistory();
            });
            
            document.getElementById('learningAnalyticsBtn').addEventListener('click', () => {
                openLearningAnalytics();
            });
            
            document.getElementById('dataSourcesBtn').addEventListener('click', () => {
                document.getElementById('dataSourcesModal').classList.add('show');
                loadDataSources();
            });
            
            document.getElementById('setupBtn').addEventListener('click', () => {
                document.getElementById('setupModal').classList.add('show');
            });
            
            document.getElementById('configApiBtn').addEventListener('click', () => {
                document.getElementById('apiModal').classList.add('show');
                const existingKey = localStorage.getItem('claude_api_key');
                if (existingKey) {
                    document.getElementById('apiKeyInputModal').value = existingKey;
                }
            });
            
            // Git Operations Button
            document.getElementById('gitBtn').addEventListener('click', openGitModal);
            
            document.getElementById('clearBtn').addEventListener('click', clearChat);
            
            // Data Status Click - Open Data Viewer
            document.getElementById('dataStatus').addEventListener('click', openDataViewer);
            
            // View Data Button - Open Data Viewer
            document.getElementById('viewDataBtn').addEventListener('click', openDataViewer);
            
            // Modal Close Buttons
            document.getElementById('closeSetupModal').addEventListener('click', () => {
                document.getElementById('setupModal').classList.remove('show');
            });
            
            document.getElementById('closeConversationHistoryModal').addEventListener('click', () => {
                document.getElementById('conversationHistoryModal').classList.remove('show');
            });
            
            document.getElementById('closeViewConversationModal').addEventListener('click', () => {
                document.getElementById('viewConversationModal').classList.remove('show');
            });
            
            document.getElementById('closeDataSourcesModal').addEventListener('click', () => {
                document.getElementById('dataSourcesModal').classList.remove('show');
            });
            
            document.getElementById('closeDataSourceParamsModal').addEventListener('click', () => {
                document.getElementById('dataSourceParamsModal').classList.remove('show');
            });
            
            document.getElementById('closeApiModal').addEventListener('click', () => {
                document.getElementById('apiModal').classList.remove('show');
            });
            
            // Close modals on background click
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });
            });
            
            // Chat Input
            document.getElementById('sendBtn').addEventListener('click', handleSend);
            document.getElementById('userInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                }
            });
            
            // Data Sources
            document.getElementById('loadDataBtn').addEventListener('click', loadSelectedData);
            
            // Parameter Modal
            document.getElementById('resetParamsBtn').addEventListener('click', resetParameters);
            document.getElementById('loadWithParamsBtn').addEventListener('click', () => {
                executeDataLoad();
            });
            
            // API Key Management
            document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKey);
            document.getElementById('removeApiKeyBtn').addEventListener('click', removeApiKey);
            
            // History Search and Filters
            document.getElementById('historySearch').addEventListener('input', filterConversations);
            document.getElementById('dataSourceFilter').addEventListener('change', filterConversations);
            document.getElementById('dateRangeFilter').addEventListener('change', filterConversations);
            
            // WebView2 Message Handler
            if (window.chrome?.webview) {
                window.chrome.webview.addEventListener('message', function(event) {
                    const response = event.data;
                    
                    console.log('📨 Received from C#:', response.action);
                    
                    if (response.action === "restResponse" && window.pendingRequests[response.requestId]) {
                        const callback = window.pendingRequests[response.requestId];
                        delete window.pendingRequests[response.requestId];
                        callback(null, response.data);
                    } 
                    else if (response.action === "claudeResponse" && window.pendingRequests[response.requestId]) {
                        const callback = window.pendingRequests[response.requestId];
                        delete window.pendingRequests[response.requestId];
                        
                        if (response.success) {
                            callback(null, response.data);
                        } else {
                            callback(response.error || 'Unknown error', null);
                        }
                    }
                    else if (response.action === "error" && window.pendingRequests[response.requestId]) {
                        const callback = window.pendingRequests[response.requestId];
                        delete window.pendingRequests[response.requestId];
                        callback(response.data?.message || 'Unknown error', null);
                    }
                });
                
                console.log('✅ WebView2 message handler registered');
            } else {
                console.warn('⚠️ WebView2 not available - running in browser mode');
            }
            
            // Keyboard Shortcuts
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + K: Focus search
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    const searchInput = document.getElementById('historySearch');
                    if (searchInput && document.getElementById('conversationHistoryModal').classList.contains('show')) {
                        searchInput.focus();
                    }
                }
                
                // Ctrl/Cmd + /: Open setup
                if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                    e.preventDefault();
                    document.getElementById('setupModal').classList.add('show');
                }
                
                // Ctrl/Cmd + H: Open history
                if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                    e.preventDefault();
                    document.getElementById('conversationHistoryModal').classList.add('show');
                    loadConversationHistory();
                }
                
                // Escape: Close all modals
                if (e.key === 'Escape') {
                    document.querySelectorAll('.modal').forEach(modal => {
                        modal.classList.remove('show');
                    });
                }
            });
            
            // Add CSS animations
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                /* Smooth scrolling */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Selection color */
                ::selection {
                    background: rgba(99, 102, 241, 0.3);
                    color: var(--text-primary);
                }
                
                /* Focus visible */
                *:focus-visible {
                    outline: 2px solid var(--primary);
                    outline-offset: 2px;
                }
                
                /* Data table styles */
                .data-table {
                    width: 100%;
                    margin-top: 1rem;
                    border-collapse: collapse;
                    font-size: 0.8rem;
                    background: rgba(15, 23, 42, 0.5);
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .data-table th {
                    background: rgba(99, 102, 241, 0.2);
                    color: var(--primary-light);
                    padding: 0.6rem;
                    text-align: left;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.7rem;
                    letter-spacing: 0.5px;
                }
                
                .data-table td {
                    background: var(--card-bg);
                    color: var(--text-secondary);
                    padding: 0.6rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .data-table tr:hover td {
                    background: var(--hover-bg);
                }
            `;
            document.head.appendChild(style);
            
            // Console styling
            console.log('%c🚀 WMS Auto Pilot v4', 'font-size: 20px; font-weight: bold; color: #6366f1;');
            console.log('%c✨ Theme System: Enabled', 'color: #10b981;');
            console.log('%c📊 Conversation History: Ready', 'color: #10b981;');
            console.log('%c⚙️ Setup & Configuration: Ready', 'color: #10b981;');
            console.log('%c🤖 Claude AI: Ready', 'color: #10b981;');
            console.log('%c📝 Parameters System: Ready', 'color: #10b981;');
            
            // Log system info
            console.log('%cSystem Information:', 'font-weight: bold; color: #6366f1;');
            console.log('Browser:', navigator.userAgent.substring(0, 50) + '...');
            console.log('Screen:', `${screen.width}x${screen.height}`);
            console.log('Viewport:', `${window.innerWidth}x${window.innerHeight}`);
            console.log('Theme:', currentTheme);
            console.log('Online:', navigator.onLine);
            
            // Export to window for debugging
            window.WMSAutoPilot = {
                setTheme,
                toggleTheme,
                saveEndpointConfig,
                testEndpoint,
                loadConversationHistory,
                loadDataSources,
                showNotification,
                get currentTheme() { return currentTheme; },
                get currentSessionId() { return currentSessionId; },
                get wmsData() { return wmsData; },
                get conversationsCache() { return conversationsCache; },
                get selectedDataSources() { return selectedDataSources; }
            };
            
            console.log('%c📦 WMSAutoPilot API exported to window', 'color: #10b981;');
            console.log('Access via: window.WMSAutoPilot');
            console.log('%c✅ Initialization Complete!', 'font-size: 14px; font-weight: bold; color: #10b981;');
        });
        

        // ==================== ADVANCED INSIGHTS CONFIGURATION ====================
// ==================== INSIGHTS CONFIGURATION SYSTEM ====================

// Store insights configurations
let insightsConfigurations = {};
let currentConfigSourceId = null;
let currentSourceDataForConfig = null;

// Load insights configurations from localStorage
function loadInsightsConfigurations() {
    const stored = localStorage.getItem('insights_configurations');
    if (stored) {
        try {
            insightsConfigurations = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading insights configurations:', e);
            insightsConfigurations = {};
        }
    }
}

// Save insights configurations to localStorage
function saveInsightsConfigurations() {
    localStorage.setItem('insights_configurations', JSON.stringify(insightsConfigurations));
    showNotification('✅ Insights configuration saved', 'success');
}

// Open Insights Configuration Modal
function openInsightsConfig(preselectedSourceId = null) {
    const modal = document.getElementById('insightsConfigModal');
    const select = document.getElementById('insightConfigSourceSelect');
    
    // If no preselected source provided, get it from insights panel
    if (!preselectedSourceId) {
        const insightSelect = document.getElementById('insightSourceSelect');
        if (insightSelect && insightSelect.value && insightSelect.value !== 'all') {
            preselectedSourceId = insightSelect.value;
        }
    }
    
    // Populate data sources (exclude "all" option)
    select.innerHTML = '<option value="">-- Choose Data Source --</option>';
    
    for (const [sourceId, sourceInfo] of Object.entries(loadedDataSources)) {
        const option = document.createElement('option');
        option.value = sourceId;
        option.textContent = `${sourceInfo.sourceName} (${sourceInfo.recordCount} records)`;
        
        // Pre-select if this is the source from insights panel
        if (sourceId === preselectedSourceId) {
            option.selected = true;
        }
        
        select.appendChild(option);
    }
    
    modal.classList.add('show');
    
    // If we have a preselected source, load it immediately
    if (preselectedSourceId) {
        loadSourceForInsightConfig();
    }
}

// Close Insights Configuration Modal
function closeInsightsConfig() {
    document.getElementById('insightsConfigModal').classList.remove('show');
    currentConfigSourceId = null;
    currentSourceDataForConfig = null;
}

// Load source data for configuration
function loadSourceForInsightConfig() {
    const select = document.getElementById('insightConfigSourceSelect');
    const sourceId = select.value;
    
    console.log('loadSourceForInsightConfig called with sourceId:', sourceId);
    
    if (!sourceId) {
        // Clear everything when no source selected
        document.getElementById('columnsListContainer').innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-tertiary);">
                <i class="fas fa-arrow-up" style="font-size: 2rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>Select a data source to see columns</p>
            </div>
        `;
        document.getElementById('columnCountBadge').textContent = '0';
        document.getElementById('configuredInsightsList').innerHTML = `
            <div style="text-align: center; padding: 3rem 2rem; color: var(--text-tertiary);">
                <i class="fas fa-magic" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p style="margin-bottom: 1rem;">No insights configured yet</p>
                <button class="btn btn-primary" onclick="showInsightCreator()" disabled id="addInsightBtn2">
                    <i class="fas fa-plus"></i> Create Your First Insight
                </button>
            </div>
        `;
        document.getElementById('aiSuggestionsPanel').style.display = 'none';
        document.getElementById('addInsightBtn').disabled = true;
        document.getElementById('addInsightBtn2').disabled = true;
        currentConfigSourceId = null;
        currentSourceDataForConfig = null;
        return;
    }
    
    // Get the source info from loadedDataSources
    const sourceInfo = loadedDataSources[sourceId];
    
    if (!sourceInfo || !sourceInfo.data) {
        console.error('Source not found:', sourceId);
        document.getElementById('columnsListContainer').innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-danger);">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Error loading source data</p>
            </div>
        `;
        return;
    }
    
    // Set the current config data to ONLY this source's data
    currentConfigSourceId = sourceId;
    currentSourceDataForConfig = sourceInfo.data;
    
    // Log for debugging
    console.log('=== Loading Config for Source ===');
    console.log('Source ID:', sourceId);
    console.log('Source name:', sourceInfo.sourceName);
    console.log('Data records:', sourceInfo.data.length);
    console.log('Columns:', Object.keys(sourceInfo.data[0] || {}));
    console.log('================================');
    
    // Enable add buttons
    document.getElementById('addInsightBtn').disabled = false;
    const btn2 = document.getElementById('addInsightBtn2');
    if (btn2) btn2.disabled = false;
    
    // REFRESH ALL SECTIONS
    console.log('Refreshing columns...');
    displayColumnsForConfig();
    
    console.log('Refreshing configured insights...');
    displayConfiguredInsights();
    
    console.log('Generating AI suggestions...');
    generateAISuggestions();
    
    console.log('All sections refreshed!');
}

// Display columns with analysis
function displayColumnsForConfig() {
    const data = currentSourceDataForConfig;
    if (!data || data.length === 0) return;
    
    const allColumns = Object.keys(data[0]);
    
    // Filter out internal _SOURCE fields
    const columns = allColumns.filter(col => !col.startsWith('_SOURCE'));
    
    document.getElementById('columnCountBadge').textContent = columns.length;
    
    let html = '';
    
    columns.forEach(col => {
        // Analyze column
        const analysis = analyzeColumn(data, col);
        
        html += `
            <div class="column-item">
                <div class="column-item-header">
                    <span class="column-name">${formatParameterLabel(col)}</span>
                    <span class="column-type ${analysis.type}">${analysis.type.toUpperCase()}</span>
                </div>
                <div class="column-stats">
                    ${analysis.type === 'numeric' ? `
                        <span><i class="fas fa-arrow-down"></i> Min: <strong>${formatNumber(analysis.min)}</strong></span>
                        <span><i class="fas fa-arrow-up"></i> Max: <strong>${formatNumber(analysis.max)}</strong></span>
                        <span><i class="fas fa-chart-line"></i> Avg: <strong>${formatNumber(analysis.avg)}</strong></span>
                    ` : `
                        <span><i class="fas fa-hashtag"></i> Unique: <strong>${analysis.unique}</strong></span>
                        <span><i class="fas fa-star"></i> Top: <strong>${analysis.topValue}</strong> (${analysis.topCount})</span>
                    `}
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-tertiary); font-style: italic;">
                    ${analysis.samples.slice(0, 3).join(', ')}...
                </div>
            </div>
        `;
    });
    
    document.getElementById('columnsListContainer').innerHTML = html;
}

// Analyze a column
function analyzeColumn(data, columnName) {
    const values = data.map(row => row[columnName]);
    const sampleValues = data.slice(0, 100).map(row => row[columnName]);
    
    // Determine type
    const numericCount = sampleValues.filter(v => !isNaN(parseFloat(v)) && isFinite(parseFloat(v))).length;
    const isNumeric = numericCount > sampleValues.length * 0.8;
    
    const analysis = {
        name: columnName,
        type: isNumeric ? 'numeric' : 'text',
        samples: values.slice(0, 5).filter(v => v != null)
    };
    
    if (isNumeric) {
        const numValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v) && isFinite(v));
        analysis.min = Math.min(...numValues);
        analysis.max = Math.max(...numValues);
        analysis.avg = numValues.reduce((a, b) => a + b, 0) / numValues.length;
        analysis.sum = numValues.reduce((a, b) => a + b, 0);
    } else {
        const uniqueValues = [...new Set(values.filter(v => v != null))];
        analysis.unique = uniqueValues.length;
        
        const valueCounts = {};
        values.forEach(v => {
            if (v != null) valueCounts[v] = (valueCounts[v] || 0) + 1;
        });
        
        const sorted = Object.entries(valueCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length > 0) {
            analysis.topValue = sorted[0][0];
            analysis.topCount = sorted[0][1];
        }
    }
    
    return analysis;
}

// Display configured insights for current source
function displayConfiguredInsights() {
    const sourceId = currentConfigSourceId;
    const sourceInsights = insightsConfigurations[sourceId] || [];
    
    const container = document.getElementById('configuredInsightsList');
    
    if (sourceInsights.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 2rem; color: var(--text-tertiary);">
                <i class="fas fa-magic" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p style="margin-bottom: 1rem;">No insights configured for this data source yet</p>
                <button class="btn btn-primary" onclick="showInsightCreator()">
                    <i class="fas fa-plus"></i> Create Your First Insight
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    sourceInsights.forEach((insight, index) => {
        html += `
            <div class="insight-card">
                <div class="insight-card-header">
                    <div class="insight-card-title">
                        <i class="fas ${insight.icon}"></i>
                        ${insight.name}
                    </div>
                    <span class="insight-card-type">${insight.type.toUpperCase()}</span>
                </div>
                <div class="insight-card-body">
                    ${insight.description || 'No description'}
                </div>
                <div class="insight-card-config">
                    <span class="insight-card-config-item">
                        <i class="fas fa-columns"></i> Column: ${formatParameterLabel(insight.primaryColumn)}
                    </span>
                    ${insight.secondaryColumn ? `
                        <span class="insight-card-config-item">
                            <i class="fas fa-calculator"></i> Value: ${formatParameterLabel(insight.secondaryColumn)}
                        </span>
                    ` : ''}
                    ${insight.limit ? `
                        <span class="insight-card-config-item">
                            <i class="fas fa-hashtag"></i> Limit: ${insight.limit}
                        </span>
                    ` : ''}
                    <span class="insight-card-config-item">
                        <i class="fas fa-eye"></i> Format: ${insight.format}
                    </span>
                </div>
                <div class="insight-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="testSingleInsight(${index})">
                        <i class="fas fa-play"></i> Test
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editInsight(${index})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInsight(${index})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Generate AI suggestions for insights
function generateAISuggestions() {
    const data = currentSourceDataForConfig;
    if (!data || data.length === 0) {
        document.getElementById('aiSuggestionsPanel').style.display = 'none';
        return;
    }
    
    const allColumns = Object.keys(data[0]);
    // Filter out internal _SOURCE fields
    const columns = allColumns.filter(col => !col.startsWith('_SOURCE'));
    
    const suggestions = [];
    
    // Analyze columns for suggestions
    columns.forEach(col => {
        const analysis = analyzeColumn(data, col);
        
        if (analysis.type === 'numeric') {
            suggestions.push({
                name: `Top ${formatParameterLabel(col)}`,
                type: 'top',
                primaryColumn: col,
                icon: 'fa-trophy',
                description: `Show highest ${formatParameterLabel(col)} values`
            });
            
            suggestions.push({
                name: `${formatParameterLabel(col)} Summary`,
                type: 'summary',
                primaryColumn: col,
                icon: 'fa-calculator',
                description: `Statistical summary of ${formatParameterLabel(col)}`
            });
        } else {
            if (analysis.unique < data.length * 0.5) {
                suggestions.push({
                    name: `Count by ${formatParameterLabel(col)}`,
                    type: 'count',
                    primaryColumn: col,
                    icon: 'fa-chart-bar',
                    description: `Count occurrences of each ${formatParameterLabel(col)}`
                });
            }
        }
    });
    
    // Find good aggregation combinations
    const textCols = columns.filter(col => analyzeColumn(data, col).type === 'text');
    const numericCols = columns.filter(col => analyzeColumn(data, col).type === 'numeric');
    
    if (textCols.length > 0 && numericCols.length > 0) {
        const textCol = textCols[0];
        const numCol = numericCols[0];
        
        suggestions.push({
            name: `Sum ${formatParameterLabel(numCol)} by ${formatParameterLabel(textCol)}`,
            type: 'sum',
            primaryColumn: textCol,
            secondaryColumn: numCol,
            icon: 'fa-calculator',
            description: `Total ${formatParameterLabel(numCol)} grouped by ${formatParameterLabel(textCol)}`
        });
    }
    
    // Display suggestions
    const container = document.getElementById('aiSuggestionsList');
    const panel = document.getElementById('aiSuggestionsPanel');
    
    if (suggestions.length === 0) {
        panel.style.display = 'none';
        return;
    }
    
    panel.style.display = 'block';
    
    let html = '';
    suggestions.slice(0, 6).forEach((suggestion, index) => {
        html += `
            <div class="ai-suggestion-chip" onclick='applyAISuggestion(${JSON.stringify(suggestion).replace(/'/g, "&#39;")})'>
                <i class="fas ${suggestion.icon}"></i>
                ${suggestion.name}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Apply AI suggestion
function applyAISuggestion(suggestion) {
    showInsightCreator();
    
    // Fill form with suggestion
    document.getElementById('insightName').value = suggestion.name;
    document.getElementById('insightType').value = suggestion.type;
    document.getElementById('insightDescription').value = suggestion.description || '';
    document.getElementById('insightIcon').value = suggestion.icon;
    
    updateInsightTypeOptions();
    
    setTimeout(() => {
        document.getElementById('insightPrimaryColumn').value = suggestion.primaryColumn;
        if (suggestion.secondaryColumn) {
            document.getElementById('insightSecondaryColumn').value = suggestion.secondaryColumn;
        }
        previewInsight();
    }, 100);
}

// Show insight creator modal
function showInsightCreator() {
    if (!currentConfigSourceId) {
        showNotification('⚠️ Please select a data source first', 'error');
        return;
    }
    
    // Reset form
    document.getElementById('insightCreatorForm').reset();
    document.getElementById('insightPreview').style.display = 'none';
    
    // Clear table columns container for new insights
    const tableContainer = document.getElementById('tableColumnsContainer');
    if (tableContainer) {
        tableContainer.innerHTML = '<div style="text-align: center; padding: 2rem 1rem; color: var(--text-tertiary); font-size: 0.85rem;"><i class="fas fa-info-circle"></i> Click "Add Column" to start building your table</div>';
    }
    
    // Reset table column counter
    tableColumnCounter = 0;
    
    // Clear edit index
    delete document.getElementById('insightCreatorForm').dataset.editIndex;
    
    // Populate column dropdowns
    const data = currentSourceDataForConfig;
    const columns = Object.keys(data[0]);
    
    const primarySelect = document.getElementById('insightPrimaryColumn');
    const secondarySelect = document.getElementById('insightSecondaryColumn');
    
    primarySelect.innerHTML = '<option value="">-- Select Column --</option>';
    secondarySelect.innerHTML = '<option value="">-- Select Column --</option>';
    
    columns.forEach(col => {
        const analysis = analyzeColumn(data, col);
        const option1 = document.createElement('option');
        option1.value = col;
        option1.textContent = `${formatParameterLabel(col)} (${analysis.type})`;
        primarySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = col;
        option2.textContent = `${formatParameterLabel(col)} (${analysis.type})`;
        secondarySelect.appendChild(option2);
    });
    
    document.getElementById('insightCreatorModal').classList.add('show');
}

// Close insight creator
function closeInsightCreator() {
    document.getElementById('insightCreatorModal').classList.remove('show');
}

// Update insight type options
function updateInsightTypeOptions() {
    const type = document.getElementById('insightType').value;
    
    // Show/hide Table configuration
    document.getElementById('tableConfigSection').style.display = 
        type === 'table' ? 'block' : 'none';
    
    // Hide other fields for Table type
    if (type === 'table') {
        document.getElementById('primaryColumnGroup').style.display = 'none';
        document.getElementById('secondaryColumnGroup').style.display = 'none';
        document.getElementById('limitGroup').style.display = 'none';
        document.getElementById('sortOrderGroup').style.display = 'none';
        document.getElementById('percentageGroup').style.display = 'none';
        return;
    }
    
    // Show relevant fields for other types
    document.getElementById('primaryColumnGroup').style.display = 'block';
    
    // Show/hide relevant fields
    document.getElementById('secondaryColumnGroup').style.display = 
        ['sum', 'avg', 'count'].includes(type) ? 'block' : 'none';
    
    document.getElementById('limitGroup').style.display = 
        ['top', 'bottom'].includes(type) ? 'block' : 'none';
    
    document.getElementById('sortOrderGroup').style.display = 
        ['top', 'bottom', 'count', 'sum', 'avg'].includes(type) ? 'block' : 'none';
    
    document.getElementById('percentageGroup').style.display = 
        ['count', 'sum'].includes(type) ? 'block' : 'none';
}

// Update column sample data
function updateColumnSampleData(which) {
    const colSelect = which === 'primary' ? 
        document.getElementById('insightPrimaryColumn') : 
        document.getElementById('insightSecondaryColumn');
    
    const columnName = colSelect.value;
    if (!columnName) return;
    
    const data = currentSourceDataForConfig;
    const samples = data.slice(0, 5).map(row => row[columnName]).filter(v => v != null);
    
    const sampleDiv = which === 'primary' ? 
        document.getElementById('primaryColumnSample') :
        document.getElementById('secondaryColumnSample');
    
    const sampleSpan = which === 'primary' ?
        document.getElementById('primarySampleValues') :
        document.getElementById('secondarySampleValues');
    
    sampleSpan.textContent = samples.join(', ');
    sampleDiv.style.display = 'block';
}

// Preview insight
// Preview insight with improved validation
function previewInsight() {
    const insightType = document.getElementById('insightType').value;
    const primaryColumn = document.getElementById('insightPrimaryColumn').value;
    const secondaryColumn = document.getElementById('insightSecondaryColumn').value;
    const name = document.getElementById('insightName').value;
    
    // Array to collect missing fields
    const missingFields = [];
    
    // Validate required fields with visual feedback
    if (!name || name.trim() === '') {
        missingFields.push('Insight Name');
        document.getElementById('insightName').style.borderColor = 'var(--danger)';
    } else {
        document.getElementById('insightName').style.borderColor = '';
    }
    
    if (!insightType) {
        missingFields.push('Insight Type');
        document.getElementById('insightType').style.borderColor = 'var(--danger)';
    } else {
        document.getElementById('insightType').style.borderColor = '';
    }
    
    // Check if we're in table mode or regular insight mode
    if (insightType === 'table') {
        // Table Report Validation
        const tableColumns = document.querySelectorAll('#tableColumnsContainer > div[id^="tableCol_"]');
        
        if (tableColumns.length === 0) {
            missingFields.push('at least one Table Column');
            showNotification('⚠️ Please add at least one column to your table report', 'error');
            return;
        }
        
        // Validate each table column using dataset
        let hasInvalidColumns = false;
        tableColumns.forEach((colDiv, index) => {
            if (colDiv.dataset.config) {
                try {
                    const config = JSON.parse(colDiv.dataset.config);
                    if (!config.header || !config.source) {
                        hasInvalidColumns = true;
                        colDiv.style.borderColor = 'var(--danger)';
                        colDiv.style.borderWidth = '2px';
                    } else {
                        colDiv.style.borderColor = '';
                        colDiv.style.borderWidth = '1px';
                    }
                } catch (e) {
                    hasInvalidColumns = true;
                    colDiv.style.borderColor = 'var(--danger)';
                    colDiv.style.borderWidth = '2px';
                }
            } else {
                hasInvalidColumns = true;
                colDiv.style.borderColor = 'var(--danger)';
                colDiv.style.borderWidth = '2px';
            }
        });
        
        if (hasInvalidColumns) {
            showNotification('⚠️ All table columns must have a Header and Data Source selected', 'error');
            return;
        }
    } else {
        // Regular Insight Validation
        if (!primaryColumn) {
            missingFields.push('Primary Column');
            document.getElementById('insightPrimaryColumn').style.borderColor = 'var(--danger)';
        } else {
            document.getElementById('insightPrimaryColumn').style.borderColor = '';
        }
        
        // Check if secondary column is required for this insight type
        const typesRequiringSecondary = ['sum', 'avg', 'comparison', 'count'];
        if (typesRequiringSecondary.includes(insightType)) {
            const secondaryGroup = document.getElementById('secondaryColumnGroup');
            if (secondaryGroup && secondaryGroup.style.display !== 'none') {
                if (!secondaryColumn) {
                    missingFields.push('Value Column (Secondary)');
                    document.getElementById('insightSecondaryColumn').style.borderColor = 'var(--danger)';
                } else {
                    document.getElementById('insightSecondaryColumn').style.borderColor = '';
                }
            }
        }
    }
    
    // Show specific error message
    if (missingFields.length > 0) {
        const fieldsList = missingFields.join(', ');
        showNotification(`⚠️ Please fill in the following required fields: ${fieldsList}`, 'error', 5000);
        
        // Scroll to first missing field
        const firstMissingField = document.querySelector('[style*="border-color: var(--danger)"]');
        if (firstMissingField) {
            firstMissingField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Build configuration object
    const config = {
        name: name,
        type: insightType,
        primaryColumn: primaryColumn,
        secondaryColumn: secondaryColumn,
        limit: parseInt(document.getElementById('insightLimit').value) || 10,
        sortOrder: document.getElementById('insightSortOrder').value,
        format: document.getElementById('insightFormat').value,
        showPercentage: document.getElementById('insightShowPercentage').checked,
        icon: document.getElementById('insightIcon').value,
        description: document.getElementById('insightDescription').value
    };
    
    // Add table configuration if in table mode
    if (insightType === 'table') {
        config.tableConfig = getTableConfiguration();
    }
    
    // Store config for PDF download
    currentPreviewConfig = config;
    
    // Generate preview
    try {
        let result;
        
        if (insightType === 'table') {
            // For table reports, use dedicated table PDF generator
            result = generateTableReport(currentSourceDataForConfig, config, true);
        } else {
            // For all other insights (charts, stats, etc.), generate HTML first
            const htmlContent = executeInsightLogic(config, currentSourceDataForConfig);
            
            // Wait a moment for charts to render, then generate PDF
            document.getElementById('insightPreviewContent').innerHTML = htmlContent;
            document.getElementById('insightPreview').style.display = 'block';
            
            setTimeout(() => {
                // Now generate PDF from the rendered HTML
                const pdfResult = generateUniversalPDF(config, currentSourceDataForConfig, htmlContent);
                document.getElementById('insightPreviewContent').innerHTML = pdfResult;
            }, 500); // Wait 500ms for chart rendering
            
            return; // Exit early since we're using setTimeout
        }
            
        document.getElementById('insightPreviewContent').innerHTML = result;
        document.getElementById('insightPreview').style.display = 'block';
        
        // Scroll to preview
        document.getElementById('insightPreview').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        showNotification('✅ Preview generated successfully!', 'success');
    } catch (error) {
        showNotification('❌ Error generating preview: ' + error.message, 'error');
        console.error('Preview error:', error);
    }
}

// Save insight with improved validation
function saveInsight() {
    const insightType = document.getElementById('insightType').value;
    const primaryColumn = document.getElementById('insightPrimaryColumn').value;
    const secondaryColumn = document.getElementById('insightSecondaryColumn').value;
    const name = document.getElementById('insightName').value;
    
    // Array to collect missing fields
    const missingFields = [];
    
    // Validate required fields with visual feedback
    if (!name || name.trim() === '') {
        missingFields.push('Insight Name');
        document.getElementById('insightName').style.borderColor = 'var(--danger)';
    } else {
        document.getElementById('insightName').style.borderColor = '';
    }
    
    if (!insightType) {
        missingFields.push('Insight Type');
        document.getElementById('insightType').style.borderColor = 'var(--danger)';
    } else {
        document.getElementById('insightType').style.borderColor = '';
    }
    
    // Check if we're in table mode or regular insight mode
    if (insightType === 'table') {
        // Table Report Validation
        const tableColumns = document.querySelectorAll('#tableColumnsContainer > div[id^="tableCol_"]');
        
        if (tableColumns.length === 0) {
            missingFields.push('at least one Table Column');
            showNotification('⚠️ Please add at least one column to your table report', 'error');
            return;
        }
        
        // Validate each table column using dataset
        let hasInvalidColumns = false;
        tableColumns.forEach((colDiv, index) => {
            if (colDiv.dataset.config) {
                try {
                    const config = JSON.parse(colDiv.dataset.config);
                    if (!config.header || !config.source) {
                        hasInvalidColumns = true;
                        colDiv.style.borderColor = 'var(--danger)';
                        colDiv.style.borderWidth = '2px';
                    } else {
                        colDiv.style.borderColor = '';
                        colDiv.style.borderWidth = '1px';
                    }
                } catch (e) {
                    hasInvalidColumns = true;
                    colDiv.style.borderColor = 'var(--danger)';
                    colDiv.style.borderWidth = '2px';
                }
            } else {
                hasInvalidColumns = true;
                colDiv.style.borderColor = 'var(--danger)';
                colDiv.style.borderWidth = '2px';
            }
        });
        
        if (hasInvalidColumns) {
            showNotification('⚠️ All table columns must have a Header and Data Source selected', 'error');
            return;
        }
    } else {
        // Regular Insight Validation
        if (!primaryColumn) {
            missingFields.push('Primary Column');
            document.getElementById('insightPrimaryColumn').style.borderColor = 'var(--danger)';
        } else {
            document.getElementById('insightPrimaryColumn').style.borderColor = '';
        }
        
        // Check if secondary column is required for this insight type
        const typesRequiringSecondary = ['sum', 'avg', 'comparison', 'count'];
        if (typesRequiringSecondary.includes(insightType)) {
            const secondaryGroup = document.getElementById('secondaryColumnGroup');
            if (secondaryGroup && secondaryGroup.style.display !== 'none') {
                if (!secondaryColumn) {
                    missingFields.push('Value Column (Secondary)');
                    document.getElementById('insightSecondaryColumn').style.borderColor = 'var(--danger)';
                } else {
                    document.getElementById('insightSecondaryColumn').style.borderColor = '';
                }
            }
        }
    }
    
    // Show specific error message
    if (missingFields.length > 0) {
        const fieldsList = missingFields.join(', ');
        showNotification(`⚠️ Please fill in the following required fields: ${fieldsList}`, 'error', 5000);
        
        // Scroll to first missing field
        const firstMissingField = document.querySelector('[style*="border-color: var(--danger)"]');
        if (firstMissingField) {
            firstMissingField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    // Build configuration object
    const config = {
        name: name,
        type: insightType,
        primaryColumn: primaryColumn,
        secondaryColumn: secondaryColumn,
        limit: parseInt(document.getElementById('insightLimit').value) || 10,
        sortOrder: document.getElementById('insightSortOrder').value,
        format: document.getElementById('insightFormat').value,
        showPercentage: document.getElementById('insightShowPercentage').checked,
        icon: document.getElementById('insightIcon').value,
        description: document.getElementById('insightDescription').value
    };
    
    // Add table configuration if in table mode
    if (insightType === 'table') {
        config.tableConfig = getTableConfiguration();
    }
    
    // Save to configurations
    if (!insightsConfigurations[currentConfigSourceId]) {
        insightsConfigurations[currentConfigSourceId] = [];
    }
    
    insightsConfigurations[currentConfigSourceId].push(config);
    saveInsightsConfigurations();
    
    closeInsightCreator();
    displayConfiguredInsights();
    
    // Regenerate insights panel
    generateDataInsights();
    
    showNotification('✅ Insight saved successfully!', 'success');
}

// ==================== TABLE REPORT FUNCTIONS ====================

let tableColumnCounter = 0;

// Add table column
function addTableColumn() {
    openColumnEditor();
}

// Remove table column
function removeTableColumn(columnId) {
    document.getElementById(columnId).remove();
    
    const container = document.getElementById('tableColumnsContainer');
    if (container.children.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem 1rem; color: var(--text-tertiary); font-size: 0.85rem;">
                <i class="fas fa-info-circle"></i> Click "Add Column" to start building your table
            </div>
        `;
    }
    
    updateTableTotalsConfig();
}

// Toggle format options for column
function toggleTableColumnFormatOptions(selectEl, columnId) {
    const format = selectEl.value;
    const columnDiv = document.getElementById(columnId);
    const optionsDiv = columnDiv.querySelector('.table-col-format-options');
    
    let optionsHTML = '';
    
    switch (format) {
        case 'currency':
            optionsHTML = `
                <label style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block;">Currency Symbol</label>
                <select class="form-control table-col-currency" style="font-size: 0.8rem;">
                    <option value="$">$ USD</option>
                    <option value="€">€ EUR</option>
                    <option value="£">£ GBP</option>
                    <option value="¥">¥ JPY</option>
                    <option value="₹">₹ INR</option>
                </select>
            `;
            break;
            
        case 'boolean':
            optionsHTML = `
                <label style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block;">True Values (comma-separated)</label>
                <input type="text" class="form-control table-col-true-values" placeholder="yes,true,1,Y" value="yes,true,1,Y" style="font-size: 0.8rem; margin-bottom: 0.5rem;">
                <label style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block;">Display Style</label>
                <select class="form-control table-col-bool-style" style="font-size: 0.8rem;">
                    <option value="check">✓ Checkmark</option>
                    <option value="text">Yes/No Text</option>
                    <option value="badge">Badge</option>
                </select>
            `;
            break;
            
        case 'badge':
            optionsHTML = `
                <label style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block;">Color Rules (JSON format)</label>
                <textarea class="form-control table-col-badge-rules" rows="3" placeholder='{"Active": "green", "Pending": "orange", "Cancelled": "red"}' style="font-size: 0.75rem; font-family: monospace;"></textarea>
            `;
            break;
            
        case 'custom':
            optionsHTML = `
                <label style="font-size: 0.75rem; margin-bottom: 0.35rem; display: block;">Custom Format Function</label>
                <textarea class="form-control table-col-custom-format" rows="2" placeholder="e.g., value => value.toUpperCase()" style="font-size: 0.75rem; font-family: monospace;"></textarea>
            `;
            break;
    }
    
    if (optionsHTML) {
        optionsDiv.innerHTML = optionsHTML;
        optionsDiv.style.display = 'block';
    } else {
        optionsDiv.style.display = 'none';
    }
}

// Toggle totals configuration
function toggleTableTotalsConfig() {
    const checked = document.getElementById('tableShowTotals').checked;
    document.getElementById('tableTotalsConfig').style.display = checked ? 'block' : 'none';
    
    if (checked) {
        updateTableTotalsConfig();
    }
}

// Update totals configuration based on columns
function updateTableTotalsConfig() {
    const container = document.getElementById('tableTotalsContainer');
    const columns = document.querySelectorAll('#tableColumnsContainer > div[id^="tableCol_"]');
    
    if (columns.length === 0) {
        container.innerHTML = '<p style="font-size: 0.8rem; color: var(--text-tertiary); margin: 0;">Add columns first to configure totals</p>';
        return;
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 0.75rem;">';
    
    columns.forEach((col, index) => {
        const header = col.querySelector('.table-col-header').value || `Column ${index + 1}`;
        const format = col.querySelector('.table-col-format').value;
        
        // Only show numeric-compatible columns
        if (['number', 'currency', 'percentage'].includes(format)) {
            html += `
                <div style="padding: 0.5rem; background: var(--bg-primary); border-radius: 6px; display: flex; align-items: center; gap: 0.75rem;">
                    <label style="flex: 1; font-size: 0.8rem; margin: 0;">${header}</label>
                    <select class="form-control table-total-type" data-col-index="${index}" style="font-size: 0.75rem; width: auto;">
                        <option value="none">None</option>
                        <option value="sum">Sum (Σ)</option>
                        <option value="avg">Average</option>
                        <option value="count">Count</option>
                        <option value="min">Min</option>
                        <option value="max">Max</option>
                    </select>
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Get table configuration
function getTableConfiguration() {
    const columns = [];
    const columnDivs = document.querySelectorAll('#tableColumnsContainer > div[id^="tableCol_"]');
    
    columnDivs.forEach(div => {
        // Read configuration from dataset instead of looking for input fields
        if (div.dataset.config) {
            try {
                const config = JSON.parse(div.dataset.config);
                const column = {
                    header: config.header,
                    source: config.source,
                    format: config.format || 'text',
                    width: config.width || 'auto',
                    formatOptions: config.formatOptions || {}
                };
                
                columns.push(column);
            } catch (e) {
                console.error('Error parsing column config:', e);
            }
        }
    });
    
    // Get totals configuration
    const totals = {};
    if (document.getElementById('tableShowTotals').checked) {
        document.querySelectorAll('.table-total-type').forEach(select => {
            const colIndex = parseInt(select.dataset.colIndex);
            const type = select.value;
            if (type !== 'none') {
                totals[colIndex] = type;
            }
        });
    }
    
    return {
        reportTitle: document.getElementById('tableReportTitle').value,
        reportSubtitle: document.getElementById('tableReportSubtitle').value,
        columns: columns,
        showTotals: document.getElementById('tableShowTotals').checked,
        totals: totals,
        footerText: document.getElementById('tableFooterText').value,
        showTimestamp: document.getElementById('tableShowTimestamp').checked,
        showRefreshButton: document.getElementById('tableShowRefreshButton').checked
    };
}

// Test single insight
function testSingleInsight(index) {
    const config = insightsConfigurations[currentConfigSourceId][index];
    const data = currentSourceDataForConfig;
    
    // Generate HTML result first
    const htmlResult = executeInsightLogic(config, data);
    
    // Create temporary container to render HTML (for chart rendering)
    const tempContainer = document.createElement('div');
    tempContainer.style.display = 'none';
    tempContainer.innerHTML = htmlResult;
    document.body.appendChild(tempContainer);
    
    // Wait for rendering, then generate PDF and display in chat
    setTimeout(() => {
        let finalResult;
        
        if (config.type === 'table') {
            // Use dedicated table PDF generator
            finalResult = generateTableReport(data, config.tableConfig || config, true);
        } else {
            // Use universal PDF generator for all other types
            finalResult = generateUniversalPDF(config, data, htmlResult);
        }
        
        // Remove temp container
        document.body.removeChild(tempContainer);
        
        // Add to chat
        addMessage('assistant', `<strong><i class="fas ${config.icon}"></i> ${config.name}</strong><br><br>${finalResult}`, true);
        
        closeInsightsConfig();
        
        // Scroll to result
        const container = document.getElementById('messagesContainer');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }, 600); // Wait for chart rendering
}

// Edit insight
function editInsight(index) {
    const config = insightsConfigurations[currentConfigSourceId][index];
    
    showInsightCreator();
    
    // Fill form
    document.getElementById('insightName').value = config.name;
    document.getElementById('insightType').value = config.type;
    document.getElementById('insightPrimaryColumn').value = config.primaryColumn || '';
    document.getElementById('insightSecondaryColumn').value = config.secondaryColumn || '';
    document.getElementById('insightLimit').value = config.limit || 10;
    document.getElementById('insightSortOrder').value = config.sortOrder || 'desc';
    document.getElementById('insightFormat').value = config.format;
    document.getElementById('insightShowPercentage').checked = config.showPercentage || false;
    document.getElementById('insightIcon').value = config.icon;
    document.getElementById('insightDescription').value = config.description || '';
    
    updateInsightTypeOptions();
    
    // Load table configuration if table type
    if (config.type === 'table' && config.tableConfig) {
        const tableConfig = config.tableConfig;
        
        // Clear existing columns
        tableColumnCounter = 0;
        document.getElementById('tableColumnsContainer').innerHTML = '';
        
        // Load report settings
        if (tableConfig.reportTitle) {
            document.getElementById('tableReportTitle').value = tableConfig.reportTitle;
        }
        if (tableConfig.reportSubtitle) {
            document.getElementById('tableReportSubtitle').value = tableConfig.reportSubtitle;
        }
        if (tableConfig.footerText) {
            document.getElementById('tableFooterText').value = tableConfig.footerText;
        }
        if (tableConfig.showTimestamp !== undefined) {
            document.getElementById('tableShowTimestamp').checked = tableConfig.showTimestamp;
        }
        if (tableConfig.showTotals !== undefined) {
            document.getElementById('tableShowTotals').checked = tableConfig.showTotals;
        }
        if (tableConfig.showRefreshButton !== undefined) {
            document.getElementById('tableShowRefreshButton').checked = tableConfig.showRefreshButton;
        }
        
        // Load WHERE clause if exists
        if (tableConfig.whereClause) {
            document.getElementById('tableWhereClause').value = tableConfig.whereClause;
        }
        
        // Load columns
        if (tableConfig.columns && tableConfig.columns.length > 0) {
            tableConfig.columns.forEach(colConfig => {
                addTableColumnFromConfig(colConfig);
            });
        }
    }
    
    // Store index for update
    document.getElementById('insightCreatorForm').dataset.editIndex = index;
}


// Delete insight
function deleteInsight(index) {
    if (!confirm('Are you sure you want to delete this insight?')) return;
    
    insightsConfigurations[currentConfigSourceId].splice(index, 1);
    saveInsightsConfigurations();
    displayConfiguredInsights();
    generateDataInsights();
}

// Test all insights
function testInsights() {
    const sourceInsights = insightsConfigurations[currentConfigSourceId] || [];
    
    if (sourceInsights.length === 0) {
        showNotification('⚠️ No insights configured to test', 'error');
        return;
    }
    
    closeInsightsConfig();
    
    sourceInsights.forEach(config => {
        const result = executeInsightLogic(config, currentSourceDataForConfig);
        addMessage('assistant', `<strong><i class="fas ${config.icon}"></i> ${config.name}</strong><br><br>${result}`, true);
    });
    
    // Scroll to results
    const container = document.getElementById('messagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// Execute insight logic
function executeInsightLogic(config, data) {
    const { type, primaryColumn, secondaryColumn, limit, sortOrder, format, showPercentage, tableConfig } = config;
    
    let result = '';
    
    switch (type) {
        case 'table':
            // Generate PDF for table reports in chat
            result = generateTableReport(data, tableConfig || config, true);
            break;
        case 'top':
        case 'bottom':
            result = generateTopBottomInsight(data, primaryColumn, secondaryColumn, limit, type === 'bottom', sortOrder, format, showPercentage);
            break;
        case 'summary':
            result = generateSummaryInsightAdvanced(data, primaryColumn, format);
            break;
        case 'count':
            result = generateCountInsight(data, primaryColumn, limit, sortOrder, format, showPercentage);
            break;
        case 'sum':
            result = generateSumInsight(data, primaryColumn, secondaryColumn, limit, sortOrder, format, showPercentage);
            break;
        case 'avg':
            result = generateAvgInsight(data, primaryColumn, secondaryColumn, limit, sortOrder, format);
            break;
        case 'max':
            result = generateMaxInsight(data, primaryColumn, format);
            break;
        case 'min':
            result = generateMinInsight(data, primaryColumn, format);
            break;
        case 'distribution':
            result = generateDistributionInsightAdvanced(data, primaryColumn, format);
            break;
        case 'comparison':
            result = generateComparisonInsightAdvanced(data, [primaryColumn, secondaryColumn].filter(c => c), format);
            break;
        case 'outliers':
            result = generateOutliersInsightAdvanced(data, primaryColumn, format);
            break;
        default:
            result = 'Insight type not supported';
    }
    
    return result;
}

// Generate table report
function generateTableReport(data, config, returnPDF = false) {
    if (!data || data.length === 0) {
        return '<div style="padding: 1rem; text-align: center; color: var(--text-tertiary);">No data available</div>';
    }
    
    
    // Apply WHERE clause filter
    const whereClause = config.whereClause || config.tableConfig?.whereClause;
    if (whereClause) {
        data = applyWhereClause(data, whereClause);
        if (data.length === 0) {
            return '<div style="padding: 1rem; text-align: center; color: var(--text-tertiary);">No data matches the filter criteria</div>';
        }
    }
    
    const columns = config.columns || config.tableConfig?.columns || [];
    
    if (columns.length === 0) {
        return '<div style="padding: 1rem; text-align: center; color: var(--text-tertiary);">No columns configured</div>';
    }
    
    // If PDF generation is requested, generate and return PDF
    if (returnPDF) {
        return generatePDFReport(data, config, columns);
    }
    
    // Otherwise, generate HTML preview
    let html = '<div style="width: 100%; overflow-x: auto;">';
    
    // Report Title
    if (config.reportTitle || config.tableConfig?.reportTitle) {
        html += `<div style="padding: 1rem 0; border-bottom: 2px solid var(--border-color);">`;
        html += `<h3 style="margin: 0; color: var(--text-primary); font-size: 1.2rem;">${config.reportTitle || config.tableConfig?.reportTitle}</h3>`;
        if (config.reportSubtitle || config.tableConfig?.reportSubtitle) {
            let subtitle = config.reportSubtitle || config.tableConfig?.reportSubtitle;
            subtitle = subtitle.replace('{{date}}', new Date().toLocaleDateString());
            html += `<p style="margin: 0.5rem 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">${subtitle}</p>`;
        }
        html += '</div>';
    }
    
    // Table
    html += '<table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">';
    
    // Table Header
    html += '<thead>';
    html += '<tr style="background: var(--bg-tertiary); border-bottom: 2px solid var(--border-color);">';
    columns.forEach(col => {
        html += `<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: var(--text-primary); border-bottom: 2px solid var(--border-dark);">${col.header}</th>`;
    });
    html += '</tr>';
    html += '</thead>';
    
    // Table Body
    html += '<tbody>';
    data.forEach((row, idx) => {
        html += `<tr style="border-bottom: 1px solid var(--border-color); ${idx % 2 === 0 ? 'background: var(--bg-secondary);' : ''}">`;
        columns.forEach(col => {
            const value = row[col.source];
            const formattedValue = formatTableCellValue(value, col.format, col.formatOptions || {});
            html += `<td style="padding: 0.75rem; color: var(--text-primary);">${formattedValue}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    // Table Footer with Totals (if enabled)
    const showTotals = config.showTotals || config.tableConfig?.showTotals;
    if (showTotals) {
        html += '<tfoot>';
        html += '<tr style="background: var(--bg-tertiary); border-top: 2px solid var(--border-dark); font-weight: 600;">';
        columns.forEach((col, idx) => {
            if (idx === 0) {
                html += `<td style="padding: 0.75rem; color: var(--text-primary);">Total</td>`;
            } else {
                // Calculate total for numeric columns
                if (col.format === 'number' || col.format === 'currency') {
                    const total = data.reduce((sum, row) => {
                        const val = parseFloat(row[col.source]);
                        return sum + (isNaN(val) ? 0 : val);
                    }, 0);
                    const formattedTotal = formatTableCellValue(total, col.format, col.formatOptions || {});
                    html += `<td style="padding: 0.75rem; color: var(--text-primary);">${formattedTotal}</td>`;
                } else {
                    html += `<td style="padding: 0.75rem; color: var(--text-tertiary);">—</td>`;
                }
            }
        });
        html += '</tr>';
        html += '</tfoot>';
    }
    
    html += '</table>';
    
    // Footer
    if (config.footerText || config.tableConfig?.footerText || config.showTimestamp || config.tableConfig?.showTimestamp) {
        html += '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.85rem; color: var(--text-tertiary);">';
        if (config.footerText || config.tableConfig?.footerText) {
            html += `<div>${config.footerText || config.tableConfig?.footerText}</div>`;
        }
        if (config.showTimestamp || config.tableConfig?.showTimestamp) {
            html += `<div style="margin-top: 0.5rem;">Generated: ${new Date().toLocaleString()}</div>`;
        }
        html += '</div>';
    }
    
    html += '</div>';
    
    return html;
}

// Generate PDF report using jsPDF
function generatePDFReport(data, config, columns) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'pt', 'a4'); // Landscape, points, A4 size
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 40;
        
        // Add report title
        const reportTitle = config.reportTitle || config.tableConfig?.reportTitle || 'Data Report';
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
        yPos += 25;
        
        // Add subtitle if exists
        if (config.reportSubtitle || config.tableConfig?.reportSubtitle) {
            let subtitle = config.reportSubtitle || config.tableConfig?.reportSubtitle;
            subtitle = subtitle.replace('{{date}}', new Date().toLocaleDateString());
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100);
            doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
            yPos += 20;
        }
        
        // Prepare table data
        const headers = columns.map(col => col.header);
        const body = data.map(row => {
            return columns.map(col => {
                const value = row[col.source];
                return formatTableCellValueForPDF(value, col.format, col.formatOptions || {});
            });
        });
        
        // Add table using autoTable
        doc.autoTable({
            head: [headers],
            body: body,
            startY: yPos,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 6,
            },
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'left'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { left: 40, right: 40 },
            didDrawPage: function(data) {
                // Add page number
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    'Page ' + doc.internal.getNumberOfPages(),
                    pageWidth - 60,
                    pageHeight - 20
                );
            }
        });
        
        // Add footer if exists
        const finalY = doc.lastAutoTable.finalY || yPos;
        if (config.footerText || config.tableConfig?.footerText || config.showTimestamp || config.tableConfig?.showTimestamp) {
            yPos = finalY + 20;
            
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 40;
            }
            
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.setFont(undefined, 'normal');
            
            if (config.footerText || config.tableConfig?.footerText) {
                doc.text(config.footerText || config.tableConfig?.footerText, 40, yPos);
                yPos += 15;
            }
            
            if (config.showTimestamp || config.tableConfig?.showTimestamp) {
                doc.text('Generated: ' + new Date().toLocaleString(), 40, yPos);
            }
        }
        
        // Convert to data URL and return embedded PDF
        const pdfData = doc.output('dataurlstring');
        return `
            <div style="width: 100%; height: 800px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <iframe src="${pdfData}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                <button class="btn btn-primary" onclick="downloadPDF('${reportTitle.replace(/'/g, "\\'")}')">
                    <i class="fas fa-download"></i> Download PDF
                </button>
            </div>
        `;
    } catch (error) {
        console.error('PDF generation error:', error);
        return '<div style="padding: 1rem; text-align: center; color: var(--danger);">❌ Error generating PDF: ' + error.message + '</div>';
    }
}

// Format table cell value for PDF (plain text, no HTML)
function formatTableCellValueForPDF(value, format, options) {
    if (value === null || value === undefined || value === '') {
        return '—';
    }
    
    switch (format) {
        case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) return value;
            return num.toLocaleString(undefined, { 
                minimumFractionDigits: options.decimals || 0,
                maximumFractionDigits: options.decimals || 2
            });
            
        case 'currency':
            const curr = parseFloat(value);
            if (isNaN(curr)) return value;
            const symbol = options.currencySymbol || '$';
            return symbol + curr.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
        case 'percentage':
            const pct = parseFloat(value);
            if (isNaN(pct)) return value;
            return pct.toFixed(options.decimals || 1) + '%';
            
        case 'date':
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                return date.toLocaleDateString();
            } catch (e) {
                return value;
            }
            
        case 'boolean':
            const boolVal = String(value).toLowerCase();
            const trueValues = ['true', 'yes', '1', 'y'];
            const isTrue = trueValues.includes(boolVal);
            return isTrue ? '✓' : '—';
            
        case 'badge':
        case 'custom':
            return String(value);
            
        case 'text':
        default:
            return String(value);
    }
}

// Store last generated PDF for download
let lastGeneratedPDF = null;

// Download PDF function
function downloadPDF(reportTitle) {
    if (!lastGeneratedPDF) {
        // Regenerate PDF
        const config = currentPreviewConfig;
        if (config && config.type === 'table') {
            const { jsPDF } = window.jspdf;
            const doc = regeneratePDFDocument(currentSourceDataForConfig, config);
            if (doc) {
                doc.save((reportTitle || 'report') + '.pdf');
            }
        }
    }
}

// Regenerate PDF document for download
function regeneratePDFDocument(data, config) {
    try {
        const columns = config.columns || config.tableConfig?.columns || [];
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('l', 'pt', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 40;
        
        // Add report title
        const reportTitle = config.reportTitle || config.tableConfig?.reportTitle || 'Data Report';
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text(reportTitle, pageWidth / 2, yPos, { align: 'center' });
        yPos += 25;
        
        // Add subtitle if exists
        if (config.reportSubtitle || config.tableConfig?.reportSubtitle) {
            let subtitle = config.reportSubtitle || config.tableConfig?.reportSubtitle;
            subtitle = subtitle.replace('{{date}}', new Date().toLocaleDateString());
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100);
            doc.text(subtitle, pageWidth / 2, yPos, { align: 'center' });
            yPos += 20;
        }
        
        // Prepare table data
        const headers = columns.map(col => col.header);
        const body = data.map(row => {
            return columns.map(col => {
                const value = row[col.source];
                return formatTableCellValueForPDF(value, col.format, col.formatOptions || {});
            });
        });
        
        // Add table
        doc.autoTable({
            head: [headers],
            body: body,
            startY: yPos,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 6,
            },
            headStyles: {
                fillColor: [99, 102, 241],
                textColor: 255,
                fontStyle: 'bold',
                halign: 'left'
            },
            alternateRowStyles: {
                fillColor: [245, 247, 250]
            },
            margin: { left: 40, right: 40 },
            didDrawPage: function(data) {
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    'Page ' + doc.internal.getNumberOfPages(),
                    pageWidth - 60,
                    pageHeight - 20
                );
            }
        });
        
        // Add footer if exists
        const finalY = doc.lastAutoTable.finalY || yPos;
        if (config.footerText || config.tableConfig?.footerText || config.showTimestamp || config.tableConfig?.showTimestamp) {
            yPos = finalY + 20;
            
            if (yPos > pageHeight - 60) {
                doc.addPage();
                yPos = 40;
            }
            
            doc.setFontSize(9);
            doc.setTextColor(120);
            doc.setFont(undefined, 'normal');
            
            if (config.footerText || config.tableConfig?.footerText) {
                doc.text(config.footerText || config.tableConfig?.footerText, 40, yPos);
                yPos += 15;
            }
            
            if (config.showTimestamp || config.tableConfig?.showTimestamp) {
                doc.text('Generated: ' + new Date().toLocaleString(), 40, yPos);
            }
        }
        
        return doc;
    } catch (error) {
        console.error('PDF regeneration error:', error);
        return null;
    }
}

// Store current preview config for PDF download
let currentPreviewConfig = null;

// Universal PDF generator for all insight types
function generateUniversalPDF(config, data, htmlContent) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4'); // Portrait for charts/stats
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 60;
        
        // Add insight name as title
        const insightName = config.name || 'Data Insight';
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(insightName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 30;
        
        // Add description if exists
        if (config.description) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            const descLines = doc.splitTextToSize(config.description, pageWidth - 100);
            doc.text(descLines, pageWidth / 2, yPos, { align: 'center' });
            yPos += (descLines.length * 15) + 20;
        }
        
        // Add divider line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.line(50, yPos, pageWidth - 50, yPos);
        yPos += 30;
        
        // Parse HTML content to extract data
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Check if it's a chart
        const canvas = tempDiv.querySelector('canvas');
        if (canvas) {
            // Capture chart as image
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pageWidth - 100;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            if (yPos + imgHeight > pageHeight - 50) {
                doc.addPage();
                yPos = 50;
            }
            
            doc.addImage(imgData, 'PNG', 50, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 30;
        }
        
        // Check for tables (stats, counts, etc.)
        const tables = tempDiv.querySelectorAll('table');
        if (tables.length > 0) {
            tables.forEach((table, idx) => {
                const rows = Array.from(table.querySelectorAll('tr'));
                const tableData = [];
                
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    const rowData = cells.map(cell => {
                        // Remove HTML tags and get text
                        let text = cell.textContent.trim();
                        // Remove emoji and special chars for PDF
                        text = text.replace(/[📊📈📉💰🔢✓✗]/g, '');
                        return text;
                    });
                    if (rowData.length > 0) {
                        tableData.push(rowData);
                    }
                });
                
                if (tableData.length > 0) {
                    // Use first row as header if it looks like headers
                    const headers = tableData[0];
                    const body = tableData.slice(1);
                    
                    if (yPos > pageHeight - 100) {
                        doc.addPage();
                        yPos = 50;
                    }
                    
                    doc.autoTable({
                        head: body.length > 0 ? [headers] : [],
                        body: body.length > 0 ? body : [headers],
                        startY: yPos,
                        theme: 'striped',
                        styles: {
                            fontSize: 10,
                            cellPadding: 8,
                            overflow: 'linebreak',
                            halign: 'left'
                        },
                        headStyles: {
                            fillColor: [99, 102, 241],
                            textColor: 255,
                            fontStyle: 'bold',
                            halign: 'left'
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        margin: { left: 50, right: 50 },
                        columnStyles: {
                            0: { cellWidth: 'auto' }
                        }
                    });
                    
                    yPos = doc.lastAutoTable.finalY + 20;
                }
            });
        }
        
        // If no table or chart, add text content
        if (!canvas && tables.length === 0) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(50, 50, 50);
            
            // Extract text content without HTML
            let textContent = tempDiv.textContent.trim();
            textContent = textContent.replace(/\s+/g, ' '); // Normalize whitespace
            
            const lines = doc.splitTextToSize(textContent, pageWidth - 100);
            
            lines.forEach(line => {
                if (yPos > pageHeight - 50) {
                    doc.addPage();
                    yPos = 50;
                }
                doc.text(line, 50, yPos);
                yPos += 18;
            });
        }
        
        // Add footer with timestamp
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.setFont(undefined, 'normal');
            doc.text(
                `Generated: ${new Date().toLocaleString()}`,
                50,
                pageHeight - 30
            );
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 100,
                pageHeight - 30
            );
        }
        
        // Return embedded PDF
        const pdfData = doc.output('dataurlstring');
        return `
            <div style="width: 100%; height: 800px; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <iframe src="${pdfData}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                <button class="btn btn-primary" onclick="downloadCurrentPDF('${insightName.replace(/'/g, "\\'")}')">
                    <i class="fas fa-download"></i> Download PDF
                </button>
            </div>
        `;
    } catch (error) {
        console.error('Universal PDF generation error:', error);
        return htmlContent; // Fallback to HTML if PDF fails
    }
}

// Download current PDF
let lastGeneratedPDFDoc = null;

function downloadCurrentPDF(filename) {
    if (lastGeneratedPDFDoc) {
        lastGeneratedPDFDoc.save((filename || 'insight') + '.pdf');
    } else {
        // Regenerate if needed
        if (currentPreviewConfig) {
            const htmlContent = executeInsightLogic(currentPreviewConfig, currentSourceDataForConfig);
            const pdfDoc = regenerateUniversalPDF(currentPreviewConfig, currentSourceDataForConfig, htmlContent);
            if (pdfDoc) {
                pdfDoc.save((filename || 'insight') + '.pdf');
            }
        }
    }
}

// Regenerate universal PDF for download
function regenerateUniversalPDF(config, data, htmlContent) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 60;
        
        // Add insight name as title
        const insightName = config.name || 'Data Insight';
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(99, 102, 241);
        doc.text(insightName, pageWidth / 2, yPos, { align: 'center' });
        yPos += 30;
        
        // Add description if exists
        if (config.description) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            const descLines = doc.splitTextToSize(config.description, pageWidth - 100);
            doc.text(descLines, pageWidth / 2, yPos, { align: 'center' });
            yPos += (descLines.length * 15) + 20;
        }
        
        // Add divider line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.line(50, yPos, pageWidth - 50, yPos);
        yPos += 30;
        
        // Parse HTML content to extract data
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Check for tables
        const tables = tempDiv.querySelectorAll('table');
        if (tables.length > 0) {
            tables.forEach((table) => {
                const rows = Array.from(table.querySelectorAll('tr'));
                const tableData = [];
                
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td, th'));
                    const rowData = cells.map(cell => {
                        let text = cell.textContent.trim();
                        text = text.replace(/[📊📈📉💰🔢✓✗]/g, '');
                        return text;
                    });
                    if (rowData.length > 0) {
                        tableData.push(rowData);
                    }
                });
                
                if (tableData.length > 0) {
                    const headers = tableData[0];
                    const body = tableData.slice(1);
                    
                    if (yPos > pageHeight - 100) {
                        doc.addPage();
                        yPos = 50;
                    }
                    
                    doc.autoTable({
                        head: body.length > 0 ? [headers] : [],
                        body: body.length > 0 ? body : [headers],
                        startY: yPos,
                        theme: 'striped',
                        styles: {
                            fontSize: 10,
                            cellPadding: 8,
                            overflow: 'linebreak',
                            halign: 'left'
                        },
                        headStyles: {
                            fillColor: [99, 102, 241],
                            textColor: 255,
                            fontStyle: 'bold',
                            halign: 'left'
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        margin: { left: 50, right: 50 }
                    });
                    
                    yPos = doc.lastAutoTable.finalY + 20;
                }
            });
        }
        
        // Add footer with timestamp
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150);
            doc.setFont(undefined, 'normal');
            doc.text(
                `Generated: ${new Date().toLocaleString()}`,
                50,
                pageHeight - 30
            );
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 100,
                pageHeight - 30
            );
        }
        
        return doc;
    } catch (error) {
        console.error('PDF regeneration error:', error);
        return null;
    }
}

// Format table cell value based on format type
function formatTableCellValue(value, format, options) {
    if (value === null || value === undefined || value === '') {
        return '<span style="color: var(--text-tertiary);">—</span>';
    }
    
    switch (format) {
        case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) return value;
            return num.toLocaleString(undefined, { 
                minimumFractionDigits: options.decimals || 0,
                maximumFractionDigits: options.decimals || 2
            });
            
        case 'currency':
            const curr = parseFloat(value);
            if (isNaN(curr)) return value;
            const symbol = options.currencySymbol || '$';
            return symbol + curr.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
        case 'percentage':
            const pct = parseFloat(value);
            if (isNaN(pct)) return value;
            return pct.toFixed(options.decimals || 1) + '%';
            
        case 'date':
            try {
                const date = new Date(value);
                if (isNaN(date.getTime())) return value;
                return date.toLocaleDateString();
            } catch (e) {
                return value;
            }
            
        case 'boolean':
            const boolVal = String(value).toLowerCase();
            const trueValues = ['true', 'yes', '1', 'y'];
            const isTrue = trueValues.includes(boolVal);
            if (options.boolStyle === 'check') {
                return isTrue 
                    ? '<span style="color: var(--success); font-weight: 600;">✓</span>' 
                    : '<span style="color: var(--text-tertiary);">—</span>';
            } else {
                return isTrue ? 'Yes' : 'No';
            }
            
        case 'badge':
            const badgeRules = options.badgeRules || {};
            const badgeConfig = badgeRules[value] || { color: 'var(--text-tertiary)', bg: 'var(--bg-tertiary)' };
            return `<span style="padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; font-weight: 600; background: ${badgeConfig.bg}; color: ${badgeConfig.color};">${value}</span>`;
            
        case 'custom':
            if (options.customFormat) {
                try {
                    // Simple template replacement
                    return options.customFormat.replace('{{value}}', value);
                } catch (e) {
                    return value;
                }
            }
            return value;
            
        case 'text':
        default:
            return String(value);
    }
}

// Generate top/bottom insight
function generateTopBottomInsight(data, column, valueColumn, limit, isBottom, sortOrder, format, showPercentage) {
    if (valueColumn) {
        // Aggregate by category
        const groups = {};
        data.forEach(row => {
            const key = row[column];
            const val = parseFloat(row[valueColumn]);
            if (!isNaN(val)) {
                groups[key] = (groups[key] || 0) + val;
            }
        });
        
        let sorted = Object.entries(groups).sort((a, b) => 
            isBottom ? a[1] - b[1] : b[1] - a[1]
        );
        
        sorted = sorted.slice(0, limit);
        
        return formatInsightResult(sorted, column, valueColumn, format, showPercentage, data.length);
    } else {
        // Simple top/bottom values
        let values = data.map((row, idx) => ({ value: row[column], index: idx }))
            .filter(v => v.value != null);
        
        if (!isNaN(parseFloat(values[0].value))) {
            values = values.map(v => ({ ...v, value: parseFloat(v.value) }))
                .filter(v => !isNaN(v.value));
            values.sort((a, b) => isBottom ? a.value - b.value : b.value - a.value);
        } else {
            // Count occurrences
            const counts = {};
            data.forEach(row => {
                const val = row[column];
                if (val != null) counts[val] = (counts[val] || 0) + 1;
            });
            
            values = Object.entries(counts).map(([val, count]) => ({ value: val, count }));
            values.sort((a, b) => isBottom ? a.count - b.count : b.count - a.count);
        }
        
        values = values.slice(0, limit);
        
        return formatSimpleValues(values, column, format, showPercentage, data.length);
    }
}

// Format insight result
function formatInsightResult(data, categoryCol, valueCol, format, showPercentage, totalRecords) {
    if (format === 'table') {
        let html = '<table class="data-table" style="width: 100%;">';
        html += '<thead><tr><th>Rank</th><th>' + formatParameterLabel(categoryCol) + '</th><th>' + formatParameterLabel(valueCol) + '</th>';
        if (showPercentage) html += '<th>%</th>';
        html += '</tr></thead><tbody>';
        
        const total = data.reduce((sum, [_, val]) => sum + val, 0);
        
        data.forEach(([category, value], idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1);
            const pct = ((value / total) * 100).toFixed(1);
            html += '<tr>';
            html += '<td style="text-align: center;">' + medal + '</td>';
            html += '<td><strong>' + category + '</strong></td>';
            html += '<td style="text-align: right;">' + formatNumber(value) + '</td>';
            if (showPercentage) html += '<td style="text-align: right;">' + pct + '%</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    } else {
        let html = '<ul class="insight-list">';
        data.forEach(([category, value], idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•';
            html += '<li>' + medal + ' <strong>' + category + '</strong> - ' + formatNumber(value) + '</li>';
        });
        html += '</ul>';
        return html;
    }
}

// Format simple values
function formatSimpleValues(values, column, format, showPercentage, totalRecords) {
    if (format === 'table') {
        let html = '<table class="data-table" style="width: 100%;">';
        html += '<thead><tr><th>Rank</th><th>Value</th>';
        if (values[0].count) html += '<th>Count</th>';
        if (showPercentage) html += '<th>%</th>';
        html += '</tr></thead><tbody>';
        
        values.forEach((item, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1);
            html += '<tr>';
            html += '<td style="text-align: center;">' + medal + '</td>';
            html += '<td><strong>' + item.value + '</strong></td>';
            if (item.count) {
                html += '<td style="text-align: right;">' + item.count.toLocaleString() + '</td>';
                if (showPercentage) {
                    const pct = ((item.count / totalRecords) * 100).toFixed(1);
                    html += '<td style="text-align: right;">' + pct + '%</td>';
                }
            }
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        return html;
    } else {
        let html = '<ul class="insight-list">';
        values.forEach((item, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '•';
            html += '<li>' + medal + ' <strong>' + item.value + '</strong>';
            if (item.count) html += ' - ' + item.count.toLocaleString() + ' records';
            html += '</li>';
        });
        html += '</ul>';
        return html;
    }
}

// Initialize insights configurations on load
loadInsightsConfigurations();
// Additional Insight Generators

function generateCountInsight(data, column, limit, sortOrder, format, showPercentage) {
    const counts = {};
    data.forEach(row => {
        const val = row[column];
        if (val != null) counts[val] = (counts[val] || 0) + 1;
    });
    
    let sorted = Object.entries(counts).sort((a, b) => 
        sortOrder === 'asc' ? a[1] - b[1] : b[1] - a[1]
    );
    
    sorted = sorted.slice(0, limit);
    
    return formatInsightResult(sorted, column, 'Count', format, showPercentage, data.length);
}

function generateSumInsight(data, groupColumn, valueColumn, limit, sortOrder, format, showPercentage) {
    const sums = {};
    data.forEach(row => {
        const key = row[groupColumn];
        const val = parseFloat(row[valueColumn]);
        if (!isNaN(val) && key != null) {
            sums[key] = (sums[key] || 0) + val;
        }
    });
    
    let sorted = Object.entries(sums).sort((a, b) => 
        sortOrder === 'asc' ? a[1] - b[1] : b[1] - a[1]
    );
    
    sorted = sorted.slice(0, limit);
    
    return formatInsightResult(sorted, groupColumn, valueColumn + ' (Sum)', format, showPercentage, data.length);
}

function generateAvgInsight(data, groupColumn, valueColumn, limit, sortOrder, format) {
    const groups = {};
    data.forEach(row => {
        const key = row[groupColumn];
        const val = parseFloat(row[valueColumn]);
        if (!isNaN(val) && key != null) {
            if (!groups[key]) groups[key] = [];
            groups[key].push(val);
        }
    });
    
    const averages = {};
    Object.entries(groups).forEach(([key, values]) => {
        averages[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    let sorted = Object.entries(averages).sort((a, b) => 
        sortOrder === 'asc' ? a[1] - b[1] : b[1] - a[1]
    );
    
    sorted = sorted.slice(0, limit);
    
    return formatInsightResult(sorted, groupColumn, valueColumn + ' (Avg)', format, false, data.length);
}

function generateMaxInsight(data, column, format) {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return 'No numeric values found';
    
    const max = Math.max(...values);
    const maxRow = data.find(row => parseFloat(row[column]) === max);
    
    let html = '<div style="padding: 1rem; background: var(--card-bg); border-radius: 8px;">';
    html += '<h4 style="color: var(--success); margin: 0 0 1rem 0;"><i class="fas fa-arrow-up"></i> Maximum Value</h4>';
    html += '<div style="font-size: 2rem; font-weight: 700; color: var(--success); margin-bottom: 1rem;">' + formatNumber(max) + '</div>';
    
    if (maxRow) {
        html += '<div style="font-size: 0.9rem; color: var(--text-secondary);">';
        html += '<strong>Record details:</strong><br>';
        Object.entries(maxRow).slice(0, 5).forEach(([key, val]) => {
            html += '• ' + formatParameterLabel(key) + ': <strong>' + val + '</strong><br>';
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function generateMinInsight(data, column, format) {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v));
    if (values.length === 0) return 'No numeric values found';
    
    const min = Math.min(...values);
    const minRow = data.find(row => parseFloat(row[column]) === min);
    
    let html = '<div style="padding: 1rem; background: var(--card-bg); border-radius: 8px;">';
    html += '<h4 style="color: var(--warning); margin: 0 0 1rem 0;"><i class="fas fa-arrow-down"></i> Minimum Value</h4>';
    html += '<div style="font-size: 2rem; font-weight: 700; color: var(--warning); margin-bottom: 1rem;">' + formatNumber(min) + '</div>';
    
    if (minRow) {
        html += '<div style="font-size: 0.9rem; color: var(--text-secondary);">';
        html += '<strong>Record details:</strong><br>';
        Object.entries(minRow).slice(0, 5).forEach(([key, val]) => {
            html += '• ' + formatParameterLabel(key) + ': <strong>' + val + '</strong><br>';
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

function generateSummaryInsightAdvanced(data, column, format) {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v) && isFinite(v));
    
    if (values.length === 0) return 'No numeric values found';
    
    const sorted = values.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    
    let html = '<div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px;">';
    html += '<h4 style="color: var(--primary); margin: 0 0 1.5rem 0;"><i class="fas fa-calculator"></i> Statistical Summary</h4>';
    html += '<table class="data-table" style="width: 100%;">';
    html += '<tr><td><strong>Count</strong></td><td style="text-align: right;">' + values.length.toLocaleString() + '</td></tr>';
    html += '<tr><td><strong>Sum</strong></td><td style="text-align: right;">' + formatNumber(sum) + '</td></tr>';
    html += '<tr><td><strong>Mean (Average)</strong></td><td style="text-align: right;">' + formatNumber(avg) + '</td></tr>';
    html += '<tr><td><strong>Median</strong></td><td style="text-align: right;">' + formatNumber(median) + '</td></tr>';
    html += '<tr><td><strong>Minimum</strong></td><td style="text-align: right;">' + formatNumber(min) + '</td></tr>';
    html += '<tr><td><strong>25th Percentile (Q1)</strong></td><td style="text-align: right;">' + formatNumber(q1) + '</td></tr>';
    html += '<tr><td><strong>75th Percentile (Q3)</strong></td><td style="text-align: right;">' + formatNumber(q3) + '</td></tr>';
    html += '<tr><td><strong>Maximum</strong></td><td style="text-align: right;">' + formatNumber(max) + '</td></tr>';
    html += '<tr><td><strong>Range</strong></td><td style="text-align: right;">' + formatNumber(max - min) + '</td></tr>';
    html += '</table>';
    html += '</div>';
    
    return html;
}

function generateDistributionInsightAdvanced(data, column, format) {
    const values = data.map(row => parseFloat(row[column])).filter(v => !isNaN(v) && isFinite(v));
    
    if (values.length === 0) return 'No numeric values found';
    
    const sorted = values.sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const range = max - min;
    const bucketSize = range / 10;
    
    const buckets = Array(10).fill(0);
    values.forEach(v => {
        const bucketIndex = Math.min(9, Math.floor((v - min) / bucketSize));
        buckets[bucketIndex]++;
    });
    
    let html = '<div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px;">';
    html += '<h4 style="color: var(--primary); margin: 0 0 1rem 0;"><i class="fas fa-chart-bar"></i> Value Distribution</h4>';
    html += '<table class="data-table" style="width: 100%;">';
    html += '<thead><tr><th>Range</th><th>Count</th><th>%</th><th>Visual</th></tr></thead><tbody>';
    
    buckets.forEach((count, idx) => {
        const rangeStart = min + (idx * bucketSize);
        const rangeEnd = min + ((idx + 1) * bucketSize);
        const pct = ((count / values.length) * 100).toFixed(1);
        const barWidth = Math.max(5, (count / values.length) * 100);
        
        html += '<tr>';
        html += '<td>' + formatNumber(rangeStart) + ' - ' + formatNumber(rangeEnd) + '</td>';
        html += '<td style="text-align: right;">' + count + '</td>';
        html += '<td style="text-align: right;">' + pct + '%</td>';
        html += '<td><div style="background: var(--primary); height: 20px; width: ' + barWidth + '%; border-radius: 4px;"></div></td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    return html;
}

function generateComparisonInsightAdvanced(data, columns, format) {
    let html = '<div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px;">';
    html += '<h4 style="color: var(--primary); margin: 0 0 1rem 0;"><i class="fas fa-balance-scale"></i> Metric Comparison</h4>';
    html += '<table class="data-table" style="width: 100%;">';
    html += '<thead><tr><th>Metric</th><th>Min</th><th>Max</th><th>Average</th><th>Sum</th></tr></thead><tbody>';
    
    columns.forEach(col => {
        if (!col) return;
        const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v) && isFinite(v));
        if (values.length === 0) return;
        
        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const sum = values.reduce((a, b) => a + b, 0);
        
        html += '<tr>';
        html += '<td><strong>' + formatParameterLabel(col) + '</strong></td>';
        html += '<td style="text-align: right;">' + formatNumber(min) + '</td>';
        html += '<td style="text-align: right;">' + formatNumber(max) + '</td>';
        html += '<td style="text-align: right;">' + formatNumber(avg) + '</td>';
        html += '<td style="text-align: right; color: var(--success); font-weight: 700;">' + formatNumber(sum) + '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    html += '</div>';
    
    return html;
}

function generateOutliersInsightAdvanced(data, column, format) {
    const values = data.map((row, idx) => ({ value: parseFloat(row[column]), index: idx, row: row }))
        .filter(v => !isNaN(v.value) && isFinite(v.value));
    
    if (values.length === 0) return 'No numeric values found';
    
    const sorted = values.map(v => v.value).sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = values.filter(v => v.value < lowerBound || v.value > upperBound).slice(0, 20);
    
    let html = '<div style="background: var(--card-bg); padding: 1.5rem; border-radius: 8px;">';
    html += '<h4 style="color: var(--warning); margin: 0 0 1rem 0;"><i class="fas fa-exclamation-triangle"></i> Outlier Detection</h4>';
    html += '<div style="margin-bottom: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: 6px;">';
    html += '• <strong>Normal Range:</strong> ' + formatNumber(lowerBound) + ' to ' + formatNumber(upperBound) + '<br>';
    html += '• <strong>Outliers Found:</strong> ' + outliers.length + ' records';
    html += '</div>';
    
    if (outliers.length > 0) {
        html += '<table class="data-table" style="width: 100%;">';
        html += '<thead><tr><th>Row</th><th>Value</th><th>Status</th></tr></thead><tbody>';
        
        outliers.forEach(o => {
            const status = o.value < lowerBound ? 'Below Range' : 'Above Range';
            const color = o.value < lowerBound ? 'var(--info)' : 'var(--danger)';
            html += '<tr>';
            html += '<td>' + (o.index + 1) + '</td>';
            html += '<td><strong>' + formatNumber(o.value) + '</strong></td>';
            html += '<td style="color: ' + color + '; font-weight: 600;">' + status + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table>';
    } else {
        html += '<div style="color: var(--success); font-weight: 600; text-align: center; padding: 1rem;">';
        html += '✓ No significant outliers detected';
        html += '</div>';
    }
    
    html += '</div>';
    
    return html;
}

// Update the insights panel to show configured insights
function updateInsightsForSourceWithConfig(sourceId = null) {
    const selectEl = document.getElementById('insightSourceSelect');
    if (!sourceId) {
        sourceId = selectEl.value;
    }
    
    const sourceInfo = loadedDataSources[sourceId];
    if (!sourceInfo) return;
    
    const data = sourceInfo.data;
    const sourceName = sourceInfo.sourceName;
    
    // Check if there are configured insights for this source
    const configuredInsights = insightsConfigurations[sourceId] || [];
    
    const contentDiv = document.getElementById('insightsPanelContent');
    const selectorHTML = contentDiv.querySelector('.data-source-selector').outerHTML;
    
    let insightsHTML = '';
    
    if (configuredInsights.length > 0) {
        // Show configured insights
        insightsHTML = `
            <div class="insight-section">
                <div class="insight-section-title">
                    <i class="fas fa-cog"></i> Your Custom Insights
                    <span style="margin-left: auto; font-size: 0.7rem; font-weight: normal; color: var(--text-tertiary);">
                        <button class="btn btn-sm" onclick="openInsightsConfig('${sourceId}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-edit"></i> Configure
                        </button>
                    </span>
                </div>
        `;
        
        configuredInsights.forEach((config, index) => {
            insightsHTML += `
                <div class="quick-prompt" onclick="executeConfiguredInsight('${sourceId}', ${index})">
                    <div class="quick-prompt-title">
                        <i class="fas ${config.icon}"></i> ${config.name}
                        <span class="quick-prompt-badge">⚡ Custom</span>
                    </div>
                    <div class="quick-prompt-desc">${config.description || 'Click to view'}</div>
                </div>
            `;
        });
        
        insightsHTML += '</div>';
    } else {
        // Show default analysis
        insightsHTML = analyzeDataSource(data, sourceName, sourceId);
    }
    
    contentDiv.innerHTML = selectorHTML + insightsHTML;
}

// Execute configured insight
function executeConfiguredInsight(sourceId, index) {
    const config = insightsConfigurations[sourceId][index];
    const data = loadedDataSources[sourceId].data;
    
    const result = executeInsightLogic(config, data);
    
    addMessage('assistant', `<strong><i class="fas ${config.icon}"></i> ${config.name}</strong><br><br>${result}`, true);
    toggleInsightsPanel();
    
    // Scroll to result
    const container = document.getElementById('messagesContainer');
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ==================== GIT OPERATIONS ====================

// Open Git Modal
function openGitModal() {
    document.getElementById('gitModal').style.display = 'flex';
    // Load saved config if exists
    if (window.GitOps) {
        window.GitOps.populateForm();
    }
}

// Close Git Modal
function closeGitModal() {
    document.getElementById('gitModal').style.display = 'none';
}

// Save Git Configuration
async function saveGitConfig() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-test-result');
        return;
    }
    
    const config = window.GitOps.getFormConfig();
    const validation = window.GitOps.validateConfig(config);
    
    if (!validation.valid) {
        showMessage(validation.message, 'error', 'git-test-result');
        return;
    }
    
    window.GitOps.saveConfig(config);
    showMessage('Configuration saved successfully!', 'success', 'git-test-result');
}

// Clear Git Configuration
function clearGitConfig() {
    if (confirm('Are you sure you want to clear all Git credentials?')) {
        if (window.GitOps) {
            window.GitOps.clearConfig();
        }
        document.getElementById('git-username').value = '';
        document.getElementById('git-token').value = '';
        document.getElementById('git-owner').value = '';
        document.getElementById('git-repo').value = '';
        document.getElementById('git-branch').value = 'main';
        showMessage('Credentials cleared', 'success', 'git-test-result');
    }
}

// Test Git Connection
async function testGitConnection() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-test-result');
        return;
    }
    
    showMessage('Testing connection...', 'info', 'git-test-result');
    
    const result = await window.GitOps.testConnection();
    
    if (result.success) {
        showMessage(`✅ ${result.message}<br><small>Repository: ${result.data.full_name}<br>Default Branch: ${result.data.default_branch}</small>`, 'success', 'git-test-result');
        
        // Auto-save if test successful
        const config = window.GitOps.getFormConfig();
        window.GitOps.saveConfig(config);
        
        // Refresh debug logs if on debug tab
        if (typeof refreshDebugLogs === 'function') {
            setTimeout(() => refreshDebugLogs(), 100);
        }
    } else {
        showMessage(`❌ Connection failed: ${result.message}`, 'error', 'git-test-result');
        
        // Refresh debug logs to show error details
        if (typeof refreshDebugLogs === 'function') {
            setTimeout(() => refreshDebugLogs(), 100);
        }
    }
}

// Refresh Git Status
async function refreshGitStatus() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-status-container');
        return;
    }
    
    const config = window.GitOps.config;
    const validation = window.GitOps.validateConfig(config);
    
    if (!validation.valid) {
        showMessage('Please configure Git settings first', 'error', 'git-status-container');
        return;
    }
    
    document.getElementById('git-status-container').innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
    
    const result = await window.GitOps.getStatus();
    
    if (result.success) {
        const { repo, branches, commits } = result.data;
        
        let html = `
            <div style="display: grid; gap: 1rem;">
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary);">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--primary);"><i class="fas fa-info-circle"></i> Repository Info</h5>
                    <div style="display: grid; gap: 0.25rem; font-size: 0.9rem;">
                        <div><strong>Name:</strong> ${repo.full_name}</div>
                        <div><strong>Description:</strong> ${repo.description || 'No description'}</div>
                        <div><strong>Default Branch:</strong> ${repo.default_branch}</div>
                        <div><strong>Private:</strong> ${repo.private ? 'Yes' : 'No'}</div>
                        <div><strong>Stars:</strong> ⭐ ${repo.stargazers_count}</div>
                        <div><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleString()}</div>
                    </div>
                </div>
                
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--secondary);">
                    <h5 style="margin: 0 0 0.5rem 0; color: var(--secondary);"><i class="fas fa-code-branch"></i> Branches (${branches.length})</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${branches.map(b => `
                            <span style="background: var(--bg-tertiary); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">
                                ${b.name === repo.default_branch ? '🌟 ' : ''}${b.name}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; border-left: 4px solid #10b981;">
                    <h5 style="margin: 0 0 0.75rem 0; color: #10b981;"><i class="fas fa-history"></i> Recent Commits</h5>
                    <div style="display: grid; gap: 0.75rem;">
                        ${commits.slice(0, 5).map(c => `
                            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.25rem;">
                                    <strong style="font-size: 0.9rem; color: var(--text-primary);">${c.commit.message.split('\n')[0]}</strong>
                                    <span style="font-size: 0.75rem; color: var(--text-tertiary);">${c.sha.substring(0, 7)}</span>
                                </div>
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                    <i class="fas fa-user"></i> ${c.commit.author.name} • 
                                    <i class="fas fa-clock"></i> ${new Date(c.commit.author.date).toLocaleString()}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('git-status-container').innerHTML = html;
    } else {
        showMessage(`Failed to load status: ${result.message}`, 'error', 'git-status-container');
    }
}

// Load Git Files for operations
let projectFolderHandle = null;

async function loadGitFiles() {
    if (!projectFolderHandle) {
        showMessage('Please select a project folder first', 'info', 'git-files-list');
        return;
    }

    document.getElementById('git-files-list').innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading files...</div>';

    try {
        const files = await getAllFilesFromFolder(projectFolderHandle);
        
        if (files.length === 0) {
            document.getElementById('git-files-list').innerHTML = '<div style="text-align: center; color: var(--text-tertiary); padding: 2rem 0;"><i class="fas fa-folder-open" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.5rem;"></i><p>No files found in the selected folder</p></div>';
            return;
        }

        let html = `
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                <i class="fas fa-info-circle"></i> Found ${files.length} file(s). Select files to include in commit:
            </div>
        `;
        
        files.forEach(file => {
            const icon = getFileIcon(file.path);
            html += `
                <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: var(--card-bg); border-radius: 6px; margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-color);" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                    <input type="checkbox" class="git-file-checkbox" value="${file.path}" checked style="width: auto; cursor: pointer;">
                    <i class="${icon}" style="color: var(--primary);"></i>
                    <span style="font-size: 0.9rem;">${file.path}</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--text-tertiary);">${formatFileSize(file.size)}</span>
                </label>
            `;
        });
        
        document.getElementById('git-files-list').innerHTML = html;
    } catch (error) {
        console.error('Error loading files:', error);
        showMessage(`Error loading files: ${error.message}`, 'error', 'git-files-list');
    }
}

// Get all files from a folder recursively
async function getAllFilesFromFolder(folderHandle, basePath = '') {
    const files = [];
    
    try {
        for await (const entry of folderHandle.values()) {
            const currentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
            
            // Skip hidden files, node_modules, and common non-code directories
            if (entry.name.startsWith('.') || 
                entry.name === 'node_modules' || 
                entry.name === 'dist' || 
                entry.name === 'build' ||
                entry.name === '.git') {
                continue;
            }
            
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                files.push({
                    path: currentPath,
                    handle: entry,
                    file: file,
                    size: file.size
                });
            } else if (entry.kind === 'directory') {
                // Recursively get files from subdirectories
                const subFiles = await getAllFilesFromFolder(entry, currentPath);
                files.push(...subFiles);
            }
        }
    } catch (error) {
        console.error('Error reading folder:', error);
    }
    
    return files;
}

// Select project folder
async function selectProjectFolder() {
    try {
        // Check if File System Access API is supported
        if (!('showDirectoryPicker' in window)) {
            showMessage('Your browser does not support folder selection. Please use a modern browser like Chrome, Edge, or Opera.', 'error', 'git-operation-result');
            return;
        }

        const handle = await window.showDirectoryPicker({
            mode: 'read'
        });
        
        projectFolderHandle = handle;
        
        // Store folder name and permission in localStorage
        localStorage.setItem('git-project-folder-name', handle.name);
        
        // Update UI with enhanced display
        document.getElementById('selected-folder-display').innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-folder" style="color: var(--success);"></i> 
                <strong style="color: var(--success);">${handle.name}</strong>
                <span style="font-size: 0.75rem; color: var(--text-tertiary); margin-left: 0.5rem;">(Connected)</span>
            </div>
        `;
        
        showMessage(`✅ Folder "${handle.name}" selected successfully! Click "Load Files" to scan the folder.`, 'success', 'git-operation-result');
        
        console.log(`✅ Folder selected: ${handle.name}`);
        
        // Automatically load files
        await loadFilesFromFolder();
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled the picker
            console.log('Folder selection cancelled');
        } else {
            console.error('Error selecting folder:', error);
            showMessage(`Error selecting folder: ${error.message}`, 'error', 'git-operation-result');
        }
    }
}

// Clear project folder
function clearProjectFolder() {
    projectFolderHandle = null;
    localStorage.removeItem('git-project-folder-name');
    
    document.getElementById('selected-folder-display').innerHTML = `
        <i class="fas fa-info-circle"></i> No folder selected
    `;
    
    document.getElementById('git-files-list').innerHTML = `
        <div style="text-align: center; color: var(--text-tertiary); padding: 2rem 0;">
            <i class="fas fa-folder" style="font-size: 2rem; opacity: 0.3; margin-bottom: 0.5rem;"></i>
            <p>Select a project folder and click "Load Files"</p>
        </div>
    `;
    
    showMessage('Folder selection cleared', 'info', 'git-operation-result');
}

// Load files from folder button handler
async function loadFilesFromFolder() {
    if (!projectFolderHandle) {
        showMessage('⚠️ Please select a project folder first using the "Select Folder" button', 'warning', 'git-operation-result');
        return;
    }
    
    // Request permission if needed
    try {
        const permission = await projectFolderHandle.requestPermission({ mode: 'read' });
        if (permission !== 'granted') {
            showMessage('❌ Permission denied to read folder. Please select the folder again.', 'error', 'git-operation-result');
            return;
        }
    } catch (error) {
        console.error('Permission error:', error);
    }
    
    showMessage('<i class="fas fa-spinner fa-spin"></i> Scanning folder for files...', 'info', 'git-operation-result');
    
    await loadGitFiles();
    
    // Count loaded files
    const fileCount = document.querySelectorAll('.git-file-checkbox').length;
    if (fileCount > 0) {
        showMessage(`✅ Loaded ${fileCount} file(s) from folder. Select files and enter a commit message to push.`, 'success', 'git-operation-result');
    }
}

// Select all files
function selectAllFiles() {
    document.querySelectorAll('.git-file-checkbox').forEach(cb => cb.checked = true);
}

// Deselect all files
function deselectAllFiles() {
    document.querySelectorAll('.git-file-checkbox').forEach(cb => cb.checked = false);
}

// Get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'js': 'fab fa-js-square',
        'jsx': 'fab fa-react',
        'ts': 'fas fa-file-code',
        'tsx': 'fab fa-react',
        'html': 'fab fa-html5',
        'css': 'fab fa-css3-alt',
        'json': 'fas fa-file-code',
        'md': 'fab fa-markdown',
        'txt': 'fas fa-file-alt',
        'py': 'fab fa-python',
        'java': 'fab fa-java',
        'php': 'fab fa-php',
        'xml': 'fas fa-file-code',
        'yml': 'fas fa-file-code',
        'yaml': 'fas fa-file-code'
    };
    
    return iconMap[ext] || 'fas fa-file';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Restore folder selection on page load
async function restoreProjectFolder() {
    const savedFolderName = localStorage.getItem('git-project-folder-name');
    if (savedFolderName) {
        document.getElementById('selected-folder-display').innerHTML = `
            <i class="fas fa-folder" style="color: var(--warning);"></i> 
            <strong>${savedFolderName}</strong> <span style="font-size: 0.8rem; color: var(--text-tertiary);">(click "Select Folder" to reconnect)</span>
        `;
    }
}

// Set commit message from template
function setCommitMessage(prefix) {
    const textarea = document.getElementById('git-commit-message');
    if (!textarea.value || textarea.value.startsWith('feat: ') || textarea.value.startsWith('fix: ') || 
        textarea.value.startsWith('docs: ') || textarea.value.startsWith('style: ') || 
        textarea.value.startsWith('refactor: ') || textarea.value.startsWith('Update: ')) {
        textarea.value = prefix;
    } else {
        textarea.value = prefix + textarea.value;
    }
    textarea.focus();
}

// Commit and Push Changes
async function commitAndPushChanges() {
    console.log('='.repeat(50));
    console.log('🚀 STARTING PUSH PROCESS');
    console.log('='.repeat(50));
    
    try {
        // Step 1: Check if Git module is loaded
        console.log('✓ Step 1: Checking Git module...');
        if (!window.GitOps) {
            throw new Error('Git module not loaded. Please refresh the page.');
        }
        console.log('✓ Git module loaded');
        
        // Step 2: Validate Git configuration
        console.log('✓ Step 2: Validating Git configuration...');
        const validation = window.GitOps.validateConfig(window.GitOps.config);
        if (!validation.valid) {
            throw new Error(`Git configuration incomplete: ${validation.message}. Please configure Git settings in the Settings tab first.`);
        }
        console.log('✓ Git configuration valid');
        console.log(`   Repo: ${window.GitOps.config.owner}/${window.GitOps.config.repo}`);
        console.log(`   Branch: ${window.GitOps.config.branch}`);
        
        // Step 3: Check folder selection
        console.log('✓ Step 3: Checking project folder...');
        if (!projectFolderHandle) {
            throw new Error('Please select a project folder first (use "Select Folder" button)');
        }
        console.log('✓ Project folder selected');
        
        // Step 4: Validate commit message
        console.log('✓ Step 4: Checking commit message...');
        const commitMessage = document.getElementById('git-commit-message').value.trim();
        if (!commitMessage) {
            throw new Error('Please enter a commit message');
        }
        console.log(`✓ Commit message: "${commitMessage}"`);
        
        // Step 5: Get selected files
        console.log('✓ Step 5: Checking selected files...');
        const selectedCheckboxes = Array.from(document.querySelectorAll('.git-file-checkbox:checked'));
        if (selectedCheckboxes.length === 0) {
            throw new Error('Please select at least one file to commit');
        }
        console.log(`✓ ${selectedCheckboxes.length} file(s) selected`);
        
        // Step 6: Read file contents
        showMessage(`<i class="fas fa-spinner fa-spin"></i> Reading ${selectedCheckboxes.length} file(s)...`, 'info', 'git-operation-result');
        console.log('✓ Step 6: Reading file contents...');
        
        const files = [];
        const allFiles = await getAllFilesFromFolder(projectFolderHandle);
        
        for (const checkbox of selectedCheckboxes) {
            const filePath = checkbox.value;
            const fileData = allFiles.find(f => f.path === filePath);
            
            if (fileData) {
                try {
                    const content = await fileData.file.text();
                    files.push({
                        path: filePath,
                        content: content
                    });
                    console.log(`  ✅ Read: ${filePath} (${formatFileSize(fileData.size)})`);
                } catch (error) {
                    console.error(`  ❌ Failed to read: ${filePath}`, error);
                    throw new Error(`Failed to read file ${filePath}: ${error.message}`);
                }
            } else {
                console.warn(`  ⚠️  File not found: ${filePath}`);
            }
        }
        
        if (files.length === 0) {
            throw new Error('Could not read any selected files. Please reload the file list and try again.');
        }
        
        console.log(`✅ Successfully read ${files.length} file(s)`);
        
        // Step 7: Push to GitHub
        showMessage(`<i class="fas fa-spinner fa-spin"></i> Pushing ${files.length} file(s) to GitHub...`, 'info', 'git-operation-result');
        console.log('✓ Step 7: Pushing to GitHub...');
        console.log(`   Repository: ${window.GitOps.config.owner}/${window.GitOps.config.repo}`);
        console.log(`   Branch: ${window.GitOps.config.branch}`);
        console.log(`   Files: ${files.length}`);
        
        const result = await window.GitOps.pushFiles(files, commitMessage);
        
        if (result.success) {
            // Safe SHA handling
            let commitSha = 'unknown';
            try {
                if (result.data && result.data.sha) {
                    commitSha = result.data.sha.substring(0, 7);
                }
            } catch (e) {
                console.warn('Could not extract SHA:', e);
            }
            
            const repoUrl = `https://github.com/${window.GitOps.config.owner}/${window.GitOps.config.repo}/tree/${window.GitOps.config.branch}`;
            
            const successMsg = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎉</div>
                    <strong style="font-size: 1.2rem; color: var(--success);">SUCCESS!</strong>
                    <div style="margin-top: 1rem;">
                        <div>✅ Pushed ${files.length} file(s) to GitHub</div>
                        <div style="margin: 0.5rem 0;">
                            <small>Commit: <code>${commitSha}</code></small><br>
                            <small>Message: "${commitMessage}"</small>
                        </div>
                        <div style="margin-top: 1rem;">
                            <a href="${repoUrl}" target="_blank" style="color: var(--primary); text-decoration: underline;">
                                🔗 View on GitHub →
                            </a>
                        </div>
                    </div>
                </div>
            `;
            
            showMessage(successMsg, 'success', 'git-operation-result');
            document.getElementById('git-commit-message').value = '';
            
            console.log('='.repeat(50));
            console.log(`🎉 SUCCESS! Pushed ${files.length} file(s)!`);
            console.log(`   Commit: ${commitSha}`);
            console.log(`   URL: ${repoUrl}`);
            console.log('='.repeat(50));
            
            // Show success notification
            if (window.showNotification) {
                showNotification('Git Push Successful', `Pushed ${files.length} file(s) to ${window.GitOps.config.owner}/${window.GitOps.config.repo}`, 'success');
            }
        } else {
            throw new Error(result.message || 'Push failed for unknown reason');
        }
    } catch (error) {
        console.error('='.repeat(50));
        console.error('❌ PUSH FAILED:', error.message);
        console.error('='.repeat(50));
        console.error(error);
        
        // Show detailed error message
        const errorMsg = `
            <div>
                <strong>❌ Push Failed</strong><br>
                <div style="margin-top: 0.5rem; font-size: 0.9rem;">${error.message}</div>
                ${error.stack ? `<details style="margin-top: 0.5rem; font-size: 0.8rem;"><summary>Technical Details</summary><pre style="background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 4px; overflow-x: auto; margin-top: 0.5rem;">${error.stack}</pre></details>` : ''}
            </div>
        `;
        
        showMessage(errorMsg, 'error', 'git-operation-result');
    }
}

// Pull Latest Changes
async function pullLatestChanges() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-operation-result');
        return;
    }
    
    showMessage('This feature will pull latest changes from the repository.<br><br><strong>Note:</strong> In a web application, you cannot directly pull files to your local system. Instead, you can:<br>1. View the latest commit history<br>2. Download specific files from the repository<br>3. Clone the repository locally using Git', 'info', 'git-operation-result');
}

// Load Git History
async function loadGitHistory() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-history-container');
        return;
    }
    
    const config = window.GitOps.config;
    const validation = window.GitOps.validateConfig(config);
    
    if (!validation.valid) {
        showMessage('Please configure Git settings first', 'error', 'git-history-container');
        return;
    }
    
    document.getElementById('git-history-container').innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading history...</div>';
    
    const result = await window.GitOps.getHistory(20);
    
    if (result.success) {
        let html = '<div style="display: grid; gap: 1rem;">';
        
        result.data.forEach((commit, index) => {
            const date = new Date(commit.commit.author.date);
            const isRecent = (Date.now() - date.getTime()) < 86400000; // Less than 24 hours
            
            html += `
                <div style="background: var(--card-bg); padding: 1.25rem; border-radius: 10px; border-left: 4px solid ${isRecent ? '#10b981' : 'var(--border-color)'};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                        <div style="flex: 1;">
                            <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.5rem; font-size: 0.95rem;">
                                ${commit.commit.message.split('\n')[0]}
                            </div>
                            ${commit.commit.message.split('\n').length > 1 ? `
                                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                                    ${commit.commit.message.split('\n').slice(1).join('<br>')}
                                </div>
                            ` : ''}
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
                            <code style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                ${commit.sha.substring(0, 7)}
                            </code>
                            ${isRecent ? '<span style="background: #10b981; color: white; padding: 0.15rem 0.4rem; border-radius: 10px; font-size: 0.7rem; font-weight: 700;">NEW</span>' : ''}
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-tertiary);">
                        <div>
                            <i class="fas fa-user"></i> ${commit.commit.author.name}
                            ${commit.commit.author.email ? `<${commit.commit.author.email}>` : ''}
                        </div>
                        <div>
                            <i class="fas fa-clock"></i> ${date.toLocaleString()}
                        </div>
                    </div>
                    
                    ${commit.html_url ? `
                        <div style="margin-top: 0.75rem;">
                            <a href="${commit.html_url}" target="_blank" style="color: var(--primary); text-decoration: none; font-size: 0.85rem;">
                                <i class="fas fa-external-link-alt"></i> View on GitHub
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        document.getElementById('git-history-container').innerHTML = html;
    } else {
        showMessage(`Failed to load history: ${result.message}`, 'error', 'git-history-container');
    }
}

// Helper function to show messages in result containers
function showMessage(message, type, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const bgColors = {
        success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
        error: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
        info: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.05))'
    };
    
    const borderColors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };
    
    container.innerHTML = `
        <div style="background: ${bgColors[type] || bgColors.info}; 
                    border-left: 4px solid ${borderColors[type] || borderColors.info}; 
                    padding: 1rem; 
                    border-radius: 8px; 
                    margin-top: 1rem;">
            <div style="display: flex; align-items: start; gap: 0.75rem;">
                <i class="fas fa-${icons[type] || icons.info}" style="color: ${borderColors[type] || borderColors.info}; margin-top: 0.1rem;"></i>
                <div style="flex: 1; font-size: 0.9rem; line-height: 1.5;">${message}</div>
            </div>
        </div>
    `;
}

// ==================== DEBUG FUNCTIONS ====================

// Refresh Debug Logs
function refreshDebugLogs() {
    if (!window.GitOps) {
        showMessage('Git module not loaded', 'error', 'git-debug-container');
        return;
    }
    
    const logs = window.GitOps.debugLogs || [];
    
    if (logs.length === 0) {
        document.getElementById('git-debug-container').innerHTML = `
            <div style="text-align: center; color: var(--text-tertiary); padding: 3rem 0;">
                <i class="fas fa-terminal" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i>
                <p>No API calls yet. Try testing your connection first.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    
    // Show logs in reverse order (newest first)
    logs.slice().reverse().forEach((log, index) => {
        const isSuccess = log.type === 'SUCCESS';
        const borderColor = isSuccess ? '#10b981' : '#ef4444';
        const bgColor = isSuccess ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        
        // Format the request for Postman
        const postmanRequest = {
            method: log.request.method,
            url: log.request.url,
            headers: log.request.headers,
            body: log.request.body ? JSON.stringify(log.request.body, null, 2) : null
        };
        
        // Create cURL command
        let curlCommand = `curl -X ${log.request.method} "${log.request.url}"`;
        Object.entries(log.request.headers).forEach(([key, value]) => {
            curlCommand += ` \\\n  -H "${key}: ${value}"`;
        });
        if (log.request.body) {
            curlCommand += ` \\\n  -d '${JSON.stringify(log.request.body)}'`;
        }
        
        html += `
            <div style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1.25rem; border-radius: 10px;">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                            <span style="background: ${borderColor}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
                                ${log.type}
                            </span>
                            <span style="font-family: monospace; font-size: 0.85rem; color: var(--text-secondary);">
                                ${new Date(log.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                            <span style="background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">
                                ${log.request.method}
                            </span>
                            ${log.endpoint}
                        </div>
                    </div>
                </div>
                
                <!-- Request Details -->
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h5 style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
                            <i class="fas fa-arrow-up"></i> Request
                        </h5>
                        <button class="btn btn-sm btn-secondary" onclick="copyToClipboard('request-${index}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px; overflow-x: auto;">
                        <pre id="request-${index}" style="margin: 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary);">${JSON.stringify(postmanRequest, null, 2)}</pre>
                    </div>
                </div>
                
                <!-- cURL Command -->
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h5 style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
                            <i class="fas fa-terminal"></i> cURL Command
                        </h5>
                        <button class="btn btn-sm btn-secondary" onclick="copyToClipboard('curl-${index}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px; overflow-x: auto;">
                        <pre id="curl-${index}" style="margin: 0; font-size: 0.75rem; line-height: 1.5; color: var(--text-primary);">${curlCommand}</pre>
                    </div>
                </div>
                
                ${log.response ? `
                <!-- Response Details -->
                <div style="background: var(--card-bg); padding: 1rem; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <h5 style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
                            <i class="fas fa-arrow-down"></i> Response
                            <span style="background: ${log.response.status < 300 ? '#10b981' : '#ef4444'}; color: white; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">
                                ${log.response.status}
                            </span>
                        </h5>
                        <button class="btn btn-sm btn-secondary" onclick="copyToClipboard('response-${index}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 6px; overflow-x: auto; max-height: 300px; overflow-y: auto;">
                        <pre id="response-${index}" style="margin: 0; font-size: 0.8rem; line-height: 1.5; color: var(--text-primary);">${JSON.stringify(log.response.data, null, 2)}</pre>
                    </div>
                </div>
                ` : ''}
                
                ${log.error ? `
                <!-- Error Details -->
                <div style="background: rgba(239, 68, 68, 0.15); padding: 1rem; border-radius: 8px; border: 1px solid #ef4444; margin-top: 1rem;">
                    <h5 style="margin: 0 0 0.5rem 0; font-size: 0.9rem; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle"></i> Error
                    </h5>
                    <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-primary);">
                        ${log.error}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    document.getElementById('git-debug-container').innerHTML = html;
}

// Clear Debug Logs
function clearDebugLogs() {
    if (!window.GitOps) {
        return;
    }
    
    if (confirm('Clear all debug logs?')) {
        window.GitOps.debugLogs = [];
        refreshDebugLogs();
    }
}

// Export Debug Logs
function exportDebugLogs() {
    if (!window.GitOps) {
        return;
    }
    
    const logs = window.GitOps.debugLogs || [];
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `git-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Copy to Clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.background = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

// Initialize folder restoration on page load
document.addEventListener('DOMContentLoaded', function() {
    restoreProjectFolder();
});
