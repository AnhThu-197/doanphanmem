// Danh sach endpoint Backend hien co
const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    changePassword: "/auth/doi-mat-khau",
    forgotPassword: "/auth/quen-mat-khau",
    resetPassword: "/auth/dat-lai-mat-khau",
  },

  profile: {
    me: "/profile/me",
    update: "/profile/me",
  },

  nhanVien: {
    list: "/nhan-vien",
  },

  khachHang: {
    list: "/khach-hang",
    detail: (id) => `/khach-hang/${id}`,
    search: (keyword) =>
      `/khach-hang/search?keyword=${encodeURIComponent(keyword)}`,
    create: "/khach-hang",
    update: (id) => `/khach-hang/${id}`,
    delete: (id) => `/khach-hang/${id}`,
    assign: (id) => `/khach-hang/${id}/phan-bo`,
    assignmentHistory: "/khach-hang/lich-su-phan-bo",
    trash: "/khach-hang/thung-rac",
    restore: (id) => `/khach-hang/${id}/khoi-phuc`,
  },

  chienDich: {
    list: "/chien-dich",
    detail: (id) => `/chien-dich/${id}`,
    search: (keyword) =>
      `/chien-dich/search?keyword=${encodeURIComponent(keyword)}`,
    create: "/chien-dich",
    update: (id) => `/chien-dich/${id}`,
    delete: (id) => `/chien-dich/${id}`,
    trash: "/chien-dich/thung-rac",
    restore: (id) => `/chien-dich/${id}/khoi-phuc`,
    deletePermanently: (id) => `/chien-dich/${id}/vinh-vien`,
    statistics: "/chien-dich/statistics",
    roi: (id) => `/chien-dich/${id}/roi`,
    exportReport: "/chien-dich/export-report",
    exportCustomers: "/khach-hang/export",
  },

  chiPhiChienDich: {
    list: "/chi-phi-chien-dich",
    detail: (id) => `/chi-phi-chien-dich/${id}`,
    create: "/chi-phi-chien-dich",
    update: (id) => `/chi-phi-chien-dich/${id}`,
    delete: (id) => `/chi-phi-chien-dich/${id}`,
  },

  baoCao: {
    tongQuan: "/bao-cao/tong-quan",
    roiChienDich: (id) => `/bao-cao/chien-dich/${id}/roi`,
  },

  nhacNho: {
    cuaToi: "/nhac-nho/cua-toi",
    create: "/nhac-nho",
    complete: (id) => `/nhac-nho/${id}/hoan-thanh`,
    delete: (id) => `/nhac-nho/${id}`,
  },

  thongBao: {
    list: "/thong-bao",
    unreadCount: "/thong-bao/so-chua-doc",
    markRead: (id) => `/thong-bao/${id}/da-doc`,
    markAllRead: "/thong-bao/doc-tat-ca",
  },

  adminUsers: {
    list: "/admin/users",
    create: "/admin/users",
    update: (id) => `/admin/users/${id}`,
    lock: (id) => `/admin/users/${id}/lock`,
    unlock: (id) => `/admin/users/${id}/unlock`,
    delete: (id) => `/admin/users/${id}`,
  },

  trungLap: {
    list: "/khach-hang/trung-lap",
    gop: (id) => `/khach-hang/trung-lap/${id}/gop`,
  },

  dongBoAPI: {
    saveConfig: "/dong-bo-api/luu-cau-hinh",
    testConnection: "/dong-bo-api/test-ket-noi",
    syncNow: "/dong-bo-api/dong-bo",
    history: "/dong-bo-api/lich-su",
  },

  docs: {
    openApiJson: "/v3/api-docs",
    swaggerUi: "/swagger-ui.html",
  },
};
