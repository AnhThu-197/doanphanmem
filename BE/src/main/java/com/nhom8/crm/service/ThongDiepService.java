package com.nhom8.crm.service;

import com.nhom8.crm.dto.request.SendMessageRequest;
import com.nhom8.crm.dto.response.SendMessageResponse;

import java.util.List;

public interface ThongDiepService {
    SendMessageResponse sendMessage(SendMessageRequest request);
    List<SendMessageResponse> getMessageHistory();
    List<SendMessageResponse> getMessageHistoryByCustomerId(Integer customerId);
}
