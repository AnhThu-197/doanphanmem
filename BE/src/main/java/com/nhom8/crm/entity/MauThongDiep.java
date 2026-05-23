package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MauThongDiep")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MauThongDiep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maMau")
    private Integer maMau;

    @Column(name = "tieuDe", nullable = false, unique = true, length = 200)
    private String tieuDe;

    @Column(name = "noiDung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    @Column(name = "loaiThongDiep", nullable = false, length = 50)
    private String loaiThongDiep; // 'Email', 'SMS', 'Zalo'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNhanVienTao")
    private NhanVien nhanVienTao;

    @Builder.Default
    @Column(name = "luotSuDung", nullable = false)
    private Integer luotSuDung = 0;

    @Builder.Default
    @Column(name = "ngayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Builder.Default
    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) ngayTao = LocalDateTime.now();
        ngayCapNhat = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        ngayCapNhat = LocalDateTime.now();
    }
}
