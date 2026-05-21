package com.nhom8.crm.repository;

import com.nhom8.crm.entity.NguonKhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NguonKhachHangRepository extends JpaRepository<NguonKhachHang, Integer> {
}
