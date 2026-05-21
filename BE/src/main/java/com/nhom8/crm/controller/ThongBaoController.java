package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.ThongBao;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.repository.ThongBaoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/thong-bao")
@RequiredArgsConstructor
@Tag(name = "Thông báo", description = "Quản lý thông báo")
public class ThongBaoController {

    private final ThongBaoRepository thongBaoRepository;
    private final NhanVienRepository nhanVienRepository;

    @GetMapping
    @Operation(summary = "Lấy thông báo của tôi")
    public ResponseEntity<ApiResponse<List<ThongBao>>> getCuaToi(
            @AuthenticationPrincipal UserDetails userDetails) {
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        return ResponseEntity.ok(ApiResponse.ok(
                thongBaoRepository.findByNhanVien_MaNhanVienOrderByThoiGianTaoDesc(
                        nhanVien.getMaNhanVien())));
    }

    @GetMapping("/so-chua-doc")
    @Operation(summary = "Đếm số thông báo chưa đọc")
    public ResponseEntity<ApiResponse<Map<String, Long>>> soChuaDoc(
            @AuthenticationPrincipal UserDetails userDetails) {
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        long count = thongBaoRepository.countByNhanVien_MaNhanVienAndDaDocFalse(
                nhanVien.getMaNhanVien());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("soChuaDoc", count)));
    }

    @PatchMapping("/{id}/da-doc")
    @Operation(summary = "Đánh dấu đã đọc")
    public ResponseEntity<ApiResponse<Void>> danhDauDaDoc(@PathVariable Integer id) {
        ThongBao tb = thongBaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo", id));
        tb.setDaDoc(true);
        thongBaoRepository.save(tb);
        return ResponseEntity.ok(ApiResponse.ok("Đã đánh dấu đọc", null));
    }

    @PatchMapping("/doc-tat-ca")
    @Operation(summary = "Đánh dấu tất cả đã đọc")
    public ResponseEntity<ApiResponse<Void>> docTatCa(
            @AuthenticationPrincipal UserDetails userDetails) {
        var nhanVien = nhanVienRepository.findByTaiKhoan_Email(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));
        List<ThongBao> chuaDoc = thongBaoRepository
                .findByNhanVien_MaNhanVienAndDaDocFalse(nhanVien.getMaNhanVien());
        chuaDoc.forEach(tb -> tb.setDaDoc(true));
        thongBaoRepository.saveAll(chuaDoc);
        return ResponseEntity.ok(ApiResponse.ok("Đã đọc tất cả thông báo", null));
    }
}
