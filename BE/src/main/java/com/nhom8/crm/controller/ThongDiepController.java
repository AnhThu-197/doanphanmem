package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.LichSuGuiThongDiep;
import com.nhom8.crm.entity.MauThongDiep;
import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.repository.LichSuGuiThongDiepRepository;
import com.nhom8.crm.repository.MauThongDiepRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.service.EmailService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/thong-diep")
@RequiredArgsConstructor
@Tag(name = "Thông điệp", description = "Quản lý mẫu thông điệp và lịch sử gửi tin")
@Slf4j
public class ThongDiepController {

    private final EmailService emailService;
    private final LichSuGuiThongDiepRepository lichSuGuiThongDiepRepository;
    private final MauThongDiepRepository mauThongDiepRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;

    @GetMapping("/mau")
    @Operation(summary = "Lấy tất cả mẫu thông điệp")
    public ResponseEntity<ApiResponse<List<MauThongDiep>>> getMẫu() {
        return ResponseEntity.ok(ApiResponse.ok(mauThongDiepRepository.findAll()));
    }

    @GetMapping("/lich-su")
    @Operation(summary = "Lấy lịch sử gửi thông điệp theo vai trò của người dùng hiện tại")
    public ResponseEntity<ApiResponse<List<LichSuGuiThongDiep>>> getLichSu(
            @AuthenticationPrincipal UserDetails userDetails) {
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        
        String role = nhanVien.getTaiKhoan().getVaiTro().getTenVaiTro().trim().toUpperCase();
        if ("ADMIN".equals(role) || "MANAGER".equals(role)) {
            // Admin and Manager can see all message history
            return ResponseEntity.ok(ApiResponse.ok(lichSuGuiThongDiepRepository.findAll()));
        } else {
            // Employee can only see their own message history
            return ResponseEntity.ok(ApiResponse.ok(
                    lichSuGuiThongDiepRepository.findByNhanVien_MaNhanVien(nhanVien.getMaNhanVien())));
        }
    }

    @PostMapping("/gui")
    @Operation(summary = "Gửi thông điệp đến khách hàng")
    public ResponseEntity<ApiResponse<LichSuGuiThongDiep>> guiThongDiep(
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        Integer maKhachHang = Integer.parseInt(payload.get("customerId"));
        KhachHang khachHang = khachHangRepository.findById(maKhachHang)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", maKhachHang));

        String channel = payload.get("type");
        if (channel == null || channel.trim().isEmpty()) {
            channel = "Email";
        } else {
            channel = channel.trim();
        }
        
        String tieuDe = payload.getOrDefault("promoTitle", "Thông điệp Marketing");
        String content = payload.get("content");
        
        Integer maMau = null;
        if (payload.get("templateId") != null && !payload.get("templateId").isEmpty()) {
            try {
                maMau = Integer.parseInt(payload.get("templateId"));
            } catch (Exception e) {
                // Ignore
            }
        }
        
        MauThongDiep mauThongDiep = null;
        if (maMau != null) {
            mauThongDiep = mauThongDiepRepository.findById(maMau).orElse(null);
            if (mauThongDiep != null) {
                mauThongDiep.setLuotSuDung(mauThongDiep.getLuotSuDung() + 1);
                mauThongDiepRepository.save(mauThongDiep);
            }
        }

        // Thực hiện gửi email thực tế nếu kênh là Email
        String trangThai = "Đã gửi";
        String lyDoThatBai = null;
        
        if ("Email".equalsIgnoreCase(channel)) {
            try {
                String toEmail = khachHang.getEmail();
                log.info("📧 Chuẩn bị gửi email tới: {} | Tiêu đề: {}", toEmail, tieuDe);
                if (toEmail != null && toEmail.contains("@")) {
                    emailService.sendEmail(toEmail, tieuDe, content);
                    log.info("✅ Đã gọi emailService.sendEmail() tới: {}", toEmail);
                } else {
                    trangThai = "Thất bại";
                    lyDoThatBai = "Email khách hàng không hợp lệ: " + toEmail;
                    log.warn("⚠️ Email không hợp lệ: {}", toEmail);
                }
            } catch (Exception e) {
                trangThai = "Thất bại";
                lyDoThatBai = e.getMessage();
                log.error("❌ Lỗi gửi email: {}", e.getMessage(), e);
            }
        } else {
            log.info("📱 Kênh gửi là {} - không gửi email thực tế", channel);
        }

        LichSuGuiThongDiep lichSu = LichSuGuiThongDiep.builder()
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .mauThongDiep(mauThongDiep)
                .kenhGui("SMS".equalsIgnoreCase(channel) ? "SMS" : ("Zalo".equalsIgnoreCase(channel) ? "Zalo" : "Email"))
                .tieuDe(tieuDe)
                .noiDung(content)
                .trangThaiGui(trangThai)
                .lyDoThatBai(lyDoThatBai)
                .build();

        LichSuGuiThongDiep saved = lichSuGuiThongDiepRepository.save(lichSu);
        return ResponseEntity.ok(ApiResponse.ok("Gửi thông điệp thành công", saved));
    }
}
