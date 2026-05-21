// ============================================
// TRANG TỔNG QUAN (DASHBOARD)
// ============================================

function renderDashboardHTML(stats, customers, user) {
    const canDelete = user && user.role !== 'employee';
    const totalCustomers = stats.tongKhachHang ?? 0;
    const totalCampaigns = stats.chienDichDangChay ?? stats.tongChienDich ?? 0;
    const doanhThu = stats.tongDoanhThu != null
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.tongDoanhThu)
        : '0 VND';
    const khachDungThu = stats.khachDangDungThu ?? 0;

    const customerRows = customers.slice(0, 5).map(c => {
        const id    = c.maKhachHang ?? c.id;
        const name  = c.hoTen       ?? c.name;
        const email = c.email;
        const phone = c.soDienThoai ?? c.phone;
        const { cssClass, label } = mapTrangThaiKhach(c.trangThaiKhach ?? c.status);

        let actionButtons = `<button class="btn-view" onclick="viewCustomer(${id})">Xem</button>`;
        if (canDelete) {
            actionButtons += `<button class="btn-delete" onclick="deleteCustomer(${id})">Xóa</button>`;
        } else {
            actionButtons += `<button class="btn-delete" onclick="requestDeleteCustomer(${id})">Đề nghị Xóa</button>`;
        }
        return `
            <tr>
                <td>${name}</td>
                <td>${email}</td>
                <td>${phone}</td>
                <td><span class="status ${cssClass}">${label}</span></td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');

    return `
        <h2 class="page-title">Tổng quan</h2>
        <div class="cards-container">
            <div class="card">
                <div class="card-info">
                    <h3>Tổng Khách hàng</h3>
                    <p id="dashTotalCustomers">${totalCustomers}</p>
                </div>
                <div class="card-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Chiến dịch Hoạt động</h3>
                    <p id="dashTotalCampaigns">${totalCampaigns}</p>
                </div>
                <div class="card-icon"><i class="fas fa-bullhorn"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Đang dùng thử</h3>
                    <p id="dashTrialCustomers">${khachDungThu}</p>
                </div>
                <div class="card-icon"><i class="fas fa-hourglass-start"></i></div>
            </div>
            <div class="card">
                <div class="card-info">
                    <h3>Doanh thu tháng</h3>
                    <p id="dashRevenue" style="font-size: 16px;">${doanhThu}</p>
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
                <tbody id="dashCustomersTable">
                    ${customerRows || '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Chưa có dữ liệu</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

async function loadDashboard() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();

    if (user && user.role === 'admin') {
        loadAdminDashboard();
        return;
    }

    mainContent.innerHTML = `
        <h2 class="page-title">Tổng quan</h2>
        <div class="cards-container">
            ${[1,2,3,4].map(() => `
                <div class="card" style="opacity:0.5;">
                    <div class="card-info"><h3>Đang tải...</h3><p>—</p></div>
                    <div class="card-icon"><i class="fas fa-spinner fa-spin"></i></div>
                </div>
            `).join('')}
        </div>
        <div class="table-container" style="opacity:0.5; padding:30px; text-align:center; color:#94a3b8;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </div>
    `;

    if (user && user.authSource === 'api') {
        try {
            const [statsRes, customersRes] = await Promise.all([
                API_SERVICES.baoCao.tongQuan(),
                API_SERVICES.khachHang.list()
            ]);
            const stats     = statsRes.data ?? statsRes;
            const customers = Array.isArray(customersRes.data)
                ? customersRes.data
                : (customersRes.data?.content ?? customersRes.data ?? []);
            mainContent.innerHTML = renderDashboardHTML(stats, customers, user);
            return;
        } catch (err) {
            console.warn('[Dashboard] API thất bại, fallback mock:', err.message);
        }
    }

    // Fallback mock
    const stats = {
        tongKhachHang:     DATA.customers.filter(c => !c.deleted).length,
        chienDichDangChay: DATA.campaigns.filter(c => !c.deleted).length,
        tongDoanhThu:      null,
        khachDangDungThu:  DATA.customers.filter(c => c.trialStartDate && !c.deleted).length
    };
    const customers = DATA.customers.filter(c => !c.deleted).map(c => ({
        maKhachHang:    c.id,
        hoTen:          c.name,
        email:          c.email,
        soDienThoai:    c.phone,
        trangThaiKhach: getStatusLabel(c.status)
    }));
    mainContent.innerHTML = renderDashboardHTML(stats, customers, user);
}

function loadAdminDashboard() {
    const mainContent = document.getElementById('mainContent');

    if (!DATA.users) {
        DATA.users = [
            { id: 1, username: 'admin',    name: 'Quản trị viên',   email: 'admin@crm.com',    role: 'admin',    status: 'active', createdDate: '01/01/2024', lastLogin: '27/03/2026 10:30' },
            { id: 2, username: 'manager1', name: 'Nguyễn Văn A',    email: 'manager1@crm.com', role: 'manager',  status: 'active', createdDate: '15/01/2024', lastLogin: '27/03/2026 09:15' },
            { id: 3, username: 'staff1',   name: 'Trần Minh Chiến', email: 'staff1@crm.com',   role: 'employee', status: 'active', createdDate: '20/01/2024', lastLogin: '27/03/2026 08:45' },
            { id: 4, username: 'staff2',   name: 'Lê Thị B',        email: 'staff2@crm.com',   role: 'employee', status: 'locked', createdDate: '25/01/2024', lastLogin: '20/03/2026 14:20' }
        ];
    }

    const totalUsers    = DATA.users.length;
    const activeUsers   = DATA.users.filter(u => u.status === 'active').length;
    const lockedUsers   = DATA.users.filter(u => u.status === 'locked').length;
    const adminCount    = DATA.users.filter(u => u.role === 'admin').length;
    const managerCount  = DATA.users.filter(u => u.role === 'manager').length;
    const employeeCount = DATA.users.filter(u => u.role === 'employee').length;
    const recentLogs    = DATA.auditLogs ? DATA.auditLogs.slice(-10).reverse() : [];

    mainContent.innerHTML = `
        <h2 class="page-title">Tổng quan Hệ thống</h2>

        <div style="background: #2B4856; padding: 30px; border-radius: 12px; color: white; margin-bottom: 30px;">
            <h3 style="margin-bottom: 10px; font-size: 24px;"><i class="fas fa-shield-alt"></i> Chào mừng, Admin!</h3>
            <p style="opacity: 0.9; margin: 0;">Quản lý và giám sát toàn bộ hệ thống CRM</p>
        </div>

        <div class="cards-container">
            <div class="card" style="background: #2B4856; color: white;">
                <div class="card-info">
                    <h3>Tổng Người dùng</h3>
                    <p style="font-size: 36px; font-weight: bold;">${totalUsers}</p>
                    <small style="opacity: 0.9;">${activeUsers} hoạt động, ${lockedUsers} bị khóa</small>
                </div>
                <div class="card-icon"><i class="fas fa-users"></i></div>
            </div>
            <div class="card" style="background: #3d5a6b; color: white;">
                <div class="card-info">
                    <h3>Admin</h3>
                    <p style="font-size: 36px; font-weight: bold;">${adminCount}</p>
                    <small style="opacity: 0.9;">Quản trị viên</small>
                </div>
                <div class="card-icon"><i class="fas fa-user-shield"></i></div>
            </div>
            <div class="card" style="background: #4f6f80; color: white;">
                <div class="card-info">
                    <h3>Trưởng phòng</h3>
                    <p style="font-size: 36px; font-weight: bold;">${managerCount}</p>
                    <small style="opacity: 0.9;">Manager</small>
                </div>
                <div class="card-icon"><i class="fas fa-user-tie"></i></div>
            </div>
            <div class="card" style="background: #618495; color: white;">
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
                <h3 style="margin-bottom: 20px;"><i class="fas fa-chart-pie" style="color: #2B4856;"></i> Phân bổ Vai trò</h3>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${[
                        { label: 'Admin', count: adminCount, color: '#2B4856', icon: 'user-shield' },
                        { label: 'Trưởng phòng', count: managerCount, color: '#3d5a6b', icon: 'user-tie' },
                        { label: 'Nhân viên', count: employeeCount, color: '#4f6f80', icon: 'user' }
                    ].map(r => `
                        <div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span><i class="fas fa-${r.icon}" style="color: ${r.color};"></i> ${r.label}</span>
                                <strong>${r.count} (${((r.count/totalUsers)*100).toFixed(0)}%)</strong>
                            </div>
                            <div style="background: #f1f5f9; height: 10px; border-radius: 5px; overflow: hidden;">
                                <div style="background: ${r.color}; height: 100%; width: ${(r.count/totalUsers)*100}%;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin-bottom: 20px;"><i class="fas fa-tasks" style="color: #2B4856;"></i> Truy cập Nhanh</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-primary" onclick="loadPage('user-management')" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-users-cog"></i> Quản lý Người dùng
                    </button>
                    <button class="btn btn-secondary" onclick="loadPage('settings')" style="width: 100%; justify-content: flex-start; padding: 15px;">
                        <i class="fas fa-cog"></i> Cấu hình Hệ thống
                    </button>
                </div>
            </div>
        </div>

        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-top: 20px;">
            <h3 style="margin-bottom: 20px;"><i class="fas fa-history" style="color: #2B4856;"></i> Hoạt động Gần đây</h3>
            ${recentLogs.length > 0 ? `
                <table style="width: 100%;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="padding: 12px; text-align: left;">Thời gian</th>
                            <th style="padding: 12px; text-align: left;">Hành động</th>
                            <th style="padding: 12px; text-align: left;">Mô tả</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentLogs.map(log => `
                            <tr style="border-bottom: 1px solid #f1f5f9;">
                                <td style="padding: 12px; color: #64748b;">${log.timestamp}</td>
                                <td style="padding: 12px;"><code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${log.action}</code></td>
                                <td style="padding: 12px;">${log.description}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-history" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có hoạt động nào</p>
                </div>
            `}
        </div>
    `;
}
