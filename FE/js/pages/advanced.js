// ============================================
// ADVANCED FEATURES: TRIAL, AUTOMATION, REMINDERS, MERGE
// ============================================

function daysBetweenToday(dateString) {
    return Math.ceil((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24));
}

function loadTrialManagement() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const trials = DATA.trialCustomers || [];
    
    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Quản lý dùng thử</h1>
                <p>Theo dõi khách hàng đang dùng thử và thời hạn còn lại.</p>
            </div>
            <button class="btn btn-primary" onclick="openTrialModal()"><i class="fas fa-plus"></i> Thêm dùng thử</button>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Tổng dùng thử</h4>
                <div style="font-size: 28px; font-weight: 700; color: #1e293b;">${trials.length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Đang hoạt động</h4>
                <div style="font-size: 28px; font-weight: 700; color: #10b981;">${trials.filter(t => daysBetweenToday(t.endDate) > 0).length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Hết hạn</h4>
                <div style="font-size: 28px; font-weight: 700; color: #ef4444;">${trials.filter(t => daysBetweenToday(t.endDate) <= 0).length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Sắp hết hạn</h4>
                <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${trials.filter(t => {
                    const days = daysBetweenToday(t.endDate);
                    return days > 0 && days <= 7;
                }).length}</div>
            </div>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Bắt đầu</th>
                        <th>Kết thúc</th>
                        <th>Còn lại</th>
                        <th>Nhắc trước</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${trials.length === 0 ? `
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
                                <i class="fas fa-hourglass-start" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                                <p>Chưa có dữ liệu dùng thử</p>
                                <button class="btn btn-primary" onclick="openTrialModal()" style="margin-top: 12px;">
                                    <i class="fas fa-plus"></i> Thêm dùng thử đầu tiên
                                </button>
                            </td>
                        </tr>
                    ` : trials.map(trial => {
                        const daysLeft = daysBetweenToday(trial.endDate);
                        const isExpired = daysLeft <= 0;
                        const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;
                        
                        let statusLabel = '';
                        if (isExpired) {
                            statusLabel = '<span style="color: #ef4444; font-weight: 600;">Hết hạn</span>';
                        } else if (isExpiringSoon) {
                            statusLabel = `<span style="color: #f59e0b; font-weight: 600;">${daysLeft} ngày</span>`;
                        } else {
                            statusLabel = `<span style="color: #10b981; font-weight: 600;">${daysLeft} ngày</span>`;
                        }
                        
                        return `
                            <tr>
                                <td><strong>${trial.customerName}</strong></td>
                                <td>${formatDate(trial.startDate)}</td>
                                <td>${formatDate(trial.endDate)}</td>
                                <td>${statusLabel}</td>
                                <td>${trial.reminderDays || 0} ngày</td>
                                <td>
                                    <button class="btn-icon view" onclick="viewTrialDetail(${trial.id})" title="Xem chi tiết">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon edit" onclick="editTrial(${trial.id})" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    ${!isExpired ? `
                                        <button class="btn-icon" onclick="extendTrial(${trial.id})" title="Gia hạn" style="background: #fef3c7; color: #92400e;">
                                            <i class="fas fa-clock"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openTrialModal(trialId = null) {
    const trial = trialId ? DATA.trialCustomers.find(item => Number(item.id) === Number(trialId)) : null;
    
    // Set modal title
    document.getElementById('trialModalTitle').textContent = trial ? 'Cập nhật Dùng thử' : 'Thêm Dùng thử';
    
    // Populate customer dropdown
    const customerSelect = document.getElementById('trialCustomer');
    customerSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
    DATA.customers.filter(c => !c.deleted).forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        if (trial && Number(customer.id) === Number(trial.customerId)) {
            option.selected = true;
        }
        customerSelect.appendChild(option);
    });
    
    // Fill form
    document.getElementById('trialStartDate').value = trial?.startDate || new Date().toISOString().split('T')[0];
    document.getElementById('trialDays').value = trial?.daysAllowed || 30;
    document.getElementById('trialReminderDays').value = trial?.reminderDays || 3;
    document.getElementById('trialNotes').value = trial?.notes || '';
    
    // Calculate end date
    updateTrialEndDate();
    
    // Store current trial ID
    document.getElementById('trialForm').dataset.trialId = trial?.id || '';
    
    // Setup event listeners for auto-calculate end date
    document.getElementById('trialStartDate').addEventListener('change', updateTrialEndDate);
    document.getElementById('trialDays').addEventListener('input', updateTrialEndDate);
    
    // Open modal
    openModal('trialModal');
}

function updateTrialEndDate() {
    const startDate = document.getElementById('trialStartDate')?.value;
    const days = Number(document.getElementById('trialDays')?.value || 30);
    
    if (startDate) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + days);
        document.getElementById('trialEndDate').value = endDate.toISOString().split('T')[0];
    }
}

function saveTrialFromModal(e) {
    e.preventDefault();
    
    const form = e.target;
    const trialId = form.dataset.trialId;
    
    const customerId = Number(document.getElementById('trialCustomer').value);
    const customer = DATA.customers.find(item => Number(item.id) === customerId);
    const startDate = document.getElementById('trialStartDate').value;
    const days = Number(document.getElementById('trialDays').value || 30);
    const endDate = document.getElementById('trialEndDate').value;

    const payload = {
        customerId,
        customerName: customer?.name || '',
        startDate,
        endDate,
        daysAllowed: days,
        reminderDays: Number(document.getElementById('trialReminderDays').value || 0),
        notes: document.getElementById('trialNotes').value || ''
    };

    if (trialId) {
        // Update existing
        const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
        if (trial) {
            Object.assign(trial, payload);
        }
        showNotification('Cập nhật dùng thử thành công!', 'success');
    } else {
        // Create new
        DATA.trialCustomers.push({
            id: Math.max(0, ...DATA.trialCustomers.map(item => Number(item.id) || 0)) + 1,
            ...payload
        });
        showNotification('Thêm dùng thử thành công!', 'success');
    }

    closeModal('trialModal');
    loadTrialManagement();
}

function editTrial(trialId) {
    openTrialModal(trialId);
}

function viewTrialDetail(trialId) {
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    
    const daysLeft = daysBetweenToday(trial.endDate);
    const isExpired = daysLeft <= 0;
    
    // Fill detail modal
    document.getElementById('trialDetailCustomer').textContent = trial.customerName;
    document.getElementById('trialDetailStartDate').textContent = formatDate(trial.startDate);
    document.getElementById('trialDetailEndDate').textContent = formatDate(trial.endDate);
    document.getElementById('trialDetailDays').textContent = trial.daysAllowed + ' ngày';
    
    // Days left with color
    const daysLeftEl = document.getElementById('trialDetailDaysLeft');
    if (isExpired) {
        daysLeftEl.innerHTML = '<span style="color: #ef4444; font-weight: 600;">Hết hạn</span>';
    } else if (daysLeft <= 7) {
        daysLeftEl.innerHTML = `<span style="color: #f59e0b; font-weight: 600;">${daysLeft} ngày</span>`;
    } else {
        daysLeftEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">${daysLeft} ngày</span>`;
    }
    
    document.getElementById('trialDetailReminder').textContent = (trial.reminderDays || 0) + ' ngày';
    document.getElementById('trialDetailNotes').textContent = trial.notes || 'Không có ghi chú';
    
    // Status box
    const statusBox = document.getElementById('trialDetailStatusBox');
    if (isExpired) {
        statusBox.style.background = '#fee2e2';
        statusBox.style.borderColor = '#ef4444';
        statusBox.innerHTML = '<strong style="color: #991b1b;"><i class="fas fa-exclamation-circle"></i> Đã hết hạn dùng thử</strong><p style="margin: 4px 0 0 0; color: #991b1b; font-size: 13px;">Khách hàng cần được chuyển đổi hoặc gia hạn</p>';
    } else if (daysLeft <= 7) {
        statusBox.style.background = '#fef3c7';
        statusBox.style.borderColor = '#f59e0b';
        statusBox.innerHTML = '<strong style="color: #92400e;"><i class="fas fa-clock"></i> Sắp hết hạn</strong><p style="margin: 4px 0 0 0; color: #92400e; font-size: 13px;">Cần liên hệ khách hàng để chuyển đổi hoặc gia hạn</p>';
    } else {
        statusBox.style.background = '#dcfce7';
        statusBox.style.borderColor = '#10b981';
        statusBox.innerHTML = '<strong style="color: #166534;"><i class="fas fa-check-circle"></i> Đang hoạt động</strong><p style="margin: 4px 0 0 0; color: #166534; font-size: 13px;">Khách hàng đang trong thời gian dùng thử</p>';
    }
    
    // Store trial ID for actions
    document.getElementById('trialDetailEditBtn').onclick = () => {
        closeModal('trialDetailModal');
        editTrial(trialId);
    };
    document.getElementById('trialDetailDeleteBtn').onclick = () => deleteTrial(trialId);
    document.getElementById('trialDetailConvertBtn').onclick = () => {
        closeModal('trialDetailModal');
        openConvertTrialModal(trialId);
    };
    
    // Open modal
    openModal('trialDetailModal');
}

function editTrialFromDetail() {
    // This function is called from modal button
    closeModal('trialDetailModal');
}

function deleteTrialFromDetail() {
    const customerName = document.getElementById('trialDetailCustomer').textContent;
    const trial = DATA.trialCustomers.find(t => t.customerName === customerName);
    if (trial) {
        closeModal('trialDetailModal');
        deleteTrial(trial.id);
    }
}

function deleteTrial(trialId) {
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial || !confirm(`Bạn có chắc chắn muốn xóa dùng thử của "${trial.customerName}"?`)) return;
    
    DATA.trialCustomers = DATA.trialCustomers.filter(item => Number(item.id) !== Number(trialId));
    showNotification('Xóa dùng thử thành công!', 'success');
    closeModal('trialDetailModal');
    loadTrialManagement();
}

function openConvertTrialModal(trialId) {
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    
    document.getElementById('convertTrialCustomerName').textContent = trial.customerName;
    document.getElementById('convertTrialForm').dataset.trialId = trialId;
    
    openModal('convertTrialModal');
}

function saveConvertTrial(e) {
    e.preventDefault();
    
    const trialId = e.target.dataset.trialId;
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    
    const newStatus = document.getElementById('convertTrialNewStatus').value;
    const contractDate = document.getElementById('convertTrialContractDate').value;
    const contractValue = document.getElementById('convertTrialContractValue').value;
    const notes = document.getElementById('convertTrialNotes').value;
    
    // Update customer status
    const customer = DATA.customers.find(c => Number(c.id) === Number(trial.customerId));
    if (customer) {
        customer.status = newStatus;
        customer.trialStartDate = null;
        customer.trialDays = 0;
    }
    
    // Remove from trial list
    DATA.trialCustomers = DATA.trialCustomers.filter(item => Number(item.id) !== Number(trialId));
    
    // Add to audit log
    if (typeof DATA.addAuditLog === 'function') {
        DATA.addAuditLog('CONVERT_TRIAL', `Chuyển đổi ${trial.customerName} sang khách hàng chính thức`, AUTH.getCurrentUser()?.id);
    }
    
    closeModal('convertTrialModal');
    showNotification(`Chuyển đổi ${trial.customerName} thành công!`, 'success');
    loadTrialManagement();
}

function extendTrial(trialId) {
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    
    const daysLeft = daysBetweenToday(trial.endDate);
    
    document.getElementById('extendTrialCustomerName').textContent = trial.customerName;
    document.getElementById('extendTrialCurrentEndDate').textContent = formatDate(trial.endDate);
    document.getElementById('extendTrialDaysLeft').textContent = daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn';
    document.getElementById('extendTrialForm').dataset.trialId = trialId;
    
    // Setup event listener for auto-calculate new end date
    document.getElementById('extendTrialDays').addEventListener('input', function() {
        const days = Number(this.value || 0);
        const currentEndDate = new Date(trial.endDate);
        const newEndDate = new Date(currentEndDate);
        newEndDate.setDate(newEndDate.getDate() + days);
        document.getElementById('extendTrialNewEndDate').value = newEndDate.toISOString().split('T')[0];
    });
    
    // Trigger initial calculation
    document.getElementById('extendTrialDays').dispatchEvent(new Event('input'));
    
    openModal('extendTrialModal');
}

function saveExtendTrial(e) {
    e.preventDefault();
    
    const trialId = e.target.dataset.trialId;
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    
    const extendDays = Number(document.getElementById('extendTrialDays').value);
    const reason = document.getElementById('extendTrialReason').value;
    
    // Update end date
    const currentEndDate = new Date(trial.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + extendDays);
    trial.endDate = currentEndDate.toISOString().split('T')[0];
    trial.daysAllowed += extendDays;
    trial.notes = (trial.notes || '') + `\n[Gia hạn ${extendDays} ngày] ${reason}`;
    
    closeModal('extendTrialModal');
    showNotification(`Gia hạn thành công ${extendDays} ngày!`, 'success');
    loadTrialManagement();
}

function convertTrialToCustomer() {
    // This is called from detail modal button
    const customerName = document.getElementById('trialDetailCustomer').textContent;
    const trial = DATA.trialCustomers.find(t => t.customerName === customerName);
    if (trial) {
        closeModal('trialDetailModal');
        openConvertTrialModal(trial.id);
    }
}

async function loadAutomation() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    // Load workflows from API or use local data
    let workflows = DATA.automationWorkflows;
    try {
        if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
            const response = await API_SERVICES.automation.getAll();
            if (response && response.data) {
                workflows = Array.isArray(response.data) ? response.data : [];
                // Update local data
                DATA.automationWorkflows = workflows;
            }
        }
    } catch (error) {
        console.warn('Failed to load automation from API, using local data:', error);
    }

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Tự động hóa Marketing</h1>
                <p>Quản lý kịch bản chăm sóc khách hàng tự động và quy tắc chấm điểm lead.</p>
            </div>
            <button class="btn btn-primary" onclick="openWorkflowModal()"><i class="fas fa-plus"></i> Tạo kịch bản mới</button>
        </div>
        
        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Tổng kịch bản</h4>
                <div style="font-size: 28px; font-weight: 700; color: #1e293b;">${workflows.length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Đang hoạt động</h4>
                <div style="font-size: 28px; font-weight: 700; color: #10b981;">${workflows.filter(w => w.status === 'active').length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Tạm dừng</h4>
                <div style="font-size: 28px; font-weight: 700; color: #f59e0b;">${workflows.filter(w => w.status === 'paused').length}</div>
            </div>
            <div class="stat-card" style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                <h4 style="font-size: 13px; color: #64748b; margin: 0 0 8px 0;">Nháp</h4>
                <div style="font-size: 28px; font-weight: 700; color: #94a3b8;">${workflows.filter(w => w.status === 'draft').length}</div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('automationWorkflowTab')">Kịch bản tự động</button>
            <button class="tab-btn" onclick="switchTab('automationScoringTab')">Chấm điểm Lead</button>
        </div>
        <div id="automationWorkflowTab" class="tab-content active">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tên kịch bản</th>
                            <th>Điều kiện kích hoạt</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${workflows.length === 0 ? `
                            <tr>
                                <td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">
                                    <i class="fas fa-robot" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>
                                    <p>Chưa có kịch bản tự động nào</p>
                                    <button class="btn btn-primary" onclick="openWorkflowModal()" style="margin-top: 12px;">
                                        <i class="fas fa-plus"></i> Tạo kịch bản đầu tiên
                                    </button>
                                </td>
                            </tr>
                        ` : workflows.map(workflow => `
                            <tr>
                                <td>
                                    <strong>${workflow.name}</strong>
                                    ${workflow.description ? `<br><small style="color: #94a3b8;">${workflow.description}</small>` : ''}
                                </td>
                                <td>${getTriggerLabel(workflow.trigger)}</td>
                                <td>${getStatusBadge(workflow.status)}</td>
                                <td>${formatDate(workflow.createdDate)}</td>
                                <td>
                                    <button class="btn-icon view" onclick="viewWorkflow(${workflow.id})" title="Xem chi tiết">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon edit" onclick="editWorkflow(${workflow.id})" title="Chỉnh sửa">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon danger" onclick="deleteWorkflow(${workflow.id})" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="automationScoringTab" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Quy tắc chấm điểm Lead</h3>
                    <button class="btn-add" onclick="openScoringRuleModal()"><i class="fas fa-plus"></i> Thêm quy tắc</button>
                </div>
                <table>
                    <thead><tr><th>Hành động</th><th>Điểm</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${DATA.leadScoringRules.map(rule => `
                            <tr>
                                <td><strong>${rule.action}</strong></td>
                                <td><span style="color: #10b981; font-weight: 600;">+${rule.points}</span></td>
                                <td>${rule.active ? '<span class="status active">Hoạt động</span>' : '<span class="status">Tạm dừng</span>'}</td>
                                <td>
                                    <button class="btn-icon edit" onclick="editScoringRule(${rule.id})"><i class="fas fa-edit"></i></button>
                                    <button class="btn-icon danger" onclick="deleteScoringRule(${rule.id})"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Helper functions
function getTriggerLabel(trigger) {
    const labels = {
        'new_lead': '🆕 Lead mới',
        'email_opened': '📧 Mở email',
        'form_submitted': '📝 Gửi form',
        'status_changed': '🔄 Thay đổi trạng thái',
        'tag_added': '🏷️ Thêm tag',
        'manual': '👤 Thủ công',
        'new_customer': '🆕 Khách hàng mới',
        'customer_birthday': '🎂 Sinh nhật KH',
        'no_interaction': '⏰ Không tương tác',
        'campaign_join': '📢 Tham gia chiến dịch'
    };
    return labels[trigger] || trigger;
}

function getStatusBadge(status) {
    const badges = {
        'active': '<span class="status customer">Đang hoạt động</span>',
        'paused': '<span class="status prospect">Tạm dừng</span>',
        'draft': '<span class="status suspect">Nháp</span>'
    };
    return badges[status] || status;
}

function openWorkflowModal(workflowId = null) {
    const workflow = workflowId ? DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId)) : null;
    
    // Set modal title
    document.getElementById('workflowModalTitle').textContent = workflow ? 'Chỉnh sửa Kịch bản' : 'Tạo Kịch bản Tự động hóa';
    
    // Fill form
    document.getElementById('workflowName').value = workflow?.name || '';
    document.getElementById('workflowDescription').value = workflow?.description || '';
    document.getElementById('workflowTrigger').value = workflow?.trigger || 'new_lead';
    document.getElementById('workflowStatus').value = workflow?.status || 'draft';
    
    // Store current workflow ID for saving
    document.getElementById('workflowForm').dataset.workflowId = workflow?.id || '';
    
    // Open modal
    openModal('workflowModal');
}

async function saveWorkflowFromModal(e) {
    e.preventDefault();
    
    const form = e.target;
    const workflowId = form.dataset.workflowId;
    
    const workflowData = {
        name: document.getElementById('workflowName').value,
        description: document.getElementById('workflowDescription').value,
        trigger: document.getElementById('workflowTrigger').value,
        status: document.getElementById('workflowStatus').value
    };
    
    try {
        if (workflowId) {
            // Update existing workflow
            if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
                await API_SERVICES.automation.update(workflowId, workflowData);
            }
            
            const workflow = DATA.automationWorkflows.find(w => Number(w.id) === Number(workflowId));
            if (workflow) {
                Object.assign(workflow, workflowData);
            }
            
            showNotification('Cập nhật kịch bản thành công!', 'success');
        } else {
            // Create new workflow
            const newWorkflow = {
                id: Math.max(0, ...DATA.automationWorkflows.map(item => Number(item.id) || 0)) + 1,
                ...workflowData,
                actions: [],
                createdDate: new Date().toISOString().split('T')[0]
            };
            
            if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
                const response = await API_SERVICES.automation.create(workflowData);
                if (response && response.data && response.data.id) {
                    newWorkflow.id = response.data.id;
                }
            }
            
            DATA.automationWorkflows.push(newWorkflow);
            showNotification('Tạo kịch bản thành công!', 'success');
        }
        
        closeModal('workflowModal');
        loadAutomation();
    } catch (error) {
        console.error('Error saving workflow:', error);
        showNotification('Lỗi khi lưu kịch bản: ' + error.message, 'error');
    }
}

function viewWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId));
    if (!workflow) return;
    
    // Fill detail modal
    document.getElementById('workflowDetailName').textContent = workflow.name;
    document.getElementById('workflowDetailDescription').textContent = workflow.description || 'Không có mô tả';
    document.getElementById('workflowDetailTrigger').textContent = getTriggerLabel(workflow.trigger);
    document.getElementById('workflowDetailStatus').innerHTML = getStatusBadge(workflow.status);
    
    // Open detail modal
    openModal('workflowDetailModal');
}

function editWorkflow(workflowId) {
    openWorkflowModal(workflowId);
}

async function deleteWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId));
    if (!workflow || !confirm(`Bạn có chắc chắn muốn xóa kịch bản "${workflow.name}"?`)) return;
    
    try {
        if (typeof API_SERVICES !== 'undefined' && API_SERVICES.automation) {
            await API_SERVICES.automation.delete(workflowId);
        }
        
        DATA.automationWorkflows = DATA.automationWorkflows.filter(item => Number(item.id) !== Number(workflowId));
        showNotification('Xóa kịch bản thành công!', 'success');
        loadAutomation();
    } catch (error) {
        console.error('Error deleting workflow:', error);
        showNotification('Lỗi khi xóa kịch bản: ' + error.message, 'error');
    }
}

