package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.KhachHangRequest;
import com.nhom8.crm.dto.request.TrialUpdateRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.KhachHangResponse;
import com.nhom8.crm.dto.response.TrialResponse;
import com.nhom8.crm.dto.response.LichSuPhanBoResponse;
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

    @GetMapping("/all")
    @Operation(summary = "Lấy tất cả khách hàng kể cả đã xóa mềm")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> getAllIncludingDeleted() {
        return ResponseEntity.ok(
                ApiResponse.ok(khachHangService.getAllIncludingDeleted())
        );
    }

    @GetMapping("/lich-su-phan-bo")
    @Operation(summary = "Lấy lịch sử phân bổ khách hàng")
    public ResponseEntity<ApiResponse<List<LichSuPhanBoResponse>>> getLichSuPhanBo() {
        return ResponseEntity.ok(ApiResponse.ok(khachHangService.getLichSuPhanBo()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết khách hàng")
    public ResponseEntity<ApiResponse<KhachHangResponse>> getById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                ApiResponse.ok(khachHangService.getById(id))
        );
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm khách hàng")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> search(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                ApiResponse.ok(khachHangService.search(keyword))
        );
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

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Cập nhật thành công",
                        khachHangService.update(id, request)
                )
        );
    }

    @PatchMapping("/{id}/phan-bo")
    @Operation(summary = "Phân bổ khách hàng cho nhân viên")
    public ResponseEntity<ApiResponse<Void>> phanBoKhachHang(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, Object> body) {

        Integer maNhanVienMoi = null;
        String phuongPhap = "round_robin";

        if (body != null) {
            Object maNhanVienObj = body.get("maNhanVienMoi");
            if (maNhanVienObj instanceof Number) {
                maNhanVienMoi = ((Number) maNhanVienObj).intValue();
            }

            Object phuongPhapObj = body.get("phuongPhap");
            if (phuongPhapObj != null) {
                phuongPhap = phuongPhapObj.toString();
            }
        }

        khachHangService.phanBoKhachHang(id, maNhanVienMoi, phuongPhap);

        return ResponseEntity.ok(ApiResponse.ok("Phân bổ khách hàng thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa mềm khách hàng")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> body) {

        String lyDo = body != null ? body.get("lyDo") : null;

        khachHangService.softDelete(id, lyDo);

        return ResponseEntity.ok(
                ApiResponse.ok("Đã chuyển vào thùng rác", null)
        );
    }

    @DeleteMapping("/{id}/permanent")
    @Operation(summary = "Xóa vĩnh viễn khách hàng")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePermanent(
            @PathVariable Integer id) {

        khachHangService.deletePermanent(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Đã xóa vĩnh viễn", null)
        );
    }

    @GetMapping("/thung-rac")
    @Operation(summary = "Lấy danh sách khách hàng trong thùng rác")
    public ResponseEntity<ApiResponse<List<KhachHangResponse>>> getTrash() {

        return ResponseEntity.ok(
                ApiResponse.ok(khachHangService.getTrash())
        );
    }

    @PostMapping("/{id}/khoi-phuc")
    @Operation(summary = "Khôi phục khách hàng")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Integer id) {
        khachHangService.restore(id);

        return ResponseEntity.ok(
                ApiResponse.ok("Khôi phục thành công", null)
        );
    }

    @GetMapping("/{id}/dungthu")
    @Operation(summary = "Lấy thông tin dùng thử")
    public ResponseEntity<ApiResponse<TrialResponse>> getTrialDetails(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        khachHangService.getTrialDetails(id)
                )
        );
    }

    @PutMapping("/{id}/dungthu")
    @Operation(summary = "Cập nhật thông tin dùng thử")
    public ResponseEntity<ApiResponse<TrialResponse>> updateTrialDetails(
            @PathVariable Integer id,
            @Valid @RequestBody TrialUpdateRequest request) {

        return ResponseEntity.ok(
                ApiResponse.ok(
                        "Cập nhật dùng thử thành công",
                        khachHangService.updateTrialDetails(id, request)
                )
        );
    }
}