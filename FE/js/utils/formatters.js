// ============================================
// FORMATTERS & LABEL HELPERS
// ============================================

function getStatusLabel(status) {
    const labels = {
        'suspect':    'Người truy cập',
        'lead':       'Khách hàng tiềm năng mới',
        'prospect':   'Khách hàng triển vọng',
        'customer':   'Khách hàng chính thức',
        'evangelist': 'Khách hàng trung thành',
        // Campaign statuses
        'planning':   'Lên kế hoạch',
        'active':     'Đang chạy',
        'completed':  'Hoàn thành',
        'paused':     'Tạm dừng'
    };
    return labels[status] || status;
}

function getInteractionTypeLabel(type) {
    const labels = {
        'call':    'Gọi điện',
        'email':   'Email',
        'meeting': 'Cuộc họp',
        'message': 'Tin nhắn'
    };
    return labels[type] || type;
}

function getRoleLabel(role) {
    const labels = {
        'employee': 'Nhân viên',
        'manager':  'Trưởng phòng',
        'admin':    'Quản trị viên'
    };
    return labels[role] || role;
}

// Map trangThaiKhach từ BE sang CSS class và label FE
function mapTrangThaiKhach(trangThai) {
    const map = {
        'Người truy cập':   { cssClass: 'suspect',    label: 'Người truy cập' },
        'KH tiềm năng mới': { cssClass: 'lead',       label: 'Khách hàng tiềm năng mới' },
        'KH triển vọng':    { cssClass: 'prospect',   label: 'Khách hàng triển vọng' },
        'KH chính thức':    { cssClass: 'customer',   label: 'Khách hàng chính thức' },
        'KH trung thành':   { cssClass: 'evangelist', label: 'Khách hàng trung thành' }
    };
    return map[trangThai] || { cssClass: 'suspect', label: trangThai || 'Không rõ' };
}

function formatCurrency(value) {
    if (value == null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day   = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year  = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function getContractStatusClass(status) {
    const classes = {
        'Đang thương lượng': 'lead',
        'Thắng':             'customer',
        'Thua':              'suspect'
    };
    return classes[status] || '';
}
