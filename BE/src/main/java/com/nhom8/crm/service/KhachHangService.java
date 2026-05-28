package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.KhachHangRequest;
import com.nhom8.crm.dto.response.KhachHangResponse;
import com.nhom8.crm.dto.response.LichSuPhanBoResponse;
import com.nhom8.crm.entity.*;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final NganhNgheRepository nganhNgheRepository;
    private final NguonKhachHangRepository nguonKhachHangRepository;
    private final PhuongXaRepository phuongXaRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    public List<KhachHangResponse> getAll() {
        return khachHangRepository.findByDaXoaFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public KhachHangResponse getById(Integer id) {
        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        return toResponse(kh);
    }

    public List<KhachHangResponse> search(String keyword) {
        return khachHangRepository.searchByKeyword(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public KhachHangResponse create(KhachHangRequest request) {

        KhachHang kh = buildFromRequest(new KhachHang(), request);

        KhachHang savedKh = khachHangRepository.save(kh);

        return toResponse(savedKh);
    }

    @Transactional
    public KhachHangResponse update(Integer id, KhachHangRequest request) {

        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        buildFromRequest(kh, request);

        KhachHang savedKh = khachHangRepository.save(kh);

        return toResponse(savedKh);
    }

    @Transactional
    public void softDelete(Integer id, String lyDo) {

        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        kh.setDaXoa(true);
        kh.setLyDoXoa(lyDo);
        kh.setNgayXoa(LocalDateTime.now());

        khachHangRepository.save(kh);
    }

    @Transactional
    public void phanBoKhachHang(Integer maKhachHang, Integer maNhanVienMoi, String phuongPhap) {
        if (maNhanVienMoi == null) {
            entityManager
                    .createNativeQuery("EXEC sp_PhanBoKhachHang @maKhachHang = :maKhachHang, @maNhanVienMoi = NULL, @phuongPhap = :phuongPhap")
                    .setParameter("maKhachHang", maKhachHang)
                    .setParameter("phuongPhap", phuongPhap)
                    .getResultList();
        } else {
            entityManager
                    .createNativeQuery("EXEC sp_PhanBoKhachHang @maKhachHang = :maKhachHang, @maNhanVienMoi = :maNhanVienMoi, @phuongPhap = :phuongPhap")
                    .setParameter("maKhachHang", maKhachHang)
                    .setParameter("maNhanVienMoi", maNhanVienMoi)
                    .setParameter("phuongPhap", phuongPhap)
                    .getResultList();
        }
    }

    public List<LichSuPhanBoResponse> getLichSuPhanBo() {
        String sql = """
            SELECT 
                ls.maLichSuPhanBo,
                kh.maKhachHang,
                kh.hoTen AS tenKhachHang,
                nv.maNhanVien,
                nv.hoTen AS tenNhanVien,
                ls.phuongPhap,
                ls.ngayPhanBo
            FROM LichSuPhanBoKhachHang ls
            JOIN KhachHang kh ON ls.maKhachHang = kh.maKhachHang
            JOIN NhanVien nv ON ls.maNhanVien = nv.maNhanVien
            JOIN TaiKhoan tk ON nv.maTaiKhoan = tk.maTaiKhoan
            JOIN VaiTro vt ON tk.maVaiTro = vt.maVaiTro
            JOIN NhanVien nvHienTai ON kh.maNguoiPhuTrach = nvHienTai.maNhanVien
            JOIN TaiKhoan tkHienTai ON nvHienTai.maTaiKhoan = tkHienTai.maTaiKhoan
            JOIN VaiTro vtHienTai ON tkHienTai.maVaiTro = vtHienTai.maVaiTro
            WHERE kh.daXoa = 0
              AND vt.tenVaiTro = N'EMPLOYEE'
              AND vtHienTai.tenVaiTro = N'EMPLOYEE'
            ORDER BY ls.ngayPhanBo DESC
        """;

        List<Object[]> rows = entityManager.createNativeQuery(sql).getResultList();

        return rows.stream()
                .map(row -> LichSuPhanBoResponse.builder()
                        .maLichSuPhanBo(((Number) row[0]).intValue())
                        .maKhachHang(((Number) row[1]).intValue())
                        .tenKhachHang((String) row[2])
                        .maNhanVien(((Number) row[3]).intValue())
                        .tenNhanVien((String) row[4])
                        .phuongPhap((String) row[5])
                        .ngayPhanBo(
                                row[6] instanceof Timestamp
                                        ? ((Timestamp) row[6]).toLocalDateTime()
                                        : row[6] instanceof LocalDateTime
                                          ? (LocalDateTime) row[6]
                                          : null
                        )
                        .build())
                .toList();
    }
    public List<KhachHangResponse> getAllIncludingDeleted() {
        return khachHangRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deletePermanent(Integer id) {
        KhachHang kh = khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        // Clean up child tables without ON DELETE CASCADE
        entityManager.createNativeQuery("DELETE FROM KhachHang_ChienDich WHERE maKhachHang = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM NhacNho WHERE maKhachHang = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM HopDong_GiaoDich WHERE maKhachHang = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM LichSuThucThiQuyTac WHERE maKhachHang = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("DELETE FROM LichSuPhanBoKhachHang WHERE maKhachHang = :id")
                .setParameter("id", id).executeUpdate();

        khachHangRepository.delete(kh);
    }

    @Transactional
    public void restore(Integer id) {

        KhachHang kh = khachHangRepository.findById(id)
                .filter(KhachHang::getDaXoa)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không có trong thùng rác"));

        kh.setDaXoa(false);
        kh.setLyDoXoa(null);
        kh.setNgayXoa(null);

        khachHangRepository.save(kh);
    }

    public List<KhachHangResponse> getTrash() {

        return khachHangRepository.findByDaXoaTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public double calculateSimilarity(String str1, String str2) {
        if (str1 == null || str2 == null) {
            return 0.0;
        }
        
        str1 = str1.toLowerCase().trim();
        str2 = str2.toLowerCase().trim();
        
        if (str1.equals(str2)) {
            return 1.0;
        }
        
        // Simple Levenshtein distance based similarity
        int maxLen = Math.max(str1.length(), str2.length());
        if (maxLen == 0) {
            return 1.0;
        }
        
        int distance = levenshteinDistance(str1, str2);
        return 1.0 - ((double) distance / maxLen);
    }

    @Transactional
    public void mergeCustomers(Integer keepId, Integer removeId) {
        KhachHang keep = khachHangRepository.findById(keepId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", keepId));
        
        KhachHang remove = khachHangRepository.findById(removeId)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", removeId));
        
        // Merge logic: update all related records to point to keepId
        // This would require updating LichSuTuongTac, NhacNho, etc.
        // For now, just soft delete the duplicate
        remove.setDaXoa(true);
        remove.setLyDoXoa("Trùng lặp với khách hàng #" + keepId);
        remove.setNgayXoa(LocalDateTime.now());
        khachHangRepository.save(remove);
    }

    private int levenshteinDistance(String s1, String s2) {
        int[][] dp = new int[s1.length() + 1][s2.length() + 1];
        
        for (int i = 0; i <= s1.length(); i++) {
            dp[i][0] = i;
        }
        
        for (int j = 0; j <= s2.length(); j++) {
            dp[0][j] = j;
        }
        
        for (int i = 1; i <= s1.length(); i++) {
            for (int j = 1; j <= s2.length(); j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], Math.min(dp[i - 1][j], dp[i][j - 1]));
                }
            }
        }
        
        return dp[s1.length()][s2.length()];
    }

    public com.nhom8.crm.dto.response.TrialResponse getTrialDetails(Integer id) {
        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        // Calculate remaining days using SQL function
        Integer remainingDays = null;
        if (kh.getNgayBatDauDungThu() != null && kh.getSoNgayDungThu() != null) {
            try {
                Object result = entityManager
                        .createNativeQuery("SELECT dbo.fn_SoNgayConLaiDungThu(:maKhachHang)")
                        .setParameter("maKhachHang", id)
                        .getSingleResult();
                
                if (result != null) {
                    remainingDays = ((Number) result).intValue();
                }
            } catch (Exception e) {
                // If function doesn't exist, calculate manually
                remainingDays = null;
            }
        }

        return com.nhom8.crm.dto.response.TrialResponse.builder()
                .customerId(kh.getMaKhachHang())
                .customerName(kh.getHoTen())
                .startDate(kh.getNgayBatDauDungThu())
                .durationDays(kh.getSoNgayDungThu())
                .status(kh.getTrangThaiDungThu())
                .remainingDays(remainingDays)
                .build();
    }

    @Transactional
    public com.nhom8.crm.dto.response.TrialResponse updateTrialDetails(Integer id, com.nhom8.crm.dto.request.TrialUpdateRequest request) {
        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        if (request.getStartDate() != null) {
            kh.setNgayBatDauDungThu(request.getStartDate());
        }

        if (request.getDurationDays() != null) {
            kh.setSoNgayDungThu(request.getDurationDays());
        }

        if (request.getStatus() != null) {
            kh.setTrangThaiDungThu(request.getStatus());
        }

        khachHangRepository.save(kh);

        return getTrialDetails(id);
    }

    // ================= HELPER =================

    private KhachHang buildFromRequest(KhachHang kh, KhachHangRequest req) {

        kh.setHoTen(req.getHoTen());
        kh.setEmail(req.getEmail());
        kh.setSoDienThoai(req.getSoDienThoai());
        kh.setGioiTinh(req.getGioiTinh());
        kh.setNgaySinh(req.getNgaySinh());
        kh.setCongTy(req.getCongTy());
        kh.setChucVuTaiCongTy(req.getChucVuTaiCongTy());
        kh.setWebsiteCongTy(req.getWebsiteCongTy());
        kh.setDiaChiChiTiet(req.getDiaChiChiTiet());

        if (req.getTrangThaiKhach() != null) {
            kh.setTrangThaiKhach(req.getTrangThaiKhach());
        }

        if (req.getDiemTiemNang() != null) {
            kh.setDiemTiemNang(req.getDiemTiemNang());
        }

        kh.setNgayBatDauDungThu(req.getNgayBatDauDungThu());

        if (req.getSoNgayDungThu() != null) {
            kh.setSoNgayDungThu(req.getSoNgayDungThu());
        }

        if (req.getMaNguoiPhuTrach() != null) {
            kh.setNguoiPhuTrach(
                    nhanVienRepository.findById(req.getMaNguoiPhuTrach())
                            .orElse(null)
            );
        }

        if (req.getMaNganhNghe() != null) {
            kh.setNganhNghe(
                    nganhNgheRepository.findById(req.getMaNganhNghe())
                            .orElse(null)
            );
        }

        if (req.getMaNguonKH() != null) {
            kh.setNguonKhachHang(
                    nguonKhachHangRepository.findById(req.getMaNguonKH())
                            .orElse(null)
            );
        }

        if (req.getMaPhuongXa() != null) {
            kh.setPhuongXa(
                    phuongXaRepository.findById(req.getMaPhuongXa())
                            .orElse(null)
            );
        }

        return kh;
    }

    private KhachHangResponse toResponse(KhachHang kh) {

        KhachHangResponse.KhachHangResponseBuilder builder =
                KhachHangResponse.builder()
                        .maKhachHang(kh.getMaKhachHang())
                        .hoTen(kh.getHoTen())
                        .email(kh.getEmail())
                        .soDienThoai(kh.getSoDienThoai())
                        .gioiTinh(kh.getGioiTinh())
                        .ngaySinh(kh.getNgaySinh())
                        .congTy(kh.getCongTy())
                        .chucVuTaiCongTy(kh.getChucVuTaiCongTy())
                        .websiteCongTy(kh.getWebsiteCongTy())
                        .diaChiChiTiet(kh.getDiaChiChiTiet())
                        .trangThaiKhach(kh.getTrangThaiKhach())
                        .diemTiemNang(kh.getDiemTiemNang())
                        .ngayBatDauDungThu(kh.getNgayBatDauDungThu())
                        .soNgayDungThu(kh.getSoNgayDungThu())
                        .trangThaiDungThu(kh.getTrangThaiDungThu())
                        .ngayTao(kh.getNgayTao())
                        .ngayCapNhat(kh.getNgayCapNhat());

        if (kh.getNguoiPhuTrach() != null) {

            builder.maNguoiPhuTrach(
                    kh.getNguoiPhuTrach().getMaNhanVien()
            );

            builder.tenNguoiPhuTrach(
                    kh.getNguoiPhuTrach().getHoTen()
            );
        }

        if (kh.getNganhNghe() != null) {
            builder.tenNganhNghe(
                    kh.getNganhNghe().getTenNganhNghe()
            );
        }

        if (kh.getNguonKhachHang() != null) {
            builder.tenNguonKH(
                    kh.getNguonKhachHang().getTenNguon()
            );
        }

        if (kh.getPhuongXa() != null) {

            builder.tenPhuongXa(
                    kh.getPhuongXa().getTenPhuongXa()
            );

            if (kh.getPhuongXa().getTinhThanh() != null) {

                builder.tenTinhThanh(
                        kh.getPhuongXa()
                                .getTinhThanh()
                                .getTenTinhThanh()
                );
            }
        }

        return builder.build();
    }
}