package com.nhom8.crm.repository;

import com.nhom8.crm.entity.TepDinhKem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TepDinhKemRepository extends JpaRepository<TepDinhKem, Integer> {
    List<TepDinhKem> findByDaXoaFalse();
}
