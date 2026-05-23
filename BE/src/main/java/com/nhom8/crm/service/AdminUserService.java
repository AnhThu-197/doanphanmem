package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.AdminUserRequest;
import com.nhom8.crm.dto.response.AdminUserResponse;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.entity.TaiKhoan;
import com.nhom8.crm.entity.VaiTro;
import com.nhom8.crm.exception.BadRequestException;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final VaiTroRepository vaiTroRepository;
    private final KhachHangRepository khachHangRepository;
    private final ChienDichRepository chienDichRepository;
    private final LichSuTuongTacRepository lichSuTuongTacRepository;
    private final MauThongDiepRepository mauThongDiepRepository;
    private final LichSuGuiThongDiepRepository lichSuGuiThongDiepRepository;
    private final NhacNhoRepository nhacNhoRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<AdminUserResponse> getAllUsers() {
        return nhanVienRepository.findAllWithTaiKhoanAndVaiTro()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminUserResponse createUser(AdminUserRequest request) {
        // Validate uniqueness of username / email
        if (taiKhoanRepository.existsByEmail(request.getUsername())) {
            throw new BadRequestException("Tên đăng nhập đã tồn tại trong hệ thống");
        }
        if (taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống");
        }

        // Get role
        String roleStr = request.getRole().trim().toUpperCase();
        VaiTro vaiTro = vaiTroRepository.findByTenVaiTro(roleStr)
                .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ: " + request.getRole()));

        // Create TaiKhoan
        TaiKhoan taiKhoan = TaiKhoan.builder()
                .email(request.getEmail())
                .matKhau(passwordEncoder.encode("123456")) // Default password is 123456
                .vaiTro(vaiTro)
                .trangThai("Hoạt động")
                .lanDangNhapSai(0)
                .build();
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        // Determine chucVu based on role
        String chucVu = "Nhân viên Marketing";
        if ("ADMIN".equals(roleStr)) {
            chucVu = "Quản trị viên";
        } else if ("MANAGER".equals(roleStr)) {
            chucVu = "Trưởng phòng Marketing";
        }

        // Create NhanVien
        NhanVien nhanVien = NhanVien.builder()
                .taiKhoan(taiKhoan)
                .hoTen(request.getName())
                .chucVu(chucVu)
                .build();
        nhanVien = nhanVienRepository.save(nhanVien);

        return toResponse(nhanVien);
    }

    @Transactional
    public AdminUserResponse updateUser(Integer id, AdminUserRequest request) {
        // Find TaiKhoan
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        // Find associated NhanVien
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_MaTaiKhoan(taiKhoan.getMaTaiKhoan())
                .orElseThrow(() -> new ResourceNotFoundException("Nhân viên không tồn tại"));

        // Validate email uniqueness (excluding self)
        taiKhoanRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getMaTaiKhoan().equals(id)) {
                        throw new BadRequestException("Email đã tồn tại trong hệ thống");
                    }
                });

        // Get role
        String roleStr = request.getRole().trim().toUpperCase();
        VaiTro vaiTro = vaiTroRepository.findByTenVaiTro(roleStr)
                .orElseThrow(() -> new BadRequestException("Vai trò không hợp lệ: " + request.getRole()));

        // Update TaiKhoan
        taiKhoan.setEmail(request.getEmail());
        taiKhoan.setVaiTro(vaiTro);
        taiKhoanRepository.save(taiKhoan);

        // Update NhanVien
        nhanVien.setHoTen(request.getName());
        // Update chucVu accordingly if role changed
        String chucVu = "Nhân viên Marketing";
        if ("ADMIN".equals(roleStr)) {
            chucVu = "Quản trị viên";
        } else if ("MANAGER".equals(roleStr)) {
            chucVu = "Trưởng phòng Marketing";
        }
        nhanVien.setChucVu(chucVu);
        nhanVienRepository.save(nhanVien);

        return toResponse(nhanVien);
    }

    @Transactional
    public void lockUser(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        taiKhoan.setTrangThai("Bị khóa");
        taiKhoanRepository.save(taiKhoan);
    }

    @Transactional
    public void unlockUser(Integer id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        taiKhoan.setTrangThai("Hoạt động");
        taiKhoanRepository.save(taiKhoan);
    }

    @Transactional
    public void deleteUser(Integer id) {
        // Find TaiKhoan
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        // Find associated NhanVien
        NhanVien nhanVien = nhanVienRepository.findByTaiKhoan_MaTaiKhoan(taiKhoan.getMaTaiKhoan())
                .orElse(null);

        if (nhanVien != null) {
            Integer maNhanVien = nhanVien.getMaNhanVien();

            // 1. Delete ThongBao referencing this employee
            thongBaoRepository.deleteByMaNhanVien(maNhanVien);

            // 2. Delete NhacNho referencing this employee
            nhacNhoRepository.deleteByMaNhanVien(maNhanVien);

            // 3. Nullify NguoiPhuTrach in KhachHang
            khachHangRepository.nullifyNguoiPhuTrach(maNhanVien);

            // 4. Nullify NguoiQuanLy in ChienDich
            chienDichRepository.nullifyNguoiQuanLy(maNhanVien);

            // 5. Nullify NhanVien in LichSuTuongTac
            lichSuTuongTacRepository.nullifyNhanVien(maNhanVien);

            // 6. Nullify NhanVienTao in MauThongDiep
            mauThongDiepRepository.nullifyNhanVienTao(maNhanVien);

            // 7. Nullify NhanVien in LichSuGuiThongDiep
            lichSuGuiThongDiepRepository.nullifyNhanVien(maNhanVien);

            // 8. Delete the NhanVien
            nhanVienRepository.delete(nhanVien);
        }

        // Delete the TaiKhoan
        taiKhoanRepository.delete(taiKhoan);
    }

    private AdminUserResponse toResponse(NhanVien nv) {
        TaiKhoan tk = nv.getTaiKhoan();
        String roleStr = tk.getVaiTro() != null ? tk.getVaiTro().getTenVaiTro().toLowerCase() : "employee";
        String statusStr = "Bị khóa".equals(tk.getTrangThai()) ? "locked" : "active";

        return AdminUserResponse.builder()
                .id(tk.getMaTaiKhoan())
                .maNhanVien(nv.getMaNhanVien())
                .username(tk.getEmail()) // Username mapped to email
                .name(nv.getHoTen())
                .email(tk.getEmail())
                .role(roleStr)
                .status(statusStr)
                .lastLogin(tk.getLanDangNhapCuoi() != null ? tk.getLanDangNhapCuoi().toString() : "Chưa đăng nhập")
                .createdDate(tk.getNgayTao() != null ? tk.getNgayTao().toString() : "")
                .build();
    }
}
