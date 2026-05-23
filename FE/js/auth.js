const AUTH = {
    currentUser: null,

    users: [
        { id: 1, username: 'nhanvien', password: '123', name: 'Trần Minh Chiến', role: 'employee', email: 'chien@company.com', phone: '0987654321', avatar: 'TC', department: 'Marketing', position: 'Nhân viên marketing', joinDate: '15/06/2023', manager: 'Nguyễn Hoàng Anh Thư', authSource: 'mock' },
        { id: 2, username: 'truongphong', password: '123', name: 'Nguyễn Hoàng Anh Thư', role: 'manager', email: 'manager@company.com', phone: '0912345678', avatar: 'NB', department: 'Marketing', position: 'Trưởng phòng', joinDate: '10/01/2022', manager: 'Admin System', authSource: 'mock' },
        { id: 3, username: 'admin', password: '123', name: 'Admin System', role: 'admin', email: 'admin@company.com', phone: '0901234567', avatar: 'AS', department: 'IT', position: 'Quản trị viên', joinDate: '01/01/2021', manager: '', authSource: 'mock' }
    ],

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
        }

        this.currentUser = { ...user, authSource: 'mock' };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        if (typeof DATA !== 'undefined') {
            DATA.addAuditLog('LOGIN', `Người dùng ${user.name} đăng nhập`, user.id);
        }
        return { success: true, user: this.currentUser };
    },

    async loginApi(email, password) {
        if (typeof API_SERVICES === 'undefined' || typeof API_CLIENT === 'undefined') {
            return { success: false, message: 'Chưa cấu hình API client phía FE' };
        }

        try {
            const response = await API_SERVICES.auth.login(email, password);
            const data = response.data;

            API_CLIENT.setToken(data.token);
            this.currentUser = this.mapApiUser(data);
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, message: error.message || 'Đăng nhập thất bại' };
        }
    },

    mapApiUser(data) {
        const role = this.mapApiRole(data.vaiTro);
        const name = data.hoTen || data.email;

        return {
            id: data.maTaiKhoan,
            employeeId: data.maNhanVien,
            username: data.email,
            name,
            role,
            email: data.email,
            avatar: this.buildAvatar(name),
            position: data.chucVu || this.getRoleLabel(role),
            phone: data.soDienThoai || '',
            address: data.diaChiChiTiet || '',
            birthday: data.ngaySinh || '',
            gender: data.gioiTinh || '',
            joinDate: data.ngayVaoLam || '',
            ward: data.tenPhuongXa || '',
            province: data.tenTinhThanh || '',
            department: 'Marketing',
            token: data.token,
            tokenType: data.tokenType || 'Bearer',
            authSource: 'api'
        };
    },

    async refreshProfile() {
        if (!this.currentUser || this.currentUser.authSource !== 'api') {
            return { success: true, user: this.currentUser };
        }

        if (typeof API_SERVICES === 'undefined') {
            return { success: false, message: 'Chưa cấu hình API client phía FE' };
        }

        try {
            const response = await API_SERVICES.profile.me();
            const profileUser = this.mapApiUser({
                ...response.data,
                token: this.currentUser.token,
                tokenType: this.currentUser.tokenType
            });

            this.currentUser = {
                ...this.currentUser,
                ...profileUser
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

            return { success: true, user: this.currentUser };
        } catch (error) {
            return { success: false, message: error.message || 'Không tải được hồ sơ cá nhân' };
        }
    },

    mapApiRole(vaiTro) {
        const role = (vaiTro || '').toString().trim().toUpperCase();
        if (role === 'ADMIN' || role.includes('ADMIN')) return 'admin';
        if (role === 'MANAGER' || role.includes('TRUONG') || role.includes('TRƯỞNG')) return 'manager';
        return 'employee';
    },

    buildAvatar(name) {
        return (name || 'U')
            .split(' ')
            .filter(Boolean)
            .slice(-2)
            .map(part => part.charAt(0).toUpperCase())
            .join('');
    },

    getRoleLabel(role) {
        if (role === 'admin') return 'Quản trị viên';
        if (role === 'manager') return 'Trưởng phòng';
        return 'Nhân viên Marketing';
    },

    logout() {
        if (this.currentUser && typeof DATA !== 'undefined') {
            DATA.addAuditLog('LOGOUT', `Người dùng ${this.currentUser.name} đăng xuất`, this.currentUser.id);
        }

        this.currentUser = null;
        localStorage.removeItem('currentUser');
        if (typeof API_CLIENT !== 'undefined') {
            API_CLIENT.clearToken();
        }
    },

    isLoggedIn() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser !== null;
    },

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }

        if (this.currentUser && this.currentUser.authSource !== 'api') {
            const freshUser = this.users.find(u => u.id === this.currentUser.id);
            if (freshUser) {
                this.currentUser = { ...freshUser, authSource: 'mock' };
            }
        }

        return this.currentUser;
    },

    hasPermission(action) {
        if (!this.currentUser) return false;

        const permissions = {
            employee: ['view_customer', 'add_customer', 'edit_customer', 'view_interaction', 'add_interaction', 'edit_interaction', 'view_campaign', 'view_report', 'view_profile', 'edit_profile', 'change_password'],
            manager: ['view_customer', 'add_customer', 'edit_customer', 'delete_customer', 'view_interaction', 'add_interaction', 'edit_interaction', 'delete_interaction', 'view_campaign', 'add_campaign', 'edit_campaign', 'delete_campaign', 'view_report', 'export_report', 'manage_templates', 'assign_customers', 'export_customers', 'view_profile', 'edit_profile', 'change_password', 'manage_employees'],
            admin: ['*']
        };

        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(action);
    },

    updateProfile(updates) {
        if (!this.currentUser) return null;

        Object.assign(this.currentUser, updates);
        if (this.currentUser.authSource !== 'api') {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex > -1) {
                Object.assign(this.users[userIndex], updates);
            }
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        if (typeof DATA !== 'undefined') {
            DATA.addAuditLog('UPDATE_PROFILE', 'Cập nhật thông tin cá nhân', this.currentUser.id);
        }
        return this.currentUser;
    },

    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, message: 'Chưa đăng nhập' };
        }

        if (this.currentUser.authSource === 'api') {
            return { success: false, message: 'Đổi mật khẩu API sẽ nối ở bước sau' };
        }

        const user = this.users.find(u => u.id === this.currentUser.id);
        if (user && user.password === oldPassword) {
            user.password = newPassword;
            this.currentUser.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            if (typeof DATA !== 'undefined') {
                DATA.addAuditLog('CHANGE_PASSWORD', 'Đổi mật khẩu', this.currentUser.id);
            }
            return { success: true, message: 'Đổi mật khẩu thành công' };
        }
        return { success: false, message: 'Mật khẩu cũ không đúng' };
    },

    resetPassword(email) {
        const user = this.users.find(u => u.email === email);
        if (!user) {
            return { success: false, message: 'Email không tồn tại trong hệ thống' };
        }

        const newPassword = Math.random().toString(36).substring(2, 10);
        user.password = newPassword;
        if (typeof DATA !== 'undefined') {
            DATA.addAuditLog('RESET_PASSWORD', `Đặt lại mật khẩu cho ${user.name}`, 0);
        }
        return { success: true, message: `Mật khẩu mới: ${newPassword} (Vui lòng kiểm tra email)` };
    },

    addUser(userData) {
        const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
        const newUser = { ...userData, id: newId, authSource: 'mock' };
        this.users.push(newUser);
        if (typeof DATA !== 'undefined' && this.currentUser) {
            DATA.addAuditLog('ADD_USER', `Thêm người dùng: ${userData.name}`, this.currentUser.id);
        }
        return newUser;
    },

    updateUser(userId, updates) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return null;

        Object.assign(user, updates);
        if (typeof DATA !== 'undefined' && this.currentUser) {
            DATA.addAuditLog('UPDATE_USER', `Cập nhật người dùng: ${user.name}`, this.currentUser.id);
        }
        return user;
    },

    deleteUser(userId) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index === -1) return false;

        const user = this.users[index];
        this.users.splice(index, 1);
        if (typeof DATA !== 'undefined' && this.currentUser) {
            DATA.addAuditLog('DELETE_USER', `Xóa người dùng: ${user.name}`, this.currentUser.id);
        }
        return true;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isLoggedIn() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }
});
