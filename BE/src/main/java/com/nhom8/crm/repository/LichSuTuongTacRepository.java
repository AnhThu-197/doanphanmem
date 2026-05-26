package com.nhom8.crm.repository;

import com.nhom8.crm.entity.LichSuTuongTac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuTuongTacRepository extends JpaRepository<LichSuTuongTac, Integer> {

    List<LichSuTuongTac> findAllByOrderByThoiGianTaoDesc();

    List<LichSuTuongTac> findByKhachHang_MaKhachHangOrderByThoiGianTaoDesc(
            Integer maKhachHang
    );

    List<LichSuTuongTac> findByKhachHangMaKhachHangOrderByThoiGianTaoDesc(
            Integer maKhachHang
    );

    List<LichSuTuongTac> findByNhanVien_MaNhanVienOrderByThoiGianTaoDesc(
            Integer maNhanVien
    );

    @org.springframework.data.jpa.repository.Modifying
    @Query("""
        UPDATE LichSuTuongTac lst
        SET lst.nhanVien = null
        WHERE lst.nhanVien.maNhanVien = :maNhanVien
    """)
    void nullifyNhanVien(
            @org.springframework.data.repository.query.Param("maNhanVien")
            Integer maNhanVien
    );
}