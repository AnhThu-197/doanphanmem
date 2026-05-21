// Khởi tạo dashboard khi trang load
document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    initializeDashboard();
    setupMenuVisibility();
    setupMenuListeners();
    setupFormListeners();
    setupModalForms();
    loadPage('dashboard');
});

// Khởi tạo dashboard
function initializeDashboard() {
    const user = AUTH.getCurrentUser();
    if (!user) return;
    
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = getRoleLabel(user.role);
    document.getElementById('userAvatar').textContent = user.avatar || user.name.split(' ').pop().substring(0, 2).toUpperCase();
}

function getRoleLabel(role) {
    const labels = {
        'employee': 'Nhân viên',
        'manager': 'Trưởng phòng',
        'admin': 'Quản trị viên'
    };
    return labels[role] || role;
}

function setupMenuVisibility() {
    const user = AUTH.getCurrentUser();
    if (!user) return;
    
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-page]');
    const visiblePages = {
        'employee': ['dashboard', 'customers', 'campaigns', 'contracts', 'send-message', 'profile', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates'],
        'manager': ['dashboard', 'customers', 'campaigns', 'contracts', 'campaign-expenses', 'send-message', 'profile', 'reports', 'manage-employees', 'trash', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates', 'api-sync', 'financial-sync'],
        'admin': ['dashboard', 'user-management', 'settings', 'profile']
    };
    
    const allowedPages = visiblePages[user.role] || visiblePages['employee'];
    
    menuItems.forEach(item => {
        const page = item.dataset.page;
        if (allowedPages.includes(page)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-page]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            loadPage(this.dataset.page);
        });
    });
}

function setupFormListeners() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
        });
    });
}

// Setup các modal forms
function setupModalForms() {
    // Form khách hàng
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', saveCustomer);
    }
    
    // Form chiến dịch
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
        campaignForm.addEventListener('submit', saveCampaign);
    }
    
    // Form tương tác
    const interactionForm = document.getElementById('interactionForm');
    if (interactionForm) {
        interactionForm.addEventListener('submit', saveInteraction);
    }
    
    // Tìm kiếm khách hàng realtime
    setTimeout(() => {
        const searchInput = document.getElementById('searchCustomerInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                applyCustomerFilter();
            });
        }
    }, 500);
}

function loadPage(page) {
    const mainContent = document.getElementById('mainContent');
    
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'campaigns':
            loadCampaigns();
            break;
        case 'revenue-sync':
            loadRevenueSync();
            break;
        case 'contracts':
            loadContracts();
            break;
        case 'campaign-expenses':
            loadCampaignExpenses();
            break;
        case 'send-message':
            loadSendMessage();
            break;
        case 'trial-management':
            loadTrialManagement();
            break;
        case 'automation':
            loadAutomation();
            break;
        case 'smart-reminders':
            loadSmartReminders();
            break;
        case 'merge-duplicates':
            loadMergeDuplicates();
            break;
        case 'api-sync':
            openApiIntegrationSettings();
            break;
        case 'financial-sync':
            openFinancialIntegrationSettings();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'reports':
            loadReports();
            break;
        case 'manage-employees':
            loadManageEmployees();
            break;
        case 'trash':
            loadTrash();
            break;
        case 'user-management':
            loadUserManagement();
            break;
        case 'settings':
            loadSettings();
            break;
        default:
            loadDashboard();
    }
}

