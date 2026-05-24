// ============================================
// TRANG QUẢN LÝ KHÁCH HÀNG
// ============================================

async function loadCustomers() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();

    const roleRaw = removeVietnameseAccentForMap(
        user?.role || user?.vaiTro || user?.chucVu || ''
    );

    const isManagerOrAdmin =
        roleRaw.includes('admin') ||
        roleRaw.includes('manager') ||
        roleRaw.includes('truong phong');

    const canDelete = isManagerOrAdmin;

    loadDeleteRequestsFromLocalStorage();
    
    await loadCustomersFromBackend();
    await loadEmployeesFromBackend();
    buildAssignmentEmployeeStats();
    await loadAssignmentHistoryFromBackend();
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
                                <option value="referral">Giới thiệu</option>
                                <option value="event">Sự kiện Tech</option>
                                <option value="website">Website</option>
                            </select>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <button onclick="applyCustomerFilter()" class="btn btn-primary" style="flex:1;"><i class="fas fa-filter"></i> Lọc</button>
                            <button onclick="resetCustomerFilter()" class="btn btn-secondary" style="flex:1;"><i class="fas fa-redo"></i> Đặt lại</button>
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
                        <p style="color:#64748b;margin-bottom:15px;">
                            <i class="fas fa-info-circle"></i>
                            Khách hàng mới sẽ được chia đều cho các nhân viên đang online theo thứ tự xoay vòng
                        </p>

                        <div id="assignmentEmployeeCards" style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                            ${renderAssignmentEmployeeCards()}
                        </div>
                    </div>
                    <div id="assignRatioSettings" style="background:white;padding:20px;border-radius:8px;margin-top:15px;display:none;">
                        <p style="color:#64748b;margin-bottom:15px;">
                            <i class="fas fa-info-circle"></i>
                            Chia khách hàng theo tỷ lệ %. FE sẽ chọn nhân viên phù hợp rồi gọi API phân bổ.
                        </p>

                        <div id="assignRatioInputs" style="display:grid;grid-template-columns:repeat(3,1fr);gap:15px;">
                            ${renderAssignRatioInputs()}
                        </div>
                    </div>
                    <div id="assignManualSettings" style="background:white;padding:20px;border-radius:8px;margin-top:15px;display:none;">
                        <p style="color:#64748b;margin-bottom:15px;">
                            <i class="fas fa-info-circle"></i>
                            Chọn khách hàng chưa phân bổ và nhân viên phụ trách.
                        </p>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                            <div>
                                <label style="font-weight:600;margin-bottom:8px;display:block;">Khách hàng chưa phân bổ</label>
                                <select id="manualCustomerSelect" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:5px;">
                                    ${renderUnassignedCustomerOptions()}
                                </select>
                            </div>

                            <div>
                                <label style="font-weight:600;margin-bottom:8px;display:block;">Nhân viên phụ trách</label>
                                <select id="manualEmployeeSelect" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:5px;">
                                    ${renderEmployeeOptions()}
                                </select>
                            </div>
                        </div>
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
                                ? DATA.assignmentHistory.slice(0,20).map(h => `
                                    <tr>
                                        <td>${h.customerName}</td>
                                        <td><strong>${h.employeeName}</strong></td>
                                        <td>
                                            <span class="status ${getAssignmentMethodClass(h.method)}">
                                                ${getAssignmentMethodLabel(h.method)}
                                            </span>
                                        </td>
                                        <td>${h.date}</td>
                                    </tr>
                                `).join('')
                                : `<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">Chưa có lịch sử phân bổ</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>` : ''}
    `;
    initHeaderCustomerSearch();
}

// ---- CRUD Khách hàng ----

function openCustomerModal() {
    document.getElementById('customerForm').reset();
    loadEmployeeDropdown('customerAssignedTo', true);
    const assignedSelect = document.getElementById('customerAssignedTo');
    if (assignedSelect) assignedSelect.value = '';
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

async function saveCustomer(e) {
    e.preventDefault();

    const customerId = document.getElementById('customerModal').dataset.customerId;
    const isUpdate = !!customerId;

    const payload = {
        hoTen: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        soDienThoai: document.getElementById('customerPhone').value.trim(),
        congTy: document.getElementById('customerCompany').value.trim(),

        trangThaiKhach: mapUIStatusToBackend(
            document.getElementById('customerStatus').value
        ),

        maNguonKH: mapSourceToId(
            document.getElementById('customerSource').value
        ),

        maNganhNghe: mapIndustryToId(
            document.getElementById('customerIndustry').value
        ),

        // Thêm mới: chưa phân bổ ai
        // Cập nhật: giữ người phụ trách theo dropdown
        maNguoiPhuTrach: isUpdate
            ? (parseInt(document.getElementById('customerAssignedTo').value) || null)
            : null,

        ngayBatDauDungThu:
            document.getElementById('customerTrialStartDate').value || null,

        soNgayDungThu:
            parseInt(document.getElementById('customerTrialDays').value) || 0
    };

    console.log('Payload gửi lên backend:', payload);

    try {
        if (customerId) {
            await API_SERVICES.khachHang.update(customerId, payload);
            alert('✓ Cập nhật khách hàng thành công!');
        } else {
            await API_SERVICES.khachHang.create(payload);
            alert('✓ Thêm khách hàng thành công!');
        }

        closeModal('customerModal');

        await loadCustomers();

    } catch (error) {
        console.error('Lỗi lưu khách hàng:', error);
        alert('Lưu khách hàng thất bại. Kiểm tra F12 → Network → POST/PUT /khach-hang.');
    }
}

// Chuyển trạng thái trên giao diện sang trạng thái trong database/backend
function mapUIStatusToBackend(status) {
    const value = removeVietnameseAccentForMap(status);

    if (value.includes('nguoi truy cap') || value.includes('suspect')) {
        return 'Người truy cập';
    }

    if (value.includes('tiem nang') || value.includes('lead')) {
        return 'KH tiềm năng mới';
    }

    if (value.includes('trien vong') || value.includes('prospect')) {
        return 'KH triển vọng';
    }

    if (value.includes('chinh thuc') || value.includes('customer')) {
        return 'KH chính thức';
    }

    if (value.includes('trung thanh') || value.includes('evangelist')) {
        return 'KH trung thành';
    }

    return 'Người truy cập';
}

// Chuyển nguồn khách hàng từ dropdown sang maNguonKH trong SQL
function mapSourceToId(source) {
    const value = removeVietnameseAccentForMap(source);

    if (value.includes('facebook')) {
        return 1; // Facebook Ads
    }

    if (value.includes('google')) {
        return 2; // Google Ads
    }

    if (value.includes('gioi thieu')) {
        return 3; // Giới thiệu
    }

    if (value.includes('su kien') || value.includes('event')) {
        return 4; // Sự kiện Tech
    }

    if (value.includes('website')) {
        return 5; // Website
    }

    // FE có "Trực tiếp" nhưng SQL hiện chưa có nguồn này
    // Nếu sau này thêm "Trực tiếp" vào bảng NguonKhachHang thì sửa return null thành mã mới.
    if (value.includes('truc tiep') || value.includes('direct')) {
        return null;
    }

    return null;
}

// Chuyển ngành nghề từ ô nhập sang maNganhNghe trong SQL
function mapIndustryToId(industry) {
    const value = removeVietnameseAccentForMap(industry);

    if (value.includes('cong nghe') || value.includes('it')) {
        return 1; // Công nghệ thông tin
    }

    if (value.includes('tai chinh') || value.includes('ngan hang')) {
        return 2; // Tài chính - Ngân hàng
    }

    if (value.includes('thuong mai') || value.includes('dien tu')) {
        return 3; // Thương mại điện tử
    }

    if (value.includes('giao duc')) {
        return 4; // Giáo dục
    }

    if (value.includes('y te')) {
        return 5; // Y tế
    }

    return null;
}

// Hàm bỏ dấu tiếng Việt để so sánh dễ hơn
function removeVietnameseAccentForMap(str) {
    return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();
}

async function deleteCustomer(id) {
    const c = DATA.customers.find(c => c.id === id);

    if (!c) {
        alert('Không tìm thấy khách hàng.');
        return;
    }

    const lyDo = prompt(`Nhập lý do xóa khách hàng "${c.name}":`);

    if (lyDo === null) {
        return;
    }

    if (!lyDo.trim()) {
        alert('Vui lòng nhập lý do xóa.');
        return;
    }

    if (!confirm(`Bạn có chắc muốn xóa khách hàng "${c.name}" không?`)) {
        return;
    }

    try {
        await API_SERVICES.khachHang.delete(id, lyDo.trim());

        alert('✓ Đã xóa khách hàng thành công.');

        await loadCustomers();
    } catch (error) {
        console.error('Lỗi xóa khách hàng:', error);
        alert('Xóa khách hàng thất bại. Kiểm tra F12 → Network → DELETE /khach-hang/{id}.');
    }
}

function requestDeleteCustomer(customerId) {
    const c = DATA.customers.find(c => c.id === customerId);

    if (!c) {
        alert('Không tìm thấy khách hàng.');
        return;
    }

    document.getElementById('requestDeleteCustomerName').textContent = c.name;
    document.getElementById('requestDeleteForm').dataset.customerId = customerId;
    document.getElementById('requestDeleteReason').value = '';
    document.getElementById('requestDeleteModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function submitDeleteRequest(e) {
    e.preventDefault();

    const customerId = parseInt(document.getElementById('requestDeleteForm').dataset.customerId);
    const reason = document.getElementById('requestDeleteReason').value.trim();
    const user = AUTH.getCurrentUser();
    const customer = DATA.customers.find(c => c.id === customerId);

    if (!customer) {
        alert('Không tìm thấy khách hàng.');
        return;
    }

    if (!reason) {
        alert('Vui lòng nhập lý do đề nghị xóa.');
        return;
    }

    if (!DATA.deleteRequests) {
        DATA.deleteRequests = [];
    }

    const existedPendingRequest = DATA.deleteRequests.find(r =>
        r.customerId === customerId && r.status === 'pending'
    );

    if (existedPendingRequest) {
        alert('Khách hàng này đã có đề nghị xóa đang chờ duyệt.');
        return;
    }

    const newId = Math.max(...DATA.deleteRequests.map(r => r.id || 0), 0) + 1;

    DATA.deleteRequests.push({
        id: newId,
        customerId: customerId,
        customerName: customer.name,
        reason: reason,
        requestedBy: user?.name || user?.hoTen || user?.email || 'Nhân viên',
        requestedById: user?.id || user?.maNhanVien || null,
        requestedDate: new Date().toLocaleDateString('vi-VN'),
        status: 'pending'
    });

    saveDeleteRequestsToLocalStorage();

    alert('✓ Đề nghị xóa đã được gửi. Trưởng phòng sẽ duyệt.');

    closeModal('requestDeleteModal');
    loadCustomers();
}

function saveDeleteRequestsToLocalStorage() {
    localStorage.setItem('deleteRequests', JSON.stringify(DATA.deleteRequests || []));
}

function loadDeleteRequestsFromLocalStorage() {
    const saved = localStorage.getItem('deleteRequests');

    if (saved) {
        try {
            DATA.deleteRequests = JSON.parse(saved);
        } catch (error) {
            console.error('Lỗi đọc deleteRequests từ localStorage:', error);
            DATA.deleteRequests = DATA.deleteRequests || [];
        }
    } else {
        DATA.deleteRequests = DATA.deleteRequests || [];
    }
}

async function approveDeleteRequest(requestId) {
    const req = DATA.deleteRequests.find(r => r.id === requestId);

    if (!req) {
        alert('Không tìm thấy đề nghị xóa.');
        return;
    }

    if (!confirm(`Duyệt xóa khách hàng "${req.customerName}"?\nLý do: ${req.reason}`)) {
        return;
    }

    try {
        await API_SERVICES.khachHang.delete(req.customerId, req.reason);

        req.status = 'approved';
        req.approvedBy = AUTH.getCurrentUser()?.name || AUTH.getCurrentUser()?.hoTen || 'Trưởng phòng';
        req.approvedDate = new Date().toLocaleDateString('vi-VN');

        saveDeleteRequestsToLocalStorage();

        alert('✓ Đã duyệt và chuyển khách hàng vào Thùng rác.');

        await loadCustomers();
    } catch (error) {
        console.error('Lỗi duyệt xóa khách hàng:', error);
        alert('Duyệt xóa thất bại. Kiểm tra F12 → Network → DELETE /khach-hang/{id}.');
    }
}

function rejectDeleteRequest(requestId) {
    const req = DATA.deleteRequests.find(r => r.id === requestId);

    if (!req) {
        alert('Không tìm thấy đề nghị xóa.');
        return;
    }

    const reason = prompt(`Lý do từ chối xóa "${req.customerName}":`);

    if (reason === null) {
        return;
    }

    if (!reason.trim()) {
        alert('Vui lòng nhập lý do từ chối.');
        return;
    }

    req.status = 'rejected';
    req.rejectedBy = AUTH.getCurrentUser()?.name || AUTH.getCurrentUser()?.hoTen || 'Trưởng phòng';
    req.rejectedDate = new Date().toLocaleDateString('vi-VN');
    req.rejectReason = reason.trim();

    saveDeleteRequestsToLocalStorage();

    alert('✓ Đã từ chối đề nghị xóa.');

    loadCustomers();
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
    const searchInPage = document.getElementById('searchCustomerInput')?.value || '';
    const searchHeader = document.getElementById('searchInput')?.value || '';

    const search = removeVietnameseAccentForMap(
        searchInPage || searchHeader
    );

    const status = document.getElementById('filterStatus')?.value || '';
    const source = document.getElementById('filterSource')?.value || '';

    let filtered = DATA.customers.filter(c => !c.deleted);

    if (search) {
        filtered = filtered.filter(c => {
            const text = removeVietnameseAccentForMap(`
                ${c.name || ''}
                ${c.email || ''}
                ${c.phone || ''}
                ${c.company || ''}
            `);

            return text.includes(search);
        });
    }

    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }

    if (source) {
        filtered = filtered.filter(c => {
            return mapSourceNameToFilterValue(c.source) === source;
        });
    }

    renderCustomersTable(filtered);

    const el = document.getElementById('totalCustomersCount');
    if (el) el.textContent = filtered.length;
}

function mapSourceNameToFilterValue(sourceName) {
    const value = removeVietnameseAccentForMap(sourceName);

    if (value.includes('facebook')) return 'facebook';
    if (value.includes('google')) return 'google';
    if (value.includes('gioi thieu')) return 'referral';
    if (value.includes('su kien') || value.includes('event')) return 'event';
    if (value.includes('website')) return 'website';

    return '';
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

    const roleRaw = removeVietnameseAccentForMap(
        user?.role || user?.vaiTro || user?.chucVu || ''
    );

    const canDelete =
        roleRaw.includes('admin') ||
        roleRaw.includes('manager') ||
        roleRaw.includes('truong phong');
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

async function changeCategoryCustomer(customerId, newStatus) {
    if (!newStatus) return;

    const c = DATA.customers.find(c => c.id === customerId);
    if (!c) {
        alert('Không tìm thấy khách hàng.');
        return;
    }

    const payload = {
        hoTen: c.name,
        email: c.email,
        soDienThoai: c.phone,
        congTy: c.company,

        // Cấp độ mới cần cập nhật
        trangThaiKhach: mapUIStatusToBackend(newStatus),

        // Giữ lại các thông tin cũ
        maNguonKH: mapSourceToId(c.source),
        maNganhNghe: mapIndustryToId(c.industry),
        maNguoiPhuTrach: c.assignedTo || null,
        ngayBatDauDungThu: c.trialStartDate || null,
        soNgayDungThu: c.trialDays || 0
    };

    try {
        await API_SERVICES.khachHang.update(customerId, payload);

        c.status = newStatus;

        alert(`✓ Đã chuyển ${c.name} sang: ${getStatusLabel(newStatus)}`);

        await loadCustomers();
    } catch (error) {
        console.error('Lỗi phân loại khách hàng:', error);
        alert('Phân loại khách hàng thất bại. Kiểm tra F12 → Network → PUT /khach-hang/{id}.');
    }
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

    const roundRobinBox = document.getElementById('assignRoundRobinSettings');
    const ratioBox = document.getElementById('assignRatioSettings');
    const manualBox = document.getElementById('assignManualSettings');

    if (roundRobinBox) roundRobinBox.style.display = method === 'round_robin' ? 'block' : 'none';
    if (ratioBox) ratioBox.style.display = method === 'ratio' ? 'block' : 'none';
    if (manualBox) manualBox.style.display = method === 'manual' ? 'block' : 'none';
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

async function testAssignRule() {
    const method = document.getElementById('assignMethod')?.value || 'round_robin';

    if (method === 'round_robin') {
        await assignByRoundRobin();
        return;
    }

    if (method === 'manual') {
        await assignManually();
        return;
    }

    if (method === 'ratio') {
        await assignByRatio();
        return;
    }
}

function renderAssignRatioInputs() {
    const employees = DATA.assignmentEmployees || [];

    if (!employees.length) {
        return `<div style="grid-column:1/-1;color:#94a3b8;">Chưa có dữ liệu nhân viên</div>`;
    }

    const defaultRatio = Math.floor(100 / employees.length);
    let remaining = 100;

    return employees.map((emp, index) => {
        const value = index === employees.length - 1 ? remaining : defaultRatio;
        remaining -= value;

        return `
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:15px;">
                <div style="font-weight:700;margin-bottom:5px;">${emp.name}</div>
                <div style="font-size:12px;color:#64748b;margin-bottom:10px;">${emp.role}</div>
                <label style="font-size:13px;font-weight:600;">Tỷ lệ (%)</label>
                <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    class="assign-ratio-input"
                    data-employee-id="${emp.id}"
                    value="${value}"
                    style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:5px;margin-top:5px;"
                >
            </div>
        `;
    }).join('');
}

function renderUnassignedCustomerOptions() {
    const customers = DATA.customers.filter(c =>
        !c.deleted &&
        !c.assignedTo &&
        !c.maNguoiPhuTrach
    );

    if (!customers.length) {
        return `<option value="">Không có khách hàng chưa phân bổ</option>`;
    }

    return customers.map(c =>
        `<option value="${c.id}">${c.name} - ${c.email}</option>`
    ).join('');
}

function renderEmployeeOptions() {
    const employees = DATA.assignmentEmployees || [];

    if (!employees.length) {
        return `<option value="">Không có nhân viên</option>`;
    }

    return employees.map(emp =>
        `<option value="${emp.id}">${emp.name} - ${emp.role}</option>`
    ).join('');
}

function getFirstUnassignedCustomer() {
    return DATA.customers.find(c =>
        !c.deleted &&
        !c.assignedTo &&
        !c.maNguoiPhuTrach
    );
}

async function assignByRoundRobin() {
    const customer = getFirstUnassignedCustomer();

    if (!customer) {
        alert('Tất cả khách hàng đã được phân bổ.');
        return;
    }

    if (!confirm(`Bạn muốn phân bổ tự động khách hàng "${customer.name}" theo xoay vòng?`)) {
        return;
    }

    try {
        await API_SERVICES.khachHang.assign(customer.id, {
            maNhanVienMoi: null,
            phuongPhap: 'round_robin'
        });

        alert(`✓ Đã phân bổ tự động khách hàng "${customer.name}" thành công.`);
        await loadCustomers();
    } catch (error) {
        console.error('Lỗi phân bổ xoay vòng:', error);
        alert('Phân bổ xoay vòng thất bại.');
    }
}

async function assignManually() {
    const customerId = parseInt(document.getElementById('manualCustomerSelect')?.value);
    const employeeId = parseInt(document.getElementById('manualEmployeeSelect')?.value);

    if (!customerId) {
        alert('Vui lòng chọn khách hàng cần phân bổ.');
        return;
    }

    if (!employeeId) {
        alert('Vui lòng chọn nhân viên phụ trách.');
        return;
    }

    const customer = DATA.customers.find(c => c.id === customerId);
    const employee = (DATA.assignmentEmployees || []).find(e => e.id === employeeId);

    if (!confirm(`Phân bổ "${customer?.name || 'khách hàng'}" cho "${employee?.name || 'nhân viên'}"?`)) {
        return;
    }

    try {
        await API_SERVICES.khachHang.assign(customerId, {
            maNhanVienMoi: employeeId,
            phuongPhap: 'manual'
        });

        alert('✓ Phân bổ thủ công thành công.');
        await loadCustomers();
    } catch (error) {
        console.error('Lỗi phân bổ thủ công:', error);
        alert('Phân bổ thủ công thất bại.');
    }
}

async function assignByRatio() {
    const customer = getFirstUnassignedCustomer();

    if (!customer) {
        alert('Tất cả khách hàng đã được phân bổ.');
        return;
    }

    const selectedEmployee = chooseEmployeeByRatio();

    if (!selectedEmployee) {
        alert('Không chọn được nhân viên theo tỷ lệ.');
        return;
    }

    if (!confirm(`Phân bổ "${customer.name}" cho "${selectedEmployee.name}" theo tỷ lệ?`)) {
        return;
    }

    try {
        await API_SERVICES.khachHang.assign(customer.id, {
            maNhanVienMoi: selectedEmployee.id,
            phuongPhap: 'ratio'
        });

        alert(`✓ Đã phân bổ "${customer.name}" cho "${selectedEmployee.name}" theo tỷ lệ.`);
        await loadCustomers();
    } catch (error) {
        console.error('Lỗi phân bổ theo tỷ lệ:', error);
        alert('Phân bổ theo tỷ lệ thất bại.');
    }
}

function chooseEmployeeByRatio() {
    const employees = DATA.assignmentEmployees || [];
    const inputs = Array.from(document.querySelectorAll('.assign-ratio-input'));

    if (!employees.length || !inputs.length) {
        return null;
    }

    const ratios = inputs.map(input => ({
        employeeId: parseInt(input.dataset.employeeId),
        ratio: parseInt(input.value) || 0
    }));

    const totalRatio = ratios.reduce((sum, item) => sum + item.ratio, 0);

    if (totalRatio !== 100) {
        alert('Tổng tỷ lệ phải bằng 100%.');
        return null;
    }

    const totalAssigned = employees.reduce((sum, emp) => sum + (emp.assignedCount || 0), 0);
    const nextTotal = totalAssigned + 1;

    let selected = null;
    let maxGap = -Infinity;

    for (const item of ratios) {
        const emp = employees.find(e => Number(e.id) === Number(item.employeeId));
        if (!emp || item.ratio <= 0) continue;

        const expectedCount = nextTotal * item.ratio / 100;
        const currentCount = emp.assignedCount || 0;
        const gap = expectedCount - currentCount;

        if (gap > maxGap) {
            maxGap = gap;
            selected = emp;
        }
    }

    return selected;
}

function getAssignmentMethodLabel(method) {
    if (method === 'round_robin') return 'Xoay vòng';
    if (method === 'ratio') return 'Theo tỷ lệ';
    if (method === 'manual') return 'Thủ công';
    if (method === 'old_data') return 'Dữ liệu cũ';
    return 'Đã phân bổ';
}

function getAssignmentMethodClass(method) {
    if (method === 'round_robin') return 'customer';
    if (method === 'ratio') return 'prospect';
    if (method === 'manual') return 'lead';
    if (method === 'old_data') return 'suspect';
    return 'suspect';
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
// ============================================
// BACKEND DATA MAPPING - GIỮ NGUYÊN GIAO DIỆN CŨ
// ============================================

async function loadCustomersFromBackend() {
    try {
        if (typeof API_SERVICES === 'undefined' || !API_SERVICES.khachHang) {
            console.warn('API_SERVICES.khachHang chưa sẵn sàng, dùng DATA.customers mock.');
            return;
        }

        const response = await API_SERVICES.khachHang.list();

        const apiData = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
                ? response
                : Array.isArray(response?.data?.content)
                    ? response.data.content
                    : [];

        if (!apiData.length) {
            console.warn('Backend không trả về khách hàng hoặc danh sách rỗng.');
            DATA.customers = [];
            return;
        }

        DATA.customers = apiData.map(mapKhachHangBackendToCustomerUI);

        console.log('Đã tải khách hàng từ backend:', DATA.customers);
    } catch (error) {
        console.error('Lỗi lấy khách hàng từ backend:', error);
        alert('Không lấy được dữ liệu khách hàng từ backend. Kiểm tra token đăng nhập hoặc API /khach-hang.');
    }
}

function mapKhachHangBackendToCustomerUI(kh) {
    return {
        id: kh.maKhachHang,
        name: kh.hoTen || '',
        email: kh.email || '',
        phone: kh.soDienThoai || '',
        company: kh.congTy || '',
        status: convertTrangThaiKhachToUIStatus(kh.trangThaiKhach),
        source: kh.tenNguonKH || kh.nguonKhachHang || '',
        industry: kh.tenNganhNghe || kh.nganhNghe || '',
        score: kh.diemTiemNang || 0,

        assignedTo: kh.maNguoiPhuTrach || null,
        assignedToName: kh.tenNguoiPhuTrach || '',
        maNguoiPhuTrach: kh.maNguoiPhuTrach || null,
        tenNguoiPhuTrach: kh.tenNguoiPhuTrach || '',

        trialStartDate: kh.ngayBatDauDungThu || null,
        trialDays: kh.soNgayDungThu || 0,
        createdDate: kh.ngayTao ? String(kh.ngayTao).substring(0, 10) : '',
        updatedDate: kh.ngayCapNhat ? String(kh.ngayCapNhat).substring(0, 10) : '',
        lastInteraction: '',
        deleted: kh.daXoa === true || kh.deleted === true
    };
}

function buildAssignmentHistoryFromBackendCustomers() {
    const employeeIds = new Set(
        (DATA.assignmentEmployees || []).map(emp => Number(emp.id))
    );

    const assignedCustomers = DATA.customers
        .filter(c =>
            !c.deleted &&
            (c.assignedTo || c.maNguoiPhuTrach) &&
            employeeIds.has(Number(c.assignedTo || c.maNguoiPhuTrach))
        )
        .map(c => ({
            id: c.id,
            customerId: c.id,
            customerName: c.name,
            employeeId: c.assignedTo || c.maNguoiPhuTrach,
            employeeName: c.assignedToName || c.tenNguoiPhuTrach || 'Chưa rõ nhân viên',
            method: 'round_robin',
            date: c.updatedDate || c.createdDate || ''
        }))
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

    DATA.assignmentHistory = assignedCustomers;
}

async function loadAssignmentHistoryFromBackend() {
    try {
        if (typeof API_SERVICES === 'undefined' || !API_SERVICES.khachHang || !API_SERVICES.khachHang.assignmentHistory) {
            console.warn('API lịch sử phân bổ chưa sẵn sàng. Tạm dùng lịch sử build từ khách hàng.');
            buildAssignmentHistoryFromBackendCustomers();
            return;
        }

        const response = await API_SERVICES.khachHang.assignmentHistory();

        const apiData = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
                ? response
                : [];

        DATA.assignmentHistory = apiData.map(mapAssignmentHistoryBackendToUI);

        console.log('Đã tải lịch sử phân bổ từ backend:', DATA.assignmentHistory);
    } catch (error) {
        console.error('Lỗi lấy lịch sử phân bổ từ backend:', error);

        // Dự phòng nếu API lỗi
        buildAssignmentHistoryFromBackendCustomers();
    }
}

function mapAssignmentHistoryBackendToUI(item) {
    return {
        id: item.maLichSuPhanBo,
        customerId: item.maKhachHang,
        customerName: item.tenKhachHang || item.hoTenKhachHang || '',
        employeeId: item.maNhanVien,
        employeeName: item.tenNhanVien || item.hoTenNhanVien || '',
        method: item.phuongPhap || 'round_robin',
        date: item.ngayPhanBo
            ? String(item.ngayPhanBo).substring(0, 10)
            : ''
    };
}

async function loadEmployeesFromBackend() {
    try {
        if (typeof API_SERVICES === 'undefined' || !API_SERVICES.nhanVien) {
            console.warn('API_SERVICES.nhanVien chưa sẵn sàng.');
            DATA.assignmentEmployees = [];
            return;
        }

        const response = await API_SERVICES.nhanVien.list();

        const apiData = Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
                ? response
                : Array.isArray(response?.data?.content)
                    ? response.data.content
                    : [];

        DATA.assignmentEmployees = apiData.map(mapNhanVienBackendToAssignmentUI);

        console.log('Đã tải nhân viên từ backend:', DATA.assignmentEmployees);
    } catch (error) {
        console.error('Lỗi lấy nhân viên từ backend:', error);
        DATA.assignmentEmployees = [];
    }
}

function mapNhanVienBackendToAssignmentUI(nv) {
    return {
        id: nv.maNhanVien,
        name: nv.hoTen || '',
        email: nv.email || '',
        phone: nv.soDienThoai || '',
        role: nv.chucVu || '',
        avatar: nv.anhDaiDien || '',
        status: nv.trangThaiTaiKhoan || '',
        online: removeVietnameseAccentForMap(nv.trangThaiTaiKhoan || '').includes('hoat dong'),
        assignedCount: 0
    };
}

function buildAssignmentEmployeeStats() {
    const employees = DATA.assignmentEmployees || [];

    employees.forEach(emp => {
        emp.assignedCount = DATA.customers.filter(c =>
            !c.deleted &&
            Number(c.assignedTo || c.maNguoiPhuTrach) === Number(emp.id)
        ).length;
    });

    DATA.assignmentEmployees = employees;
}

function renderAssignmentEmployeeCards() {
    const employees = DATA.assignmentEmployees || [];

    if (!employees.length) {
        return `
            <div style="grid-column:1/-1;color:#94a3b8;text-align:center;padding:20px;">
                Chưa có dữ liệu nhân viên
            </div>
        `;
    }

    return employees.map(emp => `
        <div style="
            background:#f8fafc;
            border:1px solid #e2e8f0;
            border-radius:8px;
            padding:15px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
        ">
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="
                    width:38px;
                    height:38px;
                    border-radius:50%;
                    background:#0f172a;
                    color:white;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-weight:700;
                ">
                    ${getEmployeeInitials(emp.name)}
                </div>

                <div>
                    <div style="font-weight:700;color:#0f172a;">${emp.name}</div>
                    <div style="font-size:12px;color:#64748b;">${emp.role}</div>
                    <div style="font-size:12px;color:${emp.online ? '#16a34a' : '#94a3b8'};">
                        ● ${emp.online ? 'Online' : 'Không hoạt động'}
                    </div>
                </div>
            </div>

            <div style="text-align:right;">
                <div style="font-size:20px;font-weight:700;color:#0f172a;">${emp.assignedCount}</div>
                <div style="font-size:12px;color:#64748b;">khách</div>
            </div>
        </div>
    `).join('');
}

function getEmployeeInitials(name) {
    const words = String(name || '').trim().split(/\s+/);
    if (!words.length || !words[0]) return '?';

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[words.length - 2].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();
}

function convertTrangThaiKhachToUIStatus(trangThaiKhach) {
    if (!trangThaiKhach) return 'suspect';

    const value = removeVietnameseAccent(String(trangThaiKhach)).toLowerCase();

    if (value.includes('truy cap')) return 'suspect';
    if (value.includes('tiem nang')) return 'lead';
    if (value.includes('trien vong')) return 'prospect';
    if (value.includes('chinh thuc')) return 'customer';
    if (value.includes('trung thanh')) return 'evangelist';

    return 'suspect';
}

function removeVietnameseAccent(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}
function initHeaderCustomerSearch() {
    const headerSearch = document.getElementById('searchInput');

    if (!headerSearch) return;

    headerSearch.oninput = function () {
        applyCustomerFilter();
    };
}