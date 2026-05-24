package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.NhanVienResponse;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.repository.NhanVienRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nhan-vien")
@RequiredArgsConstructor
@Tag(name = "Nhân viên", description = "Quản lý và tra cứu nhân viên")
public class NhanVienController {

    private final NhanVienRepository nhanVienRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách nhân viên đang hoạt động")
    public ResponseEntity<ApiResponse<List<NhanVienResponse>>> getAllActiveEmployees() {
        List<NhanVienResponse> result = nhanVienRepository.findAll()
                .stream()
                .filter(nv -> nv.getTaiKhoan() != null)
                .filter(nv -> {
                    String trangThai = nv.getTaiKhoan().getTrangThai();
                    return trangThai != null && trangThai.trim().equalsIgnoreCase("Hoạt động");
                })
                .filter(nv -> {
                    String chucVu = nv.getChucVu();
                    return chucVu != null && chucVu.toLowerCase().contains("nhân viên");
                })
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    private NhanVienResponse toResponse(NhanVien nv) {
        return NhanVienResponse.builder()
                .maNhanVien(nv.getMaNhanVien())
                .hoTen(nv.getHoTen())
                .email(nv.getTaiKhoan() != null ? nv.getTaiKhoan().getEmail() : null)
                .soDienThoai(nv.getSoDienThoai())
                .chucVu(nv.getChucVu())
                .anhDaiDien(nv.getAnhDaiDien())
                .trangThaiTaiKhoan(nv.getTaiKhoan() != null ? nv.getTaiKhoan().getTrangThai() : null)
                .build();
    }
}