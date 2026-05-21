package com.nhom8.crm.repository;

import com.nhom8.crm.entity.LichSuTuongTac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuTuongTacRepository extends JpaRepository<LichSuTuongTac, Integer> {

    List<LichSuTuongTac> findByKhachHang_MaKhachHangOrderByThoiGianTaoDesc(Integer maKhachHang);

    List<LichSuTuongTac> findByNhanVien_MaNhanVienOrderByThoiGianTaoDesc(Integer maNhanVien);
}
