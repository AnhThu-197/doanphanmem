package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialResponse {
    private Integer customerId;
    private String customerName;
    private LocalDate startDate;        // ngayBatDauDungThu
    private Integer durationDays;       // soNgayDungThu
    private String status;              // trangThaiDungThu
    private Integer remainingDays;      // computed using fn_SoNgayConLaiDungThu
}
