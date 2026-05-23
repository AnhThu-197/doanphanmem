package com.nhom8.crm.repository;

import com.nhom8.crm.entity.LichSuGuiThongDiep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuGuiThongDiepRepository extends JpaRepository<LichSuGuiThongDiep, Integer> {
    List<LichSuGuiThongDiep> findByNhanVien_MaNhanVien(Integer maNhanVien);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE LichSuGuiThongDiep lsg SET lsg.nhanVien = null WHERE lsg.nhanVien.maNhanVien = :maNhanVien")
    void nullifyNhanVien(@org.springframework.data.repository.query.Param("maNhanVien") Integer maNhanVien);
}
