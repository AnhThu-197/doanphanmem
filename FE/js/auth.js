// Quản lý authentication và authorization
const AUTH = {
    currentUser: null,
    
    // Dữ liệu người dùng mock
    users: [
        { id: 1, username: 'nhanvien', password: '123', name: 'Trần Minh Chiến', role: 'employee', email: 'chien@company.com', phone: '0987654321', avatar: 'TC', department: 'Marketing', position: 'Nhân viên marketing', joinDate: '15/06/2023', manager: 'Nguyễn Hoàng Anh Thư' },
        { id: 2, username: 'truongphong', password: '123', name: 'Nguyễn Hoàng Anh Thư', role: 'manager', email: 'manager@company.com', phone: '0912345678', avatar: 'NB', department: 'Marketing', position: 'Trưởng phòng', joinDate: '10/01/2022', manager: 'Admin System' },
        { id: 3, username: 'admin', password: '123', name: 'Admin System', role: 'admin', email: 'admin@company.com', phone: '0901234567', avatar: 'AS', department: 'IT', position: 'Quản trị viên', joinDate: '01/01/2021', manager: '' }
    ],
    
    // Đăng nhập
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = { ...user };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            if (typeof DATA !== 'undefined') {
                DATA.addAuditLog('LOGIN', `Người dùng ${user.name} đăng nhập`, user.id);
            }
            return { success: true, user: this.currentUser };
        }
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    },
    
    // Đăng xuất
    logout() {
        if (this.currentUser) {
            if (typeof DATA !== 'undefined') {
                DATA.addAuditLog('LOGOUT', `Người dùng ${this.currentUser.name} đăng xuất`, this.currentUser.id);
            }
        }
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },
    
    // Kiểm tra đăng nhập
    isLoggedIn() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        return this.currentUser !== null;
    },
    
    // Lấy user hiện tại
    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
            }
        }
        
        // Luôn cập nhật dữ liệu mới nhất từ users array
        if (this.currentUser) {
            const freshUser = this.users.find(u => u.id === this.currentUser.id);
            if (freshUser) {
                this.currentUser = { ...freshUser };
            }
        }
        
        return this.currentUser;
    },
    
    // Kiểm tra quyền
    hasPermission(action) {
        if (!this.currentUser) return false;
        
        const permissions = {
            'employee': ['view_customer', 'add_customer', 'edit_customer', 'view_interaction', 'add_interaction', 'edit_interaction', 'view_campaign', 'view_report', 'view_profile', 'edit_profile', 'change_password'],
            'manager': ['view_customer', 'add_customer', 'edit_customer', 'delete_customer', 'view_interaction', 'add_interaction', 'edit_interaction', 'delete_interaction', 'view_campaign', 'add_campaign', 'edit_campaign', 'delete_campaign', 'view_report', 'export_report', 'manage_templates', 'assign_customers', 'export_customers', 'view_profile', 'edit_profile', 'change_password', 'manage_employees'],
            'admin': ['*']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes('*') || userPermissions.includes(action);
    },
    
    // Cập nhật thông tin cá nhân
    updateProfile(updates) {
        if (this.currentUser) {
            Object.assign(this.currentUser, updates);
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex > -1) {
                Object.assign(this.users[userIndex], updates);
            }
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            if (typeof DATA !== 'undefined') {
                DATA.addAuditLog('UPDATE_PROFILE', `Cập nhật thông tin cá nhân`, this.currentUser.id);
            }
            return this.currentUser;
        }
        return null;
    },
    
    // Đổi mật khẩu
    changePassword(oldPassword, newPassword) {
        if (this.currentUser) {
            const user = this.users.find(u => u.id === this.currentUser.id);
            if (user && user.password === oldPassword) {
                user.password = newPassword;
                this.currentUser.password = newPassword;
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                if (typeof DATA !== 'undefined') {
                    DATA.addAuditLog('CHANGE_PASSWORD', `Đổi mật khẩu`, this.currentUser.id);
                }
                return { success: true, message: 'Đổi mật khẩu thành công' };
            }
            return { success: false, message: 'Mật khẩu cũ không đúng' };
        }
        return { success: false, message: 'Chưa đăng nhập' };
    },
    
    // Quên mật khẩu
    resetPassword(email) {
        const user = this.users.find(u => u.email === email);
        if (user) {
            const newPassword = Math.random().toString(36).substring(2, 10);
            user.password = newPassword;
            if (typeof DATA !== 'undefined') {
                DATA.addAuditLog('RESET_PASSWORD', `Đặt lại mật khẩu cho ${user.name}`, 0);
            }
            return { success: true, message: `Mật khẩu mới: ${newPassword} (Vui lòng kiểm tra email)` };
        }
        return { success: false, message: 'Email không tồn tại trong hệ thống' };
    },
    
    // Quản lý người dùng (Admin)
    addUser(userData) {
        const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
        const newUser = { ...userData, id: newId };
        this.users.push(newUser);
        if (typeof DATA !== 'undefined' && this.currentUser) {
            DATA.addAuditLog('ADD_USER', `Thêm người dùng: ${userData.name}`, this.currentUser.id);
        }
        return newUser;
    },
    
    // Cập nhật người dùng (Admin)
    updateUser(userId, updates) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            Object.assign(user, updates);
            if (typeof DATA !== 'undefined' && this.currentUser) {
                DATA.addAuditLog('UPDATE_USER', `Cập nhật người dùng: ${user.name}`, this.currentUser.id);
            }
            return user;
        }
        return null;
    },
    
    // Xóa người dùng (Admin)
    deleteUser(userId) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index > -1) {
            const user = this.users[index];
            this.users.splice(index, 1);
            if (typeof DATA !== 'undefined' && this.currentUser) {
                DATA.addAuditLog('DELETE_USER', `Xóa người dùng: ${user.name}`, this.currentUser.id);
            }
            return true;
        }
        return false;
    }
};

// Khởi tạo auth khi trang load
document.addEventListener('DOMContentLoaded', function() {
    if (!AUTH.isLoggedIn() && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }
});
