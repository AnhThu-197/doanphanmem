package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.MauThongDiepRequest;
import com.nhom8.crm.dto.response.MauThongDiepResponse;
import com.nhom8.crm.dto.request.SendMessageRequest;
import com.nhom8.crm.dto.response.SendMessageResponse;

import java.util.List;

public interface ThongDiepService {
    SendMessageResponse sendMessage(SendMessageRequest request);
    List<SendMessageResponse> getMessageHistory();
    List<SendMessageResponse> getMessageHistoryByCustomerId(Integer customerId);

    // CRUD Mẫu thông điệp (Templates)
    List<MauThongDiepResponse> getAllTemplates();
    MauThongDiepResponse getTemplateById(Integer id);
    List<MauThongDiepResponse> getTemplatesByType(String type);
    MauThongDiepResponse createTemplate(MauThongDiepRequest request);
    MauThongDiepResponse updateTemplate(Integer id, MauThongDiepRequest request);
    void deleteTemplate(Integer id);
}
