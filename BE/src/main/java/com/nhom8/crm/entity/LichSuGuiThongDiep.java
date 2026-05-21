package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuGuiThongDiep")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LichSuGuiThongDiep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maLichSuGui")
    private Integer maLichSuGui;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maKhachHang", nullable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNhanVien")
    private NhanVien nhanVien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maMau")
    private MauThongDiep mauThongDiep;

    @Column(name = "kenhGui", nullable = false, length = 50)
    private String kenhGui;

    @Column(name = "tieuDe", length = 200)
    private String tieuDe;

    @Column(name = "noiDung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    @Column(name = "trangThaiGui", nullable = false, length = 50)
    @Builder.Default
    private String trangThaiGui = "Đã gửi";

    @Column(name = "lyDoThatBai", length = 300)
    private String lyDoThatBai;

    @Column(name = "thoiGianGui")
    private LocalDateTime thoiGianGui;

    @PrePersist
    protected void onCreate() {
        thoiGianGui = LocalDateTime.now();
    }
}
