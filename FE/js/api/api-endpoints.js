// Danh sach endpoint Backend hien co
const API_ENDPOINTS = {
    auth: {
        login: '/auth/login',
        changePassword: '/auth/doi-mat-khau',
        forgotPassword: '/auth/quen-mat-khau',
        resetPassword: '/auth/dat-lai-mat-khau'
    },

    profile: {
        me: '/profile/me',
        update: '/profile/me'
    },

    khachHang: {
        list: '/khach-hang',
        detail: (id) => `/khach-hang/${id}`,
        search: (keyword) => `/khach-hang/search?keyword=${encodeURIComponent(keyword)}`,
        create: '/khach-hang',
        update: (id) => `/khach-hang/${id}`,
        delete: (id) => `/khach-hang/${id}`,
        trash: '/khach-hang/thung-rac',
        restore: (id) => `/khach-hang/${id}/khoi-phuc`
    },

    chienDich: {
        list: '/chien-dich',
        detail: (id) => `/chien-dich/${id}`,
        create: '/chien-dich',
        update: (id) => `/chien-dich/${id}`,
        delete: (id) => `/chien-dich/${id}`
    },

    baoCao: {
        tongQuan: '/bao-cao/tong-quan',
        roiChienDich: (id) => `/bao-cao/chien-dich/${id}/roi`
    },

    nhacNho: {
        cuaToi: '/nhac-nho/cua-toi',
        create: '/nhac-nho',
        complete: (id) => `/nhac-nho/${id}/hoan-thanh`,
        delete: (id) => `/nhac-nho/${id}`
    },

    thongBao: {
        list: '/thong-bao',
        unreadCount: '/thong-bao/so-chua-doc',
        markRead: (id) => `/thong-bao/${id}/da-doc`,
        markAllRead: '/thong-bao/doc-tat-ca'
    },

    docs: {
        openApiJson: '/v3/api-docs',
        swaggerUi: '/swagger-ui.html'
    }
};

