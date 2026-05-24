package com.nhom8.crm.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LichSuPhanBoResponse {

    private Integer maLichSuPhanBo;
    private Integer maKhachHang;
    private String tenKhachHang;

    private Integer maNhanVien;
    private String tenNhanVien;

    private String phuongPhap;
    private LocalDateTime ngayPhanBo;
}