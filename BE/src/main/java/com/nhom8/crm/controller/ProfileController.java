package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.BadRequestException;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.NhanVienRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@Tag(name = "Profile", description = "Thông tin cá nhân nhân viên")
public class ProfileController {

    private final NhanVienRepository nhanVienRepository;

    @GetMapping("/me")
    @Operation(summary = "Xem thông tin cá nhân")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        return ResponseEntity.ok(ApiResponse.ok(buildProfileMap(nhanVien)));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin cá nhân")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {

        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        String hoTen = body.get("hoTen");
        if (hoTen != null && !hoTen.isBlank()) {
            nhanVien.setHoTen(hoTen.trim());
        }

        String soDienThoai = body.get("soDienThoai");
        if (soDienThoai != null) {
            // Kiểm tra trùng SĐT với nhân viên khác
            nhanVienRepository.findBySoDienThoai(soDienThoai.trim())
                    .filter(other -> !other.getMaNhanVien().equals(nhanVien.getMaNhanVien()))
                    .ifPresent(other -> { throw new BadRequestException("Số điện thoại đã được sử dụng"); });
            nhanVien.setSoDienThoai(soDienThoai.trim());
        }

        String diaChiChiTiet = body.get("diaChiChiTiet");
        if (diaChiChiTiet != null) {
            nhanVien.setDiaChiChiTiet(diaChiChiTiet.trim());
        }

        nhanVienRepository.save(nhanVien);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", buildProfileMap(nhanVien)));
    }

    // ---- helper ----
    private Map<String, Object> buildProfileMap(NhanVien nhanVien) {
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("maTaiKhoan", nhanVien.getTaiKhoan().getMaTaiKhoan());
        profile.put("maNhanVien", nhanVien.getMaNhanVien());
        profile.put("hoTen", nhanVien.getHoTen());
        profile.put("email", nhanVien.getTaiKhoan().getEmail());
        profile.put("vaiTro", nhanVien.getTaiKhoan().getVaiTro().getTenVaiTro());
        profile.put("soDienThoai", nhanVien.getSoDienThoai());
        profile.put("chucVu", nhanVien.getChucVu());
        profile.put("anhDaiDien", nhanVien.getAnhDaiDien());
        profile.put("diaChiChiTiet", nhanVien.getDiaChiChiTiet());
        profile.put("ngaySinh", nhanVien.getNgaySinh());
        profile.put("gioiTinh", nhanVien.getGioiTinh());
        profile.put("ngayVaoLam", nhanVien.getNgayVaoLam());
        profile.put("ghiChu", nhanVien.getGhiChu());

        if (nhanVien.getPhuongXa() != null) {
            profile.put("maPhuongXa", nhanVien.getPhuongXa().getMaPhuongXa());
            profile.put("tenPhuongXa", nhanVien.getPhuongXa().getTenPhuongXa());
            if (nhanVien.getPhuongXa().getTinhThanh() != null) {
                profile.put("maTinhThanh", nhanVien.getPhuongXa().getTinhThanh().getMaTinhThanh());
                profile.put("tenTinhThanh", nhanVien.getPhuongXa().getTinhThanh().getTenTinhThanh());
            }
        }
        return profile;
    }
}

