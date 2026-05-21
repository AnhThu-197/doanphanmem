// ============================================
// TRANG QUẢN LÝ KHÁCH HÀNG
// ============================================

function loadCustomers() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    const canDelete = user && user.role !== 'employee';
    const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');

    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Khách hàng</h2>
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('customers-list')">Danh sách Khách hàng</button>
            <button class="tab-btn" onclick="switchTab('customers-categorize')">Phân loại Khách hàng</button>
            ${isManagerOrAdmin ? `<button class="tab-btn" onclick="switchTab('customers-delete-requests')">Đề nghị Xóa <span class="badge" style="background:#ef4444;color:white;padding:2px 8px;border-radius:10px;font-size:11px;margin-left:5px;">${DATA.deleteRequests.filter(r => r.status === 'pending').length}</span></button>` : ''}
            ${isManagerOrAdmin ? `<button class="tab-btn" onclick="switchTab('customers-assign')">Phân bổ Khách hàng</button>` : ''}
        </div>

        <!-- Tab Danh sách -->
        <div id="customers-list" class="tab-content active">
            <div class="table-container">
                <div style="background:#f8fafc;padding:15px;border-radius:8px;margin-bottom:15px;">
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;align-items:end;">
                        <div>
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:13px;color:#334155;">Tìm kiếm</label>
                            <input type="text" id="searchCustomerInput" placeholder="Tên, email, SĐT, công ty..." style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:5px;font-size:13px;">
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:13px;color:#334155;">Cấp độ</label>
                            <select id="filterStatus" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:5px;font-size:13px;">
                                <option value="">Tất cả</option>
                                <option value="suspect">Suspect</option>
                                <option value="lead">Lead</option>
                                <option value="prospect">Prospect</option>
                                <option value="customer">Customer</option>
                                <option value="evangelist">Evangelist</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block;margin-bottom:5px;font-weight:600;font-size:13px;color:#334155;">Nguồn</label>
                            <select id="filterSource" style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:5px;font-size:13px;">
                                <option value="">Tất cả</option>
                                <option value="facebook">Facebook</option>
                                <option value="google">Google</option>
                                <option value="direct">Trực tiếp</option>
                                <option value="referral">Giới thiệu</option>
                                <option value="website">Website</option>
                            </select>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button onclick="applyCustomerFilter()" style="flex:1;padding:8px 16px;background:#2B4856;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600;font-size:13px;"><i class="fas fa-filter"></i> Lọc</button>
                            <button onclick="resetCustomerFilter()" style="flex:1;padding:8px 16px;background:#e2e8f0;color:#334155;border:none;border-radius:5px;cursor:pointer;font-weight:600;font-size:13px;"><i class="fas fa-redo"></i> Đặt lại</button>
                        </div>
                    </div>
                </div>
                <div class="table-header">
                    <div style="color:#64748b;font-size:14px;"><i class="fas fa-users"></i> Tổng: <strong id="totalCustomersCount">${DATA.customers.filter(c => !c.deleted).length}</strong> khách hàng</div>
                    <div style="display:flex;gap:10px;">
                        ${isManagerOrAdmin ? `<button class="btn btn-secondary" onclick="exportCustomersData()"><i class="fas fa-download"></i> Xuất Excel</button>` : ''}
                        <button class="btn-add" onclick="openCustomerModal()">+ Thêm Khách hàng</button>
                    </div>
                </div>
                <table>
                    <thead><tr><th>Tên</th><th>Email</th><th>Số điện thoại</th><th>Công ty</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody id="customersTable">
                        ${DATA.customers.filter(c => !c.deleted).map(c => {
                            let btns = `<button class="btn-view" onclick="viewCustomer(${c.id})">Xem</button>`;
                            btns += `<button class="btn-edit" onclick="editCustomer(${c.id})">Sửa</button>`;
                            btns += canDelete
                                ? `<button class="btn-delete" onclick="deleteCustomer(${c.id})">Xóa</button>`
                                : `<button class="btn-delete" onclick="requestDeleteCustomer(${c.id})">Đề nghị Xóa</button>`;
                            return `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.company}</td><td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td><td>${btns}</td></tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tab Phân loại -->
        <div id="customers-categorize" class="tab-content">
            <div class="table-container">
                <div class="table-header"><h3>Phân loại Khách hàng theo Cấp độ</h3></div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:15px;padding:20px;">
                    ${[
                        {key:'suspect',  bg:'#f1f5f9', color:'#64748b', label:'Suspect',    sub:'Người truy cập'},
                        {key:'lead',     bg:'#dbeafe', color:'#1e40af', label:'Lead',       sub:'KH tiềm năng mới'},
                        {key:'prospect', bg:'#fef3c7', color:'#92400e', label:'Prospect',   sub:'KH triển vọng'},
                        {key:'customer', bg:'#dcfce7', color:'#166534', label:'Customer',   sub:'KH chính thức'},
                        {key:'evangelist',bg:'#fce7f3',color:'#9f1239', label:'Evangelist', sub:'KH trung thành'}
                    ].map(s => `
                        <div style="background:${s.bg};padding:15px;border-radius:8px;cursor:pointer;" onclick="openCategoryModal('${s.key}')">
                            <h3 style="color:${s.color};margin-bottom:8px;font-size:14px;">${s.label}</h3>
                            <p style="color:${s.color};font-size:20px;font-weight:bold;">${DATA.customers.filter(c => !c.deleted && c.status === s.key).length}</p>
                            <small style="color:${s.color};font-size:11px;">${s.sub}</small>
                        </div>`).join('')}
                </div>
                <div style="margin-top:30px;padding:20px;background:#f8fafc;border-radius:8px;">
                    <h3 style="margin-bottom:15px;">Danh sách Khách hàng theo Cấp độ</h3>
                    <table style="width:100%;">
                        <thead><tr><th>Tên</th><th>Email</th><th>Cấp độ Hiện tại</th><th>Điểm</th><th>Chuyển Cấp độ</th></tr></thead>
                        <tbody>
                            ${DATA.customers.filter(c => !c.deleted).map(c => `
                                <tr>
                                    <td>${c.name}</td><td>${c.email}</td>
                                    <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                    <td><strong>${c.score}</strong></td>
                                    <td>
                                        <select onchange="changeCategoryCustomer(${c.id}, this.value)" style="padding:6px;border:1px solid #e2e8f0;border-radius:5px;">
                                            <option value="">-- Chọn --</option>
                                            <option value="suspect" ${c.status==='suspect'?'selected':''}>Suspect</option>
                                            <option value="lead" ${c.status==='lead'?'selected':''}>Lead</option>
                                            <option value="prospect" ${c.status==='prospect'?'selected':''}>Prospect</option>
                                            <option value="customer" ${c.status==='customer'?'selected':''}>Customer</option>
                                            <option value="evangelist" ${c.status==='evangelist'?'selected':''}>Evangelist</option>
                                        </select>
                                    </td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tab Đề nghị Xóa -->
        ${isManagerOrAdmin ? `
        <div id="customers-delete-requests" class="tab-content">
            <div class="table-container">
                <div class="table-header"><h3>Danh sách Đề nghị Xóa Khách hàng</h3></div>
                ${DATA.deleteRequests.length > 0 ? `
                <table>
                    <thead><tr><th>Khách hàng</th><th>Người đề nghị</th><th>Lý do</th><th>Ngày đề nghị</th><th>Trạng thái</th><th>Hành động</th></tr></thead>
                    <tbody>
                        ${DATA.deleteRequests.map(req => {
                            const sLabel = {pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Đã từ chối'};
                            const sColor = {pending:'#f59e0b',approved:'#10b981',rejected:'#ef4444'};
                            return `<tr>
                                <td><strong>${req.customerName}</strong></td>
                                <td>${req.requestedBy}</td>
                                <td style="max-width:300px;">${req.reason}</td>
                                <td>${req.requestedDate}</td>
                                <td><span class="status" style="background:${sColor[req.status]};color:white;">${sLabel[req.status]}</span></td>
                                <td>${req.status === 'pending'
                                    ? `<button class="btn btn-primary" onclick="approveDeleteRequest(${req.id})" style="padding:6px 12px;margin-right:5px;"><i class="fas fa-check"></i> Duyệt</button><button class="btn btn-secondary" onclick="rejectDeleteRequest(${req.id})" style="padding:6px 12px;"><i class="fas fa-times"></i> Từ chối</button>`
                                    : `<button class="btn-view" onclick="viewDeleteRequest(${req.id})">Xem</button>`}
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>` : `<div style="text-align:center;padding:40px;color:#94a3b8;"><i class="fas fa-inbox" style="font-size:48px;margin-bottom:15px;"></i><p>Không có đề nghị xóa nào</p></div>`}
            </div>
        </div>` : ''}

        <!-- Tab Phân bổ -->
        ${isManagerOrAdmin ? `
        <div id="customers-assign" class="tab-content">
            <div class="table-container">
                <div class="table-header"><h3>Phân bổ Khách hàng Tự động</h3></div>
                <div style="background:#f8fafc;padding:25px;border-radius:8px;margin-bottom:25px;">
                    <h4 style="margin-bottom:20px;color:#0f172a;">Cài đặt Quy tắc Phân bổ</h4>
                    <div class="form-group" style="margin-bottom:20px;">
                        <label style="font-weight:600;margin-bottom:10px;display:block;">Phương pháp phân bổ:</label>
                        <select id="assignMethod" onchange="updateAssignMethodUI()" style="padding:10px;border:1px solid #e2e8f0;border-radius:5px;width:100%;max-width:400px;">
                            <option value="round_robin">Xoay vòng chia đều (Round Robin)</option>
                            <option value="ratio">Chia theo tỷ lệ</option>
                            <option value="manual">Thủ công</option>
                        </select>
                    </div>
                    <div id="assignRoundRobinSettings" style="background:white;padding:20px;border-radius:8px;margin-top:15px;">
                        <p style="color:#64748b;margin-bottom:15px;"><i class="fas fa-info-circle"></i> Khách hàng mới sẽ được chia đều cho các nhân viên đang online theo thứ tự xoay vòng</p>
                    </div>
                    <div id="assignRatioSettings" style="background:white;padding:20px;border-radius:8px;margin-top:15px;display:none;">
                        <p style="color:#64748b;margin-bottom:15px;"><i class="fas fa-info-circle"></i> Chia khách hàng theo tỷ lệ % cho từng nhân viên</p>
                    </div>
                    <div style="margin-top:20px;">
                        <button class="btn btn-primary" onclick="saveAssignSettings()"><i class="fas fa-save"></i> Lưu Cài đặt</button>
                        <button class="btn btn-secondary" onclick="testAssignRule()" style="margin-left:10px;"><i class="fas fa-play"></i> Test Quy tắc</button>
                    </div>
                </div>
                <div style="background:white;padding:20px;border-radius:8px;">
                    <h4 style="margin-bottom:15px;">Lịch sử Phân bổ Gần đây</h4>
                    <table>
                        <thead><tr><th>Khách hàng</th><th>Được phân cho</th><th>Phương pháp</th><th>Ngày phân bổ</th></tr></thead>
                        <tbody id="assignmentHistoryTable">
                            ${DATA.assignmentHistory && DATA.assignmentHistory.length > 0
                                ? DATA.assignmentHistory.slice(0,10).map(h => `<tr><td>${h.customerName}</td><td><strong>${h.employeeName}</strong></td><td><span class="status ${h.method==='round_robin'?'customer':'prospect'}">${h.method==='round_robin'?'Xoay vòng':h.method==='ratio'?'Theo tỷ lệ':'Thủ công'}</span></td><td>${h.date}</td></tr>`).join('')
                                : `<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">Chưa có lịch sử phân bổ</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>` : ''}
    `;
}

// ---- CRUD Khách hàng ----

function openCustomerModal() {
    document.getElementById('customerForm').reset();
    loadEmployeeDropdown('customerAssignedTo', true);
    const currentUser = AUTH.getCurrentUser();
    if (currentUser) document.getElementById('customerAssignedTo').value = currentUser.id;
    delete document.getElementById('customerModal').dataset.customerId;
    document.getElementById('customerModalTitle').textContent = 'Thêm Khách hàng';
    document.getElementById('customerModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function viewCustomer(id) { openCustomerDetailModal(id); }
function editCustomer(id) { updateCustomer(id); }

function updateCustomer(customerId) {
    const c = DATA.customers.find(c => c.id === customerId);
    if (!c) return;
    document.getElementById('customerName').value = c.name;
    document.getElementById('customerEmail').value = c.email;
    document.getElementById('customerPhone').value = c.phone;
    document.getElementById('customerCompany').value = c.company;
    document.getElementById('customerStatus').value = c.status;
    document.getElementById('customerSource').value = c.source;
    document.getElementById('customerIndustry').value = c.industry;
    document.getElementById('customerModalTitle').textContent = 'Cập nhật Khách hàng';
    document.getElementById('customerModal').dataset.customerId = customerId;
    document.getElementById('customerModal').style.display = 'block';
}

function saveCustomer(e) {
    e.preventDefault();
    const customerId = document.getElementById('customerModal').dataset.customerId;
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0];
    const data = {
        name:           document.getElementById('customerName').value,
        email:          document.getElementById('customerEmail').value,
        phone:          document.getElementById('customerPhone').value,
        company:        document.getElementById('customerCompany').value,
        status:         document.getElementById('customerStatus').value,
        source:         document.getElementById('customerSource').value,
        industry:       document.getElementById('customerIndustry').value,
        assignedTo:     parseInt(document.getElementById('customerAssignedTo').value) || null,
        trialStartDate: document.getElementById('customerTrialStartDate').value || null,
        trialDays:      parseInt(document.getElementById('customerTrialDays').value) || 0,
        updatedDate:    now
    };
    if (customerId) {
        const c = DATA.customers.find(c => c.id === parseInt(customerId));
        if (c) { Object.assign(c, data); alert('✓ Cập nhật khách hàng thành công!'); DATA.addAuditLog('UPDATE_CUSTOMER', `Cập nhật: ${data.name}`, currentUser.id); }
    } else {
        const newId = Math.max(...DATA.customers.map(c => c.id), 0) + 1;
        DATA.customers.push({ id: newId, ...data, score: 0, createdDate: now, lastInteraction: '', deleted: false });
        alert('✓ Thêm khách hàng thành công!');
        DATA.addAuditLog('ADD_CUSTOMER', `Thêm: ${data.name}`, currentUser.id);
    }
    closeModal('customerModal');
    loadCustomers();
}

function deleteCustomer(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const c = DATA.customers.find(c => c.id === id);
        if (c) { c.deleted = true; c.deletedDate = new Date().toLocaleDateString('vi-VN'); }
        loadCustomers();
    }
}

function requestDeleteCustomer(customerId) {
    const c = DATA.customers.find(c => c.id === customerId);
    if (!c) return;
    document.getElementById('requestDeleteCustomerName').textContent = c.name;
    document.getElementById('requestDeleteForm').dataset.customerId = customerId;
    document.getElementById('requestDeleteReason').value = '';
    document.getElementById('requestDeleteModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function submitDeleteRequest(e) {
    e.preventDefault();
    const customerId = parseInt(document.getElementById('requestDeleteForm').dataset.customerId);
    const reason = document.getElementById('requestDeleteReason').value;
    const user = AUTH.getCurrentUser();
    const newId = Math.max(...DATA.deleteRequests.map(r => r.id || 0), 0) + 1;
    DATA.deleteRequests.push({ id: newId, customerId, customerName: DATA.customers.find(c => c.id === customerId)?.name, reason, requestedBy: user.name, requestedDate: new Date().toLocaleDateString('vi-VN'), status: 'pending' });
    alert('Đề nghị xóa đã được gửi. Trưởng phòng sẽ duyệt.');
    closeModal('requestDeleteModal');
    loadCustomers();
}

function approveDeleteRequest(requestId) {
    const req = DATA.deleteRequests.find(r => r.id === requestId);
    if (!req) return;
    if (confirm(`Duyệt xóa khách hàng "${req.customerName}"?\nLý do: ${req.reason}`)) {
        req.status = 'approved'; req.approvedBy = AUTH.getCurrentUser().name; req.approvedDate = new Date().toLocaleDateString('vi-VN');
        const c = DATA.customers.find(c => c.id === req.customerId);
        if (c) { c.deleted = true; c.deletedDate = new Date().toLocaleDateString('vi-VN'); c.deleteReason = req.reason; }
        alert('✓ Đã duyệt và chuyển khách hàng vào Thùng rác!');
        DATA.addAuditLog('APPROVE_DELETE_REQUEST', `Duyệt xóa: ${req.customerName}`, AUTH.getCurrentUser().id);
        loadCustomers();
    }
}

function rejectDeleteRequest(requestId) {
    const req = DATA.deleteRequests.find(r => r.id === requestId);
    if (!req) return;
    const reason = prompt(`Lý do từ chối xóa "${req.customerName}":`);
    if (reason) {
        req.status = 'rejected'; req.rejectedBy = AUTH.getCurrentUser().name; req.rejectedDate = new Date().toLocaleDateString('vi-VN'); req.rejectReason = reason;
        alert('✓ Đã từ chối đề nghị xóa');
        DATA.addAuditLog('REJECT_DELETE_REQUEST', `Từ chối xóa: ${req.customerName}`, AUTH.getCurrentUser().id);
        loadCustomers();
    }
}

function viewDeleteRequest(requestId) {
    const req = DATA.deleteRequests.find(r => r.id === requestId);
    if (!req) return;
    const sLabel = {pending:'Chờ duyệt',approved:'Đã duyệt',rejected:'Đã từ chối'};
    let msg = `Chi tiết Đề nghị Xóa\n\nKhách hàng: ${req.customerName}\nNgười đề nghị: ${req.requestedBy}\nNgày: ${req.requestedDate}\nLý do: ${req.reason}\nTrạng thái: ${sLabel[req.status]}`;
    if (req.status === 'approved') msg += `\nNgười duyệt: ${req.approvedBy}\nNgày duyệt: ${req.approvedDate}`;
    if (req.status === 'rejected') msg += `\nNgười từ chối: ${req.rejectedBy}\nLý do từ chối: ${req.rejectReason}`;
    alert(msg);
}

function openCustomerDetailModal(customerId) {
    const c = DATA.customers.find(c => c.id === customerId);
    if (!c) return;
    document.getElementById('detailName').textContent = c.name;
    document.getElementById('detailEmail').textContent = c.email;
    document.getElementById('detailPhone').textContent = c.phone;
    document.getElementById('detailCompany').textContent = c.company;
    document.getElementById('detailStatus').textContent = getStatusLabel(c.status);
    document.getElementById('detailSource').textContent = c.source;
    document.getElementById('detailIndustry').textContent = c.industry;
    document.getElementById('detailScore').textContent = c.score;
    document.getElementById('detailCreatedDate').textContent = c.createdDate;
    document.getElementById('detailLastInteraction').textContent = c.lastInteraction;
    const interactions = DATA.interactions.filter(i => i.customerId === customerId);
    document.getElementById('detailInteractionsTable').innerHTML = interactions.map(i => `<tr><td>${getInteractionTypeLabel(i.type)}</td><td>${i.content}</td><td>${i.date}</td><td>${i.notes}</td></tr>`).join('');
    document.getElementById('detailInteractionDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('customerDetailModal').dataset.customerId = customerId;
    document.getElementById('customerDetailModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveDetailInteraction(e) {
    e.preventDefault();
    const customerId = parseInt(document.getElementById('customerDetailModal').dataset.customerId);
    const newId = Math.max(...DATA.interactions.map(i => i.id), 0) + 1;
    DATA.interactions.push({ id: newId, customerId, type: document.getElementById('detailInteractionType').value, content: document.getElementById('detailInteractionContent').value, notes: document.getElementById('detailInteractionNotes').value, date: document.getElementById('detailInteractionDate').value, file: null });
    alert('Thêm tương tác thành công');
    document.getElementById('detailInteractionForm').reset();
    document.getElementById('detailInteractionDate').value = new Date().toISOString().split('T')[0];
    openCustomerDetailModal(customerId);
}

// ---- Filter & Render ----

function applyCustomerFilter() {
    const search = document.getElementById('searchCustomerInput')?.value.toLowerCase().trim() || '';
    const status = document.getElementById('filterStatus')?.value || '';
    const source = document.getElementById('filterSource')?.value || '';
    let filtered = DATA.customers.filter(c => !c.deleted);
    if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || c.phone.includes(search) || c.company.toLowerCase().includes(search));
    if (status) filtered = filtered.filter(c => c.status === status);
    if (source) filtered = filtered.filter(c => c.source === source);
    renderCustomersTable(filtered);
    const el = document.getElementById('totalCustomersCount');
    if (el) el.textContent = filtered.length;
}

function resetCustomerFilter() {
    const s = document.getElementById('searchCustomerInput'); if (s) s.value = '';
    const fs = document.getElementById('filterStatus'); if (fs) fs.value = '';
    const fo = document.getElementById('filterSource'); if (fo) fo.value = '';
    const all = DATA.customers.filter(c => !c.deleted);
    renderCustomersTable(all);
    const el = document.getElementById('totalCustomersCount');
    if (el) el.textContent = all.length;
}

function renderCustomersTable(customers) {
    const user = AUTH.getCurrentUser();
    const canDelete = user && user.role !== 'employee';
    const tbody = document.getElementById('customersTable');
    if (!tbody) return;
    if (customers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;"><i class="fas fa-search" style="font-size:48px;margin-bottom:15px;display:block;"></i>Không tìm thấy khách hàng nào</td></tr>`;
        return;
    }
    tbody.innerHTML = customers.map(c => {
        let btns = `<button class="btn-view" onclick="viewCustomer(${c.id})">Xem</button><button class="btn-edit" onclick="editCustomer(${c.id})">Sửa</button>`;
        btns += canDelete ? `<button class="btn-delete" onclick="deleteCustomer(${c.id})">Xóa</button>` : `<button class="btn-delete" onclick="requestDeleteCustomer(${c.id})">Đề nghị Xóa</button>`;
        return `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.phone}</td><td>${c.company}</td><td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td><td>${btns}</td></tr>`;
    }).join('');
}

function changeCategoryCustomer(customerId, newStatus) {
    if (!newStatus) return;
    const c = DATA.customers.find(c => c.id === customerId);
    if (c) { c.status = newStatus; alert(`Đã chuyển ${c.name} sang: ${getStatusLabel(newStatus)}`); loadCustomers(); }
}

function openCategoryModal(category) {
    const count = DATA.customers.filter(c => !c.deleted && c.status === category).length;
    alert(`Danh mục: ${getStatusLabel(category)}\nSố lượng: ${count} khách hàng`);
}

function exportCustomersData() {
    const customers = DATA.customers.filter(c => !c.deleted);
    let csv = 'Tên,Email,Số điện thoại,Công ty,Trạng thái,Nguồn,Ngành nghề,Điểm Lead,Ngày tạo\n';
    customers.forEach(c => { csv += `"${c.name}","${c.email}","${c.phone}","${c.company}","${getStatusLabel(c.status)}","${c.source}","${c.industry}",${c.score},"${c.createdDate}"\n`; });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `khach-hang-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    alert('Đã xuất dữ liệu khách hàng thành công!');
}

// ---- Phân bổ tự động ----

function updateAssignMethodUI() {
    const method = document.getElementById('assignMethod').value;
    document.getElementById('assignRoundRobinSettings').style.display = method === 'round_robin' ? 'block' : 'none';
    document.getElementById('assignRatioSettings').style.display = method === 'ratio' ? 'block' : 'none';
}

function saveAssignSettings() {
    const method = document.getElementById('assignMethod').value;
    DATA.assignmentConfig.method = method;
    if (method === 'ratio') {
        const inputs = document.querySelectorAll('#assignRatioSettings input[type="number"]');
        let total = 0;
        inputs.forEach((inp, i) => { const r = parseInt(inp.value) || 0; DATA.assignmentConfig.employees[i].ratio = r; total += r; });
        if (total !== 100) { alert('Tổng tỷ lệ phải bằng 100%!'); return; }
    }
    if (method === 'round_robin') {
        const cbs = document.querySelectorAll('#assignRoundRobinSettings input[type="checkbox"]');
        cbs.forEach((cb, i) => { DATA.assignmentConfig.employees[i].online = cb.checked; });
    }
    alert(`✓ Đã lưu cài đặt phân bổ`);
    DATA.addAuditLog('UPDATE_ASSIGNMENT_CONFIG', `Cập nhật cấu hình phân bổ: ${method}`, AUTH.getCurrentUser().id);
}

function testAssignRule() {
    const testCustomer = { id: 999, name: 'Khách hàng Test', email: 'test@example.com' };
    const emp = autoAssignCustomer(testCustomer);
    if (emp) alert(`✓ Test thành công!\nKhách hàng sẽ được phân cho: ${emp.name}`);
    else alert('⚠ Không có nhân viên nào khả dụng!');
}

function autoAssignCustomer(customer) {
    const config = DATA.assignmentConfig;
    let emp = null;
    if (config.method === 'round_robin') {
        const online = config.employees.filter(e => e.online);
        if (!online.length) return null;
        emp = online[config.roundRobinIndex % online.length];
        config.roundRobinIndex++;
    } else if (config.method === 'ratio') {
        const total = config.employees.reduce((s, e) => s + e.assignedCount, 0);
        for (const e of config.employees) {
            if (!e.ratio) continue;
            if (e.assignedCount < Math.floor((total + 1) * e.ratio / 100)) { emp = e; break; }
        }
        if (!emp) emp = config.employees.reduce((max, e) => e.ratio > max.ratio ? e : max);
    }
    if (emp) {
        emp.assignedCount++;
        DATA.assignmentHistory.unshift({ id: DATA.assignmentHistory.length + 1, customerId: customer.id, customerName: customer.name, employeeId: emp.id, employeeName: emp.name, method: config.method, date: new Date().toLocaleString('vi-VN') });
        sendNotificationToEmployee(emp.id, `Khách hàng mới "${customer.name}" đã được phân bổ cho bạn`);
        DATA.addAuditLog('AUTO_ASSIGN_CUSTOMER', `Phân bổ ${customer.name} cho ${emp.name}`, 'system');
    }
    return emp;
}

function sendNotificationToEmployee(employeeId, message) {
    DATA.notifications.unshift({ id: DATA.notifications.length + 1, title: 'Khách hàng mới được phân bổ', message, date: new Date().toLocaleString('vi-VN'), read: false });
    updateNotificationBadge();
}

// ---- Gán KH vào chiến dịch ----

function assignCustomersToCampaign(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    const rows = DATA.customers.filter(c => !c.deleted).map(c => `
        <tr><td style="padding:12px;"><input type="checkbox" value="${c.id}" onchange="updateSelectedCount()"></td>
        <td style="padding:12px;">${c.name}</td><td style="padding:12px;">${c.email}</td>
        <td style="padding:12px;"><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
        <td style="padding:12px;">${c.score}</td></tr>`).join('');
    document.getElementById('assignCustomersContent').innerHTML = `
        <h3 style="margin-bottom:20px;">Chiến dịch: ${campaign.name}</h3>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;max-height:400px;overflow-y:auto;">
            <table style="width:100%;">
                <thead style="position:sticky;top:0;background:#f8fafc;">
                    <tr><th style="padding:12px;"><input type="checkbox" id="selectAllCustomers" onchange="toggleAllCustomers(this)"></th>
                    <th style="padding:12px;">Tên</th><th style="padding:12px;">Email</th><th style="padding:12px;">Trạng thái</th><th style="padding:12px;">Điểm</th></tr>
                </thead>
                <tbody id="customerListForCampaign">${rows}</tbody>
            </table>
        </div>
        <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:center;">
            <div style="color:#64748b;"><span id="selectedCount">0</span> khách hàng được chọn</div>
            <div style="display:flex;gap:10px;">
                <button class="btn btn-secondary" onclick="closeModal('assignCustomersModal')">Hủy</button>
                <button class="btn btn-primary" onclick="confirmAssignCustomers(${campaignId})"><i class="fas fa-check"></i> Xác nhận Gán</button>
            </div>
        </div>`;
    document.getElementById('assignCustomersModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function toggleAllCustomers(checkbox) {
    document.querySelectorAll('#customerListForCampaign input[type="checkbox"]').forEach(cb => cb.checked = checkbox.checked);
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll('#customerListForCampaign input[type="checkbox"]:checked').length;
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = count;
}

function confirmAssignCustomers(campaignId) {
    const ids = Array.from(document.querySelectorAll('#customerListForCampaign input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
    if (!ids.length) { alert('⚠ Vui lòng chọn ít nhất một khách hàng!'); return; }
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    ids.forEach(cid => {
        if (!DATA.campaignCustomers.find(cc => cc.campaignId === campaignId && cc.customerId === cid)) {
            DATA.campaignCustomers.push({ id: DATA.campaignCustomers.length + 1, campaignId, customerId: cid, assignedDate: new Date().toLocaleString('vi-VN') });
        }
    });
    alert(`✓ Đã gán ${ids.length} khách hàng cho chiến dịch "${campaign.name}"`);
    DATA.addAuditLog('ASSIGN_CUSTOMERS_TO_CAMPAIGN', `Gán ${ids.length} KH cho ${campaign.name}`, AUTH.getCurrentUser().id);
    closeModal('assignCustomersModal');
}
