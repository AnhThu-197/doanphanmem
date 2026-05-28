package com.nhom8.crm;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class CrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(CrmApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println("Running TepDinhKem schema migration...");
                
                // Add daXoa column
                jdbcTemplate.execute(
                    "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TepDinhKem') AND name = 'daXoa') " +
                    "BEGIN ALTER TABLE TepDinhKem ADD daXoa BIT NOT NULL DEFAULT 0; END"
                );
                
                // Add lyDoXoa column
                jdbcTemplate.execute(
                    "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TepDinhKem') AND name = 'lyDoXoa') " +
                    "BEGIN ALTER TABLE TepDinhKem ADD lyDoXoa NVARCHAR(200) NULL; END"
                );
                
                // Add ngayXoa column
                jdbcTemplate.execute(
                    "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TepDinhKem') AND name = 'ngayXoa') " +
                    "BEGIN ALTER TABLE TepDinhKem ADD ngayXoa DATETIME NULL; END"
                );

                // Add ngayTao column
                jdbcTemplate.execute(
                    "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('TepDinhKem') AND name = 'ngayTao') " +
                    "BEGIN ALTER TABLE TepDinhKem ADD ngayTao DATETIME NULL; END"
                );
                
                System.out.println("TepDinhKem schema migration completed successfully.");
            } catch (Exception e) {
                System.err.println("Error during TepDinhKem schema migration: " + e.getMessage());
            }
        };
    }
}