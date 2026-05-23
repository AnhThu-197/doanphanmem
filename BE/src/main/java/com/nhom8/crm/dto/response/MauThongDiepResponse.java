package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MauThongDiepResponse {
    private Integer id;             // maMau
    private String title;           // tieuDe
    private String content;         // noiDung
    private String type;            // loaiThongDiep
    private Integer creatorId;      // maNhanVienTao
    private String creatorName;     // hoTen of nhanVienTao
    private Integer useCount;       // luotSuDung
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
}
