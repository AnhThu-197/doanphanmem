package com.nhom8.crm.repository;

import com.nhom8.crm.entity.LichSuGuiThongDiep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LichSuGuiThongDiepRepository extends JpaRepository<LichSuGuiThongDiep, Integer> {
    List<LichSuGuiThongDiep> findByKhachHangMaKhachHangOrderByThoiGianGuiDesc(Integer maKhachHang);
    List<LichSuGuiThongDiep> findAllByOrderByThoiGianGuiDesc();

    // Gọi Stored Procedure sp_GuiThongDiep (SP10)
    @Query(value = "EXEC sp_GuiThongDiep :maKhachHang, :maNhanVien, :maMau, :kenhGui, :tieuDe, :noiDung", nativeQuery = true)
    List<Object[]> callSpGuiThongDiep(
        @Param("maKhachHang") Integer maKhachHang,
        @Param("maNhanVien") Integer maNhanVien,
        @Param("maMau") Integer maMau,
        @Param("kenhGui") String kenhGui,
        @Param("tieuDe") String tieuDe,
        @Param("noiDung") String noiDung
    );
}
