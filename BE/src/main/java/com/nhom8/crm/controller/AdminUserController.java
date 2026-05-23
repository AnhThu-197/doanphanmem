package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.AdminUserRequest;
import com.nhom8.crm.dto.response.AdminUserResponse;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.service.AdminUserService;
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
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin User Management", description = "Quản lý tài khoản người dùng và phân quyền (chỉ dành cho Admin)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả người dùng")
    public ResponseEntity<ApiResponse<List<AdminUserResponse>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getAllUsers()));
    }

    @PostMapping
    @Operation(summary = "Tạo tài khoản người dùng mới")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createUser(
            @Valid @RequestBody AdminUserRequest request) {
        AdminUserResponse response = adminUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo tài khoản thành công", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin tài khoản người dùng")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUserRequest request) {
        AdminUserResponse response = adminUserService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật tài khoản thành công", response));
    }

    @PatchMapping("/{id}/lock")
    @Operation(summary = "Khóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<Void>> lockUser(@PathVariable Integer id) {
        adminUserService.lockUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Khóa tài khoản thành công", null));
    }

    @PatchMapping("/{id}/unlock")
    @Operation(summary = "Mở khóa tài khoản người dùng")
    public ResponseEntity<ApiResponse<Void>> unlockUser(@PathVariable Integer id) {
        adminUserService.unlockUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Mở khóa tài khoản thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa vĩnh viễn tài khoản người dùng và dọn dẹp các ràng buộc liên quan")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa người dùng thành công", null));
    }
}
