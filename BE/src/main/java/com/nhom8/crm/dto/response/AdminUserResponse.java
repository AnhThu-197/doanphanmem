package com.nhom8.crm.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {
    private Integer id; // maTaiKhoan
    private Integer maNhanVien;
    private String username;
    private String name;
    private String email;
    private String role;
    private String status;
    private String lastLogin;
    private String createdDate;
}
