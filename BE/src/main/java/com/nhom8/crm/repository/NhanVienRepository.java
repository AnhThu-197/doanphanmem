package com.nhom8.crm.repository;

import com.nhom8.crm.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {

    Optional<NhanVien> findByTaiKhoan_MaTaiKhoan(Integer maTaiKhoan);

    Optional<NhanVien> findByTaiKhoan_Email(String email);

    Optional<NhanVien> findBySoDienThoai(String soDienThoai);

    @Query("SELECT nv FROM NhanVien nv JOIN nv.taiKhoan tk WHERE tk.trangThai = 'Hoạt động'")
    List<NhanVien> findAllActive();

    @Query("SELECT nv FROM NhanVien nv JOIN FETCH nv.taiKhoan tk JOIN FETCH tk.vaiTro")
    List<NhanVien> findAllWithTaiKhoanAndVaiTro();
}
