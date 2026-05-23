package com.nhom8.crm.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MauThongDiepRequest {
    private String title;          // tieuDe
    private String content;        // noiDung
    private String type;           // loaiThongDiep (Email, SMS, Zalo)
    private Integer creatorId;     // maNhanVienTao
}
