package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "NhacNho")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhacNho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNhacNho")
    private Integer maNhacNho;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maKhachHang", nullable = false)
    private KhachHang khachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNhanVien", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "tieuDe", nullable = false, length = 200)
    private String tieuDe;

    @Column(name = "moTa", length = 500)
    private String moTa;

    @Column(name = "loaiNhacNho", length = 50)
    @Builder.Default
    private String loaiNhacNho = "Gọi điện";

    @Column(name = "thoiGianNhac", nullable = false)
    private LocalDateTime thoiGianNhac;

    @Column(name = "nhacTruocPhut")
    @Builder.Default
    private Integer nhacTruocPhut = 30;

    @Column(name = "trangThaiNhacNho", nullable = false, length = 50)
    @Builder.Default
    private String trangThaiNhacNho = "Chờ xử lý";

    @Column(name = "ketQua", length = 50)
    private String ketQua;

    @Column(name = "ghiChuKetQua", length = 500)
    private String ghiChuKetQua;

    @Column(name = "ngayTao", nullable = false)
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
