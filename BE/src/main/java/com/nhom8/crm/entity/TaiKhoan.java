package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TaiKhoan")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTaiKhoan")
    private Integer maTaiKhoan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maVaiTro", nullable = false)
    private VaiTro vaiTro;

    @Column(name = "email", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "matKhau", nullable = false, length = 255)
    private String matKhau;

    @Column(name = "maXacThucOTP", length = 255)
    private String maXacThucOTP;

    @Column(name = "thoiHanOTP")
    private LocalDateTime thoiHanOTP;

    @Column(name = "lanDangNhapSai", nullable = false)
    @Builder.Default
    private Integer lanDangNhapSai = 0;

    @Column(name = "thoiGianKhoaTam")
    private LocalDateTime thoiGianKhoaTam;

    @Column(name = "trangThai", nullable = false, length = 20)
    @Builder.Default
    private String trangThai = "Hoạt động";

    @Column(name = "ngayTao")
    private LocalDateTime ngayTao;

    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat;

    @Column(name = "lanDangNhapCuoi")
    private LocalDateTime lanDangNhapCuoi;

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
