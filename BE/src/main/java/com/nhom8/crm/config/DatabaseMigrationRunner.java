package com.nhom8.crm.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("==================================================");
        System.out.println("Running database migration for CauHinhHeThong columns...");
        try {
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN tenCongTy NVARCHAR(200)");
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN diaChiCongTy NVARCHAR(500)");
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN muiGio NVARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN donViTienTe NVARCHAR(20)");
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN ngonNgu NVARCHAR(50)");
            jdbcTemplate.execute("ALTER TABLE CauHinhHeThong ALTER COLUMN tanSuatSaoLuu NVARCHAR(50)");
            System.out.println("✓ Database migration: altered columns to NVARCHAR successfully!");
        } catch (Exception e) {
            System.err.println("⚠ Database migration failed/ignored: " + e.getMessage());
        }

        System.out.println("Running database migration to hash plain text passwords with BCrypt...");
        try {
            List<Map<String, Object>> accounts = jdbcTemplate.queryForList("SELECT maTaiKhoan, matKhau FROM TaiKhoan");
            for (Map<String, Object> account : accounts) {
                Integer maTaiKhoan = (Integer) account.get("maTaiKhoan");
                String matKhau = (String) account.get("matKhau");
                
                if (matKhau != null && !matKhau.startsWith("$2a$") && !matKhau.startsWith("$2b$") && !matKhau.startsWith("$2y$")) {
                    String hashed = passwordEncoder.encode(matKhau);
                    jdbcTemplate.update("UPDATE TaiKhoan SET matKhau = ? WHERE maTaiKhoan = ?", hashed, maTaiKhoan);
                    System.out.println("✓ Password for account " + maTaiKhoan + " was successfully hashed and updated using BCrypt!");
                }
            }
        } catch (Exception e) {
            System.err.println("⚠ Password hashing migration failed: " + e.getMessage());
        }
        System.out.println("==================================================");
    }
}
