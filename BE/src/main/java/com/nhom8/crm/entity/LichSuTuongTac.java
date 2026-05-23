package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LichSuTuongTac")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTuongTac {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTuongTac")
    private Integer maTuongTac;

    // Quan hệ: Nhiều tương tác thuộc về một Khách hàng
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maKhachHang", nullable = false)
    private KhachHang khachHang;

    // Quan hệ: Nhiều tương tác được thực hiện bởi một Nhân viên
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maNhanVien")
    private NhanVien nhanVien;

    @Column(name = "loaiTuongTac", nullable = false, length = 50)
    private String loaiTuongTac; // 'Gọi điện', 'Email', 'Gặp mặt', 'Nhắn tin' (Trong FE: call, email, meeting, message)

    @Column(name = "tieuDe", length = 200)
    private String tieuDe;

    @Column(name = "noiDung", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String noiDung;

    @Column(name = "kenhLienLac", length = 50)
    private String kenhLienLac;

    @Column(name = "ketQua", length = 50)
    private String ketQua; // 'Thành công', 'Không liên lạc được', 'Cần theo dõi', 'Khách từ chối', etc.

    @Builder.Default
    @Column(name = "thoiGianTao")
    private LocalDateTime thoiGianTao = LocalDateTime.now();

    @Builder.Default
    @Column(name = "ngayCapNhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "LichSuTuongTac_TepDinhKem",
        joinColumns = @JoinColumn(name = "maTuongTac"),
        inverseJoinColumns = @JoinColumn(name = "maTep")
    )
    @Builder.Default
    private java.util.Set<TepDinhKem> tepDinhKems = new java.util.HashSet<>();
}
