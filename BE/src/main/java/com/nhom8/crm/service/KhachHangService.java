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
        // Kiểm tra trùng email
        if (khachHangRepository.findByEmailAndDaXoaFalse(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email đã tồn tại trong hệ thống");
        }
        // Kiểm tra trùng SĐT
        if (khachHangRepository.findBySoDienThoaiAndDaXoaFalse(request.getSoDienThoai()).isPresent()) {
            throw new BadRequestException("Số điện thoại đã tồn tại trong hệ thống");
        }

        KhachHang kh = buildFromRequest(new KhachHang(), request);
        return toResponse(khachHangRepository.save(kh));
    }

    @Transactional
    public KhachHangResponse update(Integer id, KhachHangRequest request) {
        KhachHang kh = khachHangRepository.findById(id)
                .filter(k -> !k.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng", id));

        // Kiểm tra trùng email (ngoại trừ chính nó)
        khachHangRepository.findByEmailAndDaXoaFalse(request.getEmail())
                .ifPresent(existing -> {
                    if (!existing.getMaKhachHang().equals(id)) {
                        throw new BadRequestException("Email đã tồn tại trong hệ thống");
                    }
                });

        buildFromRequest(kh, request);
        return toResponse(khachHangRepository.save(kh));
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
