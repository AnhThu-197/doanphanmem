package com.nhom8.crm.repository;

import com.nhom8.crm.entity.MauThongDiep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MauThongDiepRepository extends JpaRepository<MauThongDiep, Integer> {

    List<MauThongDiep> findByLoaiThongDiep(String loai);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE MauThongDiep mtd SET mtd.nhanVienTao = null WHERE mtd.nhanVienTao.maNhanVien = :maNhanVien")
    void nullifyNhanVienTao(@org.springframework.data.repository.query.Param("maNhanVien") Integer maNhanVien);
}
