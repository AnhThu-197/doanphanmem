package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ChienDich")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChienDich {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maChienDich")
    private Integer maChienDich;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiQuanLy")
    private NhanVien nguoiQuanLy;

    @Column(name = "tenChienDich", nullable = false, length = 200)
    private String tenChienDich;

    @Column(name = "moTa", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "mucTieu", columnDefinition = "NVARCHAR(MAX)")
    private String mucTieu;

    @Column(name = "loaiChienDich", length = 50)
    private String loaiChienDich;

    @Column(name = "ngayBatDau", nullable = false)
    private LocalDate ngayBatDau;

    @Column(name = "ngayKetThuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "nganSach", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal nganSach = BigDecimal.ZERO;

    @Column(name = "doanhThuThucTe", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal doanhThuThucTe = BigDecimal.ZERO;

    @Column(name = "trangThaiChienDich", nullable = false, length = 50)
    @Builder.Default
    private String trangThaiChienDich = "Lên kế hoạch";

    @Column(name = "daXoa", nullable = false)
    @Builder.Default
    private Boolean daXoa = false;

    @Column(name = "lyDoXoa", length = 200)
    private String lyDoXoa;

    @Column(name = "ngayXoa")
    private LocalDateTime ngayXoa;

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;

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
