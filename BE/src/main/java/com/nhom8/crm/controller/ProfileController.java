package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final NhanVienRepository nhanVienRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

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

        return ResponseEntity.ok(ApiResponse.ok(profile));
    }
}

