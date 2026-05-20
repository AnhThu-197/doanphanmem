// ============================================
// XỬ LÝ CÁC FORM CÀI ĐẶT HỆ THỐNG
// ============================================

// Lưu thông tin công ty
function saveCompanyInfo(event) {
    event.preventDefault();
    
    DATA.systemSettings.companyName = document.getElementById('companyName').value;
    DATA.systemSettings.companyEmail = document.getElementById('companyEmail').value;
    DATA.systemSettings.companyPhone = document.getElementById('companyPhone').value;
    DATA.systemSettings.companyWebsite = document.getElementById('companyWebsite').value;
    DATA.systemSettings.companyAddress = document.getElementById('companyAddress').value;
    
    DATA.addAuditLog('UPDATE_COMPANY_INFO', 'Cập nhật thông tin công ty', AUTH.getCurrentUser().id);
    
    alert('✓ Đã lưu thông tin công ty!');
}

// Lưu cài đặt hệ thống
function saveSystemSettings(event) {
    event.preventDefault();
    
    DATA.systemSettings.timezone = document.getElementById('timezone').value;
    DATA.systemSettings.dateFormat = document.getElementById('dateFormat').value;
    DATA.systemSettings.currency = document.getElementById('currency').value;
    DATA.systemSettings.language = document.getElementById('language').value;
    
    DATA.addAuditLog('UPDATE_SYSTEM_SETTINGS', 'Cập nhật cài đặt hệ thống', AUTH.getCurrentUser().id);
    
    alert('✓ Đã lưu cài đặt hệ thống!');
}

// Lưu cài đặt thông báo
function saveNotificationSettings(event) {
    event.preventDefault();
    
    DATA.systemSettings.emailNotifications = document.getElementById('emailNotifications').checked;
    DATA.systemSettings.smsNotifications = document.getElementById('smsNotifications').checked;
    DATA.systemSettings.browserNotifications = document.getElementById('browserNotifications').checked;
    
    DATA.addAuditLog('UPDATE_NOTIFICATION_SETTINGS', 'Cập nhật cài đặt thông báo', AUTH.getCurrentUser().id);
    
    alert('✓ Đã lưu cài đặt thông báo!');
}

// Lưu cài đặt bảo mật
function saveSecuritySettings(event) {
    event.preventDefault();
    
    DATA.systemSettings.sessionTimeout = parseInt(document.getElementById('sessionTimeout').value);
    DATA.systemSettings.maxLoginAttempts = parseInt(document.getElementById('maxLoginAttempts').value);
    DATA.systemSettings.passwordExpiry = parseInt(document.getElementById('passwordExpiry').value);
    DATA.systemSettings.require2FA = document.getElementById('require2FA').checked;
    
    DATA.addAuditLog('UPDATE_SECURITY_SETTINGS', 'Cập nhật cài đặt bảo mật', AUTH.getCurrentUser().id);
    
    alert('✓ Đã lưu cài đặt bảo mật!');
}

// Lưu cài đặt sao lưu
function saveBackupSettings(event) {
    event.preventDefault();
    
    DATA.systemSettings.autoBackup = document.getElementById('autoBackup').checked;
    DATA.systemSettings.backupFrequency = document.getElementById('backupFrequency').value;
    
    DATA.addAuditLog('UPDATE_BACKUP_SETTINGS', 'Cập nhật cài đặt sao lưu', AUTH.getCurrentUser().id);
    
    alert('✓ Đã lưu cài đặt sao lưu!');
}

// Tạo bản sao lưu
function createBackup() {
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
            customers: DATA.customers,
            interactions: DATA.interactions,
            campaigns: DATA.campaigns,
            messageTemplates: DATA.messageTemplates,
            auditLogs: DATA.auditLogs,
            systemSettings: DATA.systemSettings
        }
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    DATA.addAuditLog('CREATE_BACKUP', 'Tạo bản sao lưu dữ liệu', AUTH.getCurrentUser().id);
    
    alert('✓ Đã tạo bản sao lưu! File sẽ được tải xuống.');
}

// Khôi phục dữ liệu
function restoreBackup() {
    const fileInput = document.getElementById('restoreFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('⚠ Vui lòng chọn file sao lưu!');
        return;
    }
    
    if (!confirm('⚠ CẢNH BÁO: Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\nBạn có chắc chắn muốn tiếp tục?')) {
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            // Validate backup data
            if (!backupData.data || !backupData.version) {
                throw new Error('File sao lưu không hợp lệ!');
            }
            
            // Restore data
            if (backupData.data.customers) DATA.customers = backupData.data.customers;
            if (backupData.data.interactions) DATA.interactions = backupData.data.interactions;
            if (backupData.data.campaigns) DATA.campaigns = backupData.data.campaigns;
            if (backupData.data.messageTemplates) DATA.messageTemplates = backupData.data.messageTemplates;
            if (backupData.data.systemSettings) DATA.systemSettings = backupData.data.systemSettings;
            
            DATA.addAuditLog('RESTORE_BACKUP', `Khôi phục dữ liệu từ ${file.name}`, AUTH.getCurrentUser().id);
            
            alert('✓ Đã khôi phục dữ liệu thành công!\n\nTrang sẽ được tải lại.');
            location.reload();
        } catch (error) {
            alert('✗ Lỗi khi khôi phục dữ liệu: ' + error.message);
        }
    };
    reader.readAsText(file);
}
