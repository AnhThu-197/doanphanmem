/**
 * Modals Manager - Nhóm 8 CRM
 * Quản lý mở/đóng modal, load modals từ file riêng
 */

// =============================================
// MODAL CORE FUNCTIONS
// =============================================

/**
 * Mở modal theo ID (sẽ bị override bởi script.js nếu có)
 */
if (typeof openModal === 'undefined') {
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };
}

/**
 * Đóng modal theo ID (sẽ bị override bởi script.js nếu có)
 */
if (typeof closeModal === 'undefined') {
    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
}

/**
 * Đóng modal khi click bên ngoài
 */
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = '';
    }
});

/**
 * Đóng modal khi nhấn ESC
 */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex' || modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
});

// =============================================
// TAB SWITCHING
// =============================================

/**
 * Chuyển tab trong modal (fallback - script.js có thể override)
 */
if (typeof switchTab === 'undefined') {
    window.switchTab = function(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        const buttons = document.querySelectorAll('.tab-btn');

        tabs.forEach(tab => tab.classList.remove('active'));
        buttons.forEach(btn => btn.classList.remove('active'));

        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        if (event && event.target) {
            event.target.classList.add('active');
        }
    };
}

// =============================================
// ASSIGN UI
// =============================================

function updateAssignUI() {
    const method = document.getElementById('assignMethod').value;
    document.getElementById('assignManual').style.display = method === 'manual' ? 'block' : 'none';
    document.getElementById('assignRoundRobin').style.display = method === 'round_robin' ? 'block' : 'none';
    document.getElementById('assignRatio').style.display = method === 'ratio' ? 'block' : 'none';
}

// =============================================
// FILE UPLOAD HELPER
// =============================================

if (typeof updateFileName === 'undefined') {
    window.updateFileName = function(input, displayId) {
        const display = document.getElementById(displayId);
        if (input.files && input.files.length > 0) {
            display.textContent = input.files[0].name;
        } else {
            display.textContent = 'Chọn file hoặc kéo thả vào đây';
        }
    };
}

// =============================================
// APPOINTMENT TYPE TOGGLE
// =============================================

function toggleReminderMessageType() {
    const type = document.getElementById('appointmentType');
    const reminderCustomer = document.getElementById('reminderCustomer');
    const locationSection = document.getElementById('meetingLocationSection');
    const reminderSection = document.getElementById('reminderMessageTypeSection');

    if (locationSection) {
        locationSection.style.display =
            (type && (type.value === 'meeting' || type.value === 'video')) ? 'block' : 'none';
    }

    if (reminderSection) {
        const showReminder = (type && (type.value === 'meeting' || type.value === 'video'))
            && (reminderCustomer && reminderCustomer.checked);
        reminderSection.style.display = showReminder ? 'block' : 'none';
    }
}

// =============================================
// LOAD MODALS FROM EXTERNAL FILE
// =============================================

/**
 * Load modals HTML từ file components/modals.html
 * Gọi khi DOMContentLoaded
 */
async function loadModals() {
    try {
        const response = await fetch('components/modals.html');
        if (response.ok) {
            const html = await response.text();
            const container = document.getElementById('modalsContainer');
            if (container) {
                container.innerHTML = html;
            }
        }
    } catch (error) {
        console.warn('Could not load modals from external file, using inline modals.');
    }
}
