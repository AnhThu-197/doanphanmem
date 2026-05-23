package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.MauThongDiepRequest;
import com.nhom8.crm.dto.response.MauThongDiepResponse;
import com.nhom8.crm.dto.request.SendMessageRequest;
import com.nhom8.crm.dto.response.SendMessageResponse;
import com.nhom8.crm.service.ThongDiepService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/thongdiep")
public class ThongDiepController {

    private final ThongDiepService thongDiepService;

    @Autowired
    public ThongDiepController(ThongDiepService thongDiepService) {
        this.thongDiepService = thongDiepService;
    }

    // 1. Gửi thông điệp marketing (Email, SMS, Zalo)
    @PostMapping
    public ResponseEntity<SendMessageResponse> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        SendMessageResponse response = thongDiepService.sendMessage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 2. Lấy toàn bộ lịch sử gửi thông điệp
    @GetMapping("/lichsu")
    public ResponseEntity<List<SendMessageResponse>> getMessageHistory() {
        List<SendMessageResponse> list = thongDiepService.getMessageHistory();
        return ResponseEntity.ok(list);
    }

    // 3. Lấy lịch sử gửi thông điệp của một khách hàng cụ thể
    @GetMapping("/lichsu/khachhang/{customerId}")
    public ResponseEntity<List<SendMessageResponse>> getMessageHistoryByCustomerId(@PathVariable Integer customerId) {
        List<SendMessageResponse> list = thongDiepService.getMessageHistoryByCustomerId(customerId);
        return ResponseEntity.ok(list);
    }

    // 4. Lấy tất cả mẫu thông điệp
    @GetMapping("/mau")
    public ResponseEntity<List<MauThongDiepResponse>> getAllTemplates() {
        List<MauThongDiepResponse> list = thongDiepService.getAllTemplates();
        return ResponseEntity.ok(list);
    }

    // 5. Lấy mẫu thông điệp theo ID
    @GetMapping("/mau/{id}")
    public ResponseEntity<MauThongDiepResponse> getTemplateById(@PathVariable Integer id) {
        MauThongDiepResponse response = thongDiepService.getTemplateById(id);
        return ResponseEntity.ok(response);
    }

    // 6. Lấy mẫu thông điệp theo loại (Email, SMS, Zalo)
    @GetMapping("/mau/loai/{loai}")
    public ResponseEntity<List<MauThongDiepResponse>> getTemplatesByType(@PathVariable String loai) {
        List<MauThongDiepResponse> list = thongDiepService.getTemplatesByType(loai);
        return ResponseEntity.ok(list);
    }

    // 7. Tạo mới một mẫu thông điệp
    @PostMapping("/mau")
    public ResponseEntity<MauThongDiepResponse> createTemplate(@Valid @RequestBody MauThongDiepRequest request) {
        MauThongDiepResponse response = thongDiepService.createTemplate(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 8. Cập nhật thông tin một mẫu thông điệp
    @PutMapping("/mau/{id}")
    public ResponseEntity<MauThongDiepResponse> updateTemplate(@PathVariable Integer id, @Valid @RequestBody MauThongDiepRequest request) {
        MauThongDiepResponse response = thongDiepService.updateTemplate(id, request);
        return ResponseEntity.ok(response);
    }

    // 9. Xóa một mẫu thông điệp
    @DeleteMapping("/mau/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Integer id) {
        thongDiepService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
