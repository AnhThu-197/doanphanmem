package com.nhom8.crm.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    @Email(message = "Tên đăng nhập phải là một địa chỉ email hợp lệ")
    private String username;

    @NotBlank(message = "Họ tên không được để trống")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Vai trò không được để trống")
    private String role; // admin / manager / employee
}
