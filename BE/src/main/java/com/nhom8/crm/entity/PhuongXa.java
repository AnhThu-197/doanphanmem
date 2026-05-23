package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "PhuongXa")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PhuongXa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maPhuongXa")
    private Integer maPhuongXa;

    @Column(name = "tenPhuongXa", nullable = false, length = 100)
    private String tenPhuongXa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTinhThanh", nullable = false)
    private TinhThanh tinhThanh;

    @Column(name = "loai", length = 20)
    @Builder.Default
    private String loai = "Xã";
}
