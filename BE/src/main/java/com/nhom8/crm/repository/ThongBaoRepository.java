package com.nhom8.crm.repository;

import com.nhom8.crm.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Integer> {

    List<ThongBao> findByNhanVien_MaNhanVienOrderByThoiGianTaoDesc(Integer maNhanVien);

    List<ThongBao> findByNhanVien_MaNhanVienAndDaDocFalse(Integer maNhanVien);

    long countByNhanVien_MaNhanVienAndDaDocFalse(Integer maNhanVien);

    @org.springframework.data.jpa.repository.Modifying
    @Query("DELETE FROM ThongBao tb WHERE tb.nhanVien.maNhanVien = :maNhanVien")
    void deleteByMaNhanVien(@org.springframework.data.repository.query.Param("maNhanVien") Integer maNhanVien);
}
