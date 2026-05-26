package com.nhom8.crm.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class để generate BCrypt hash cho mật khẩu
 * Chạy main method này để tạo hash cho các mật khẩu demo
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== BCrypt Password Hashes ===");
        System.out.println();
        
        String[] passwords = {"admin123", "tp123", "nv01123"};
        String[] emails = {"admin@gmail.com", "anhthu@gmail.com", "nv01@crm.vn"};
        
        for (int i = 0; i < passwords.length; i++) {
            String hash = encoder.encode(passwords[i]);
            System.out.println("Email: " + emails[i]);
            System.out.println("Password: " + passwords[i]);
            System.out.println("BCrypt Hash: " + hash);
            System.out.println();
            System.out.println("SQL Update:");
            System.out.println("UPDATE TaiKhoan SET matKhau = '" + hash + "' WHERE email = '" + emails[i] + "';");
            System.out.println();
            System.out.println("---");
            System.out.println();
        }
    }
}
