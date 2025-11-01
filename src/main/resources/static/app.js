// Global variables
let manualApiList = [];
let allSavedApis = [];

// Page titles for different tabs
const pageTitles = {
    'upload': 'Upload API Specifications',
    'manual': 'Create New API Endpoint',
    'view': 'API Catalog Browser',
    'search': 'Semantic API Search'
};

// ========== TAB SWITCHING ==========
function switchTab(tabName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active', 'fade-in');
    }

    // Update active nav link
    event.target.classList.add('active');

    // Update page title
    document.getElementById('pageTitle').textContent = pageTitles[tabName] || 'API Nexus';

    // Load data when switching to view tab
    if (tabName === 'view') {
        loadAllApis();
    }
}

// ========== FILE UPLOAD FUNCTIONALITY ==========

// Setup drag and drop
document.addEventListener('DOMContentLoaded', function () {
    const uploadArea = document.getElementById('uploadArea');

    // Make upload area clickable
    uploadArea.addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    uploadArea.addEventListener('drop', handleDrop, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('uploadArea').classList.add('dragover');
}

function unhighlight(e) {
    document.getElementById('uploadArea').classList.remove('dragover');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

function handleFileUpload(file) {
    // Validate file type
    const validExtensions = ['.json', '.yaml', '.yml'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
        showStatus('Please select a valid file (.json, .yaml, .yml)', 'error');
        return;
    }

    // Show loading message
    showStatus(`<div class="loading"><div class="spinner"></div>Uploading ${file.name}...</div>`, 'info');

    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Upload file
    fetch('/api/v1/ingest/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => {
            if (data.includes('Success')) {
                showStatus(`<i class="fas fa-check-circle"></i>${data}`, 'success');
                // Clear file input
                document.getElementById('fileInput').value = '';
            } else {
                showStatus(`<i class="fas fa-exclamation-triangle"></i>${data}`, 'error');
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            showStatus(`<i class="fas fa-times-circle"></i>Upload failed: ${error.message}`, 'error');
        });
}

// ========== MANUAL API CREATION ==========

function addApiToList() {
    // Get form values
    const path = document.getElementById('apiPath').value.trim();
    const method = document.getElementById('apiMethod').value;
    const description = document.getElementById('apiDescription').value.trim();
    const requestBody = document.getElementById('requestBody').value.trim();
    const responseBody = document.getElementById('responseBody').value.trim();
    const requestParams = document.getElementById('requestParams').value.trim();
    const requestQuery = document.getElementById('requestQuery').value.trim();

    // Validate required fields
    if (!path || !method || !description) {
        showStatus('<i class="fas fa-exclamation-triangle"></i>Please fill in all required fields (Path, Method, Description)', 'error');
        return;
    }

    // Validate path format
    if (!path.startsWith('/')) {
        showStatus('<i class="fas fa-exclamation-triangle"></i>API path should start with "/" (e.g., /api/users)', 'error');
        return;
    }

    // Create API object
    const apiObj = {
        path: path,
        method: method,
        description: description,
        requestBody: requestBody || null,
        responseBody: responseBody || null,
        requestParam: requestParams || null,
        requestQuery: requestQuery || null,
        isDeprecated: false
    };

    // Add to list
    manualApiList.push(apiObj);

    // Update UI
    updateApiListDisplay();
    clearForm();
    showStatus(`<i class="fas fa-check-circle"></i>API added to queue! Total: ${manualApiList.length}`, 'success');
}

function updateApiListDisplay() {
    const container = document.getElementById('apiListContainer');
    const queueCard = document.getElementById('apiQueueCard');
    const queueCount = document.getElementById('queueCount');

    if (manualApiList.length === 0) {
        queueCard.style.display = 'none';
        return;
    }

    queueCard.style.display = 'block';
    queueCount.textContent = manualApiList.length;

    let html = '';
    manualApiList.forEach((api, index) => {
        html += createApiItemHTML(api, index, true);
    });

    container.innerHTML = html;
}

function createApiItemHTML(api, index, isQueue = false) {
    const deleteAction = isQueue
        ? `<button class="btn btn-danger" onclick="removeApiFromList(${index})"><i class="fas fa-trash"></i></button>`
        : `<button class="btn btn-danger" onclick="deleteApi('${api.id}')"><i class="fas fa-trash"></i></button>`;

    return `
        <div class="api-item">
            <div class="api-header">
                <div>
                    <span class="api-method method-${api.method.toLowerCase()}">${api.method}</span>
                    <div class="api-path">${api.path}</div>
                </div>
                ${deleteAction}
            </div>
            <div class="api-description">${api.description}</div>
            ${api.requestBody || api.responseBody || api.requestParam || api.requestQuery ? `
                <div class="api-details">
                    ${api.requestBody ? `
                        <div class="api-detail">
                            <div class="api-detail-label">Request Body</div>
                            <div class="api-detail-value code-block">${api.requestBody.substring(0, 100)}${api.requestBody.length > 100 ? '...' : ''}</div>
                        </div>
                    ` : ''}
                    ${api.responseBody ? `
                        <div class="api-detail">
                            <div class="api-detail-label">Response Body</div>
                            <div class="api-detail-value code-block">${api.responseBody.substring(0, 100)}${api.responseBody.length > 100 ? '...' : ''}</div>
                        </div>
                    ` : ''}
                    ${api.requestParam ? `
                        <div class="api-detail">
                            <div class="api-detail-label">Path Parameters</div>
                            <div class="api-detail-value">${api.requestParam}</div>
                        </div>
                    ` : ''}
                    ${api.requestQuery ? `
                        <div class="api-detail">
                            <div class="api-detail-label">Query Parameters</div>
                            <div class="api-detail-value">${api.requestQuery}</div>
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

function removeApiFromList(index) {
    manualApiList.splice(index, 1);
    updateApiListDisplay();
    showStatus('<i class="fas fa-trash"></i>API removed from queue', 'info');
}

function clearForm() {
    document.getElementById('apiPath').value = '';
    document.getElementById('apiMethod').value = 'GET';
    document.getElementById('apiDescription').value = '';
    document.getElementById('requestBody').value = '';
    document.getElementById('responseBody').value = '';
    document.getElementById('requestParams').value = '';
    document.getElementById('requestQuery').value = '';
}

function saveAllApis() {
    if (manualApiList.length === 0) {
        showStatus('<i class="fas fa-exclamation-triangle"></i>No APIs to save. Add some APIs first!', 'error');
        return;
    }

    showStatus(`<div class="loading"><div class="spinner"></div>Saving ${manualApiList.length} APIs to database...</div>`, 'info');

    // Send each API to the server
    const promises = manualApiList.map(api => {
        return fetch('/api/v1/details', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(api)
        });
    });

    Promise.all(promises)
        .then(responses => {
            // Check if all requests were successful
            const allSuccessful = responses.every(response => response.ok);

            if (allSuccessful) {
                showStatus(`<i class="fas fa-check-circle"></i>Successfully saved ${manualApiList.length} APIs to database!`, 'success');
                manualApiList = []; // Clear the list
                updateApiListDisplay();
            } else {
                showStatus('<i class="fas fa-exclamation-triangle"></i>Some APIs failed to save. Please check the console for details.', 'error');
            }
        })
        .catch(error => {
            console.error('Save error:', error);
            showStatus(`<i class="fas fa-times-circle"></i>Failed to save APIs: ${error.message}`, 'error');
        });
}

// ========== VIEW SAVED APIS ==========

function loadAllApis() {
    showStatus('<div class="loading"><div class="spinner"></div>Loading API catalog...</div>', 'info');

    fetch('/api/v1/details')
        .then(response => response.json())
        .then(data => {
            allSavedApis = data;
            displaySavedApis(data);
            showStatus(`<i class="fas fa-check-circle"></i>Loaded ${data.length} APIs from database`, 'success');
        })
        .catch(error => {
            console.error('Load error:', error);
            showStatus(`<i class="fas fa-times-circle"></i>Failed to load APIs: ${error.message}`, 'error');
        });
}

function displaySavedApis(apis) {
    const container = document.getElementById('savedApisList');

    if (apis.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-database"></i>
                <h3>No APIs found</h3>
                <p>Upload some files or create APIs manually to get started</p>
            </div>
        `;
        return;
    }

    let html = '';
    apis.forEach(api => {
        html += createApiItemHTML(api, null, false);
    });

    container.innerHTML = html;
}

function searchApis() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    if (searchTerm === '') {
        displaySavedApis(allSavedApis);
        return;
    }

    const filteredApis = allSavedApis.filter(api => {
        return api.path.toLowerCase().includes(searchTerm) ||
            api.method.toLowerCase().includes(searchTerm) ||
            (api.description && api.description.toLowerCase().includes(searchTerm));
    });

    displaySavedApis(filteredApis);

    if (filteredApis.length === 0) {
        document.getElementById('savedApisList').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>No APIs match your search term: "${searchTerm}"</p>
            </div>
        `;
    }
}

function deleteApi(apiId) {
    if (!confirm('Are you sure you want to delete this API?')) {
        return;
    }

    showStatus('<div class="loading"><div class="spinner"></div>Deleting API...</div>', 'info');

    fetch('/api/v1/details/' + apiId, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                showStatus('<i class="fas fa-check-circle"></i>API deleted successfully', 'success');
                loadAllApis(); // Refresh the list
            } else {
                showStatus('<i class="fas fa-times-circle"></i>Failed to delete API', 'error');
            }
        })
        .catch(error => {
            console.error('Delete error:', error);
            showStatus(`<i class="fas fa-times-circle"></i>Failed to delete API: ${error.message}`, 'error');
        });
}

// ========== SEMANTIC SEARCH ==========

function handleSemanticSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            performSemanticSearch(query);
        }
    }
}

function performSemanticSearch(query) {
    document.getElementById('semanticSearchInput').value = query;
    showStatus(`<div class="loading"><div class="spinner"></div>Searching for: "${query}"...</div>`, 'info');

    // For now, perform a simple text-based search
    // TODO: Replace with actual semantic search when backend is ready
    const filteredApis = allSavedApis.filter(api => {
        const searchText = `${api.path} ${api.method} ${api.description || ''}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
    });

    const container = document.getElementById('searchResults');

    if (filteredApis.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>No APIs match your search: "${query}"</p>
            </div>
        `;
        showStatus(`<i class="fas fa-info-circle"></i>No results found for "${query}"`, 'info');
    } else {
        let html = '';
        filteredApis.forEach(api => {
            html += createApiItemHTML(api, null, false);
        });
        container.innerHTML = html;
        showStatus(`<i class="fas fa-check-circle"></i>Found ${filteredApis.length} APIs matching "${query}"`, 'success');
    }
}

// ========== UTILITY FUNCTIONS ==========

function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.innerHTML = `<div class="status-message status-${type}">${message}</div>`;

    // Auto-hide success and info messages after 5 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusDiv.innerHTML = '';
        }, 5000);
    }
}

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function (event) {
    // Ctrl/Cmd + Enter to add API (when in manual tab)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'manual-tab') {
            addApiToList();
        }
    }

    // Escape to clear search
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        const semanticSearchInput = document.getElementById('semanticSearchInput');
        if (document.activeElement === searchInput) {
            searchInput.value = '';
            searchApis();
        }
        if (document.activeElement === semanticSearchInput) {
            semanticSearchInput.value = '';
            document.getElementById('searchResults').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Ready to search</h3>
                    <p>Enter a search query above to find relevant APIs</p>
                </div>
            `;
        }
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 API Nexus loaded successfully!');
    showStatus('<i class="fas fa-rocket"></i>Welcome to API Nexus! Choose an option from the sidebar to get started.', 'info');

    // Load APIs if we're on the view tab
    if (document.getElementById('view-tab').classList.contains('active')) {
        loadAllApis();
    }
});

// ========== RESPONSIVE SIDEBAR ==========
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Add mobile menu button for responsive design
if (window.innerWidth <= 1024) {
    const header = document.querySelector('.header-content');
    const menuButton = document.createElement('button');
    menuButton.className = 'btn btn-secondary';
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    menuButton.onclick = toggleSidebar;
    header.insertBefore(menuButton, header.firstChild);
}