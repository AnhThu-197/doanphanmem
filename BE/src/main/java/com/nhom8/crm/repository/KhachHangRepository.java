package com.nhom8.crm.repository;

import com.nhom8.crm.entity.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Integer>,
        JpaSpecificationExecutor<KhachHang> {

    List<KhachHang> findByEmailAndDaXoaFalse(String email);

    List<KhachHang> findBySoDienThoaiAndDaXoaFalse(String soDienThoai);

    List<KhachHang> findByDaXoaFalse();

    List<KhachHang> findByDaXoaTrue();

    List<KhachHang> findByNguoiPhuTrach_MaNhanVienAndDaXoaFalse(Integer maNhanVien);

    @Query("SELECT kh FROM KhachHang kh WHERE kh.daXoa = false AND " +
           "(LOWER(kh.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "kh.email LIKE CONCAT('%', :keyword, '%') OR " +
           "kh.soDienThoai LIKE CONCAT('%', :keyword, '%'))")
    List<KhachHang> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT COUNT(kh) FROM KhachHang kh WHERE kh.daXoa = false AND kh.trangThaiKhach = :trangThai")
    Long countByTrangThai(@Param("trangThai") String trangThai);

    @Query("SELECT kh FROM KhachHang kh WHERE kh.daXoa = false AND " +
           "kh.trangThaiDungThu = 'Đang dùng thử'")
    List<KhachHang> findDangDungThu();

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE KhachHang kh SET kh.nguoiPhuTrach = null WHERE kh.nguoiPhuTrach.maNhanVien = :maNhanVien")
    void nullifyNguoiPhuTrach(@Param("maNhanVien") Integer maNhanVien);

    @Query("SELECT k1, k2 FROM KhachHang k1, KhachHang k2 WHERE k1.maKhachHang < k2.maKhachHang " +
           "AND k1.daXoa = false AND k2.daXoa = false " +
           "AND ((k1.email IS NOT NULL AND k1.email <> '' AND k1.email = k2.email) " +
           "OR (k1.soDienThoai IS NOT NULL AND k1.soDienThoai <> '' AND k1.soDienThoai = k2.soDienThoai))")
    List<Object[]> findDuplicatePairs();
}
