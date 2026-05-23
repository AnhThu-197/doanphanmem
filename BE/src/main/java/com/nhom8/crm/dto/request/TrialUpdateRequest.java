package com.nhom8.crm.dto.request;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialUpdateRequest {
    private LocalDate startDate;        // ngayBatDauDungThu
    private Integer durationDays;       // soNgayDungThu
    private String status;              // trangThaiDungThu
}