function loadDashboard() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    
    // Dashboard riêng cho Admin
    if (user && user.role === 'admin') {
        loadAdminDashboard();
        return;
    }
    
    // Dashboard cho Manager và Employee
    const canEdit = true; // Tất cả user đều có quyền sửa khách hàng
    const canDelete = user && user.role !== 'employee'; // Chỉ Manager/Admin mới xóa trực tiếp
    const totalCustomers = DATA.customers.filter(c => !c.deleted).length;
    const totalCampaigns = DATA.campaigns.filter(c => !c.deleted).length;
    const totalInteractions = DATA.interactions.length;
    
    mainContent.innerHTML = `
        <h2 class="page-title">Tổng quan</h2>
        <div class="cards-container">
            <div class="card">
                <div class="card-info">
                    <h3>Tổng Khách hàng</h3>
                    <p>${totalCustomers}</p>
                </div>
                <div class="card-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Chiến dịch Hoạt động</h3>
                    <p>${totalCampaigns}</p>
                </div>
                <div class="card-icon"><i class="fas fa-bullhorn"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Tương tác</h3>
                    <p>${totalInteractions}</p>
                </div>
                <div class="card-icon"><i class="fas fa-comments"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Doanh thu</h3>
                    <p>0 VND</p>
                </div>
                <div class="card-icon"><i class="fas fa-chart-line"></i></div>
            </div>
        </div>
        <div class="table-container">
            <div class="table-header">
                <h3>Khách hàng Gần đây</h3>
                <button class="btn-add" onclick="openCustomerModal()">+ Thêm Khách hàng</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.customers.filter(c => !c.deleted).slice(0, 5).map(c => {
                        let actionButtons = `<button class="btn-view" onclick="viewCustomer(${c.id})">Xem</button>`;
                        if (canEdit) {
                            actionButtons += `<button class="btn-delete" onclick="deleteCustomer(${c.id})">Xóa</button>`;
                        } else {
                            actionButtons += `<button class="btn-delete" onclick="requestDeleteCustomer(${c.id})">Đề nghị Xóa</button>`;
                        }
                        return `
                            <tr>
                                <td>${c.name}</td>
                                <td>${c.email}</td>
                                <td>${c.phone}</td>
                                <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                <td>
                                    ${actionButtons}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadCustomers() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    const canEdit = true; // Tất cả user đều có quyền sửa khách hàng
    const canDelete = user && user.role !== 'employee'; // Chỉ Manager/Admin mới xóa trực tiếp
    const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Khách hàng</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('customers-list')">Danh sách Khách hàng</button>
            <button class="tab-btn" onclick="switchTab('customers-categorize')">Phân loại Khách hàng</button>
            ${isManagerOrAdmin ? '<button class="tab-btn" onclick="switchTab(\'customers-delete-requests\')">Đề nghị Xóa <span class="badge" style="background: #ef4444; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 5px;">' + DATA.deleteRequests.filter(r => r.status === 'pending').length + '</span></button>' : ''}
            ${isManagerOrAdmin ? '<button class="tab-btn" onclick="switchTab(\'customers-assign\')">Phân bổ Khách hàng</button>' : ''}
        </div>
        
        <!-- Tab Danh sách Khách hàng -->
        <div id="customers-list" class="tab-content active">
            <div class="table-container">
                <!-- Bộ lọc -->
                <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #334155;">Tìm kiếm</label>
                            <input type="text" id="searchCustomerInput" placeholder="Tên, email, SĐT, công ty..." style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 13px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #334155;">Cấp độ</label>
                            <select id="filterStatus" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 13px;">
                                <option value="">Tất cả</option>
                                <option value="suspect">Suspect</option>
                                <option value="lead">Lead</option>
                                <option value="prospect">Prospect</option>
                                <option value="customer">Customer</option>
                                <option value="evangelist">Evangelist</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; font-size: 13px; color: #334155;">Nguồn</label>
                            <select id="filterSource" style="width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 13px;">
                                <option value="">Tất cả</option>
                                <option value="facebook">Facebook</option>
                                <option value="google">Google</option>
                                <option value="direct">Trực tiếp</option>
                                <option value="referral">Giới thiệu</option>
                                <option value="website">Website</option>
                            </select>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="applyCustomerFilter()" style="flex: 1; padding: 8px 16px; background: #2B4856; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 13px;">
                                <i class="fas fa-filter"></i> Lọc
                            </button>
                            <button onclick="resetCustomerFilter()" style="flex: 1; padding: 8px 16px; background: #e2e8f0; color: #334155; border: none; border-radius: 5px; cursor: pointer; font-weight: 600; font-size: 13px;">
                                <i class="fas fa-redo"></i> Đặt lại
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="table-header">
                    <div style="color: #64748b; font-size: 14px;">
                        <i class="fas fa-users"></i> Tổng: <strong id="totalCustomersCount">${DATA.customers.filter(c => !c.deleted).length}</strong> khách hàng
                    </div>
                    <div style="display: flex; gap: 10px;">
                        ${isManagerOrAdmin ? '<button class="btn btn-secondary" onclick="exportCustomersData()"><i class="fas fa-download"></i> Xuất Excel</button>' : ''}
                        <button class="btn-add" onclick="openCustomerModal()">+ Thêm Khách hàng</button>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Công ty</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="customersTable">
                        ${DATA.customers.filter(c => !c.deleted).map(c => {
                            let actionButtons = `<button class="btn-view" onclick="viewCustomer(${c.id})">Xem</button>`;
                            // Tất cả user đều có quyền sửa
                            actionButtons += `<button class="btn-edit" onclick="editCustomer(${c.id})">Sửa</button>`;
                            // Chỉ Manager/Admin mới xóa trực tiếp, Employee chỉ đề nghị xóa
                            if (canDelete) {
                                actionButtons += `<button class="btn-delete" onclick="deleteCustomer(${c.id})">Xóa</button>`;
                            } else {
                                actionButtons += `<button class="btn-delete" onclick="requestDeleteCustomer(${c.id})">Đề nghị Xóa</button>`;
                            }
                            return `
                                <tr>
                                    <td>${c.name}</td>
                                    <td>${c.email}</td>
                                    <td>${c.phone}</td>
                                    <td>${c.company}</td>
                                    <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                    <td>
                                        ${actionButtons}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Tab Phân loại Khách hàng -->
        <div id="customers-categorize" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Phân loại Khách hàng theo Cấp độ</h3>
                </div>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; padding: 20px;">
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; cursor: pointer;" onclick="openCategoryModal('suspect')">
                        <h3 style="color: #64748b; margin-bottom: 8px; font-size: 14px;">Suspect</h3>
                        <p style="color: #64748b; font-size: 20px; font-weight: bold;">${DATA.customers.filter(c => !c.deleted && c.status === 'suspect').length}</p>
                        <small style="color: #64748b; font-size: 11px;">Người truy cập</small>
                    </div>
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; cursor: pointer;" onclick="openCategoryModal('lead')">
                        <h3 style="color: #1e40af; margin-bottom: 8px; font-size: 14px;">Lead</h3>
                        <p style="color: #1e40af; font-size: 20px; font-weight: bold;">${DATA.customers.filter(c => !c.deleted && c.status === 'lead').length}</p>
                        <small style="color: #1e40af; font-size: 11px;">KH tiềm năng mới</small>
                    </div>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; cursor: pointer;" onclick="openCategoryModal('prospect')">
                        <h3 style="color: #92400e; margin-bottom: 8px; font-size: 14px;">Prospect</h3>
                        <p style="color: #92400e; font-size: 20px; font-weight: bold;">${DATA.customers.filter(c => !c.deleted && c.status === 'prospect').length}</p>
                        <small style="color: #92400e; font-size: 11px;">KH triển vọng</small>
                    </div>
                    <div style="background: #dcfce7; padding: 15px; border-radius: 8px; cursor: pointer;" onclick="openCategoryModal('customer')">
                        <h3 style="color: #166534; margin-bottom: 8px; font-size: 14px;">Customer</h3>
                        <p style="color: #166534; font-size: 20px; font-weight: bold;">${DATA.customers.filter(c => !c.deleted && c.status === 'customer').length}</p>
                        <small style="color: #166534; font-size: 11px;">KH chính thức</small>
                    </div>
                    <div style="background: #fce7f3; padding: 15px; border-radius: 8px; cursor: pointer;" onclick="openCategoryModal('evangelist')">
                        <h3 style="color: #9f1239; margin-bottom: 8px; font-size: 14px;">Evangelist</h3>
                        <p style="color: #9f1239; font-size: 20px; font-weight: bold;">${DATA.customers.filter(c => !c.deleted && c.status === 'evangelist').length}</p>
                        <small style="color: #9f1239; font-size: 11px;">KH trung thành</small>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <h3 style="margin-bottom: 15px;">Danh sách Khách hàng theo Cấp độ</h3>
                    <table style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Cấp độ Hiện tại</th>
                                <th>Điểm</th>
                                <th>Chuyển Cấp độ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DATA.customers.filter(c => !c.deleted).map(c => `
                                <tr>
                                    <td>${c.name}</td>
                                    <td>${c.email}</td>
                                    <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                    <td><strong>${c.score}</strong></td>
                                    <td>
                                        <select onchange="changeCategoryCustomer(${c.id}, this.value)" style="padding: 6px; border: 1px solid #e2e8f0; border-radius: 5px;">
                                            <option value="">-- Chọn --</option>
                                            <option value="suspect" ${c.status === 'suspect' ? 'selected' : ''}>Suspect (Người truy cập)</option>
                                            <option value="lead" ${c.status === 'lead' ? 'selected' : ''}>Lead (KH tiềm năng mới)</option>
                                            <option value="prospect" ${c.status === 'prospect' ? 'selected' : ''}>Prospect (KH triển vọng)</option>
                                            <option value="customer" ${c.status === 'customer' ? 'selected' : ''}>Customer (KH chính thức)</option>
                                            <option value="evangelist" ${c.status === 'evangelist' ? 'selected' : ''}>Evangelist (KH trung thành)</option>
                                        </select>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        
        <!-- Tab Đề nghị Xóa (chỉ cho Manager/Admin) -->
        ${isManagerOrAdmin ? `
        <div id="customers-delete-requests" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh sách Đề nghị Xóa Khách hàng</h3>
                </div>
                ${DATA.deleteRequests.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Người đề nghị</th>
                            <th>Lý do</th>
                            <th>Ngày đề nghị</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.deleteRequests.map(req => {
                            const statusLabels = {
                                'pending': 'Chờ duyệt',
                                'approved': 'Đã duyệt',
                                'rejected': 'Đã từ chối'
                            };
                            const statusColors = {
                                'pending': '#f59e0b',
                                'approved': '#10b981',
                                'rejected': '#ef4444'
                            };
                            return `
                                <tr>
                                    <td><strong>${req.customerName}</strong></td>
                                    <td>${req.requestedBy}</td>
                                    <td style="max-width: 300px;">${req.reason}</td>
                                    <td>${req.requestedDate}</td>
                                    <td><span class="status" style="background: ${statusColors[req.status]}; color: white;">${statusLabels[req.status]}</span></td>
                                    <td>
                                        ${req.status === 'pending' ? `
                                            <button class="btn btn-primary" onclick="approveDeleteRequest(${req.id})" style="padding: 6px 12px; margin-right: 5px;">
                                                <i class="fas fa-check"></i> Duyệt
                                            </button>
                                            <button class="btn btn-secondary" onclick="rejectDeleteRequest(${req.id})" style="padding: 6px 12px;">
                                                <i class="fas fa-times"></i> Từ chối
                                            </button>
                                        ` : `
                                            <button class="btn-view" onclick="viewDeleteRequest(${req.id})">Xem</button>
                                        `}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ` : `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px;"></i>
                    <p>Không có đề nghị xóa nào</p>
                </div>
                `}
            </div>
        </div>
        ` : ''}
        
        <!-- Tab Phân bổ Khách hàng (chỉ cho Manager/Admin) -->
        ${isManagerOrAdmin ? `
        <div id="customers-assign" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Phân bổ Khách hàng Tự động</h3>
                </div>
                
                <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                    <h4 style="margin-bottom: 20px; color: #0f172a;">Cài đặt Quy tắc Phân bổ</h4>
                    
                    <div class="form-group" style="margin-bottom: 20px;">
                        <label style="font-weight: 600; margin-bottom: 10px; display: block;">Phương pháp phân bổ:</label>
                        <select id="assignMethod" onchange="updateAssignMethodUI()" style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%; max-width: 400px;">
                            <option value="round_robin">Xoay vòng chia đều (Round Robin)</option>
                            <option value="ratio">Chia theo tỷ lệ</option>
                            <option value="manual">Thủ công</option>
                        </select>
                    </div>
                    
                    <!-- Round Robin -->
                    <div id="assignRoundRobinSettings" style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px;">
                        <p style="color: #64748b; margin-bottom: 15px;">
                            <i class="fas fa-info-circle"></i> Khách hàng mới sẽ được chia đều cho các nhân viên đang online theo thứ tự xoay vòng
                        </p>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8fafc; border-radius: 5px;">
                                <input type="checkbox" checked>
                                <div>
                                    <div style="font-weight: 600;">Trần Minh Chiến</div>
                                    <small style="color: #10b981;"><i class="fas fa-circle" style="font-size: 8px;"></i> Online</small>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8fafc; border-radius: 5px;">
                                <input type="checkbox" checked>
                                <div>
                                    <div style="font-weight: 600;">Nguyễn Văn B</div>
                                    <small style="color: #10b981;"><i class="fas fa-circle" style="font-size: 8px;"></i> Online</small>
                                </div>
                            </label>
                            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f8fafc; border-radius: 5px;">
                                <input type="checkbox">
                                <div>
                                    <div style="font-weight: 600;">Lê Thị C</div>
                                    <small style="color: #94a3b8;"><i class="fas fa-circle" style="font-size: 8px;"></i> Offline</small>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Ratio -->
                    <div id="assignRatioSettings" style="background: white; padding: 20px; border-radius: 8px; margin-top: 15px; display: none;">
                        <p style="color: #64748b; margin-bottom: 15px;">
                            <i class="fas fa-info-circle"></i> Chia khách hàng theo tỷ lệ % cho từng nhân viên
                        </p>
                        <div style="display: grid; gap: 15px;">
                            <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #f8fafc; border-radius: 5px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">Trần Minh Chiến</div>
                                    <small style="color: #64748b;">Nhân viên cũ</small>
                                </div>
                                <input type="number" value="60" min="0" max="100" style="width: 80px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 5px; text-align: center;">
                                <span style="font-weight: 600;">%</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px; padding: 12px; background: #f8fafc; border-radius: 5px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600;">Nguyễn Văn B</div>
                                    <small style="color: #64748b;">Nhân viên mới</small>
                                </div>
                                <input type="number" value="40" min="0" max="100" style="width: 80px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 5px; text-align: center;">
                                <span style="font-weight: 600;">%</span>
                            </div>
                        </div>
                        <div style="margin-top: 15px; padding: 12px; background: #dcfce7; border-radius: 5px; color: #166534;">
                            <strong>Tổng: 100%</strong>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button class="btn btn-primary" onclick="saveAssignSettings()">
                            <i class="fas fa-save"></i> Lưu Cài đặt
                        </button>
                        <button class="btn btn-secondary" onclick="testAssignRule()" style="margin-left: 10px;">
                            <i class="fas fa-play"></i> Test Quy tắc
                        </button>
                    </div>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h4 style="margin-bottom: 15px;">Lịch sử Phân bổ Gần đây</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Được phân cho</th>
                                <th>Phương pháp</th>
                                <th>Ngày phân bổ</th>
                            </tr>
                        </thead>
                        <tbody id="assignmentHistoryTable">
                            ${DATA.assignmentHistory && DATA.assignmentHistory.length > 0 ? 
                                DATA.assignmentHistory.slice(0, 10).map(h => `
                                    <tr>
                                        <td>${h.customerName}</td>
                                        <td><strong>${h.employeeName}</strong></td>
                                        <td><span class="status ${h.method === 'round_robin' ? 'customer' : 'prospect'}">${h.method === 'round_robin' ? 'Xoay vòng' : h.method === 'ratio' ? 'Theo tỷ lệ' : 'Thủ công'}</span></td>
                                        <td>${h.date}</td>
                                    </tr>
                                `).join('') 
                                : `
                                <tr>
                                    <td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">Chưa có lịch sử phân bổ</td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

function loadCampaigns() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    const canEdit = user && user.role !== 'employee'; // Chỉ Manager/Admin mới sửa chiến dịch
    const canDelete = user && user.role !== 'employee'; // Chỉ Manager/Admin mới xóa
    const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Chiến dịch</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('campaigns-list')">Danh sách Chiến dịch</button>
            ${isManagerOrAdmin ? '<button class="tab-btn" onclick="switchTab(\'campaigns-performance\')">Hiệu quả Chiến dịch</button>' : ''}
        </div>
        
        <!-- Tab Danh sách Chiến dịch -->
        <div id="campaigns-list" class="tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh sách Chiến dịch</h3>
                    ${canEdit ? '<button class="btn-add" onclick="openCampaignModal()">+ Thêm Chiến dịch</button>' : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Ngày bắt đầu</th>
                            <th>Ngày kết thúc</th>
                            <th>Ngân sách</th>
                            ${isManagerOrAdmin ? '<th>Chi phí thực tế</th><th>ROI</th><th>Conversion Rate</th>' : ''}
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.campaigns.filter(c => !c.deleted).map(c => {
                            // Calculate metrics
                            const actualSpent = c.actualSpent || 0;
                            const revenue = c.revenue || 0;
                            const roi = actualSpent > 0 ? ((revenue - actualSpent) / actualSpent * 100).toFixed(1) : 0;
                            const conversionRate = c.leads > 0 ? ((c.conversions || 0) / c.leads * 100).toFixed(1) : 0;
                            const roiColor = roi >= 0 ? '#10b981' : '#ef4444';
                            const conversionColor = conversionRate >= 15 ? '#10b981' : conversionRate >= 10 ? '#f59e0b' : '#ef4444';
                            
                            return `
                            <tr>
                                <td><strong>${c.name}</strong></td>
                                <td>${c.startDate}</td>
                                <td>${c.endDate}</td>
                                <td>${formatCurrency(c.budget)}</td>
                                ${isManagerOrAdmin ? `
                                <td>${formatCurrency(actualSpent)}</td>
                                <td style="color: ${roiColor}; font-weight: 600;">${roi}%</td>
                                <td style="color: ${conversionColor}; font-weight: 600;">${conversionRate}%</td>
                                ` : ''}
                                <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                <td>
                                    <button class="btn-view" onclick="viewCampaignDetail(${c.id})">Xem</button>
                                    ${canEdit ? `
                                    <button class="btn btn-primary" onclick="assignCustomersToCampaign(${c.id})" style="padding: 6px 12px; font-size: 13px;">
                                        <i class="fas fa-users"></i> Gán KH
                                    </button>
                                    <button class="btn-edit" onclick="editCampaign(${c.id})">Sửa</button>
                                    <button class="btn-delete" onclick="deleteCampaign(${c.id})">Xóa</button>` : ''}
                                </td>
                            </tr>
                        `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Tab Hiệu quả Chiến dịch -->
        ${isManagerOrAdmin ? `
        <div id="campaigns-performance" class="tab-content">
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: #1e40af; margin-bottom: 10px;">
                            <i class="fas fa-sync-alt"></i> Dữ liệu Tự động Đồng bộ
                        </h3>
                        <p style="color: #1e40af; margin: 0;">
                            Tất cả chỉ số được tự động đồng bộ từ hệ thống ERP, Kế toán và nền tảng quảng cáo. 
                            Không cần nhập thủ công.
                        </p>
                    </div>
                    <button class="btn btn-primary" onclick="loadPage('financial-sync')" style="white-space: nowrap;">
                        <i class="fas fa-cog"></i> Cấu hình Tích hợp
                    </button>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px;">Tổng quan Hiệu quả</h3>
                <div class="cards-container" style="grid-template-columns: repeat(4, 1fr);">
                    ${(() => {
                        const activeCampaigns = DATA.campaigns.filter(c => !c.deleted);
                        const totalBudget = activeCampaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
                        const totalSpent = activeCampaigns.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
                        const totalRevenue = activeCampaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
                        const avgROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent * 100).toFixed(1) : 0;
                        const totalLeads = activeCampaigns.reduce((sum, c) => sum + (c.leads || 0), 0);
                        const totalConversions = activeCampaigns.reduce((sum, c) => sum + (c.conversions || 0), 0);
                        const avgConversion = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : 0;
                        
                        return `
                            <div class="card">
                                <div class="card-info">
                                    <h3>Tổng Ngân sách</h3>
                                    <p>${formatCurrency(totalBudget)}</p>
                                </div>
                                <div class="card-icon"><i class="fas fa-wallet"></i></div>
                            </div>
                            <div class="card">
                                <div class="card-info">
                                    <h3>Đã Chi</h3>
                                    <p>${formatCurrency(totalSpent)}</p>
                                    <small style="color: ${totalSpent <= totalBudget ? '#10b981' : '#ef4444'};">
                                        ${((totalSpent / totalBudget) * 100).toFixed(1)}% ngân sách
                                    </small>
                                </div>
                                <div class="card-icon"><i class="fas fa-money-bill-wave"></i></div>
                            </div>
                            <div class="card">
                                <div class="card-info">
                                    <h3>ROI Trung bình</h3>
                                    <p style="color: ${avgROI >= 0 ? '#10b981' : '#ef4444'};">${avgROI}%</p>
                                    <small style="color: #64748b;">Doanh thu: ${formatCurrency(totalRevenue)}</small>
                                </div>
                                <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                            </div>
                            <div class="card">
                                <div class="card-info">
                                    <h3>Conversion Rate</h3>
                                    <p style="color: ${avgConversion >= 15 ? '#10b981' : '#f59e0b'};">${avgConversion}%</p>
                                    <small style="color: #64748b;">${totalConversions}/${totalLeads} leads</small>
                                </div>
                                <div class="card-icon"><i class="fas fa-percentage"></i></div>
                            </div>
                        `;
                    })()}
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin-bottom: 15px;">Chi tiết Hiệu quả từng Chiến dịch</h3>
                <div style="overflow-x: auto;">
                    <table>
                        <thead>
                            <tr>
                                <th>Chiến dịch</th>
                                <th>Ngân sách</th>
                                <th>Chi phí thực tế</th>
                                <th>Doanh thu</th>
                                <th>ROI</th>
                                <th>Leads</th>
                                <th>Conversions</th>
                                <th>Conversion Rate</th>
                                <th>CPC</th>
                                <th>CPL</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DATA.campaigns.filter(c => !c.deleted).map(c => {
                                const actualSpent = c.actualSpent || 0;
                                const revenue = c.revenue || 0;
                                const roi = actualSpent > 0 ? ((revenue - actualSpent) / actualSpent * 100).toFixed(1) : 0;
                                const leads = c.leads || 0;
                                const conversions = c.conversions || 0;
                                const conversionRate = leads > 0 ? ((conversions / leads) * 100).toFixed(1) : 0;
                                const clicks = c.clicks || 0;
                                const cpc = clicks > 0 ? (actualSpent / clicks).toFixed(0) : 0; // Cost per click
                                const cpl = leads > 0 ? (actualSpent / leads).toFixed(0) : 0; // Cost per lead
                                
                                const roiColor = roi >= 0 ? '#10b981' : '#ef4444';
                                const conversionColor = conversionRate >= 15 ? '#10b981' : conversionRate >= 10 ? '#f59e0b' : '#ef4444';
                                const budgetUsage = c.budget > 0 ? ((actualSpent / c.budget) * 100).toFixed(1) : 0;
                                const budgetColor = budgetUsage <= 100 ? '#10b981' : '#ef4444';
                                
                                return `
                                    <tr>
                                        <td><strong>${c.name}</strong></td>
                                        <td>${formatCurrency(c.budget)}</td>
                                        <td>
                                            ${formatCurrency(actualSpent)}
                                            <br><small style="color: ${budgetColor};">${budgetUsage}% ngân sách</small>
                                        </td>
                                        <td><strong>${formatCurrency(revenue)}</strong></td>
                                        <td style="color: ${roiColor}; font-weight: 600; font-size: 16px;">${roi}%</td>
                                        <td>${leads}</td>
                                        <td><strong>${conversions}</strong></td>
                                        <td style="color: ${conversionColor}; font-weight: 600;">${conversionRate}%</td>
                                        <td>${formatCurrency(cpc)}</td>
                                        <td>${formatCurrency(cpl)}</td>
                                        <td>
                                            <button class="btn-view" onclick="viewCampaignAnalytics(${c.id})" style="padding: 6px 12px;">
                                                <i class="fas fa-chart-bar"></i> Phân tích
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
                    <h4 style="margin-bottom: 10px;">Chú thích:</h4>
                    <ul style="margin-left: 20px; color: #64748b; font-size: 14px;">
                        <li><strong>ROI (Return on Investment):</strong> Tỷ suất lợi nhuận = (Doanh thu - Chi phí) / Chi phí × 100%</li>
                        <li><strong>Conversion Rate:</strong> Tỷ lệ chuyển đổi = Số conversions / Số leads × 100%</li>
                        <li><strong>CPC (Cost Per Click):</strong> Chi phí trên mỗi lượt click</li>
                        <li><strong>CPL (Cost Per Lead):</strong> Chi phí để có được 1 lead</li>
                    </ul>
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">So sánh Hiệu quả Chiến dịch</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <h4 style="margin-bottom: 10px;">Top Chiến dịch theo ROI</h4>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                            ${DATA.campaigns.filter(c => !c.deleted)
                                .sort((a, b) => {
                                    const roiA = (a.actualSpent || 0) > 0 ? ((a.revenue || 0) - (a.actualSpent || 0)) / (a.actualSpent || 0) : 0;
                                    const roiB = (b.actualSpent || 0) > 0 ? ((b.revenue || 0) - (b.actualSpent || 0)) / (b.actualSpent || 0) : 0;
                                    return roiB - roiA;
                                })
                                .slice(0, 3)
                                .map((c, index) => {
                                    const roi = (c.actualSpent || 0) > 0 ? (((c.revenue || 0) - (c.actualSpent || 0)) / (c.actualSpent || 0) * 100).toFixed(1) : 0;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    return `
                                        <div style="padding: 10px; background: white; border-radius: 5px; margin-bottom: 10px; border-left: 3px solid ${roi >= 0 ? '#10b981' : '#ef4444'};">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <span style="font-size: 20px; margin-right: 8px;">${medals[index]}</span>
                                                    <strong>${c.name}</strong>
                                                </div>
                                                <span style="color: ${roi >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; font-size: 18px;">${roi}%</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 10px;">Top Chiến dịch theo Conversion Rate</h4>
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                            ${DATA.campaigns.filter(c => !c.deleted)
                                .sort((a, b) => {
                                    const convA = (a.leads || 0) > 0 ? (a.conversions || 0) / (a.leads || 0) : 0;
                                    const convB = (b.leads || 0) > 0 ? (b.conversions || 0) / (b.leads || 0) : 0;
                                    return convB - convA;
                                })
                                .slice(0, 3)
                                .map((c, index) => {
                                    const convRate = (c.leads || 0) > 0 ? ((c.conversions || 0) / (c.leads || 0) * 100).toFixed(1) : 0;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    return `
                                        <div style="padding: 10px; background: white; border-radius: 5px; margin-bottom: 10px; border-left: 3px solid ${convRate >= 15 ? '#10b981' : '#f59e0b'};">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <div>
                                                    <span style="font-size: 20px; margin-right: 8px;">${medals[index]}</span>
                                                    <strong>${c.name}</strong>
                                                </div>
                                                <span style="color: ${convRate >= 15 ? '#10b981' : '#f59e0b'}; font-weight: 600; font-size: 18px;">${convRate}%</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}
    `;
}

function loadInteractions() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Tương tác</h2>
        <div class="table-container">
            <div class="table-header">
                <h3>Danh sách Tương tác</h3>
                <button class="btn-add" onclick="openInteractionModal()">+ Thêm Tương tác</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Loại</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.interactions.map(i => `
                        <tr>
                            <td>${DATA.customers.find(c => c.id === i.customerId)?.name || 'N/A'}</td>
                            <td>${getInteractionTypeLabel(i.type)}</td>
                            <td>${i.content}</td>
                            <td>${i.date}</td>
                            <td>
                                <button class="btn-edit" onclick="editInteraction(${i.id})">Sửa</button>
                                <button class="btn-delete" onclick="deleteInteraction(${i.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadSendMessage() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    const canManageTemplates = user && (user.role === 'manager' || user.role === 'admin');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Thông điệp</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('messages-send')">Gửi Thông điệp</button>
            ${canManageTemplates ? '<button class="tab-btn" onclick="switchTab(\'messages-templates\')">Mẫu Thông điệp</button>' : ''}
        </div>
        
        <!-- Tab Gửi Thông điệp -->
        <div id="messages-send" class="tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <h3>Gửi Thông điệp cho Khách hàng</h3>
                    <button class="btn-add" onclick="openSendMessageModal()">+ Gửi Thông điệp</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Khách hàng</th>
                            <th>Loại</th>
                            <th>Nội dung</th>
                            <th>Ngày gửi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">Chưa có thông điệp nào được gửi</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Tab Mẫu Thông điệp (chỉ cho Manager/Admin) -->
        ${canManageTemplates ? `
        <div id="messages-templates" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh sách Mẫu Thông điệp</h3>
                    <button class="btn-add" onclick="openTemplateModal()">+ Thêm Mẫu</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tên</th>
                            <th>Loại</th>
                            <th>Nội dung</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.messageTemplates.map(t => `
                            <tr>
                                <td>${t.name}</td>
                                <td>${t.type}</td>
                                <td>${t.content.substring(0, 50)}...</td>
                                <td>
                                    <button class="btn-edit" onclick="editTemplate(${t.id})">Sửa</button>
                                    <button class="btn-delete" onclick="deleteTemplate(${t.id})">Xóa</button>
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

function loadProfile() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    
    mainContent.innerHTML = `
        <h2 class="page-title">Hồ sơ Cá nhân</h2>
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <form id="profilePageForm" onsubmit="saveProfilePage(event)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label for="profilePageName">Họ và Tên *</label>
                        <input type="text" id="profilePageName" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="profilePageEmail">Email *</label>
                        <input type="email" id="profilePageEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="profilePagePhone">Số điện thoại</label>
                        <input type="tel" id="profilePagePhone" value="${user.phone || ''}">
                    </div>
                    <div class="form-group">
                        <label for="profilePageDepartment">Phòng ban</label>
                        <input type="text" id="profilePageDepartment" value="${user.department || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePagePosition">Chức vụ</label>
                        <input type="text" id="profilePagePosition" value="${user.position || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageJoinDate">Ngày vào làm</label>
                        <input type="text" id="profilePageJoinDate" value="${user.joinDate || ''}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageManager">Quản lý trực tiếp</label>
                        <input type="text" id="profilePageManager" value="${user.manager || ''}" disabled>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                    <button type="button" class="btn btn-secondary" onclick="openPasswordModal()">Đổi mật khẩu</button>
                </div>
            </form>
        </div>
    `;
}

function saveProfilePage(e) {
    e.preventDefault();
    const updates = {
        name: document.getElementById('profilePageName').value,
        email: document.getElementById('profilePageEmail').value,
        phone: document.getElementById('profilePagePhone').value
    };
    AUTH.updateProfile(updates);
    alert('Cập nhật thông tin cá nhân thành công');
    loadProfile();
}

async function loadProfile() {
    const mainContent = document.getElementById('mainContent');
    let user = AUTH.getCurrentUser();

    mainContent.innerHTML = `
        <h2 class="page-title">Hồ sơ Cá nhân</h2>
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <p style="color: #64748b; margin: 0;">Đang tải thông tin cá nhân...</p>
        </div>
    `;

    if (user && user.authSource === 'api') {
        const result = await AUTH.refreshProfile();
        if (!result.success) {
            mainContent.innerHTML = `
                <h2 class="page-title">Hồ sơ Cá nhân</h2>
                <div style="background: #fee2e2; color: #991b1b; padding: 18px; border-radius: 8px;">
                    ${result.message}
                </div>
            `;
            return;
        }
        user = result.user;
    }

    const esc = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));

    mainContent.innerHTML = `
        <h2 class="page-title">Hồ sơ Cá nhân</h2>
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 900px; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <form id="profilePageForm" onsubmit="saveProfilePage(event)">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label for="profilePageName">Họ và Tên *</label>
                        <input type="text" id="profilePageName" value="${esc(user.name)}" required>
                    </div>
                    <div class="form-group">
                        <label for="profilePageEmail">Email *</label>
                        <input type="email" id="profilePageEmail" value="${esc(user.email)}" required>
                    </div>
                    <div class="form-group">
                        <label for="profilePagePhone">Số điện thoại</label>
                        <input type="tel" id="profilePagePhone" value="${esc(user.phone)}">
                    </div>
                    <div class="form-group">
                        <label for="profilePageDepartment">Phòng ban</label>
                        <input type="text" id="profilePageDepartment" value="${esc(user.department || 'Marketing')}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePagePosition">Chức vụ</label>
                        <input type="text" id="profilePagePosition" value="${esc(user.position)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageRole">Vai trò</label>
                        <input type="text" id="profilePageRole" value="${esc(getRoleLabel(user.role))}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageJoinDate">Ngày vào làm</label>
                        <input type="text" id="profilePageJoinDate" value="${esc(user.joinDate)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageBirthday">Ngày sinh</label>
                        <input type="text" id="profilePageBirthday" value="${esc(user.birthday)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageGender">Giới tính</label>
                        <input type="text" id="profilePageGender" value="${esc(user.gender)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageAddress">Địa chỉ chi tiết</label>
                        <input type="text" id="profilePageAddress" value="${esc(user.address)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageWard">Phường/Xã</label>
                        <input type="text" id="profilePageWard" value="${esc(user.ward)}" disabled>
                    </div>
                    <div class="form-group">
                        <label for="profilePageProvince">Tỉnh/Thành phố</label>
                        <input type="text" id="profilePageProvince" value="${esc(user.province)}" disabled>
                    </div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 25px;">
                    <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                    <button type="button" class="btn btn-secondary" onclick="openPasswordModal()">Đổi mật khẩu</button>
                </div>
            </form>
        </div>
    `;
}

function loadReports() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <h2 class="page-title">Báo cáo & Thống kê</h2>
        <div style="padding: 20px; background: white; border-radius: 8px;">
            <p>Chức năng báo cáo đang được phát triển...</p>
        </div>
    `;
}

function loadTrash() {
    const mainContent = document.getElementById('mainContent');
    
    const deletedCustomers = DATA.customers.filter(c => c.deleted);
    const deletedCampaigns = DATA.campaigns.filter(c => c.deleted);
    
    mainContent.innerHTML = `
        <h2 class="page-title">Thùng rác</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTrashTab('customers')">
                Khách hàng đã xóa (${deletedCustomers.length})
            </button>
            <button class="tab-btn" onclick="switchTrashTab('campaigns')">
                Chiến dịch đã xóa (${deletedCampaigns.length})
            </button>
        </div>
        
        <div id="trashCustomersTab" class="tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <h3>Khách hàng đã xóa</h3>
                    ${deletedCustomers.length > 0 ? `
                        <button class="btn-delete" onclick="emptyTrash('customers')" style="background: #ef4444;">
                            <i class="fas fa-trash-alt"></i> Xóa vĩnh viễn tất cả
                        </button>
                    ` : ''}
                </div>
                
                ${deletedCustomers.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Công ty</th>
                                <th>Trạng thái</th>
                                <th>Ngày xóa</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deletedCustomers.map(c => `
                                <tr style="opacity: 0.7;">
                                    <td><strong>${c.name}</strong></td>
                                    <td>${c.email}</td>
                                    <td>${c.phone}</td>
                                    <td>${c.company}</td>
                                    <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                                    <td>${c.deletedDate || 'N/A'}</td>
                                    <td>
                                        <button class="btn-edit" onclick="restoreCustomer(${c.id})" title="Khôi phục">
                                            <i class="fas fa-undo"></i> Khôi phục
                                        </button>
                                        <button class="btn-delete" onclick="permanentDeleteCustomer(${c.id})" title="Xóa vĩnh viễn">
                                            <i class="fas fa-trash-alt"></i> Xóa vĩnh viễn
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-trash" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>Thùng rác trống</p>
                    </div>
                `}
            </div>
        </div>
        
        <div id="trashCampaignsTab" class="tab-content">
            <div class="table-container">
                <div class="table-header">
                    <h3>Chiến dịch đã xóa</h3>
                    ${deletedCampaigns.length > 0 ? `
                        <button class="btn-delete" onclick="emptyTrash('campaigns')" style="background: #ef4444;">
                            <i class="fas fa-trash-alt"></i> Xóa vĩnh viễn tất cả
                        </button>
                    ` : ''}
                </div>
                
                ${deletedCampaigns.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>Tên chiến dịch</th>
                                <th>Mô tả</th>
                                <th>Ngân sách</th>
                                <th>Thời gian</th>
                                <th>Ngày xóa</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${deletedCampaigns.map(c => `
                                <tr style="opacity: 0.7;">
                                    <td><strong>${c.name}</strong></td>
                                    <td>${c.description}</td>
                                    <td>${formatCurrency(c.budget)}</td>
                                    <td>${c.startDate} - ${c.endDate}</td>
                                    <td>${c.deletedDate || 'N/A'}</td>
                                    <td>
                                        <button class="btn-edit" onclick="restoreCampaign(${c.id})" title="Khôi phục">
                                            <i class="fas fa-undo"></i> Khôi phục
                                        </button>
                                        <button class="btn-delete" onclick="permanentDeleteCampaign(${c.id})" title="Xóa vĩnh viễn">
                                            <i class="fas fa-trash-alt"></i> Xóa vĩnh viễn
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : `
                    <div style="text-align: center; padding: 40px; color: #94a3b8;">
                        <i class="fas fa-trash" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                        <p>Thùng rác trống</p>
                    </div>
                `}
            </div>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
            <p style="color: #92400e; margin: 0;">
                <i class="fas fa-info-circle"></i> 
                <strong>Lưu ý:</strong> Các mục trong thùng rác có thể được khôi phục hoặc xóa vĩnh viễn. 
                Sau khi xóa vĩnh viễn, dữ liệu sẽ không thể khôi phục lại.
            </p>
        </div>
    `;
}

// Switch trash tab
function switchTrashTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    if (tab === 'customers') {
        document.getElementById('trashCustomersTab').classList.add('active');
    } else {
        document.getElementById('trashCampaignsTab').classList.add('active');
    }
}

// Restore customer from trash
function restoreCustomer(customerId) {
    const customer = DATA.customers.find(c => c.id === customerId);
    if (customer && confirm(`Khôi phục khách hàng "${customer.name}"?`)) {
        customer.deleted = false;
        delete customer.deletedDate;
        alert('✓ Đã khôi phục khách hàng thành công!');
        DATA.addAuditLog('RESTORE_CUSTOMER', `Khôi phục khách hàng: ${customer.name}`, AUTH.getCurrentUser().id);
        loadTrash();
    }
}

// Restore campaign from trash
function restoreCampaign(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (campaign && confirm(`Khôi phục chiến dịch "${campaign.name}"?`)) {
        campaign.deleted = false;
        delete campaign.deletedDate;
        alert('✓ Đã khôi phục chiến dịch thành công!');
        DATA.addAuditLog('RESTORE_CAMPAIGN', `Khôi phục chiến dịch: ${campaign.name}`, AUTH.getCurrentUser().id);
        loadTrash();
    }
}

// Permanent delete customer
function permanentDeleteCustomer(customerId) {
    const customer = DATA.customers.find(c => c.id === customerId);
    if (customer && confirm(`⚠️ XÓA VĨNH VIỄN khách hàng "${customer.name}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
        const index = DATA.customers.findIndex(c => c.id === customerId);
        if (index > -1) {
            DATA.customers.splice(index, 1);
            alert('✓ Đã xóa vĩnh viễn khách hàng!');
            DATA.addAuditLog('PERMANENT_DELETE_CUSTOMER', `Xóa vĩnh viễn khách hàng: ${customer.name}`, AUTH.getCurrentUser().id);
            loadTrash();
        }
    }
}

// Permanent delete campaign
function permanentDeleteCampaign(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (campaign && confirm(`⚠️ XÓA VĨNH VIỄN chiến dịch "${campaign.name}"?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
        const index = DATA.campaigns.findIndex(c => c.id === campaignId);
        if (index > -1) {
            DATA.campaigns.splice(index, 1);
            alert('✓ Đã xóa vĩnh viễn chiến dịch!');
            DATA.addAuditLog('PERMANENT_DELETE_CAMPAIGN', `Xóa vĩnh viễn chiến dịch: ${campaign.name}`, AUTH.getCurrentUser().id);
            loadTrash();
        }
    }
}

// Empty trash
function emptyTrash(type) {
    if (type === 'customers') {
        const count = DATA.customers.filter(c => c.deleted).length;
        if (confirm(`⚠️ XÓA VĨNH VIỄN TẤT CẢ ${count} khách hàng trong thùng rác?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
            DATA.customers = DATA.customers.filter(c => !c.deleted);
            alert(`✓ Đã xóa vĩnh viễn ${count} khách hàng!`);
            DATA.addAuditLog('EMPTY_TRASH_CUSTOMERS', `Xóa vĩnh viễn ${count} khách hàng`, AUTH.getCurrentUser().id);
            loadTrash();
        }
    } else if (type === 'campaigns') {
        const count = DATA.campaigns.filter(c => c.deleted).length;
        if (confirm(`⚠️ XÓA VĨNH VIỄN TẤT CẢ ${count} chiến dịch trong thùng rác?\n\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
            DATA.campaigns = DATA.campaigns.filter(c => !c.deleted);
            alert(`✓ Đã xóa vĩnh viễn ${count} chiến dịch!`);
            DATA.addAuditLog('EMPTY_TRASH_CAMPAIGNS', `Xóa vĩnh viễn ${count} chiến dịch`, AUTH.getCurrentUser().id);
            loadTrash();
        }
    }
}

function loadManageEmployees() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Nhân viên</h2>
        <div style="padding: 20px; background: white; border-radius: 8px;">
            <p>Chức năng quản lý nhân viên đang được phát triển...</p>
        </div>
    `;
}

function loadTrialManagement() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Trạng thái Dùng thử</h2>
        <div class="table-container">
            <div class="table-header">
                <h3>Quản lý Khách hàng Dùng thử</h3>
                <button class="btn-add" onclick="openTrialModal()">+ Thêm Dùng thử</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Ngày Bắt đầu</th>
                        <th>Ngày Kết thúc</th>
                        <th>Thời gian Còn lại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.trialCustomers ? DATA.trialCustomers.map(trial => {
                        const endDate = new Date(trial.endDate);
                        const today = new Date();
                        const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                        const status = daysLeft <= 0 ? 'Hết hạn' : daysLeft <= 3 ? 'Sắp hết' : 'Còn hạn';
                        return `
                            <tr>
                                <td>${trial.customerName}</td>
                                <td>${trial.startDate}</td>
                                <td>${trial.endDate}</td>
                                <td>${daysLeft} ngày</td>
                                <td><span class="status ${status.toLowerCase().replace(' ', '-')}">${status}</span></td>
                                <td>
                                    <button class="btn-view" onclick="viewTrialDetail(${trial.id})">Xem</button>
                                    <button class="btn-edit" onclick="editTrial(${trial.id})">Sửa</button>
                                </td>
                            </tr>
                        `;
                    }).join('') : '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #94a3b8;">Chưa có khách hàng dùng thử</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function loadAutomation() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Tự động hóa Marketing</h2>
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('automation-workflow')">Kịch bản Chăm sóc</button>
            <button class="tab-btn" onclick="switchTab('automation-scoring')">Chấm điểm Tiềm năng</button>
        </div>
        
        <div id="automation-workflow" class="tab-content active">
            <div class="table-container">
                <div class="table-header">
                    <h3>Danh sách Kịch bản Chăm sóc</h3>
                    <button class="btn-add" onclick="openWorkflowModal()">+ Tạo Kịch bản</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Tên Kịch bản</th>
                            <th>Điều kiện Kích hoạt</th>
                            <th>Trạng thái</th>
                            <th>Ngày Tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.automationWorkflows.map(workflow => `
                            <tr>
                                <td>${workflow.name}</td>
                                <td>${workflow.trigger}</td>
                                <td><span class="status ${workflow.status}">${workflow.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span></td>
                                <td>${workflow.createdDate}</td>
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
        
        <div id="automation-scoring" class="tab-content">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Quy tắc Chấm điểm</h3>
                        <button class="btn-add" onclick="openScoringRuleModal()">+ Thêm Quy tắc</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Hành động</th>
                                <th>Điểm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DATA.leadScoringRules.map(rule => `
                                <tr>
                                    <td>${rule.action}</td>
                                    <td><strong>+${rule.points}</strong></td>
                                    <td>
                                        <button class="btn-edit" onclick="editScoringRule(${rule.id})" style="padding: 4px 8px; font-size: 11px;">Sửa</button>
                                        <button class="btn-delete" onclick="deleteScoringRule(${rule.id})" style="padding: 4px 8px; font-size: 11px;">Xóa</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h3>Ngưỡng Chuyển đổi</h3>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Điểm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${DATA.leadScoringThresholds.map(threshold => `
                                <tr>
                                    <td><strong>≥ ${threshold.score}</strong></td>
                                    <td>${threshold.action}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function loadSmartReminders() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Nhắc nhở Thông minh</h2>
        <div class="table-container">
            <div class="table-header">
                <h3>Danh sách Lịch hẹn</h3>
                <button class="btn-add" onclick="openAppointmentModal()">+ Tạo Lịch hẹn</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Tiêu đề</th>
                        <th>Loại</th>
                        <th>Ngày/Giờ</th>
                        <th>Nhắc nhở</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.appointments.map(apt => `
                        <tr>
                            <td>${apt.customerName}</td>
                            <td>${apt.title}</td>
                            <td>${apt.type === 'call' ? 'Gọi điện' : apt.type === 'meeting' ? 'Cuộc họp' : apt.type === 'video' ? 'Họp trực tuyến' : 'Email'}</td>
                            <td>${apt.date} ${apt.time}</td>
                            <td>${apt.reminderBefore} phút</td>
                            <td><span class="status ${apt.status}">${apt.status === 'scheduled' ? 'Đã lên lịch' : 'Hoàn thành'}</span></td>
                            <td>
                                <button class="btn-view" onclick="viewAppointment(${apt.id})">Xem</button>
                                <button class="btn-edit" onclick="editAppointment(${apt.id})">Sửa</button>
                                <button class="btn-delete" onclick="deleteAppointment(${apt.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadMergeDuplicates() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Gộp Dữ liệu Trùng lặp</h2>
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p><i class="fas fa-info-circle"></i> <strong>Thông tin:</strong> Hệ thống phát hiện ${DATA.duplicateCustomers.length} khách hàng có khả năng trùng lặp</p>
        </div>
        <div class="table-container">
            <div class="table-header">
                <h3>Danh sách Khách hàng Trùng lặp</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 20px; padding: 20px;">
                ${DATA.duplicateCustomers.map(dup => `
                    <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; background: #f8fafc;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin-bottom: 10px; color: #0f172a;">Khách hàng 1</h4>
                                <p><strong>Tên:</strong> ${dup.customer1.name}</p>
                                <p><strong>Email:</strong> ${dup.customer1.email}</p>
                                <p><strong>SĐT:</strong> ${dup.customer1.phone}</p>
                            </div>
                            <div>
                                <h4 style="margin-bottom: 10px; color: #0f172a;">Khách hàng 2</h4>
                                <p><strong>Tên:</strong> ${dup.customer2.name}</p>
                                <p><strong>Email:</strong> ${dup.customer2.email}</p>
                                <p><strong>SĐT:</strong> ${dup.customer2.phone}</p>
                            </div>
                        </div>
                        <div style="background: white; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                            <p><strong>Độ tương đồng:</strong> <span style="color: #2B4856; font-weight: 600;">${dup.similarity}%</span></p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn btn-primary" onclick="mergeDuplicateCustomers(${dup.id})">Gộp Khách hàng</button>
                            <button class="btn btn-secondary" onclick="ignoreDuplicate(${dup.id})">Bỏ qua</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function openCustomerModal() {
    // Reset form
    document.getElementById('customerForm').reset();
    
    // Load dropdown nhân viên
    loadEmployeeDropdown('customerAssignedTo', true);
    
    // Set giá trị mặc định
    const currentUser = AUTH.getCurrentUser();
    if (currentUser) {
        document.getElementById('customerAssignedTo').value = currentUser.id;
    }
    
    // Xóa customerId để đánh dấu là thêm mới
    delete document.getElementById('customerModal').dataset.customerId;
    
    // Đổi tiêu đề
    document.getElementById('customerModalTitle').textContent = 'Thêm Khách hàng';
    
    // Hiển thị modal
    document.getElementById('customerModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function populateCustomerDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
    DATA.customers.filter(c => !c.deleted).forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

function populateTemplateDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Chọn mẫu --</option>';
    DATA.messageTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (${template.type})`;
        select.appendChild(option);
    });
}

function openInteractionModal() {
    document.getElementById('interactionModal').style.display = 'block';
    document.body.classList.add('modal-open');
    populateCustomerDropdown('interactionCustomer');
    loadEmployeeDropdown('interactionEmployee', true);
    
    // Set default employee to current user
    const currentUser = AUTH.getCurrentUser();
    if (currentUser) {
        document.getElementById('interactionEmployee').value = currentUser.id;
    }
}

function openCampaignModal() {
    document.getElementById('campaignModal').style.display = 'block';
    document.body.classList.add('modal-open');
    loadEmployeeDropdown('campaignManager', true);
    
    // Set default manager to current user if they are manager/admin
    const currentUser = AUTH.getCurrentUser();
    if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin')) {
        document.getElementById('campaignManager').value = currentUser.id;
    }
}

function openTemplateModal() {
    document.getElementById('templateModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function openSendMessageModal() {
    document.getElementById('sendMessageModal').style.display = 'block';
    document.body.classList.add('modal-open');
    populateCustomerDropdown('messageCustomer');
    populateTemplateDropdown('messageTemplate');
    
    // Add event listener for template selection
    const templateSelect = document.getElementById('messageTemplate');
    templateSelect.addEventListener('change', function() {
        if (this.value) {
            const template = DATA.messageTemplates.find(t => t.id === parseInt(this.value));
            if (template) {
                document.getElementById('messageContent').value = template.content;
                document.getElementById('messageType').value = template.type;
            }
        }
    });
    
    // Add event listener for schedule checkbox
    const scheduleCheckbox = document.getElementById('messageSchedule');
    const scheduleTimeDiv = document.getElementById('scheduleTime');
    scheduleCheckbox.addEventListener('change', function() {
        scheduleTimeDiv.style.display = this.checked ? 'block' : 'none';
    });
}

function openProfileModal() {
    loadPage('profile');
}

function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function openNotifications() {
    const notificationList = document.getElementById('notificationList');
    const unreadCount = DATA.notifications.filter(n => !n.read).length;
    
    notificationList.innerHTML = DATA.notifications.map(n => `
        <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; cursor: pointer; background: ${n.read ? '#fff' : '#f0f9ff'};" onclick="markAsRead(${n.id})">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0f172a;">${n.title}</h4>
                    <p style="margin: 0 0 5px 0; color: #334155; font-size: 14px;">${n.message}</p>
                    <small style="color: #94a3b8;">${n.date}</small>
                </div>
                ${!n.read ? '<span style="background: #2B4856; color: white; padding: 2px 8px; border-radius: 50%; font-size: 12px;">Mới</span>' : ''}
            </div>
        </div>
    `).join('');
    
    document.getElementById('notificationModal').style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Cập nhật badge
    document.getElementById('notificationBadge').textContent = unreadCount;
}

function markAsRead(notificationId) {
    const notification = DATA.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        openNotifications();
    }
}

function openCustomerDetailModal(customerId) {
    const customer = DATA.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    document.getElementById('detailName').textContent = customer.name;
    document.getElementById('detailEmail').textContent = customer.email;
    document.getElementById('detailPhone').textContent = customer.phone;
    document.getElementById('detailCompany').textContent = customer.company;
    document.getElementById('detailStatus').textContent = getStatusLabel(customer.status);
    document.getElementById('detailSource').textContent = customer.source;
    document.getElementById('detailIndustry').textContent = customer.industry;
    document.getElementById('detailScore').textContent = customer.score;
    document.getElementById('detailCreatedDate').textContent = customer.createdDate;
    document.getElementById('detailLastInteraction').textContent = customer.lastInteraction;
    
    // Populate tương tác
    const interactions = DATA.interactions.filter(i => i.customerId === customerId);
    const interactionsTable = document.getElementById('detailInteractionsTable');
    interactionsTable.innerHTML = interactions.map(i => `
        <tr>
            <td>${getInteractionTypeLabel(i.type)}</td>
            <td>${i.content}</td>
            <td>${i.date}</td>
            <td>${i.notes}</td>
        </tr>
    `).join('');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('detailInteractionDate').value = today;
    
    // Store customerId for saving interaction
    document.getElementById('customerDetailModal').dataset.customerId = customerId;
    
    document.getElementById('customerDetailModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function openAutomationModal() {
    document.getElementById('automationModal').style.display = 'block';
}

function openTrialModal() {
    document.getElementById('trialModal').style.display = 'block';
}

function openMergeModal() {
    document.getElementById('mergeModal').style.display = 'block';
}

function openAssignModal() {
    document.getElementById('assignModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.classList.remove('modal-open');
}

// ============================================
// FILE UPLOAD FUNCTIONS
// ============================================

function updateFileName(input, displayId) {
    const label = input.nextElementSibling;
    const display = document.getElementById(displayId);
    
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        const fileName = file.name;
        const fileSize = (file.size / 1024 / 1024).toFixed(2); // MB
        
        display.innerHTML = `<i class="fas fa-file-alt"></i> ${fileName} (${fileSize} MB)`;
        label.classList.add('has-file');
    } else {
        display.textContent = 'Chọn file hoặc kéo thả vào đây';
        label.classList.remove('has-file');
    }
}

// Setup drag and drop for file inputs
function setupFileUploadDragDrop() {
    const fileLabels = document.querySelectorAll('.file-upload-label');
    
    fileLabels.forEach(label => {
        const input = label.previousElementSibling;
        
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            label.addEventListener(eventName, () => {
                label.classList.add('drag-over');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            label.addEventListener(eventName, () => {
                label.classList.remove('drag-over');
            }, false);
        });
        
        // Handle dropped files
        label.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (input && files.length > 0) {
                input.files = files;
                const displayId = label.querySelector('span').id;
                updateFileName(input, displayId);
            }
        }, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Call setup when modals are opened
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupFileUploadDragDrop();
    }, 1000);
});

function viewCustomer(id) {
    openCustomerDetailModal(id);
}

function editCustomer(id) {
    updateCustomer(id);
}

function editInteraction(id) {
    updateInteraction(id);
}

function deleteInteraction(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const index = DATA.interactions.findIndex(i => i.id === id);
        if (index > -1) DATA.interactions.splice(index, 1);
        loadInteractions();
    }
}

function editTemplate(id) {
    alert('Sửa mẫu ' + id);
}

function deleteTemplate(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const index = DATA.messageTemplates.findIndex(t => t.id === id);
        if (index > -1) DATA.messageTemplates.splice(index, 1);
        loadTemplates();
    }
}

function logout() {
    AUTH.logout();
    window.location.href = 'login.html';
}

function saveProfile(e) {
    e.preventDefault();
    const updates = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        department: document.getElementById('profileDepartment').value
    };
    AUTH.updateProfile(updates);
    alert('Cập nhật thông tin cá nhân thành công');
    closeModal('profileModal');
}

function changePassword(e) {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới không khớp');
        return;
    }
    
    const result = AUTH.changePassword(oldPassword, newPassword);
    alert(result.message);
    if (result.success) {
        closeModal('passwordModal');
    }
}

function updateCustomer(customerId) {
    const customer = DATA.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerEmail').value = customer.email;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerCompany').value = customer.company;
    document.getElementById('customerStatus').value = customer.status;
    document.getElementById('customerSource').value = customer.source;
    document.getElementById('customerIndustry').value = customer.industry;
    
    document.getElementById('customerModalTitle').textContent = 'Cập nhật Khách hàng';
    document.getElementById('customerModal').dataset.customerId = customerId;
    document.getElementById('customerModal').style.display = 'block';
}

function saveCustomer(e) {
    e.preventDefault();
    const customerId = document.getElementById('customerModal').dataset.customerId;
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        company: document.getElementById('customerCompany').value,
        status: document.getElementById('customerStatus').value,
        source: document.getElementById('customerSource').value,
        industry: document.getElementById('customerIndustry').value,
        assignedTo: parseInt(document.getElementById('customerAssignedTo').value) || null,
        trialStartDate: document.getElementById('customerTrialStartDate').value || null,
        trialDays: parseInt(document.getElementById('customerTrialDays').value) || 0,
        updatedDate: now
    };
    
    if (customerId) {
        // Cập nhật
        const customer = DATA.customers.find(c => c.id === parseInt(customerId));
        if (customer) {
            Object.assign(customer, customerData);
            alert('✓ Cập nhật khách hàng thành công!');
            DATA.addAuditLog('UPDATE_CUSTOMER', `Cập nhật khách hàng: ${customerData.name}`, currentUser.id);
        }
    } else {
        // Thêm mới
        const newId = Math.max(...DATA.customers.map(c => c.id), 0) + 1;
        DATA.customers.push({
            id: newId,
            ...customerData,
            score: 0,
            createdDate: now,
            lastInteraction: '',
            deleted: false
        });
        alert('✓ Thêm khách hàng thành công!');
        DATA.addAuditLog('ADD_CUSTOMER', `Thêm khách hàng: ${customerData.name}`, currentUser.id);
    }
    
    closeModal('customerModal');
    loadCustomers();
}

function updateInteraction(interactionId) {
    const interaction = DATA.interactions.find(i => i.id === interactionId);
    if (!interaction) return;
    
    populateCustomerDropdown('interactionCustomer');
    loadEmployeeDropdown('interactionEmployee', true);
    
    document.getElementById('interactionCustomer').value = interaction.customerId;
    document.getElementById('interactionEmployee').value = interaction.employeeId || '';
    document.getElementById('interactionType').value = interaction.type;
    document.getElementById('interactionContent').value = interaction.content;
    document.getElementById('interactionNotes').value = interaction.notes || '';
    
    document.getElementById('interactionModal').dataset.interactionId = interactionId;
    document.getElementById('interactionModal').style.display = 'block';
}

function saveInteraction(e) {
    e.preventDefault();
    const interactionId = document.getElementById('interactionModal').dataset.interactionId;
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const interactionData = {
        customerId: parseInt(document.getElementById('interactionCustomer').value),
        employeeId: parseInt(document.getElementById('interactionEmployee').value) || null,
        type: document.getElementById('interactionType').value,
        content: document.getElementById('interactionContent').value,
        notes: document.getElementById('interactionNotes').value,
        updatedDate: now
    };
    
    if (interactionId) {
        // Cập nhật
        const interaction = DATA.interactions.find(i => i.id === parseInt(interactionId));
        if (interaction) {
            Object.assign(interaction, interactionData);
            alert('✓ Cập nhật tương tác thành công!');
            DATA.addAuditLog('UPDATE_INTERACTION', `Cập nhật tương tác: ${interactionData.content}`, currentUser.id);
        }
    } else {
        // Thêm mới
        const newId = Math.max(...DATA.interactions.map(i => i.id), 0) + 1;
        DATA.interactions.push({
            id: newId,
            ...interactionData,
            date: now,
            file: null
        });
        alert('✓ Thêm tương tác thành công!');
        DATA.addAuditLog('ADD_INTERACTION', `Thêm tương tác: ${interactionData.content}`, currentUser.id);
    }
    
    closeModal('interactionModal');
    loadInteractions();
}

function getStatusLabel(status) {
    const labels = {
        'suspect': 'Người truy cập',
        'lead': 'Khách hàng tiềm năng mới',
        'prospect': 'Khách hàng triển vọng',
        'customer': 'Khách hàng chính thức',
        'evangelist': 'Khách hàng trung thành'
    };
    return labels[status] || status;
}

function getInteractionTypeLabel(type) {
    const labels = {
        'call': 'Gọi điện',
        'email': 'Email',
        'meeting': 'Cuộc họp',
        'message': 'Tin nhắn'
    };
    return labels[type] || type;
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Helper: Load danh sách nhân viên vào dropdown
function loadEmployeeDropdown(selectId, includeEmpty = true) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    let html = includeEmpty ? '<option value="">-- Chọn nhân viên --</option>' : '';
    
    if (typeof AUTH !== 'undefined' && AUTH.users) {
        AUTH.users.forEach(user => {
            html += `<option value="${user.id}">${user.name} (${user.position || user.role})</option>`;
        });
    }
    
    select.innerHTML = html;
}


function editCampaign(id) {
    const campaign = DATA.campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    document.getElementById('campaignName').value = campaign.name;
    document.getElementById('campaignDescription').value = campaign.description || '';
    document.getElementById('campaignType').value = campaign.type || '';
    document.getElementById('campaignStartDate').value = campaign.startDate;
    document.getElementById('campaignEndDate').value = campaign.endDate;
    document.getElementById('campaignBudget').value = campaign.budget;
    document.getElementById('campaignStatus').value = campaign.status;
    
    // Load employee dropdown and set manager
    loadEmployeeDropdown('campaignManager', true);
    if (campaign.managerId) {
        document.getElementById('campaignManager').value = campaign.managerId;
    }
    
    document.getElementById('campaignModalTitle').textContent = 'Cập nhật Chiến dịch';
    document.getElementById('campaignModal').dataset.campaignId = id;
    document.getElementById('campaignModal').style.display = 'block';
}

function viewCampaign(id) {
    viewCampaignDetail(id);
}

function viewCampaignDetail(id) {
    console.log('viewCampaignDetail called with id:', id);
    const campaign = DATA.campaigns.find(c => c.id === id);
    if (!campaign) return;
    
    const user = AUTH.getCurrentUser();
    const isManagerOrAdmin = user && (user.role === 'manager' || user.role === 'admin');
    console.log('User role:', user?.role, 'isManagerOrAdmin:', isManagerOrAdmin);
    
    // Tính toán metrics
    const actualSpent = campaign.actualSpent || 0;
    const revenue = campaign.revenue || 0;
    const roi = actualSpent > 0 ? (((revenue - actualSpent) / actualSpent) * 100).toFixed(1) : 0;
    const conversionRate = campaign.leads > 0 ? ((campaign.conversions || 0) / campaign.leads * 100).toFixed(1) : 0;
    const ctr = campaign.impressions > 0 ? ((campaign.clicks || 0) / campaign.impressions * 100).toFixed(2) : 0;
    const cpl = campaign.leads > 0 ? (actualSpent / campaign.leads).toFixed(0) : 0;
    
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button onclick="loadCampaigns()" style="background: none; border: none; color: #2B4856; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 5px;">
                <i class="fas fa-arrow-left"></i> Quay lại danh sách
            </button>
        </div>
        
        <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2B4856 0%, #3d5a6b 100%); padding: 30px; color: white;">
                <h1 style="margin: 0 0 10px 0; font-size: 28px;">${campaign.name}</h1>
                <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                    <span style="background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 14px;">
                        <i class="fas fa-calendar"></i> ${campaign.startDate} - ${campaign.endDate}
                    </span>
                    <span class="status ${campaign.status}" style="background: rgba(255,255,255,0.9); color: #2B4856;">
                        ${getStatusLabel(campaign.status)}
                    </span>
                </div>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
                ${isManagerOrAdmin ? `
                    <!-- Tabs cho Manager -->
                    <div class="tabs" style="margin-bottom: 25px;">
                        <button class="tab-btn active" onclick="switchTab('campaign-info')">Thông tin & Kế hoạch</button>
                        <button class="tab-btn" onclick="switchTab('campaign-analytics')">Phân tích & Kết quả</button>
                    </div>
                ` : ''}
                
                <!-- Tab 1: Thông tin & Kế hoạch (Cả Employee và Manager đều thấy) -->
                <div id="campaign-info" class="tab-content active">
                    <h3 style="margin-bottom: 20px; color: #2B4856; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-info-circle"></i> Thông tin Chiến dịch
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2B4856;">
                            <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Ngân sách</div>
                            <div style="font-size: 24px; font-weight: 700; color: #2B4856;">${formatCurrency(campaign.budget)}</div>
                        </div>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Thời gian</div>
                            <div style="font-size: 16px; font-weight: 600; color: #334155;">
                                ${campaign.startDate} → ${campaign.endDate}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h4 style="margin: 0 0 10px 0; color: #92400e; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-lightbulb"></i> Mô tả Chiến dịch
                        </h4>
                        <p style="margin: 0; color: #78350f; line-height: 1.6;">
                            ${campaign.description || 'Chưa có mô tả chi tiết cho chiến dịch này.'}
                        </p>
                    </div>
                    
                    <h4 style="margin-bottom: 15px; color: #2B4856; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-tasks"></i> Kế hoạch Triển khai
                    </h4>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="display: grid; gap: 15px;">
                            <div style="display: flex; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #2B4856; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">1</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #334155; margin-bottom: 5px;">Chuẩn bị Nội dung</div>
                                    <div style="color: #64748b; font-size: 14px;">Tạo nội dung quảng cáo, thiết kế banner, viết bài đăng</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #3d5a6b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">2</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #334155; margin-bottom: 5px;">Thiết lập Kênh</div>
                                    <div style="color: #64748b; font-size: 14px;">Cấu hình Facebook Ads, Google Ads, Email Marketing</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #4f6f80; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">3</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #334155; margin-bottom: 5px;">Triển khai & Theo dõi</div>
                                    <div style="color: #64748b; font-size: 14px;">Chạy chiến dịch, theo dõi metrics, tối ưu hóa</div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 15px;">
                                <div style="width: 40px; height: 40px; background: #618495; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; flex-shrink: 0;">4</div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #334155; margin-bottom: 5px;">Đánh giá Kết quả</div>
                                    <div style="color: #64748b; font-size: 14px;">Phân tích hiệu quả, báo cáo, rút kinh nghiệm</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h4 style="margin-bottom: 15px; color: #2B4856; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-bullseye"></i> Mục tiêu & Yêu cầu
                    </h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 3px solid #10b981;">
                            <div style="font-weight: 600; color: #166534; margin-bottom: 5px;">
                                <i class="fas fa-users"></i> Mục tiêu Leads
                            </div>
                            <div style="color: #166534; font-size: 14px;">Thu thập tối thiểu ${campaign.leads || 100} leads chất lượng</div>
                        </div>
                        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                            <div style="font-weight: 600; color: #1e40af; margin-bottom: 5px;">
                                <i class="fas fa-chart-line"></i> Mục tiêu Conversion
                            </div>
                            <div style="color: #1e40af; font-size: 14px;">Đạt tỷ lệ chuyển đổi ≥ 15%</div>
                        </div>
                        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 3px solid #f59e0b;">
                            <div style="font-weight: 600; color: #92400e; margin-bottom: 5px;">
                                <i class="fas fa-dollar-sign"></i> Mục tiêu ROI
                            </div>
                            <div style="color: #92400e; font-size: 14px;">ROI tối thiểu 150% (1.5x)</div>
                        </div>
                        <div style="background: #fce7f3; padding: 15px; border-radius: 8px; border-left: 3px solid #ec4899;">
                            <div style="font-weight: 600; color: #9f1239; margin-bottom: 5px;">
                                <i class="fas fa-clock"></i> Thời gian Phản hồi
                            </div>
                            <div style="color: #9f1239; font-size: 14px;">Phản hồi leads trong vòng 24h</div>
                        </div>
                    </div>
                </div>
                
                ${isManagerOrAdmin ? `
                <!-- Tab 2: Phân tích & Kết quả (Chỉ Manager thấy) -->
                <div id="campaign-analytics" class="tab-content">
                    <h3 style="margin-bottom: 20px; color: #2B4856; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-chart-bar"></i> Phân tích Hiệu quả
                    </h3>
                    
                    <!-- Metrics Cards -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 20px; border-radius: 8px; color: white;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Chi phí Thực tế</div>
                            <div style="font-size: 24px; font-weight: 700;">${formatCurrency(actualSpent)}</div>
                            <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
                                ${((actualSpent / campaign.budget) * 100).toFixed(0)}% ngân sách
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 8px; color: white;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Doanh thu</div>
                            <div style="font-size: 24px; font-weight: 700;">${formatCurrency(revenue)}</div>
                            <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
                                ROI: ${roi}%
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 20px; border-radius: 8px; color: white;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Leads</div>
                            <div style="font-size: 24px; font-weight: 700;">${campaign.leads || 0}</div>
                            <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
                                CPL: ${formatCurrency(cpl)}
                            </div>
                        </div>
                        <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 20px; border-radius: 8px; color: white;">
                            <div style="font-size: 13px; opacity: 0.9; margin-bottom: 8px;">Conversions</div>
                            <div style="font-size: 24px; font-weight: 700;">${campaign.conversions || 0}</div>
                            <div style="font-size: 11px; opacity: 0.8; margin-top: 5px;">
                                Rate: ${conversionRate}%
                            </div>
                        </div>
                    </div>
                    
                    <!-- Performance Analysis -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h4 style="margin-bottom: 15px; color: #334155;">Hiệu suất Quảng cáo</h4>
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                    <span style="color: #64748b;">Impressions</span>
                                    <strong style="color: #334155;">${(campaign.impressions || 0).toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                    <span style="color: #64748b;">Clicks</span>
                                    <strong style="color: #334155;">${(campaign.clicks || 0).toLocaleString()}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                    <span style="color: #64748b;">CTR</span>
                                    <strong style="color: ${ctr >= 2 ? '#10b981' : '#f59e0b'};">${ctr}%</strong>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                            <h4 style="margin-bottom: 15px; color: #334155;">Đánh giá Tổng quan</h4>
                            <div style="display: grid; gap: 12px;">
                                <div style="padding: 10px; background: ${roi >= 100 ? '#dcfce7' : '#fee2e2'}; border-radius: 5px; border-left: 3px solid ${roi >= 100 ? '#10b981' : '#ef4444'};">
                                    <div style="font-size: 12px; color: ${roi >= 100 ? '#166534' : '#991b1b'}; margin-bottom: 3px;">ROI</div>
                                    <div style="font-weight: 600; color: ${roi >= 100 ? '#166534' : '#991b1b'};">
                                        ${roi >= 100 ? '✓ Đạt mục tiêu' : '✗ Chưa đạt mục tiêu'} (${roi}%)
                                    </div>
                                </div>
                                <div style="padding: 10px; background: ${conversionRate >= 15 ? '#dcfce7' : '#fee2e2'}; border-radius: 5px; border-left: 3px solid ${conversionRate >= 15 ? '#10b981' : '#ef4444'};">
                                    <div style="font-size: 12px; color: ${conversionRate >= 15 ? '#166534' : '#991b1b'}; margin-bottom: 3px;">Conversion Rate</div>
                                    <div style="font-weight: 600; color: ${conversionRate >= 15 ? '#166534' : '#991b1b'};">
                                        ${conversionRate >= 15 ? '✓ Đạt mục tiêu' : '✗ Chưa đạt mục tiêu'} (${conversionRate}%)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Recommendations -->
                    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
                        <h4 style="margin: 0 0 15px 0; color: #1e40af; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-lightbulb"></i> Đề xuất Tối ưu
                        </h4>
                        <ul style="margin: 0; padding-left: 20px; color: #1e40af; line-height: 1.8;">
                            ${roi < 100 ? '<li>Cần tối ưu chi phí hoặc tăng doanh thu để đạt ROI mục tiêu</li>' : ''}
                            ${conversionRate < 15 ? '<li>Cải thiện landing page và quy trình chuyển đổi</li>' : ''}
                            ${ctr < 2 ? '<li>Tối ưu nội dung quảng cáo để tăng CTR</li>' : ''}
                            ${roi >= 100 && conversionRate >= 15 ? '<li>Chiến dịch đang hoạt động tốt, có thể tăng ngân sách để scale</li>' : ''}
                        </ul>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function switchTab(tabId) {
    // Ẩn tất cả tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Bỏ active khỏi tất cả tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Hiển thị tab được chọn
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Active button tương ứng
    event.target.classList.add('active');
}

function viewCampaignAnalytics(id) {
    // Gọi hàm viewCampaignDetail để hiển thị giao diện mới
    viewCampaignDetail(id);
}

function deleteCampaign(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const campaign = DATA.campaigns.find(c => c.id === id);
        if (campaign) campaign.deleted = true;
        loadCampaigns();
    }
}

function deleteCustomer(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const customer = DATA.customers.find(c => c.id === id);
        if (customer) customer.deleted = true;
        loadCustomers();
    }
}

function requestDeleteCustomer(customerId) {
    const customer = DATA.customers.find(c => c.id === customerId);
    if (!customer) return;
    
    document.getElementById('requestDeleteCustomerName').textContent = customer.name;
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
    DATA.deleteRequests.push({
        id: newId,
        customerId: customerId,
        customerName: DATA.customers.find(c => c.id === customerId)?.name,
        reason: reason,
        requestedBy: user.name,
        requestedDate: new Date().toLocaleDateString('vi-VN'),
        status: 'pending'
    });
    
    alert('Đề nghị xóa khách hàng đã được gửi. Trưởng phòng sẽ duyệt.');
    closeModal('requestDeleteModal');
    loadCustomers();
}

function approveDeleteRequest(requestId) {
    const request = DATA.deleteRequests.find(r => r.id === requestId);
    if (!request) return;
    
    if (confirm(`Bạn có chắc muốn duyệt xóa khách hàng "${request.customerName}"?\n\nKhách hàng sẽ được chuyển vào Thùng rác.\nLý do: ${request.reason}`)) {
        // Update request status
        request.status = 'approved';
        request.approvedBy = AUTH.getCurrentUser().name;
        request.approvedDate = new Date().toLocaleDateString('vi-VN');
        
        // Move customer to trash (soft delete)
        const customer = DATA.customers.find(c => c.id === request.customerId);
        if (customer) {
            customer.deleted = true;
            customer.deletedDate = new Date().toLocaleDateString('vi-VN');
            customer.deletedBy = AUTH.getCurrentUser().name;
            customer.deleteReason = request.reason;
        }
        
        alert('✓ Đã duyệt và chuyển khách hàng vào Thùng rác!\n\nBạn có thể khôi phục hoặc xóa vĩnh viễn trong menu "Thùng rác".');
        DATA.addAuditLog('APPROVE_DELETE_REQUEST', `Duyệt xóa khách hàng: ${request.customerName}`, AUTH.getCurrentUser().id);
        loadCustomers();
    }
}

function rejectDeleteRequest(requestId) {
    const request = DATA.deleteRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const rejectReason = prompt(`Nhập lý do từ chối xóa khách hàng "${request.customerName}":`);
    if (rejectReason) {
        request.status = 'rejected';
        request.rejectedBy = AUTH.getCurrentUser().name;
        request.rejectedDate = new Date().toLocaleDateString('vi-VN');
        request.rejectReason = rejectReason;
        
        alert('✓ Đã từ chối đề nghị xóa khách hàng');
        DATA.addAuditLog('REJECT_DELETE_REQUEST', `Từ chối xóa khách hàng: ${request.customerName}`, AUTH.getCurrentUser().id);
        loadCustomers();
    }
}

function viewDeleteRequest(requestId) {
    const request = DATA.deleteRequests.find(r => r.id === requestId);
    if (!request) return;
    
    const statusLabels = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Đã từ chối'
    };
    
    let message = `Chi tiết Đề nghị Xóa Khách hàng\n\n`;
    message += `Khách hàng: ${request.customerName}\n`;
    message += `Người đề nghị: ${request.requestedBy}\n`;
    message += `Ngày đề nghị: ${request.requestedDate}\n`;
    message += `Lý do: ${request.reason}\n`;
    message += `Trạng thái: ${statusLabels[request.status]}\n`;
    
    if (request.status === 'approved') {
        message += `\nNgười duyệt: ${request.approvedBy}\n`;
        message += `Ngày duyệt: ${request.approvedDate}`;
    } else if (request.status === 'rejected') {
        message += `\nNgười từ chối: ${request.rejectedBy}\n`;
        message += `Ngày từ chối: ${request.rejectedDate}\n`;
        message += `Lý do từ chối: ${request.rejectReason}`;
    }
    
    alert(message);
}

function updateAssignMethodUI() {
    const method = document.getElementById('assignMethod').value;
    const roundRobinSettings = document.getElementById('assignRoundRobinSettings');
    const ratioSettings = document.getElementById('assignRatioSettings');
    
    if (method === 'round_robin') {
        roundRobinSettings.style.display = 'block';
        ratioSettings.style.display = 'none';
    } else if (method === 'ratio') {
        roundRobinSettings.style.display = 'none';
        ratioSettings.style.display = 'block';
    } else {
        roundRobinSettings.style.display = 'none';
        ratioSettings.style.display = 'none';
    }
}

function saveAssignSettings() {
    const method = document.getElementById('assignMethod').value;
    DATA.assignmentConfig.method = method;
    
    // Lưu tỷ lệ nếu là phương pháp ratio
    if (method === 'ratio') {
        const ratioInputs = document.querySelectorAll('#assignRatioSettings input[type="number"]');
        let totalRatio = 0;
        ratioInputs.forEach((input, index) => {
            const ratio = parseInt(input.value) || 0;
            DATA.assignmentConfig.employees[index].ratio = ratio;
            totalRatio += ratio;
        });
        
        if (totalRatio !== 100) {
            alert('Tổng tỷ lệ phải bằng 100%!');
            return;
        }
    }
    
    // Lưu trạng thái online cho round robin
    if (method === 'round_robin') {
        const checkboxes = document.querySelectorAll('#assignRoundRobinSettings input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            DATA.assignmentConfig.employees[index].online = checkbox.checked;
        });
    }
    
    alert(`✓ Đã lưu cài đặt phân bổ: ${method === 'round_robin' ? 'Xoay vòng chia đều' : method === 'ratio' ? 'Chia theo tỷ lệ' : 'Thủ công'}`);
    DATA.addAuditLog('UPDATE_ASSIGNMENT_CONFIG', `Cập nhật cấu hình phân bổ: ${method}`, AUTH.getCurrentUser().id);
}

function testAssignRule() {
    const method = DATA.assignmentConfig.method;
    const testCustomer = { id: 999, name: 'Khách hàng Test', email: 'test@example.com' };
    
    const assignedEmployee = autoAssignCustomer(testCustomer);
    
    if (assignedEmployee) {
        alert(`✓ Test thành công!\n\nKhách hàng "${testCustomer.name}" sẽ được phân cho:\n${assignedEmployee.name}\n\nPhương pháp: ${method === 'round_robin' ? 'Xoay vòng chia đều' : method === 'ratio' ? 'Chia theo tỷ lệ' : 'Thủ công'}`);
    } else {
        alert('⚠ Không có nhân viên nào khả dụng để phân bổ!');
    }
}

// Hàm phân bổ tự động khách hàng
function autoAssignCustomer(customer) {
    const config = DATA.assignmentConfig;
    let assignedEmployee = null;
    
    if (config.method === 'round_robin') {
        // Lấy danh sách nhân viên online
        const onlineEmployees = config.employees.filter(e => e.online);
        if (onlineEmployees.length === 0) return null;
        
        // Xoay vòng
        assignedEmployee = onlineEmployees[config.roundRobinIndex % onlineEmployees.length];
        config.roundRobinIndex++;
        
    } else if (config.method === 'ratio') {
        // Tính tổng số khách hàng đã phân
        const totalAssigned = config.employees.reduce((sum, e) => sum + e.assignedCount, 0);
        
        // Tìm nhân viên cần thêm khách hàng để đạt tỷ lệ
        for (let employee of config.employees) {
            if (employee.ratio === 0) continue;
            
            const expectedCount = Math.floor((totalAssigned + 1) * employee.ratio / 100);
            if (employee.assignedCount < expectedCount) {
                assignedEmployee = employee;
                break;
            }
        }
        
        // Nếu không tìm thấy, chọn người có tỷ lệ cao nhất
        if (!assignedEmployee) {
            assignedEmployee = config.employees.reduce((max, e) => 
                e.ratio > max.ratio ? e : max
            );
        }
    }
    
    if (assignedEmployee) {
        assignedEmployee.assignedCount++;
        
        // Lưu lịch sử
        DATA.assignmentHistory.unshift({
            id: DATA.assignmentHistory.length + 1,
            customerId: customer.id,
            customerName: customer.name,
            employeeId: assignedEmployee.id,
            employeeName: assignedEmployee.name,
            method: config.method,
            date: new Date().toLocaleString('vi-VN')
        });
        
        // Gửi thông báo
        sendNotificationToEmployee(assignedEmployee.id, `Khách hàng mới "${customer.name}" đã được phân bổ cho bạn`);
        
        DATA.addAuditLog('AUTO_ASSIGN_CUSTOMER', `Phân bổ khách hàng ${customer.name} cho ${assignedEmployee.name}`, 'system');
    }
    
    return assignedEmployee;
}

// Gửi thông báo cho nhân viên
function sendNotificationToEmployee(employeeId, message) {
    DATA.notifications.unshift({
        id: DATA.notifications.length + 1,
        title: 'Khách hàng mới được phân bổ',
        message: message,
        date: new Date().toLocaleString('vi-VN'),
        read: false
    });
    updateNotificationBadge();
}

function exportCustomersData() {
    const customers = DATA.customers.filter(c => !c.deleted);
    
    // Create CSV content
    let csv = 'Tên,Email,Số điện thoại,Công ty,Trạng thái,Nguồn,Ngành nghề,Điểm Lead,Ngày tạo\n';
    customers.forEach(c => {
        csv += `"${c.name}","${c.email}","${c.phone}","${c.company}","${getStatusLabel(c.status)}","${c.source}","${c.industry}",${c.score},"${c.createdDate}"\n`;
    });
    
    // Create download link
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `khach-hang-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Đã xuất dữ liệu khách hàng thành công!');
}

function assignCustomersToCampaign(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Create modal content
    const modalContent = `
        <h3 style="margin-bottom: 20px;">Chiến dịch: ${campaign.name}</h3>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin-bottom: 15px;">Lọc Khách hàng Mục tiêu</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Cấp độ:</label>
                    <select id="filterStatus" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 5px;">
                        <option value="">Tất cả</option>
                        <option value="suspect">Suspect (Người truy cập)</option>
                        <option value="lead">Lead (KH tiềm năng mới)</option>
                        <option value="prospect">Prospect (KH triển vọng)</option>
                        <option value="customer">Customer (KH chính thức)</option>
                        <option value="evangelist">Evangelist (KH trung thành)</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nguồn:</label>
                    <select id="filterSource" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 5px;">
                        <option value="">Tất cả</option>
                        <option value="facebook">Facebook</option>
                        <option value="google">Google</option>
                        <option value="direct">Trực tiếp</option>
                        <option value="referral">Giới thiệu</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Điểm Lead tối thiểu:</label>
                    <input type="number" id="filterScore" value="0" min="0" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 5px;">
                </div>
                <div style="display: flex; align-items: end;">
                    <button class="btn btn-primary" onclick="applyCustomerFilter()" style="width: 100%;">
                        <i class="fas fa-filter"></i> Áp dụng Lọc
                    </button>
                </div>
            </div>
        </div>
        
        <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; max-height: 400px; overflow-y: auto;">
            <table style="width: 100%;">
                <thead style="position: sticky; top: 0; background: #f8fafc;">
                    <tr>
                        <th style="padding: 12px; text-align: left;">
                            <input type="checkbox" id="selectAllCustomers" onchange="toggleAllCustomers(this)">
                        </th>
                        <th style="padding: 12px; text-align: left;">Tên</th>
                        <th style="padding: 12px; text-align: left;">Email</th>
                        <th style="padding: 12px; text-align: left;">Trạng thái</th>
                        <th style="padding: 12px; text-align: left;">Điểm</th>
                    </tr>
                </thead>
                <tbody id="customerListForCampaign">
                    ${DATA.customers.filter(c => !c.deleted).map(c => `
                        <tr>
                            <td style="padding: 12px;"><input type="checkbox" value="${c.id}" onchange="updateSelectedCount()"></td>
                            <td style="padding: 12px;">${c.name}</td>
                            <td style="padding: 12px;">${c.email}</td>
                            <td style="padding: 12px;"><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                            <td style="padding: 12px;">${c.score}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
            <div style="color: #64748b;">
                <span id="selectedCount">0</span> khách hàng được chọn
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="closeModal('assignCustomersModal')">Hủy</button>
                <button class="btn btn-primary" onclick="confirmAssignCustomers(${campaignId})">
                    <i class="fas fa-check"></i> Xác nhận Gán
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('assignCustomersContent').innerHTML = modalContent;
    document.getElementById('assignCustomersModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveCampaign(e) {
    e.preventDefault();
    const campaignId = document.getElementById('campaignModal').dataset.campaignId;
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const campaignData = {
        name: document.getElementById('campaignName').value,
        description: document.getElementById('campaignDescription').value,
        type: document.getElementById('campaignType').value,
        managerId: parseInt(document.getElementById('campaignManager').value) || null,
        startDate: document.getElementById('campaignStartDate').value,
        endDate: document.getElementById('campaignEndDate').value,
        budget: parseInt(document.getElementById('campaignBudget').value),
        status: document.getElementById('campaignStatus').value,
        updatedDate: now
    };
    
    if (campaignId) {
        // Cập nhật
        const campaign = DATA.campaigns.find(c => c.id === parseInt(campaignId));
        if (campaign) {
            Object.assign(campaign, campaignData);
            alert('✓ Cập nhật chiến dịch thành công!');
            DATA.addAuditLog('UPDATE_CAMPAIGN', `Cập nhật chiến dịch: ${campaignData.name}`, currentUser.id);
        }
    } else {
        // Thêm mới
        const newId = Math.max(...DATA.campaigns.map(c => c.id), 0) + 1;
        DATA.campaigns.push({
            id: newId,
            ...campaignData,
            createdDate: now,
            deleted: false,
            // Khởi tạo các chỉ số mặc định
            actualSpent: 0,
            revenue: 0,
            leads: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
            costBreakdown: {
                advertising: 0,
                content: 0,
                tools: 0,
                other: 0
            }
        });
        alert('✓ Thêm chiến dịch thành công!');
        DATA.addAuditLog('ADD_CAMPAIGN', `Thêm chiến dịch: ${campaignData.name}`, currentUser.id);
    }
    
    closeModal('campaignModal');
    loadCampaigns();
}

function saveTemplate(e) {
    e.preventDefault();
    const templateId = document.getElementById('templateModal').dataset.templateId;
    
    if (templateId) {
        // Cập nhật
        const template = DATA.messageTemplates.find(t => t.id === parseInt(templateId));
        if (template) {
            template.name = document.getElementById('templateName').value;
            template.type = document.getElementById('templateType').value;
            template.content = document.getElementById('templateContent').value;
            alert('Cập nhật mẫu thành công');
        }
    } else {
        // Thêm mới
        const newId = Math.max(...DATA.messageTemplates.map(t => t.id), 0) + 1;
        DATA.messageTemplates.push({
            id: newId,
            name: document.getElementById('templateName').value,
            type: document.getElementById('templateType').value,
            content: document.getElementById('templateContent').value
        });
        alert('Thêm mẫu thành công');
    }
    
    closeModal('templateModal');
    loadTemplates();
}

function saveDetailInteraction(e) {
    e.preventDefault();
    const customerId = parseInt(document.getElementById('customerDetailModal').dataset.customerId);
    
    const newId = Math.max(...DATA.interactions.map(i => i.id), 0) + 1;
    DATA.interactions.push({
        id: newId,
        customerId: customerId,
        type: document.getElementById('detailInteractionType').value,
        content: document.getElementById('detailInteractionContent').value,
        notes: document.getElementById('detailInteractionNotes').value,
        date: document.getElementById('detailInteractionDate').value,
        file: null
    });
    
    alert('Thêm tương tác thành công');
    
    // Reset form
    document.getElementById('detailInteractionForm').reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('detailInteractionDate').value = today;
    
    // Reload detail modal
    openCustomerDetailModal(customerId);
}

function restoreCustomer(id) {
    const customer = DATA.customers.find(c => c.id === id);
    if (customer) {
        customer.deleted = false;
        alert('Khôi phục khách hàng thành công');
        loadTrash();
    }
}

function restoreCampaign(id) {
    const campaign = DATA.campaigns.find(c => c.id === id);
    if (campaign) {
        campaign.deleted = false;
        alert('Khôi phục chiến dịch thành công');
        loadTrash();
    }
}

function exportCustomers() {
    const customers = DATA.customers.filter(c => !c.deleted);
    const csv = 'Tên,Email,Số điện thoại,Công ty,Trạng thái\n' + 
        customers.map(c => `${c.name},${c.email},${c.phone},${c.company},${c.status}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers.csv';
    a.click();
}

function exportReport(id) {
    alert('Xuất báo cáo thành công');
}

function showNotifications() {
    openNotifications();
}

function changeCategoryCustomer(customerId, newStatus) {
    if (!newStatus) return;
    
    const customer = DATA.customers.find(c => c.id === customerId);
    if (customer) {
        customer.status = newStatus;
        alert(`Đã chuyển ${customer.name} sang danh mục: ${getStatusLabel(newStatus)}`);
        loadCategorizeCustomers();
    }
}

function openCategoryModal(category) {
    const customers = DATA.customers.filter(c => !c.deleted && c.status === category);
    alert(`Danh mục: ${getStatusLabel(category)}\nSố lượng: ${customers.length} khách hàng`);
}

// ============================================
// LỌC VÀ TÌM KIẾM KHÁCH HÀNG
// ============================================

function applyCustomerFilter() {
    const searchText = document.getElementById('searchCustomerInput').value.toLowerCase().trim();
    const filterStatus = document.getElementById('filterStatus').value;
    const filterSource = document.getElementById('filterSource').value;
    
    let filteredCustomers = DATA.customers.filter(c => !c.deleted);
    
    // Lọc theo tìm kiếm
    if (searchText) {
        filteredCustomers = filteredCustomers.filter(c => 
            c.name.toLowerCase().includes(searchText) ||
            c.email.toLowerCase().includes(searchText) ||
            c.phone.includes(searchText) ||
            c.company.toLowerCase().includes(searchText)
        );
    }
    
    // Lọc theo cấp độ
    if (filterStatus) {
        filteredCustomers = filteredCustomers.filter(c => c.status === filterStatus);
    }
    
    // Lọc theo nguồn
    if (filterSource) {
        filteredCustomers = filteredCustomers.filter(c => c.source === filterSource);
    }
    
    // Cập nhật bảng
    renderCustomersTable(filteredCustomers);
    
    // Cập nhật số lượng
    document.getElementById('totalCustomersCount').textContent = filteredCustomers.length;
}

function resetCustomerFilter() {
    document.getElementById('searchCustomerInput').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterSource').value = '';
    
    const allCustomers = DATA.customers.filter(c => !c.deleted);
    renderCustomersTable(allCustomers);
    document.getElementById('totalCustomersCount').textContent = allCustomers.length;
}

function renderCustomersTable(customers) {
    const user = AUTH.getCurrentUser();
    const canEdit = true;
    const canDelete = user && user.role !== 'employee';
    
    const tbody = document.getElementById('customersTable');
    if (!tbody) return;
    
    tbody.innerHTML = customers.map(c => {
        let actionButtons = `<button class="btn-view" onclick="viewCustomer(${c.id})">Xem</button>`;
        actionButtons += `<button class="btn-edit" onclick="editCustomer(${c.id})">Sửa</button>`;
        if (canDelete) {
            actionButtons += `<button class="btn-delete" onclick="deleteCustomer(${c.id})">Xóa</button>`;
        } else {
            actionButtons += `<button class="btn-delete" onclick="requestDeleteCustomer(${c.id})">Đề nghị Xóa</button>`;
        }
        return `
            <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.company}</td>
                <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                <td>
                    ${actionButtons}
                </td>
            </tr>
        `;
    }).join('');
    
    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 15px; display: block;"></i>
                    Không tìm thấy khách hàng nào
                </td>
            </tr>
        `;
    }
}

function openWorkflowModal() {
    document.getElementById('workflowModalTitle').textContent = 'Tạo Kịch bản Chăm sóc';
    document.getElementById('workflowForm').reset();
    document.getElementById('workflowForm').dataset.workflowId = '';
    document.getElementById('workflowModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function viewWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;
    
    document.getElementById('detailWorkflowName').textContent = workflow.name;
    document.getElementById('detailWorkflowTrigger').textContent = workflow.trigger;
    document.getElementById('detailWorkflowStatus').innerHTML = `<span class="status ${workflow.status}">${workflow.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}</span>`;
    document.getElementById('detailWorkflowDate').textContent = workflow.createdDate;
    
    const actionsList = workflow.actions.map((action, index) => 
        `<div style="background: #f8fafc; padding: 10px; border-radius: 5px; border-left: 3px solid #2563eb; margin-bottom: 10px;">
            <p>${index + 1}. ${action}</p>
        </div>`
    ).join('');
    document.getElementById('detailWorkflowActions').innerHTML = actionsList;
    
    document.getElementById('workflowDetailModal').dataset.workflowId = workflowId;
    document.getElementById('workflowDetailModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function editWorkflowFromDetail() {
    const workflowId = document.getElementById('workflowDetailModal').dataset.workflowId;
    closeModal('workflowDetailModal');
    editWorkflow(workflowId);
}

function editWorkflow(workflowId) {
    const workflow = DATA.automationWorkflows.find(w => w.id === workflowId);
    if (!workflow) return;
    
    document.getElementById('workflowModalTitle').textContent = 'Chỉnh sửa Kịch bản Chăm sóc';
    document.getElementById('workflowName').value = workflow.name;
    document.getElementById('workflowTrigger').value = workflow.trigger;
    document.getElementById('workflowStatus').value = workflow.status;
    document.getElementById('workflowForm').dataset.workflowId = workflowId;
    
    document.getElementById('workflowModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveWorkflow(e) {
    e.preventDefault();
    const workflowId = document.getElementById('workflowForm').dataset.workflowId;
    const name = document.getElementById('workflowName').value;
    const trigger = document.getElementById('workflowTrigger').value;
    const status = document.getElementById('workflowStatus').value;
    
    if (workflowId) {
        // Update
        const workflow = DATA.automationWorkflows.find(w => w.id === parseInt(workflowId));
        if (workflow) {
            workflow.name = name;
            workflow.trigger = trigger;
            workflow.status = status;
            alert('Cập nhật kịch bản thành công');
        }
    } else {
        // Add new
        const newId = Math.max(...DATA.automationWorkflows.map(w => w.id), 0) + 1;
        DATA.automationWorkflows.push({
            id: newId,
            name: name,
            trigger: trigger,
            status: status,
            actions: ['send_email', 'wait_3_days', 'condition_check'],
            createdDate: new Date().toLocaleDateString('vi-VN')
        });
        alert('Tạo kịch bản thành công');
    }
    
    closeModal('workflowModal');
    loadAutomation();
}

function addWorkflowAction() {
    const actionType = document.getElementById('actionType').value;
    if (!actionType) {
        alert('Vui lòng chọn loại hành động');
        return;
    }
    alert('Thêm hành động: ' + actionType);
}

function openScoringRuleModal() {
    document.getElementById('scoringRuleModalTitle').textContent = 'Thêm Quy tắc Chấm điểm';
    document.getElementById('scoringRuleForm').reset();
    document.getElementById('scoringRuleForm').dataset.ruleId = '';
    document.getElementById('scoringRuleModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function editScoringRule(ruleId) {
    const rule = DATA.leadScoringRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    document.getElementById('scoringRuleModalTitle').textContent = 'Chỉnh sửa Quy tắc Chấm điểm';
    document.getElementById('scoringAction').value = rule.action;
    document.getElementById('scoringPoints').value = rule.points;
    document.getElementById('scoringActive').checked = rule.active;
    document.getElementById('scoringRuleForm').dataset.ruleId = ruleId;
    
    document.getElementById('scoringRuleModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveScoringRule(e) {
    e.preventDefault();
    const ruleId = document.getElementById('scoringRuleForm').dataset.ruleId;
    const action = document.getElementById('scoringAction').value;
    const points = parseInt(document.getElementById('scoringPoints').value);
    const active = document.getElementById('scoringActive').checked;
    
    if (ruleId) {
        // Update
        const rule = DATA.leadScoringRules.find(r => r.id === parseInt(ruleId));
        if (rule) {
            rule.action = action;
            rule.points = points;
            rule.active = active;
            alert('Cập nhật quy tắc thành công');
        }
    } else {
        // Add new
        const newId = Math.max(...DATA.leadScoringRules.map(r => r.id), 0) + 1;
        DATA.leadScoringRules.push({
            id: newId,
            action: action,
            points: points,
            active: active
        });
        alert('Thêm quy tắc thành công');
    }
    
    closeModal('scoringRuleModal');
    loadAutomation();
}

function deleteWorkflow(workflowId) {
    if (confirm('Bạn có chắc muốn xóa kịch bản này?')) {
        const index = DATA.automationWorkflows.findIndex(w => w.id === workflowId);
        if (index > -1) {
            DATA.automationWorkflows.splice(index, 1);
            loadAutomation();
        }
    }
}

function deleteScoringRule(ruleId) {
    if (confirm('Bạn có chắc muốn xóa quy tắc này?')) {
        const index = DATA.leadScoringRules.findIndex(r => r.id === ruleId);
        if (index > -1) {
            DATA.leadScoringRules.splice(index, 1);
            loadAutomation();
        }
    }
}

function openAppointmentModal() {
    document.getElementById('appointmentModal').style.display = 'block';
    document.body.classList.add('modal-open');
    populateCustomerDropdown('appointmentCustomer');
    loadEmployeeDropdown('appointmentEmployee', true);
    
    // Set default employee to current user
    const currentUser = AUTH.getCurrentUser();
    if (currentUser) {
        document.getElementById('appointmentEmployee').value = currentUser.id;
    }
    
    // Set default values
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().slice(0, 5);
    document.getElementById('appointmentTitle').value = '';
    document.getElementById('appointmentType').value = 'call';
    document.getElementById('appointmentDate').value = today;
    document.getElementById('appointmentTime').value = currentTime;
    document.getElementById('appointmentReminder').value = '30';
    document.getElementById('appointmentResult').value = '';
    document.getElementById('appointmentNotes').value = '';
    
    // Check if elements exist before setting values
    const locationInput = document.getElementById('appointmentLocation');
    if (locationInput) locationInput.value = '';
    
    document.getElementById('reminderEmployee').checked = true;
    document.getElementById('reminderCustomer').checked = true;
    
    const emailCheckbox = document.getElementById('reminderViaEmail');
    const smsCheckbox = document.getElementById('reminderViaSMS');
    const zaloCheckbox = document.getElementById('reminderViaZalo');
    
    if (emailCheckbox) emailCheckbox.checked = true;
    if (smsCheckbox) smsCheckbox.checked = false;
    if (zaloCheckbox) zaloCheckbox.checked = false;
    
    // Clear dataset
    document.getElementById('appointmentForm').dataset.appointmentId = '';
    
    // Call toggle after a short delay to ensure DOM is ready
    setTimeout(() => {
        toggleReminderMessageType();
    }, 100);
}

function toggleReminderMessageType() {
    const appointmentTypeSelect = document.getElementById('appointmentType');
    const reminderCustomerCheckbox = document.getElementById('reminderCustomer');
    const meetingLocationSection = document.getElementById('meetingLocationSection');
    const reminderMessageTypeSection = document.getElementById('reminderMessageTypeSection');
    
    // Check if elements exist
    if (!appointmentTypeSelect || !reminderCustomerCheckbox || !meetingLocationSection || !reminderMessageTypeSection) {
        console.error('Required elements not found for toggleReminderMessageType');
        return;
    }
    
    const appointmentType = appointmentTypeSelect.value;
    const reminderCustomer = reminderCustomerCheckbox.checked;
    
    // Show location field for meeting and video
    if (appointmentType === 'meeting' || appointmentType === 'video') {
        meetingLocationSection.style.display = 'block';
        const locationInput = document.getElementById('appointmentLocation');
        if (locationInput) {
            locationInput.required = true;
            
            // Update placeholder based on type
            if (appointmentType === 'meeting') {
                locationInput.placeholder = 'VD: Phòng họp A, Tầng 3, Tòa nhà ABC';
            } else {
                locationInput.placeholder = 'VD: https://meet.google.com/xxx hoặc https://zoom.us/j/xxx';
            }
        }
        
        // Show message type selection if customer reminder is enabled
        if (reminderCustomer) {
            reminderMessageTypeSection.style.display = 'block';
        } else {
            reminderMessageTypeSection.style.display = 'none';
        }
    } else {
        meetingLocationSection.style.display = 'none';
        reminderMessageTypeSection.style.display = 'none';
        const locationInput = document.getElementById('appointmentLocation');
        if (locationInput) {
            locationInput.required = false;
        }
    }
}

function saveAppointment(e) {
    e.preventDefault();
    const appointmentId = document.getElementById('appointmentForm').dataset.appointmentId;
    const customerId = parseInt(document.getElementById('appointmentCustomer').value);
    const customer = DATA.customers.find(c => c.id === customerId);
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!customer) {
        alert('Vui lòng chọn khách hàng');
        return;
    }
    
    const appointmentType = document.getElementById('appointmentType').value;
    const reminderCustomer = document.getElementById('reminderCustomer').checked;
    
    // Validate message types for meeting/video with customer reminder
    if ((appointmentType === 'meeting' || appointmentType === 'video') && reminderCustomer) {
        const hasEmail = document.getElementById('reminderViaEmail').checked;
        const hasSMS = document.getElementById('reminderViaSMS').checked;
        const hasZalo = document.getElementById('reminderViaZalo').checked;
        
        if (!hasEmail && !hasSMS && !hasZalo) {
            alert('Vui lòng chọn ít nhất một loại thông điệp nhắc nhở cho khách hàng');
            return;
        }
    }
    
    const appointmentData = {
        customerId: customerId,
        customerName: customer.name,
        employeeId: parseInt(document.getElementById('appointmentEmployee').value) || null,
        title: document.getElementById('appointmentTitle').value,
        type: appointmentType,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        reminderBefore: parseInt(document.getElementById('appointmentReminder').value),
        reminderEmployee: document.getElementById('reminderEmployee').checked,
        reminderCustomer: reminderCustomer,
        result: document.getElementById('appointmentResult').value || null,
        notes: document.getElementById('appointmentNotes').value,
        status: 'scheduled',
        updatedDate: now
    };
    
    // Add location for meeting/video
    if (appointmentType === 'meeting' || appointmentType === 'video') {
        appointmentData.location = document.getElementById('appointmentLocation').value;
        
        // Add reminder message types if customer reminder is enabled
        if (reminderCustomer) {
            appointmentData.reminderMessageTypes = {
                email: document.getElementById('reminderViaEmail').checked,
                sms: document.getElementById('reminderViaSMS').checked,
                zalo: document.getElementById('reminderViaZalo').checked
            };
        }
    }
    
    if (appointmentId) {
        // Update existing
        const appointment = DATA.appointments.find(a => a.id === parseInt(appointmentId));
        if (appointment) {
            Object.assign(appointment, appointmentData);
            alert('✓ Cập nhật lịch hẹn thành công!');
            DATA.addAuditLog('UPDATE_APPOINTMENT', `Cập nhật lịch hẹn: ${appointmentData.title}`, currentUser.id);
        }
    } else {
        // Add new
        const newId = Math.max(...DATA.appointments.map(a => a.id), 0) + 1;
        DATA.appointments.push({
            id: newId,
            ...appointmentData
        });
        alert('✓ Tạo lịch hẹn thành công!');
        DATA.addAuditLog('ADD_APPOINTMENT', `Tạo lịch hẹn: ${appointmentData.title}`, currentUser.id);
    }
    
    closeModal('appointmentModal');
    loadSmartReminders();
}

function viewAppointment(appointmentId) {
    const apt = DATA.appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    
    document.getElementById('detailAppointmentCustomer').textContent = apt.customerName;
    document.getElementById('detailAppointmentTitle').textContent = apt.title;
    
    const typeLabels = {
        'call': 'Gọi điện',
        'meeting': 'Cuộc họp trực tiếp',
        'video': 'Họp trực tuyến',
        'email': 'Gửi Email'
    };
    document.getElementById('detailAppointmentType').textContent = typeLabels[apt.type] || apt.type;
    
    // Show location if meeting or video
    const locationSection = document.getElementById('detailAppointmentLocationSection');
    if ((apt.type === 'meeting' || apt.type === 'video') && apt.location) {
        locationSection.style.display = 'block';
        document.getElementById('detailAppointmentLocation').textContent = apt.location;
    } else {
        locationSection.style.display = 'none';
    }
    
    document.getElementById('detailAppointmentDateTime').textContent = `${apt.date} ${apt.time}`;
    document.getElementById('detailAppointmentReminder').textContent = `${apt.reminderBefore} phút trước`;
    
    // Show reminder message types if available
    const reminderTypesSection = document.getElementById('detailReminderMessageTypesSection');
    if (apt.reminderMessageTypes && apt.reminderCustomer) {
        const types = [];
        if (apt.reminderMessageTypes.email) types.push('Email');
        if (apt.reminderMessageTypes.sms) types.push('SMS');
        if (apt.reminderMessageTypes.zalo) types.push('Zalo');
        
        if (types.length > 0) {
            reminderTypesSection.style.display = 'block';
            document.getElementById('detailReminderMessageTypes').textContent = types.join(', ');
        } else {
            reminderTypesSection.style.display = 'none';
        }
    } else {
        reminderTypesSection.style.display = 'none';
    }
    
    const statusLabels = {
        'scheduled': 'Đã lên lịch',
        'completed': 'Hoàn thành',
        'cancelled': 'Đã hủy'
    };
    document.getElementById('detailAppointmentStatus').innerHTML = `<span class="status ${apt.status}">${statusLabels[apt.status] || apt.status}</span>`;
    document.getElementById('detailAppointmentNotes').textContent = apt.notes || 'Không có ghi chú';
    
    document.getElementById('appointmentDetailModal').dataset.appointmentId = appointmentId;
    document.getElementById('appointmentDetailModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function editAppointment(appointmentId) {
    const apt = DATA.appointments.find(a => a.id === appointmentId);
    if (!apt) return;
    
    populateCustomerDropdown('appointmentCustomer');
    loadEmployeeDropdown('appointmentEmployee', true);
    
    document.getElementById('appointmentCustomer').value = apt.customerId;
    document.getElementById('appointmentEmployee').value = apt.employeeId || '';
    document.getElementById('appointmentTitle').value = apt.title;
    document.getElementById('appointmentType').value = apt.type;
    document.getElementById('appointmentDate').value = apt.date;
    document.getElementById('appointmentTime').value = apt.time;
    document.getElementById('appointmentReminder').value = apt.reminderBefore;
    document.getElementById('appointmentResult').value = apt.result || '';
    document.getElementById('appointmentNotes').value = apt.notes || '';
    document.getElementById('appointmentLocation').value = apt.location || '';
    document.getElementById('reminderEmployee').checked = apt.reminderEmployee !== false;
    document.getElementById('reminderCustomer').checked = apt.reminderCustomer !== false;
    
    // Load reminder message types if available
    if (apt.reminderMessageTypes) {
        document.getElementById('reminderViaEmail').checked = apt.reminderMessageTypes.email || false;
        document.getElementById('reminderViaSMS').checked = apt.reminderMessageTypes.sms || false;
        document.getElementById('reminderViaZalo').checked = apt.reminderMessageTypes.zalo || false;
    } else {
        document.getElementById('reminderViaEmail').checked = true;
        document.getElementById('reminderViaSMS').checked = false;
        document.getElementById('reminderViaZalo').checked = false;
    }
    
    document.getElementById('appointmentForm').dataset.appointmentId = appointmentId;
    document.getElementById('appointmentModal').style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Toggle sections based on appointment type
    toggleReminderMessageType();
}

function editAppointmentFromDetail() {
    const appointmentId = document.getElementById('appointmentDetailModal').dataset.appointmentId;
    closeModal('appointmentDetailModal');
    editAppointment(appointmentId);
}

function deleteAppointment(appointmentId) {
    if (confirm('Bạn có chắc muốn xóa lịch hẹn này?')) {
        const index = DATA.appointments.findIndex(a => a.id === appointmentId);
        if (index > -1) {
            DATA.appointments.splice(index, 1);
            alert('Đã xóa lịch hẹn');
            loadSmartReminders();
        }
    }
}

function completeAppointment(appointmentId) {
    // If called from detail modal, get ID from dataset
    if (!appointmentId) {
        appointmentId = document.getElementById('appointmentDetailModal').dataset.appointmentId;
    }
    
    const apt = DATA.appointments.find(a => a.id === parseInt(appointmentId));
    if (!apt) return;
    
    // Close detail modal if open
    closeModal('appointmentDetailModal');
    
    // Store appointment ID for result form
    document.getElementById('appointmentResultForm').dataset.appointmentId = appointmentId;
    
    // Clear form
    document.getElementById('appointmentResult').value = 'success';
    document.getElementById('appointmentResultNotes').value = '';
    
    // Open result modal
    document.getElementById('appointmentResultModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveAppointmentResult(e) {
    e.preventDefault();
    const appointmentId = parseInt(document.getElementById('appointmentResultForm').dataset.appointmentId);
    const apt = DATA.appointments.find(a => a.id === appointmentId);
    
    if (!apt) {
        alert('Không tìm thấy lịch hẹn');
        return;
    }
    
    const result = document.getElementById('appointmentResult').value;
    const resultNotes = document.getElementById('appointmentResultNotes').value;
    
    // Update appointment status
    apt.status = 'completed';
    apt.result = result;
    apt.resultNotes = resultNotes;
    apt.completedDate = new Date().toLocaleDateString('vi-VN');
    
    // Add to interaction history
    const resultLabels = {
        'success': 'Thành công',
        'busy': 'Khách bận',
        'rejected': 'Khách từ chối'
    };
    
    const typeLabels = {
        'call': 'Gọi điện',
        'meeting': 'Cuộc họp',
        'video': 'Họp trực tuyến',
        'email': 'Email'
    };
    
    const newInteractionId = Math.max(...DATA.interactions.map(i => i.id), 0) + 1;
    DATA.interactions.push({
        id: newInteractionId,
        customerId: apt.customerId,
        type: apt.type,
        content: `${typeLabels[apt.type]}: ${apt.title} - Kết quả: ${resultLabels[result]}`,
        notes: resultNotes,
        date: new Date().toLocaleDateString('vi-VN'),
        file: null
    });
    
    alert('Đã lưu kết quả cuộc hẹn và ghi vào lịch sử tương tác');
    closeModal('appointmentResultModal');
    loadSmartReminders();
}

function mergeDuplicateCustomers(duplicateId) {
    const dup = DATA.duplicateCustomers.find(d => d.id === duplicateId);
    if (!dup) return;
    
    // Populate merge modal with customer data
    const customer1 = DATA.customers.find(c => c.id === dup.customer1.id);
    const customer2 = DATA.customers.find(c => c.id === dup.customer2.id);
    
    if (!customer1 || !customer2) {
        alert('Không tìm thấy thông tin khách hàng');
        return;
    }
    
    // Count interactions
    const interactions1 = DATA.interactions.filter(i => i.customerId === customer1.id).length;
    const interactions2 = DATA.interactions.filter(i => i.customerId === customer2.id).length;
    
    // Update merge modal content
    const mergeModalContent = `
        <div style="padding: 20px;">
            <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p><i class="fas fa-exclamation-triangle"></i> <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div style="border: 2px solid #2B4856; padding: 15px; border-radius: 5px; background: #f0f9ff;">
                    <h4 style="color: #2B4856; margin-bottom: 10px;">✓ Khách hàng 1 (Giữ lại)</h4>
                    <p><strong>Tên:</strong> ${customer1.name}</p>
                    <p><strong>Email:</strong> ${customer1.email}</p>
                    <p><strong>SĐT:</strong> ${customer1.phone}</p>
                    <p><strong>Công ty:</strong> ${customer1.company}</p>
                    <p><strong>Tương tác:</strong> ${interactions1}</p>
                </div>
                <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 5px;">
                    <h4 style="color: #64748b; margin-bottom: 10px;">✗ Khách hàng 2 (Sẽ xóa)</h4>
                    <p><strong>Tên:</strong> ${customer2.name}</p>
                    <p><strong>Email:</strong> ${customer2.email}</p>
                    <p><strong>SĐT:</strong> ${customer2.phone}</p>
                    <p><strong>Công ty:</strong> ${customer2.company}</p>
                    <p><strong>Tương tác:</strong> ${interactions2}</p>
                </div>
            </div>
            
            <div style="background: #f1f5f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p><strong>Hành động:</strong></p>
                <ul style="margin: 10px 0 0 20px; color: #334155;">
                    <li>Gộp ${interactions2} tương tác từ Khách hàng 2 vào Khách hàng 1</li>
                    <li>Xóa Khách hàng 2 khỏi hệ thống</li>
                    <li>Tổng cộng: ${interactions1 + interactions2} tương tác cho Khách hàng 1</li>
                </ul>
            </div>
            
            <div style="background: #dcfce7; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <p style="color: #166534;"><strong>Độ tương đồng:</strong> ${dup.similarity}%</p>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal('mergeCustomerModal')">Hủy</button>
                <button type="button" class="btn btn-primary" onclick="confirmMergeCustomers(${duplicateId})">Xác nhận Gộp</button>
            </div>
        </div>
    `;
    
    document.querySelector('#mergeCustomerModal .modal-content').innerHTML = `
        <div class="modal-header">
            <h2>Gộp Khách hàng Trùng lặp</h2>
            <button class="close-btn" onclick="closeModal('mergeCustomerModal')">&times;</button>
        </div>
        ${mergeModalContent}
    `;
    
    document.getElementById('mergeCustomerModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function confirmMergeCustomers(duplicateId) {
    const dup = DATA.duplicateCustomers.find(d => d.id === duplicateId);
    if (!dup) return;
    
    const customer1 = DATA.customers.find(c => c.id === dup.customer1.id);
    const customer2 = DATA.customers.find(c => c.id === dup.customer2.id);
    
    if (!customer1 || !customer2) {
        alert('Không tìm thấy thông tin khách hàng');
        return;
    }
    
    // Transfer all interactions from customer2 to customer1
    DATA.interactions.forEach(interaction => {
        if (interaction.customerId === customer2.id) {
            interaction.customerId = customer1.id;
        }
    });
    
    // Delete customer2
    customer2.deleted = true;
    
    // Remove from duplicates list
    const index = DATA.duplicateCustomers.findIndex(d => d.id === duplicateId);
    if (index > -1) {
        DATA.duplicateCustomers.splice(index, 1);
    }
    
    alert(`Đã gộp thành công!\nTất cả tương tác của "${customer2.name}" đã được chuyển sang "${customer1.name}"`);
    closeModal('mergeCustomerModal');
    loadMergeDuplicates();
}

function ignoreDuplicate(duplicateId) {
    const index = DATA.duplicateCustomers.findIndex(d => d.id === duplicateId);
    if (index > -1) {
        DATA.duplicateCustomers.splice(index, 1);
        loadMergeDuplicates();
    }
}

function viewTrialDetail(trialId) {
    const trial = DATA.trialCustomers.find(t => t.id === trialId);
    if (!trial) return;
    
    const endDate = new Date(trial.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const status = daysLeft <= 0 ? 'Hết hạn' : daysLeft <= 3 ? 'Sắp hết' : 'Còn hạn';
    
    document.getElementById('detailTrialCustomer').textContent = trial.customerName;
    document.getElementById('detailTrialStartDate').textContent = trial.startDate;
    document.getElementById('detailTrialEndDate').textContent = trial.endDate;
    document.getElementById('detailTrialRemaining').textContent = `${daysLeft} ngày`;
    document.getElementById('detailTrialStatus').innerHTML = `<span class="status ${status.toLowerCase().replace(' ', '-')}">${status}</span>`;
    document.getElementById('detailTrialReminder').textContent = `${trial.reminderDays} ngày`;
    document.getElementById('detailTrialNotes').textContent = trial.notes || 'Không có ghi chú';
    
    document.getElementById('trialDetailModal').dataset.trialId = trialId;
    document.getElementById('trialDetailModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function editTrialFromDetail() {
    const trialId = document.getElementById('trialDetailModal').dataset.trialId;
    closeModal('trialDetailModal');
    editTrial(trialId);
}

function editTrial(trialId) {
    const trial = DATA.trialCustomers.find(t => t.id === trialId);
    if (!trial) return;
    
    document.getElementById('trialModalTitle').textContent = 'Chỉnh sửa Dùng thử';
    populateCustomerDropdown('trialCustomer');
    document.getElementById('trialCustomer').value = trial.customerId;
    document.getElementById('trialStartDate').value = trial.startDate;
    document.getElementById('trialDays').value = trial.daysAllowed;
    document.getElementById('trialReminderDays').value = trial.reminderDays;
    document.getElementById('trialNotes').value = trial.notes || '';
    
    document.getElementById('trialForm').dataset.trialId = trialId;
    document.getElementById('trialModal').style.display = 'block';
    document.body.classList.add('modal-open');
    
    updateTrialEndDate();
}

function openTrialModal() {
    document.getElementById('trialModalTitle').textContent = 'Thêm Dùng thử';
    populateCustomerDropdown('trialCustomer');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('trialStartDate').value = today;
    document.getElementById('trialDays').value = 30;
    document.getElementById('trialReminderDays').value = 3;
    document.getElementById('trialNotes').value = '';
    document.getElementById('trialForm').dataset.trialId = '';
    
    document.getElementById('trialModal').style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Add event listeners
    document.getElementById('trialStartDate').addEventListener('change', updateTrialEndDate);
    document.getElementById('trialDays').addEventListener('change', updateTrialEndDate);
    
    updateTrialEndDate();
}

function updateTrialEndDate() {
    const startDate = new Date(document.getElementById('trialStartDate').value);
    const days = parseInt(document.getElementById('trialDays').value) || 0;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    
    document.getElementById('trialEndDateDisplay').textContent = endDate.toLocaleDateString('vi-VN');
    
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    document.getElementById('trialRemainingDisplay').textContent = daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn';
}

function saveTrial(e) {
    e.preventDefault();
    const trialId = document.getElementById('trialForm').dataset.trialId;
    const customerId = parseInt(document.getElementById('trialCustomer').value);
    const customer = DATA.customers.find(c => c.id === customerId);
    
    if (!customer) {
        alert('Vui lòng chọn khách hàng');
        return;
    }
    
    const startDate = document.getElementById('trialStartDate').value;
    const days = parseInt(document.getElementById('trialDays').value);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    if (trialId) {
        // Update
        const trial = DATA.trialCustomers.find(t => t.id === parseInt(trialId));
        if (trial) {
            trial.customerId = customerId;
            trial.customerName = customer.name;
            trial.startDate = startDate;
            trial.endDate = endDateStr;
            trial.daysAllowed = days;
            trial.reminderDays = parseInt(document.getElementById('trialReminderDays').value);
            trial.notes = document.getElementById('trialNotes').value;
            alert('Cập nhật dùng thử thành công');
        }
    } else {
        // Add new
        const newId = Math.max(...DATA.trialCustomers.map(t => t.id), 0) + 1;
        DATA.trialCustomers.push({
            id: newId,
            customerId: customerId,
            customerName: customer.name,
            startDate: startDate,
            endDate: endDateStr,
            daysAllowed: days,
            reminderDays: parseInt(document.getElementById('trialReminderDays').value),
            notes: document.getElementById('trialNotes').value
        });
        alert('Thêm dùng thử thành công');
    }
    
    closeModal('trialModal');
    loadTrialManagement();
}

function sendMessage(e) {
    e.preventDefault();
    const customerId = document.getElementById('messageCustomer').value;
    const messageType = document.getElementById('messageType').value;
    const content = document.getElementById('messageContent').value;
    const promoTitle = document.getElementById('messagePromoTitle').value;
    const promoCode = document.getElementById('messagePromoCode').value;
    const promoDescription = document.getElementById('messagePromoDescription').value;
    const promoExpiry = document.getElementById('messagePromoExpiry').value;
    const promoLink = document.getElementById('messagePromoLink').value;
    const isScheduled = document.getElementById('messageSchedule').checked;
    const scheduleTime = document.getElementById('messageScheduleTime').value;
    const trackOpen = document.getElementById('messageTrackOpen').checked;
    const notes = document.getElementById('messageNotes').value;
    
    if (!customerId || !content) {
        alert('Vui lòng chọn khách hàng và nhập nội dung');
        return;
    }
    
    const customer = DATA.customers.find(c => c.id === parseInt(customerId));
    const message = {
        id: Math.random().toString(36).substr(2, 9),
        customerId: parseInt(customerId),
        customerName: customer?.name,
        type: messageType,
        content: content,
        promo: {
            title: promoTitle,
            code: promoCode,
            description: promoDescription,
            expiry: promoExpiry,
            link: promoLink
        },
        scheduled: isScheduled,
        scheduleTime: scheduleTime,
        trackOpen: trackOpen,
        notes: notes,
        sentDate: new Date().toLocaleDateString('vi-VN'),
        sentTime: new Date().toLocaleTimeString('vi-VN'),
        status: isScheduled ? 'scheduled' : 'sent'
    };
    
    alert(`Thông điệp ${isScheduled ? 'đã được lên lịch' : 'đã được gửi'} thành công!`);
    closeModal('sendMessageModal');
    document.getElementById('sendMessageForm').reset();
}


// ============================================
// CHỨC NĂNG ĐỒNG BỘ DỮ LIỆU API
// ============================================

function openApiIntegrationSettings() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Đồng bộ Dữ liệu Khách hàng</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Tích hợp API với Nền tảng Thứ ba</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Kết nối với các nền tảng marketing để tự động đồng bộ dữ liệu khách hàng vào CRM mà không cần nhập tay.
            </p>
            
            <div style="display: grid; gap: 20px;">
                ${DATA.apiIntegrations.map(api => `
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin-bottom: 5px;">
                                    <i class="fas fa-${api.type === 'facebook' ? 'facebook' : api.type === 'google' ? 'google' : 'plug'}"></i>
                                    ${api.name}
                                </h4>
                                <small style="color: #64748b;">Loại: ${api.type}</small>
                            </div>
                            <span class="status ${api.status === 'active' ? 'customer' : 'lead'}" style="padding: 5px 12px;">
                                ${api.status === 'active' ? '✓ Đang hoạt động' : '○ Chưa kích hoạt'}
                            </span>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">API Key / Token:</label>
                            <input type="password" id="apiKey_${api.id}" value="${api.apiKey}" 
                                   placeholder="Nhập API Key hoặc Access Token"
                                   style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                        </div>
                        
                        ${api.type === 'webhook' ? `
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Webhook URL:</label>
                                <input type="text" id="webhookUrl_${api.id}" value="${api.webhookUrl || ''}" 
                                       placeholder="https://your-crm.com/webhook/receive"
                                       style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                                <small style="color: #64748b; display: block; margin-top: 5px;">
                                    Sao chép URL này và cấu hình trong hệ thống nguồn
                                </small>
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-primary" onclick="saveApiIntegration(${api.id})">
                                <i class="fas fa-save"></i> Lưu Cấu hình
                            </button>
                            <button class="btn btn-secondary" onclick="testApiConnection(${api.id})">
                                <i class="fas fa-plug"></i> Test Kết nối
                            </button>
                            ${api.status === 'active' ? `
                                <button class="btn btn-secondary" onclick="syncApiData(${api.id})">
                                    <i class="fas fa-sync"></i> Đồng bộ Ngay
                                </button>
                            ` : ''}
                        </div>
                        
                        ${api.lastSync ? `
                            <div style="margin-top: 15px; padding: 10px; background: #f1f5f9; border-radius: 5px;">
                                <small style="color: #64748b;">
                                    <i class="fas fa-clock"></i> Đồng bộ lần cuối: ${api.lastSync}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 15px;">Lịch sử Đồng bộ</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nền tảng</th>
                        <th>Số KH mới</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.syncHistory && DATA.syncHistory.length > 0 ? DATA.syncHistory.map(sync => `
                        <tr>
                            <td>${sync.platform}</td>
                            <td><strong>${sync.newCustomers}</strong> khách hàng</td>
                            <td>${sync.timestamp}</td>
                            <td><span class="status ${sync.status === 'success' ? 'customer' : 'lead'}">${sync.status === 'success' ? 'Thành công' : 'Thất bại'}</span></td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">
                                Chưa có lịch sử đồng bộ
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function saveApiIntegration(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    const apiKeyInput = document.getElementById(`apiKey_${apiId}`);
    const webhookUrlInput = document.getElementById(`webhookUrl_${apiId}`);
    
    api.apiKey = apiKeyInput.value;
    if (webhookUrlInput) {
        api.webhookUrl = webhookUrlInput.value;
    }
    
    if (api.apiKey) {
        api.status = 'active';
    }
    
    alert(`✓ Đã lưu cấu hình cho ${api.name}`);
    DATA.addAuditLog('UPDATE_API_INTEGRATION', `Cập nhật tích hợp API: ${api.name}`, AUTH.getCurrentUser().id);
    openApiIntegrationSettings();
}

function testApiConnection(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    if (!api.apiKey) {
        alert('⚠ Vui lòng nhập API Key trước khi test kết nối!');
        return;
    }
    
    // Simulate API test
    setTimeout(() => {
        alert(`✓ Kết nối thành công với ${api.name}!\n\nAPI Key hợp lệ và sẵn sàng đồng bộ dữ liệu.`);
    }, 1000);
}

function syncApiData(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    if (api.status !== 'active') {
        alert('⚠ Vui lòng kích hoạt tích hợp trước khi đồng bộ!');
        return;
    }
    
    // Simulate API sync
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu từ ${api.name}...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        // Simulate new customers
        const newCustomersCount = Math.floor(Math.random() * 10) + 1;
        const mockCustomers = [];
        
        for (let i = 0; i < newCustomersCount; i++) {
            const newCustomer = {
                id: DATA.customers.length + i + 1,
                name: `Khách hàng từ ${api.name} ${i + 1}`,
                email: `customer${Date.now()}${i}@example.com`,
                phone: `09${Math.floor(Math.random() * 100000000)}`,
                company: `Công ty ${i + 1}`,
                status: 'lead',
                source: api.type,
                industry: 'Khác',
                score: Math.floor(Math.random() * 50) + 20,
                createdDate: new Date().toISOString().split('T')[0],
                lastInteraction: new Date().toISOString().split('T')[0],
                deleted: false
            };
            mockCustomers.push(newCustomer);
            DATA.customers.push(newCustomer);
            
            // Auto assign customer
            autoAssignCustomer(newCustomer);
        }
        
        // Update sync history
        if (!DATA.syncHistory) DATA.syncHistory = [];
        DATA.syncHistory.unshift({
            id: DATA.syncHistory.length + 1,
            platform: api.name,
            newCustomers: newCustomersCount,
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'success'
        });
        
        api.lastSync = new Date().toLocaleString('vi-VN');
        
        alert(`✓ Đồng bộ thành công!\n\nĐã thêm ${newCustomersCount} khách hàng mới từ ${api.name}\nCác khách hàng đã được phân bổ tự động cho nhân viên.`);
        DATA.addAuditLog('SYNC_API_DATA', `Đồng bộ ${newCustomersCount} khách hàng từ ${api.name}`, 'system');
        openApiIntegrationSettings();
    }, 2000);
}

// ============================================
// CẢI THIỆN GÁN KHÁCH HÀNG CHO CHIẾN DỊCH
// ============================================

function applyCustomerFilter() {
    const status = document.getElementById('filterStatus').value;
    const source = document.getElementById('filterSource').value;
    const minScore = parseInt(document.getElementById('filterScore').value) || 0;
    
    const filteredCustomers = DATA.customers.filter(c => {
        if (c.deleted) return false;
        if (status && c.status !== status) return false;
        if (source && c.source !== source) return false;
        if (c.score < minScore) return false;
        return true;
    });
    
    const tbody = document.getElementById('customerListForCampaign');
    tbody.innerHTML = filteredCustomers.map(c => `
        <tr>
            <td style="padding: 12px;"><input type="checkbox" value="${c.id}"></td>
            <td style="padding: 12px;">${c.name}</td>
            <td style="padding: 12px;">${c.email}</td>
            <td style="padding: 12px;"><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
            <td style="padding: 12px;">${c.score}</td>
        </tr>
    `).join('');
    
    updateSelectedCount();
}

function toggleAllCustomers(checkbox) {
    const checkboxes = document.querySelectorAll('#customerListForCampaign input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = checkbox.checked);
    updateSelectedCount();
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('#customerListForCampaign input[type="checkbox"]:checked');
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = checkboxes.length;
    }
}

function confirmAssignCustomers(campaignId) {
    const checkboxes = document.querySelectorAll('#customerListForCampaign input[type="checkbox"]:checked');
    const customerIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
    
    if (customerIds.length === 0) {
        alert('⚠ Vui lòng chọn ít nhất một khách hàng!');
        return;
    }
    
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Save assignments
    customerIds.forEach(customerId => {
        const existing = DATA.campaignCustomers.find(cc => 
            cc.campaignId === campaignId && cc.customerId === customerId
        );
        
        if (!existing) {
            DATA.campaignCustomers.push({
                id: DATA.campaignCustomers.length + 1,
                campaignId: campaignId,
                customerId: customerId,
                assignedDate: new Date().toLocaleString('vi-VN')
            });
        }
    });
    
    alert(`✓ Đã gán ${customerIds.length} khách hàng cho chiến dịch "${campaign.name}"`);
    DATA.addAuditLog('ASSIGN_CUSTOMERS_TO_CAMPAIGN', `Gán ${customerIds.length} khách hàng cho chiến dịch ${campaign.name}`, AUTH.getCurrentUser().id);
    closeModal('assignCustomersModal');
}

// Thêm vào menu settings
function loadSettings() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    
    // Initialize system settings if not exists
    if (!DATA.systemSettings) {
        DATA.systemSettings = {
            companyName: 'CÔNG TY CRM',
            companyEmail: 'contact@crm.com',
            companyPhone: '0123456789',
            companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
            timezone: 'Asia/Ho_Chi_Minh',
            dateFormat: 'DD/MM/YYYY',
            currency: 'VND',
            language: 'vi',
            emailNotifications: true,
            smsNotifications: false,
            autoBackup: true,
            backupFrequency: 'daily',
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordExpiry: 90
        };
    }
    
    mainContent.innerHTML = `
        <h2 class="page-title">Cấu hình Hệ thống</h2>
        
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('settings-general')">Thông tin Công ty</button>
            <button class="tab-btn" onclick="switchTab('settings-system')">Hệ thống</button>
            <button class="tab-btn" onclick="switchTab('settings-notifications')">Thông báo</button>
            <button class="tab-btn" onclick="switchTab('settings-security')">Bảo mật</button>
            <button class="tab-btn" onclick="switchTab('settings-backup')">Sao lưu</button>
        </div>
        
        <!-- Tab Thông tin Công ty -->
        <div id="settings-general" class="tab-content active">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;">
                    <i class="fas fa-building"></i> Thông tin Công ty
                </h3>
                <form id="companyInfoForm" onsubmit="saveCompanyInfo(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="companyName">Tên công ty *</label>
                            <input type="text" id="companyName" value="${DATA.systemSettings.companyName}" required>
                        </div>
                        <div class="form-group">
                            <label for="companyEmail">Email *</label>
                            <input type="email" id="companyEmail" value="${DATA.systemSettings.companyEmail}" required>
                        </div>
                        <div class="form-group">
                            <label for="companyPhone">Số điện thoại *</label>
                            <input type="tel" id="companyPhone" value="${DATA.systemSettings.companyPhone}" required>
                        </div>
                        <div class="form-group">
                            <label for="companyWebsite">Website</label>
                            <input type="url" id="companyWebsite" value="${DATA.systemSettings.companyWebsite || ''}" placeholder="https://example.com">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="companyAddress">Địa chỉ *</label>
                        <textarea id="companyAddress" rows="2" required>${DATA.systemSettings.companyAddress}</textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Tab Hệ thống -->
        <div id="settings-system" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;">
                    <i class="fas fa-cog"></i> Cài đặt Hệ thống
                </h3>
                <form id="systemSettingsForm" onsubmit="saveSystemSettings(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="timezone">Múi giờ</label>
                            <select id="timezone">
                                <option value="Asia/Ho_Chi_Minh" ${DATA.systemSettings.timezone === 'Asia/Ho_Chi_Minh' ? 'selected' : ''}>Việt Nam (GMT+7)</option>
                                <option value="Asia/Bangkok" ${DATA.systemSettings.timezone === 'Asia/Bangkok' ? 'selected' : ''}>Bangkok (GMT+7)</option>
                                <option value="Asia/Singapore" ${DATA.systemSettings.timezone === 'Asia/Singapore' ? 'selected' : ''}>Singapore (GMT+8)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="dateFormat">Định dạng ngày</label>
                            <select id="dateFormat">
                                <option value="DD/MM/YYYY" ${DATA.systemSettings.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY" ${DATA.systemSettings.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD" ${DATA.systemSettings.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="currency">Đơn vị tiền tệ</label>
                            <select id="currency">
                                <option value="VND" ${DATA.systemSettings.currency === 'VND' ? 'selected' : ''}>VND (₫)</option>
                                <option value="USD" ${DATA.systemSettings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                <option value="EUR" ${DATA.systemSettings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="language">Ngôn ngữ</label>
                            <select id="language">
                                <option value="vi" ${DATA.systemSettings.language === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                                <option value="en" ${DATA.systemSettings.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Tab Thông báo -->
        <div id="settings-notifications" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;">
                    <i class="fas fa-bell"></i> Cài đặt Thông báo
                </h3>
                <form id="notificationSettingsForm" onsubmit="saveNotificationSettings(event)">
                    <div style="display: grid; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Thông báo Email</strong>
                                <small style="color: #64748b;">Gửi thông báo qua email khi có sự kiện quan trọng</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="emailNotifications" ${DATA.systemSettings.emailNotifications ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Thông báo SMS</strong>
                                <small style="color: #64748b;">Gửi thông báo qua SMS (cần cấu hình SMS Gateway)</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="smsNotifications" ${DATA.systemSettings.smsNotifications ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Thông báo Trình duyệt</strong>
                                <small style="color: #64748b;">Hiển thị thông báo trên trình duyệt</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="browserNotifications" ${DATA.systemSettings.browserNotifications !== false ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Tab Bảo mật -->
        <div id="settings-security" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;">
                    <i class="fas fa-shield-alt"></i> Cài đặt Bảo mật
                </h3>
                <form id="securitySettingsForm" onsubmit="saveSecuritySettings(event)">
                    <div style="display: grid; gap: 20px;">
                        <div class="form-group">
                            <label for="sessionTimeout">Thời gian hết phiên (phút)</label>
                            <input type="number" id="sessionTimeout" value="${DATA.systemSettings.sessionTimeout}" min="5" max="120">
                            <small style="color: #64748b;">Tự động đăng xuất sau khoảng thời gian không hoạt động</small>
                        </div>
                        <div class="form-group">
                            <label for="maxLoginAttempts">Số lần đăng nhập sai tối đa</label>
                            <input type="number" id="maxLoginAttempts" value="${DATA.systemSettings.maxLoginAttempts}" min="3" max="10">
                            <small style="color: #64748b;">Khóa tài khoản sau số lần đăng nhập sai</small>
                        </div>
                        <div class="form-group">
                            <label for="passwordExpiry">Thời hạn mật khẩu (ngày)</label>
                            <input type="number" id="passwordExpiry" value="${DATA.systemSettings.passwordExpiry}" min="0" max="365">
                            <small style="color: #64748b;">Yêu cầu đổi mật khẩu sau số ngày (0 = không giới hạn)</small>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Xác thực 2 yếu tố (2FA)</strong>
                                <small style="color: #64748b;">Bật xác thực 2 lớp cho tất cả người dùng</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="require2FA" ${DATA.systemSettings.require2FA ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Tab Sao lưu -->
        <div id="settings-backup" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;">
                    <i class="fas fa-database"></i> Sao lưu & Khôi phục
                </h3>
                <form id="backupSettingsForm" onsubmit="saveBackupSettings(event)">
                    <div style="display: grid; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Tự động sao lưu</strong>
                                <small style="color: #64748b;">Tự động sao lưu dữ liệu theo lịch</small>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="autoBackup" ${DATA.systemSettings.autoBackup ? 'checked' : ''}>
                                <span class="slider"></span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="backupFrequency">Tần suất sao lưu</label>
                            <select id="backupFrequency">
                                <option value="hourly" ${DATA.systemSettings.backupFrequency === 'hourly' ? 'selected' : ''}>Mỗi giờ</option>
                                <option value="daily" ${DATA.systemSettings.backupFrequency === 'daily' ? 'selected' : ''}>Hàng ngày</option>
                                <option value="weekly" ${DATA.systemSettings.backupFrequency === 'weekly' ? 'selected' : ''}>Hàng tuần</option>
                                <option value="monthly" ${DATA.systemSettings.backupFrequency === 'monthly' ? 'selected' : ''}>Hàng tháng</option>
                            </select>
                        </div>
                        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <h4 style="margin-bottom: 15px; color: #1e40af;">Sao lưu thủ công</h4>
                            <p style="color: #1e40af; margin-bottom: 15px;">Tạo bản sao lưu ngay lập tức</p>
                            <button type="button" class="btn btn-primary" onclick="createBackup()">
                                <i class="fas fa-download"></i> Tạo bản sao lưu
                            </button>
                        </div>
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <h4 style="margin-bottom: 15px; color: #92400e;">Khôi phục dữ liệu</h4>
                            <p style="color: #92400e; margin-bottom: 15px;">Khôi phục từ file sao lưu</p>
                            <input type="file" id="restoreFile" accept=".json" style="margin-bottom: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="restoreBackup()">
                                <i class="fas fa-upload"></i> Khôi phục
                            </button>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu cài đặt
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Cập nhật hàm updateNotificationBadge
function updateNotificationBadge() {
    const unreadCount = DATA.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// ============================================
// QUẢN LÝ NGƯỜI DÙNG (ADMIN)
// ============================================

function loadUserManagement() {
    const mainContent = document.getElementById('mainContent');
    
    // Mock data người dùng
    if (!DATA.users) {
        DATA.users = [
            { id: 1, username: 'admin', name: 'Quản trị viên', email: 'admin@crm.com', role: 'admin', status: 'active', createdDate: '01/01/2024', lastLogin: '27/03/2026 10:30' },
            { id: 2, username: 'manager1', name: 'Nguyễn Văn A', email: 'manager1@crm.com', role: 'manager', status: 'active', createdDate: '15/01/2024', lastLogin: '27/03/2026 09:15' },
            { id: 3, username: 'staff1', name: 'Trần Minh Chiến', email: 'staff1@crm.com', role: 'employee', status: 'active', createdDate: '20/01/2024', lastLogin: '27/03/2026 08:45' },
            { id: 4, username: 'staff2', name: 'Lê Thị B', email: 'staff2@crm.com', role: 'employee', status: 'locked', createdDate: '25/01/2024', lastLogin: '20/03/2026 14:20' }
        ];
    }
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Người dùng</h2>
        
        <div class="table-container">
            <div class="table-header">
                <h3>Danh sách Người dùng</h3>
                <button class="btn-add" onclick="openUserModal()">
                    <i class="fas fa-user-plus"></i> Thêm Người dùng
                </button>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Đăng nhập cuối</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.users.map(user => `
                        <tr>
                            <td><strong>${user.username}</strong></td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>
                                <span class="status ${user.role === 'admin' ? 'customer' : user.role === 'manager' ? 'prospect' : 'lead'}">
                                    ${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Trưởng phòng' : 'Nhân viên'}
                                </span>
                            </td>
                            <td>
                                <span class="status ${user.status === 'active' ? 'customer' : 'lead'}">
                                    ${user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                            </td>
                            <td>${user.lastLogin}</td>
                            <td>
                                <button class="btn-edit" onclick="editUser(${user.id})" title="Sửa">
                                    <i class="fas fa-edit"></i>
                                </button>
                                ${user.status === 'active' ? `
                                    <button class="btn-delete" onclick="lockUser(${user.id})" title="Khóa tài khoản" style="background: #f59e0b;">
                                        <i class="fas fa-lock"></i>
                                    </button>
                                ` : `
                                    <button class="btn-edit" onclick="unlockUser(${user.id})" title="Mở khóa" style="background: #10b981;">
                                        <i class="fas fa-unlock"></i>
                                    </button>
                                `}
                                ${user.id !== 1 ? `
                                    <button class="btn-delete" onclick="deleteUser(${user.id})" title="Xóa">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #3b82f6;">
            <h4 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Phân quyền Hệ thống
            </h4>
            <ul style="color: #1e40af; margin-left: 20px;">
                <li><strong>Admin:</strong> Quản lý người dùng, phân quyền, cấu hình hệ thống</li>
                <li><strong>Trưởng phòng (Manager):</strong> Quản lý khách hàng, chiến dịch, nhân viên, báo cáo, thùng rác</li>
                <li><strong>Nhân viên (Employee):</strong> Quản lý khách hàng được phân bổ, tương tác, chiến dịch</li>
            </ul>
        </div>
    `;
}

// Open user modal
function openUserModal(userId = null) {
    const user = userId ? DATA.users.find(u => u.id === userId) : null;
    const isEdit = !!user;
    
    const modalContent = `
        <div style="padding: 20px;">
            <h3>${isEdit ? 'Sửa Người dùng' : 'Thêm Người dùng Mới'}</h3>
            
            <form onsubmit="saveUser(event, ${userId})">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tên đăng nhập:</label>
                    <input type="text" id="userUsername" value="${user?.username || ''}" 
                           ${isEdit ? 'readonly' : ''} required
                           style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Họ tên:</label>
                    <input type="text" id="userName" value="${user?.name || ''}" required
                           style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Email:</label>
                    <input type="email" id="userEmail" value="${user?.email || ''}" required
                           style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                </div>
                
                ${!isEdit ? `
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Mật khẩu:</label>
                        <input type="password" id="userPassword" required
                               style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Vai trò:</label>
                    <select id="userRole" required
                            style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                        <option value="employee" ${user?.role === 'employee' ? 'selected' : ''}>Nhân viên</option>
                        <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Trưởng phòng</option>
                        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">
                        Hủy
                    </button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> ${isEdit ? 'Cập nhật' : 'Thêm'}
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal('userModal', 'Quản lý Người dùng', modalContent);
}

// Save user
function saveUser(event, userId) {
    event.preventDefault();
    
    const username = document.getElementById('userUsername').value.trim();
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;
    const password = userId ? null : document.getElementById('userPassword').value;
    
    if (userId) {
        // Edit existing user
        const user = DATA.users.find(u => u.id === userId);
        if (user) {
            user.name = name;
            user.email = email;
            user.role = role;
            alert('✓ Đã cập nhật thông tin người dùng!');
            DATA.addAuditLog('UPDATE_USER', `Cập nhật người dùng: ${username}`, AUTH.getCurrentUser().id);
        }
    } else {
        // Add new user
        const newUser = {
            id: DATA.users.length + 1,
            username: username,
            name: name,
            email: email,
            role: role,
            status: 'active',
            createdDate: new Date().toLocaleDateString('vi-VN'),
            lastLogin: 'Chưa đăng nhập'
        };
        DATA.users.push(newUser);
        alert('✓ Đã thêm người dùng mới!');
        DATA.addAuditLog('ADD_USER', `Thêm người dùng: ${username}`, AUTH.getCurrentUser().id);
    }
    
    closeModal('userModal');
    loadUserManagement();
}

// Edit user
function editUser(userId) {
    openUserModal(userId);
}

// Lock user
function lockUser(userId) {
    const user = DATA.users.find(u => u.id === userId);
    if (user && confirm(`Khóa tài khoản "${user.username}"?\n\nNgười dùng sẽ không thể đăng nhập vào hệ thống.`)) {
        user.status = 'locked';
        alert('✓ Đã khóa tài khoản!');
        DATA.addAuditLog('LOCK_USER', `Khóa tài khoản: ${user.username}`, AUTH.getCurrentUser().id);
        loadUserManagement();
    }
}

// Unlock user
function unlockUser(userId) {
    const user = DATA.users.find(u => u.id === userId);
    if (user && confirm(`Mở khóa tài khoản "${user.username}"?`)) {
        user.status = 'active';
        alert('✓ Đã mở khóa tài khoản!');
        DATA.addAuditLog('UNLOCK_USER', `Mở khóa tài khoản: ${user.username}`, AUTH.getCurrentUser().id);
        loadUserManagement();
    }
}

// Delete user
function deleteUser(userId) {
    const user = DATA.users.find(u => u.id === userId);
    if (user && confirm(`⚠️ XÓA người dùng "${user.username}"?\n\nHành động này không thể hoàn tác!`)) {
        const index = DATA.users.findIndex(u => u.id === userId);
        if (index > -1) {
            DATA.users.splice(index, 1);
            alert('✓ Đã xóa người dùng!');
            DATA.addAuditLog('DELETE_USER', `Xóa người dùng: ${user.username}`, AUTH.getCurrentUser().id);
            loadUserManagement();
        }
    }
}

// ============================================
// ADMIN DASHBOARD
// ============================================

function loadAdminDashboard() {
    const mainContent = document.getElementById('mainContent');
    
    // Initialize users if not exists
    if (!DATA.users) {
        DATA.users = [
            { id: 1, username: 'admin', name: 'Quản trị viên', email: 'admin@crm.com', role: 'admin', status: 'active', createdDate: '01/01/2024', lastLogin: '27/03/2026 10:30' },
            { id: 2, username: 'manager1', name: 'Nguyễn Văn A', email: 'manager1@crm.com', role: 'manager', status: 'active', createdDate: '15/01/2024', lastLogin: '27/03/2026 09:15' },
            { id: 3, username: 'staff1', name: 'Trần Minh Chiến', email: 'staff1@crm.com', role: 'employee', status: 'active', createdDate: '20/01/2024', lastLogin: '27/03/2026 08:45' },
            { id: 4, username: 'staff2', name: 'Lê Thị B', email: 'staff2@crm.com', role: 'employee', status: 'locked', createdDate: '25/01/2024', lastLogin: '20/03/2026 14:20' }
        ];
    }
    
    const totalUsers = DATA.users.length;
    const activeUsers = DATA.users.filter(u => u.status === 'active').length;
    const lockedUsers = DATA.users.filter(u => u.status === 'locked').length;
    const adminCount = DATA.users.filter(u => u.role === 'admin').length;
    const managerCount = DATA.users.filter(u => u.role === 'manager').length;
    const employeeCount = DATA.users.filter(u => u.role === 'employee').length;
    const recentLogs = DATA.auditLogs ? DATA.auditLogs.slice(-10).reverse() : [];
    
    mainContent.innerHTML = `
        <h2 class="page-title">Tổng quan Hệ thống</h2>
        
        <div style="background: #2B4856; padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(43,72,86,0.3);">
            <h3 style="margin-bottom: 10px; font-size: 24px;">
                <i class="fas fa-shield-alt"></i> Chào mừng, Admin!
            </h3>
            <p style="opacity: 0.9; margin: 0;">Quản lý và giám sát toàn bộ hệ thống CRM</p>
        </div>
        
        <div class="cards-container">
            <div class="card" style="background: #2B4856; color: white; box-shadow: 0 4px 12px rgba(43,72,86,0.2);">
                <div class="card-info">
                    <h3>Tổng Người dùng</h3>
                    <p style="font-size: 36px; font-weight: bold;">${totalUsers}</p>
                    <small style="opacity: 0.9;">${activeUsers} hoạt động, ${lockedUsers} bị khóa</small>
                </div>
                <div class="card-icon"><i class="fas fa-users"></i></div>
            </div>
            
            <div class="card" style="background: #3d5a6b; color: white; box-shadow: 0 4px 12px rgba(61,90,107,0.2);">
                <div class="card-info">
                    <h3>Admin</h3>
                    <p style="font-size: 36px; font-weight: bold;">${adminCount}</p>
                    <small style="opacity: 0.9;">Quản trị viên</small>
                </div>
                <div class="card-icon"><i class="fas fa-user-shield"></i></div>
            </div>
            
            <div class="card" style="background: #4f6f80; color: white; box-shadow: 0 4px 12px rgba(79,111,128,0.2);">
                <div class="card-info">
                    <h3>Trưởng phòng</h3>
                    <p style="font-size: 36px; font-weight: bold;">${managerCount}</p>
                    <small style="opacity: 0.9;">Manager</small>
                </div>
                <div class="card-icon"><i class="fas fa-user-tie"></i></div>
            </div>
            
            <div class="card" style="background: #618495; color: white; box-shadow: 0 4px 12px rgba(97,132,149,0.2);">
                <div class="card-info">
                    <h3>Nhân viên</h3>
                    <p style="font-size: 36px; font-weight: bold;">${employeeCount}</p>
                    <small style="opacity: 0.9;">Employee</small>
                </div>
                <div class="card-icon"><i class="fas fa-user"></i></div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 30px;">
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-chart-pie" style="color: #2B4856;"></i>
                    Phân bổ Vai trò
                </h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span><i class="fas fa-user-shield" style="color: #2B4856;"></i> Admin</span>
                            <strong>${adminCount} (${((adminCount/totalUsers)*100).toFixed(0)}%)</strong>
                        </div>
                        <div style="background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: #2B4856; height: 100%; width: ${(adminCount/totalUsers)*100}%;"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span><i class="fas fa-user-tie" style="color: #3d5a6b;"></i> Trưởng phòng</span>
                            <strong>${managerCount} (${((managerCount/totalUsers)*100).toFixed(0)}%)</strong>
                        </div>
                        <div style="background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: #3d5a6b; height: 100%; width: ${(managerCount/totalUsers)*100}%;"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span><i class="fas fa-user" style="color: #4f6f80;"></i> Nhân viên</span>
                            <strong>${employeeCount} (${((employeeCount/totalUsers)*100).toFixed(0)}%)</strong>
                        </div>
                        <div style="background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden;">
                            <div style="background: #4f6f80; height: 100%; width: ${(employeeCount/totalUsers)*100}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-tasks" style="color: #2B4856;"></i>
                    Truy cập Nhanh
                </h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" onclick="loadPage('user-management')" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-users-cog"></i> Quản lý Người dùng
                    </button>
                    <button class="btn btn-secondary" onclick="loadPage('settings')" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-cog"></i> Cấu hình Hệ thống
                    </button>
                    <button class="btn btn-secondary" onclick="viewAuditLogs()" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-history"></i> Lịch sử Hoạt động
                    </button>
                    <button class="btn btn-secondary" onclick="backupData()" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-download"></i> Sao lưu Dữ liệu
                    </button>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 20px;">
            <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-history" style="color: #2B4856;"></i>
                Hoạt động Gần đây
            </h3>
            
            ${recentLogs.length > 0 ? `
                <div style="max-height: 400px; overflow-y: auto;">
                    <table style="width: 100%;">
                        <thead>
                            <tr style="background: #f8fafc;">
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Thời gian</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Hành động</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Mô tả</th>
                                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Người thực hiện</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentLogs.map(log => `
                                <tr style="border-bottom: 1px solid #f1f5f9;">
                                    <td style="padding: 12px; color: #64748b;">${log.timestamp}</td>
                                    <td style="padding: 12px;">
                                        <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #2B4856;">
                                            ${log.action}
                                        </code>
                                    </td>
                                    <td style="padding: 12px;">${log.description}</td>
                                    <td style="padding: 12px; color: #64748b;">${log.userId}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 15px;">
                    <button class="btn btn-secondary" onclick="viewAuditLogs()">
                        Xem tất cả lịch sử
                    </button>
                </div>
            ` : `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có hoạt động nào</p>
                </div>
            `}
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 20px;">
            <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-users" style="color: #2B4856;"></i>
                Người dùng Mới nhất
            </h3>
            
            <table style="width: 100%;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Tên đăng nhập</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Họ tên</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Vai trò</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Trạng thái</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.users.slice(-5).reverse().map(user => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px;"><strong>${user.username}</strong></td>
                            <td style="padding: 12px;">${user.name}</td>
                            <td style="padding: 12px;">
                                <span class="status ${user.role === 'admin' ? 'customer' : user.role === 'manager' ? 'prospect' : 'lead'}">
                                    ${user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Trưởng phòng' : 'Nhân viên'}
                                </span>
                            </td>
                            <td style="padding: 12px;">
                                <span class="status ${user.status === 'active' ? 'customer' : 'lead'}">
                                    ${user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                            </td>
                            <td style="padding: 12px; color: #64748b;">${user.createdDate}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div style="text-align: center; margin-top: 15px;">
                <button class="btn btn-primary" onclick="loadPage('user-management')">
                    <i class="fas fa-users-cog"></i> Quản lý tất cả người dùng
                </button>
            </div>
        </div>
    `;
}


// ============================================
// QUẢN LÝ HỢP ĐỒNG - GIAO DỊCH
// ============================================

function loadContracts() {
    loadRevenueSync();
}

function loadCampaignExpenses() {
    loadCampaignExpensesPage();
}

// ============================================
// ĐỒNG BỘ DOANH THU (READ-ONLY) - INLINE
// ============================================

function loadRevenueSync() {
    const mainContent = document.getElementById('mainContent');
    const contracts = DATA.contracts || [];
    
    const totalRevenue = contracts
        .filter(c => c.status === 'Thắng')
        .reduce((sum, c) => sum + c.value, 0);
    
    const wonContracts = contracts.filter(c => c.status === 'Thắng').length;
    const negotiatingContracts = contracts.filter(c => c.status === 'Đang thương lượng').length;
    
    mainContent.innerHTML = `
        <h2 class="page-title">Đồng bộ Dữ liệu Doanh thu</h2>

        <!-- Thông báo quan trọng -->
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Về Dữ liệu Doanh thu
            </h3>
            <ul style="color: #1e40af; margin-left: 20px; line-height: 1.8;">
                <li>Dữ liệu hợp đồng được <strong>đồng bộ tự động</strong> từ phần mềm Sales/Kế toán của công ty</li>
                <li>Bảng này <strong>chỉ đọc (Read-Only)</strong> - không thể thêm/sửa/xóa trực tiếp</li>
                <li>Mục đích: Lấy giá trị hợp đồng để <strong>tính ROI</strong> cho các chiến dịch Marketing</li>
                <li>Để cập nhật dữ liệu, vui lòng sử dụng chức năng <strong>"Đồng bộ Ngay"</strong> hoặc <strong>"Import Excel"</strong></li>
            </ul>
        </div>

        <!-- Thống kê tổng quan -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Doanh thu</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalRevenue)}</div>
                <small style="opacity: 0.8;">Từ hợp đồng đã chốt</small>
            </div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Hợp đồng Thành công</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${wonContracts}</div>
                <small style="opacity: 0.8;">Đã chốt thành công</small>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Đang thương lượng</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${negotiatingContracts}</div>
                <small style="opacity: 0.8;">Chưa chốt</small>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Lần đồng bộ cuối</div>
                <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">Hôm nay, 14:30</div>
                <small style="opacity: 0.8;">Từ hệ thống Sales</small>
            </div>
        </div>

        <!-- Nút đồng bộ -->
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0 0 5px 0;">Đồng bộ Dữ liệu</h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Kết nối với hệ thống Sales/Kế toán để lấy dữ liệu hợp đồng mới nhất</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="importRevenueExcel()">
                        <i class="fas fa-file-excel"></i> Import Excel
                    </button>
                    <button class="btn btn-primary" onclick="syncRevenueNow()">
                        <i class="fas fa-sync-alt"></i> Đồng bộ Ngay
                    </button>
                </div>
            </div>
        </div>

        <!-- Bộ lọc -->
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Trạng thái</label>
                    <select id="filterContractStatus" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="">Tất cả</option>
                        <option value="Đang thương lượng">Đang thương lượng</option>
                        <option value="Thắng">Thắng (Đã chốt)</option>
                        <option value="Thua">Thua</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Chiến dịch</label>
                    <select id="filterContractCampaign" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="">Tất cả</option>
                        ${DATA.campaigns.filter(c => !c.deleted).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Từ ngày</label>
                    <input type="date" id="filterContractFromDate" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Đến ngày</label>
                    <input type="date" id="filterContractToDate" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                </div>
            </div>
        </div>

        <!-- Danh sách hợp đồng (Read-Only) -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Danh sách Hợp đồng (Chỉ đọc)</h3>
                <button class="btn btn-secondary" onclick="exportRevenueSyncToExcel()">
                    <i class="fas fa-download"></i> Xuất Excel
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Mã HĐ</th>
                        <th>Tên Hợp đồng</th>
                        <th>Khách hàng</th>
                        <th>Chiến dịch</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                        <th>Ngày chốt</th>
                        <th>Nguồn</th>
                    </tr>
                </thead>
                <tbody id="revenueSyncContractsTable">
                    ${renderRevenueSyncContractsTable(contracts)}
                </tbody>
            </table>
        </div>
    `;
}

function renderRevenueSyncContractsTable(contracts) {
    if (contracts.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có dữ liệu hợp đồng</p>
                    <p style="font-size: 13px;">Click "Đồng bộ Ngay" để lấy dữ liệu từ hệ thống Sales</p>
                </td>
            </tr>
        `;
    }
    
    return contracts.map(contract => `
        <tr>
            <td><strong>#${contract.id}</strong></td>
            <td>${contract.name}</td>
            <td>${contract.customerName}</td>
            <td>${contract.campaignName || '<em style="color: #94a3b8;">Không liên kết</em>'}</td>
            <td><strong style="color: #10b981;">${formatCurrency(contract.value)}</strong></td>
            <td>
                <span class="status ${getContractStatusClass(contract.status)}">
                    ${contract.status}
                </span>
            </td>
            <td>${contract.closeDate ? formatDate(contract.closeDate) : '<em style="color: #94a3b8;">Chưa chốt</em>'}</td>
            <td>
                <span class="status suspect" style="font-size: 11px;">
                    <i class="fas fa-sync-alt"></i> Đồng bộ API
                </span>
            </td>
        </tr>
    `).join('');
}

function getContractStatusClass(status) {
    const classes = {
        'Đang thương lượng': 'lead',
        'Thắng': 'customer',
        'Thua': 'suspect'
    };
    return classes[status] || '';
}

function filterRevenueSyncContracts() {
    const status = document.getElementById('filterContractStatus').value;
    const campaignId = document.getElementById('filterContractCampaign').value;
    const fromDate = document.getElementById('filterContractFromDate').value;
    const toDate = document.getElementById('filterContractToDate').value;
    
    let filtered = DATA.contracts || [];
    
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    
    if (campaignId) {
        filtered = filtered.filter(c => c.campaignId === parseInt(campaignId));
    }
    
    if (fromDate) {
        filtered = filtered.filter(c => new Date(c.createdDate) >= new Date(fromDate));
    }
    
    if (toDate) {
        filtered = filtered.filter(c => new Date(c.createdDate) <= new Date(toDate));
    }
    
    document.getElementById('revenueSyncContractsTable').innerHTML = renderRevenueSyncContractsTable(filtered);
}

function syncRevenueNow() {
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu từ hệ thống Sales...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        const newContracts = [
            {
                id: DATA.contracts.length + 1,
                name: 'Hợp đồng dịch vụ Digital Marketing Q2/2024',
                customerId: 1,
                customerName: 'Công ty ABC',
                campaignId: 1,
                campaignName: 'Chiến dịch Xuân 2024',
                value: 80000000,
                status: 'Thắng',
                createdDate: '2024-04-01',
                closeDate: '2024-04-03'
            },
            {
                id: DATA.contracts.length + 2,
                name: 'Hợp đồng tư vấn Marketing',
                customerId: 3,
                customerName: 'Công ty DEF',
                campaignId: 2,
                campaignName: 'Chiến dịch Email Marketing',
                value: 25000000,
                status: 'Đang thương lượng',
                createdDate: '2024-04-02',
                closeDate: null
            }
        ];
        
        DATA.contracts.push(...newContracts);
        
        alert(`✓ Đồng bộ thành công!\n\nĐã nhận ${newContracts.length} hợp đồng mới từ hệ thống Sales.\n\nDữ liệu đã được cập nhật và sẵn sàng để tính ROI.`);
        
        loadRevenueSync();
        DATA.addAuditLog('SYNC_REVENUE', `Đồng bộ ${newContracts.length} hợp đồng từ hệ thống Sales`, 'system');
    }, 2500);
}

function importRevenueExcel() {
    alert('📊 Chức năng Import Excel\n\n' +
          'Để import dữ liệu hợp đồng từ Excel:\n\n' +
          '1. Tải file mẫu Excel\n' +
          '2. Điền dữ liệu theo format\n' +
          '3. Upload file lên hệ thống\n' +
          '4. Hệ thống sẽ tự động import và cập nhật\n\n' +
          'Chức năng đang được phát triển!');
}

function exportRevenueSyncToExcel() {
    alert('📥 Xuất dữ liệu ra Excel\n\nChức năng đang được phát triển!');
}



// ============================================
// QUẢN LÝ CHI PHÍ CHIẾN DỊCH - INLINE
// ============================================

function loadCampaignExpensesPage() {
    const mainContent = document.getElementById('mainContent');
    const campaigns = DATA.campaigns.filter(c => !c.deleted) || [];
    const expenses = DATA.campaignExpenses || [];
    
    // Tính tổng chi phí cho từng chiến dịch
    campaigns.forEach(campaign => {
        const totalSpent = expenses
            .filter(e => e.campaignId === campaign.id)
            .reduce((sum, e) => sum + e.amount, 0);
        campaign.actualSpent = totalSpent;
    });
    
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
    const totalExpenses = expenses.length;
    const remaining = totalBudget - totalSpent;
    
    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 class="page-title">Quản lý Chi phí Chiến dịch</h2>
            <button class="btn btn-primary" onclick="openExpenseModalInline()">
                <i class="fas fa-plus"></i> Thêm Chi phí
            </button>
        </div>

        <!-- Thống kê tổng quan -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Ngân sách</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalBudget)}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Đã Chi</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalSpent)}</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Số Khoản chi</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${totalExpenses}</div>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Còn Lại</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(remaining)}</div>
            </div>
        </div>

        <!-- Thông báo hướng dẫn -->
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Hướng dẫn Quản lý Chi phí
            </h3>
            <ul style="color: #1e40af; margin-left: 20px; line-height: 1.8;">
                <li>Nhập các khoản chi phí thực tế cho từng chiến dịch</li>
                <li>Hệ thống tự động tổng hợp và cập nhật vào chiến dịch</li>
                <li>Theo dõi ngân sách và cảnh báo khi vượt mức</li>
                <li>Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ</li>
            </ul>
        </div>

        <!-- Danh sách chiến dịch -->
        <h3 style="margin-bottom: 15px;">Chiến dịch đang chạy</h3>
        <div id="campaignExpenseCards" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 40px;">
            ${renderCampaignExpenseCards(campaigns)}
        </div>

        <!-- Danh sách chi phí gần đây -->
        <h3 style="margin-bottom: 15px;">Chi phí gần đây</h3>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Chiến dịch</th>
                        <th>Tên Khoản chi</th>
                        <th>Loại</th>
                        <th>Số tiền</th>
                        <th>Ngày</th>
                        <th>Nguồn</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody id="expensesTableInline">
                    ${renderExpensesTableInline(expenses)}
                </tbody>
            </table>
        </div>
    `;
}

function renderCampaignExpenseCards(campaigns) {
    if (campaigns.length === 0) {
        return `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-bullhorn" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Chưa có chiến dịch nào</p>
            </div>
        `;
    }
    
    return campaigns.map(campaign => {
        const percentage = campaign.budget > 0 ? (campaign.actualSpent / campaign.budget * 100).toFixed(1) : 0;
        const isOverBudget = campaign.actualSpent > campaign.budget;
        
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ${isOverBudget ? '#ef4444' : '#3b82f6'};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${campaign.name}</h3>
                        <span class="status ${campaign.status === 'active' ? 'customer' : 'lead'}" style="font-size: 11px;">
                            ${campaign.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                        </span>
                    </div>
                    <button class="btn btn-primary" onclick="openExpenseModalInline(${campaign.id})" style="padding: 6px 12px; font-size: 13px;">
                        <i class="fas fa-plus"></i> Thêm chi phí
                    </button>
                </div>
                
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 13px; color: #64748b;">Ngân sách</span>
                        <strong style="font-size: 14px;">${formatCurrency(campaign.budget)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="font-size: 13px; color: #64748b;">Đã chi</span>
                        <strong style="font-size: 14px; color: ${isOverBudget ? '#ef4444' : '#10b981'};">
                            ${formatCurrency(campaign.actualSpent)}
                        </strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 13px; color: #64748b;">Còn lại</span>
                        <strong style="font-size: 14px; color: ${isOverBudget ? '#ef4444' : '#3b82f6'};">
                            ${formatCurrency(campaign.budget - campaign.actualSpent)}
                        </strong>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                    <div style="background: ${isOverBudget ? '#ef4444' : '#3b82f6'}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: ${isOverBudget ? '#ef4444' : '#64748b'};">
                    ${percentage}% ${isOverBudget ? '(Vượt ngân sách)' : ''}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-secondary" onclick="viewCampaignExpensesDetail(${campaign.id})" style="width: 100%; padding: 8px; font-size: 13px;">
                        <i class="fas fa-list"></i> Xem chi tiết chi phí
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderExpensesTableInline(expenses) {
    if (expenses.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-money-bill-wave" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có chi phí nào</p>
                </td>
            </tr>
        `;
    }
    
    return expenses.slice(0, 10).map(expense => `
        <tr>
            <td><strong>#${expense.id}</strong></td>
            <td>${expense.campaignName}</td>
            <td>${expense.name}</td>
            <td><span class="status lead">${expense.type}</span></td>
            <td><strong style="color: #ef4444;">${formatCurrency(expense.amount)}</strong></td>
            <td>${formatDate(expense.date)}</td>
            <td>
                <span class="status ${expense.source === 'Nhập thủ công' ? 'suspect' : 'customer'}" style="font-size: 11px;">
                    ${expense.source}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editExpenseInline(${expense.id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteExpenseInline(${expense.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

let editingExpenseIdInline = null;

function openExpenseModalInline(campaignId = null) {
    editingExpenseIdInline = null;
    
    const modalHTML = `
        <div id="expenseModalInline" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Thêm Chi phí</h2>
                    <button class="close-btn" onclick="closeExpenseModalInline()">&times;</button>
                </div>
                <form id="expenseFormInline" onsubmit="saveExpenseInline(event)">
                    <div class="form-group">
                        <label for="expenseCampaignInline">Chiến dịch *</label>
                        <select id="expenseCampaignInline" required>
                            <option value="">-- Chọn chiến dịch --</option>
                            ${DATA.campaigns.filter(c => !c.deleted).map(c => 
                                `<option value="${c.id}" ${campaignId === c.id ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="expenseNameInline">Tên Khoản chi *</label>
                        <input type="text" id="expenseNameInline" required placeholder="VD: Quảng cáo Facebook tuần 1">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label for="expenseTypeInline">Loại Chi phí *</label>
                            <select id="expenseTypeInline" required>
                                <option value="">-- Chọn loại --</option>
                                <option value="Quảng cáo trực tuyến">Quảng cáo trực tuyến</option>
                                <option value="Quảng cáo ngoài trời">Quảng cáo ngoài trời</option>
                                <option value="Thiết kế">Thiết kế</option>
                                <option value="Sản xuất nội dung">Sản xuất nội dung</option>
                                <option value="Sự kiện">Sự kiện</option>
                                <option value="In ấn">In ấn</option>
                                <option value="Nhân sự">Nhân sự</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="expenseAmountInline">Số tiền (VND) *</label>
                            <input type="number" id="expenseAmountInline" required min="0" step="1000" placeholder="0">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="expenseDateInline">Ngày ghi nhận *</label>
                        <input type="date" id="expenseDateInline" required>
                    </div>

                    <div class="form-group">
                        <label for="expenseNoteInline">Ghi chú</label>
                        <textarea id="expenseNoteInline" rows="3" placeholder="Mô tả chi tiết về khoản chi..."></textarea>
                    </div>

                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="color: #92400e; margin: 0; font-size: 13px;">
                            <i class="fas fa-info-circle"></i> 
                            Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ. 
                            Chỉ nhập thủ công các chi phí khác.
                        </p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeExpenseModalInline()">Hủy</button>
                        <button type="submit" class="btn btn-primary">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('expenseModalInline');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
    
    // Set today's date
    document.getElementById('expenseDateInline').valueAsDate = new Date();
}

function closeExpenseModalInline() {
    const modal = document.getElementById('expenseModalInline');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('modal-open');
}

function saveExpenseInline(event) {
    event.preventDefault();
    
    const campaignId = parseInt(document.getElementById('expenseCampaignInline').value);
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    
    const formData = {
        campaignId: campaignId,
        campaignName: campaign.name,
        name: document.getElementById('expenseNameInline').value,
        type: document.getElementById('expenseTypeInline').value,
        amount: parseFloat(document.getElementById('expenseAmountInline').value),
        date: document.getElementById('expenseDateInline').value,
        source: 'Nhập thủ công',
        note: document.getElementById('expenseNoteInline').value
    };
    
    if (editingExpenseIdInline) {
        const index = DATA.campaignExpenses.findIndex(e => e.id === editingExpenseIdInline);
        DATA.campaignExpenses[index] = { ...DATA.campaignExpenses[index], ...formData };
        alert('✓ Cập nhật chi phí thành công!');
    } else {
        const newExpense = {
            id: DATA.campaignExpenses.length > 0 ? Math.max(...DATA.campaignExpenses.map(e => e.id)) + 1 : 1,
            ...formData
        };
        DATA.campaignExpenses.push(newExpense);
        alert('✓ Thêm chi phí thành công!');
    }
    
    closeExpenseModalInline();
    loadCampaignExpensesPage();
    DATA.addAuditLog('ADD_EXPENSE', `Thêm chi phí: ${formData.name}`, AUTH.getCurrentUser().id);
}

function editExpenseInline(id) {
    const expense = DATA.campaignExpenses.find(e => e.id === id);
    if (!expense) return;
    
    editingExpenseIdInline = id;
    openExpenseModalInline(expense.campaignId);
    
    setTimeout(() => {
        document.getElementById('expenseNameInline').value = expense.name;
        document.getElementById('expenseTypeInline').value = expense.type;
        document.getElementById('expenseAmountInline').value = expense.amount;
        document.getElementById('expenseDateInline').value = expense.date;
        document.getElementById('expenseNoteInline').value = expense.note || '';
        document.querySelector('#expenseModalInline .modal-header h2').textContent = 'Sửa Chi phí';
    }, 100);
}

function deleteExpenseInline(id) {
    if (!confirm('Bạn có chắc muốn xóa chi phí này?')) return;
    
    DATA.campaignExpenses = DATA.campaignExpenses.filter(e => e.id !== id);
    loadCampaignExpensesPage();
    alert('✓ Đã xóa chi phí!');
    DATA.addAuditLog('DELETE_EXPENSE', `Xóa chi phí ID: ${id}`, AUTH.getCurrentUser().id);
}

function viewCampaignExpensesDetail(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    const expenses = DATA.campaignExpenses.filter(e => e.campaignId === campaignId);
    
    alert(`Chi tiết chi phí: ${campaign.name}\n\nTổng: ${expenses.length} khoản chi\nTổng tiền: ${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}`);
}