function addWorkflowAction() {
    const container = document.getElementById('workflowActions');
    const actionItem = document.createElement('div');
    actionItem.className = 'workflow-action-item';
    actionItem.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
    actionItem.innerHTML = `
        <select class="action-type" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <option value="send_email">Gửi email</option>
            <option value="send_sms">Gửi SMS</option>
            <option value="assign_to">Phân công cho</option>
            <option value="add_tag">Thêm tag</option>
            <option value="change_status">Đổi trạng thái</option>
            <option value="create_task">Tạo task</option>
            <option value="wait">Chờ (delay)</option>
        </select>
        <input type="text" class="action-value" placeholder="Giá trị" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;" />
        <button type="button" class="btn-delete" onclick="removeWorkflowAction(this)" style="padding: 6px 10px;">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(actionItem);
}

function removeWorkflowAction(button) {
    button.closest('.workflow-action-item').remove();
}

function editWorkflowFromDetail() {
    // Get current workflow ID from detail modal
    const workflowName = document.getElementById('workflowDetailName').textContent;
    const workflow = DATA.automationWorkflows.find(w => w.name === workflowName);
    
    closeModal('workflowDetailModal');
    
    if (workflow) {
        openWorkflowModal(workflow.id);
    }
}

async function deleteWorkflowFromDetail() {
    const workflowName = document.getElementById('workflowDetailName').textContent;
    const workflow = DATA.automationWorkflows.find(w => w.name === workflowName);
    
    if (!workflow) return;
    
    closeModal('workflowDetailModal');
    await deleteWorkflow(workflow.id);
}

function openScoringRuleModal(ruleId = null) {
    const rule = ruleId ? DATA.leadScoringRules.find(item => Number(item.id) === Number(ruleId)) : null;
    
    // Set modal title
    document.getElementById('scoringRuleModalTitle').textContent = rule ? 'Chỉnh sửa Quy tắc' : 'Thêm Quy tắc Chấm điểm';
    
    // Fill form if exists
    if (document.getElementById('scoringRuleAction')) {
        document.getElementById('scoringRuleAction').value = rule?.action || '';
    }
    if (document.getElementById('scoringRulePoints')) {
        document.getElementById('scoringRulePoints').value = rule?.points || 1;
    }
    
    // Store current rule ID
    const form = document.getElementById('scoringRuleForm');
    if (form) {
        form.dataset.ruleId = rule?.id || '';
    }
    
    // Open modal
    openModal('scoringRuleModal');
}

function saveScoringRuleFromModal(e) {
    e.preventDefault();
    
    const form = e.target;
    const ruleId = form.dataset.ruleId;
    
    const action = document.getElementById('scoringRuleAction')?.value || prompt('Hành động:');
    if (!action) return;
    
    const points = Number(document.getElementById('scoringRulePoints')?.value || prompt('Điểm:', 1));

    if (ruleId) {
        const rule = DATA.leadScoringRules.find(r => Number(r.id) === Number(ruleId));
        if (rule) {
            rule.action = action;
            rule.points = points;
        }
    } else {
        DATA.leadScoringRules.push({
            id: Math.max(0, ...DATA.leadScoringRules.map(item => Number(item.id) || 0)) + 1,
            action,
            points,
            active: true
        });
    }
    
    closeModal('scoringRuleModal');
    loadAutomation();
    showNotification(ruleId ? 'Cập nhật quy tắc thành công!' : 'Thêm quy tắc thành công!', 'success');
}

function editScoringRule(ruleId) {
    openScoringRuleModal(ruleId);
}

function deleteScoringRule(ruleId) {
    const rule = DATA.leadScoringRules.find(r => Number(r.id) === Number(ruleId));
    if (!rule || !confirm(`Bạn có chắc chắn muốn xóa quy tắc "${rule.action}"?`)) return;
    
    DATA.leadScoringRules = DATA.leadScoringRules.filter(item => Number(item.id) !== Number(ruleId));
    loadAutomation();
    showNotification('Xóa quy tắc thành công!', 'success');
}

function loadSmartReminders() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';

    if (isApiSession) {
        // Load from API
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Nhắc nhở thông minh</h1>
                    <p>Theo dõi lịch hẹn và trạng thái chăm sóc.</p>
                </div>
                <button class="btn btn-primary" onclick="openAppointmentModal()"><i class="fas fa-plus"></i> Tạo lịch hẹn</button>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #0284c7;"></i>
                <p style="margin-top: 10px; color: #64748b;">Đang tải dữ liệu...</p>
            </div>
        `;

        // Load all appointments (both pending and completed)
        API_SERVICES.nhacNho.cuaToi('all')
            .then(response => {
                const appointments = response.data || response || [];
                renderAppointmentsTable(appointments, isApiSession);
            })
            .catch(error => {
                console.error('Error loading appointments:', error);
                content.innerHTML = `
                    <div class="page-header">
                        <div>
                            <h1>Nhắc nhở thông minh</h1>
                            <p>Theo dõi lịch hẹn và trạng thái chăm sóc.</p>
                        </div>
                        <button class="btn btn-primary" onclick="openAppointmentModal()"><i class="fas fa-plus"></i> Tạo lịch hẹn</button>
                    </div>
                    <div style="text-align: center; padding: 40px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 24px; color: #ef4444;"></i>
                        <p style="margin-top: 10px; color: #64748b;">Không thể tải dữ liệu: ${error.message || 'Lỗi không xác định'}</p>
                    </div>
                `;
            });
    } else {
        // Load from local DATA
        renderAppointmentsTable(DATA.appointments, isApiSession);
    }
}

