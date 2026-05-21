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

    Optional<KhachHang> findByEmailAndDaXoaFalse(String email);

    Optional<KhachHang> findBySoDienThoaiAndDaXoaFalse(String soDienThoai);

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
}
