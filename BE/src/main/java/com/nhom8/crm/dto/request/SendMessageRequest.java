package com.nhom8.crm.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotNull(message = "Mã khách hàng không được để trống")
    private Integer customerId;

    private Integer employeeId; // Optional: ID of staff who sends

    private Integer templateId; // Optional: Message Template ID

    @NotBlank(message = "Kênh gửi không được để trống")
    private String type; // 'email', 'sms', 'zalo'

    @NotBlank(message = "Nội dung không được để trống")
    private String content;

    private String promoTitle;
    private String promoCode;
    private String promoDescription;
    private String promoExpiry; // YYYY-MM-DD
    private String promoLink;

    private Boolean schedule;
    private String scheduleTime; // YYYY-MM-DDTHH:mm
    private Boolean trackOpen;
}
