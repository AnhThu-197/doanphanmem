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

// Helper for multipart/form-data headers
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

// Quick health check on backend
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

// ======================
// MAPPERS
// ======================

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

    createdDate: kh.ngayTao
      ? kh.ngayTao.substring(0, 10)
      : "",

    updatedDate: kh.ngayCapNhat
      ? kh.ngayCapNhat.substring(0, 10)
      : "",

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
    soNgayDungThu:
      kh.trialDays !== undefined
        ? parseInt(kh.trialDays)
        : 0,

    trangThaiDungThu:
      kh.trialStatus || "Chưa dùng thử",

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
      kh.industry === "Công nghệ"
        ? 1
        : kh.industry === "Bán lẻ"
        ? 2
        : 3,
  };
}

// ======================
// LOCAL STORAGE INIT
// ======================

function initLocalStorage() {
  if (!localStorage.getItem("message_templates")) {
    const defaultTemplates = [
      {
        id: 1,
        name: "Chào mừng khách hàng mới",
        type: "email",
        content:
          "Xin chào {customerName}, chúng tôi rất vui được phục vụ bạn!",
        creatorId: 3,
        creatorName: "Trần Minh Chiến",
        useCount: 15,
      },
    ];

    localStorage.setItem(
      "message_templates",
      JSON.stringify(defaultTemplates)
    );
  }

  if (!localStorage.getItem("message_history")) {
    localStorage.setItem(
      "message_history",
      JSON.stringify([])
    );
  }

  if (!localStorage.getItem("interactions")) {
    localStorage.setItem(
      "interactions",
      JSON.stringify([])
    );
  }

  if (!localStorage.getItem("appointments")) {
    localStorage.setItem(
      "appointments",
      JSON.stringify([])
    );
  }

  if (!localStorage.getItem("system_config")) {
    localStorage.setItem(
      "system_config",
      JSON.stringify({
        companyName: "CRM Nhóm 8",
      })
    );
  }
}

initLocalStorage();

// ======================
// CORE API
// ======================

