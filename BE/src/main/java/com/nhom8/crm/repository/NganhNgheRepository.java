package com.nhom8.crm.repository;

import com.nhom8.crm.entity.NganhNghe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NganhNgheRepository extends JpaRepository<NganhNghe, Integer> {
}
