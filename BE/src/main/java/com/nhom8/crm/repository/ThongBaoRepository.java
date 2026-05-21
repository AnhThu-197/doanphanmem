package com.nhom8.crm.repository;

import com.nhom8.crm.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {

    List<ThongBao> findByNhanVien_MaNhanVienOrderByThoiGianTaoDesc(Integer maNhanVien);

    List<ThongBao> findByNhanVien_MaNhanVienAndDaDocFalse(Integer maNhanVien);

    long countByNhanVien_MaNhanVienAndDaDocFalse(Integer maNhanVien);
}
