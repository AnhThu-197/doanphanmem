package com.nhom8.crm.service.impl;

import com.nhom8.crm.dto.request.AppointmentRequest;
import com.nhom8.crm.dto.request.AppointmentResultRequest;
import com.nhom8.crm.dto.response.AppointmentResponse;
import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.entity.LichSuTuongTac;
import com.nhom8.crm.entity.NhacNho;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.repository.LichSuTuongTacRepository;
import com.nhom8.crm.repository.NhacNhoRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.service.NhacNhoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhacNhoServiceImpl implements NhacNhoService {

    private final NhacNhoRepository repository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final LichSuTuongTacRepository interactionRepository;

    @Autowired
    public NhacNhoServiceImpl(NhacNhoRepository repository,
                              KhachHangRepository khachHangRepository,
                              NhanVienRepository nhanVienRepository,
                              LichSuTuongTacRepository interactionRepository) {
        this.repository = repository;
        this.khachHangRepository = khachHangRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.interactionRepository = interactionRepository;
    }

    @Override
    public List<AppointmentResponse> getAllAppointments() {
        return repository.findAllByOrderByThoiGianNhacDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByCustomerId(Integer customerId) {
        if (!khachHangRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + customerId);
        }
        return repository.findByKhachHangMaKhachHangOrderByThoiGianNhacDesc(customerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponse> getAppointmentsByEmployeeId(Integer employeeId) {
        if (!nhanVienRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + employeeId);
        }
        return repository.findByNhanVienMaNhanVienOrderByThoiGianNhacDesc(employeeId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentResponse getAppointmentById(Integer id) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));
        return convertToResponse(entity);
    }

    @Override
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));

        LocalDateTime thoiGianNhac = parseDateTime(request.getDate(), request.getTime());
        String loaiNhacNho = mapFrontendTypeToDb(request.getType());
        Integer nhacTruocPhut = request.getReminderBefore() != null ? request.getReminderBefore() : 30;

        // Call Stored Procedure sp_ThemNhacNho (SP09)
        List<Object[]> spResultList = repository.callSpThemNhacNho(
                khachHang.getMaKhachHang(),
                nhanVien.getMaNhanVien(),
                request.getTitle(),
                loaiNhacNho,
                thoiGianNhac,
                nhacTruocPhut,
                request.getNotes()
        );

        if (spResultList == null || spResultList.isEmpty()) {
            throw new RuntimeException("Gọi Stored Procedure thất bại và không trả về kết quả.");
        }

        Object[] spResult = spResultList.get(0);
        String ketQua = (String) spResult[0];
        String thongBao = (String) spResult[1];

        if ("Lỗi".equalsIgnoreCase(ketQua)) {
            throw new IllegalArgumentException(thongBao);
        }

        // Successfully inserted! Retrieve the newly generated ID
        Integer newId = null;
        if (spResult.length > 2 && spResult[2] != null) {
            if (spResult[2] instanceof Number) {
                newId = ((Number) spResult[2]).intValue();
            } else {
                newId = Integer.parseInt(spResult[2].toString());
            }
        }

        // Retrieve the generated entity and optionally update fields
        NhacNho saved = repository.findById(newId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn vừa tạo với mã: " + newId));

        if (request.getStatus() != null || request.getResult() != null || request.getResultNotes() != null) {
            if (request.getStatus() != null) {
                saved.setTrangThaiNhacNho(mapFrontendStatusToDb(request.getStatus()));
            }
            if (request.getResult() != null) {
                saved.setKetQua(mapFrontendResultToDb(request.getResult()));
            }
            if (request.getResultNotes() != null) {
                saved.setGhiChuKetQua(request.getResultNotes());
            }
            saved = repository.save(saved);
        }

        logInteractionHistoryIfCompleted(saved);
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointment(Integer id, AppointmentRequest request) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));

        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));

        LocalDateTime thoiGianNhac = parseDateTime(request.getDate(), request.getTime());

        entity.setKhachHang(khachHang);
        entity.setNhanVien(nhanVien);
        entity.setTieuDe(request.getTitle());
        entity.setMoTa(request.getNotes());
        entity.setLoaiNhacNho(mapFrontendTypeToDb(request.getType()));
        entity.setThoiGianNhac(thoiGianNhac);
        entity.setNhacTruocPhut(request.getReminderBefore() != null ? request.getReminderBefore() : 30);
        entity.setTrangThaiNhacNho(mapFrontendStatusToDb(request.getStatus()));
        entity.setKetQua(mapFrontendResultToDb(request.getResult()));
        entity.setGhiChuKetQua(request.getResultNotes());

        NhacNho updated = repository.save(entity);
        logInteractionHistoryIfCompleted(updated);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public AppointmentResponse updateAppointmentResult(Integer id, AppointmentResultRequest request) {
        NhacNho entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id));

        entity.setTrangThaiNhacNho("Đã hoàn thành"); // Automatically mark as completed
        entity.setKetQua(mapFrontendResultToDb(request.getResult()));
        entity.setGhiChuKetQua(request.getResultNotes());

        NhacNho updated = repository.save(entity);
        logInteractionHistoryIfCompleted(updated);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy lịch hẹn với mã: " + id);
        }
        repository.deleteById(id);
    }

    // --- Helper Methods ---

    private void logInteractionHistoryIfCompleted(NhacNho entity) {
        if ("Đã hoàn thành".equals(entity.getTrangThaiNhacNho()) && entity.getKetQua() != null) {
            String content = entity.getLoaiNhacNho() + ": " + entity.getTieuDe() + " - Kết quả: " + entity.getKetQua();
            String title = "Kết quả cuộc hẹn: " + entity.getTieuDe();
            
            // Check if there is an existing interaction with the same customer and matching title/content
            boolean exists = interactionRepository.findByKhachHangMaKhachHangOrderByThoiGianTaoDesc(entity.getKhachHang().getMaKhachHang())
                .stream()
                .anyMatch(i -> title.equals(i.getTieuDe()) && content.equals(i.getNoiDung()) && 
                               (entity.getGhiChuKetQua() == null ? i.getKetQua() == null : entity.getGhiChuKetQua().equals(i.getKetQua())));
            
            if (!exists) {
                LichSuTuongTac tuongTac = LichSuTuongTac.builder()
                        .khachHang(entity.getKhachHang())
                        .nhanVien(entity.getNhanVien())
                        .loaiTuongTac(entity.getLoaiNhacNho())
                        .tieuDe(title)
                        .noiDung(content)
                        .ketQua(entity.getGhiChuKetQua())
                        .thoiGianTao(LocalDateTime.now())
                        .ngayCapNhat(LocalDateTime.now())
                        .build();
                interactionRepository.save(tuongTac);
            }
        }
    }

    private LocalDateTime parseDateTime(String dateStr, String timeStr) {
        try {
            LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
            LocalTime time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
            return LocalDateTime.of(date, time);
        } catch (Exception e) {
            try {
                LocalDate date = LocalDate.parse(dateStr);
                LocalTime time = LocalTime.parse(timeStr);
                return LocalDateTime.of(date, time);
            } catch (Exception ex) {
                return LocalDateTime.now().plusDays(1); // default backup
            }
        }
    }

    private AppointmentResponse convertToResponse(NhacNho entity) {
        String dateStr = entity.getThoiGianNhac().toLocalDate().toString();
        String timeStr = entity.getThoiGianNhac().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm"));

        return AppointmentResponse.builder()
                .id(entity.getMaNhacNho())
                .customerId(entity.getKhachHang().getMaKhachHang())
                .customerName(entity.getKhachHang().getHoTen())
                .employeeId(entity.getNhanVien().getMaNhanVien())
                .employeeName(entity.getNhanVien().getHoTen())
                .title(entity.getTieuDe())
                .type(mapDbToFrontendType(entity.getLoaiNhacNho()))
                .date(dateStr)
                .time(timeStr)
                .reminderBefore(entity.getNhacTruocPhut())
                .notes(entity.getMoTa())
                .status(mapDbToFrontendStatus(entity.getTrangThaiNhacNho()))
                .result(entity.getKetQua())
                .resultNotes(entity.getGhiChuKetQua())
                .createdDate(entity.getNgayTao())
                .updatedDate(entity.getNgayCapNhat())
                .build();
    }

    private String mapFrontendTypeToDb(String feType) {
        if (feType == null) return "Gọi điện";
        switch (feType.toLowerCase()) {
            case "call":
                return "Gọi điện";
            case "email":
                return "Email";
            case "meeting":
            case "video":
                return "Gặp mặt";
            case "message":
                return "Nhắn tin";
            default:
                return "Gọi điện";
        }
    }

    private String mapDbToFrontendType(String dbType) {
        if (dbType == null) return "call";
        switch (dbType) {
            case "Gọi điện":
                return "call";
            case "Email":
                return "email";
            case "Gặp mặt":
                return "meeting";
            case "Nhắn tin":
                return "message";
            default:
                return "call";
        }
    }

    private String mapFrontendStatusToDb(String feStatus) {
        if (feStatus == null) return "Chờ xử lý";
        switch (feStatus.toLowerCase()) {
            case "scheduled":
                return "Chờ xử lý";
            case "completed":
                return "Đã hoàn thành";
            case "cancelled":
                return "Đã hủy";
            default:
                return "Chờ xử lý";
        }
    }

    private String mapDbToFrontendStatus(String dbStatus) {
        if (dbStatus == null) return "scheduled";
        switch (dbStatus) {
            case "Chờ xử lý":
                return "scheduled";
            case "Đã hoàn thành":
                return "completed";
            case "Đã hủy":
                return "cancelled";
            default:
                return "scheduled";
        }
    }

    private String mapFrontendResultToDb(String feResult) {
        if (feResult == null || feResult.trim().isEmpty()) return null;
        String clean = feResult.trim().toLowerCase();
        if (clean.contains("thành công") || clean.contains("success")) {
            return "Thành công";
        }
        if (clean.contains("bận") || clean.contains("busy")) {
            return "Khách bận";
        }
        if (clean.contains("từ chối") || clean.contains("decline") || clean.contains("reject")) {
            return "Khách từ chối";
        }
        if (feResult.equals("Thành công") || feResult.equals("Khách bận") || feResult.equals("Khách từ chối")) {
            return feResult;
        }
        return null;
    }
}
