package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageResponse {
    private Integer id;
    private Integer customerId;
    private String customerName;
    private Integer employeeId;
    private String employeeName;
    private String channel; // 'Email', 'SMS', 'Zalo'
    private String title;
    private String content;
    private String status; // 'Đã gửi', 'Thất bại', 'Chờ gửi'
    private String failureReason;
    private LocalDateTime sentTime;
}
