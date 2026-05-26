package com.nhom8.crm.service.impl;

import com.nhom8.crm.dto.request.ForgotPasswordRequest;
import com.nhom8.crm.dto.request.ResetPasswordRequest;
import com.nhom8.crm.dto.request.VerifyOtpRequest;
import com.nhom8.crm.entity.TaiKhoan;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.TaiKhoanRepository;
import com.nhom8.crm.service.TaiKhoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class TaiKhoanServiceImpl implements TaiKhoanService {

    private final TaiKhoanRepository taiKhoanRepository;
    private final JavaMailSender mailSender;

    @Autowired
    public TaiKhoanServiceImpl(TaiKhoanRepository taiKhoanRepository, JavaMailSender mailSender) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.mailSender = mailSender;
    }

    @Override
    public List<TaiKhoan> getAllTaiKhoans() {
        return taiKhoanRepository.findAll();
    }

    @Override
    public TaiKhoan getTaiKhoanById(Integer id) {
        return taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với mã: " + id));
    }

    @Override
    public TaiKhoan createTaiKhoan(TaiKhoan taiKhoan) {
        if (taiKhoanRepository.existsByEmail(taiKhoan.getEmail())) {
            throw new IllegalArgumentException("Email này đã tồn tại trong hệ thống!");
        }
        taiKhoan.setNgayTao(LocalDateTime.now());
        taiKhoan.setNgayCapNhat(LocalDateTime.now());
        return taiKhoanRepository.save(taiKhoan);
    }

    @Override
    public TaiKhoan updateTaiKhoan(Integer id, TaiKhoan updateInfo) {
        TaiKhoan existing = getTaiKhoanById(id);
        
        // Cập nhật các trường
        if (updateInfo.getVaiTro() != null) {
            existing.setVaiTro(updateInfo.getVaiTro());
        }
        existing.setTrangThai(updateInfo.getTrangThai());
        existing.setNgayCapNhat(LocalDateTime.now());
        
        // Mật khẩu chỉ cập nhật nếu có thay đổi và không rỗng
        if (updateInfo.getMatKhau() != null && !updateInfo.getMatKhau().trim().isEmpty()) {
            existing.setMatKhau(updateInfo.getMatKhau());
        }

        return taiKhoanRepository.save(existing);
    }

    @Override
    public void deleteTaiKhoan(Integer id) {
        TaiKhoan existing = getTaiKhoanById(id);
        taiKhoanRepository.delete(existing);
    }

    @Override
    @Transactional
    public void sendOtp(ForgotPasswordRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + request.getEmail()));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        
        taiKhoan.setMaXacThucOTP(otp);
        taiKhoan.setThoiHanOTP(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes
        taiKhoanRepository.save(taiKhoan);

        // Send OTP email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Công ty phần mềm CRM <vyphan59621@gmail.com>");
        message.setTo(taiKhoan.getEmail());
        message.setSubject("Mã OTP xác thực đặt lại mật khẩu");
        message.setText("Xin chào,\n\nBạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.\n" +
                "Mã OTP xác thực của bạn là: " + otp + "\n" +
                "Mã OTP này có thời hạn sử dụng là 5 phút.\n\n" +
                "Trân trọng,\nBan Quản Trị Hệ Thống CRM");

        try {
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi gửi email: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void verifyOtp(VerifyOtpRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + request.getEmail()));

        if (taiKhoan.getMaXacThucOTP() == null || !taiKhoan.getMaXacThucOTP().equals(request.getOtp())) {
            throw new IllegalArgumentException("Mã OTP không chính xác!");
        }

        if (taiKhoan.getThoiHanOTP() == null || taiKhoan.getThoiHanOTP().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn!");
        }

        // OTP is correct! Update OTP to "VERIFIED" state to allow the reset step, and set dynamic expiry
        taiKhoan.setMaXacThucOTP("VERIFIED");
        taiKhoan.setThoiHanOTP(LocalDateTime.now().plusMinutes(5)); // Valid for 5 minutes to complete the reset
        taiKhoanRepository.save(taiKhoan);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email: " + request.getEmail()));

        // Check if the user has verified OTP successfully in step 2
        if (!"VERIFIED".equals(taiKhoan.getMaXacThucOTP())) {
            throw new IllegalArgumentException("Mã OTP chưa được xác thực hoặc yêu cầu không hợp lệ!");
        }

        if (taiKhoan.getThoiHanOTP() == null || taiKhoan.getThoiHanOTP().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Thời gian xác thực OTP đã hết hạn! Vui lòng thực hiện lại từ đầu.");
        }

        // Update password
        taiKhoan.setMatKhau(request.getNewPassword());
        
        // Clear OTP fields
        taiKhoan.setMaXacThucOTP(null);
        taiKhoan.setThoiHanOTP(null);
        taiKhoan.setNgayCapNhat(LocalDateTime.now());
        
        taiKhoanRepository.save(taiKhoan);
    }
}
