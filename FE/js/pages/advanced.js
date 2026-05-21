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
                    ${trials.map(trial => {
                        const daysLeft = daysBetweenToday(trial.endDate);
                        const label = daysLeft <= 0 ? 'Hết hạn' : `${daysLeft} ngày`;
                        return `
                            <tr>
                                <td><strong>${trial.customerName}</strong></td>
                                <td>${formatDate(trial.startDate)}</td>
                                <td>${formatDate(trial.endDate)}</td>
                                <td>${label}</td>
                                <td>${trial.reminderDays || 0} ngày</td>
                                <td>
                                    <button class="btn-view" onclick="viewTrialDetail(${trial.id})">Xem</button>
                                    <button class="btn-edit" onclick="editTrial(${trial.id})">Sửa</button>
                                </td>
                            </tr>
                        `;
                    }).join('') || '<tr><td colspan="6" style="text-align:center; padding:30px;">Chưa có dữ liệu dùng thử.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function openTrialModal(trialId = null) {
    const trial = trialId ? DATA.trialCustomers.find(item => Number(item.id) === Number(trialId)) : null;
    let modal = document.getElementById('trialInlineModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'trialInlineModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${trial ? 'Cập nhật dùng thử' : 'Thêm dùng thử'}</h2>
                <button class="close-btn" onclick="closeModal('trialInlineModal')">&times;</button>
            </div>
            <form onsubmit="saveTrial(event, ${trial ? trial.id : 'null'})">
                <div class="form-group">
                    <label>Khách hàng *</label>
                    <select id="trialCustomerInline" required>
                        ${DATA.customers.filter(customer => !customer.deleted).map(customer => `
                            <option value="${customer.id}" ${Number(customer.id) === Number(trial?.customerId) ? 'selected' : ''}>${customer.name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="modal-grid-2">
                    <div class="form-group">
                        <label>Ngày bắt đầu *</label>
                        <input type="date" id="trialStartDateInline" value="${trial?.startDate || new Date().toISOString().split('T')[0]}" required>
                    </div>
                    <div class="form-group">
                        <label>Số ngày *</label>
                        <input type="number" id="trialDaysInline" value="${trial?.daysAllowed || 30}" min="1" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nhắc trước</label>
                    <input type="number" id="trialReminderDaysInline" value="${trial?.reminderDays || 3}" min="0">
                </div>
                <div class="form-group">
                    <label>Ghi chú</label>
                    <textarea id="trialNotesInline">${trial?.notes || ''}</textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('trialInlineModal')">Hủy</button>
                    <button class="btn btn-primary" type="submit">Lưu</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function editTrial(trialId) {
    openTrialModal(trialId);
}

function saveTrial(e, trialId = null) {
    if (e) e.preventDefault();

    const customerId = Number(document.getElementById('trialCustomerInline')?.value);
    const customer = DATA.customers.find(item => Number(item.id) === customerId);
    const startDate = document.getElementById('trialStartDateInline')?.value;
    const days = Number(document.getElementById('trialDaysInline')?.value || 30);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const payload = {
        customerId,
        customerName: customer?.name || '',
        startDate,
        endDate: endDate.toISOString().split('T')[0],
        daysAllowed: days,
        reminderDays: Number(document.getElementById('trialReminderDaysInline')?.value || 0),
        notes: document.getElementById('trialNotesInline')?.value || ''
    };

    if (trialId) {
        const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
        if (trial) Object.assign(trial, payload);
    } else {
        DATA.trialCustomers.push({
            id: Math.max(0, ...DATA.trialCustomers.map(item => Number(item.id) || 0)) + 1,
            ...payload
        });
    }

    closeModal('trialInlineModal');
    loadTrialManagement();
}

function updateTrialEndDate() {
    return null;
}

function viewTrialDetail(trialId) {
    const trial = DATA.trialCustomers.find(item => Number(item.id) === Number(trialId));
    if (!trial) return;
    alert(`${trial.customerName}\nTừ ${formatDate(trial.startDate)} đến ${formatDate(trial.endDate)}\nCòn lại: ${daysBetweenToday(trial.endDate)} ngày`);
}

function loadAutomation() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Tự động hóa</h1>
                <p>Quản lý kịch bản chăm sóc và quy tắc chấm điểm lead.</p>
            </div>
            <button class="btn btn-primary" onclick="openWorkflowModal()"><i class="fas fa-plus"></i> Tạo kịch bản</button>
        </div>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('automationWorkflowTab')">Kịch bản</button>
            <button class="tab-btn" onclick="switchTab('automationScoringTab')">Chấm điểm</button>
        </div>
        <div id="automationWorkflowTab" class="tab-content active">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead><tr><th>Tên</th><th>Kích hoạt</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${DATA.automationWorkflows.map(workflow => `
                            <tr>
                                <td><strong>${workflow.name}</strong></td>
                                <td>${workflow.trigger}</td>
                                <td>${workflow.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</td>
                                <td>${formatDate(workflow.createdDate)}</td>
                                <td>
                                    <button class="btn-view" onclick="viewWorkflow(${workflow.id})">Xem</button>
                                    <button class="btn-edit" onclick="editWorkflow(${workflow.id})">Sửa</button>
                                    <button class="btn-delete" onclick="deleteWorkflow(${workflow.id})">Xóa</button>
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
                    <h3>Quy tắc chấm điểm</h3>
                    <button class="btn-add" onclick="openScoringRuleModal()">Thêm quy tắc</button>
                </div>
                <table>
                    <thead><tr><th>Hành động</th><th>Điểm</th><th>Thao tác</th></tr></thead>
                    <tbody>
                        ${DATA.leadScoringRules.map(rule => `
                            <tr>
                                <td>${rule.action}</td>
                                <td><strong>+${rule.points}</strong></td>
                                <td>
                                    <button class="btn-edit" onclick="editScoringRule(${rule.id})">Sửa</button>
                                    <button class="btn-delete" onclick="deleteScoringRule(${rule.id})">Xóa</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openWorkflowModal(workflowId = null) {
    const workflow = workflowId ? DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId)) : null;
    const name = prompt('Tên kịch bản:', workflow?.name || '');
    if (!name) return;

    if (workflow) {
        workflow.name = name;
    } else {
        DATA.automationWorkflows.push({
            id: Math.max(0, ...DATA.automationWorkflows.map(item => Number(item.id) || 0)) + 1,
            name,
            trigger: 'new_lead',
            status: 'active',
            actions: [],
            createdDate: new Date().toISOString().split('T')[0]
        });
    }
    loadAutomation();
}

function viewWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId));
    if (workflow) alert(`${workflow.name}\nTrigger: ${workflow.trigger}\nStatus: ${workflow.status}`);
}

function editWorkflow(workflowId) {
    openWorkflowModal(workflowId);
}

function editWorkflowFromDetail() {
    loadAutomation();
}

function saveWorkflow(e) {
    if (e) e.preventDefault();
    loadAutomation();
}

function addWorkflowAction() {
    alert('Chức năng thêm action chi tiết sẽ nối sau.');
}

function deleteWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(item => Number(item.id) === Number(workflowId));
    if (!workflow || !confirm(`Xóa kịch bản "${workflow.name}"?`)) return;
    DATA.automationWorkflows = DATA.automationWorkflows.filter(item => Number(item.id) !== Number(workflowId));
    loadAutomation();
}

function openScoringRuleModal(ruleId = null) {
    const rule = ruleId ? DATA.leadScoringRules.find(item => Number(item.id) === Number(ruleId)) : null;
    const action = prompt('Hành động:', rule?.action || '');
    if (!action) return;
    const points = Number(prompt('Điểm:', rule?.points || 1));

    if (rule) {
        rule.action = action;
        rule.points = points;
    } else {
        DATA.leadScoringRules.push({
            id: Math.max(0, ...DATA.leadScoringRules.map(item => Number(item.id) || 0)) + 1,
            action,
            points,
            active: true
        });
    }
    loadAutomation();
}

function editScoringRule(ruleId) {
    openScoringRuleModal(ruleId);
}

function saveScoringRule(e) {
    if (e) e.preventDefault();
    loadAutomation();
}

function deleteScoringRule(ruleId) {
    DATA.leadScoringRules = DATA.leadScoringRules.filter(item => Number(item.id) !== Number(ruleId));
    loadAutomation();
}

function loadSmartReminders() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Nhắc nhở thông minh</h1>
                <p>Theo dõi lịch hẹn và trạng thái chăm sóc.</p>
            </div>
            <button class="btn btn-primary" onclick="openAppointmentModal()"><i class="fas fa-plus"></i> Tạo lịch hẹn</button>
        </div>
        <div class="data-table-wrapper">
            <table class="data-table">
                <thead><tr><th>Khách hàng</th><th>Tiêu đề</th><th>Loại</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                    ${DATA.appointments.map(item => `
                        <tr>
                            <td>${item.customerName}</td>
                            <td><strong>${item.title}</strong></td>
                            <td>${getInteractionTypeLabel(item.type)}</td>
                            <td>${formatDate(item.date)} ${item.time || ''}</td>
                            <td>${item.status === 'completed' ? 'Hoàn thành' : 'Đã lên lịch'}</td>
                            <td>
                                <button class="btn-view" onclick="viewAppointment(${item.id})">Xem</button>
                                <button class="btn-edit" onclick="completeAppointment(${item.id})">Hoàn thành</button>
                                <button class="btn-delete" onclick="deleteAppointment(${item.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openAppointmentModal() {
    const title = prompt('Tiêu đề lịch hẹn:');
    if (!title) return;
    const customer = DATA.customers.find(item => !item.deleted);
    DATA.appointments.push({
        id: Math.max(0, ...DATA.appointments.map(item => Number(item.id) || 0)) + 1,
        customerId: customer?.id,
        customerName: customer?.name || '',
        title,
        type: 'call',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        reminderBefore: 30,
        status: 'scheduled'
    });
    loadSmartReminders();
}

function toggleReminderMessageType() {
    return null;
}

function saveAppointment(e) {
    if (e) e.preventDefault();
    loadSmartReminders();
}

function viewAppointment(appointmentId) {
    const appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
    if (appointment) alert(`${appointment.title}\n${appointment.customerName}\n${formatDate(appointment.date)} ${appointment.time || ''}`);
}

function editAppointment(appointmentId) {
    const appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
    if (!appointment) return;
    const title = prompt('Tiêu đề:', appointment.title);
    if (title) appointment.title = title;
    loadSmartReminders();
}

function editAppointmentFromDetail() {
    loadSmartReminders();
}

function deleteAppointment(appointmentId) {
    DATA.appointments = DATA.appointments.filter(item => Number(item.id) !== Number(appointmentId));
    loadSmartReminders();
}

function completeAppointment(appointmentId) {
    const appointment = DATA.appointments.find(item => Number(item.id) === Number(appointmentId));
    if (!appointment) return;
    appointment.status = 'completed';
    appointment.completedDate = new Date().toISOString().split('T')[0];
    loadSmartReminders();
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
