package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "NganhNghe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NganhNghe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maNganhNghe")
    private Integer maNganhNghe;

    @Column(name = "tenNganhNghe", nullable = false, unique = true, length = 100)
    private String tenNganhNghe;

    @Column(name = "moTa", length = 200)
    private String moTa;
}
