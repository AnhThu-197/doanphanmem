package com.nhom8.crm.repository;

import com.nhom8.crm.entity.NhacNho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NhacNhoRepository extends JpaRepository<NhacNho, Integer> {

    List<NhacNho> findAllByOrderByThoiGianNhacDesc();

    List<NhacNho> findByKhachHangMaKhachHangOrderByThoiGianNhacDesc(Integer maKhachHang);

    List<NhacNho> findByNhanVienMaNhanVienOrderByThoiGianNhacDesc(Integer maNhanVien);

    List<NhacNho> findByNhanVien_MaNhanVienAndTrangThaiNhacNho(
            Integer maNhanVien,
            String trangThai
    );

    List<NhacNho> findByTrangThaiNhacNho(String trangThai);

    @Query("""
        SELECT n FROM NhacNho n
        WHERE n.trangThaiNhacNho = 'Chờ xử lý'
        AND n.thoiGianNhac BETWEEN :from AND :to
    """)
    List<NhacNho> findUpcomingReminders(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );

    @Query(value = "EXEC sp_ThemNhacNho :maKhachHang, :maNhanVien, :tieuDe, :noiDung, :thoiGianNhac, :loaiNhacNho, :trangThaiNhacNho", nativeQuery = true)
    List<Object[]> callSpThemNhacNho(
            @Param("maKhachHang") Integer maKhachHang,
            @Param("maNhanVien") Integer maNhanVien,
            @Param("tieuDe") String tieuDe,
            @Param("noiDung") String noiDung,
            @Param("thoiGianNhac") LocalDateTime thoiGianNhac,
            @Param("loaiNhacNho") Integer loaiNhacNho,
            @Param("trangThaiNhacNho") String trangThaiNhacNho
    );

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM NhacNho n WHERE n.nhanVien.maNhanVien = :maNhanVien")
    void deleteByMaNhanVien(@Param("maNhanVien") Integer maNhanVien);
}