package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.InteractionRequest;
import com.nhom8.crm.dto.response.InteractionResponse;
import java.util.List;

public interface LichSuTuongTacService {
    List<InteractionResponse> getAllInteractions();
    List<InteractionResponse> getInteractionsByCustomerId(Integer customerId);
    InteractionResponse addInteraction(InteractionRequest request);
    InteractionResponse updateInteraction(Integer id, InteractionRequest request);
    void deleteInteraction(Integer id);

    // Quản lý tệp đính kèm (Attachments)
    com.nhom8.crm.dto.response.TepDinhKemResponse uploadAttachment(Integer interactionId, org.springframework.web.multipart.MultipartFile file);
    org.springframework.core.io.Resource downloadAttachment(Integer fileId);
    void deleteAttachment(Integer interactionId, Integer fileId);
}
