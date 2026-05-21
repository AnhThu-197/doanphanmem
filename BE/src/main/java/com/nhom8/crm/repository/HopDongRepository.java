package com.nhom8.crm.repository;

import com.nhom8.crm.entity.HopDong_GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HopDongRepository extends JpaRepository<HopDong_GiaoDich, Integer> {

    List<HopDong_GiaoDich> findByKhachHang_MaKhachHang(Integer maKhachHang);

    List<HopDong_GiaoDich> findByChienDich_MaChienDich(Integer maChienDich);

    List<HopDong_GiaoDich> findByTrangThaiHopDong(String trangThai);

    @Query("SELECT COALESCE(SUM(hd.giaTriHopDong), 0) FROM HopDong_GiaoDich hd WHERE hd.trangThaiHopDong = 'Thắng'")
    BigDecimal sumDoanhThuThang();

    @Query("SELECT COALESCE(SUM(hd.giaTriHopDong), 0) FROM HopDong_GiaoDich hd " +
           "WHERE hd.chienDich.maChienDich = :maChienDich AND hd.trangThaiHopDong = 'Thắng'")
    BigDecimal sumDoanhThuByChienDich(@Param("maChienDich") Integer maChienDich);
}
