package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NguonKhachHang")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NguonKhachHang {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNguon")
    private Integer maNguon;

    @Column(name = "tenNguon", nullable = false, unique = true, length = 100)
    private String tenNguon;

    @Column(name = "moTa", length = 200)
    private String moTa;

    @Column(name = "loaiNguon", length = 50)
    @Builder.Default
    private String loaiNguon = "Khác";
}
