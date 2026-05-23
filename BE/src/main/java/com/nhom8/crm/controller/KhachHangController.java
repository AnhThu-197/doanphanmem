package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.KhachHangRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.KhachHangResponse;
import com.nhom8.crm.service.KhachHangService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/khach-hang")
@RequiredArgsConstructor
@Tag(name = "Khách hàng", description = "Quản lý khách hàng")
public class KhachHangController {

    private final KhachHangService khachHangService;

    @GetMapping
    @Operation(summary = "Lấy danh sách khách hàng")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(khachHangService.getAll()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết khách hàng")
    public ResponseEntity<ApiResponse<KhachHangResponse>> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(khachHangService.getById(id)));
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm khách hàng")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.ok(khachHangService.search(keyword)));
    }

    @PostMapping
    @Operation(summary = "Thêm khách hàng mới")
    public ResponseEntity<ApiResponse<KhachHangResponse>> create(
            @Valid @RequestBody KhachHangRequest request) {
        KhachHangResponse response = khachHangService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thêm khách hàng thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật khách hàng")
    public ResponseEntity<ApiResponse<KhachHangResponse>> update(
            @PathVariable Integer id,
            @Valid @RequestBody KhachHangRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công",
                khachHangService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm khách hàng (chuyển vào thùng rác)")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {
        String lyDo = body != null ? body.get("lyDo") : null;
        khachHangService.softDelete(id, lyDo);
        return ResponseEntity.ok(ApiResponse.ok("Đã chuyển vào thùng rác", null));
    }

    @GetMapping("/thung-rac")
    @Operation(summary = "Lấy danh sách khách hàng trong thùng rác")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> getTrash() {
        return ResponseEntity.ok(ApiResponse.ok(khachHangService.getTrash()));
    }

    @PostMapping("/{id}/khoi-phuc")
    @Operation(summary = "Khôi phục khách hàng từ thùng rác")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Integer id) {
        khachHangService.restore(id);
        return ResponseEntity.ok(ApiResponse.ok("Khôi phục thành công", null));
    }
}
