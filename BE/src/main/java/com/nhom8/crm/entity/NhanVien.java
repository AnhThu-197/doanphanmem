package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "NhanVien")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNhanVien")
    private Integer maNhanVien;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maTaiKhoan", nullable = false, unique = true)
    private TaiKhoan taiKhoan;

    @Column(name = "hoTen", nullable = false, length = 100)
    private String hoTen;

    @Column(name = "soDienThoai", length = 15)
    private String soDienThoai;

    @Column(name = "chucVu", length = 100)
    private String chucVu;

    @Column(name = "anhDaiDien", length = 255)
    private String anhDaiDien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maPhuongXa")
    private PhuongXa phuongXa;

    @Column(name = "diaChiChiTiet", length = 255)
    private String diaChiChiTiet;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "gioiTinh", length = 10)
    private String gioiTinh;

    @Column(name = "ngayVaoLam")
    private LocalDate ngayVaoLam;

    @Column(name = "ghiChu", length = 500)
    private String ghiChu;

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
