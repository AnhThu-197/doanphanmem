package com.nhom8.crm.repository;

import com.nhom8.crm.entity.PhuongXa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PhuongXaRepository extends JpaRepository<PhuongXa, Integer> {

    List<PhuongXa> findByTinhThanh_MaTinhThanh(Integer maTinhThanh);
}
