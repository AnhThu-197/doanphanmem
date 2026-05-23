package com.nhom8.crm.controller;

import com.nhom8.crm.dto.request.InteractionRequest;
import com.nhom8.crm.dto.response.InteractionResponse;
import com.nhom8.crm.service.LichSuTuongTacService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tuongtac")
public class LichSuTuongTacController {

    private final LichSuTuongTacService service;

    @Autowired
    public LichSuTuongTacController(LichSuTuongTacService service) {
        this.service = service;
    }

    // 1. Lấy danh sách toàn bộ tương tác trên hệ thống
    @GetMapping
    public ResponseEntity<List<InteractionResponse>> getAllInteractions() {
        List<InteractionResponse> list = service.getAllInteractions();
        return ResponseEntity.ok(list);
    }

    // 2. Lấy danh sách lịch sử tương tác của một khách hàng cụ thể
    @GetMapping("/khachhang/{customerId}")
    public ResponseEntity<List<InteractionResponse>> getInteractionsByCustomerId(@PathVariable Integer customerId) {
        List<InteractionResponse> list = service.getInteractionsByCustomerId(customerId);
        return ResponseEntity.ok(list);
    }

    // 3. Thêm một tương tác mới
    @PostMapping
    public ResponseEntity<InteractionResponse> addInteraction(@Valid @RequestBody InteractionRequest request) {
        InteractionResponse saved = service.addInteraction(request);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 4. Chỉnh sửa một tương tác
    @PutMapping("/{id}")
    public ResponseEntity<InteractionResponse> updateInteraction(@PathVariable Integer id,
                                                                 @Valid @RequestBody InteractionRequest request) {
        InteractionResponse updated = service.updateInteraction(id, request);
        return ResponseEntity.ok(updated);
    }

    // 5. Xóa một tương tác
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInteraction(@PathVariable Integer id) {
        service.deleteInteraction(id);
        return ResponseEntity.noContent().build();
    }

    // 6. Upload tệp đính kèm và gắn vào tương tác
    @PostMapping("/{id}/files")
    public ResponseEntity<com.nhom8.crm.dto.response.TepDinhKemResponse> uploadFile(
            @PathVariable Integer id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        com.nhom8.crm.dto.response.TepDinhKemResponse response = service.uploadAttachment(id, file);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // 7. Tải xuống tệp đính kèm bằng mã tệp (maTep)
    @GetMapping("/files/{fileId}")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable Integer fileId, jakarta.servlet.http.HttpServletRequest request) {
        org.springframework.core.io.Resource resource = service.downloadAttachment(fileId);

        // Xác định kiểu nội dung của tệp
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (java.io.IOException ex) {
            // Không xác định được kiểu file
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // 8. Hủy liên kết tệp đính kèm khỏi tương tác (xóa mềm tệp)
    @DeleteMapping("/{id}/files/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Integer id, @PathVariable Integer fileId) {
        service.deleteAttachment(id, fileId);
        return ResponseEntity.noContent().build();
    }
}
