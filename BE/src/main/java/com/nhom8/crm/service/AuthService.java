package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.DoiMatKhauRequest;
import com.nhom8.crm.dto.request.LoginRequest;
import com.nhom8.crm.dto.response.LoginResponse;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.entity.TaiKhoan;
import com.nhom8.crm.exception.BadRequestException;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.repository.TaiKhoanRepository;
import com.nhom8.crm.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMatKhau()));

        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        // Cập nhật lần đăng nhập cuối
        taiKhoan.setLanDangNhapCuoi(LocalDateTime.now());
        taiKhoan.setLanDangNhapSai(0);
        taiKhoanRepository.save(taiKhoan);

        String token = jwtTokenProvider.generateToken(
                taiKhoan.getEmail(), taiKhoan.getVaiTro().getTenVaiTro());

        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_MaTaiKhoan(taiKhoan.getMaTaiKhoan())
                .orElse(null);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .maTaiKhoan(taiKhoan.getMaTaiKhoan())
                .maNhanVien(nhanVien != null ? nhanVien.getMaNhanVien() : null)
                .hoTen(nhanVien != null ? nhanVien.getHoTen() : taiKhoan.getEmail())
                .email(taiKhoan.getEmail())
                .vaiTro(taiKhoan.getVaiTro().getTenVaiTro())
                .chucVu(nhanVien != null ? nhanVien.getChucVu() : null)
                .anhDaiDien(nhanVien != null ? nhanVien.getAnhDaiDien() : null)
                .build();
    }

    @Transactional
    public void doiMatKhau(String email, DoiMatKhauRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        if (!passwordEncoder.matches(request.getMatKhauCu(), taiKhoan.getMatKhau())) {
            throw new BadRequestException("Mật khẩu cũ không đúng");
        }

        if (!request.getMatKhauMoi().equals(request.getXacNhanMatKhau())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(request.getMatKhauMoi()));
        taiKhoanRepository.save(taiKhoan);
    }

    @Transactional
    public void guiOTP(String email) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Email không tồn tại trong hệ thống"));

        // Tạo OTP 6 số
        String otp = String.format("%06d", new Random().nextInt(999999));
        taiKhoan.setMaXacThucOTP(passwordEncoder.encode(otp));
        taiKhoan.setThoiHanOTP(LocalDateTime.now().plusMinutes(5));
        taiKhoanRepository.save(taiKhoan);

        // Gửi email
        emailService.sendOtpEmail(email, otp);
    }

    @Transactional
    public void datLaiMatKhau(String email, String otp, String matKhauMoi) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        if (taiKhoan.getMaXacThucOTP() == null ||
            taiKhoan.getThoiHanOTP() == null ||
            taiKhoan.getThoiHanOTP().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Mã OTP đã hết hạn");
        }

        if (!passwordEncoder.matches(otp, taiKhoan.getMaXacThucOTP())) {
            throw new BadRequestException("Mã OTP không chính xác");
        }

        taiKhoan.setMatKhau(passwordEncoder.encode(matKhauMoi));
        taiKhoan.setMaXacThucOTP(null);
        taiKhoan.setThoiHanOTP(null);
        taiKhoanRepository.save(taiKhoan);
    }
}
