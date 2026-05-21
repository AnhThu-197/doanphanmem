// ============================================
// NOTIFICATIONS - Thông báo hệ thống
// ============================================

function showNotifications() {
    openNotifications();
}

function openNotifications() {
    const notificationList = document.getElementById('notificationList');
    const unreadCount = DATA.notifications.filter(n => !n.read).length;

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

    document.getElementById('notificationModal').style.display = 'block';
    document.body.classList.add('modal-open');
    document.getElementById('notificationBadge').textContent = unreadCount;
}

function markAsRead(notificationId) {
    const notification = DATA.notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.read = true;
        openNotifications();
    }
}

function updateNotificationBadge() {
    const unreadCount = DATA.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
}
