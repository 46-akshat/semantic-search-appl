// Global variables
let manualApiList = [];
let allSavedApis = [];

// ========== TAB SWITCHING ==========
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Load APIs when switching to view tab
    if (tabName === 'view') {
        loadAllApis();
    }
}

// ========== FILE UPLOAD FUNCTIONALITY ==========

// Setup drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    
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
    if (!file.name.toLowerCase().endsWith('.json')) {
        showStatus('❌ Please select a JSON file (.json extension required)', 'error');
        return;
    }
    
    // Show loading message
    showStatus('📤 Uploading file: ' + file.name + '...', 'info');
    
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
            showStatus(data, 'success');
            // Clear file input
            document.getElementById('fileInput').value = '';
        } else {
            showStatus(data, 'error');
        }
    })
    .catch(error => {
        console.error('Upload error:', error);
        showStatus('❌ Upload failed: ' + error.message, 'error');
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
        showStatus('❌ Please fill in all required fields (Path, Method, Description)', 'error');
        return;
    }
    
    // Validate path format
    if (!path.startsWith('/')) {
        showStatus('❌ API path should start with "/" (e.g., /api/users)', 'error');
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
        deprecated: false
    };
    
    // Add to list
    manualApiList.push(apiObj);
    
    // Update UI
    updateApiListDisplay();
    clearForm();
    showStatus('✅ API added to list! Total: ' + manualApiList.length, 'success');
}

function updateApiListDisplay() {
    const container = document.getElementById('apiListContainer');
    const saveButton = document.getElementById('saveAllButton');
    
    if (manualApiList.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No APIs added yet. Use the form above to add some!</p>';
        saveButton.style.display = 'none';
        return;
    }
    
    let html = '';
    manualApiList.forEach((api, index) => {
        html += `
            <div class="api-item">
                <div class="api-header">
                    <div>
                        <span class="method-badge method-${api.method.toLowerCase()}">${api.method}</span>
                        <strong style="margin-left: 10px;">${api.path}</strong>
                    </div>
                    <button class="delete-button" onclick="removeApiFromList(${index})">
                        🗑️ Remove
                    </button>
                </div>
                <p style="margin: 10px 0; color: #666;">${api.description}</p>
                ${api.requestBody ? `<p><strong>Request:</strong> ${api.requestBody.substring(0, 100)}${api.requestBody.length > 100 ? '...' : ''}</p>` : ''}
                ${api.responseBody ? `<p><strong>Response:</strong> ${api.responseBody.substring(0, 100)}${api.responseBody.length > 100 ? '...' : ''}</p>` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
    saveButton.style.display = 'block';
}

function removeApiFromList(index) {
    manualApiList.splice(index, 1);
    updateApiListDisplay();
    showStatus('🗑️ API removed from list', 'info');
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
        showStatus('❌ No APIs to save. Add some APIs first!', 'error');
        return;
    }
    
    showStatus('💾 Saving ' + manualApiList.length + ' APIs to database...', 'info');
    
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
                showStatus('✅ Successfully saved ' + manualApiList.length + ' APIs to database!', 'success');
                manualApiList = []; // Clear the list
                updateApiListDisplay();
            } else {
                showStatus('⚠️ Some APIs failed to save. Please check the console for details.', 'error');
            }
        })
        .catch(error => {
            console.error('Save error:', error);
            showStatus('❌ Failed to save APIs: ' + error.message, 'error');
        });
}

// ========== VIEW SAVED APIS ==========

function loadAllApis() {
    showStatus('🔄 Loading saved APIs...', 'info');
    
    fetch('/api/v1/details')
        .then(response => response.json())
        .then(data => {
            allSavedApis = data;
            displaySavedApis(data);
            showStatus('✅ Loaded ' + data.length + ' APIs from database', 'success');
        })
        .catch(error => {
            console.error('Load error:', error);
            showStatus('❌ Failed to load APIs: ' + error.message, 'error');
        });
}

function displaySavedApis(apis) {
    const container = document.getElementById('savedApisList');
    
    if (apis.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">No APIs found in database. Upload some files or create APIs manually!</p>';
        return;
    }
    
    let html = '';
    apis.forEach(api => {
        html += `
            <div class="api-item">
                <div class="api-header">
                    <div>
                        <span class="method-badge method-${api.method.toLowerCase()}">${api.method}</span>
                        <strong style="margin-left: 10px;">${api.path}</strong>
                        ${api.isDeprecated ? '<span style="color: #dc3545; margin-left: 10px;">⚠️ DEPRECATED</span>' : ''}
                    </div>
                    <div>
                        <button class="delete-button" onclick="deleteApi('${api.id}')">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                <p style="margin: 10px 0; color: #666;">${api.description || 'No description available'}</p>
                ${api.requestBody ? `<p><strong>Request:</strong> <code>${api.requestBody.substring(0, 150)}${api.requestBody.length > 150 ? '...' : ''}</code></p>` : ''}
                ${api.responseBody ? `<p><strong>Response:</strong> <code>${api.responseBody.substring(0, 150)}${api.responseBody.length > 150 ? '...' : ''}</code></p>` : ''}
                ${api.requestParam ? `<p><strong>Parameters:</strong> ${api.requestParam}</p>` : ''}
                ${api.requestQuery ? `<p><strong>Query:</strong> ${api.requestQuery}</p>` : ''}
                <p style="font-size: 0.9em; color: #999; margin-top: 10px;">
                    Created: ${new Date(api.createdAt).toLocaleString()}
                </p>
            </div>
        `;
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
        document.getElementById('savedApisList').innerHTML = 
            '<p style="color: #666; font-style: italic;">No APIs match your search term: "' + searchTerm + '"</p>';
    }
}

function deleteApi(apiId) {
    if (!confirm('Are you sure you want to delete this API?')) {
        return;
    }
    
    showStatus('🗑️ Deleting API...', 'info');
    
    fetch('/api/v1/details/' + apiId, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            showStatus('✅ API deleted successfully', 'success');
            loadAllApis(); // Refresh the list
        } else {
            showStatus('❌ Failed to delete API', 'error');
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showStatus('❌ Failed to delete API: ' + error.message, 'error');
    });
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
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to add API (when in manual tab)
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab && activeTab.id === 'manual-tab') {
            addApiToList();
        }
    }
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 API Manager loaded successfully!');
    showStatus('👋 Welcome! Choose an option above to get started.', 'info');
});