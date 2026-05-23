package com.nhom8.crm.service.impl;

import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.service.KhachHangService;
import com.nhom8.crm.dto.request.TrialUpdateRequest;
import com.nhom8.crm.dto.response.TrialResponse;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class KhachHangServiceImpl implements KhachHangService {

    private final KhachHangRepository khachHangRepository;

    @Autowired
    public KhachHangServiceImpl(KhachHangRepository khachHangRepository) {
        this.khachHangRepository = khachHangRepository;
    }

    @Override
    public List<KhachHang> getAllKhachHangs() {
        return khachHangRepository.findAll();
    }

    @Override
    public List<KhachHang> getActiveKhachHangs() {
        return khachHangRepository.findByDaXoaFalse();
    }

    @Override
    public KhachHang getKhachHangById(Integer id) {
        return khachHangRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + id));
    }

    @Override
    public KhachHang createKhachHang(KhachHang khachHang) {
        if (khachHangRepository.existsByEmail(khachHang.getEmail())) {
            throw new IllegalArgumentException("Email khách hàng này đã tồn tại!");
        }
        if (khachHangRepository.existsBySoDienThoai(khachHang.getSoDienThoai())) {
            throw new IllegalArgumentException("Số điện thoại khách hàng này đã tồn tại!");
        }
        khachHang.setNgayTao(LocalDateTime.now());
        khachHang.setNgayCapNhat(LocalDateTime.now());
        khachHang.setDaXoa(false);
        return khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public KhachHang updateKhachHang(Integer id, KhachHang updateInfo) {
        KhachHang existing = getKhachHangById(id);

        existing.setHoTen(updateInfo.getHoTen());
        existing.setGioiTinh(updateInfo.getGioiTinh());
        existing.setNgaySinh(updateInfo.getNgaySinh());
        existing.setCongTy(updateInfo.getCongTy());
        existing.setChucVuTaiCongTy(updateInfo.getChucVuTaiCongTy());
        existing.setWebsiteCongTy(updateInfo.getWebsiteCongTy());
        existing.setDiaChiChiTiet(updateInfo.getDiaChiChiTiet());
        existing.setTrangThaiKhach(updateInfo.getTrangThaiKhach());
        existing.setDiemTiemNang(updateInfo.getDiemTiemNang());
        existing.setNgayBatDauDungThu(updateInfo.getNgayBatDauDungThu());
        existing.setSoNgayDungThu(updateInfo.getSoNgayDungThu());
        existing.setTrangThaiDungThu(updateInfo.getTrangThaiDungThu());
        existing.setNgayCapNhat(LocalDateTime.now());

        khachHangRepository.saveAndFlush(existing);

        // Nạp lại đối tượng để có dữ liệu chính xác nhất do Trigger TRG04 cập nhật trạng thái dùng thử
        return khachHangRepository.findById(id).orElse(existing);
    }

    @Override
    public void softDeleteKhachHang(Integer id, String lyDo) {
        KhachHang existing = getKhachHangById(id);
        existing.setDaXoa(true);
        existing.setLyDoXoa(lyDo);
        existing.setNgayXoa(LocalDateTime.now());
        existing.setNgayCapNhat(LocalDateTime.now());
        khachHangRepository.save(existing);
    }

    @Override
    public void deleteKhachHangPermanently(Integer id) {
        KhachHang existing = getKhachHangById(id);
        khachHangRepository.delete(existing);
    }

    @Override
    public TrialResponse getTrialDetails(Integer customerId) {
        KhachHang khachHang = getKhachHangById(customerId);
        Integer remainingDays = khachHangRepository.getRemainingTrialDays(customerId);

        return TrialResponse.builder()
                .customerId(khachHang.getMaKhachHang())
                .customerName(khachHang.getHoTen())
                .startDate(khachHang.getNgayBatDauDungThu())
                .durationDays(khachHang.getSoNgayDungThu())
                .status(khachHang.getTrangThaiDungThu())
                .remainingDays(remainingDays)
                .build();
    }

    @Override
    @Transactional
    public TrialResponse updateTrialDetails(Integer customerId, TrialUpdateRequest request) {
        KhachHang khachHang = getKhachHangById(customerId);

        khachHang.setNgayBatDauDungThu(request.getStartDate());
        khachHang.setSoNgayDungThu(request.getDurationDays() != null ? request.getDurationDays() : 0);
        if (request.getStatus() != null) {
            khachHang.setTrangThaiDungThu(request.getStatus());
        }
        khachHang.setNgayCapNhat(LocalDateTime.now());

        khachHangRepository.saveAndFlush(khachHang);

        // Nạp lại đối tượng để lấy dữ liệu cập nhật từ Trigger TRG04 của database
        KhachHang updated = khachHangRepository.findById(customerId).orElse(khachHang);
        Integer remainingDays = khachHangRepository.getRemainingTrialDays(customerId);

        return TrialResponse.builder()
                .customerId(updated.getMaKhachHang())
                .customerName(updated.getHoTen())
                .startDate(updated.getNgayBatDauDungThu())
                .durationDays(updated.getSoNgayDungThu())
                .status(updated.getTrangThaiDungThu())
                .remainingDays(remainingDays)
                .build();
    }
}
