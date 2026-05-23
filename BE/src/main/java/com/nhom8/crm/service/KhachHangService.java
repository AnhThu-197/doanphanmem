package com.nhom8.crm.service;

import com.nhom8.crm.entity.KhachHang;
import com.nhom8.crm.dto.request.TrialUpdateRequest;
import com.nhom8.crm.dto.response.TrialResponse;
import java.util.List;

public interface KhachHangService {
    List<KhachHang> getAllKhachHangs();
    List<KhachHang> getActiveKhachHangs();
    KhachHang getKhachHangById(Integer id);
    KhachHang createKhachHang(KhachHang khachHang);
    KhachHang updateKhachHang(Integer id, KhachHang khachHang);
    void softDeleteKhachHang(Integer id, String lyDo);
    void deleteKhachHangPermanently(Integer id);

    // Quản lý dùng thử (Trial Management)
    TrialResponse getTrialDetails(Integer customerId);
    TrialResponse updateTrialDetails(Integer customerId, TrialUpdateRequest request);
}
