// ============================================
// CÀI ĐẶT HỆ THỐNG
// ============================================

function loadSettings() {
    const mainContent = document.getElementById('mainContent');

    if (!DATA.systemSettings) {
        DATA.systemSettings = {
            companyName: 'CÔNG TY CRM', companyEmail: 'contact@crm.com',
            companyPhone: '0123456789', companyAddress: '123 Đường ABC, Quận 1, TP.HCM',
            timezone: 'Asia/Ho_Chi_Minh', dateFormat: 'DD/MM/YYYY',
            currency: 'VND', language: 'vi',
            emailNotifications: true, smsNotifications: false, browserNotifications: true,
            autoBackup: true, backupFrequency: 'daily',
            sessionTimeout: 30, maxLoginAttempts: 5, passwordExpiry: 90, require2FA: false
        };
    }

    const s = DATA.systemSettings;

    mainContent.innerHTML = `
        <h2 class="page-title">Cấu hình Hệ thống</h2>
        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('settings-general')">Thông tin Công ty</button>
            <button class="tab-btn" onclick="switchTab('settings-system')">Hệ thống</button>
            <button class="tab-btn" onclick="switchTab('settings-notifications')">Thông báo</button>
            <button class="tab-btn" onclick="switchTab('settings-security')">Bảo mật</button>
            <button class="tab-btn" onclick="switchTab('settings-backup')">Sao lưu</button>
        </div>

        <div id="settings-general" class="tab-content active">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;"><i class="fas fa-building"></i> Thông tin Công ty</h3>
                <form id="companyInfoForm" onsubmit="saveCompanyInfo(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group"><label>Tên công ty *</label><input type="text" id="companyName" value="${s.companyName}" required></div>
                        <div class="form-group"><label>Email *</label><input type="email" id="companyEmail" value="${s.companyEmail}" required></div>
                        <div class="form-group"><label>Số điện thoại *</label><input type="tel" id="companyPhone" value="${s.companyPhone}" required></div>
                        <div class="form-group"><label>Website</label><input type="url" id="companyWebsite" value="${s.companyWebsite || ''}" placeholder="https://example.com"></div>
                    </div>
                    <div class="form-group"><label>Địa chỉ *</label><textarea id="companyAddress" rows="2" required>${s.companyAddress}</textarea></div>
                    <div class="form-actions"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu thay đổi</button></div>
                </form>
            </div>
        </div>

        <div id="settings-system" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;"><i class="fas fa-cog"></i> Cài đặt Hệ thống</h3>
                <form id="systemSettingsForm" onsubmit="saveSystemSettings(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label>Múi giờ</label>
                            <select id="timezone">
                                <option value="Asia/Ho_Chi_Minh" ${s.timezone === 'Asia/Ho_Chi_Minh' ? 'selected' : ''}>Việt Nam (GMT+7)</option>
                                <option value="Asia/Singapore" ${s.timezone === 'Asia/Singapore' ? 'selected' : ''}>Singapore (GMT+8)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Định dạng ngày</label>
                            <select id="dateFormat">
                                <option value="DD/MM/YYYY" ${s.dateFormat === 'DD/MM/YYYY' ? 'selected' : ''}>DD/MM/YYYY</option>
                                <option value="MM/DD/YYYY" ${s.dateFormat === 'MM/DD/YYYY' ? 'selected' : ''}>MM/DD/YYYY</option>
                                <option value="YYYY-MM-DD" ${s.dateFormat === 'YYYY-MM-DD' ? 'selected' : ''}>YYYY-MM-DD</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Đơn vị tiền tệ</label>
                            <select id="currency">
                                <option value="VND" ${s.currency === 'VND' ? 'selected' : ''}>VND (₫)</option>
                                <option value="USD" ${s.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Ngôn ngữ</label>
                            <select id="language">
                                <option value="vi" ${s.language === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
                                <option value="en" ${s.language === 'en' ? 'selected' : ''}>English</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-actions"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu thay đổi</button></div>
                </form>
            </div>
        </div>

        <div id="settings-notifications" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;"><i class="fas fa-bell"></i> Cài đặt Thông báo</h3>
                <form id="notificationSettingsForm" onsubmit="saveNotificationSettings(event)">
                    <div style="display: grid; gap: 20px;">
                        ${[
                            { id: 'emailNotifications', label: 'Thông báo Email', desc: 'Gửi thông báo qua email khi có sự kiện quan trọng', checked: s.emailNotifications },
                            { id: 'smsNotifications', label: 'Thông báo SMS', desc: 'Gửi thông báo qua SMS (cần cấu hình SMS Gateway)', checked: s.smsNotifications },
                            { id: 'browserNotifications', label: 'Thông báo Trình duyệt', desc: 'Hiển thị thông báo trên trình duyệt', checked: s.browserNotifications !== false }
                        ].map(n => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                                <div>
                                    <strong style="display: block; margin-bottom: 5px;">${n.label}</strong>
                                    <small style="color: #64748b;">${n.desc}</small>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="${n.id}" ${n.checked ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                    <div class="form-actions" style="margin-top: 20px;"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu thay đổi</button></div>
                </form>
            </div>
        </div>

        <div id="settings-security" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;"><i class="fas fa-shield-alt"></i> Cài đặt Bảo mật</h3>
                <form id="securitySettingsForm" onsubmit="saveSecuritySettings(event)">
                    <div style="display: grid; gap: 20px;">
                        <div class="form-group"><label>Thời gian hết phiên (phút)</label><input type="number" id="sessionTimeout" value="${s.sessionTimeout}" min="5" max="120"></div>
                        <div class="form-group"><label>Số lần đăng nhập sai tối đa</label><input type="number" id="maxLoginAttempts" value="${s.maxLoginAttempts}" min="3" max="10"></div>
                        <div class="form-group"><label>Thời hạn mật khẩu (ngày)</label><input type="number" id="passwordExpiry" value="${s.passwordExpiry}" min="0" max="365"></div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Xác thực 2 yếu tố (2FA)</strong>
                                <small style="color: #64748b;">Bật xác thực 2 lớp cho tất cả người dùng</small>
                            </div>
                            <label class="switch"><input type="checkbox" id="require2FA" ${s.require2FA ? 'checked' : ''}><span class="slider"></span></label>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu thay đổi</button></div>
                </form>
            </div>
        </div>

        <div id="settings-backup" class="tab-content">
            <div style="background: white; padding: 30px; border-radius: 8px;">
                <h3 style="margin-bottom: 20px; color: #2B4856;"><i class="fas fa-database"></i> Sao lưu & Khôi phục</h3>
                <form id="backupSettingsForm" onsubmit="saveBackupSettings(event)">
                    <div style="display: grid; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                            <div>
                                <strong style="display: block; margin-bottom: 5px;">Tự động sao lưu</strong>
                                <small style="color: #64748b;">Tự động sao lưu dữ liệu theo lịch</small>
                            </div>
                            <label class="switch"><input type="checkbox" id="autoBackup" ${s.autoBackup ? 'checked' : ''}><span class="slider"></span></label>
                        </div>
                        <div class="form-group">
                            <label>Tần suất sao lưu</label>
                            <select id="backupFrequency">
                                <option value="hourly"  ${s.backupFrequency === 'hourly'  ? 'selected' : ''}>Mỗi giờ</option>
                                <option value="daily"   ${s.backupFrequency === 'daily'   ? 'selected' : ''}>Hàng ngày</option>
                                <option value="weekly"  ${s.backupFrequency === 'weekly'  ? 'selected' : ''}>Hàng tuần</option>
                                <option value="monthly" ${s.backupFrequency === 'monthly' ? 'selected' : ''}>Hàng tháng</option>
                            </select>
                        </div>
                        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                            <h4 style="margin-bottom: 15px; color: #1e40af;">Sao lưu thủ công</h4>
                            <button type="button" class="btn btn-primary" onclick="createBackup()"><i class="fas fa-download"></i> Tạo bản sao lưu</button>
                        </div>
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                            <h4 style="margin-bottom: 15px; color: #92400e;">Khôi phục dữ liệu</h4>
                            <input type="file" id="restoreFile" accept=".json" style="margin-bottom: 10px;">
                            <button type="button" class="btn btn-secondary" onclick="restoreBackup()"><i class="fas fa-upload"></i> Khôi phục</button>
                        </div>
                    </div>
                    <div class="form-actions" style="margin-top: 20px;"><button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Lưu cài đặt</button></div>
                </form>
            </div>
        </div>
    `;
}

