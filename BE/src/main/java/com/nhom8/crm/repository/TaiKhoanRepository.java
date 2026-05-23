package com.nhom8.crm.repository;

import com.nhom8.crm.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {

    Optional<TaiKhoan> findByEmail(String email);

    boolean existsByEmail(String email);
}
