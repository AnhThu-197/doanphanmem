// ============================================
// HỒ SƠ CÁ NHÂN & ĐỔI MẬT KHẨU
// ============================================

async function loadProfile() {
    const mainContent = document.getElementById('mainContent');
    let user = AUTH.getCurrentUser();

    mainContent.innerHTML = `
        <h2 class="page-title">Hồ sơ Cá nhân</h2>
        <div style="background: white; padding: 30px; border-radius: 8px; max-width: 900px; margin: 0 auto;">
            <p style="color: #64748b;">Đang tải thông tin cá nhân...</p>
        </div>
    `;

    if (user && user.authSource === 'api') {
        const result = await AUTH.refreshProfile();
        if (!result.success) {
            mainContent.innerHTML = `
                <h2 class="page-title">Hồ sơ Cá nhân</h2>
                <div style="background: #fee2e2; color: #991b1b; padding: 18px; border-radius: 8px;">${result.message}</div>
            `;
            return;
        }
        user = result.user;
    }

    const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
                        <label for="profilePageAddress">Địa chỉ</label>
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
