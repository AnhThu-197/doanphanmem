package com.nhom8.crm.controller;

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
}
