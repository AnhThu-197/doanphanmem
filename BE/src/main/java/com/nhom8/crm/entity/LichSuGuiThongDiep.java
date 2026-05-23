package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuGuiThongDiep")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    private String kenhGui; // 'Email', 'SMS', 'Zalo'

    @Column(name = "tieuDe", length = 200)
    private String tieuDe;

    @Column(name = "noiDung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    @Builder.Default
    @Column(name = "trangThaiGui", nullable = false, length = 50)
    private String trangThaiGui = "Đã gửi"; // 'Đã gửi', 'Thất bại', 'Chờ gửi'

    @Column(name = "lyDoThatBai", length = 300)
    private String lyDoThatBai;

    @Builder.Default
    @Column(name = "thoiGianGui")
    private LocalDateTime thoiGianGui = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (thoiGianGui == null) thoiGianGui = LocalDateTime.now();
    }
}
