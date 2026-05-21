package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KhachHangResponse {

    private Integer maKhachHang;
    private String hoTen;
    private String email;
    private String soDienThoai;
    private String gioiTinh;
    private LocalDate ngaySinh;
    private String congTy;
    private String chucVuTaiCongTy;
    private String websiteCongTy;
    private String diaChiChiTiet;
    private String trangThaiKhach;
    private Integer diemTiemNang;
    private LocalDate ngayBatDauDungThu;
    private Integer soNgayDungThu;
    private String trangThaiDungThu;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;

    // Thông tin liên quan
    private String tenNguoiPhuTrach;
    private Integer maNguoiPhuTrach;
    private String tenNganhNghe;
    private String tenNguonKH;
    private String tenPhuongXa;
    private String tenTinhThanh;
}
