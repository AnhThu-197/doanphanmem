package com.nhom8.crm.repository;

import com.nhom8.crm.entity.ChiPhiChienDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ChiPhiChienDichRepository extends JpaRepository<ChiPhiChienDich, Integer> {

    List<ChiPhiChienDich> findByChienDich_MaChienDich(Integer maChienDich);

    @Query("SELECT COALESCE(SUM(cp.soTien), 0) FROM ChiPhiChienDich cp " +
           "WHERE cp.chienDich.maChienDich = :maChienDich")
    BigDecimal sumByChienDich(@Param("maChienDich") Integer maChienDich);
}
