package com.nhom8.crm.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nhom8.crm.dto.request.ChienDichRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.ChienDichResponse;
import com.nhom8.crm.service.ChienDichService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chien-dich")
@RequiredArgsConstructor
@Tag(name = "Chiến dịch", description = "Quản lý chiến dịch marketing")
public class ChienDichController {

    private final ChienDichService chienDichService;

    @GetMapping
    @Operation(summary = "Lấy danh sách chiến dịch")
    public ResponseEntity<ApiResponse<List<ChienDichResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.getAll()));
    }

    @GetMapping("/thung-rac")
    @Operation(summary = "Lấy danh sách chiến dịch đã xóa")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ChienDichResponse>>> getTrash() {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.getTrash()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết chiến dịch")
    public ResponseEntity<ApiResponse<ChienDichResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm chiến dịch")
    public ResponseEntity<ApiResponse<List<ChienDichResponse>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.search(keyword)));
    }

    @PostMapping
    @Operation(summary = "Tạo chiến dịch mới")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChienDichResponse>> create(
            @Valid @RequestBody ChienDichRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo chiến dịch thành công",
                        chienDichService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChienDichResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody ChienDichRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                chienDichService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id,
            @RequestParam(required = false) String lyDo) {
        chienDichService.delete(id, lyDo);
        return ResponseEntity.ok(ApiResponse.ok("Xóa chiến dịch thành công", null));
    }

    @PutMapping("/{id}/khoi-phuc")
    @Operation(summary = "Khôi phục chiến dịch đã xóa")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ChienDichResponse>> restore(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok("Khôi phục thành công",
                chienDichService.restore(id)));
    }

    @DeleteMapping("/{id}/vinh-vien")
    @Operation(summary = "Xóa vĩnh viễn chiến dịch")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePermanently(@PathVariable Integer id) {
        chienDichService.deletePermanently(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa vĩnh viễn chiến dịch thành công", null));
    }

    @GetMapping("/{id}/roi")
    @Operation(summary = "Tính toán ROI chiến dịch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> calculateROI(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.calculateROI(id)));
    }

    @GetMapping("/statistics")
    @Operation(summary = "Lấy thống kê chiến dịch")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.ok(chienDichService.getStatistics()));
    }
}
