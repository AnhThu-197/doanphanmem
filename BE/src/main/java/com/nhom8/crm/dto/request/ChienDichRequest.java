package com.nhom8.crm.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ChienDichRequest {

    @NotBlank(message = "Tên chiến dịch không được để trống")
    private String tenChienDich;

    private String moTa;
    private String mucTieu;
    private String loaiChienDich;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDate ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được để trống")
    private LocalDate ngayKetThuc;

    @NotNull(message = "Ngân sách không được để trống")
    @DecimalMin(value = "0", message = "Ngân sách không được âm")
    private BigDecimal nganSach;

    private String trangThaiChienDich;
    private Integer maNguoiQuanLy;
}
