package com.nhom8.crm.controller;

import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.service.KhachHangService;
import com.nhom8.crm.dto.request.TrialUpdateRequest;
import com.nhom8.crm.dto.response.TrialResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/khachhang")
public class KhachHangController {

    private final KhachHangService khachHangService;

    @Autowired
    public KhachHangController(KhachHangService khachHangService) {
        this.khachHangService = khachHangService;
    }

    // 1. Lấy danh sách khách hàng đang hoạt động (chưa xóa)
    @GetMapping
    public ResponseEntity<List<KhachHang>> getActiveKhachHangs() {
        List<KhachHang> list = khachHangService.getActiveKhachHangs();
        return ResponseEntity.ok(list);
    }

    // 2. Lấy danh sách tất cả bao gồm cả đã xóa mềm
    @GetMapping("/all")
    public ResponseEntity<List<KhachHang>> getAllKhachHangs() {
        List<KhachHang> list = khachHangService.getAllKhachHangs();
        return ResponseEntity.ok(list);
    }

    // 3. Lấy chi tiết khách hàng theo ID
    @GetMapping("/{id}")
    public ResponseEntity<KhachHang> getKhachHangById(@PathVariable Integer id) {
        KhachHang khachHang = khachHangService.getKhachHangById(id);
        return ResponseEntity.ok(khachHang);
    }

    // 4. Tạo mới khách hàng
    @PostMapping
    public ResponseEntity<KhachHang> createKhachHang(@Valid @RequestBody KhachHang khachHang) {
        KhachHang saved = khachHangService.createKhachHang(khachHang);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 5. Cập nhật thông tin khách hàng
    @PutMapping("/{id}")
    public ResponseEntity<KhachHang> updateKhachHang(@PathVariable Integer id, @Valid @RequestBody KhachHang khachHang) {
        KhachHang updated = khachHangService.updateKhachHang(id, khachHang);
        return ResponseEntity.ok(updated);
    }

    // 6. Xóa mềm khách hàng (đánh dấu daXoa = 1 kèm lý do)
    @DeleteMapping("/{id}/soft")
    public ResponseEntity<Void> softDeleteKhachHang(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "Không có lý do cụ thể") String lyDo) {
        khachHangService.softDeleteKhachHang(id, lyDo);
        return ResponseEntity.noContent().build();
    }

    // 7. Xóa vĩnh viễn khỏi Database
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> deleteKhachHangPermanently(@PathVariable Integer id) {
        khachHangService.deleteKhachHangPermanently(id);
        return ResponseEntity.noContent().build();
    }

    // 8. Lấy thông tin dùng thử của khách hàng (bao gồm số ngày còn lại tính từ F01)
    @GetMapping("/{id}/dungthu")
    public ResponseEntity<TrialResponse> getTrialDetails(@PathVariable Integer id) {
        TrialResponse response = khachHangService.getTrialDetails(id);
        return ResponseEntity.ok(response);
    }

    // 9. Cập nhật thông tin dùng thử (tích hợp Trigger TRG04 của Database)
    @PutMapping("/{id}/dungthu")
    public ResponseEntity<TrialResponse> updateTrialDetails(@PathVariable Integer id, @Valid @RequestBody TrialUpdateRequest request) {
        TrialResponse response = khachHangService.updateTrialDetails(id, request);
        return ResponseEntity.ok(response);
    }
}
