package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ChiPhiChienDich")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChiPhiChienDich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChiPhi")
    private Integer maChiPhi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maChienDich", nullable = false)
    private ChienDich chienDich;

    @Column(name = "tenKhoanChi", nullable = false, length = 200)
    private String tenKhoanChi;

    @Column(name = "loaiChiPhi", nullable = false, length = 100)
    private String loaiChiPhi;

    @Column(name = "soTien", nullable = false, precision = 15, scale = 2)
    private BigDecimal soTien;

    @Column(name = "ghiChu", length = 300)
    private String ghiChu;

    @Column(name = "nguonGhiNhan", nullable = false, length = 50)
    @Builder.Default
    private String nguonGhiNhan = "Nhập thủ công";

    @Column(name = "ngayGhiNhan")
    private LocalDateTime ngayGhiNhan;

    @PrePersist
    protected void onCreate() {
        ngayGhiNhan = LocalDateTime.now();
    }
}
