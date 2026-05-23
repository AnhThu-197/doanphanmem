package com.nhom8.crm.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TepDinhKemResponse {
    private Integer id;             // maTep
    private String fileName;        // tenTep
    private String fileType;        // loaiTep
    private String downloadUrl;     // URL to download the file
    private LocalDateTime createdDate;
}
