package com.nhom8.crm.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class KhachHangRequest {

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải có 10-11 chữ số")
    private String soDienThoai;

    private String gioiTinh;
    private LocalDate ngaySinh;
    private String congTy;
    private String chucVuTaiCongTy;
    private String websiteCongTy;
    private String diaChiChiTiet;
    private String trangThaiKhach;

    @Min(value = 0, message = "Điểm tiềm năng không được âm")
    @Max(value = 1000, message = "Điểm tiềm năng không được vượt quá 1000")
    private Integer diemTiemNang;

    private LocalDate ngayBatDauDungThu;

    @Min(value = 0, message = "Số ngày dùng thử không được âm")
    private Integer soNgayDungThu;

    private Integer maNguoiPhuTrach;
    private Integer maNganhNghe;
    private Integer maNguonKH;
    private Integer maPhuongXa;
}
