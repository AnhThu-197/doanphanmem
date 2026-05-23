package com.nhom8.crm.repository;

import com.nhom8.crm.entity.NhacNho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NhacNhoRepository extends JpaRepository<NhacNho, Integer> {

    // Tìm các nhắc nhở/lịch hẹn theo mã khách hàng, sắp xếp theo thời gian nhắc giảm dần
    List<NhacNho> findByKhachHangMaKhachHangOrderByThoiGianNhacDesc(Integer maKhachHang);

    // Tìm các nhắc nhở/lịch hẹn theo mã nhân viên, sắp xếp theo thời gian nhắc giảm dần
    List<NhacNho> findByNhanVienMaNhanVienOrderByThoiGianNhacDesc(Integer maNhanVien);

    // Lấy toàn bộ danh sách sắp xếp theo thời gian nhắc mới nhất
    List<NhacNho> findAllByOrderByThoiGianNhacDesc();

    // Gọi Stored Procedure sp_ThemNhacNho (SP09)
    @Query(value = "EXEC sp_ThemNhacNho :maKhachHang, :maNhanVien, :tieuDe, :loaiNhacNho, :thoiGianNhac, :nhacTruocPhut, :moTa", nativeQuery = true)
    List<Object[]> callSpThemNhacNho(
        @Param("maKhachHang") Integer maKhachHang,
        @Param("maNhanVien") Integer maNhanVien,
        @Param("tieuDe") String tieuDe,
        @Param("loaiNhacNho") String loaiNhacNho,
        @Param("thoiGianNhac") java.time.LocalDateTime thoiGianNhac,
        @Param("nhacTruocPhut") Integer nhacTruocPhut,
        @Param("moTa") String moTa
    );
}
