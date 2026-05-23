// ============================================
// API SYNC PAGE
// ============================================

function openApiIntegrationSettings() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Đồng bộ Dữ liệu Khách hàng</h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Tích hợp API với Nền tảng Thứ ba</h3>
            <p style="color: #64748b; margin-bottom: 20px;">
                Kết nối với các nền tảng marketing để tự động đồng bộ dữ liệu khách hàng vào CRM mà không cần nhập tay.
            </p>
            
            <div style="display: grid; gap: 20px;">
                ${DATA.apiIntegrations.map(api => `
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                            <div>
                                <h4 style="margin-bottom: 5px;">
                                    <i class="fas fa-${api.type === 'facebook' ? 'facebook' : api.type === 'google' ? 'google' : 'plug'}"></i>
                                    ${api.name}
                                </h4>
                                <small style="color: #64748b;">Loại: ${api.type}</small>
                            </div>
                            <span class="status ${api.status === 'active' ? 'customer' : 'lead'}" style="padding: 5px 12px;">
                                ${api.status === 'active' ? '✓ Đang hoạt động' : '○ Chưa kích hoạt'}
                            </span>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">API Key / Token:</label>
                            <input type="password" id="apiKey_${api.id}" value="${api.apiKey}" 
                                   placeholder="Nhập API Key hoặc Access Token"
                                   style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                        </div>
                        
                        ${api.type === 'webhook' ? `
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Webhook URL:</label>
                                <input type="text" id="webhookUrl_${api.id}" value="${api.webhookUrl || ''}" 
                                       placeholder="https://your-crm.com/webhook/receive"
                                       style="width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px;">
                                <small style="color: #64748b; display: block; margin-top: 5px;">
                                    Sao chép URL này và cấu hình trong hệ thống nguồn
                                </small>
                            </div>
                        ` : ''}
                        
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-primary" onclick="saveApiIntegration(${api.id})">
                                <i class="fas fa-save"></i> Lưu Cấu hình
                            </button>
                            <button class="btn btn-secondary" onclick="testApiConnection(${api.id})">
                                <i class="fas fa-plug"></i> Test Kết nối
                            </button>
                            ${api.status === 'active' ? `
                                <button class="btn btn-secondary" onclick="syncApiData(${api.id})">
                                    <i class="fas fa-sync"></i> Đồng bộ Ngay
                                </button>
                            ` : ''}
                        </div>
                        
                        ${api.lastSync ? `
                            <div style="margin-top: 15px; padding: 10px; background: #f1f5f9; border-radius: 5px;">
                                <small style="color: #64748b;">
                                    <i class="fas fa-clock"></i> Đồng bộ lần cuối: ${api.lastSync}
                                </small>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 15px;">Lịch sử Đồng bộ</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nền tảng</th>
                        <th>Số KH mới</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.syncHistory && DATA.syncHistory.length > 0 ? DATA.syncHistory.map(sync => `
                        <tr>
                            <td>${sync.platform}</td>
                            <td><strong>${sync.newCustomers}</strong> khách hàng</td>
                            <td>${sync.timestamp}</td>
                            <td><span class="status ${sync.status === 'success' ? 'customer' : 'lead'}">${sync.status === 'success' ? 'Thành công' : 'Thất bại'}</span></td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8;">
                                Chưa có lịch sử đồng bộ
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

function saveApiIntegration(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    const apiKeyInput = document.getElementById(`apiKey_${apiId}`);
    const webhookUrlInput = document.getElementById(`webhookUrl_${apiId}`);
    
    api.apiKey = apiKeyInput.value;
    if (webhookUrlInput) {
        api.webhookUrl = webhookUrlInput.value;
    }
    
    if (api.apiKey) {
        api.status = 'active';
    }
    
    alert(`✓ Đã lưu cấu hình cho ${api.name}`);
    DATA.addAuditLog('UPDATE_API_INTEGRATION', `Cập nhật tích hợp API: ${api.name}`, AUTH.getCurrentUser().id);
    openApiIntegrationSettings();
}

function testApiConnection(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    if (!api.apiKey) {
        alert('⚠ Vui lòng nhập API Key trước khi test kết nối!');
        return;
    }
    
    // Simulate API test
    setTimeout(() => {
        alert(`✓ Kết nối thành công với ${api.name}!\n\nAPI Key hợp lệ và sẵn sàng đồng bộ dữ liệu.`);
    }, 1000);
}

function syncApiData(apiId) {
    const api = DATA.apiIntegrations.find(a => a.id === apiId);
    if (!api) return;
    
    if (api.status !== 'active') {
        alert('⚠ Vui lòng kích hoạt tích hợp trước khi đồng bộ!');
        return;
    }
    
    // Simulate API sync
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu từ ${api.name}...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        // Simulate new customers
        const newCustomersCount = Math.floor(Math.random() * 10) + 1;
        const mockCustomers = [];
        
        for (let i = 0; i < newCustomersCount; i++) {
            const newCustomer = {
                id: DATA.customers.length + i + 1,
                name: `Khách hàng từ ${api.name} ${i + 1}`,
                email: `customer${Date.now()}${i}@example.com`,
                phone: `09${Math.floor(Math.random() * 100000000)}`,
                company: `Công ty ${i + 1}`,
                status: 'lead',
                source: api.type,
                industry: 'Khác',
                score: Math.floor(Math.random() * 50) + 20,
                createdDate: new Date().toISOString().split('T')[0],
                lastInteraction: new Date().toISOString().split('T')[0],
                deleted: false
            };
            mockCustomers.push(newCustomer);
            DATA.customers.push(newCustomer);
            
            // Auto assign customer
            autoAssignCustomer(newCustomer);
        }
        
        // Update sync history
        if (!DATA.syncHistory) DATA.syncHistory = [];
        DATA.syncHistory.unshift({
            id: DATA.syncHistory.length + 1,
            platform: api.name,
            newCustomers: newCustomersCount,
            timestamp: new Date().toLocaleString('vi-VN'),
            status: 'success'
        });
        
        api.lastSync = new Date().toLocaleString('vi-VN');
        
        alert(`✓ Đồng bộ thành công!\n\nĐã thêm ${newCustomersCount} khách hàng mới từ ${api.name}\nCác khách hàng đã được phân bổ tự động cho nhân viên.`);
        DATA.addAuditLog('SYNC_API_DATA', `Đồng bộ ${newCustomersCount} khách hàng từ ${api.name}`, 'system');
        openApiIntegrationSettings();
    }, 2000);
}
