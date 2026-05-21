// ============================================
// USER MANAGEMENT PAGE
// ============================================

function ensureUsers() {
    if (DATA.users && DATA.users.length) return DATA.users;

    DATA.users = (AUTH.users || []).map(user => ({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'active',
        createdDate: user.joinDate || '',
        lastLogin: 'Chưa có dữ liệu'
    }));

    return DATA.users;
}

function getUserRoleBadge(role) {
    const map = {
        admin: { className: 'customer', label: 'Admin' },
        manager: { className: 'prospect', label: 'Trưởng phòng' },
        employee: { className: 'lead', label: 'Nhân viên' }
    };
    return map[role] || map.employee;
}

function loadUserManagement() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const users = ensureUsers();

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Quản lý người dùng</h1>
                <p>Quản lý tài khoản và phân quyền cơ bản.</p>
            </div>
            <button class="btn btn-primary" onclick="openUserModal()">
                <i class="fas fa-user-plus"></i> Thêm người dùng
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card"><div class="stat-info"><h3>${users.length}</h3><p>Tổng người dùng</p></div></div>
            <div class="stat-card"><div class="stat-info"><h3>${users.filter(user => user.status === 'active').length}</h3><p>Đang hoạt động</p></div></div>
            <div class="stat-card"><div class="stat-info"><h3>${users.filter(user => user.role === 'manager').length}</h3><p>Trưởng phòng</p></div></div>
            <div class="stat-card"><div class="stat-info"><h3>${users.filter(user => user.role === 'admin').length}</h3><p>Admin</p></div></div>
        </div>

        <div class="data-table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Đăng nhập cuối</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => {
                        const role = getUserRoleBadge(user.role);
                        return `
                            <tr>
                                <td><strong>${user.username}</strong></td>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td><span class="status ${role.className}">${role.label}</span></td>
                                <td><span class="status ${user.status === 'active' ? 'customer' : 'lead'}">${user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}</span></td>
                                <td>${user.lastLogin || ''}</td>
                                <td>
                                    <button class="btn-edit" onclick="editUser(${user.id})">Sửa</button>
                                    ${user.status === 'active'
                                        ? `<button class="btn-delete" onclick="lockUser(${user.id})">Khóa</button>`
                                        : `<button class="btn-edit" onclick="unlockUser(${user.id})">Mở</button>`}
                                    ${user.role !== 'admin' ? `<button class="btn-delete" onclick="deleteUser(${user.id})">Xóa</button>` : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin-top:20px;">
            <strong>Phân quyền hiện tại:</strong>
            <span>Admin quản trị toàn hệ thống, Trưởng phòng quản lý khách hàng/chiến dịch/báo cáo, Nhân viên thao tác dữ liệu được phân công.</span>
        </div>
    `;
}

function openUserModal(userId = null) {
    const users = ensureUsers();
    const user = userId ? users.find(item => Number(item.id) === Number(userId)) : null;
    const isEdit = !!user;
    let modal = document.getElementById('userModal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'userModal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${isEdit ? 'Cập nhật người dùng' : 'Thêm người dùng'}</h2>
                <button class="close-btn" onclick="closeModal('userModal')">&times;</button>
            </div>
            <form id="userForm" onsubmit="saveUser(event, ${isEdit ? user.id : 'null'})">
                <div class="form-group">
                    <label>Tên đăng nhập *</label>
                    <input id="userUsername" value="${user?.username || ''}" ${isEdit ? 'readonly' : ''} required>
                </div>
                <div class="form-group">
                    <label>Họ tên *</label>
                    <input id="userFullName" value="${user?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>Email *</label>
                    <input type="email" id="userEmail" value="${user?.email || ''}" required>
                </div>
                <div class="form-group">
                    <label>Vai trò *</label>
                    <select id="userRoleSelect" required>
                        <option value="employee" ${user?.role === 'employee' ? 'selected' : ''}>Nhân viên</option>
                        <option value="manager" ${user?.role === 'manager' ? 'selected' : ''}>Trưởng phòng</option>
                        <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('userModal')">Hủy</button>
                    <button type="submit" class="btn btn-primary">Lưu</button>
                </div>
            </form>
        </div>
    `;

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function saveUser(event, userId) {
    if (event) event.preventDefault();

    const users = ensureUsers();
    const payload = {
        username: document.getElementById('userUsername')?.value.trim(),
        name: document.getElementById('userFullName')?.value.trim(),
        email: document.getElementById('userEmail')?.value.trim(),
        role: document.getElementById('userRoleSelect')?.value
    };

    if (!payload.username || !payload.name || !payload.email || !payload.role) {
        alert('Vui lòng nhập đầy đủ thông tin người dùng.');
        return;
    }

    if (userId) {
        const user = users.find(item => Number(item.id) === Number(userId));
        if (user) Object.assign(user, payload);
        DATA.addAuditLog?.('UPDATE_USER', `Cập nhật người dùng: ${payload.username}`, AUTH.getCurrentUser()?.id);
    } else {
        if (users.some(item => item.username === payload.username)) {
            alert('Tên đăng nhập đã tồn tại.');
            return;
        }

        users.push({
            id: Math.max(0, ...users.map(item => Number(item.id) || 0)) + 1,
            ...payload,
            status: 'active',
            createdDate: new Date().toLocaleDateString('vi-VN'),
            lastLogin: 'Chưa đăng nhập'
        });
        DATA.addAuditLog?.('ADD_USER', `Thêm người dùng: ${payload.username}`, AUTH.getCurrentUser()?.id);
    }

    closeModal('userModal');
    loadUserManagement();
}

function editUser(userId) {
    openUserModal(userId);
}

function lockUser(userId) {
    const user = ensureUsers().find(item => Number(item.id) === Number(userId));
    if (!user || !confirm(`Khóa tài khoản "${user.username}"?`)) return;

    user.status = 'locked';
    DATA.addAuditLog?.('LOCK_USER', `Khóa tài khoản: ${user.username}`, AUTH.getCurrentUser()?.id);
    loadUserManagement();
}

function unlockUser(userId) {
    const user = ensureUsers().find(item => Number(item.id) === Number(userId));
    if (!user || !confirm(`Mở khóa tài khoản "${user.username}"?`)) return;

    user.status = 'active';
    DATA.addAuditLog?.('UNLOCK_USER', `Mở khóa tài khoản: ${user.username}`, AUTH.getCurrentUser()?.id);
    loadUserManagement();
}

function deleteUser(userId) {
    const user = ensureUsers().find(item => Number(item.id) === Number(userId));
    if (!user || !confirm(`Xóa người dùng "${user.username}"?`)) return;

    DATA.users = DATA.users.filter(item => Number(item.id) !== Number(userId));
    DATA.addAuditLog?.('DELETE_USER', `Xóa người dùng: ${user.username}`, AUTH.getCurrentUser()?.id);
    loadUserManagement();
}
