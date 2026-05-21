package com.nhom8.crm.security;

import com.nhom8.crm.entity.TaiKhoan;
import com.nhom8.crm.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        "Không tìm thấy tài khoản với email: " + email));

        return User.builder()
                .username(taiKhoan.getEmail())
                .password(taiKhoan.getMatKhau())
                .authorities(List.of(new SimpleGrantedAuthority(
                        "ROLE_" + taiKhoan.getVaiTro().getTenVaiTro().toUpperCase()
                                .replace(" ", "_"))))
                .accountLocked("Bị khóa".equals(taiKhoan.getTrangThai()))
                .disabled(!"Hoạt động".equals(taiKhoan.getTrangThai()))
                .build();
    }
}
