package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.NhacNho;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.repository.NhacNhoRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/nhac-nho")
@RequiredArgsConstructor
@Tag(name = "Nhắc nhở", description = "Quản lý nhắc nhở")
public class NhacNhoController {

    private final NhacNhoRepository nhacNhoRepository;
    private final NhanVienRepository nhanVienRepository;
    private final KhachHangRepository khachHangRepository;

    @GetMapping("/cua-toi")
    @Operation(summary = "Lấy nhắc nhở theo vai trò của người dùng hiện tại")
    public ResponseEntity<ApiResponse<List<NhacNho>>> getCuaToi(
            @AuthenticationPrincipal UserDetails userDetails) {
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        
        String role = nhanVien.getTaiKhoan().getVaiTro().getTenVaiTro().trim().toUpperCase();
        if ("ADMIN".equals(role) || "MANAGER".equals(role)) {
            // Admin and Manager can see all active pending reminders in the system
            return ResponseEntity.ok(ApiResponse.ok(
                    nhacNhoRepository.findByTrangThaiNhacNho("Chờ xử lý")));
        } else {
            // Employee can only see active pending reminders assigned to them
            return ResponseEntity.ok(ApiResponse.ok(
                    nhacNhoRepository.findByNhanVien_MaNhanVienAndTrangThaiNhacNho(
                            nhanVien.getMaNhanVien(), "Chờ xử lý")));
        }
    }

    @PostMapping
    @Operation(summary = "Tạo nhắc nhở mới")
    public ResponseEntity<ApiResponse<NhacNho>> create(
            @RequestBody NhacNho nhacNho,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (nhacNho.getNhanVien() == null) {
            var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
            nhacNho.setNhanVien(nhanVien);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo nhắc nhở thành công",
                        nhacNhoRepository.save(nhacNho)));
    }

    @PatchMapping("/{id}/hoan-thanh")
    @Operation(summary = "Đánh dấu nhắc nhở đã hoàn thành")
    public ResponseEntity<ApiResponse<NhacNho>> hoanThanh(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        NhacNho nhacNho = nhacNhoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhắc nhở", id));
        nhacNho.setTrangThaiNhacNho("Đã hoàn thành");
        if (body != null) {
            nhacNho.setKetQua(body.get("ketQua"));
            nhacNho.setGhiChuKetQua(body.get("ghiChu"));
        }
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                nhacNhoRepository.save(nhacNho)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy nhắc nhở")
    public ResponseEntity<ApiResponse<Void>> huy(@PathVariable Integer id) {
        NhacNho nhacNho = nhacNhoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhắc nhở", id));
        nhacNho.setTrangThaiNhacNho("Đã hủy");
        nhacNhoRepository.save(nhacNho);
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy nhắc nhở", null));
    }
}
