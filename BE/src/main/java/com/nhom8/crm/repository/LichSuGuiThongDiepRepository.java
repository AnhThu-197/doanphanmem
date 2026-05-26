package com.nhom8.crm.repository;

import com.nhom8.crm.entity.LichSuGuiThongDiep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuGuiThongDiepRepository extends JpaRepository<LichSuGuiThongDiep, Integer> {

    List<LichSuGuiThongDiep> findAllByOrderByThoiGianGuiDesc();

    List<LichSuGuiThongDiep> findByKhachHangMaKhachHangOrderByThoiGianGuiDesc(Integer maKhachHang);

    List<LichSuGuiThongDiep> findByNhanVien_MaNhanVien(Integer maNhanVien);

    @Query(value = "EXEC sp_GuiThongDiep :maKhachHang, :maNhanVien, :maMauThongDiep, :kenhGui, :noiDung, :trangThai", nativeQuery = true)
    void callSpGuiThongDiep(
            @org.springframework.data.repository.query.Param("maKhachHang") Integer maKhachHang,
            @org.springframework.data.repository.query.Param("maNhanVien") Integer maNhanVien,
            @org.springframework.data.repository.query.Param("maMauThongDiep") Integer maMauThongDiep,
            @org.springframework.data.repository.query.Param("kenhGui") String kenhGui,
            @org.springframework.data.repository.query.Param("noiDung") String noiDung,
            @org.springframework.data.repository.query.Param("trangThai") String trangThai
    );

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE LichSuGuiThongDiep lsg SET lsg.nhanVien = null WHERE lsg.nhanVien.maNhanVien = :maNhanVien")
    void nullifyNhanVien(
            @org.springframework.data.repository.query.Param("maNhanVien")
            Integer maNhanVien
    );
}