package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.ChiPhiChienDichRequest;
import com.nhom8.crm.dto.response.ChiPhiChienDichResponse;
import com.nhom8.crm.entity.ChiPhiChienDich;
import com.nhom8.crm.entity.ChienDich;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.ChiPhiChienDichRepository;
import com.nhom8.crm.repository.ChienDichRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChiPhiChienDichService {

    private final ChiPhiChienDichRepository chiPhiRepository;
    private final ChienDichRepository chienDichRepository;

    public List<ChiPhiChienDichResponse> getAll() {
        return chiPhiRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.collectingAndThen(Collectors.toList(), list -> {
                    list.sort((a, b) -> b.getMaChiPhi().compareTo(a.getMaChiPhi()));
                    return list;
                }));
    }

    public ChiPhiChienDichResponse getById(Integer id) {
        ChiPhiChienDich cp = chiPhiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi phí chiến dịch", id));
        return toResponse(cp);
    }

    @Transactional
    public ChiPhiChienDichResponse create(ChiPhiChienDichRequest request) {
        ChienDich cd = chienDichRepository.findById(request.getMaChienDich())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", request.getMaChienDich()));

        LocalDateTime ngayGhiNhan = LocalDateTime.now();
        if (request.getNgayGhiNhan() != null && !request.getNgayGhiNhan().isEmpty()) {
            try {
                if (request.getNgayGhiNhan().contains("T")) {
                    ngayGhiNhan = LocalDateTime.parse(request.getNgayGhiNhan());
                } else {
                    ngayGhiNhan = LocalDate.parse(request.getNgayGhiNhan(), DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
                }
            } catch (Exception e) {
                // Fallback to now
            }
        }

        ChiPhiChienDich cp = ChiPhiChienDich.builder()
                .chienDich(cd)
                .tenKhoanChi(request.getTenKhoanChi())
                .loaiChiPhi(request.getLoaiChiPhi())
                .soTien(request.getSoTien())
                .ghiChu(request.getGhiChu())
                .nguonGhiNhan(request.getNguonGhiNhan() != null ? request.getNguonGhiNhan() : "Nhập thủ công")
                .ngayGhiNhan(ngayGhiNhan)
                .build();

        return toResponse(chiPhiRepository.save(cp));
    }

    @Transactional
    public ChiPhiChienDichResponse update(Integer id, ChiPhiChienDichRequest request) {
        ChiPhiChienDich cp = chiPhiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi phí chiến dịch", id));

        ChienDich cd = chienDichRepository.findById(request.getMaChienDich())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", request.getMaChienDich()));

        cp.setChienDich(cd);
        cp.setTenKhoanChi(request.getTenKhoanChi());
        cp.setLoaiChiPhi(request.getLoaiChiPhi());
        cp.setSoTien(request.getSoTien());
        cp.setGhiChu(request.getGhiChu());
        if (request.getNguonGhiNhan() != null) {
            cp.setNguonGhiNhan(request.getNguonGhiNhan());
        }

        if (request.getNgayGhiNhan() != null && !request.getNgayGhiNhan().isEmpty()) {
            try {
                if (request.getNgayGhiNhan().contains("T")) {
                    cp.setNgayGhiNhan(LocalDateTime.parse(request.getNgayGhiNhan()));
                } else {
                    cp.setNgayGhiNhan(LocalDate.parse(request.getNgayGhiNhan(), DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay());
                }
            } catch (Exception e) {
                // Keep existing date if parse fails
            }
        }

        return toResponse(chiPhiRepository.save(cp));
    }

    @Transactional
    public void delete(Integer id) {
        ChiPhiChienDich cp = chiPhiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chi phí chiến dịch", id));
        chiPhiRepository.delete(cp);
    }

    private ChiPhiChienDichResponse toResponse(ChiPhiChienDich cp) {
        return ChiPhiChienDichResponse.builder()
                .maChiPhi(cp.getMaChiPhi())
                .maChienDich(cp.getChienDich().getMaChienDich())
                .campaignName(cp.getChienDich().getTenChienDich())
                .tenKhoanChi(cp.getTenKhoanChi())
                .loaiChiPhi(cp.getLoaiChiPhi())
                .soTien(cp.getSoTien())
                .ghiChu(cp.getGhiChu())
                .nguonGhiNhan(cp.getNguonGhiNhan())
                .ngayGhiNhan(cp.getNgayGhiNhan())
                .build();
    }
}
