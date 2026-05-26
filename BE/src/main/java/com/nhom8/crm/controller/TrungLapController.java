package com.nhom8.crm.controller;

import com.nhom8.crm.dto.response.ApiResponse;
import com.nhom8.crm.dto.response.TrungLapKhachHangResponse;
import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.repository.KhachHangRepository;
import com.nhom8.crm.service.KhachHangService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/khach-hang/trung-lap")
@RequiredArgsConstructor
@Tag(name = "Trùng lặp khách hàng", description = "Quản lý trùng lặp và gộp dữ liệu khách hàng")
public class TrungLapController {

    private final KhachHangRepository khachHangRepository;
    private final KhachHangService khachHangService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các cặp khách hàng trùng lặp chưa xử lý")
    public ResponseEntity<ApiResponse<List<TrungLapKhachHangResponse>>> getPendingDuplicates() {
        List<Object[]> pairs = khachHangRepository.findDuplicatePairs();

        List<TrungLapKhachHangResponse> response = pairs.stream()
                .map(pair -> {
                    KhachHang k1 = (KhachHang) pair[0];
                    KhachHang k2 = (KhachHang) pair[1];
                    double similarity = khachHangService.calculateSimilarity(k1.getHoTen(), k2.getHoTen());

                    return TrungLapKhachHangResponse.builder()
                            .id(k1.getMaKhachHang() + "_" + k2.getMaKhachHang())
                            .customer1(TrungLapKhachHangResponse.CustomerDetail.builder()
                                    .id(k1.getMaKhachHang())
                                    .name(k1.getHoTen())
                                    .email(k1.getEmail())
                                    .phone(k1.getSoDienThoai())
                                    .build())
                            .customer2(TrungLapKhachHangResponse.CustomerDetail.builder()
                                    .id(k2.getMaKhachHang())
                                    .name(k2.getHoTen())
                                    .email(k2.getEmail())
                                    .phone(k2.getSoDienThoai())
                                    .build())
                            .similarity(similarity)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/{id}/gop")
    @Operation(summary = "Gộp cặp khách hàng trùng lặp")
    public ResponseEntity<ApiResponse<Void>> mergeDuplicate(@PathVariable String id) {
        String[] parts = id.split("_");
        if (parts.length != 2) {
            throw new IllegalArgumentException("Định dạng ID không hợp lệ");
        }
        Integer keepId = Integer.parseInt(parts[0]);
        Integer removeId = Integer.parseInt(parts[1]);
        khachHangService.mergeCustomers(keepId, removeId);
        return ResponseEntity.ok(ApiResponse.ok("Gộp khách hàng thành công", null));
    }
}
