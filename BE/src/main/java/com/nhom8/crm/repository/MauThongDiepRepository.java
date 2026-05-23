package com.nhom8.crm.repository;

import com.nhom8.crm.entity.MauThongDiep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MauThongDiepRepository extends JpaRepository<MauThongDiep, Integer> {
    List<MauThongDiep> findByLoaiThongDiep(String loaiThongDiep);
}
