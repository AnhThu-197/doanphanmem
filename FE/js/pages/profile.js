// ============================================
// HỒ SƠ CÁ NHÂN & ĐỔI MẬT KHẨU
// ============================================

async function loadProfile() {
    const mainContent = document.getElementById('mainContent');
    let user = AUTH.getCurrentUser();

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Hồ sơ cá nhân</h1>
                <p>Xem và cập nhật thông tin tài khoản của bạn.</p>
            </div>
        </div>
        <div class="profile-layout">
            <div class="profile-sidebar-card">
                <p style="color: var(--text-muted); font-size: 13px;">Đang tải...</p>
            </div>
            <div class="profile-main-card">
                <p style="color: var(--text-muted); font-size: 13px;">Đang tải...</p>
            </div>
        </div>
    `;

    if (user && user.authSource === 'api') {
        const result = await AUTH.refreshProfile();
        if (!result.success) {
            mainContent.querySelector('.profile-sidebar-card').innerHTML =
                `<p style="color: var(--danger-text); font-size: 13px;">${result.message}</p>`;
            return;
        }
        user = result.user;
    }

    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

    const initials = (user.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    const roleLabel = getRoleLabel(user.role);

    mainContent.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Hồ sơ cá nhân</h1>
                <p>Xem và cập nhật thông tin tài khoản của bạn.</p>
            </div>
        </div>

        <div class="profile-layout">
            <!-- Left: Avatar card -->
            <div class="profile-sidebar-card">
                <div class="profile-avatar-lg">${initials}</div>
                <div class="profile-name">${esc(user.name)}</div>
                <div class="profile-role-label">${roleLabel}</div>
                ${user.department ? `<div class="profile-dept">${esc(user.department)}</div>` : ''}

                <div class="profile-meta-list">
                    ${user.email ? `
                    <div class="profile-meta-item">
                        <i class="fas fa-envelope"></i>
                        <span>${esc(user.email)}</span>
                    </div>` : ''}
                    ${user.phone ? `
                    <div class="profile-meta-item">
                        <i class="fas fa-phone"></i>
                        <span>${esc(user.phone)}</span>
                    </div>` : ''}
                    ${user.joinDate ? `
                    <div class="profile-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>Vào làm ${esc(user.joinDate)}</span>
                    </div>` : ''}
                </div>

                <button type="button" class="btn btn-secondary" onclick="openPasswordModal()" style="width: 100%; margin-top: 8px;">
                    <i class="fas fa-lock"></i> Đổi mật khẩu
                </button>
            </div>

            <!-- Right: Edit form -->
            <div class="profile-main-card">
                <form id="profilePageForm" onsubmit="saveProfilePage(event)">
                    <div class="profile-section">
                        <div class="profile-section-title">Thông tin cá nhân</div>
                        <div class="profile-form-grid">
                            <div class="form-group">
                                <label for="profilePageName">Họ và tên *</label>
                                <input type="text" id="profilePageName" value="${esc(user.name)}" required placeholder="Nhập họ và tên">
                            </div>
                            <div class="form-group">
                                <label for="profilePageEmail">Email *</label>
                                <input type="email" id="profilePageEmail" value="${esc(user.email)}" required placeholder="email@example.com">
                            </div>
                            <div class="form-group">
                                <label for="profilePagePhone">Số điện thoại</label>
                                <input type="tel" id="profilePagePhone" value="${esc(user.phone)}" placeholder="0xxxxxxxxx">
                            </div>
                            <div class="form-group">
                                <label for="profilePageAddress">Địa chỉ</label>
                                <input type="text" id="profilePageAddress" value="${esc(user.address)}" placeholder="Số nhà, đường...">
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <div class="profile-section-title">Thông tin hệ thống <span class="profile-readonly-note">(chỉ đọc)</span></div>
                        <div class="profile-info-grid">
                            <div class="profile-info-item">
                                <span class="profile-info-label">Vai trò</span>
                                <span class="profile-info-value">${roleLabel}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Phòng ban</span>
                                <span class="profile-info-value">${esc(user.department || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Chức vụ</span>
                                <span class="profile-info-value">${esc(user.position || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Ngày vào làm</span>
                                <span class="profile-info-value">${esc(user.joinDate || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Ngày sinh</span>
                                <span class="profile-info-value">${esc(user.birthday || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Giới tính</span>
                                <span class="profile-info-value">${esc(user.gender || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Phường/Xã</span>
                                <span class="profile-info-value">${esc(user.ward || '—')}</span>
                            </div>
                            <div class="profile-info-item">
                                <span class="profile-info-label">Tỉnh/Thành phố</span>
                                <span class="profile-info-value">${esc(user.province || '—')}</span>
                            </div>
                        </div>
                    </div>

                    <div class="profile-actions">
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-save"></i> Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}


async function saveProfilePage(e) {
    e.preventDefault();

    const updates = {
        hoTen:         document.getElementById('profilePageName').value.trim(),
        soDienThoai:   document.getElementById('profilePagePhone').value.trim(),
        diaChiChiTiet: document.getElementById('profilePageAddress')?.value.trim() ?? ''
    };

    const user = AUTH.getCurrentUser();

    if (user && user.authSource === 'api') {
        const btn = e.target.querySelector('[type="submit"]');
        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

        try {
            const res = await API_SERVICES.profile.update(updates);
            const updated = res.data ?? res;

            // Cập nhật lại thông tin trong localStorage
            AUTH.updateProfile({
                name:    updated.hoTen          ?? user.name,
                phone:   updated.soDienThoai    ?? user.phone,
                address: updated.diaChiChiTiet  ?? user.address
            });

            // Cập nhật tên hiển thị trên header
            document.getElementById('userName').textContent = updated.hoTen ?? user.name;

            alert('✓ Cập nhật thông tin cá nhân thành công!');
            loadProfile();
        } catch (err) {
            alert('✗ Lỗi: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = origText;
        }
        return;
    }

    // Fallback mock
    AUTH.updateProfile({
        name:  updates.hoTen,
        phone: updates.soDienThoai
    });
    document.getElementById('userName').textContent = updates.hoTen;
    alert('✓ Cập nhật thông tin cá nhân thành công!');
    loadProfile();
}

function saveProfile(e) {
    e.preventDefault();
    const updates = {
        name:       document.getElementById('profileName').value,
        email:      document.getElementById('profileEmail').value,
        phone:      document.getElementById('profilePhone').value,
        department: document.getElementById('profileDepartment').value
    };
    AUTH.updateProfile(updates);
    alert('Cập nhật thông tin cá nhân thành công');
    closeModal('profileModal');
}

async function changePassword(e) {
    e.preventDefault();
    const oldPassword     = document.getElementById('oldPassword').value;
    const newPassword     = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        alert('Mật khẩu mới không khớp');
        return;
    }

    const user = AUTH.getCurrentUser();

    if (user && user.authSource === 'api') {
        const btn = e.target.querySelector('[type="submit"]');
        const origText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

        try {
            await API_SERVICES.auth.changePassword(oldPassword, newPassword, confirmPassword);
            alert('✓ Đổi mật khẩu thành công!');
            closeModal('passwordModal');
        } catch (err) {
            alert('✗ ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = origText;
        }
        return;
    }

    // Fallback mock
    const result = AUTH.changePassword(oldPassword, newPassword);
    alert(result.message);
    if (result.success) closeModal('passwordModal');
}

function openProfileModal() {
    loadPage('profile');
}

function openPasswordModal() {
    document.getElementById('passwordModal').style.display = 'block';
    document.body.classList.add('modal-open');
}

function logout() {
    AUTH.logout();
    window.location.href = 'login.html';
}
