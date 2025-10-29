// API Base URL
const API_BASE = '/api/v1/details';

// Global state
let currentEditId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    loadAPIs();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('api-form').addEventListener('submit', handleFormSubmit);
}

// Tab switching
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');

    // Show/hide content
    document.getElementById('list-content').classList.toggle('hidden', tabName !== 'list');
    document.getElementById('create-content').classList.toggle('hidden', tabName !== 'create');

    // Reload APIs when switching to list tab
    if (tabName === 'list') {
        loadAPIs();
    }

    // Reset form when switching to create tab
    if (tabName === 'create') {
        resetForm();
    }
}

// Load all APIs
async function loadAPIs() {
    const loading = document.getElementById('loading');
    const apiList = document.getElementById('api-list');

    loading.classList.remove('hidden');
    apiList.classList.add('hidden');

    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Failed to load APIs');

        const apis = await response.json();
        displayAPIs(apis);
    } catch (error) {
        showError('Failed to load APIs: ' + error.message);
    } finally {
        loading.classList.add('hidden');
    }
}

// Display APIs in the list
function displayAPIs(apis) {
    const apiList = document.getElementById('api-list');

    if (apis.length === 0) {
        apiList.innerHTML = '<div class="loading">No APIs found. Create your first API endpoint!</div>';
    } else {
        apiList.innerHTML = apis.map(api => createAPICard(api)).join('');
    }

    apiList.classList.remove('hidden');
}

// Create API card HTML
function createAPICard(api) {
    const methodClass = `method-${api.method.toLowerCase()}`;
    const deprecatedClass = api.isDeprecated ? 'deprecated' : '';
    const deprecatedBadge = api.isDeprecated ? '<span class="deprecated-badge">DEPRECATED</span>' : '';

    return `
        <div class="api-card ${deprecatedClass}">
            <div class="api-header">
                <div>
                    <span class="method-badge ${methodClass}">${api.method}</span>
                    <strong style="margin-left: 1rem;">${api.path}</strong>
                    ${deprecatedBadge}
                </div>
            </div>
            
            <p style="margin-bottom: 1rem; color: #6c757d;">${api.description}</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <strong>Auth:</strong> ${api.authType || 'None'}
                </div>
                <div>
                    <strong>Status Codes:</strong> ${api.responseStatusCode ? api.responseStatusCode.join(', ') : 'N/A'}
                </div>
            </div>
            
            ${api.requestParam ? `<div style="margin-bottom: 0.5rem;"><strong>Parameters:</strong> ${api.requestParam}</div>` : ''}
            ${api.requestQuery ? `<div style="margin-bottom: 0.5rem;"><strong>Query:</strong> ${api.requestQuery}</div>` : ''}
            
            <div class="api-actions">
                <button class="btn btn-small" onclick="editAPI('${api.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteAPI('${api.id}')">🗑️ Delete</button>
                <button class="btn btn-small" onclick="viewDetails('${api.id}')">👁️ View Details</button>
            </div>
        </div>
    `;
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = getFormData();
    const url = currentEditId ? `${API_BASE}/${currentEditId}` : API_BASE;
    const method = currentEditId ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Failed to save API');

        showSuccess(currentEditId ? 'API updated successfully!' : 'API created successfully!');
        resetForm();
        showTab('list');

    } catch (error) {
        showError('Failed to save API: ' + error.message);
    }
}

// Get form data
function getFormData() {
    const statusCodes = document.getElementById('responseStatusCode').value
        .split(',')
        .map(code => parseInt(code.trim()))
        .filter(code => !isNaN(code));

    return {
        method: document.getElementById('method').value,
        description: document.getElementById('description').value,
        isDeprecated: document.getElementById('isDeprecated').checked,
        path: document.getElementById('path').value,
        authType: document.getElementById('authType').value,
        requestBody: document.getElementById('requestBody').value || null,
        requestParam: document.getElementById('requestParam').value || null,
        requestQuery: document.getElementById('requestQuery').value || null,
        responseBody: document.getElementById('responseBody').value || null,
        responseStatusCode: statusCodes
    };
}

// Edit API
async function editAPI(id) {
    try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to load API details');

        const api = await response.json();
        populateForm(api);
        currentEditId = id;
        showTab('create');

    } catch (error) {
        showError('Failed to load API for editing: ' + error.message);
    }
}

// Populate form with API data
function populateForm(api) {
    document.getElementById('method').value = api.method;
    document.getElementById('description').value = api.description;
    document.getElementById('isDeprecated').checked = api.isDeprecated;
    document.getElementById('path').value = api.path;
    document.getElementById('authType').value = api.authType || 'NONE';
    document.getElementById('requestBody').value = api.requestBody || '';
    document.getElementById('requestParam').value = api.requestParam || '';
    document.getElementById('requestQuery').value = api.requestQuery || '';
    document.getElementById('responseBody').value = api.responseBody || '';
    document.getElementById('responseStatusCode').value = api.responseStatusCode ? api.responseStatusCode.join(', ') : '';
}

// Delete API
async function deleteAPI(id) {
    if (!confirm('Are you sure you want to delete this API endpoint?')) return;

    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete API');

        showSuccess('API deleted successfully!');
        loadAPIs();

    } catch (error) {
        showError('Failed to delete API: ' + error.message);
    }
}

// View API details in a modal-like format
function viewDetails(id) {
    fetch(`${API_BASE}/${id}`)
        .then(response => response.json())
        .then(api => {
            const details = `
                📋 API Details
                
                Method: ${api.method}
                Path: ${api.path}
                Description: ${api.description}
                Auth Type: ${api.authType || 'None'}
                Deprecated: ${api.isDeprecated ? 'Yes' : 'No'}
                
                Request Parameters: ${api.requestParam || 'None'}
                Query Parameters: ${api.requestQuery || 'None'}
                
                Request Body:
                ${api.requestBody || 'None'}
                
                Response Body:
                ${api.responseBody || 'None'}
                
                Status Codes: ${api.responseStatusCode ? api.responseStatusCode.join(', ') : 'None'}
                
                Created: ${new Date(api.createdAt).toLocaleString()}
                Updated: ${new Date(api.updatedAt).toLocaleString()}
            `;

            alert(details);
        })
        .catch(error => showError('Failed to load API details: ' + error.message));
}

// Reset form
function resetForm() {
    document.getElementById('api-form').reset();
    currentEditId = null;

    // Update form title
    const title = document.querySelector('#create-content h2');
    title.textContent = 'Add New API Endpoint';
}

// Show error message
function showError(message) {
    removeMessages();
    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = message;
    document.querySelector('.content').prepend(error);

    setTimeout(() => error.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    removeMessages();
    const success = document.createElement('div');
    success.className = 'success';
    success.textContent = message;
    document.querySelector('.content').prepend(success);

    setTimeout(() => success.remove(), 3000);
}

// Remove existing messages
function removeMessages() {
    document.querySelectorAll('.error, .success').forEach(msg => msg.remove());
}

// Add click handler for tabs (since we can't use inline onclick in some environments)
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('tab')) {
        const tabName = event.target.textContent.includes('View') ? 'list' : 'create';
        showTab(tabName);
    }
});