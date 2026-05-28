package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.DoiMatKhauRequest;
import com.nhom8.crm.dto.request.LoginRequest;
import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.LoginResponse;
import com.nhom8.crm.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng nhập, đăng xuất, quản lý mật khẩu")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", response));
    }

    @PostMapping("/doi-mat-khau")
    @Operation(summary = "Đổi mật khẩu")
    public ResponseEntity<ApiResponse<Void>> doiMatKhau(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody DoiMatKhauRequest request) {
        authService.doiMatKhau(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/quen-mat-khau")
    @Operation(summary = "Gửi OTP quên mật khẩu")
    public ResponseEntity<ApiResponse<Void>> quenMatKhau(
            @RequestBody Map<String, String> body) {
        authService.guiOTP(body.get("email"));
        return ResponseEntity.ok(ApiResponse.ok("Mã OTP đã được gửi đến email của bạn", null));
    }

    @PostMapping("/dat-lai-mat-khau")
    @Operation(summary = "Đặt lại mật khẩu bằng OTP")
    public ResponseEntity<ApiResponse<Void>> datLaiMatKhau(
            @RequestBody Map<String, String> body) {
        authService.datLaiMatKhau(body.get("email"), body.get("otp"), body.get("matKhauMoi"));
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công", null));
    }

    @PostMapping("/dat-lai-mat-khau-truc-tiep")
    @Operation(summary = "Đặt lại mật khẩu trực tiếp không cần OTP (cho mock/demo)")
    public ResponseEntity<ApiResponse<Void>> datLaiMatKhauTrucTiep(
            @RequestBody Map<String, String> body) {
        authService.datLaiMatKhauTrucTiep(body.get("email"), body.get("matKhauMoi"));
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công", null));
    }
}
