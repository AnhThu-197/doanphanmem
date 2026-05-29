// Automation Management Script
let automations = [];
let currentAutomation = null;
let isEditMode = false;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!AUTH.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Display user name
    const user = AUTH.getCurrentUser();
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }

    // Load automations
    loadAutomations();

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterAutomations, 300));
    }

    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAutomations);
    }
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load automations from API
async function loadAutomations() {
    try {
        showLoading();

        // Check if API is available
        if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
            try {
                const response = await API_SERVICES.automation.getAll();
                
                // Handle different response structures
                if (response && response.data) {
                    automations = Array.isArray(response.data) ? response.data : [];
                } else if (Array.isArray(response)) {
                    automations = response;
                } else {
                    throw new Error('Invalid response format');
                }
                
                console.log('Loaded automations from API:', automations.length);
            } catch (apiError) {
                console.warn('API call failed, using mock data:', apiError.message);
                automations = getMockAutomations();
            }
        } else {
            console.log('API not available, using mock data');
            automations = getMockAutomations();
        }

        updateStats();
        renderAutomations();
    } catch (error) {
        console.error('Error loading automations:', error);
        showError('Không thể tải danh sách kịch bản tự động');
        // Fallback to mock data
        automations = getMockAutomations();
        updateStats();
        renderAutomations();
    }
}

// Mock data for testing
function getMockAutomations() {
    return [
        {
            id: 1,
            name: 'Chào mừng khách hàng mới',
            description: 'Gửi email chào mừng tự động khi có khách hàng mới đăng ký',
            trigger: 'new_customer',
            status: 'active',
            priority: 'high',
            createdAt: '2024-01-15',
            lastRun: '2024-01-20 10:30',
            executionCount: 145
        },
        {
            id: 2,
            name: 'Chúc mừng sinh nhật',
            description: 'Gửi lời chúc sinh nhật và mã giảm giá đặc biệt',
            trigger: 'customer_birthday',
            status: 'active',
            priority: 'medium',
            createdAt: '2024-01-10',
            lastRun: '2024-01-19 08:00',
            executionCount: 89
        },
        {
            id: 3,
            name: 'Nhắc nhở khách hàng không hoạt động',
            description: 'Gửi email nhắc nhở cho khách hàng không tương tác trong 30 ngày',
            trigger: 'no_interaction',
            status: 'active',
            priority: 'low',
            createdAt: '2024-01-05',
            lastRun: '2024-01-18 14:00',
            executionCount: 67
        },
        {
            id: 4,
            name: 'Theo dõi sau chiến dịch',
            description: 'Gửi khảo sát và cảm ơn sau khi khách hàng tham gia chiến dịch',
            trigger: 'campaign_join',
            status: 'inactive',
            priority: 'medium',
            createdAt: '2024-01-01',
            lastRun: '2024-01-15 16:30',
            executionCount: 234
        },
        {
            id: 5,
            name: 'Ưu đãi khách hàng VIP',
            description: 'Gửi ưu đãi đặc biệt cho khách hàng VIP hàng tháng',
            trigger: 'new_customer',
            status: 'draft',
            priority: 'high',
            createdAt: '2024-01-22',
            lastRun: null,
            executionCount: 0
        }
    ];
}

// Update statistics
function updateStats() {
    const total = automations.length;
    const active = automations.filter(a => a.status === 'active').length;
    const totalExecutions = automations.reduce((sum, a) => sum + (a.executionCount || 0), 0);
    
    document.getElementById('totalAutomations').textContent = total;
    document.getElementById('activeAutomations').textContent = active;
    document.getElementById('customersReached').textContent = totalExecutions;
    
    // Calculate conversion rate (mock calculation)
    const conversionRate = totalExecutions > 0 ? ((totalExecutions * 0.15).toFixed(1)) : 0;
    document.getElementById('conversionRate').textContent = conversionRate + '%';
}