function renderAppointmentsTable(appointments, isApiSession) {
    const content = document.getElementById('mainContent');
    if (!content) return;

    // Store appointments globally for viewAppointment to access
    window.CURRENT_APPOINTMENTS = appointments;

    // Separate appointments by status
    const pending = appointments.filter(item => {
        const status = item.trangThaiNhacNho || item.trangThai || item.status || 'Chờ xử lý';
        return status === 'Chờ xử lý' || status === 'scheduled' || status === 'cho_xu_ly';
    });
    
    const completed = appointments.filter(item => {
        const status = item.trangThaiNhacNho || item.trangThai || item.status || 'Chờ xử lý';
        return status === 'Đã hoàn thành' || status === 'completed' || status === 'hoan_thanh';
    });

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Nhắc nhở thông minh</h1>
                <p>Theo dõi lịch hẹn và trạng thái chăm sóc.</p>
            </div>
            <button class="btn btn-primary" onclick="openAppointmentModal()"><i class="fas fa-plus"></i> Tạo lịch hẹn</button>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('appointmentPendingTab')">Chờ xử lý (${pending.length})</button>
            <button class="tab-btn" onclick="switchTab('appointmentCompletedTab')">Đã hoàn thành (${completed.length})</button>
        </div>
        <div id="appointmentPendingTab" class="tab-content active">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead><tr><th>Khách hàng</th><th>Tiêu đề</th><th>Loại</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${pending.length > 0 ? pending.map(item => {
                            const customerName = item.khachHang?.hoTen || item.tenKhachHang || item.customerName || 'N/A';
                            const title = item.tieuDe || item.title || '';
                            const type = item.loaiNhacNho || item.loaiTuongTac || item.type || 'Gọi điện';
                            const dateTime = item.thoiGianNhac || item.thoiGianHen || item.date || '';
                            const id = item.maNhacNho || item.id;
                            
                            let displayDateTime = '';
                            if (dateTime) {
                                if (dateTime.includes('T')) {
                                    const dt = new Date(dateTime);
                                    displayDateTime = `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`;
                                } else {
                                    displayDateTime = formatDate(dateTime) + (item.time ? ' ' + item.time : '');
                                }
                            }
                            
                            return `
                                <tr>
                                    <td>${customerName}</td>
                                    <td><strong>${title}</strong></td>
                                    <td>${type}</td>
                                    <td>${displayDateTime}</td>
                                    <td>
                                        <button class="btn-view" onclick="viewAppointment(${id})">Xem</button>
                                        <button class="btn-edit" onclick="completeAppointment(${id})">Hoàn thành</button>
                                        <button class="btn-delete" onclick="deleteAppointment(${id})">Xóa</button>
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">Chưa có lịch hẹn nào đang chờ xử lý.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
        <div id="appointmentCompletedTab" class="tab-content">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead><tr><th>Khách hàng</th><th>Tiêu đề</th><th>Loại</th><th>Thời gian</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${completed.length > 0 ? completed.map(item => {
                            const customerName = item.khachHang?.hoTen || item.tenKhachHang || item.customerName || 'N/A';
                            const title = item.tieuDe || item.title || '';
                            const type = item.loaiNhacNho || item.loaiTuongTac || item.type || 'Gọi điện';
                            const dateTime = item.thoiGianNhac || item.thoiGianHen || item.date || '';
                            const id = item.maNhacNho || item.id;
                            
                            let displayDateTime = '';
                            if (dateTime) {
                                if (dateTime.includes('T')) {
                                    const dt = new Date(dateTime);
                                    displayDateTime = `${dt.toLocaleDateString('vi-VN')} ${dt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}`;
                                } else {
                                    displayDateTime = formatDate(dateTime) + (item.time ? ' ' + item.time : '');
                                }
                            }
                            
                            return `
                                <tr>
                                    <td>${customerName}</td>
                                    <td><strong>${title}</strong></td>
                                    <td>${type}</td>
                                    <td>${displayDateTime}</td>
                                    <td>
                                        <button class="btn-view" onclick="viewAppointment(${id})">Xem</button>
                                        <button class="btn-delete" onclick="deleteAppointment(${id})">Xóa</button>
                                    </td>
                                </tr>
                            `;
                        }).join('') : '<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">Chưa có lịch hẹn nào đã hoàn thành.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function openAppointmentModal(appointmentId = null) {
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    let appointment = null;
    
    if (appointmentId) {
        // Edit mode - find appointment
        if (isApiSession) {
            // For API session, we need to find from loaded data
            // Since we don't have a detail endpoint, we'll use the data from the table
            alert('Chức năng sửa lịch hẹn đang được phát triển.');
            return;
        } else {
            appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
        }
    }

    // Load customers for dropdown
    let customers = [];
    if (isApiSession) {
        try {
            const response = await API_SERVICES.khachHang.list();
            customers = (response.data || response || []).filter(c => !c.daXoa);
        } catch (error) {
            console.error('Error loading customers:', error);
            alert('Không thể tải danh sách khách hàng');
            return;
        }
    } else {
        customers = DATA.customers.filter(c => !c.deleted);
    }

    // Set modal title
    document.getElementById('appointmentModalTitle').textContent = appointment ? 'Cập nhật Lịch hẹn' : 'Tạo Lịch hẹn';
    
    // Populate customer dropdown
    const customerSelect = document.getElementById('appointmentCustomer');
    customerSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>' + 
        customers.map(c => `<option value="${c.id}" ${appointment && Number(c.id) === Number(appointment.customerId || appointment.khachHangId) ? 'selected' : ''}>${c.hoTen || c.name}</option>`).join('');
    
    // Set min date to today
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', minDate);
    
    // Populate form fields if editing
    if (appointment) {
        document.getElementById('appointmentTitle').value = appointment.tieuDe || appointment.title || '';
        document.getElementById('appointmentType').value = appointment.loaiTuongTac || appointment.type || 'call';
        document.getElementById('appointmentDate').value = appointment.thoiGianHen || appointment.date || '';
        document.getElementById('appointmentTime').value = appointment.gioHen || appointment.time || '';
        document.getElementById('appointmentReminderBefore').value = appointment.nhacTruoc || appointment.reminderBefore || 30;
        document.getElementById('appointmentNotes').value = appointment.ghiChu || appointment.notes || '';
    } else {
        // Reset form for new appointment
        document.getElementById('appointmentForm').reset();
        document.getElementById('appointmentDate').value = minDate;
        
        // Set default time to next hour
        const nextHour = new Date(today.getTime() + 60 * 60 * 1000);
        const hours = String(nextHour.getHours()).padStart(2, '0');
        document.getElementById('appointmentTime').value = `${hours}:00`;
        document.getElementById('appointmentReminderBefore').value = 30;
    }
    
    // Store appointment ID if editing
    document.getElementById('appointmentForm').setAttribute('data-appointment-id', appointmentId || '');
    
    openModal('appointmentModal');
}

async function saveAppointment(e) {
    if (e) e.preventDefault();
    
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    const appointmentId = document.getElementById('appointmentForm').getAttribute('data-appointment-id');
    
    const customerId = Number(document.getElementById('appointmentCustomer').value);
    const title = document.getElementById('appointmentTitle').value;
    const type = document.getElementById('appointmentType').value;
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reminderBefore = Number(document.getElementById('appointmentReminderBefore').value || 30);
    const notes = document.getElementById('appointmentNotes').value;
    
    if (!customerId) {
        alert('Vui lòng chọn khách hàng');
        return;
    }
    
    // Validate datetime is in the future
    const appointmentDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    
    if (appointmentDateTime <= now) {
        alert('⚠ Thời gian lịch hẹn phải là thời điểm trong tương lai.\nVui lòng chọn ngày giờ sau thời điểm hiện tại.');
        return;
    }
    
    if (isApiSession) {
        // Call API to create appointment
        // Combine date and time into LocalDateTime format
        const dateTimeStr = `${date}T${time}:00`;
        
        const payload = {
            khachHang: { maKhachHang: customerId },
            tieuDe: title,
            loaiNhacNho: type === 'call' ? 'Gọi điện' : 
                        type === 'email' ? 'Email' : 
                        type === 'meeting' ? 'Cuộc họp' : 
                        type === 'message' ? 'Tin nhắn' : 'Gọi điện',
            thoiGianNhac: dateTimeStr,
            nhacTruocPhut: reminderBefore,
            moTa: notes,
            trangThaiNhacNho: 'Chờ xử lý'
        };
        
        try {
            await API_SERVICES.nhacNho.create(payload);
            closeModal('appointmentModal');
            loadSmartReminders();
            alert('✓ Tạo lịch hẹn thành công!');
        } catch (error) {
            console.error('Error creating appointment:', error);
            alert('⚠ Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể tạo lịch hẹn'));
        }
    } else {
        // Local data mode
        const customer = DATA.customers.find(c => Number(c.id) === customerId);
        
        if (appointmentId) {
            // Update existing
            const appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
            if (appointment) {
                appointment.customerId = customerId;
                appointment.customerName = customer?.name || '';
                appointment.title = title;
                appointment.type = type;
                appointment.date = date;
                appointment.time = time;
                appointment.reminderBefore = reminderBefore;
                appointment.notes = notes;
            }
        } else {
            // Create new
            DATA.appointments.push({
                id: Math.max(0, ...DATA.appointments.map(item => Number(item.id) || 0)) + 1,
                customerId,
                customerName: customer?.name || '',
                title,
                type,
                date,
                time,
                reminderBefore,
                notes,
                status: 'scheduled'
            });
        }
        
        closeModal('appointmentModal');
        loadSmartReminders();
    }
}

function viewAppointment(appointmentId) {
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    let appointment = null;
    
    // Try to find from global CURRENT_APPOINTMENTS first
    if (window.CURRENT_APPOINTMENTS) {
        appointment = window.CURRENT_APPOINTMENTS.find(item => 
            Number(item.maNhacNho || item.id) === Number(appointmentId)
        );
    }
    
    // Fallback to DATA if not found and not API session
    if (!appointment && !isApiSession) {
        appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
    }
    
    if (!appointment) {
        alert('Không tìm thấy thông tin lịch hẹn');
        return;
    }

    // Map fields from API or local data
    const customerName = appointment.khachHang?.hoTen || appointment.tenKhachHang || appointment.customerName || 'N/A';
    const title = appointment.tieuDe || appointment.title || '';
    const type = appointment.loaiNhacNho || appointment.loaiTuongTac || appointment.type || 'Gọi điện';
    const dateTime = appointment.thoiGianNhac || appointment.thoiGianHen || appointment.date || '';
    const time = appointment.gioHen || appointment.time || '';
    const status = appointment.trangThaiNhacNho || appointment.trangThai || appointment.status || 'Chờ xử lý';
    const reminderBefore = appointment.nhacTruocPhut || appointment.nhacTruoc || appointment.reminderBefore;

    // Populate modal with appointment data
    document.getElementById('appointmentDetailTitle').textContent = title;
    document.getElementById('appointmentDetailCustomer').textContent = customerName;
    document.getElementById('appointmentDetailType').textContent = type;
    
    // Handle date and time
    if (dateTime && dateTime.includes('T')) {
        // ISO format from API
        const dt = new Date(dateTime);
        document.getElementById('appointmentDetailDate').textContent = dt.toLocaleDateString('vi-VN');
        document.getElementById('appointmentDetailTime').textContent = dt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'});
    } else {
        document.getElementById('appointmentDetailDate').textContent = formatDate(dateTime);
        document.getElementById('appointmentDetailTime').textContent = time || 'Chưa xác định';
    }
    
    // Status with color coding
    const statusEl = document.getElementById('appointmentDetailStatus');
    const isCompleted = status === 'Đã hoàn thành' || status === 'completed' || status === 'hoan_thanh';
    
    if (isCompleted) {
        statusEl.innerHTML = '<span style="color: #10b981; font-weight: 600;"><i class="fas fa-check-circle"></i> Hoàn thành</span>';
        document.getElementById('appointmentDetailCompleteBtn').style.display = 'none';
    } else {
        statusEl.innerHTML = '<span style="color: #f59e0b; font-weight: 600;"><i class="fas fa-clock"></i> Chờ xử lý</span>';
        document.getElementById('appointmentDetailCompleteBtn').style.display = 'inline-block';
    }
    
    // Reminder info
    if (reminderBefore) {
        document.getElementById('appointmentDetailReminder').textContent = `${reminderBefore} phút trước`;
        document.getElementById('appointmentDetailReminderSection').style.display = 'block';
    } else {
        document.getElementById('appointmentDetailReminderSection').style.display = 'none';
    }
    
    // Store appointment ID for action buttons
    document.getElementById('appointmentDetailCompleteBtn').setAttribute('data-appointment-id', appointmentId);
    document.getElementById('appointmentDetailDeleteBtn').setAttribute('data-appointment-id', appointmentId);
    
    // Open modal
    openModal('appointmentDetailModal');
}

function completeAppointmentFromModal() {
    const appointmentId = document.getElementById('appointmentDetailCompleteBtn').getAttribute('data-appointment-id');
    if (appointmentId) {
        completeAppointment(appointmentId);
        closeModal('appointmentDetailModal');
    }
}

function deleteAppointmentFromModal() {
    const appointmentId = document.getElementById('appointmentDetailDeleteBtn').getAttribute('data-appointment-id');
    if (appointmentId && confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) {
        deleteAppointment(appointmentId);
        closeModal('appointmentDetailModal');
    }
}

function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
}

function editAppointmentFromDetail() {
    loadSmartReminders();
}

async function deleteAppointment(appointmentId) {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return;
    
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    
    if (isApiSession) {
        try {
            await API_SERVICES.nhacNho.delete(appointmentId);
            loadSmartReminders();
            alert('✓ Xóa lịch hẹn thành công!');
        } catch (error) {
            console.error('Error deleting appointment:', error);
            alert('⚠ Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể xóa lịch hẹn'));
        }
    } else {
        DATA.appointments = DATA.appointments.filter(item => Number(item.id) !== Number(appointmentId));
        loadSmartReminders();
    }
}

async function completeAppointment(appointmentId) {
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    
    if (isApiSession) {
        try {
            await API_SERVICES.nhacNho.complete(appointmentId);
            loadSmartReminders();
            alert('✓ Đã đánh dấu hoàn thành!');
        } catch (error) {
            console.error('Error completing appointment:', error);
            alert('⚠ Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể hoàn thành lịch hẹn'));
        }
    } else {
        const appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
        if (!appointment) return;
        appointment.status = 'completed';
        appointment.completedDate = new Date().toISOString().split('T')[0];
        loadSmartReminders();
    }
}

function saveAppointmentResult(e) {
    if (e) e.preventDefault();
    loadSmartReminders();
}

async function loadMergeDuplicates() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    let duplicates = [];
    const ignored = JSON.parse(localStorage.getItem('ignored_duplicate_pairs') || '[]');
    
    if (isApiSession) {
        try {
            const res = await API_SERVICES.trungLap.list();
            const allDuplicates = res.data || res || [];
            duplicates = allDuplicates.filter(item => !ignored.includes(String(item.id)) && !ignored.includes(item.id));
        } catch (error) {
            console.error('Error loading duplicates:', error);
            alert('Không thể tải danh sách trùng lặp từ server.');
            return;
        }
    } else {
        const allDuplicates = DATA.duplicateCustomers || [];
        duplicates = allDuplicates.filter(item => !ignored.includes(String(item.id)) && !ignored.includes(item.id));
    }

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Gộp dữ liệu trùng lặp</h1>
                <p>Kiểm tra và xử lý các cặp khách hàng trùng lặp hoặc tương đồng thông tin.</p>
            </div>
        </div>
        <div class="table-container">
            <div class="table-header"><h3>Phát hiện ${duplicates.length} cặp cần xử lý</h3></div>
            <div style="display:grid; gap:16px; padding:20px;">
                ${duplicates.map(item => `
                    <div style="border:1px solid #e2e8f0; border-radius:8px; padding:16px; background:#fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
                            <div style="padding:12px; background:#f8fafc; border-radius:6px; border-left: 4px solid #0284c7;">
                                <div style="font-weight:600; color:#0284c7; margin-bottom:8px; font-size:14px; display:flex; align-items:center; gap:8px;">
                                    <i class="fas fa-user-check" style="color:#0284c7;"></i> Khách hàng 1 (Giữ lại & Gộp)
                                </div>
                                <div style="font-weight:600; font-size:15px; color:#1e293b;">${item.customer1.name}</div>
                                <div style="color:#475569; font-size:13px; margin-top:6px;"><i class="far fa-envelope" style="width:16px;"></i> ${item.customer1.email || 'N/A'}</div>
                                <div style="color:#475569; font-size:13px; margin-top:2px;"><i class="fas fa-phone-alt" style="width:16px;"></i> ${item.customer1.phone || 'N/A'}</div>
                            </div>
                            <div style="padding:12px; background:#f8fafc; border-radius:6px; border-left: 4px solid #ef4444;">
                                <div style="font-weight:600; color:#ef4444; margin-bottom:8px; font-size:14px; display:flex; align-items:center; gap:8px;">
                                    <i class="fas fa-user-minus" style="color:#ef4444;"></i> Khách hàng 2 (Xóa bỏ sau khi gộp)
                                </div>
                                <div style="font-weight:600; font-size:15px; color:#1e293b;">${item.customer2.name}</div>
                                <div style="color:#475569; font-size:13px; margin-top:6px;"><i class="far fa-envelope" style="width:16px;"></i> ${item.customer2.email || 'N/A'}</div>
                                <div style="color:#475569; font-size:13px; margin-top:2px;"><i class="fas fa-phone-alt" style="width:16px;"></i> ${item.customer2.phone || 'N/A'}</div>
                            </div>
                        </div>
                        <div style="margin:16px 0 12px 0; display:flex; align-items:center; gap:8px;">
                            <span style="font-size:13px; color:#64748b;">Độ tương đồng:</span>
                            <span style="font-weight:600; background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:13px;">${item.similarity}%</span>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="btn btn-primary btn-sm" onclick="confirmMergeCustomers('${item.id}')"><i class="fas fa-compress-alt"></i> Gộp hai khách hàng</button>
                            <button class="btn btn-secondary btn-sm" onclick="ignoreDuplicate('${item.id}')"><i class="fas fa-ban"></i> Bỏ qua</button>
                        </div>
                    </div>
                `).join('') || '<p style="padding:20px; color:#64748b; text-align:center;">Tuyệt vời! Không phát hiện thông tin khách hàng trùng lặp nào.</p>'}
            </div>
        </div>
    `;
}

function mergeDuplicateCustomers(duplicateId) {
    confirmMergeCustomers(duplicateId);
}

async function confirmMergeCustomers(duplicateId) {
    if (!confirm('Bạn có chắc chắn muốn gộp hai khách hàng này?\n\nMọi thông tin trống của Khách hàng 1 sẽ được bổ sung từ Khách hàng 2. Lịch sử tương tác, nhắc nhở, nhãn tag, chiến dịch tham gia của Khách hàng 2 sẽ được chuyển sang Khách hàng 1. Khách hàng 2 sẽ bị xóa.')) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        try {
            await API_SERVICES.trungLap.gop(duplicateId);
            alert('✓ Gộp khách hàng thành công!');
            loadMergeDuplicates();
        } catch (error) {
            console.error('Error merging customers:', error);
            alert('⚠ Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể gộp khách hàng'));
        }
    } else {
        const duplicate = DATA.duplicateCustomers.find(item => String(item.id) === String(duplicateId));
        if (duplicate) {
            const keep = DATA.customers.find(item => String(item.id) === String(duplicate.customer1.id));
            const remove = DATA.customers.find(item => String(item.id) === String(duplicate.customer2.id));
            if (keep && remove) {
                // Merge data fields
                Object.keys(remove).forEach(key => {
                    if (!keep[key] && remove[key]) {
                        keep[key] = remove[key];
                    }
                });
                
                DATA.interactions.forEach(interaction => {
                    if (String(interaction.customerId) === String(remove.id)) interaction.customerId = keep.id;
                });
                remove.deleted = true;
                remove.deletedDate = new Date().toLocaleDateString('vi-VN');
            }
            DATA.duplicateCustomers = DATA.duplicateCustomers.filter(item => String(item.id) !== String(duplicateId));
            alert('✓ Gộp khách hàng thành công!');
            loadMergeDuplicates();
        }
    }
}

async function ignoreDuplicate(duplicateId) {
    if (!confirm('Bạn có muốn bỏ qua trùng lặp này? Hệ thống sẽ không cảnh báo trùng lặp cho cặp khách hàng này nữa.')) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        let ignored = JSON.parse(localStorage.getItem('ignored_duplicate_pairs') || '[]');
        if (!ignored.includes(String(duplicateId))) {
            ignored.push(String(duplicateId));
            localStorage.setItem('ignored_duplicate_pairs', JSON.stringify(ignored));
        }
        alert('✓ Đã bỏ qua trùng lặp!');
        loadMergeDuplicates();
    } else {
        let ignored = JSON.parse(localStorage.getItem('ignored_duplicate_pairs') || '[]');
        if (!ignored.includes(String(duplicateId))) {
            ignored.push(String(duplicateId));
            localStorage.setItem('ignored_duplicate_pairs', JSON.stringify(ignored));
        }
        DATA.duplicateCustomers = DATA.duplicateCustomers.filter(item => String(item.id) !== String(duplicateId));
        alert('✓ Đã bỏ qua trùng lặp!');
        loadMergeDuplicates();
    }
}
