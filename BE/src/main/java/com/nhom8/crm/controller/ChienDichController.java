package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.ChienDichRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.entity.ChienDich;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.ChienDichRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/chien-dich")
@RequiredArgsConstructor
@Tag(name = "Chiến dịch", description = "Quản lý chiến dịch marketing")
public class ChienDichController {

    private final ChienDichRepository chienDichRepository;
    private final NhanVienRepository nhanVienRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách chiến dịch")
    public ResponseEntity<ApiResponse<List<ChienDich>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(chienDichRepository.findByDaXoaFalse()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết chiến dịch")
    public ResponseEntity<ApiResponse<ChienDich>> getById(@PathVariable Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));
        return ResponseEntity.ok(ApiResponse.ok(cd));
    }

    @PostMapping
    @Operation(summary = "Tạo chiến dịch mới")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChienDich>> create(
            @Valid @RequestBody ChienDichRequest request) {
        ChienDich cd = buildFromRequest(new ChienDich(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo chiến dịch thành công",
                        chienDichRepository.save(cd)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChienDich>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ChienDichRequest request) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));
        buildFromRequest(cd, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                chienDichRepository.save(cd)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));
        cd.setDaXoa(true);
        cd.setNgayXoa(LocalDateTime.now());
        chienDichRepository.save(cd);
        return ResponseEntity.ok(ApiResponse.ok("Xóa chiến dịch thành công", null));
    }

    private ChienDich buildFromRequest(ChienDich cd, ChienDichRequest req) {
        cd.setTenChienDich(req.getTenChienDich());
        cd.setMoTa(req.getMoTa());
        cd.setMucTieu(req.getMucTieu());
        cd.setLoaiChienDich(req.getLoaiChienDich());
        cd.setNgayBatDau(req.getNgayBatDau());
        cd.setNgayKetThuc(req.getNgayKetThuc());
        cd.setNganSach(req.getNganSach());
        if (req.getTrangThaiChienDich() != null) cd.setTrangThaiChienDich(req.getTrangThaiChienDich());
        if (req.getMaNguoiQuanLy() != null) {
            cd.setNguoiQuanLy(nhanVienRepository.findById(req.getMaNguoiQuanLy()).orElse(null));
        }
        return cd;
    }
}