// Render automations table
function renderAutomations() {
    const tableContent = document.getElementById('tableContent');
    
    if (automations.length === 0) {
        tableContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-robot"></i>
                <h3>Chưa có kịch bản tự động nào</h3>
                <p>Tạo kịch bản đầu tiên để bắt đầu tự động hóa marketing</p>
            </div>
        `;
        return;
    }

    const html = `
        <table>
            <thead>
                <tr>
                    <th>Tên kịch bản</th>
                    <th>Điều kiện kích hoạt</th>
                    <th>Trạng thái</th>
                    <th>Độ ưu tiên</th>
                    <th>Số lần chạy</th>
                    <th>Lần chạy cuối</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${automations.map(automation => `
                    <tr>
                        <td>
                            <strong>${automation.name}</strong>
                            <br>
                            <small style="color: #94a3b8;">${automation.description || ''}</small>
                        </td>
                        <td>${getTriggerLabel(automation.trigger)}</td>
                        <td>
                            <span class="status-badge ${automation.status}">
                                ${getStatusLabel(automation.status)}
                            </span>
                        </td>
                        <td>${getPriorityLabel(automation.priority)}</td>
                        <td>${automation.executionCount || 0}</td>
                        <td>${automation.lastRun || 'Chưa chạy'}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-icon view" onclick="viewAutomation(${automation.id})" title="Xem chi tiết">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon edit" onclick="editAutomation(${automation.id})" title="Chỉnh sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon delete" onclick="deleteAutomation(${automation.id})" title="Xóa">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContent.innerHTML = html;
}

// Filter automations
function filterAutomations() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;

    let filtered = automations;

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(a => 
            a.name.toLowerCase().includes(searchTerm) ||
            (a.description && a.description.toLowerCase().includes(searchTerm))
        );
    }

    // Apply status filter
    if (statusFilter) {
        filtered = filtered.filter(a => a.status === statusFilter);
    }

    // Temporarily replace automations for rendering
    const originalAutomations = automations;
    automations = filtered;
    renderAutomations();
    automations = originalAutomations;
}

// Open create modal
function openCreateModal() {
    isEditMode = false;
    currentAutomation = null;
    
    document.getElementById('modalTitle').textContent = 'Tạo kịch bản tự động mới';
    document.getElementById('automationForm').reset();
    
    // Reset trigger selection
    document.querySelectorAll('.trigger-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    openModal('automationModal');
}

// Edit automation
function editAutomation(id) {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    isEditMode = true;
    currentAutomation = automation;

    document.getElementById('modalTitle').textContent = 'Chỉnh sửa kịch bản';
    document.getElementById('automationName').value = automation.name;
    document.getElementById('automationDescription').value = automation.description || '';
    document.getElementById('automationStatus').value = automation.status;
    document.getElementById('automationPriority').value = automation.priority;

    // Select trigger
    const triggerRadio = document.getElementById(`trigger_${automation.trigger}`);
    if (triggerRadio) {
        triggerRadio.checked = true;
        selectTrigger(automation.trigger);
    }

    openModal('automationModal');
}

// View automation details
function viewAutomation(id) {
    const automation = automations.find(a => a.id === id);
    if (!automation) return;

    document.getElementById('viewName').textContent = automation.name;
    document.getElementById('viewDescription').textContent = automation.description || '-';
    document.getElementById('viewTrigger').textContent = getTriggerLabel(automation.trigger);
    document.getElementById('viewStatus').innerHTML = `<span class="status-badge ${automation.status}">${getStatusLabel(automation.status)}</span>`;
    document.getElementById('viewPriority').textContent = getPriorityLabel(automation.priority);
    document.getElementById('viewCreatedAt').textContent = automation.createdAt || '-';
    document.getElementById('viewLastRun').textContent = automation.lastRun || 'Chưa chạy';
    document.getElementById('viewExecutionCount').textContent = automation.executionCount || 0;

    openModal('viewModal');
}

// Delete automation
async function deleteAutomation(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa kịch bản này?')) {
        return;
    }

    try {
        // Call API if available
        if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
            await API_SERVICES.automation.delete(id);
        }

        // Remove from local array
        automations = automations.filter(a => a.id !== id);
        
        updateStats();
        renderAutomations();
        showSuccess('Xóa kịch bản thành công');
    } catch (error) {
        console.error('Error deleting automation:', error);
        showError('Không thể xóa kịch bản');
    }
}

// Save automation
async function saveAutomation(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('automationName').value,
        description: document.getElementById('automationDescription').value,
        trigger: document.querySelector('input[name="trigger"]:checked')?.value,
        status: document.getElementById('automationStatus').value,
        priority: document.getElementById('automationPriority').value
    };

    if (!formData.trigger) {
        showError('Vui lòng chọn điều kiện kích hoạt');
        return;
    }

    try {
        if (isEditMode && currentAutomation) {
            // Update existing
            if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
                await API_SERVICES.automation.update(currentAutomation.id, formData);
            }
            
            const index = automations.findIndex(a => a.id === currentAutomation.id);
            if (index !== -1) {
                automations[index] = { ...automations[index], ...formData };
            }
            
            showSuccess('Cập nhật kịch bản thành công');
        } else {
            // Create new
            const newAutomation = {
                id: Date.now(),
                ...formData,
                createdAt: new Date().toISOString().split('T')[0],
                lastRun: null,
                executionCount: 0
            };

            if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
                const response = await API_SERVICES.automation.create(formData);
                newAutomation.id = response.data.id;
            }

            automations.unshift(newAutomation);
            showSuccess('Tạo kịch bản thành công');
        }

        updateStats();
        renderAutomations();
        closeModal('automationModal');
    } catch (error) {
        console.error('Error saving automation:', error);
        showError('Không thể lưu kịch bản');
    }
}

// Select trigger
function selectTrigger(triggerType) {
    document.querySelectorAll('.trigger-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`.trigger-option input[value="${triggerType}"]`)?.closest('.trigger-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    document.getElementById(`trigger_${triggerType}`).checked = true;
}

// Add action (placeholder)
function addAction() {
    showInfo('Chức năng thêm hành động đang được phát triển');
}

// Helper functions
function getTriggerLabel(trigger) {
    const labels = {
        'new_customer': 'Khách hàng mới',
        'customer_birthday': 'Sinh nhật KH',
        'no_interaction': 'Không tương tác',
        'campaign_join': 'Tham gia chiến dịch'
    };
    return labels[trigger] || trigger;
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Đang hoạt động',
        'inactive': 'Tạm dừng',
        'draft': 'Nháp'
    };
    return labels[status] || status;
}

function getPriorityLabel(priority) {
    const labels = {
        'high': '🔴 Cao',
        'medium': '🟡 Trung bình',
        'low': '🟢 Thấp'
    };
    return labels[priority] || priority;
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// UI feedback functions
function showLoading() {
    const tableContent = document.getElementById('tableContent');
    tableContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner"></i>
            <p>Đang tải dữ liệu...</p>
        </div>
    `;
}

function showSuccess(message) {
    alert('✅ ' + message);
}

function showError(message) {
    alert('❌ ' + message);
}

function showInfo(message) {
    alert('ℹ️ ' + message);
}

// Logout function
function logout() {
    AUTH.logout();
    window.location.href = 'login.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
};
