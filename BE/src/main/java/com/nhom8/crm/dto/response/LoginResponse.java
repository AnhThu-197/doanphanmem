package com.nhom8.crm.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String tokenType = "Bearer";
    private Integer maTaiKhoan;
    private Integer maNhanVien;
    private String hoTen;
    private String email;
    private String vaiTro;
    private String chucVu;
    private String anhDaiDien;
}
