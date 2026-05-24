// FE/src/api.js
// CẦU NỐI API - KẾT NỐI SPRING BOOT REST API TRỰC TIẾP (KHÔNG DÙNG MOCK)

const BASE_URL = 'http://localhost:8080/api';

// Hàm kiểm tra nhanh sức khỏe Backend
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    const response = await fetch(`${BASE_URL}/cauhinh`, { 
      method: 'GET', 
      signal: controller.signal 
    });
    clearTimeout(id);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// MAPPERS: Chuyển đổi giữa Entity Backend SQL Server (tiếng Việt) và state React (tiếng Anh)
function mapKhachHangToFe(kh) {
  if (!kh) return null;
  return {
    id: kh.maKhachHang,
    name: kh.hoTen,
    email: kh.email,
    phone: kh.soDienThoai,
    company: kh.congTy,
    status: kh.trangThaiKhach,
    score: kh.diemTiemNang,
    trialStartDate: kh.ngayBatDauDungThu,
    trialDays: kh.soNgayDungThu,
    trialStatus: kh.trangThaiDungThu,
    deleted: kh.daXoa || false,
    deleteReason: kh.lyDoXoa,
    deletedDate: kh.ngayXoa,
    createdDate: kh.ngayTao ? kh.ngayTao.substring(0, 10) : '',
    updatedDate: kh.ngayCapNhat ? kh.ngayCapNhat.substring(0, 10) : '',
    source: kh.maNguonKH === 1 ? 'facebook' : kh.maNguonKH === 2 ? 'google' : kh.maNguonKH === 3 ? 'direct' : kh.maNguonKH === 4 ? 'referral' : 'website',
    industry: kh.maNganhNghe === 1 ? 'Công nghệ' : kh.maNganhNghe === 2 ? 'Bán lẻ' : 'Dịch vụ',
    assignedTo: kh.nguoiPhuTrach ? kh.nguoiPhuTrach.maNhanVien : 1
  };
}

function mapKhachHangToBe(kh) {
  if (!kh) return null;
  return {
    maKhachHang: kh.id || null,
    hoTen: kh.name || '',
    email: kh.email || '',
    soDienThoai: kh.phone || '',
    congTy: kh.company || '',
    trangThaiKhach: kh.status || 'Người truy cập',
    diemTiemNang: kh.score !== undefined ? kh.score : 0,
    ngayBatDauDungThu: kh.trialStartDate || null,
    soNgayDungThu: kh.trialDays !== undefined ? parseInt(kh.trialDays) : 0,
    trangThaiDungThu: kh.trialStatus || 'Chưa dùng thử',
    daXoa: kh.deleted || false,
    lyDoXoa: kh.deleteReason || null,
    maNguonKH: kh.source === 'facebook' ? 1 : kh.source === 'google' ? 2 : kh.source === 'direct' ? 3 : kh.source === 'referral' ? 4 : 5,
    maNganhNghe: kh.industry === 'Công nghệ' ? 1 : kh.industry === 'Bán lẻ' ? 2 : 3
  };
}

function mapTemplateToFe(t) {
  if (!t) return null;
  return {
    id: t.id,
    name: t.title,
    type: t.type ? t.type.toLowerCase() : 'email',
    content: t.content,
    creatorId: t.creatorId,
    creatorName: t.creatorName,
    useCount: t.useCount || 0
  };
}

function mapAppointmentToFe(a) {
  if (!a) return null;
  return {
    id: a.id,
    customerId: a.customerId,
    customerName: a.customerName,
    employeeId: a.employeeId,
    employeeName: a.employeeName,
    title: a.title,
    type: a.type || 'call',
    date: a.date,
    time: a.time,
    reminderBefore: a.reminderBefore,
    notes: a.notes,
    status: a.status,
    result: a.result,
    resultNotes: a.resultNotes
  };
}

