package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "KhachHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KhachHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maKhachHang")
    private Integer maKhachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguoiPhuTrach")
    private NhanVien nguoiPhuTrach;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNganhNghe")
    private NganhNghe nganhNghe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNguonKH")
    private NguonKhachHang nguonKhachHang;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maPhuongXa")
    private PhuongXa phuongXa;

    @Column(name = "hoTen", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "soDienThoai", nullable = false, length = 15)
    private String soDienThoai;

    @Column(name = "gioiTinh", length = 10)
    private String gioiTinh;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "congTy", length = 150)
    private String congTy;

    @Column(name = "chucVuTaiCongTy", length = 100)
    private String chucVuTaiCongTy;

    @Column(name = "websiteCongTy", length = 255)
    private String websiteCongTy;

    @Column(name = "diaChiChiTiet", length = 255)
    private String diaChiChiTiet;

    @Column(name = "trangThaiKhach", nullable = false, length = 50)
    @Builder.Default
    private String trangThaiKhach = "Người truy cập";

    @Column(name = "diemTiemNang", nullable = false)
    @Builder.Default
    private Integer diemTiemNang = 0;

    @Column(name = "ngayBatDauDungThu")
    private LocalDate ngayBatDauDungThu;

    @Column(name = "soNgayDungThu", nullable = false)
    @Builder.Default
    private Integer soNgayDungThu = 0;

    @Column(name = "trangThaiDungThu", nullable = false, length = 30)
    @Builder.Default
    private String trangThaiDungThu = "Chưa dùng thử";

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
