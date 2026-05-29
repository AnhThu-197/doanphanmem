// ============================================
// NOTIFICATIONS - Thông báo hệ thống
// ============================================

function showNotifications() {
    openNotifications();
}

async function openNotifications() {
    const user = AUTH.getCurrentUser();
    
    // Nếu dùng API, fetch thông báo từ backend
    if (user && user.authSource === 'api') {
        try {
            const res = await API_SERVICES.thongBao.list();
            const rawNotifications = res.data ?? res ?? [];
            DATA.notifications = rawNotifications.map(n => ({
                id: n.maThongBao,
                title: n.tieuDe || 'Thông báo hệ thống',
                message: n.noiDung || '',
                date: n.thoiGianTao ? new Date(n.thoiGianTao).toLocaleString('vi-VN') : '',
                read: !!n.daDoc,
                type: n.loaiThongBao || 'Hệ thống',
                link: n.duongDanLienKet || ''
            }));
        } catch (err) {
            console.error('Không thể tải thông báo từ API, dùng mock:', err);
        }
    }

    renderNotificationsList();
    
    // Hiển thị Modal
    const modal = document.getElementById('notificationModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    // Cập nhật lại badge hiển thị
    await updateNotificationBadge();
}

function renderNotificationsList() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    if (!DATA.notifications || DATA.notifications.length === 0) {
        notificationList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                <div style="font-size: 40px; margin-bottom: 15px; color: #cbd5e1;">
                    <i class="fas fa-bell-slash"></i>
                </div>
                <p style="margin: 0; font-size: 14px;">Không có thông báo nào dành cho bạn.</p>
            </div>
        `;
        return;
    }

    notificationList.innerHTML = DATA.notifications.map(n => {
        let iconHtml = '<i class="fas fa-info-circle" style="color: #6366f1;"></i>';
        const type = (n.type || '').toLowerCase();
        const title = (n.title || '').toLowerCase();
        
        if (type === 'phân công' || type === 'phân bổ' || title.includes('khách hàng') || type === 'phân công' || type === 'phân bổ') {
            iconHtml = '<i class="fas fa-user-tag" style="color: #0284c7;"></i>';
        } else if (type === 'nhắc nhở' || title.includes('nhắc nhở')) {
            iconHtml = '<i class="fas fa-clock" style="color: #f59e0b;"></i>';
        } else if (type === 'lịch hẹn' || title.includes('lịch hẹn')) {
            iconHtml = '<i class="fas fa-calendar-check" style="color: #10b981;"></i>';
        }

        const borderLeft = n.read ? 'none' : '4px solid #2B4856';
        const paddingLeft = n.read ? '16px' : '12px';

        return `
            <div class="notification-item" style="padding: 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer;
                        background: ${n.read ? '#ffffff' : '#f8fafc'}; border-left: ${borderLeft}; padding-left: ${paddingLeft};
                        transition: background-color 0.2s ease;"
                 onclick="markAsRead(${n.id})"
                 onmouseover="this.style.backgroundColor='#f1f5f9'"
                 onmouseout="this.style.backgroundColor='${n.read ? '#ffffff' : '#f8fafc'}'">
                <div style="display: flex; gap: 12px; align-items: flex-start;">
                    <div style="font-size: 18px; padding-top: 2px;">
                        ${iconHtml}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; gap: 8px;">
                            <h4 style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${n.title}</h4>
                            ${!n.read ? '<span style="background: #2b4856; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 600; text-transform: uppercase;">Mới</span>' : ''}
                        </div>
                        <p style="margin: 0 0 6px 0; color: #475569; font-size: 13px; line-height: 1.5; word-wrap: break-word;">${n.message}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <small style="color: #94a3b8; font-size: 11px;"><i class="far fa-clock" style="margin-right: 4px;"></i>${n.date}</small>
                            <span style="font-size: 11px; color: #2B4856; font-weight: 500;">
                                Chi tiết <i class="fas fa-chevron-right" style="font-size: 9px; margin-left: 2px;"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function markAsRead(notificationId) {
    const user = AUTH.getCurrentUser();
    
    // Tìm thông tin thông báo trước để biết type / link
    const notification = DATA.notifications.find(n => n.id === notificationId);

    // Gọi API cập nhật trạng thái nếu dùng API
    if (user && user.authSource === 'api') {
        try {
            await API_SERVICES.thongBao.markRead(notificationId);
        } catch (err) {
            console.error('Không thể đánh dấu đọc thông báo:', err);
        }
    }
    
    // Cập nhật trạng thái local
    if (notification) {
        notification.read = true;
    }
    
    // Render lại giao diện
    renderNotificationsList();
    await updateNotificationBadge();

    // Điều hướng thông minh dựa vào loại thông báo
    if (notification) {
        // Tắt modal thông báo
        closeModal('notificationModal');
        document.body.classList.remove('modal-open');

        const type = (notification.type || '').toLowerCase();
        const link = (notification.link || '').toLowerCase();
        const title = (notification.title || '').toLowerCase();

        if (type === 'nhắc nhở' || type === 'lịch hẹn' || link.includes('nhac-nho') || title.includes('nhắc nhở') || title.includes('lịch hẹn')) {
            if (typeof loadPage === 'function') {
                const user = AUTH.getCurrentUser();
                const allowedPages = {
                    employee: ['dashboard', 'customers', 'campaigns', 'contracts', 'send-message', 'profile', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates'],
                    manager:  ['dashboard', 'customers', 'campaigns', 'contracts', 'campaign-expenses', 'send-message', 'profile', 'reports', 'manage-employees', 'trash', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates', 'api-sync', 'financial-sync'],
                    admin:    ['dashboard', 'user-management', 'settings', 'profile']
                };
                const userAllowed = allowedPages[user.role] || allowedPages.employee;
                if (userAllowed.includes('smart-reminders')) {
                    loadPage('smart-reminders');
                    // highlight menu item
                    document.querySelectorAll('.sidebar-menu li').forEach(item => {
                        if (item.dataset.page === 'smart-reminders') {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            }
        } else if (type === 'phân công' || type === 'phân bổ' || link.includes('khach-hang') || title.includes('khách hàng')) {
            if (typeof loadPage === 'function') {
                const user = AUTH.getCurrentUser();
                const allowedPages = {
                    employee: ['dashboard', 'customers', 'campaigns', 'contracts', 'send-message', 'profile', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates'],
                    manager:  ['dashboard', 'customers', 'campaigns', 'contracts', 'campaign-expenses', 'send-message', 'profile', 'reports', 'manage-employees', 'trash', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates', 'api-sync', 'financial-sync'],
                    admin:    ['dashboard', 'user-management', 'settings', 'profile']
                };
                const userAllowed = allowedPages[user.role] || allowedPages.employee;
                if (userAllowed.includes('customers')) {
                    loadPage('customers');
                    // highlight menu item
                    document.querySelectorAll('.sidebar-menu li').forEach(item => {
                        if (item.dataset.page === 'customers') {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                }
            }
        }
    }
}

async function markAllAsRead() {
    const user = AUTH.getCurrentUser();
    
    // Gọi API cập nhật tất cả đã đọc nếu dùng API
    if (user && user.authSource === 'api') {
        try {
            await API_SERVICES.thongBao.markAllRead();
        } catch (err) {
            console.error('Không thể đọc tất cả thông báo:', err);
        }
    }

    // Đánh dấu tất cả cục bộ là đã đọc
    if (DATA.notifications) {
        DATA.notifications.forEach(n => {
            n.read = true;
        });
    }

    // Render lại giao diện
    renderNotificationsList();
    await updateNotificationBadge();
}

async function updateNotificationBadge() {
    const user = AUTH.getCurrentUser();
    let unreadCount = 0;

    if (user && user.authSource === 'api') {
        try {
            const res = await API_SERVICES.thongBao.unreadCount();
            unreadCount = res.data?.soChuaDoc ?? res.soChuaDoc ?? 0;
        } catch (err) {
            console.error('Lỗi khi lấy số thông báo chưa đọc từ API:', err);
            unreadCount = (DATA.notifications || []).filter(n => !n.read).length;
        }
    } else {
        unreadCount = (DATA.notifications || []).filter(n => !n.read).length;
    }

    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}

// Tự động cập nhật thông báo mỗi 15 giây nếu người dùng đã đăng nhập
document.addEventListener('DOMContentLoaded', () => {
    // Đợi 2 giây sau khi tải trang để tránh quá tải lúc mới init, sau đó thực hiện poll
    setTimeout(() => {
        if (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) {
            updateNotificationBadge();
        }
        
        // Thiết lập interval mỗi 15 giây
        setInterval(() => {
            if (typeof AUTH !== 'undefined' && AUTH.isLoggedIn()) {
                updateNotificationBadge();
                // Nếu modal thông báo đang mở thì reload danh sách luôn
                const modal = document.getElementById('notificationModal');
                if (modal && modal.style.display === 'block') {
                    // Gọi API không mở modal mới
                    (async () => {
                        const user = AUTH.getCurrentUser();
                        if (user && user.authSource === 'api') {
                            try {
                                const res = await API_SERVICES.thongBao.list();
                                const rawNotifications = res.data ?? res ?? [];
                                DATA.notifications = rawNotifications.map(n => ({
                                    id: n.maThongBao,
                                    title: n.tieuDe || 'Thông báo hệ thống',
                                    message: n.noiDung || '',
                                    date: n.thoiGianTao ? new Date(n.thoiGianTao).toLocaleString('vi-VN') : '',
                                    read: !!n.daDoc,
                                    type: n.loaiThongBao || 'Hệ thống',
                                    link: n.duongDanLienKet || ''
                                }));
                                renderNotificationsList();
                            } catch (err) {
                                console.error('Lỗi tự động tải thông báo:', err);
                            }
                        }
                    })();
                }
            }
        }, 15000);
    }, 2000);
});


