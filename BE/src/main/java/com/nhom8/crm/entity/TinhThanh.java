package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "TinhThanh")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TinhThanh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTinhThanh")
    private Integer maTinhThanh;

    @Column(name = "tenTinhThanh", nullable = false, length = 100)
    private String tenTinhThanh;

    @Column(name = "loai", length = 30)
    @Builder.Default
    private String loai = "Tỉnh";
}
