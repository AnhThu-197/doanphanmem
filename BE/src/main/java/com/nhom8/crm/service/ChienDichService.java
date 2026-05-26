package com.nhom8.crm.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom8.crm.dto.request.ChienDichRequest;
import com.nhom8.crm.dto.response.ChienDichResponse;
import com.nhom8.crm.entity.ChienDich;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.ChiPhiChienDichRepository;
import com.nhom8.crm.repository.ChienDichRepository;
import com.nhom8.crm.repository.NhanVienRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChienDichService {

    private final ChienDichRepository chienDichRepository;
    private final ChiPhiChienDichRepository chiPhiChienDichRepository;
    private final NhanVienRepository nhanVienRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    /**
     * Lấy danh sách tất cả chiến dịch chưa bị xóa
     */
    public List<ChienDichResponse> getAll() {
        return chienDichRepository.findByDaXoaFalse()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách chiến dịch đã bị xóa
     */
    public List<ChienDichResponse> getTrash() {
        return chienDichRepository.findByDaXoaTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy chi tiết chiến dịch theo ID
     */
    public ChienDichResponse getById(Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));
        return toResponse(cd);
    }

    /**
     * Tìm kiếm chiến dịch theo từ khóa
     */
    public List<ChienDichResponse> search(String keyword) {
        return chienDichRepository.searchByKeyword(keyword)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo chiến dịch mới
     */
    @Transactional
    public ChienDichResponse create(ChienDichRequest request) {
        ChienDich cd = ChienDich.builder()
                .tenChienDich(request.getTenChienDich())
                .moTa(request.getMoTa())
                .mucTieu(request.getMucTieu())
                .loaiChienDich(request.getLoaiChienDich())
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .nganSach(request.getNganSach() != null ? request.getNganSach() : BigDecimal.ZERO)
                .doanhThuThucTe(BigDecimal.ZERO)
                .trangThaiChienDich(request.getTrangThaiChienDich() != null ? request.getTrangThaiChienDich() : "Lên kế hoạch")
                .daXoa(false)
                .build();

        if (request.getMaNguoiQuanLy() != null) {
            NhanVien nv = nhanVienRepository.findById(request.getMaNguoiQuanLy())
                    .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getMaNguoiQuanLy()));
            cd.setNguoiQuanLy(nv);
        }

        ChienDich saved = chienDichRepository.save(cd);
        log.info("Tạo chiến dịch mới: {}", saved.getMaChienDich());
        return toResponse(saved);
    }

    /**
     * Cập nhật chiến dịch
     */
    @Transactional
    public ChienDichResponse update(Integer id, ChienDichRequest request) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));

        cd.setTenChienDich(request.getTenChienDich());
        cd.setMoTa(request.getMoTa());
        cd.setMucTieu(request.getMucTieu());
        cd.setLoaiChienDich(request.getLoaiChienDich());
        cd.setNgayBatDau(request.getNgayBatDau());
        cd.setNgayKetThuc(request.getNgayKetThuc());
        cd.setNganSach(request.getNganSach() != null ? request.getNganSach() : BigDecimal.ZERO);

        if (request.getTrangThaiChienDich() != null) {
            cd.setTrangThaiChienDich(request.getTrangThaiChienDich());
        }

        if (request.getMaNguoiQuanLy() != null) {
            NhanVien nv = nhanVienRepository.findById(request.getMaNguoiQuanLy())
                    .orElseThrow(() -> new ResourceNotFoundException("Nhân viên", request.getMaNguoiQuanLy()));
            cd.setNguoiQuanLy(nv);
        } else {
            cd.setNguoiQuanLy(null);
        }

        ChienDich updated = chienDichRepository.save(cd);
        log.info("Cập nhật chiến dịch: {}", updated.getMaChienDich());
        return toResponse(updated);
    }

    /**
     * Xóa mềm chiến dịch
     */
    @Transactional
    public void delete(Integer id, String lyDo) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));

        cd.setDaXoa(true);
        cd.setNgayXoa(LocalDateTime.now());
        cd.setLyDoXoa(lyDo);
        chienDichRepository.save(cd);
        log.info("Xóa chiến dịch: {}", id);
    }

    /**
     * Khôi phục chiến dịch đã xóa
     */
    @Transactional
    public ChienDichResponse restore(Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch đã xóa", id));

        cd.setDaXoa(false);
        cd.setNgayXoa(null);
        cd.setLyDoXoa(null);
        ChienDich restored = chienDichRepository.save(cd);
        log.info("Khôi phục chiến dịch: {}", id);
        return toResponse(restored);
    }

    /**
     * Xóa vĩnh viễn chiến dịch khỏi CSDL
     */
    @Transactional
    public void deletePermanently(Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch đã xóa", id));

        // 1. Xóa liên kết trong bảng trung gian KhachHang_ChienDich
        entityManager.createNativeQuery("DELETE FROM KhachHang_ChienDich WHERE maChienDich = :id")
                .setParameter("id", id)
                .executeUpdate();

        // 2. Xóa các chi phí liên quan trong bảng ChiPhiChienDich
        entityManager.createNativeQuery("DELETE FROM ChiPhiChienDich WHERE maChienDich = :id")
                .setParameter("id", id)
                .executeUpdate();

        // 3. Ngắt liên kết hợp đồng trong bảng HopDong_GiaoDich (chuyển sang NULL)
        entityManager.createNativeQuery("UPDATE HopDong_GiaoDich SET maChienDich = NULL WHERE maChienDich = :id")
                .setParameter("id", id)
                .executeUpdate();

        // 4. Xóa chiến dịch (bảng KenhTruyenThong sẽ tự động xóa theo ON DELETE CASCADE)
        chienDichRepository.delete(cd);
        log.info("Xóa vĩnh viễn chiến dịch: {}", id);
    }

    /**
     * Tính toán ROI chiến dịch
     * ROI = ((Revenue - Cost) / Cost) * 100
     */
    public Map<String, Object> calculateROI(Integer id) {
        ChienDich cd = chienDichRepository.findById(id)
                .filter(c -> !c.getDaXoa())
                .orElseThrow(() -> new ResourceNotFoundException("Chiến dịch", id));

        BigDecimal totalCost = chiPhiChienDichRepository.sumByChienDich(id);
        if (totalCost == null) totalCost = BigDecimal.ZERO;

        BigDecimal revenue = cd.getDoanhThuThucTe() != null ? cd.getDoanhThuThucTe() : BigDecimal.ZERO;

        Map<String, Object> result = new HashMap<>();
        result.put("maChienDich", cd.getMaChienDich());
        result.put("tenChienDich", cd.getTenChienDich());
        result.put("totalCost", totalCost);
        result.put("revenue", revenue);

        if (totalCost.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal profit = revenue.subtract(totalCost);
            BigDecimal roi = profit.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
            result.put("profit", profit);
            result.put("roi", roi);
        } else {
            result.put("profit", revenue);
            result.put("roi", BigDecimal.ZERO);
        }

        return result;
    }

    /**
     * Lấy thống kê tổng quan
     */
    public Map<String, Object> getStatistics() {
        List<ChienDich> allCampaigns = chienDichRepository.findByDaXoaFalse();

        Map<String, Object> stats = new HashMap<>();

        // Đếm theo trạng thái
        long planningCount = allCampaigns.stream().filter(c -> "Lên kế hoạch".equals(c.getTrangThaiChienDich())).count();
        long runningCount = allCampaigns.stream().filter(c -> "Đang chạy".equals(c.getTrangThaiChienDich())).count();
        long pausedCount = allCampaigns.stream().filter(c -> "Tạm dừng".equals(c.getTrangThaiChienDich())).count();
        long completedCount = allCampaigns.stream().filter(c -> "Đã kết thúc".equals(c.getTrangThaiChienDich())).count();

        BigDecimal totalBudget = allCampaigns.stream()
                .map(ChienDich::getNganSach)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = allCampaigns.stream()
                .map(ChienDich::getDoanhThuThucTe)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCost = allCampaigns.stream()
                .mapToLong(c -> {
                    BigDecimal cost = chiPhiChienDichRepository.sumByChienDich(c.getMaChienDich());
                    return cost != null ? cost.longValue() : 0;
                })
                .boxed()
                .map(BigDecimal::new)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        stats.put("totalCampaigns", allCampaigns.size());
        stats.put("planningCount", planningCount);
        stats.put("runningCount", runningCount);
        stats.put("pausedCount", pausedCount);
        stats.put("completedCount", completedCount);
        stats.put("totalBudget", totalBudget);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalCost", totalCost);
        stats.put("totalProfit", totalRevenue.subtract(totalCost));

        return stats;
    }

    /**
     * Convert ChienDich entity to Response DTO
     */
    private ChienDichResponse toResponse(ChienDich cd) {
        BigDecimal totalCost = chiPhiChienDichRepository.sumByChienDich(cd.getMaChienDich());
        if (totalCost == null) totalCost = BigDecimal.ZERO;

        BigDecimal budgetUsagePercent = BigDecimal.ZERO;
        if (cd.getNganSach() != null && cd.getNganSach().compareTo(BigDecimal.ZERO) > 0) {
            budgetUsagePercent = totalCost.divide(cd.getNganSach(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        BigDecimal roi = BigDecimal.ZERO;
        if (totalCost.compareTo(BigDecimal.ZERO) > 0 && cd.getDoanhThuThucTe() != null) {
            BigDecimal profit = cd.getDoanhThuThucTe().subtract(totalCost);
            roi = profit.divide(totalCost, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100));
        }

        return ChienDichResponse.builder()
                .maChienDich(cd.getMaChienDich())
                .tenChienDich(cd.getTenChienDich())
                .moTa(cd.getMoTa())
                .mucTieu(cd.getMucTieu())
                .loaiChienDich(cd.getLoaiChienDich())
                .ngayBatDau(cd.getNgayBatDau())
                .ngayKetThuc(cd.getNgayKetThuc())
                .nganSach(cd.getNganSach())
                .doanhThuThucTe(cd.getDoanhThuThucTe())
                .chiPhiThucTe(totalCost)
                .trangThaiChienDich(cd.getTrangThaiChienDich())
                .ngayTao(cd.getNgayTao())
                .ngayCapNhat(cd.getNgayCapNhat())
                .tenNguoiQuanLy(cd.getNguoiQuanLy() != null ? cd.getNguoiQuanLy().getHoTen() : null)
                .maNguoiQuanLy(cd.getNguoiQuanLy() != null ? cd.getNguoiQuanLy().getMaNhanVien() : null)
                .roi(roi)
                .budgetUsagePercent(budgetUsagePercent)
                .build();
    }
}
