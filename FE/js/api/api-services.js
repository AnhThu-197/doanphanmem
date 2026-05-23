// Service wrapper cho cac endpoint Backend hien co
const API_SERVICES = {
    auth: {
        login: (email, matKhau) =>
            API_CLIENT.post(API_ENDPOINTS.auth.login, { email, matKhau }),
        changePassword: (matKhauCu, matKhauMoi, xacNhanMatKhau = matKhauMoi) =>
            API_CLIENT.post(API_ENDPOINTS.auth.changePassword, { matKhauCu, matKhauMoi, xacNhanMatKhau }),
        forgotPassword: (email) =>
            API_CLIENT.post(API_ENDPOINTS.auth.forgotPassword, { email }),
        resetPassword: (email, otp, matKhauMoi) =>
            API_CLIENT.post(API_ENDPOINTS.auth.resetPassword, { email, otp, matKhauMoi })
    },

    profile: {
        me: () =>
            API_CLIENT.get(API_ENDPOINTS.profile.me),
        update: (payload) =>
            API_CLIENT.put(API_ENDPOINTS.profile.update, payload)
    },

    khachHang: {
        list: () =>
            API_CLIENT.get(API_ENDPOINTS.khachHang.list),
        detail: (id) =>
            API_CLIENT.get(API_ENDPOINTS.khachHang.detail(id)),
        search: (keyword) =>
            API_CLIENT.get(API_ENDPOINTS.khachHang.search(keyword)),
        create: (payload) =>
            API_CLIENT.post(API_ENDPOINTS.khachHang.create, payload),
        update: (id, payload) =>
            API_CLIENT.put(API_ENDPOINTS.khachHang.update(id), payload),
        delete: (id, lyDo) =>
            API_CLIENT.delete(API_ENDPOINTS.khachHang.delete(id), lyDo ? { lyDo } : null),
        trash: () =>
            API_CLIENT.get(API_ENDPOINTS.khachHang.trash),
        restore: (id) =>
            API_CLIENT.post(API_ENDPOINTS.khachHang.restore(id))
    },

    chienDich: {
        list: () =>
            API_CLIENT.get(API_ENDPOINTS.chienDich.list),
        detail: (id) =>
            API_CLIENT.get(API_ENDPOINTS.chienDich.detail(id)),
        create: (payload) =>
            API_CLIENT.post(API_ENDPOINTS.chienDich.create, payload),
        update: (id, payload) =>
            API_CLIENT.put(API_ENDPOINTS.chienDich.update(id), payload),
        delete: (id) =>
            API_CLIENT.delete(API_ENDPOINTS.chienDich.delete(id))
    },

    baoCao: {
        tongQuan: () =>
            API_CLIENT.get(API_ENDPOINTS.baoCao.tongQuan),
        roiChienDich: (id) =>
            API_CLIENT.get(API_ENDPOINTS.baoCao.roiChienDich(id))
    },

    nhacNho: {
        cuaToi: () =>
            API_CLIENT.get(API_ENDPOINTS.nhacNho.cuaToi),
        create: (payload) =>
            API_CLIENT.post(API_ENDPOINTS.nhacNho.create, payload),
        complete: (id, payload) =>
            API_CLIENT.patch(API_ENDPOINTS.nhacNho.complete(id), payload || {}),
        delete: (id) =>
            API_CLIENT.delete(API_ENDPOINTS.nhacNho.delete(id))
    },

    thongBao: {
        list: () =>
            API_CLIENT.get(API_ENDPOINTS.thongBao.list),
        unreadCount: () =>
            API_CLIENT.get(API_ENDPOINTS.thongBao.unreadCount),
        markRead: (id) =>
            API_CLIENT.patch(API_ENDPOINTS.thongBao.markRead(id), {}),
        markAllRead: () =>
            API_CLIENT.patch(API_ENDPOINTS.thongBao.markAllRead, {})
    },

    adminUsers: {
        list: () =>
            API_CLIENT.get(API_ENDPOINTS.adminUsers.list),
        create: (payload) =>
            API_CLIENT.post(API_ENDPOINTS.adminUsers.create, payload),
        update: (id, payload) =>
            API_CLIENT.put(API_ENDPOINTS.adminUsers.update(id), payload),
        lock: (id) =>
            API_CLIENT.patch(API_ENDPOINTS.adminUsers.lock(id), {}),
        unlock: (id) =>
            API_CLIENT.patch(API_ENDPOINTS.adminUsers.unlock(id), {}),
        delete: (id) =>
            API_CLIENT.delete(API_ENDPOINTS.adminUsers.delete(id))
    },

    trungLap: {
        list: () =>
            API_CLIENT.get(API_ENDPOINTS.trungLap.list),
        gop: (id) =>
            API_CLIENT.post(API_ENDPOINTS.trungLap.gop(id))
    }
};
