package com.nhom8.crm.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChienDichResponse {

    private Integer maChienDich;
    private String tenChienDich;
    private String moTa;
    private String mucTieu;
    private String loaiChienDich;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private BigDecimal nganSach;
    private BigDecimal doanhThuThucTe;
    private BigDecimal chiPhiThucTe;
    private String trangThaiChienDich;
    private LocalDateTime ngayTao;
    private LocalDateTime ngayCapNhat;

    // Thông tin liên quan
    private String tenNguoiQuanLy;
    private Integer maNguoiQuanLy;

    // Tính toán thêm
    private BigDecimal roi;
    private BigDecimal budgetUsagePercent;
}
