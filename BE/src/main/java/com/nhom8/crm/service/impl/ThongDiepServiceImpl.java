package com.nhom8.crm.service.impl;

import com.nhom8.crm.dto.request.MauThongDiepRequest;
import com.nhom8.crm.dto.response.MauThongDiepResponse;
import com.nhom8.crm.dto.request.SendMessageRequest;
import com.nhom8.crm.dto.response.SendMessageResponse;
import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.entity.LichSuGuiThongDiep;
import com.nhom8.crm.entity.LichSuTuongTac;
import com.nhom8.crm.entity.MauThongDiep;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.repository.LichSuGuiThongDiepRepository;
import com.nhom8.crm.repository.LichSuTuongTacRepository;
import com.nhom8.crm.repository.MauThongDiepRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.service.ThongDiepService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ThongDiepServiceImpl implements ThongDiepService {

    private final LichSuGuiThongDiepRepository repository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final MauThongDiepRepository mauThongDiepRepository;
    private final LichSuTuongTacRepository interactionRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public ThongDiepServiceImpl(LichSuGuiThongDiepRepository repository,
                                KhachHangRepository khachHangRepository,
                                NhanVienRepository nhanVienRepository,
                                MauThongDiepRepository mauThongDiepRepository,
                                LichSuTuongTacRepository interactionRepository,
                                JavaMailSender mailSender) {
        this.repository = repository;
        this.khachHangRepository = khachHangRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.mauThongDiepRepository = mauThongDiepRepository;
        this.interactionRepository = interactionRepository;
        this.mailSender = mailSender;
    }

    @Override
    @Transactional
    public SendMessageResponse sendMessage(SendMessageRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = null;
        if (request.getEmployeeId() != null) {
            nhanVien = nhanVienRepository.findById(request.getEmployeeId()).orElse(null);
        }

        MauThongDiep template = null;
        if (request.getTemplateId() != null) {
            template = mauThongDiepRepository.findById(request.getTemplateId()).orElse(null);
        }

        // Map type
        String kenhGui = mapTypeToChannel(request.getType());

        // Parse content placeholders
        String finalContent = request.getContent()
                .replace("{customerName}", khachHang.getHoTen())
                .replace("{hoTen}", khachHang.getHoTen())
                .replace("{date}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))
                .replace("{time}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));

        String title = request.getPromoTitle() != null && !request.getPromoTitle().trim().isEmpty() 
                ? request.getPromoTitle() 
                : (template != null ? template.getTieuDe() : "Thông điệp từ hệ thống");

        String status = "Đã gửi";
        String failureReason = null;

        // Check if scheduled
        LocalDateTime sendTime = LocalDateTime.now();
        if (request.getSchedule() != null && request.getSchedule() && request.getScheduleTime() != null && !request.getScheduleTime().trim().isEmpty()) {
            status = "Chờ gửi";
            try {
                sendTime = LocalDateTime.parse(request.getScheduleTime());
            } catch (Exception e) {
                sendTime = LocalDateTime.now().plusDays(1);
            }
        }

        // Handle Live Email Sending
        if ("Email".equalsIgnoreCase(kenhGui) && "Đã gửi".equals(status)) {
            try {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

                helper.setFrom("vyphan59621@gmail.com");
                helper.setTo(khachHang.getEmail());
                helper.setSubject(title);

                // Build rich HTML body
                StringBuilder emailHtml = new StringBuilder();
                emailHtml.append("<html><body style='font-family: Arial, sans-serif; color: #333;'>");
                emailHtml.append("<div style='max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;'>");
                emailHtml.append("<div style='background-color: #2b4856; padding: 20px; text-align: center; color: white;'>");
                emailHtml.append("<h2 style='margin: 0;'>HỆ THỐNG MARKETING CRM</h2>");
                emailHtml.append("</div>");
                emailHtml.append("<div style='padding: 20px;'>");
                emailHtml.append("<p style='font-size: 16px; line-height: 1.6;'>").append(finalContent.replace("\n", "<br/>")).append("</p>");

                // Append promotion details if present
                if (request.getPromoTitle() != null && !request.getPromoTitle().trim().isEmpty()) {
                    emailHtml.append("<div style='margin-top: 25px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #2b4856; border-radius: 4px;'>");
                    emailHtml.append("<h4 style='margin: 0 0 10px 0; color: #2b4856;'>").append(request.getPromoTitle()).append("</h4>");
                    if (request.getPromoDescription() != null && !request.getPromoDescription().trim().isEmpty()) {
                        emailHtml.append("<p style='margin: 0 0 10px 0; font-size: 14px;'>").append(request.getPromoDescription()).append("</p>");
                    }
                    if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
                        emailHtml.append("<p style='margin: 0 0 10px 0;'><strong>Mã ưu đãi: </strong><span style='background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;'>").append(request.getPromoCode()).append("</span></p>");
                    }
                    if (request.getPromoExpiry() != null && !request.getPromoExpiry().trim().isEmpty()) {
                        emailHtml.append("<p style='margin: 0 0 10px 0; font-size: 13px; color: #64748b;'>Hạn sử dụng: ").append(request.getPromoExpiry()).append("</p>");
                    }
                    if (request.getPromoLink() != null && !request.getPromoLink().trim().isEmpty()) {
                        emailHtml.append("<div style='margin-top: 15px;'><a href='").append(request.getPromoLink())
                                .append("' style='background-color: #2b4856; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;'>Nhận ưu đãi ngay</a></div>");
                    }
                    emailHtml.append("</div>");
                }

                emailHtml.append("</div>");
                emailHtml.append("<div style='background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;'>");
                emailHtml.append("Email này được gửi tự động từ bộ phận chăm sóc khách hàng CRM.");
                emailHtml.append("</div></div></body></html>");

                helper.setText(emailHtml.toString(), true);
                mailSender.send(mimeMessage);

            } catch (Exception e) {
                status = "Thất bại";
                failureReason = "Lỗi kết nối SMTP hoặc lỗi gửi mail: " + e.getMessage();
            }
        }

        // Save History
        LichSuGuiThongDiep saved;
        if ("Đã gửi".equals(status)) {
            // Gọi Stored Procedure sp_GuiThongDiep (SP10)
            repository.callSpGuiThongDiep(
                    khachHang.getMaKhachHang(),
                    nhanVien != null ? nhanVien.getMaNhanVien() : null,
                    template != null ? template.getMaMau() : null,
                    kenhGui,
                    title,
                    finalContent
            );

            // Nạp lại bản ghi vừa tạo mới nhất từ Database để lấy đầy đủ thông tin trả về
            List<LichSuGuiThongDiep> history = repository.findByKhachHangMaKhachHangOrderByThoiGianGuiDesc(khachHang.getMaKhachHang());
            saved = history.isEmpty() ? LichSuGuiThongDiep.builder()
                    .khachHang(khachHang)
                    .nhanVien(nhanVien)
                    .mauThongDiep(template)
                    .kenhGui(kenhGui)
                    .tieuDe(title)
                    .noiDung(finalContent)
                    .trangThaiGui(status)
                    .thoiGianGui(sendTime)
                    .build() : history.get(0);

            // Tự động đồng bộ sang Lịch sử tương tác
            String loaiTuongTac = "Nhắn tin";
            if ("Email".equalsIgnoreCase(kenhGui)) loaiTuongTac = "Email";

            LichSuTuongTac tuongTac = LichSuTuongTac.builder()
                    .khachHang(khachHang)
                    .nhanVien(nhanVien)
                    .loaiTuongTac(loaiTuongTac)
                    .tieuDe(title)
                    .noiDung(finalContent + (request.getPromoCode() != null ? " [Mã KM: " + request.getPromoCode() + "]" : ""))
                    .kenhLienLac(kenhGui)
                    .ketQua("Thành công")
                    .thoiGianTao(LocalDateTime.now())
                    .ngayCapNhat(LocalDateTime.now())
                    .build();
            interactionRepository.save(tuongTac);
        } else {
            // Đối với các trạng thái khác (Chờ gửi hoặc Thất bại), dùng JPA lưu trữ chuẩn
            LichSuGuiThongDiep messageHistory = LichSuGuiThongDiep.builder()
                    .khachHang(khachHang)
                    .nhanVien(nhanVien)
                    .mauThongDiep(template)
                    .kenhGui(kenhGui)
                    .tieuDe(title)
                    .noiDung(finalContent)
                    .trangThaiGui(status)
                    .lyDoThatBai(failureReason)
                    .thoiGianGui(sendTime)
                    .build();
            saved = repository.save(messageHistory);

            if (template != null) {
                template.setLuotSuDung(template.getLuotSuDung() + 1);
                mauThongDiepRepository.save(template);
            }
        }

        return convertToResponse(saved);
    }

    @Override
    public List<SendMessageResponse> getMessageHistory() {
        return repository.findAllByOrderByThoiGianGuiDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SendMessageResponse> getMessageHistoryByCustomerId(Integer customerId) {
        if (!khachHangRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + customerId);
        }
        return repository.findByKhachHangMaKhachHangOrderByThoiGianGuiDesc(customerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // --- Helper Methods ---

    private String mapTypeToChannel(String type) {
        if (type == null) return "Email";
        switch (type.toLowerCase()) {
            case "email":
                return "Email";
            case "sms":
                return "SMS";
            case "zalo":
                return "Zalo";
            default:
                return "Email";
        }
    }

    private SendMessageResponse convertToResponse(LichSuGuiThongDiep entity) {
        return SendMessageResponse.builder()
                .id(entity.getMaLichSuGui())
                .customerId(entity.getKhachHang().getMaKhachHang())
                .customerName(entity.getKhachHang().getHoTen())
                .employeeId(entity.getNhanVien() != null ? entity.getNhanVien().getMaNhanVien() : null)
                .employeeName(entity.getNhanVien() != null ? entity.getNhanVien().getHoTen() : "Hệ thống")
                .channel(entity.getKenhGui())
                .title(entity.getTieuDe())
                .content(entity.getNoiDung())
                .status(entity.getTrangThaiGui())
                .failureReason(entity.getLyDoThatBai())
                .sentTime(entity.getThoiGianGui())
                .build();
    }

    @Override
    public List<MauThongDiepResponse> getAllTemplates() {
        return mauThongDiepRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MauThongDiepResponse getTemplateById(Integer id) {
        MauThongDiep entity = mauThongDiepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu thông điệp với mã: " + id));
        return convertToResponse(entity);
    }

    @Override
    public List<MauThongDiepResponse> getTemplatesByType(String type) {
        String dbType = "Email";
        if (type != null) {
            if (type.equalsIgnoreCase("sms")) dbType = "SMS";
            else if (type.equalsIgnoreCase("zalo")) dbType = "Zalo";
        }
        return mauThongDiepRepository.findByLoaiThongDiep(dbType).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MauThongDiepResponse createTemplate(MauThongDiepRequest request) {
        NhanVien creator = null;
        if (request.getCreatorId() != null) {
            creator = nhanVienRepository.findById(request.getCreatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên tạo mẫu với mã: " + request.getCreatorId()));
        }

        String dbType = "Email";
        if (request.getType() != null) {
            if (request.getType().equalsIgnoreCase("sms")) dbType = "SMS";
            else if (request.getType().equalsIgnoreCase("zalo")) dbType = "Zalo";
        }

        MauThongDiep template = MauThongDiep.builder()
                .tieuDe(request.getTitle())
                .noiDung(request.getContent())
                .loaiThongDiep(dbType)
                .nhanVienTao(creator)
                .luotSuDung(0)
                .build();

        MauThongDiep saved = mauThongDiepRepository.save(template);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public MauThongDiepResponse updateTemplate(Integer id, MauThongDiepRequest request) {
        MauThongDiep entity = mauThongDiepRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu thông điệp với mã: " + id));

        NhanVien creator = null;
        if (request.getCreatorId() != null) {
            creator = nhanVienRepository.findById(request.getCreatorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên tạo mẫu với mã: " + request.getCreatorId()));
        }

        String dbType = "Email";
        if (request.getType() != null) {
            if (request.getType().equalsIgnoreCase("sms")) dbType = "SMS";
            else if (request.getType().equalsIgnoreCase("zalo")) dbType = "Zalo";
        }

        entity.setTieuDe(request.getTitle());
        entity.setNoiDung(request.getContent());
        entity.setLoaiThongDiep(dbType);
        entity.setNhanVienTao(creator);

        MauThongDiep updated = mauThongDiepRepository.save(entity);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteTemplate(Integer id) {
        if (!mauThongDiepRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy mẫu thông điệp với mã: " + id);
        }
        mauThongDiepRepository.deleteById(id);
    }

    private MauThongDiepResponse convertToResponse(MauThongDiep entity) {
        return MauThongDiepResponse.builder()
                .id(entity.getMaMau())
                .title(entity.getTieuDe())
                .content(entity.getNoiDung())
                .type(entity.getLoaiThongDiep())
                .creatorId(entity.getNhanVienTao() != null ? entity.getNhanVienTao().getMaNhanVien() : null)
                .creatorName(entity.getNhanVienTao() != null ? entity.getNhanVienTao().getHoTen() : "Hệ thống")
                .useCount(entity.getLuotSuDung())
                .createdDate(entity.getNgayTao())
                .updatedDate(entity.getNgayCapNhat())
                .build();
    }
}
