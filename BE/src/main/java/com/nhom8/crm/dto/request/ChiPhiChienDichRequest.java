package com.nhom8.crm.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiPhiChienDichRequest {

    @NotNull(message = "Mã chiến dịch không được để trống")
    private Integer maChienDich;

    @NotBlank(message = "Tên khoản chi không được để trống")
    @Size(max = 200, message = "Tên khoản chi không vượt quá 200 ký tự")
    private String tenKhoanChi;

    @NotBlank(message = "Loại chi phí không được để trống")
    @Size(max = 100, message = "Loại chi phí không vượt quá 100 ký tự")
    private String loaiChiPhi;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal soTien;

    @Size(max = 300, message = "Ghi chú không vượt quá 300 ký tự")
    private String ghiChu;

    @Size(max = 50)
    private String nguonGhiNhan;

    private String ngayGhiNhan;
}
