package com.nhom8.crm.security;

import com.nhom8.crm.entity.TaiKhoan;
import com.nhom8.crm.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Khong tim thay tai khoan voi email: " + email));

        return User.builder()
                .username(taiKhoan.getEmail())
                .password(taiKhoan.getMatKhau())
                .authorities(List.of(new SimpleGrantedAuthority(
                        "ROLE_" + normalizeRole(taiKhoan.getVaiTro().getTenVaiTro()))))
                .accountLocked(isLocked(taiKhoan.getTrangThai()))
                .disabled(!isActive(taiKhoan.getTrangThai()))
                .build();
    }

    private String normalizeRole(String roleName) {
        if (roleName == null) return "EMPLOYEE";
        return roleName.trim().toUpperCase();
    }

    private boolean isActive(String status) {
        return "Ho\u1ea1t \u0111\u1ed9ng".equals(status);
    }

    private boolean isLocked(String status) {
        return "B\u1ecb kh\u00f3a".equals(status);
    }
}

