package com.nhom8.crm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "VaiTro")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VaiTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "maVaiTro")
    private Integer maVaiTro;

    @Column(name = "tenVaiTro", nullable = false, unique = true, length = 50)
    private String tenVaiTro;

    @Column(name = "moTa", length = 200)
    private String moTa;
}