// ---- Form handlers (từ settings-handlers.js) ----

function saveCompanyInfo(event) {
    event.preventDefault();
    DATA.systemSettings.companyName    = document.getElementById('companyName').value;
    DATA.systemSettings.companyEmail   = document.getElementById('companyEmail').value;
    DATA.systemSettings.companyPhone   = document.getElementById('companyPhone').value;
    DATA.systemSettings.companyWebsite = document.getElementById('companyWebsite').value;
    DATA.systemSettings.companyAddress = document.getElementById('companyAddress').value;
    DATA.addAuditLog('UPDATE_COMPANY_INFO', 'Cập nhật thông tin công ty', AUTH.getCurrentUser().id);
    alert('✓ Đã lưu thông tin công ty!');
}

function saveSystemSettings(event) {
    event.preventDefault();
    DATA.systemSettings.timezone   = document.getElementById('timezone').value;
    DATA.systemSettings.dateFormat = document.getElementById('dateFormat').value;
    DATA.systemSettings.currency   = document.getElementById('currency').value;
    DATA.systemSettings.language   = document.getElementById('language').value;
    DATA.addAuditLog('UPDATE_SYSTEM_SETTINGS', 'Cập nhật cài đặt hệ thống', AUTH.getCurrentUser().id);
    alert('✓ Đã lưu cài đặt hệ thống!');
}

