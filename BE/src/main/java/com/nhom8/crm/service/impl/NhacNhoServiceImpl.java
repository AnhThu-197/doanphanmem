package com.nhom8.crm.service.impl;

import com.nhom8.crm.dto.request.AppointmentRequest;
import com.nhom8.crm.dto.request.AppointmentResultRequest;
import com.nhom8.crm.dto.response.AppointmentResponse;
import com.nhom8.crm.entity.*;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.*;
import com.nhom8.crm.service.NhacNhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhacNhoServiceImpl implements NhacNhoService {

    private final NhacNhoRepository repository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final LichSuTuongTacRepository interactionRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final org.springframework.mail.javamail.JavaMailSender mailSender;

    @Autowired
    public NhacNhoServiceImpl(NhacNhoRepository repository,
                              KhachHangRepository khachHangRepository,
                              NhanVienRepository nhanVienRepository,
                              LichSuTuongTacRepository interactionRepository,
                              ThongBaoRepository thongBaoRepository,
                              org.springframework.mail.javamail.JavaMailSender mailSender) {
        this.repository = repository;
        this.khachHangRepository = khachHangRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.interactionRepository = interactionRepository;
        this.thongBaoRepository = thongBaoRepository;
        this.mailSender = mailSender;
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return repository.findAllByOrderByThoiGianNhacDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByCustomerId(Integer customerId) {
        if (!khachHangRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + customerId);
        }
        return repository.findByKhachHangMaKhachHangOrderByThoiGianNhacDesc(customerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByEmployeeId(Integer employeeId) {
        if (!nhanVienRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + employeeId);
        }
        return repository.findByNhanVienMaNhanVienOrderByThoiGianNhacDesc(employeeId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse getAppointmentById(Integer id) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));
        return convertToResponse(entity);
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));

        LocalDateTime thoiGianNhac = parseDateTime(request.getDate(), request.getTime());
        String loaiNhacNho = mapFrontendTypeToDb(request.getType());
        Integer nhacTruocPhut = request.getReminderBefore() != null ? request.getReminderBefore() : 30;

        // Call Stored Procedure sp_ThemNhacNho (SP09)
        List<Object[]> spResultList = repository.callSpThemNhacNho(
                khachHang.getMaKhachHang(),
                nhanVien.getMaNhanVien(),
                request.getTitle(),
                loaiNhacNho,
                thoiGianNhac,
                nhacTruocPhut,
                request.getNotes()
        );

        if (spResultList == null || spResultList.isEmpty()) {
            throw new RuntimeException("Gọi Stored Procedure thất bại và không trả về kết quả.");
        }

        Object[] spResult = spResultList.get(0);
        String ketQua = (String) spResult[0];
        String thongBao = (String) spResult[1];

        if ("Lỗi".equalsIgnoreCase(ketQua)) {
            throw new IllegalArgumentException(thongBao);
        }

        // Successfully inserted! Retrieve the newly generated ID
        Integer newId = null;
        if (spResult.length > 2 && spResult[2] != null) {
            if (spResult[2] instanceof Number) {
                newId = ((Number) spResult[2]).intValue();
            } else {
                try {
                    newId = Integer.parseInt(spResult[2].toString().trim());
                } catch (Exception e) {
                    newId = null;
                }
            }
        }

        // Retrieve the generated entity and optionally update fields
        NhacNho saved = null;
        if (newId != null) {
            saved = repository.findById(newId).orElse(null);
        }

        // Fallback: If the generated ID is null or findById returns empty (due to database driver or synchronization sync),
        // we retrieve the latest appointment created for this customer as a highly reliable fallback.
        if (saved == null) {
            List<NhacNho> latestAppointments = repository.findByKhachHangMaKhachHangOrderByThoiGianNhacDesc(khachHang.getMaKhachHang());
            if (!latestAppointments.isEmpty()) {
                saved = latestAppointments.get(0);
            }
        }

        if (saved == null) {
            throw new ResourceNotFoundException("Không tìm thấy lịch hẹn vừa tạo với mã: " + newId);
        }

        // Tự động tạo thông báo gửi tới nhân viên phụ trách lịch hẹn
        try {
            ThongBao tb = ThongBao.builder()
                    .nhanVien(nhanVien)
                    .tieuDe("Lịch hẹn mới")
                    .noiDung("Bạn có lịch hẹn mới: " + saved.getTieuDe() + " với khách hàng " + khachHang.getHoTen())
                    .loaiThongBao("Lịch hẹn")
                    .daDoc(false)
                    .duongDanLienKet("/smart-reminders")
                    .build();
            thongBaoRepository.save(tb);
        } catch (Exception e) {
            System.err.println("❌ Lỗi tự động tạo thông báo lịch hẹn: " + e.getMessage());
        }

        if (request.getStatus() != null || request.getResult() != null || request.getResultNotes() != null) {
            if (request.getStatus() != null) {
                saved.setTrangThaiNhacNho(mapFrontendStatusToDb(request.getStatus()));
            }
            if (request.getResult() != null) {
                saved.setKetQua(mapFrontendResultToDb(request.getResult()));
            }
            if (request.getResultNotes() != null) {
                saved.setGhiChuKetQua(request.getResultNotes());
            }
            saved = repository.save(saved);
        }

        logInteractionHistoryIfCompleted(saved);

        // Tự động gửi email nhắc nhở tới nhân viên phụ trách cuộc hẹn
        if (saved != null && nhanVien.getTaiKhoan() != null && nhanVien.getTaiKhoan().getEmail() != null) {
            String employeeEmail = nhanVien.getTaiKhoan().getEmail();
            if (!employeeEmail.trim().isEmpty()) {
                try {
                    jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
                    org.springframework.mail.javamail.MimeMessageHelper helper = 
                        new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, true, "UTF-8");

                    helper.setFrom("vyphan59621@gmail.com", "Công ty phần mềm CRM");
                    helper.setTo(employeeEmail);
                    helper.setSubject("[CRM REMINDER] Lịch nhắc hẹn mới: " + saved.getTieuDe());

                    // Xây dựng email HTML tuyệt đẹp
                    StringBuilder html = new StringBuilder();
                    html.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
                    html.append("<div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;'>");
                    html.append("<div style='background-color: #2b4856; padding: 20px; text-align: center; color: white;'>");
                    html.append("<h2 style='margin: 0;'>BÁO CÁO LỊCH HẸN MỚI</h2>");
                    html.append("</div>");
                    html.append("<div style='padding: 20px;'>");
                    html.append("<p style='font-size: 16px;'>Xin chào <strong>").append(nhanVien.getHoTen()).append("</strong>,</p>");
                    html.append("<p style='font-size: 14px; line-height: 1.6;'>Bạn vừa có một lịch nhắc hẹn mới được phân công trên hệ thống CRM.</p>");
                    
                    // Chi tiết lịch hẹn
                    html.append("<div style='background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #cbd5e1; margin-top: 15px;'>");
                    html.append("<p style='margin: 5px 0;'><strong>Tiêu đề:</strong> ").append(saved.getTieuDe()).append("</p>");
                    html.append("<p style='margin: 5px 0;'><strong>Khách hàng:</strong> ").append(khachHang.getHoTen()).append(" (").append(khachHang.getEmail()).append(" - ").append(khachHang.getSoDienThoai()).append(")</p>");
                    html.append("<p style='margin: 5px 0;'><strong>Hình thức:</strong> ").append(loaiNhacNho).append("</p>");
                    
                    java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy");
                    html.append("<p style='margin: 5px 0;'><strong>Thời gian hẹn:</strong> <span style='color: #2b4856; font-weight: bold;'>").append(thoiGianNhac.format(formatter)).append("</span></p>");
                    html.append("<p style='margin: 5px 0;'><strong>Báo trước:</strong> ").append(nhacTruocPhut).append(" phút</p>");
                    if (request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
                        html.append("<p style='margin: 5px 0;'><strong>Mô tả/Ghi chú:</strong> ").append(request.getNotes()).append("</p>");
                    }
                    html.append("</div>");
                    
                    html.append("<p style='font-size: 14px; margin-top: 20px;'>Vui lòng sắp xếp thời gian để chuẩn bị cho cuộc hẹn đúng giờ.</p>");
                    html.append("</div>");
                    html.append("<div style='background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;'>");
                    html.append("Email nhắc nhở tự động từ hệ thống CRM.");
                    html.append("</div></div></body></html>");

                    helper.setText(html.toString(), true);
                    
                    // Gửi email bất đồng bộ để tránh block tiến trình của người dùng
                    new Thread(() -> {
                        try {
                            mailSender.send(mimeMessage);
                            System.out.println("[CRM REMINDER] Đã gửi email nhắc hẹn thành công tới nhân viên: " + employeeEmail);
                        } catch (Exception e) {
                            System.err.println("[CRM REMINDER] Gửi mail nhắc hẹn thất bại: " + e.getMessage());
                        }
                    }).start();

                } catch (Exception ex) {
                    System.err.println("[CRM REMINDER] Lỗi chuẩn bị email nhắc hẹn: " + ex.getMessage());
                }
            }
        }

        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Integer id, AppointmentRequest request) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));

        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));

        LocalDateTime thoiGianNhac = parseDateTime(request.getDate(), request.getTime());

        entity.setKhachHang(khachHang);
        entity.setNhanVien(nhanVien);
        entity.setTieuDe(request.getTitle());
        entity.setMoTa(request.getNotes());
        entity.setLoaiNhacNho(mapFrontendTypeToDb(request.getType()));
        entity.setThoiGianNhac(thoiGianNhac);
        entity.setNhacTruocPhut(request.getReminderBefore() != null ? request.getReminderBefore() : 30);
        entity.setTrangThaiNhacNho(mapFrontendStatusToDb(request.getStatus()));
        entity.setKetQua(mapFrontendResultToDb(request.getResult()));
        entity.setGhiChuKetQua(request.getResultNotes());

        NhacNho updated = repository.save(entity);
        logInteractionHistoryIfCompleted(updated);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentResult(Integer id, AppointmentResultRequest request) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));

        entity.setTrangThaiNhacNho("Đã hoàn thành"); // Automatically mark as completed
        entity.setKetQua(mapFrontendResultToDb(request.getResult()));
        entity.setGhiChuKetQua(request.getResultNotes());

        NhacNho updated = repository.save(entity);
        logInteractionHistoryIfCompleted(updated);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id);
        }
        repository.deleteById(id);
    }

    // --- Helper Methods ---

    private void logInteractionHistoryIfCompleted(NhacNho entity) {
        if ("Đã hoàn thành".equals(entity.getTrangThaiNhacNho()) && entity.getKetQua() != null) {
            String content = entity.getLoaiNhacNho() + ": " + entity.getTieuDe() + " - Kết quả: " + entity.getKetQua();
            String title = "Kết quả cuộc hẹn: " + entity.getTieuDe();
            
            // Check if there is an existing interaction with the same customer and matching title/content
            boolean exists = interactionRepository.findByKhachHangMaKhachHangOrderByThoiGianTaoDesc(entity.getKhachHang().getMaKhachHang())
                .stream()
                .anyMatch(i -> title.equals(i.getTieuDe()) && content.equals(i.getNoiDung()) && 
                               (entity.getGhiChuKetQua() == null ? i.getKetQua() == null : entity.getGhiChuKetQua().equals(i.getKetQua())));
            
            if (!exists) {
                LichSuTuongTac tuongTac = LichSuTuongTac.builder()
                        .khachHang(entity.getKhachHang())
                        .nhanVien(entity.getNhanVien())
                        .loaiTuongTac(entity.getLoaiNhacNho())
                        .tieuDe(title)
                        .noiDung(content)
                        .ketQua(entity.getGhiChuKetQua())
                        .thoiGianTao(LocalDateTime.now())
                        .ngayCapNhat(LocalDateTime.now())
                        .build();
                interactionRepository.save(tuongTac);
            }
        }
    }

    private LocalDateTime parseDateTime(String dateStr, String timeStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            LocalTime time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
            return LocalDateTime.of(date, time);
        } catch (Exception e) {
            try {
                LocalDate date = LocalDate.parse(dateStr);
                LocalTime time = LocalTime.parse(timeStr);
                return LocalDateTime.of(date, time);
            } catch (Exception ex) {
                return LocalDateTime.now().plusDays(1); // default backup
            }
        }
    }

    private AppointmentResponse convertToResponse(NhacNho entity) {
        String dateStr = entity.getThoiGianNhac().toLocalDate().toString();
        String timeStr = entity.getThoiGianNhac().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));

        return AppointmentResponse.builder()
                .id(entity.getMaNhacNho())
                .customerId(entity.getKhachHang().getMaKhachHang())
                .customerName(entity.getKhachHang().getHoTen())
                .employeeId(entity.getNhanVien().getMaNhanVien())
                .employeeName(entity.getNhanVien().getHoTen())
                .title(entity.getTieuDe())
                .type(mapDbToFrontendType(entity.getLoaiNhacNho()))
                .date(dateStr)
                .time(timeStr)
                .reminderBefore(entity.getNhacTruocPhut())
                .notes(entity.getMoTa())
                .status(mapDbToFrontendStatus(entity.getTrangThaiNhacNho()))
                .result(entity.getKetQua())
                .resultNotes(entity.getGhiChuKetQua())
                .createdDate(entity.getNgayTao())
                .updatedDate(entity.getNgayCapNhat())
                .build();
    }

    private String mapFrontendTypeToDb(String feType) {
        if (feType == null) return "Gọi điện";
        switch (feType.toLowerCase()) {
            case "call":
                return "Gọi điện";
            case "email":
                return "Email";
            case "meeting":
            case "video":
                return "Gặp mặt";
            case "message":
                return "Nhắn tin";
            default:
                return "Gọi điện";
        }
    }

    private String mapDbToFrontendType(String dbType) {
        if (dbType == null) return "call";
        switch (dbType) {
            case "Gọi điện":
                return "call";
            case "Email":
                return "email";
            case "Gặp mặt":
                return "meeting";
            case "Nhắn tin":
                return "message";
            default:
                return "call";
        }
    }

    private String mapFrontendStatusToDb(String feStatus) {
        if (feStatus == null) return "Chờ xử lý";
        switch (feStatus.toLowerCase()) {
            case "scheduled":
                return "Chờ xử lý";
            case "completed":
                return "Đã hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return "Chờ xử lý";
        }
    }

    private String mapDbToFrontendStatus(String dbStatus) {
        if (dbStatus == null) return "scheduled";
        switch (dbStatus) {
            case "Chờ xử lý":
                return "scheduled";
            case "Đã hoàn thành":
                return "completed";
            case "Đã hủy":
                return "cancelled";
            default:
                return "scheduled";
        }
    }

    private String mapFrontendResultToDb(String feResult) {
        if (feResult == null || feResult.trim().isEmpty()) return null;
        String clean = feResult.trim().toLowerCase();
        if (clean.contains("thành công") || clean.contains("success")) {
            return "Thành công";
        }
        if (clean.contains("bận") || clean.contains("busy")) {
            return "Khách bận";
        }
        if (clean.contains("từ chối") || clean.contains("decline") || clean.contains("reject")) {
            return "Khách từ chối";
        }
        if (feResult.equals("Thành công") || feResult.equals("Khách bận") || feResult.equals("Khách từ chối")) {
            return feResult;
        }
        return null;
    }
}
