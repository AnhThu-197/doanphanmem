package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.KhachHangRequest;
import com.nhom8.crm.dto.response.KhachHangResponse;
import com.nhom8.crm.entity.*;
import com.nhom8.crm.exception.BadRequestException;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public KhachHangResponse getById(Integer id) {
        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));
        return toResponse(kh);
    }

    public List<KhachHangResponse> search(String keyword) {
        return khachHangRepository.searchByKeyword(keyword)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public KhachHangResponse create(KhachHangRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String phone = request.getSoDienThoai() != null ? request.getSoDienThoai().trim() : "";

        List<KhachHang> duplicatesByEmail = khachHangRepository.findByEmailAndDaXoaFalse(email);
        List<KhachHang> duplicatesByPhone = khachHangRepository.findBySoDienThoaiAndDaXoaFalse(phone);

        List<KhachHang> duplicateCandidates = new java.util.ArrayList<>();
        for (KhachHang kh : duplicatesByEmail) {
            if (kh.getMaKhachHang() != null) duplicateCandidates.add(kh);
        }
        for (KhachHang kh : duplicatesByPhone) {
            boolean alreadyAdded = false;
            for (KhachHang c : duplicateCandidates) {
                if (c.getMaKhachHang().equals(kh.getMaKhachHang())) {
                    alreadyAdded = true;
                    break;
                }
            }
            if (!alreadyAdded && kh.getMaKhachHang() != null) {
                duplicateCandidates.add(kh);
            }
        }

        KhachHang completeMatch = null;
        for (KhachHang candidate : duplicateCandidates) {
            boolean nameMatch = candidate.getHoTen().trim().equalsIgnoreCase(request.getHoTen().trim());
            boolean emailMatch = candidate.getEmail().trim().equalsIgnoreCase(email);
            boolean phoneMatch = candidate.getSoDienThoai().trim().equals(phone);

            if (nameMatch && emailMatch && phoneMatch) {
                completeMatch = candidate;
                break;
            }
        }

        if (completeMatch != null) {
            mergeEmptyFields(completeMatch, request);
            return toResponse(khachHangRepository.save(completeMatch));
        }

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
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void mergeCustomers(Integer keepId, Integer removeId) {
        KhachHang khKeep = khachHangRepository.findById(keepId)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng giữ lại", keepId));

        KhachHang khRemove = khachHangRepository.findById(removeId)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng xóa bỏ", removeId));

        entityManager.createNativeQuery("DELETE FROM GanThe_KhachHang WHERE maKhachHang = :removeId AND maThe IN (SELECT maThe FROM GanThe_KhachHang WHERE maKhachHang = :keepId)")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();
        entityManager.createNativeQuery("UPDATE GanThe_KhachHang SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("DELETE FROM KhachHang_ChienDich WHERE maKhachHang = :removeId AND maChienDich IN (SELECT maChienDich FROM KhachHang_ChienDich WHERE maKhachHang = :keepId)")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();
        entityManager.createNativeQuery("UPDATE KhachHang_ChienDich SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE LichSuTrangThaiKhachHang SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE LichSuTuongTac SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE NhacNho SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE HopDong_GiaoDich SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE LichSuGuiThongDiep SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE LichSuThucThiQuyTac SET maKhachHang = :keepId WHERE maKhachHang = :removeId")
                .setParameter("removeId", removeId)
                .setParameter("keepId", keepId)
                .executeUpdate();

        KhachHangRequest tempReq = KhachHangRequest.builder()
                .gioiTinh(khRemove.getGioiTinh())
                .ngaySinh(khRemove.getNgaySinh())
                .congTy(khRemove.getCongTy())
                .chucVuTaiCongTy(khRemove.getChucVuTaiCongTy())
                .websiteCongTy(khRemove.getWebsiteCongTy())
                .diaChiChiTiet(khRemove.getDiaChiChiTiet())
                .maNguoiPhuTrach(khRemove.getNguoiPhuTrach() != null ? khRemove.getNguoiPhuTrach().getMaNhanVien() : null)
                .maNganhNghe(khRemove.getNganhNghe() != null ? khRemove.getNganhNghe().getMaNganhNghe() : null)
                .maNguonKH(khRemove.getNguonKhachHang() != null ? khRemove.getNguonKhachHang().getMaNguon() : null)
                .maPhuongXa(khRemove.getPhuongXa() != null ? khRemove.getPhuongXa().getMaPhuongXa() : null)
                .build();
        mergeEmptyFields(khKeep, tempReq);
        khachHangRepository.save(khKeep);

        khRemove.setDaXoa(true);
        khRemove.setLyDoXoa("Đã gộp vào khách hàng ID: " + keepId + " (" + khKeep.getHoTen() + ")");
        khRemove.setNgayXoa(LocalDateTime.now());
        khachHangRepository.save(khRemove);
    }

    public int calculateSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0;
        s1 = s1.trim().toLowerCase();
        s2 = s2.trim().toLowerCase();
        if (s1.equals(s2)) return 100;

        int editDistance = editDistance(s1, s2);
        double ratio = 1.0 - ((double) editDistance / Math.max(s1.length(), s2.length()));
        int percentage = (int) Math.round(ratio * 100);
        return Math.max(50, percentage);
    }

    private int editDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int i = 0; i <= s1.length(); i++) {
            int lastValue = i;
            for (int j = 0; j <= s2.length(); j++) {
                if (i == 0) {
                    costs[j] = j;
                } else {
                    if (j > 0) {
                        int newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1)) {
                            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                        }
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0) costs[s2.length()] = lastValue;
        }
        return costs[s2.length()];
    }

    private void mergeEmptyFields(KhachHang target, KhachHangRequest src) {
        if ((target.getGioiTinh() == null || target.getGioiTinh().isEmpty()) && src.getGioiTinh() != null) {
            target.setGioiTinh(src.getGioiTinh());
        }
        if (target.getNgaySinh() == null && src.getNgaySinh() != null) {
            target.setNgaySinh(src.getNgaySinh());
        }
        if ((target.getCongTy() == null || target.getCongTy().isEmpty()) && src.getCongTy() != null) {
            target.setCongTy(src.getCongTy());
        }
        if ((target.getChucVuTaiCongTy() == null || target.getChucVuTaiCongTy().isEmpty()) && src.getChucVuTaiCongTy() != null) {
            target.setChucVuTaiCongTy(src.getChucVuTaiCongTy());
        }
        if ((target.getWebsiteCongTy() == null || target.getWebsiteCongTy().isEmpty()) && src.getWebsiteCongTy() != null) {
            target.setWebsiteCongTy(src.getWebsiteCongTy());
        }
        if ((target.getDiaChiChiTiet() == null || target.getDiaChiChiTiet().isEmpty()) && src.getDiaChiChiTiet() != null) {
            target.setDiaChiChiTiet(src.getDiaChiChiTiet());
        }
        if (target.getNguoiPhuTrach() == null && src.getMaNguoiPhuTrach() != null) {
            target.setNguoiPhuTrach(nhanVienRepository.findById(src.getMaNguoiPhuTrach()).orElse(null));
        }
        if (target.getNganhNghe() == null && src.getMaNganhNghe() != null) {
            target.setNganhNghe(nganhNgheRepository.findById(src.getMaNganhNghe()).orElse(null));
        }
        if (target.getNguonKhachHang() == null && src.getMaNguonKH() != null) {
            target.setNguonKhachHang(nguonKhachHangRepository.findById(src.getMaNguonKH()).orElse(null));
        }
        if (target.getPhuongXa() == null && src.getMaPhuongXa() != null) {
            target.setPhuongXa(phuongXaRepository.findById(src.getMaPhuongXa()).orElse(null));
        }
    }

    // ---- Helper methods ----

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
        if (req.getTrangThaiKhach() != null) kh.setTrangThaiKhach(req.getTrangThaiKhach());
        if (req.getDiemTiemNang() != null) kh.setDiemTiemNang(req.getDiemTiemNang());
        kh.setNgayBatDauDungThu(req.getNgayBatDauDungThu());
        if (req.getSoNgayDungThu() != null) kh.setSoNgayDungThu(req.getSoNgayDungThu());

        if (req.getMaNguoiPhuTrach() != null) {
            kh.setNguoiPhuTrach(nhanVienRepository.findById(req.getMaNguoiPhuTrach()).orElse(null));
        }
        if (req.getMaNganhNghe() != null) {
            kh.setNganhNghe(nganhNgheRepository.findById(req.getMaNganhNghe()).orElse(null));
        }
        if (req.getMaNguonKH() != null) {
            kh.setNguonKhachHang(nguonKhachHangRepository.findById(req.getMaNguonKH()).orElse(null));
        }
        if (req.getMaPhuongXa() != null) {
            kh.setPhuongXa(phuongXaRepository.findById(req.getMaPhuongXa()).orElse(null));
        }
        return kh;
    }

    private KhachHangResponse toResponse(KhachHang kh) {
        KhachHangResponse.KhachHangResponseBuilder builder = KhachHangResponse.builder()
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
            builder.maNguoiPhuTrach(kh.getNguoiPhuTrach().getMaNhanVien());
            builder.tenNguoiPhuTrach(kh.getNguoiPhuTrach().getHoTen());
        }
        if (kh.getNganhNghe() != null) builder.tenNganhNghe(kh.getNganhNghe().getTenNganhNghe());
        if (kh.getNguonKhachHang() != null) builder.tenNguonKH(kh.getNguonKhachHang().getTenNguon());
        if (kh.getPhuongXa() != null) {
            builder.tenPhuongXa(kh.getPhuongXa().getTenPhuongXa());
            if (kh.getPhuongXa().getTinhThanh() != null) {
                builder.tenTinhThanh(kh.getPhuongXa().getTinhThanh().getTenTinhThanh());
            }
        }
        return builder.build();
    }
}