function mapInteractionToFe(i) {
  if (!i) return null;
  return {
    id: i.id,
    customerId: i.customerId,
    customerName: i.customerName,
    employeeId: i.employeeId,
    employeeName: i.employeeName,
    type: i.type || 'call',
    content: i.content,
    notes: i.notes,
    date: i.date ? i.date.substring(0, 19).replace('T', ' ') : '',
    file: i.attachments && i.attachments.length > 0 ? {
      ...i.attachments[0],
      fileUrl: i.attachments[0].downloadUrl ? `http://localhost:8080${i.attachments[0].downloadUrl}` : '#'
    } : null,
    attachments: i.attachments ? i.attachments.map(att => ({
      ...att,
      fileUrl: att.downloadUrl ? `http://localhost:8080${att.downloadUrl}` : '#'
    })) : []
  };
}

// CÁC HÀM XỬ LÝ API TRỰC TIẾP
export const API = {
  isOnline() {
    return true;
  },

  // 1. TÀI KHOẢN & ĐĂNG NHẬP
  async login(username, password) {
    let searchUsername = username;
    let searchPassword = password;

    // Ánh xạ tài khoản demo sang email thật trong CSDL
    if (username === 'nhanvien' && password === '123') {
      searchUsername = 'nv01@crm.vn';
      searchPassword = 'nv01123';
    } else if (username === 'truongphong' && password === '123') {
      searchUsername = 'anhthu@gmail.com';
      searchPassword = 'tp123';
    } else if (username === 'admin' && password === '123') {
      searchUsername = 'admin@gmail.com';
      searchPassword = 'admin123';
    }

    const response = await fetch(`${BASE_URL}/taikhoan`);
    if (response.ok) {
      const accounts = await response.json();
      const acc = accounts.find(a => a.email === searchUsername && a.matKhau === searchPassword);
      if (acc) {
        const role = acc.maVaiTro === 1 ? 'admin' : (acc.maVaiTro === 2 ? 'manager' : 'employee');
        const user = {
          id: acc.maTaiKhoan,
          username: username,
          name: role === 'admin' ? 'Admin System' : (role === 'manager' ? 'Nguyễn Hoàng Anh Thư' : 'Trần Minh Chiến'),
          email: acc.email,
          role: role,
          phone: role === 'admin' ? '0901234567' : (role === 'manager' ? '0912345678' : '0987654321'),
          avatar: role === 'admin' ? 'AS' : (role === 'manager' ? 'AT' : 'TC'),
          department: role === 'admin' ? 'IT' : 'Marketing',
          position: role === 'admin' ? 'Quản trị viên' : (role === 'manager' ? 'Trưởng phòng' : 'Nhân viên marketing')
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
      }
    }
    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
  },

  async sendOtp(email) {
    const response = await fetch(`${BASE_URL}/taikhoan/quen-mat-khau`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) {
      throw new Error('Gửi OTP thất bại! Vui lòng kiểm tra email.');
    }
    return true;
  },

  async verifyOtp(email, otp) {
    const response = await fetch(`${BASE_URL}/taikhoan/xac-thuc-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    if (!response.ok) {
      throw new Error('Mã OTP không chính xác hoặc đã hết hạn!');
    }
    return true;
  },

  async resetPassword(email, newPassword) {
    const response = await fetch(`${BASE_URL}/taikhoan/dat-lai-mat-khau`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword })
    });
    if (!response.ok) {
      throw new Error('Đặt lại mật khẩu thất bại!');
    }
    return true;
  },

  // 2. KHÁCH HÀNG & DÙNG THỬ
  async getCustomers() {
    const response = await fetch(`${BASE_URL}/khachhang`);
    if (response.ok) {
      const list = await response.json();
      return list.map(mapKhachHangToFe);
    }
    throw new Error('Không thể tải danh sách khách hàng.');
  },

  async createCustomer(customer) {
    const body = mapKhachHangToBe(customer);
    const response = await fetch(`${BASE_URL}/khachhang`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const saved = await response.json();
      return mapKhachHangToFe(saved);
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi thêm mới khách hàng.');
  },

  async updateCustomer(id, customer) {
    const body = mapKhachHangToBe(customer);
    const response = await fetch(`${BASE_URL}/khachhang/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const updated = await response.json();
      return mapKhachHangToFe(updated);
    }
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Lỗi cập nhật khách hàng.');
  },

  async deleteCustomer(id) {
    const response = await fetch(`${BASE_URL}/khachhang/${id}/soft?lyDo=Đề nghị xóa từ CRM`, { method: 'DELETE' });
    return response.ok;
  },

  async permanentDeleteCustomer(id) {
    const response = await fetch(`${BASE_URL}/khachhang/${id}/permanent`, { method: 'DELETE' });
    return response.ok;
  },

  async getTrialDetails(customerId) {
    const response = await fetch(`${BASE_URL}/khachhang/${customerId}/dungthu`);
    if (response.ok) {
      const details = await response.json();
      return {
        customerId: customerId,
        customerName: details.customerName,
        startDate: details.startDate,
        durationDays: details.durationDays,
        status: details.status,
        remainingDays: details.remainingDays
      };
    }
    throw new Error('Lỗi lấy thông tin dùng thử.');
  },

  async updateTrialDetails(customerId, startDate, durationDays, status = 'Đang dùng thử') {
    const response = await fetch(`${BASE_URL}/khachhang/${customerId}/dungthu`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, durationDays, status })
    });
    if (response.ok) {
      const updated = await response.json();
      return updated;
    }
    throw new Error('Lỗi cập nhật thông tin dùng thử.');
  },

  // 3. LỊCH HẸN & NHẮC NHỞ
  async getAppointments() {
    const response = await fetch(`${BASE_URL}/lichhen`);
    if (response.ok) {
      const list = await response.json();
      return list.map(mapAppointmentToFe);
    }
    throw new Error('Không thể tải danh sách lịch hẹn.');
  },

  async createAppointment(appointment) {
    const body = {
      customerId: parseInt(appointment.customerId),
      employeeId: 3,
      title: appointment.title,
      type: appointment.type || 'call',
      date: appointment.date,
      time: appointment.time,
      reminderBefore: parseInt(appointment.reminderBefore || 30),
      notes: appointment.notes
    };
    const response = await fetch(`${BASE_URL}/lichhen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const saved = await response.json();
      return mapAppointmentToFe(saved);
    }
    throw new Error('Lỗi tạo nhắc nhở lịch hẹn.');
  },

  async updateAppointmentResult(id, result, resultNotes) {
    const response = await fetch(`${BASE_URL}/lichhen/${id}/ketqua`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, resultNotes })
    });
    if (response.ok) {
      const updated = await response.json();
      return mapAppointmentToFe(updated);
    }
    throw new Error('Lỗi cập nhật kết quả lịch hẹn.');
  },

  async deleteAppointment(id) {
    const response = await fetch(`${BASE_URL}/lichhen/${id}`, { method: 'DELETE' });
    return response.ok;
  },

  // 4. MẪU THÔNG ĐIỆP & MARKETING
  async getTemplates() {
    const response = await fetch(`${BASE_URL}/thongdiep/mau`);
    if (response.ok) {
      const list = await response.json();
      return list.map(mapTemplateToFe);
    }
    throw new Error('Không thể tải danh sách mẫu thông điệp.');
  },

  async createTemplate(template) {
    const response = await fetch(`${BASE_URL}/thongdiep/mau`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: template.name,
        content: template.content,
        type: template.type || 'email',
        creatorId: 3
      })
    });
    if (response.ok) {
      const saved = await response.json();
      return mapTemplateToFe(saved);
    }
    throw new Error('Lỗi tạo mẫu thông điệp.');
  },

  async updateTemplate(id, template) {
    const response = await fetch(`${BASE_URL}/thongdiep/mau/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: template.name,
        content: template.content,
        type: template.type || 'email',
        creatorId: 3
      })
    });
    if (response.ok) {
      const updated = await response.json();
      return mapTemplateToFe(updated);
    }
    throw new Error('Lỗi cập nhật mẫu thông điệp.');
  },

  async deleteTemplate(id) {
    const response = await fetch(`${BASE_URL}/thongdiep/mau/${id}`, { method: 'DELETE' });
    return response.ok;
  },

  async sendMessage(message) {
    const response = await fetch(`${BASE_URL}/thongdiep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: parseInt(message.customerId),
        employeeId: 3,
        templateId: message.templateId ? parseInt(message.templateId) : null,
        type: message.type || 'email',
        content: message.content,
        promoTitle: message.promoTitle || '',
        promoDescription: message.promoDescription || '',
        promoCode: message.promoCode || '',
        promoExpiry: message.promoExpiry || '',
        promoLink: message.promoLink || '',
        schedule: message.isScheduled || false,
        scheduleTime: message.scheduleTime || null,
        trackOpen: message.trackOpen !== undefined ? message.trackOpen : true
      })
    });
    if (response.ok) return await response.json();
    throw new Error('Gửi thông điệp marketing thất bại!');
  },

  async getMessageHistory() {
    const response = await fetch(`${BASE_URL}/thongdiep/lichsu`);
    if (response.ok) {
      const list = await response.json();
      return list.map(item => ({
        id: item.id,
        customerId: item.customerId,
        customerName: item.customerName,
        channel: item.channel,
        title: item.title,
        content: item.content,
        status: item.status,
        sentTime: item.sentTime
      }));
    }
    throw new Error('Không thể tải lịch sử thông điệp.');
  },

  // 5. TƯƠNG TÁC & TỆP ĐÍNH KÈM
  async getInteractions() {
    const response = await fetch(`${BASE_URL}/tuongtac`);
    if (response.ok) {
      const list = await response.json();
      return list.map(mapInteractionToFe);
    }
    throw new Error('Không thể tải danh sách lịch sử tương tác.');
  },

  async createInteraction(interaction) {
    const body = {
      customerId: parseInt(interaction.customerId),
      employeeId: 3,
      type: interaction.type || 'call',
      content: interaction.content,
      notes: interaction.notes || ''
    };
    const response = await fetch(`${BASE_URL}/tuongtac`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const saved = await response.json();
      return mapInteractionToFe(saved);
    }
    throw new Error('Lỗi thêm lịch sử tương tác.');
  },

  async updateInteraction(id, interaction) {
    const body = {
      customerId: parseInt(interaction.customerId),
      employeeId: 3,
      type: interaction.type || 'call',
      content: interaction.content,
      notes: interaction.notes || ''
    };
    const response = await fetch(`${BASE_URL}/tuongtac/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const updated = await response.json();
      return mapInteractionToFe(updated);
    }
    throw new Error('Lỗi sửa lịch sử tương tác.');
  },

  async deleteInteraction(id) {
    const response = await fetch(`${BASE_URL}/tuongtac/${id}`, { method: 'DELETE' });
    return response.ok;
  },

  async uploadAttachment(interactionId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/tuongtac/${interactionId}/files`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) {
      const fileData = await response.json();
      return fileData;
    }
    throw new Error('Upload file thất bại.');
  },

  async deleteAttachment(interactionId, fileId) {
    const response = await fetch(`${BASE_URL}/tuongtac/${interactionId}/files/${fileId}`, { method: 'DELETE' });
    return response.ok;
  },

  // 6. CẤU HÌNH & BACKUP
  async getConfig() {
    const response = await fetch(`${BASE_URL}/cauhinh`);
    if (response.ok) {
      const cfg = await response.json();
      return cfg;
    }
    throw new Error('Không thể tải cấu hình hệ thống.');
  },

  async updateConfig(config) {
    const response = await fetch(`${BASE_URL}/cauhinh`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (response.ok) return await response.json();
    throw new Error('Lỗi cập nhật cấu hình hệ thống.');
  },

  async downloadBackup() {
    window.open(`${BASE_URL}/cauhinh/backup`, '_blank');
    return true;
  },

  async restoreBackup(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BASE_URL}/cauhinh/restore`, {
      method: 'POST',
      body: formData
    });
    if (response.ok) return true;
    throw new Error('Restore CSDL thất bại!');
  }
};
