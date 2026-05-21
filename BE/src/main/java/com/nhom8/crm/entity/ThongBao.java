package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ThongBao")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maThongBao")
    private Integer maThongBao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNhanVien", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "tieuDe", length = 200)
    private String tieuDe;

    @Column(name = "noiDung", nullable = false, length = 500)
    private String noiDung;

    @Column(name = "loaiThongBao", nullable = false, length = 50)
    @Builder.Default
    private String loaiThongBao = "Hệ thống";

    @Column(name = "daDoc", nullable = false)
    @Builder.Default
    private Boolean daDoc = false;

    @Column(name = "duongDanLienKet", length = 255)
    private String duongDanLienKet;

    @Column(name = "thoiGianTao")
    private LocalDateTime thoiGianTao;

    @PrePersist
    protected void onCreate() {
        thoiGianTao = LocalDateTime.now();
    }
}
