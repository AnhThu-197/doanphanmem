package com.nhom8.crm.repository;

import com.nhom8.crm.entity.ChienDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChienDichRepository extends JpaRepository<ChienDich, Integer> {

    List<ChienDich> findByDaXoaFalse();

    List<ChienDich> findByDaXoaTrue();

    List<ChienDich> findByNguoiQuanLy_MaNhanVienAndDaXoaFalse(Integer maNhanVien);

    List<ChienDich> findByTrangThaiChienDichAndDaXoaFalse(String trangThai);

    @Query("SELECT cd FROM ChienDich cd WHERE cd.daXoa = false AND " +
           "LOWER(cd.tenChienDich) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<ChienDich> searchByKeyword(@Param("keyword") String keyword);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE ChienDich cd SET cd.nguoiQuanLy = null WHERE cd.nguoiQuanLy.maNhanVien = :maNhanVien")
    void nullifyNguoiQuanLy(@Param("maNhanVien") Integer maNhanVien);
}
