package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.ChiPhiChienDichRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.ChiPhiChienDichResponse;
import com.nhom8.crm.service.ChiPhiChienDichService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chi-phi-chien-dich")
@RequiredArgsConstructor
@Tag(name = "Chi phí chiến dịch", description = "Quản lý chi phí chiến dịch marketing")
public class ChiPhiChienDichController {

    private final ChiPhiChienDichService chiPhiService;

    @GetMapping
    @Operation(summary = "Lấy danh sách chi phí chiến dịch")
    public ResponseEntity<ApiResponse<List<ChiPhiChienDichResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(chiPhiService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết chi phí chiến dịch")
    public ResponseEntity<ApiResponse<ChiPhiChienDichResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(chiPhiService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Tạo chi phí chiến dịch mới")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChiPhiChienDichResponse>> create(
            @Valid @RequestBody ChiPhiChienDichRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm chi phí thành công",
                        chiPhiService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chi phí chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChiPhiChienDichResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ChiPhiChienDichRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật chi phí thành công",
                chiPhiService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chi phí chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Integer id) {
        chiPhiService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa chi phí thành công", null));
    }
}
