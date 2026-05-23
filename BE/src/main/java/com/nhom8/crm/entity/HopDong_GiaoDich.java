package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "HopDong_GiaoDich")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HopDong_GiaoDich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maHopDong")
    private Integer maHopDong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maKhachHang", nullable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maChienDich")
    private ChienDich chienDich;

    @Column(name = "tenHopDong", nullable = false, length = 200)
    private String tenHopDong;

    @Column(name = "soHopDong", length = 50)
    private String soHopDong;

    @Column(name = "giaTriHopDong", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal giaTriHopDong = BigDecimal.ZERO;

    @Column(name = "trangThaiHopDong", nullable = false, length = 50)
    @Builder.Default
    private String trangThaiHopDong = "Đang thương lượng";

    @Column(name = "ghiChu", columnDefinition = "NVARCHAR(MAX)")
    private String ghiChu;

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @Column(name = "ngayChotDon")
    private LocalDate ngayChotDon;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
