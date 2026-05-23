// ============================================
// NOTIFICATIONS - Thông báo hệ thống
// ============================================

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
            <div style="text-align: center; padding: 30px; color: #94a3b8;">
                <i class="fas fa-bell-slash" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                Không có thông báo nào.
            </div>
        `;
        return;
    }

    notificationList.innerHTML = DATA.notifications.map(n => `
        <div style="padding: 15px; border-bottom: 1px solid #e2e8f0; cursor: pointer;
                    background: ${n.read ? '#fff' : '#f0f9ff'};"
             onclick="markAsRead(${n.id})">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <h4 style="margin: 0 0 5px 0; color: #0f172a;">${n.title}</h4>
                    <p style="margin: 0 0 5px 0; color: #334155; font-size: 14px;">${n.message}</p>
                    <small style="color: #94a3b8;">${n.date}</small>
                </div>
                ${!n.read ? '<span style="background: #2B4856; color: white; padding: 2px 8px; border-radius: 50%; font-size: 12px;">Mới</span>' : ''}
            </div>
        </div>
    `).join('');
}

async function markAsRead(notificationId) {
    const user = AUTH.getCurrentUser();
    
    // Gọi API cập nhật trạng thái nếu dùng API
    if (user && user.authSource === 'api') {
        try {
            await API_SERVICES.thongBao.markRead(notificationId);
        } catch (err) {
            console.error('Không thể đánh dấu đọc thông báo:', err);
        }
    }
    
    // Cập nhật trạng thái local
    const notification = DATA.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
    }
    
    // Render lại giao diện
    renderNotificationsList();
    await updateNotificationBadge();
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

