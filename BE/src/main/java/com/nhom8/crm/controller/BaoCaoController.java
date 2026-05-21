package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/bao-cao")
@RequiredArgsConstructor
@Tag(name = "Báo cáo", description = "Báo cáo và thống kê")
public class BaoCaoController {

    private final KhachHangRepository khachHangRepository;
    private final ChienDichRepository chienDichRepository;
    private final HopDongRepository hopDongRepository;
    private final ChiPhiChienDichRepository chiPhiRepository;

    @GetMapping("/tong-quan")
    @Operation(summary = "Thống kê tổng quan dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> tongQuan() {
        Map<String, Object> stats = new HashMap<>();

        // Thống kê khách hàng theo trạng thái
        stats.put("tongKhachHang", khachHangRepository.findByDaXoaFalse().size());
        stats.put("khachTiemNang", khachHangRepository.countByTrangThai("KH tiềm năng mới"));
        stats.put("khachTrienVong", khachHangRepository.countByTrangThai("KH triển vọng"));
        stats.put("khachChinhThuc", khachHangRepository.countByTrangThai("KH chính thức"));
        stats.put("khachTrungThanh", khachHangRepository.countByTrangThai("KH trung thành"));

        // Thống kê chiến dịch
        stats.put("tongChienDich", chienDichRepository.findByDaXoaFalse().size());
        stats.put("chienDichDangChay",
                chienDichRepository.findByTrangThaiChienDichAndDaXoaFalse("Đang chạy").size());

        // Thống kê doanh thu
        BigDecimal doanhThu = hopDongRepository.sumDoanhThuThang();
        stats.put("tongDoanhThu", doanhThu);

        // Khách đang dùng thử
        stats.put("khachDangDungThu", khachHangRepository.findDangDungThu().size());

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/chien-dich/{id}/roi")
    @Operation(summary = "Tính ROI của chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRƯỞNG_PHÒNG')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> roiChienDich(
            @PathVariable Integer id) {
        BigDecimal tongChiPhi = chiPhiRepository.sumByChienDich(id);
        BigDecimal doanhThu = hopDongRepository.sumDoanhThuByChienDich(id);

        Map<String, Object> roi = new HashMap<>();
        roi.put("tongChiPhi", tongChiPhi);
        roi.put("doanhThu", doanhThu);

        if (tongChiPhi.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal roiValue = doanhThu.subtract(tongChiPhi)
                    .divide(tongChiPhi, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            roi.put("roi", roiValue);
        } else {
            roi.put("roi", null);
        }

        return ResponseEntity.ok(ApiResponse.ok(roi));
    }
}
