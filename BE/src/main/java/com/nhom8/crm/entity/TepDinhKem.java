package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "TepDinhKem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TepDinhKem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maTep")
    private Integer maTep;

    @Column(name = "tenTep", nullable = false, length = 255)
    private String tenTep;

    @Column(name = "duongDanLuuTru", nullable = false, length = 500)
    private String duongDanLuuTru;

    @Column(name = "loaiTep", length = 20)
    private String loaiTep;

    @Builder.Default
    @Column(name = "ngayTao")
    private LocalDateTime ngayTao = LocalDateTime.now();

    @Builder.Default
    @Column(name = "daXoa", nullable = false)
    private Boolean daXoa = false;

    @Column(name = "lyDoXoa", length = 200)
    private String lyDoXoa;

    @Column(name = "ngayXoa")
    private LocalDateTime ngayXoa;

    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) ngayTao = LocalDateTime.now();
        if (daXoa == null) daXoa = false;
    }
}
