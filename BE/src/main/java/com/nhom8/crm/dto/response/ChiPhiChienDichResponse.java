package com.nhom8.crm.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiPhiChienDichResponse {
    private Integer maChiPhi;
    private Integer maChienDich;
    private String campaignName;
    private String tenKhoanChi;
    private String loaiChiPhi;
    private BigDecimal soTien;
    private String ghiChu;
    private String nguonGhiNhan;
    private LocalDateTime ngayGhiNhan;
}
