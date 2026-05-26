package com.nhom8.crm.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrungLapKhachHangResponse {
    private String id;
    private CustomerDetail customer1;
    private CustomerDetail customer2;
    private Double similarity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerDetail {
        private Integer id;
        private String name;
        private String email;
        private String phone;
    }
}
