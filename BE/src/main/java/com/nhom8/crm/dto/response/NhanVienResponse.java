package com.nhom8.crm.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NhanVienResponse {

    private Integer maNhanVien;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String chucVu;
    private String anhDaiDien;
    private String trangThaiTaiKhoan;
}