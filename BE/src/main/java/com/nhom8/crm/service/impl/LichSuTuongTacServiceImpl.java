package com.nhom8.crm.service.impl;

import com.nhom8.crm.dto.request.InteractionRequest;
import com.nhom8.crm.dto.response.InteractionResponse;
import com.nhom8.crm.dto.response.TepDinhKemResponse;
import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.entity.LichSuTuongTac;
import com.nhom8.crm.entity.NhanVien;
import com.nhom8.crm.entity.TepDinhKem;
import com.nhom8.crm.exception.ResourceNotFoundException;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.repository.LichSuTuongTacRepository;
import com.nhom8.crm.repository.NhanVienRepository;
import com.nhom8.crm.repository.TepDinhKemRepository;
import com.nhom8.crm.service.LichSuTuongTacService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LichSuTuongTacServiceImpl implements LichSuTuongTacService {

    private final LichSuTuongTacRepository repository;
    private final KhachHangRepository khachHangRepository;
    private final NhanVienRepository nhanVienRepository;
    private final TepDinhKemRepository tepDinhKemRepository;

    private final Path fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    {
        try {
            java.nio.file.Files.createDirectories(fileStorageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ file uploads.", e);
        }
    }

    @Autowired
    public LichSuTuongTacServiceImpl(LichSuTuongTacRepository repository,
                                     KhachHangRepository khachHangRepository,
                                     NhanVienRepository nhanVienRepository,
                                     TepDinhKemRepository tepDinhKemRepository) {
        this.repository = repository;
        this.khachHangRepository = khachHangRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.tepDinhKemRepository = tepDinhKemRepository;
    }

    @Override
    public List<InteractionResponse> getAllInteractions() {
        return repository.findAllByOrderByThoiGianTaoDesc().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<InteractionResponse> getInteractionsByCustomerId(Integer customerId) {
        // Kiểm tra khách hàng có tồn tại không
        if (!khachHangRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + customerId);
        }
        return repository.findByKhachHangMaKhachHangOrderByThoiGianTaoDesc(customerId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InteractionResponse addInteraction(InteractionRequest request) {
        // 1. Tìm kiếm và kiểm tra Khách hàng
        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        // 2. Tìm kiếm Nhân viên (nếu có truyền)
        NhanVien nhanVien = null;
        if (request.getEmployeeId() != null) {
            nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));
        }

        // 3. Chuẩn hóa Loại tương tác từ FE ('call', 'email', 'meeting', 'message') sang DB ('Gọi điện', 'Email', 'Gặp mặt', 'Nhắn tin')
        String loaiTuongTacDb = mapFrontendTypeToDb(request.getType());

        // 4. Khởi tạo đối tượng lịch sử tương tác
        LichSuTuongTac tuongTac = LichSuTuongTac.builder()
                .khachHang(khachHang)
                .nhanVien(nhanVien)
                .loaiTuongTac(loaiTuongTacDb)
                .noiDung(request.getContent())
                .ketQua(request.getNotes()) // FE truyền notes -> lưu vào cột kết quả của DB
                .tieuDe("Tương tác tự động từ hệ thống")
                .thoiGianTao(LocalDateTime.now())
                .ngayCapNhat(LocalDateTime.now())
                .build();

        // 5. Lưu vào Database
        LichSuTuongTac saved = repository.save(tuongTac);

        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public InteractionResponse updateInteraction(Integer id, InteractionRequest request) {
        LichSuTuongTac entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tương tác với mã: " + id));

        KhachHang khachHang = khachHangRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với mã: " + request.getCustomerId()));

        NhanVien nhanVien = null;
        if (request.getEmployeeId() != null) {
            nhanVien = nhanVienRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + request.getEmployeeId()));
        }

        entity.setKhachHang(khachHang);
        entity.setNhanVien(nhanVien);
        entity.setLoaiTuongTac(mapFrontendTypeToDb(request.getType()));
        entity.setNoiDung(request.getContent());
        entity.setKetQua(request.getNotes());
        entity.setNgayCapNhat(LocalDateTime.now());

        LichSuTuongTac updated = repository.save(entity);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteInteraction(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy tương tác với mã: " + id);
        }
        repository.deleteById(id);
    }

    // --- Helper Methods ---

    private InteractionResponse convertToResponse(LichSuTuongTac entity) {
        java.util.List<TepDinhKemResponse> attachments = entity.getTepDinhKems() == null ? new java.util.ArrayList<>() :
                entity.getTepDinhKems().stream()
                        .map(this::convertToTepResponse)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toList());

        return InteractionResponse.builder()
                .id(entity.getMaTuongTac())
                .customerId(entity.getKhachHang().getMaKhachHang())
                .customerName(entity.getKhachHang().getHoTen())
                .employeeId(entity.getNhanVien() != null ? entity.getNhanVien().getMaNhanVien() : null)
                .employeeName(entity.getNhanVien() != null ? entity.getNhanVien().getHoTen() : "Hệ thống")
                .type(mapDbToFrontendType(entity.getLoaiTuongTac())) // chuyển sang chuỗi tiếng Anh cho FE
                .content(entity.getNoiDung())
                .notes(entity.getKetQua())
                .date(entity.getThoiGianTao())
                .attachments(attachments)
                .build();
    }

    private TepDinhKemResponse convertToTepResponse(TepDinhKem entity) {
        if (entity == null || Boolean.TRUE.equals(entity.getDaXoa())) return null;
        return TepDinhKemResponse.builder()
                .id(entity.getMaTep())
                .fileName(entity.getTenTep())
                .fileType(entity.getLoaiTep())
                .downloadUrl("/api/tuongtac/files/" + entity.getMaTep())
                .createdDate(entity.getNgayTao())
                .build();
    }

    @Override
    @Transactional
    public TepDinhKemResponse uploadAttachment(Integer interactionId, org.springframework.web.multipart.MultipartFile file) {
        LichSuTuongTac tuongTac = repository.findById(interactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tương tác với mã: " + interactionId));

        String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
        try {
            if (originalFileName.contains("..")) {
                throw new IllegalArgumentException("Tên tệp không hợp lệ: " + originalFileName);
            }

            // Tạo tên file duy nhất để tránh trùng lặp
            String uniqueFileName = java.util.UUID.randomUUID().toString() + "_" + originalFileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Lưu thông tin tệp đính kèm vào Database
            TepDinhKem tep = TepDinhKem.builder()
                    .tenTep(originalFileName)
                    .duongDanLuuTru(targetLocation.toString())
                    .loaiTep(file.getContentType())
                    .daXoa(false)
                    .build();

            TepDinhKem savedTep = tepDinhKemRepository.save(tep);

            // Gắn kết với tương tác
            tuongTac.getTepDinhKems().add(savedTep);
            repository.save(tuongTac);

            return convertToTepResponse(savedTep);
        } catch (Exception ex) {
            throw new RuntimeException("Không thể lưu trữ tệp " + originalFileName + ". Vui lòng thử lại!", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource downloadAttachment(Integer fileId) {
        TepDinhKem tep = tepDinhKemRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tệp đính kèm với mã: " + fileId));

        if (Boolean.TRUE.equals(tep.getDaXoa())) {
            throw new ResourceNotFoundException("Tệp đính kèm này đã bị xóa!");
        }

        try {
            Path filePath = Paths.get(tep.getDuongDanLuuTru()).normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Không tìm thấy tệp vật lý trên máy chủ: " + tep.getTenTep());
            }
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Lỗi tải tệp: " + tep.getTenTep(), ex);
        }
    }

    @Override
    @Transactional
    public void deleteAttachment(Integer interactionId, Integer fileId) {
        LichSuTuongTac tuongTac = repository.findById(interactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tương tác với mã: " + interactionId));

        TepDinhKem tep = tepDinhKemRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tệp đính kèm với mã: " + fileId));

        // Hủy liên kết
        if (tuongTac.getTepDinhKems().contains(tep)) {
            tuongTac.getTepDinhKems().remove(tep);
            repository.save(tuongTac);
        }

        // Đánh dấu xóa tệp
        tep.setDaXoa(true);
        tep.setLyDoXoa("Xóa liên kết khỏi tương tác mã: " + interactionId);
        tep.setNgayXoa(LocalDateTime.now());
        tepDinhKemRepository.save(tep);
    }

    private String mapFrontendTypeToDb(String feType) {
        if (feType == null) return "Gọi điện";
        switch (feType.toLowerCase()) {
            case "call":
                return "Gọi điện";
            case "email":
                return "Email";
            case "meeting":
                return "Gặp mặt";
            case "message":
                return "Nhắn tin";
            default:
                return feType;
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
                return dbType.toLowerCase();
        }
    }
}
