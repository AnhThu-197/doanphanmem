// FE_react/src/api.js
// CẦU NỐI API - KẾT NỐI SPRING BOOT REST API VÀ MOCK HYBRID LOCAL STORAGE

const BASE_URL = "http://localhost:8082/api";

// Helper to get headers with JWT bearer token
function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  const stored = localStorage.getItem("currentUser");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return headers;
}

// Helper for multipart/form-data headers (no Content-Type to let browser set boundary)
function getUploadHeaders() {
  const headers = {};
  const stored = localStorage.getItem("currentUser");
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.token) {
        headers["Authorization"] = `Bearer ${user.token}`;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return headers;
}

// Quick health check on the backend using public swagger/docs endpoint
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${BASE_URL}/v3/api-docs`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(id);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// MAPPERS: Translate between SQL Server Entity models (Vietnamese) and React State models (English)
function mapKhachHangToFe(kh) {
  if (!kh) return null;
  return {
    id: kh.maKhachHang,
    name: kh.hoTen,
    email: kh.email,
    phone: kh.soDienThoai,
    company: kh.congTy,
    status:
      kh.trangThaiKhach === "KH tiềm năng mới"
        ? "lead"
        : kh.trangThaiKhach === "KH triển vọng"
          ? "prospect"
          : kh.trangThaiKhach === "KH chính thức"
            ? "customer"
            : kh.trangThaiKhach === "KH trung thành"
              ? "evangelist"
              : "suspect",
    score: kh.diemTiemNang,
    trialStartDate: kh.ngayBatDauDungThu,
    trialDays: kh.soNgayDungThu,
    trialStatus: kh.trangThaiDungThu || "Chưa dùng thử",
    deleted: kh.daXoa || false,
    deleteReason: kh.lyDoXoa,
    deletedDate: kh.ngayXoa,
    createdDate: kh.ngayTao ? kh.ngayTao.substring(0, 10) : "",
    updatedDate: kh.ngayCapNhat ? kh.ngayCapNhat.substring(0, 10) : "",
    source:
      kh.maNguonKH === 1
        ? "facebook"
        : kh.maNguonKH === 2
          ? "google"
          : kh.maNguonKH === 3
            ? "direct"
            : kh.maNguonKH === 4
              ? "referral"
              : "website",
    industry:
      kh.maNganhNghe === 1
        ? "Công nghệ"
        : kh.maNganhNghe === 2
          ? "Bán lẻ"
          : "Dịch vụ",
    assignedTo: kh.maNguoiPhuTrach || 1,
  };
}

function mapKhachHangToBe(kh) {
  if (!kh) return null;

  // Translate react status back to SQL server status
  let statusBe = "Suspect (Người truy cập)";
  if (kh.status === "lead") statusBe = "KH tiềm năng mới";
  else if (kh.status === "prospect") statusBe = "KH triển vọng";
  else if (kh.status === "customer") statusBe = "KH chính thức";
  else if (kh.status === "evangelist") statusBe = "KH trung thành";

  return {
    maKhachHang: kh.id || null,
    hoTen: kh.name || "",
    email: kh.email || "",
    soDienThoai: kh.phone || "",
    congTy: kh.company || "",
    trangThaiKhach: statusBe,
    diemTiemNang: kh.score !== undefined ? kh.score : 0,
    ngayBatDauDungThu: kh.trialStartDate || null,
    soNgayDungThu: kh.trialDays !== undefined ? parseInt(kh.trialDays) : 0,
    trangThaiDungThu: kh.trialStatus || "Chưa dùng thử",
    daXoa: kh.deleted || false,
    lyDoXoa: kh.deleteReason || null,
    maNguonKH:
      kh.source === "facebook"
        ? 1
        : kh.source === "google"
          ? 2
          : kh.source === "direct"
            ? 3
            : kh.source === "referral"
              ? 4
              : 5,
    maNganhNghe:
      kh.industry === "Công nghệ" ? 1 : kh.industry === "Bán lẻ" ? 2 : 3,
  };
}

function mapAppointmentToFe(a) {
  if (!a) return null;

  // Formats thoiGianNhac (LocalDateTime e.g. 2026-05-25T14:00:00) into date & time
  let dateStr = "";
  let timeStr = "";
  if (a.thoiGianNhac) {
    const parts = a.thoiGianNhac.split("T");
    dateStr = parts[0] || "";
    timeStr = parts[1] ? parts[1].substring(0, 5) : "";
  }

  const typeMap = {
    "Gọi điện": "call",
    Email: "email",
    "Gặp mặt": "meeting",
    call: "call",
    email: "email",
    meeting: "meeting",
  };

  return {
    id: a.maNhacNho,
    customerId: a.khachHang ? a.khachHang.maKhachHang : null,
    customerName: a.khachHang ? a.khachHang.hoTen : "Chưa xác định",
    employeeId: a.nhanVien ? a.nhanVien.maNhanVien : null,
    employeeName: a.nhanVien ? a.nhanVien.hoTen : "Chưa xác định",
    title: a.tieuDe,
    type: typeMap[a.loaiNhacNho] || "call",
    date: dateStr,
    time: timeStr,
    reminderBefore: a.nhacTruocPhut || 30,
    notes: a.moTa || "",
    status:
      a.trangThaiNhacNho === "Chờ xử lý"
        ? "scheduled"
        : a.trangThaiNhacNho === "Đã hủy"
          ? "cancelled"
          : "completed",
    result: a.ketQua,
    resultNotes: a.ghiChuKetQua,
  };
}

// LOCAL STORAGE INITIALIZATION FOR MOCK CHANNELS
function initLocalStorage() {
  if (!localStorage.getItem("message_templates")) {
    const defaultTemplates = [
      {
        id: 1,
        name: "Chào mừng khách hàng mới",
        type: "email",
        content: "Xin chào {customerName}, chúng tôi rất vui được phục vụ bạn!",
        creatorId: 3,
        creatorName: "Trần Minh Chiến",
        useCount: 15,
      },
      {
        id: 2,
        name: "Nhắc nhở cuộc họp",
        type: "sms",
        content:
          "Nhắc nhở: Bạn có cuộc hẹn trao đổi dịch vụ lúc {time} ngày {date}.",
        creatorId: 3,
        creatorName: "Trần Minh Chiến",
        useCount: 22,
      },
      {
        id: 3,
        name: "Cảm ơn khách hàng",
        type: "email",
        content:
          "Cảm ơn {customerName} đã tin tưởng và sử dụng giải pháp phần mềm của chúng tôi!",
        creatorId: 3,
        creatorName: "Trần Minh Chiến",
        useCount: 37,
      },
      {
        id: 4,
        name: "Giới thiệu sản phẩm mới",
        type: "email",
        content:
          "Xin chào {customerName}, chúng tôi vừa ra mắt module CRM Marketing mới nâng cấp!",
        creatorId: 3,
        creatorName: "Trần Minh Chiến",
        useCount: 8,
      },
    ];
    localStorage.setItem("message_templates", JSON.stringify(defaultTemplates));
  }

  if (!localStorage.getItem("message_history")) {
    const defaultHistory = [
      {
        id: 1,
        customerId: 1,
        customerName: "Công ty ABC",
        channel: "Email",
        title: "Chào mừng khách hàng mới",
        content: "Xin chào Công ty ABC, chúng tôi rất vui được phục vụ bạn!",
        status: "success",
        sentTime: new Date(Date.now() - 10000000).toLocaleString(),
      },
      {
        id: 2,
        customerId: 2,
        customerName: "Công ty XYZ",
        channel: "SMS",
        title: "Khuyến mãi đặc biệt",
        content: "Khuyến mãi đặc biệt giảm giá 20% cho Công ty XYZ!",
        status: "success",
        sentTime: new Date(Date.now() - 5000000).toLocaleString(),
      },
      {
        id: 3,
        customerId: 1,
        customerName: "Công ty ABC",
        channel: "Email",
        title: "Cảm ơn khách hàng",
        content: "Cảm ơn Công ty ABC đã tin tưởng và sử dụng dịch vụ!",
        status: "success",
        sentTime: new Date().toLocaleString(),
      },
    ];
    localStorage.setItem("message_history", JSON.stringify(defaultHistory));
  }

  if (!localStorage.getItem("interactions")) {
    const defaultInteractions = [
      {
        id: 1,
        customerId: 1,
        customerName: "Công ty ABC",
        employeeId: 3,
        employeeName: "Trần Minh Chiến",
        type: "call",
        content: "Tư vấn sản phẩm CRM",
        notes: "Khách hàng cực kỳ quan tâm đến tính năng tự động hóa.",
        date: "2026-05-24 14:00:00",
        attachments: [],
      },
      {
        id: 2,
        customerId: 2,
        customerName: "Công ty XYZ",
        employeeId: 3,
        employeeName: "Trần Minh Chiến",
        type: "email",
        content: "Gửi báo giá dùng thử",
        notes: "Đã gửi báo giá 30 ngày dùng thử.",
        date: "2026-05-23 09:30:00",
        attachments: [],
      },
      {
        id: 3,
        customerId: 1,
        customerName: "Công ty ABC",
        employeeId: 3,
        employeeName: "Trần Minh Chiến",
        type: "meeting",
        content: "Gặp mặt chốt hợp đồng",
        notes: "Ký thỏa thuận khung dùng thử.",
        date: "2026-05-22 15:00:00",
        attachments: [],
      },
    ];
    localStorage.setItem("interactions", JSON.stringify(defaultInteractions));
  }

  if (!localStorage.getItem("system_config")) {
    const defaultConfig = {
      companyName: "Công ty TNHH Phần mềm Nhóm 8",
      email: "contact@nhom8crm.com",
      phone: "0987654321",
      website: "https://nhom8crm.com",
      address: "Khu công nghệ phần mềm ĐHQG, Thủ Đức, TP.HCM",
      timezone: "Asia/Ho_Chi_Minh",
      dateFormat: "DD/MM/YYYY",
      currency: "VND",
      language: "vi",
      emailNotifications: true,
      smsNotifications: false,
      browserNotifications: true,
      sessionTimeout: 30,
      maxFailedAttempts: 5,
      passwordExpiryDays: 90,
      twoFactorAuth: false,
      autoBackup: true,
      backupFrequency: "daily",
    };
    localStorage.setItem("system_config", JSON.stringify(defaultConfig));
  }
}

// Run LocalStorage Initializer
initLocalStorage();

// Core API Connector Module
export const API = {
  isOnline() {
    return true;
  },

  // 1. ACCOUNTS & AUTHENTICATION (Spring Boot Backend API)
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, matKhau: password }),
      });

      if (response.ok) {
        const resJson = await response.json();
        if (resJson.success && resJson.data) {
          const loginRes = resJson.data;
          const v = (loginRes.vaiTro || "").toLowerCase();
          const role = (v.includes("admin") || v.includes("quản trị") || v.includes("quan tri"))
            ? "admin"
            : (v.includes("trưởng phòng") || v.includes("truong") || v.includes("tru?") || v.includes("manager"))
              ? "manager"
              : "employee";
          const user = {
            id: loginRes.maTaiKhoan,
            username: loginRes.email || email,
            name: loginRes.hoTen,
            email: loginRes.email,
            role: role,
            phone:
              role === "admin"
                ? "0901234567"
                : role === "manager"
                  ? "0912345678"
                  : "0987654321",
            avatar: role === "admin" ? "AS" : role === "manager" ? "AT" : "TC",
            department: role === "admin" ? "IT" : "Marketing",
            position:
              loginRes.chucVu ||
              (role === "admin"
                ? "Quản trị viên"
                : role === "manager"
                  ? "Trưởng phòng"
                  : "Nhân viên marketing"),
            token: loginRes.token,
          };
          localStorage.setItem("currentUser", JSON.stringify(user));
          return { success: true, user };
        }
      }
      return {
        success: false,
        message: "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    } catch (e) {
      console.error("Login error", e);
      return {
        success: false,
        message: "Không thể kết nối đến máy chủ backend.",
      };
    }
  },

  async sendOtp(email) {
    const response = await fetch(`${BASE_URL}/auth/quen-mat-khau`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("Gửi OTP thất bại! Vui lòng kiểm tra email.");
    }
    return true;
  },

  async verifyOtp(email, otp) {
    // Save otp in localStorage to use in resetPassword step (Spring Boot combines verify and reset)
    localStorage.setItem("forgot_otp_temp", otp);
    return true;
  },

  async resetPassword(email, newPassword) {
    const otp = localStorage.getItem("forgot_otp_temp") || "";
    const response = await fetch(`${BASE_URL}/auth/dat-lai-mat-khau`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, matKhauMoi: newPassword }),
    });
    if (!response.ok) {
      throw new Error("Đặt lại mật khẩu thất bại!");
    }
    localStorage.removeItem("forgot_otp_temp");
    return true;
  },

  async getAllUsers() {
    const response = await fetch(`${BASE_URL}/admin/users`, {
      headers: getHeaders(),
    });
    if (response.ok) {
      const resJson = await response.json();
      return resJson.data || [];
    }
    throw new Error("Không thể tải danh sách tài khoản người dùng.");
  },

  // 2. CUSTOMERS & TRIAL MANAGEMENT (Spring Boot Backend API)
  async getCustomers() {
    const response = await fetch(`${BASE_URL}/khach-hang`, {
      headers: getHeaders(),
    });
    if (response.ok) {
      const resJson = await response.json();
      return (resJson.data || []).map(mapKhachHangToFe);
    }
    throw new Error("Không thể tải danh sách khách hàng.");
  },

  async createCustomer(customer) {
    const body = mapKhachHangToBe(customer);
    const response = await fetch(`${BASE_URL}/khach-hang`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const resJson = await response.json();
      return mapKhachHangToFe(resJson.data);
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Lỗi thêm mới khách hàng.");
  },

  async updateCustomer(id, customer) {
    const body = mapKhachHangToBe(customer);
    const response = await fetch(`${BASE_URL}/khach-hang/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const resJson = await response.json();
      return mapKhachHangToFe(resJson.data);
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Lỗi cập nhật khách hàng.");
  },

  async deleteCustomer(id) {
    const response = await fetch(`${BASE_URL}/khach-hang/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.ok;
  },

  async permanentDeleteCustomer(id) {
    // Backend doesn't have hard delete endpoint, we soft delete it as permanent equivalent
    const response = await fetch(`${BASE_URL}/khach-hang/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.ok;
  },

  async getTrialDetails(customerId) {
    // Derived from the customer record directly (stored on KhachHang in DB)
    const response = await fetch(`${BASE_URL}/khach-hang/${customerId}`, {
      headers: getHeaders(),
    });
    if (response.ok) {
      const resJson = await response.json();
      const kh = mapKhachHangToFe(resJson.data);

      let remainingDays = 0;
      if (kh.trialStartDate && kh.trialDays) {
        const start = new Date(kh.trialStartDate);
        const end = new Date(
          start.getTime() + kh.trialDays * 24 * 60 * 60 * 1000,
        );
        const diff = end - new Date();
        remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (remainingDays < 0) remainingDays = 0;
      }

      return {
        customerId: customerId,
        customerName: kh.name,
        startDate: kh.trialStartDate || "",
        durationDays: kh.trialDays || 30,
        status: kh.trialStatus || "Chưa dùng thử",
        remainingDays: remainingDays,
      };
    }
    throw new Error("Lỗi lấy thông tin dùng thử.");
  },

  async updateTrialDetails(
    customerId,
    startDate,
    durationDays,
    status = "Đang dùng thử",
  ) {
    // Fetch customer, update trial fields, and save via standard PUT /khach-hang/{id}
    const getRes = await fetch(`${BASE_URL}/khach-hang/${customerId}`, {
      headers: getHeaders(),
    });
    if (!getRes.ok) throw new Error("Không tìm thấy thông tin khách hàng.");

    const resJson = await getRes.json();
    const customer = resJson.data;

    // Update trial fields
    customer.ngayBatDauDungThu = startDate;
    customer.soNgayDungThu = parseInt(durationDays);
    customer.trangThaiDungThu = status;
    if (status === "Đang dùng thử") {
      customer.trangThaiKhach = "KH chính thức"; // Convert to active customer status in backend
    }

    const putRes = await fetch(`${BASE_URL}/khach-hang/${customerId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(customer),
    });

    if (putRes.ok) {
      const putJson = await putRes.json();
      return {
        customerId,
        startDate,
        durationDays,
        status,
        customerName: putJson.data.hoTen,
      };
    }
    throw new Error("Lỗi cập nhật thông tin dùng thử.");
  },

  // 3. APPOINTMENTS & REMINDERS (Spring Boot Backend API /nhac-nho)
  async getAppointments() {
    const response = await fetch(`${BASE_URL}/nhac-nho/cua-toi`, {
      headers: getHeaders(),
    });
    if (response.ok) {
      const resJson = await response.json();
      return (resJson.data || []).map(mapAppointmentToFe);
    }
    throw new Error("Không thể tải danh sách lịch hẹn.");
  },

  async createAppointment(appointment) {
    const body = {
      khachHang: {
        maKhachHang: parseInt(appointment.customerId),
      },
      tieuDe: appointment.title,
      moTa: appointment.notes || "",
      loaiNhacNho:
        appointment.type === "call"
          ? "Gọi điện"
          : appointment.type === "email"
            ? "Email"
            : "Gặp mặt",
      thoiGianNhac: `${appointment.date}T${appointment.time || "00:00"}:00`,
      nhacTruocPhut: parseInt(appointment.reminderBefore || 30),
      trangThaiNhacNho: "Chờ xử lý",
    };

    const response = await fetch(`${BASE_URL}/nhac-nho`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (response.ok) {
      const resJson = await response.json();
      return mapAppointmentToFe(resJson.data);
    }
    throw new Error("Lỗi tạo nhắc nhở lịch hẹn.");
  },

  async updateAppointmentResult(id, result, resultNotes) {
    const response = await fetch(`${BASE_URL}/nhac-nho/${id}/hoan-thanh`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify({ ketQua: result, ghiChu: resultNotes }),
    });
    if (response.ok) {
      const resJson = await response.json();
      return mapAppointmentToFe(resJson.data);
    }
    throw new Error("Lỗi cập nhật kết quả lịch hẹn.");
  },

  async deleteAppointment(id) {
    const response = await fetch(`${BASE_URL}/nhac-nho/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return response.ok;
  },

  // 4. MESSAGE TEMPLATES & MARKETING (Spring Boot Backend API /thong-diep)
  async getTemplates() {
    try {
      const response = await fetch(`${BASE_URL}/thong-diep/mau`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const resJson = await response.json();
        return (resJson.data || []).map((t) => ({
          id: t.maMau,
          name: t.tieuDe,
          content: t.noiDung,
          type: t.loaiThongDiep ? t.loaiThongDiep.trim().toLowerCase() : "email",
          creatorId: t.nhanVienTao ? t.nhanVienTao.maNhanVien : null,
          creatorName: t.nhanVienTao ? t.nhanVienTao.hoTen : "Hệ thống",
          useCount: t.luotSuDung || 0,
        }));
      }
    } catch (e) {
      console.error(
        "Error fetching templates from BE, falling back to LocalStorage",
        e,
      );
    }
    const data = localStorage.getItem("message_templates");
    return data ? JSON.parse(data) : [];
  },

  async createTemplate(template) {
    const data = localStorage.getItem("message_templates");
    const list = data ? JSON.parse(data) : [];
    const newT = {
      id: Math.max(0, ...list.map((t) => t.id)) + 1,
      name: template.name,
      type: template.type || "email",
      content: template.content,
      creatorId: 3,
      creatorName: "Trần Minh Chiến",
      useCount: 0,
    };
    list.push(newT);
    localStorage.setItem("message_templates", JSON.stringify(list));
    return newT;
  },

  async updateTemplate(id, template) {
    const data = localStorage.getItem("message_templates");
    const list = data ? JSON.parse(data) : [];
    const idx = list.findIndex((t) => t.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        name: template.name,
        type: template.type || "email",
        content: template.content,
      };
      localStorage.setItem("message_templates", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Không tìm thấy mẫu tin nhắn.");
  },

  async deleteTemplate(id) {
    const data = localStorage.getItem("message_templates");
    let list = data ? JSON.parse(data) : [];
    list = list.filter((t) => t.id !== id);
    localStorage.setItem("message_templates", JSON.stringify(list));
    return true;
  },

  async sendMessage(message) {
    let response;
    try {
      response = await fetch(`${BASE_URL}/thong-diep/gui`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(message),
      });
    } catch (e) {
      console.error(
        "Error sending message via BE, falling back to LocalStorage",
        e,
      );
      const data = localStorage.getItem("message_history");
      const list = data ? JSON.parse(data) : [];
      const newMsg = {
        id: Math.max(0, ...list.map((m) => m.id)) + 1,
        customerId: parseInt(message.customerId),
        customerName: message.customerName || "Khách hàng",
        channel: message.type || "Email",
        title: message.promoTitle || "Thông điệp Marketing",
        content: message.content,
        status: "success",
        sentTime: new Date().toLocaleString(),
      };
      list.push(newMsg);
      localStorage.setItem("message_history", JSON.stringify(list));
      return newMsg;
    }

    if (response.ok) {
      const resJson = await response.json();
      const m = resJson.data;
      return {
        id: m.maLichSuGui,
        customerId: m.khachHang ? m.khachHang.maKhachHang : null,
        customerName: m.khachHang ? m.khachHang.hoTen : "Khách hàng",
        channel: m.kenhGui || "Email",
        title: m.tieuDe || "Thông điệp Marketing",
        content: m.noiDung || "",
        status: m.trangThaiGui === "Đã gửi" ? "success" : "failed",
        sentTime: m.thoiGianGui
          ? m.thoiGianGui.substring(0, 19).replace("T", " ")
          : "N/A",
      };
    }

    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Lỗi gửi thông điệp từ hệ thống backend.");
  },

  async getMessageHistory() {
    try {
      const response = await fetch(`${BASE_URL}/thong-diep/lich-su`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const resJson = await response.json();
        return (resJson.data || []).map((m) => ({
          id: m.maLichSuGui,
          customerId: m.khachHang ? m.khachHang.maKhachHang : null,
          customerName: m.khachHang ? m.khachHang.hoTen : "Khách hàng",
          channel: m.kenhGui || "Email",
          title: m.tieuDe || "Thông điệp Marketing",
          content: m.noiDung || "",
          status: m.trangThaiGui === "Đã gửi" ? "success" : "failed",
          sentTime: m.thoiGianGui
            ? m.thoiGianGui.substring(0, 19).replace("T", " ")
            : "N/A",
        }));
      }
    } catch (e) {
      console.error(
        "Error fetching message history, falling back to LocalStorage",
        e,
      );
    }
    const data = localStorage.getItem("message_history");
    return data ? JSON.parse(data) : [];
  },

  // 5. INTERACTION HISTORY & ATTACHMENT (Hybrid LocalStorage Fallback)
  async getInteractions() {
    const data = localStorage.getItem("interactions");
    return data ? JSON.parse(data) : [];
  },

  async createInteraction(interaction) {
    const data = localStorage.getItem("interactions");
    const list = data ? JSON.parse(data) : [];
    const newI = {
      id: Math.max(0, ...list.map((i) => i.id)) + 1,
      customerId: parseInt(interaction.customerId),
      customerName: interaction.customerName || "Khách hàng",
      employeeId: 3,
      employeeName: "Trần Minh Chiến",
      type: interaction.type || "call",
      content: interaction.content,
      notes: interaction.notes || "",
      date: new Date().toISOString().substring(0, 19).replace("T", " "),
      attachments: [],
    };
    list.push(newI);
    localStorage.setItem("interactions", JSON.stringify(list));
    return newI;
  },

  async updateInteraction(id, interaction) {
    const data = localStorage.getItem("interactions");
    const list = data ? JSON.parse(data) : [];
    const idx = list.findIndex((i) => i.id === id);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        customerId: parseInt(interaction.customerId),
        type: interaction.type || "call",
        content: interaction.content,
        notes: interaction.notes || "",
      };
      localStorage.setItem("interactions", JSON.stringify(list));
      return list[idx];
    }
    throw new Error("Lỗi sửa lịch sử tương tác.");
  },

  async deleteInteraction(id) {
    const data = localStorage.getItem("interactions");
    let list = data ? JSON.parse(data) : [];
    list = list.filter((i) => i.id !== id);
    localStorage.setItem("interactions", JSON.stringify(list));
    return true;
  },

  async uploadAttachment(interactionId, file) {
    const data = localStorage.getItem("interactions");
    const list = data ? JSON.parse(data) : [];
    const idx = list.findIndex((i) => i.id === parseInt(interactionId));
    if (idx !== -1) {
      const fileId =
        Math.max(0, ...(list[idx].attachments || []).map((a) => a.id)) + 1;
      const newAttachment = {
        id: fileId,
        fileName: file.name,
        fileSize: file.size,
        downloadUrl: "#",
        fileUrl: "#",
      };
      if (!list[idx].attachments) list[idx].attachments = [];
      list[idx].attachments.push(newAttachment);
      localStorage.setItem("interactions", JSON.stringify(list));
      return newAttachment;
    }
    throw new Error("Upload file thất bại.");
  },

  async deleteAttachment(interactionId, fileId) {
    const data = localStorage.getItem("interactions");
    const list = data ? JSON.parse(data) : [];
    const idx = list.findIndex((i) => i.id === parseInt(interactionId));
    if (idx !== -1 && list[idx].attachments) {
      list[idx].attachments = list[idx].attachments.filter(
        (a) => a.id !== parseInt(fileId),
      );
      localStorage.setItem("interactions", JSON.stringify(list));
      return true;
    }
    return false;
  },

  // 6. SYSTEM CONFIGURATION & BACKUP (Hybrid LocalStorage Fallback)
  async getConfig() {
    const data = localStorage.getItem("system_config");
    return data ? JSON.parse(data) : null;
  },

  async updateConfig(config) {
    localStorage.setItem("system_config", JSON.stringify(config));
    return config;
  },

  async downloadBackup() {
    const stateData = {
      message_templates: JSON.parse(
        localStorage.getItem("message_templates") || "[]",
      ),
      message_history: JSON.parse(
        localStorage.getItem("message_history") || "[]",
      ),
      interactions: JSON.parse(localStorage.getItem("interactions") || "[]"),
      system_config: JSON.parse(localStorage.getItem("system_config") || "{}"),
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(stateData));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute(
      "download",
      `crm_backup_${new Date().toISOString().substring(0, 10)}.json`,
    );
    dlAnchorElem.click();
    return true;
  },

  async restoreBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.message_templates)
            localStorage.setItem(
              "message_templates",
              JSON.stringify(parsed.message_templates),
            );
          if (parsed.message_history)
            localStorage.setItem(
              "message_history",
              JSON.stringify(parsed.message_history),
            );
          if (parsed.interactions)
            localStorage.setItem(
              "interactions",
              JSON.stringify(parsed.interactions),
            );
          if (parsed.system_config)
            localStorage.setItem(
              "system_config",
              JSON.stringify(parsed.system_config),
            );
          resolve(true);
        } catch (err) {
          reject(new Error("Restore CSDL thất bại! File không hợp lệ."));
        }
      };
      reader.readAsText(file);
    });
  },
};