export const API = {
  isOnline() {
    return true;
  },

  // ======================
  // AUTH
  // ======================

  async login(email, password) {
    try {
      const response = await fetch(
        `${BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            matKhau: password,
          }),
        }
      );

      if (response.ok) {
        const resJson = await response.json();

        if (resJson.success && resJson.data) {
          const loginRes = resJson.data;

          const v = (
            loginRes.vaiTro || ""
          ).toLowerCase();

          const role =
            v.includes("admin") ||
            v.includes("quản trị")
              ? "admin"
              : v.includes("manager") || v.includes("trưởng phòng")
              ? "manager"
              : "employee";

          const user = {
            id: loginRes.maTaiKhoan,
            username: loginRes.email || email,
            name: loginRes.hoTen,
            email: loginRes.email,
            role,
            token: loginRes.token,
          };

          localStorage.setItem(
            "currentUser",
            JSON.stringify(user)
          );

          return {
            success: true,
            user,
          };
        }
      }

      return {
        success: false,
        message:
          "Tên đăng nhập hoặc mật khẩu không đúng",
      };
    } catch (e) {
      console.error("Login error", e);

      return {
        success: false,
        message:
          "Không thể kết nối đến máy chủ backend.",
      };
    }
  },

  async sendOtp(email) {
    const response = await fetch(
      `${BASE_URL}/auth/quen-mat-khau`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Gửi OTP thất bại! Vui lòng kiểm tra email."
      );
    }

    return true;
  },

  async verifyOtp(email, otp) {
    localStorage.setItem("forgot_otp_temp", otp);
    return true;
  },

  async resetPassword(email, newPassword) {
    const otp =
      localStorage.getItem("forgot_otp_temp") || "";

    const response = await fetch(
      `${BASE_URL}/auth/dat-lai-mat-khau`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
          matKhauMoi: newPassword,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Đặt lại mật khẩu thất bại!"
      );
    }

    localStorage.removeItem("forgot_otp_temp");

    return true;
  },

  // ======================
  // CUSTOMERS
  // ======================

  async getCustomers() {
    const response = await fetch(
      `${BASE_URL}/khach-hang/all`,
      {
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const resJson = await response.json();

      return (resJson.data || []).map(
        mapKhachHangToFe
      );
    }

    throw new Error(
      "Không thể tải danh sách khách hàng."
    );
  },

  async createCustomer(customer) {
    const body = mapKhachHangToBe(customer);

    const response = await fetch(
      `${BASE_URL}/khach-hang`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const resJson = await response.json();

      return mapKhachHangToFe(resJson.data);
    }

    throw new Error("Lỗi thêm mới khách hàng.");
  },

  async updateCustomer(id, customer) {
    const body = mapKhachHangToBe(customer);

    const response = await fetch(
      `${BASE_URL}/khach-hang/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const resJson = await response.json();

      return mapKhachHangToFe(resJson.data);
    }

    throw new Error(
      "Lỗi cập nhật khách hàng."
    );
  },

  async deleteCustomer(id) {
    const response = await fetch(
      `${BASE_URL}/khach-hang/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  async permanentDeleteCustomer(id) {
    const response = await fetch(
      `${BASE_URL}/khach-hang/${id}/permanent`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  // ======================
  // TRIAL DETAILS
  // ======================

  async getTrialDetails(id) {
    const response = await fetch(
      `${BASE_URL}/khach-hang/${id}/dungthu`,
      {
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data;
    }

    throw new Error("Không thể lấy chi tiết dùng thử.");
  },

  async updateTrialDetails(targetId, startDate, durationDays, status) {
    const response = await fetch(
      `${BASE_URL}/khach-hang/${targetId}/dungthu`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ startDate, durationDays, status }),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data;
    }

    throw new Error("Không thể cập nhật dùng thử.");
  },

  // ======================
  // APPOINTMENTS (NHẮC NHỞ)
  // ======================

  async getAppointments() {
    try {
      const response = await fetch(
        `${BASE_URL}/nhac-nho/cua-toi`,
        {
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const resJson = await response.json();

        return (resJson.data || []).map((appt) => ({
          id: appt.maNhacNho,
          customerId: appt.khachHang
            ? appt.khachHang.maKhachHang
            : null,
          customerName: appt.khachHang
            ? appt.khachHang.hoTen
            : "",
          title: appt.tieuDe,
          type:
            appt.loaiNhacNho === "Gọi điện"
              ? "call"
              : appt.loaiNhacNho === "Email"
              ? "email"
              : "meeting",
          date: appt.thoiGianNhac
            ? appt.thoiGianNhac.substring(0, 10)
            : "",
          time: appt.thoiGianNhac
            ? appt.thoiGianNhac.substring(11, 16)
            : "",
          reminderBefore: appt.nhacTruocPhut || 30,
          notes: appt.moTa,
          status:
            appt.trangThaiNhacNho === "Chờ xử lý"
              ? "scheduled"
              : appt.trangThaiNhacNho === "Đã hoàn thành"
              ? "completed"
              : "cancelled",
          result: appt.ketQua || "",
          resultNotes: appt.ghiChuKetQua || "",
        }));
      }
    } catch (e) {
      console.error("Error fetching appointments", e);
    }

    const stored = localStorage.getItem("appointments");
    return stored ? JSON.parse(stored) : [];
  },

  async createAppointment(apptForm) {
    const loaiNhacNho =
      apptForm.type === "call"
        ? "Gọi điện"
        : apptForm.type === "email"
        ? "Email"
        : "Gặp mặt";

    const thoiGianNhac = `${apptForm.date}T${apptForm.time || "00:00"}`;

    const payload = {
      khachHang: {
        maKhachHang: parseInt(apptForm.customerId),
      },
      tieuDe: apptForm.title,
      loaiNhacNho: loaiNhacNho,
      thoiGianNhac: thoiGianNhac,
      nhacTruocPhut: parseInt(apptForm.reminderBefore) || 30,
      moTa: apptForm.notes,
      trangThaiNhacNho: "Chờ xử lý",
    };

    const response = await fetch(
      `${BASE_URL}/nhac-nho`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data;
    }

    throw new Error("Lỗi lên lịch nhắc nhở cuộc hẹn.");
  },

  async updateAppointmentResult(id, result, resultNotes) {
    const response = await fetch(
      `${BASE_URL}/nhac-nho/${id}/hoan-thanh`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          ketQua: result,
          ghiChu: resultNotes,
        }),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data;
    }

    throw new Error("Lỗi cập nhật kết quả cuộc hẹn.");
  },

  async deleteAppointment(id) {
    const response = await fetch(
      `${BASE_URL}/nhac-nho/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  // ======================
  // INTERACTIONS (TƯƠNG TÁC)
  // ======================

  async getInteractions() {
    try {
      const response = await fetch(
        `${BASE_URL}/tuongtac`,
        {
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const resJson = await response.json();

        return (resJson || []).map((inter) => ({
          id: inter.id,
          customerId: inter.customerId,
          customerName: inter.customerName,
          employeeId: inter.employeeId,
          employeeName: inter.employeeName,
          type:
            inter.type === "meeting"
              ? "meeting"
              : inter.type === "email"
              ? "email"
              : inter.type === "message"
              ? "message"
              : "call",
          content: inter.content,
          notes: inter.notes,
          date: inter.date
            ? inter.date.substring(0, 10)
            : "",
          attachments: (inter.attachments || []).map(
            (att) => ({
              id: att.id,
              fileName: att.fileName,
              fileType: att.fileType,
              fileSize: att.fileSize,
              downloadUrl: `${BASE_URL}/tuongtac/files/${att.id}`,
            })
          ),
        }));
      }
    } catch (e) {
      console.error("Error fetching interactions", e);
    }

    const stored = localStorage.getItem("interactions");
    return stored ? JSON.parse(stored) : [];
  },

  async createInteraction(interForm) {
    const payload = {
      customerId: parseInt(interForm.customerId),
      type: interForm.type,
      content: interForm.content,
      notes: interForm.notes,
    };

    const response = await fetch(
      `${BASE_URL}/tuongtac`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const resJson = await response.json();

      return {
        id: resJson.id,
        customerId: resJson.customerId,
        customerName: resJson.customerName,
        employeeId: resJson.employeeId,
        employeeName: resJson.employeeName,
        type: resJson.type,
        content: resJson.content,
        notes: resJson.notes,
        date: resJson.date
          ? resJson.date.substring(0, 10)
          : "",
        attachments: [],
      };
    }

    throw new Error("Lỗi thêm mới tương tác.");
  },

  async updateInteraction(id, interForm) {
    const payload = {
      customerId: parseInt(interForm.customerId),
      type: interForm.type,
      content: interForm.content,
      notes: interForm.notes,
    };

    const response = await fetch(
      `${BASE_URL}/tuongtac/${id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const resJson = await response.json();

      return {
        id: resJson.id,
        customerId: resJson.customerId,
        customerName: resJson.customerName,
        employeeId: resJson.employeeId,
        employeeName: resJson.employeeName,
        type: resJson.type,
        content: resJson.content,
        notes: resJson.notes,
        date: resJson.date
          ? resJson.date.substring(0, 10)
          : "",
        attachments: (resJson.attachments || []).map(
          (att) => ({
            id: att.id,
            fileName: att.fileName,
            fileType: att.fileType,
            fileSize: att.fileSize,
            downloadUrl: `${BASE_URL}/tuongtac/files/${att.id}`,
          })
        ),
      };
    }

    throw new Error("Lỗi cập nhật tương tác.");
  },

  async deleteInteraction(id) {
    const response = await fetch(
      `${BASE_URL}/tuongtac/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  async uploadAttachment(interId, file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${BASE_URL}/tuongtac/${interId}/files`,
      {
        method: "POST",
        headers: getUploadHeaders(),
        body: formData,
      }
    );

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Lỗi tải lên tệp đính kèm.");
  },

  async deleteAttachment(interId, fileId) {
    const response = await fetch(
      `${BASE_URL}/tuongtac/${interId}/files/${fileId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    return response.ok;
  },

  // ======================
  // SYSTEM CONFIG & BACKUP
  // ======================

  async getConfig() {
    try {
      const response = await fetch(
        `${BASE_URL}/cauhinh`,
        {
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error("Error fetching config", e);
    }

    const stored = localStorage.getItem("system_config");
    return stored
      ? JSON.parse(stored)
      : { companyName: "CRM Nhóm 8" };
  },

  async updateConfig(body) {
    const response = await fetch(
      `${BASE_URL}/cauhinh`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      return await response.json();
    }

    throw new Error("Lỗi cập nhật cấu hình.");
  },

  async downloadBackup() {
    const response = await fetch(
      `${BASE_URL}/cauhinh/backup`,
      {
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_crm_${new Date()
        .toISOString()
        .substring(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return true;
    }

    throw new Error("Lỗi tải tệp sao lưu.");
  },

  async restoreBackup(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${BASE_URL}/cauhinh/restore`,
      {
        method: "POST",
        headers: getUploadHeaders(),
        body: formData,
      }
    );

    if (response.ok) {
      return true;
    }

    throw new Error("Lỗi khôi phục cơ sở dữ liệu.");
  },

  // ======================
  // TEMPLATES & MARKETING
  // ======================

  async getTemplates() {
    try {
      const response = await fetch(
        `${BASE_URL}/thong-diep/mau`,
        {
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const resJson = await response.json();

        return (resJson.data || []).map((t) => ({
          id: t.maMau,
          name: t.tieuDe,
          content: t.noiDung,
          type: t.loaiThongDiep
            ? t.loaiThongDiep.toLowerCase()
            : "email",
          useCount: t.luotSuDung || 0,
        }));
      }
    } catch (e) {
      console.error("Error fetching templates", e);
    }

    const stored = localStorage.getItem("message_templates");
    return stored ? JSON.parse(stored) : [];
  },

  async createTemplate(templateForm) {
    const response = await fetch(`${BASE_URL}/thong-diep/mau`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(templateForm)
    });
    if (response.ok) {
      const resJson = await response.json();
      const t = resJson.data;
      return {
        id: t.maMau,
        name: t.tieuDe,
        content: t.noiDung,
        type: t.loaiThongDiep ? t.loaiThongDiep.toLowerCase() : 'email',
        useCount: t.luotSuDung || 0
      };
    }
    throw new Error("Lỗi thêm mới mẫu thông điệp.");
  },

  async updateTemplate(id, templateForm) {
    const response = await fetch(`${BASE_URL}/thong-diep/mau/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(templateForm)
    });
    if (response.ok) {
      const resJson = await response.json();
      const t = resJson.data;
      return {
        id: t.maMau,
        name: t.tieuDe,
        content: t.noiDung,
        type: t.loaiThongDiep ? t.loaiThongDiep.toLowerCase() : 'email',
        useCount: t.luotSuDung || 0
      };
    }
    throw new Error("Lỗi cập nhật mẫu thông điệp.");
  },

  async deleteTemplate(id) {
    const response = await fetch(`${BASE_URL}/thong-diep/mau/${id}`, {
      method: "DELETE",
      headers: getHeaders()
    });
    return response.ok;
  },

  async getMessageHistory() {
    try {
      const response = await fetch(
        `${BASE_URL}/thong-diep/lich-su`,
        {
          headers: getHeaders(),
        }
      );

      if (response.ok) {
        const resJson = await response.json();

        return (resJson.data || []).map((h) => ({
          id: h.maLichSuGui,
          customerId: h.khachHang
            ? h.khachHang.maKhachHang
            : null,
          customerName: h.khachHang
            ? h.khachHang.hoTen
            : "",
          employeeId: h.nhanVien
            ? h.nhanVien.maNhanVien
            : null,
          employeeName: h.nhanVien
            ? h.nhanVien.hoTen
            : "",
          templateId: h.mauThongDiep
            ? h.mauThongDiep.maMau
            : null,
          type: h.kenhGui
            ? h.kenhGui.toLowerCase()
            : "email",
          channel: h.kenhGui || "Email",
          promoTitle: h.tieuDe || "",
          content: h.noiDung || "",
          status:
            h.trangThaiGui === "Đã gửi"
              ? "sent"
              : h.trangThaiGui === "Chờ gửi"
              ? "pending"
              : "failed",
          errorMessage: h.lyDoThatBai || "",
          sentTime: h.thoiGianGui
            ? h.thoiGianGui
                .substring(0, 16)
                .replace("T", " ")
            : "",
        }));
      }
    } catch (e) {
      console.error("Error fetching message history", e);
    }

    const stored = localStorage.getItem("message_history");
    return stored ? JSON.parse(stored) : [];
  },

  async sendMessage(payload) {
    const type =
      payload.type === "sms"
        ? "SMS"
        : payload.type === "zalo"
        ? "Zalo"
        : "Email";

    const response = await fetch(
      `${BASE_URL}/thong-diep/gui`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          ...payload,
          type: type,
        }),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data;
    }

    throw new Error("Lỗi gửi thông điệp.");
  },

  // ======================
  // ADMIN USER MANAGEMENT
  // ======================

  async getAllUsers() {
    const response = await fetch(
      `${BASE_URL}/admin/users`,
      {
        headers: getHeaders(),
      }
    );

    if (response.ok) {
      const resJson = await response.json();
      return resJson.data || [];
    }

    throw new Error("Không thể lấy danh sách tài khoản.");
  },
};