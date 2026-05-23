package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InteractionResponse {
    private Integer id;
    private Integer customerId;
    private String customerName;
    private Integer employeeId;
    private String employeeName;
    private String type; // 'call', 'email', 'meeting', 'message'
    private String content;
    private String notes;
    private LocalDateTime date;
    private java.util.List<TepDinhKemResponse> attachments;
}
