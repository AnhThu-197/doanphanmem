// ============================================
// MESSAGES PAGE
// ============================================

function getMessageHistory() {
    if (!DATA.messageHistory) DATA.messageHistory = [];
    return DATA.messageHistory;
}

function loadSendMessage() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const user = AUTH.getCurrentUser();
    const canManageTemplates = user && (user.role === 'manager' || user.role === 'admin');
    const messages = getMessageHistory();

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Thông điệp</h1>
                <p>Gửi thông điệp cho khách hàng và quản lý mẫu nội dung.</p>
            </div>
            <button class="btn btn-primary" onclick="openSendMessageModal()">
                <i class="fas fa-paper-plane"></i> Gửi thông điệp
            </button>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('messagesSendTab')">Lịch sử gửi</button>
            ${canManageTemplates ? '<button class="tab-btn" onclick="switchTab(\'messageTemplatesTab\')">Mẫu thông điệp</button>' : ''}
        </div>

        <div id="messagesSendTab" class="tab-content active">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Kênh</th>
                            <th>Nội dung</th>
                            <th>Trạng thái</th>
                            <th>Ngày gửi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${messages.length ? messages.map(message => {
                            const customer = DATA.customers.find(item => Number(item.id) === Number(message.customerId));
                            return `
                                <tr>
                                    <td>${message.customerName || customer?.name || 'Không rõ'}</td>
                                    <td>${message.channel || message.type || 'Email'}</td>
                                    <td>${message.subject ? `<strong>${message.subject}</strong><br>` : ''}<small>${message.content || ''}</small></td>
                                    <td><span class="status-badge ${message.status === 'scheduled' ? 'lead' : 'customer'}">${message.status || 'Đã gửi'}</span></td>
                                    <td>${message.sentDate || ''}</td>
                                </tr>
                            `;
                        }).join('') : `
                            <tr>
                                <td colspan="5" style="text-align:center; padding:30px; color:#94a3b8;">Chưa có thông điệp nào.</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        ${canManageTemplates ? `
            <div id="messageTemplatesTab" class="tab-content">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Mẫu thông điệp</h3>
                        <button class="btn-add" onclick="openTemplateModal()">
                            <i class="fas fa-plus"></i> Thêm mẫu
                        </button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Tên mẫu</th>
                                <th>Loại</th>
                                <th>Nội dung</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DATA.messageTemplates.map(template => `
                                <tr>
                                    <td><strong>${template.name}</strong></td>
                                    <td>${template.type}</td>
                                    <td>${(template.content || '').slice(0, 80)}${(template.content || '').length > 80 ? '...' : ''}</td>
                                    <td>
                                        <button class="btn-edit" onclick="editTemplate(${template.id})">Sửa</button>
                                        <button class="btn-delete" onclick="deleteTemplate(${template.id})">Xóa</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
    `;
}

function openSendMessageModal() {
    const modal = document.getElementById('sendMessageModal');
    const form = document.getElementById('sendMessageForm');
    if (!modal || !form) return;

    form.reset();
    populateCustomerDropdown('messageCustomer');
    populateTemplateDropdown('messageTemplate');

    const templateSelect = document.getElementById('messageTemplate');
    if (templateSelect) {
        templateSelect.onchange = function () {
            const template = DATA.messageTemplates.find(item => Number(item.id) === Number(this.value));
            if (!template) return;

            const customer = DATA.customers.find(item => Number(item.id) === Number(document.getElementById('messageCustomer')?.value));
            const content = (template.content || '')
                .replaceAll('{customerName}', customer?.name || '')
                .replaceAll('{date}', new Date().toLocaleDateString('vi-VN'))
                .replaceAll('{time}', new Date().toLocaleTimeString('vi-VN'));

            document.getElementById('messageContent').value = content;
            document.getElementById('messageType').value = template.type;
        };
    }

    const scheduleCheckbox = document.getElementById('messageSchedule');
    const scheduleTime = document.getElementById('scheduleTime');
    if (scheduleCheckbox && scheduleTime) {
        scheduleCheckbox.onchange = function () {
            scheduleTime.style.display = this.checked ? 'block' : 'none';
        };
        scheduleTime.style.display = 'none';
    }

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function openTemplateModal() {
    const modal = document.getElementById('templateModal');
    const form = document.getElementById('templateForm');
    if (!modal || !form) return;

    form.reset();
    delete modal.dataset.templateId;

    const title = document.getElementById('templateModalTitle');
    if (title) title.textContent = 'Thêm Mẫu Thông điệp';

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function editTemplate(id) {
    const template = DATA.messageTemplates.find(item => Number(item.id) === Number(id));
    if (!template) return;

    openTemplateModal();

    const modal = document.getElementById('templateModal');
    const title = document.getElementById('templateModalTitle');
    if (modal) modal.dataset.templateId = template.id;
    if (title) title.textContent = 'Cập nhật Mẫu Thông điệp';

    document.getElementById('templateName').value = template.name || '';
    document.getElementById('templateType').value = template.type || 'email';
    document.getElementById('templateContent').value = template.content || '';
}

function saveTemplate(e) {
    if (e) e.preventDefault();

    const modal = document.getElementById('templateModal');
    const templateId = modal ? modal.dataset.templateId : null;
    const payload = {
        name: document.getElementById('templateName')?.value.trim(),
        type: document.getElementById('templateType')?.value,
        content: document.getElementById('templateContent')?.value.trim(),
        updatedDate: new Date().toISOString().split('T')[0]
    };

    if (!payload.name || !payload.type || !payload.content) {
        alert('Vui lòng nhập đầy đủ thông tin mẫu.');
        return;
    }

    if (templateId) {
        const template = DATA.messageTemplates.find(item => Number(item.id) === Number(templateId));
        if (template) Object.assign(template, payload);
    } else {
        const nextId = Math.max(0, ...DATA.messageTemplates.map(item => Number(item.id) || 0)) + 1;
        DATA.messageTemplates.push({
            id: nextId,
            ...payload,
            createdDate: payload.updatedDate
        });
    }

    closeModal('templateModal');
    loadSendMessage();
}

function deleteTemplate(id) {
    const template = DATA.messageTemplates.find(item => Number(item.id) === Number(id));
    if (!template || !confirm(`Xóa mẫu "${template.name}"?`)) return;

    DATA.messageTemplates = DATA.messageTemplates.filter(item => Number(item.id) !== Number(id));
    loadSendMessage();
}

function sendMessage(e) {
    if (e) e.preventDefault();

    const customerId = Number(document.getElementById('messageCustomer')?.value);
    const customer = DATA.customers.find(item => Number(item.id) === customerId);
    const type = document.getElementById('messageType')?.value || 'email';
    const content = document.getElementById('messageContent')?.value.trim();
    const scheduled = !!document.getElementById('messageSchedule')?.checked;

    if (!customerId || !content) {
        alert('Vui lòng chọn khách hàng và nhập nội dung.');
        return;
    }

    getMessageHistory().push({
        id: Math.max(0, ...getMessageHistory().map(item => Number(item.id) || 0)) + 1,
        customerId,
        customerName: customer?.name || '',
        employeeId: AUTH.getCurrentUser()?.id,
        templateId: Number(document.getElementById('messageTemplate')?.value) || null,
        channel: type.toUpperCase(),
        subject: document.getElementById('messagePromoTitle')?.value.trim() || null,
        content,
        status: scheduled ? 'scheduled' : 'Đã gửi',
        sentDate: scheduled
            ? document.getElementById('messageScheduleTime')?.value
            : new Date().toLocaleString('vi-VN'),
        notes: document.getElementById('messageNotes')?.value.trim() || ''
    });

    closeModal('sendMessageModal');
    loadSendMessage();
}