function saveNotificationSettings(event) {
    event.preventDefault();
    DATA.systemSettings.emailNotifications   = document.getElementById('emailNotifications').checked;
    DATA.systemSettings.smsNotifications     = document.getElementById('smsNotifications').checked;
    DATA.systemSettings.browserNotifications = document.getElementById('browserNotifications').checked;
    DATA.addAuditLog('UPDATE_NOTIFICATION_SETTINGS', 'Cập nhật cài đặt thông báo', AUTH.getCurrentUser().id);
    alert('✓ Đã lưu cài đặt thông báo!');
}

function saveSecuritySettings(event) {
    event.preventDefault();
    DATA.systemSettings.sessionTimeout    = parseInt(document.getElementById('sessionTimeout').value);
    DATA.systemSettings.maxLoginAttempts  = parseInt(document.getElementById('maxLoginAttempts').value);
    DATA.systemSettings.passwordExpiry    = parseInt(document.getElementById('passwordExpiry').value);
    DATA.systemSettings.require2FA        = document.getElementById('require2FA').checked;
    DATA.addAuditLog('UPDATE_SECURITY_SETTINGS', 'Cập nhật cài đặt bảo mật', AUTH.getCurrentUser().id);
    alert('✓ Đã lưu cài đặt bảo mật!');
}

function saveBackupSettings(event) {
    event.preventDefault();
    DATA.systemSettings.autoBackup       = document.getElementById('autoBackup').checked;
    DATA.systemSettings.backupFrequency  = document.getElementById('backupFrequency').value;
    DATA.addAuditLog('UPDATE_BACKUP_SETTINGS', 'Cập nhật cài đặt sao lưu', AUTH.getCurrentUser().id);
    alert('✓ Đã lưu cài đặt sao lưu!');
}

function createBackup() {
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            customers: DATA.customers, interactions: DATA.interactions,
            campaigns: DATA.campaigns, messageTemplates: DATA.messageTemplates,
            auditLogs: DATA.auditLogs, systemSettings: DATA.systemSettings
        }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    DATA.addAuditLog('CREATE_BACKUP', 'Tạo bản sao lưu dữ liệu', AUTH.getCurrentUser().id);
    alert('✓ Đã tạo bản sao lưu! File sẽ được tải xuống.');
}

function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    if (!file) { alert('⚠ Vui lòng chọn file sao lưu!'); return; }
    if (!confirm('⚠ CẢNH BÁO: Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\nBạn có chắc chắn?')) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            if (!backupData.data || !backupData.version) throw new Error('File sao lưu không hợp lệ!');
            if (backupData.data.customers)       DATA.customers       = backupData.data.customers;
            if (backupData.data.interactions)    DATA.interactions    = backupData.data.interactions;
            if (backupData.data.campaigns)       DATA.campaigns       = backupData.data.campaigns;
            if (backupData.data.messageTemplates) DATA.messageTemplates = backupData.data.messageTemplates;
            if (backupData.data.systemSettings)  DATA.systemSettings  = backupData.data.systemSettings;
            DATA.addAuditLog('RESTORE_BACKUP', `Khôi phục từ ${file.name}`, AUTH.getCurrentUser().id);
            alert('✓ Đã khôi phục dữ liệu thành công!\n\nTrang sẽ được tải lại.');
            location.reload();
        } catch (error) {
            alert('✗ Lỗi khi khôi phục: ' + error.message);
        }
    };
    reader.readAsText(file);
}
