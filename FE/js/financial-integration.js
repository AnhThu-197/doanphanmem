// ============================================
// TÍCH HỢP API HỆ THỐNG TÀI CHÍNH
// ============================================

// Mở cài đặt tích hợp tài chính
function openFinancialIntegrationSettings() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Đồng bộ Dữ liệu Tài chính</h2>
        
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Tự động Đồng bộ Chi phí & Doanh thu
            </h3>
            <p style="color: #1e40af; margin: 0;">
                Hệ thống tự động kết nối với ERP, Kế toán và nền tảng quảng cáo để lấy dữ liệu chi phí và doanh thu.
                Các tích hợp đã được cấu hình sẵn bởi IT/Admin.
            </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Trạng thái Tích hợp</h3>
            <div style="display: grid; gap: 15px;">
                ${DATA.financialIntegrations.map(integration => `
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <h4 style="margin-bottom: 5px;">
                                    <i class="fas fa-${getIntegrationIcon(integration.type)}"></i>
                                    ${integration.name}
                                </h4>
                                <small style="color: #64748b;">
                                    ${getIntegrationTypeLabel(integration.type)}
                                    ${integration.metrics ? ` • Đồng bộ: ${integration.metrics.map(m => getMetricLabel(m)).join(', ')}` : ''}
                                </small>
                                ${integration.lastSync ? `
                                    <div style="margin-top: 8px;">
                                        <small style="color: #64748b;">
                                            <i class="fas fa-clock"></i> Đồng bộ lần cuối: ${integration.lastSync}
                                        </small>
                                    </div>
                                ` : ''}
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <span class="status ${integration.status === 'active' ? 'customer' : 'lead'}" style="padding: 8px 16px;">
                                    ${integration.status === 'active' ? '✓ Đang hoạt động' : '○ Chưa kích hoạt'}
                                </span>
                                ${integration.status === 'active' ? `
                                    <button class="btn btn-primary" onclick="syncFinancialData(${integration.id})" style="white-space: nowrap;">
                                        <i class="fas fa-sync"></i> Đồng bộ Ngay
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary" onclick="requestActivateIntegration(${integration.id})" style="white-space: nowrap;">
                                        <i class="fas fa-envelope"></i> Yêu cầu Kích hoạt
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; margin: 0;">
                    <i class="fas fa-info-circle"></i> 
                    <strong>Lưu ý:</strong> Các tích hợp được cấu hình và quản lý bởi bộ phận IT/Admin. 
                    Nếu cần kích hoạt hoặc thay đổi cấu hình, vui lòng liên hệ IT Support.
                </p>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Ánh xạ Chiến dịch</h3>
                <button class="btn btn-primary" onclick="openCampaignMappingModal()">
                    <i class="fas fa-link"></i> Quản lý Ánh xạ
                </button>
            </div>
            <p style="color: #64748b; margin-bottom: 15px;">
                Liên kết chiến dịch CRM với ID chiến dịch trong hệ thống bên ngoài để tự động đồng bộ dữ liệu
            </p>
            
            ${DATA.campaignMappings && DATA.campaignMappings.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Chiến dịch CRM</th>
                            <th>Hệ thống</th>
                            <th>ID Bên ngoài</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.campaignMappings.slice(0, 5).map(mapping => {
                            const campaign = DATA.campaigns.find(c => c.id === mapping.campaignId);
                            const system = DATA.financialIntegrations.find(i => i.id === mapping.systemId);
                            return `
                                <tr>
                                    <td><strong>${mapping.campaignName}</strong></td>
                                    <td>${mapping.systemName}</td>
                                    <td><code style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px;">${mapping.externalId}</code></td>
                                    <td>
                                        <span class="status ${system?.status === 'active' ? 'customer' : 'lead'}">
                                            ${system?.status === 'active' ? 'Đang đồng bộ' : 'Chờ kích hoạt'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                ${DATA.campaignMappings.length > 5 ? `
                    <div style="text-align: center; margin-top: 15px;">
                        <button class="btn btn-secondary" onclick="openCampaignMappingModal()">
                            Xem tất cả ${DATA.campaignMappings.length} ánh xạ
                        </button>
                    </div>
                ` : ''}
            ` : `
                <div style="text-align: center; padding: 30px; color: #94a3b8;">
                    <i class="fas fa-link" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có ánh xạ nào. Click "Quản lý Ánh xạ" để bắt đầu.</p>
                </div>
            `}
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 15px;">Lịch sử Đồng bộ</h3>
            <table>
                <thead>
                    <tr>
                        <th>Hệ thống</th>
                        <th>Chiến dịch</th>
                        <th>Dữ liệu đồng bộ</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.financialSyncHistory && DATA.financialSyncHistory.length > 0 ? 
                        DATA.financialSyncHistory.slice(0, 10).map(sync => `
                            <tr>
                                <td><strong>${sync.systemName}</strong></td>
                                <td>${sync.campaignName}</td>
                                <td>
                                    ${sync.dataType === 'cost' ? 'Chi phí' : sync.dataType === 'revenue' ? 'Doanh thu' : 'Đầy đủ'}: 
                                    <strong>${formatCurrency(sync.amount)}</strong>
                                </td>
                                <td>${sync.timestamp}</td>
                                <td>
                                    <span class="status ${sync.status === 'success' ? 'customer' : 'lead'}">
                                        ${sync.status === 'success' ? '✓ Thành công' : '✗ Thất bại'}
                                    </span>
                                </td>
                            </tr>
                        `).join('') 
                    : `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">
                                Chưa có lịch sử đồng bộ
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}


// Helper functions
function getIntegrationIcon(type) {
    const icons = {
        'erp': 'database',
        'accounting': 'calculator',
        'google_ads': 'google',
        'facebook_ads': 'facebook'
    };
    return icons[type] || 'plug';
}

function getIntegrationTypeLabel(type) {
    const labels = {
        'erp': 'Hệ thống ERP',
        'accounting': 'Phần mềm Kế toán',
        'google_ads': 'Google Ads',
        'facebook_ads': 'Facebook Ads'
    };
    return labels[type] || type;
}

function getMetricLabel(metric) {
    const labels = {
        'cost': 'Chi phí',
        'spend': 'Chi phí',
        'revenue': 'Doanh thu',
        'clicks': 'Clicks',
        'impressions': 'Impressions',
        'conversions': 'Conversions'
    };
    return labels[metric] || metric;
}

// Save financial integration settings (simplified - no user input needed)
function saveFinancialIntegration(integrationId) {
    alert('⚠ Cấu hình tích hợp được quản lý bởi bộ phận IT/Admin.\n\nVui lòng liên hệ IT Support để thay đổi cấu hình.');
}

// Test financial API connection (simplified)
function testFinancialConnection(integrationId) {
    alert('⚠ Chức năng test kết nối chỉ dành cho IT/Admin.\n\nVui lòng liên hệ IT Support nếu có vấn đề về kết nối.');
}

// Request to activate integration
function requestActivateIntegration(integrationId) {
    const integration = DATA.financialIntegrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    if (confirm(`Gửi yêu cầu kích hoạt tích hợp "${integration.name}"?\n\nYêu cầu sẽ được gửi đến bộ phận IT/Admin.`)) {
        alert(`✓ Đã gửi yêu cầu kích hoạt "${integration.name}"!\n\nBộ phận IT sẽ xử lý và thông báo cho bạn khi hoàn tất.`);
        DATA.addAuditLog('REQUEST_ACTIVATE_INTEGRATION', `Yêu cầu kích hoạt: ${integration.name}`, AUTH.getCurrentUser().id);
    }
}


// Sync financial data from external system
function syncFinancialData(integrationId) {
    const integration = DATA.financialIntegrations.find(i => i.id === integrationId);
    if (!integration) return;
    
    if (integration.status !== 'active') {
        alert('⚠ Vui lòng kích hoạt tích hợp trước khi đồng bộ!');
        return;
    }
    
    // Show loading
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu từ ${integration.name}...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    // Simulate API sync
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        // Mock sync data for campaigns
        let updatedCount = 0;
        const syncResults = [];
        
        DATA.campaigns.filter(c => !c.deleted).forEach(campaign => {
            // Simulate getting data from external system
            const mockData = generateMockFinancialData(integration.type, campaign);
            
            if (mockData) {
                // Update campaign with synced data
                if (integration.type === 'google_ads' || integration.type === 'facebook_ads') {
                    // Ads platforms provide cost and performance metrics
                    campaign.actualSpent = (campaign.actualSpent || 0) + mockData.cost;
                    campaign.clicks = (campaign.clicks || 0) + mockData.clicks;
                    campaign.impressions = (campaign.impressions || 0) + mockData.impressions;
                    campaign.conversions = (campaign.conversions || 0) + mockData.conversions;
                } else if (integration.type === 'erp' || integration.type === 'accounting') {
                    // ERP/Accounting provides revenue and cost
                    campaign.revenue = (campaign.revenue || 0) + mockData.revenue;
                    campaign.actualSpent = (campaign.actualSpent || 0) + mockData.cost;
                }
                
                updatedCount++;
                
                // Save to sync history
                if (!DATA.financialSyncHistory) DATA.financialSyncHistory = [];
                DATA.financialSyncHistory.unshift({
                    id: DATA.financialSyncHistory.length + 1,
                    systemName: integration.name,
                    campaignId: campaign.id,
                    campaignName: campaign.name,
                    dataType: mockData.dataType,
                    amount: mockData.amount,
                    timestamp: new Date().toLocaleString('vi-VN'),
                    status: 'success'
                });
                
                syncResults.push({
                    campaign: campaign.name,
                    data: mockData
                });
            }
        });
        
        integration.lastSync = new Date().toLocaleString('vi-VN');
        
        // Show results
        const resultMessage = `✓ Đồng bộ thành công từ ${integration.name}!\n\n` +
            `Số chiến dịch cập nhật: ${updatedCount}\n\n` +
            `Chi tiết:\n` +
            syncResults.slice(0, 3).map(r => 
                `• ${r.campaign}: ${getMetricLabel(r.data.dataType)} +${formatCurrency(r.data.amount)}`
            ).join('\n') +
            (syncResults.length > 3 ? `\n... và ${syncResults.length - 3} chiến dịch khác` : '');
        
        alert(resultMessage);
        
        DATA.addAuditLog('SYNC_FINANCIAL_DATA', `Đồng bộ ${updatedCount} chiến dịch từ ${integration.name}`, 'system');
        openFinancialIntegrationSettings();
    }, 2500);
}

// Generate mock financial data based on integration type
function generateMockFinancialData(integrationType, campaign) {
    const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    if (integrationType === 'google_ads' || integrationType === 'facebook_ads') {
        const cost = random(1000000, 5000000);
        return {
            dataType: 'cost',
            amount: cost,
            cost: cost,
            clicks: random(500, 2000),
            impressions: random(10000, 50000),
            conversions: random(10, 50)
        };
    } else if (integrationType === 'erp' || integrationType === 'accounting') {
        const revenue = random(10000000, 50000000);
        const cost = random(2000000, 8000000);
        return {
            dataType: 'full',
            amount: revenue,
            revenue: revenue,
            cost: cost
        };
    }
    
    return null;
}


// Open campaign mapping modal
function openCampaignMappingModal() {
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px;">Ánh xạ Chiến dịch với Hệ thống Bên ngoài</h3>
            
            <p style="color: #64748b; margin-bottom: 20px;">
                Liên kết chiến dịch trong CRM với ID chiến dịch trong hệ thống ERP/Kế toán/Ads để tự động đồng bộ dữ liệu
            </p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 10px;">Chiến dịch CRM</th>
                            <th style="text-align: left; padding: 10px;">Hệ thống</th>
                            <th style="text-align: left; padding: 10px;">ID Bên ngoài</th>
                            <th style="text-align: left; padding: 10px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DATA.campaigns.filter(c => !c.deleted).map(campaign => {
                            const mapping = DATA.campaignMappings?.find(m => m.campaignId === campaign.id);
                            return `
                                <tr>
                                    <td style="padding: 10px;"><strong>${campaign.name}</strong></td>
                                    <td style="padding: 10px;">
                                        <select id="mappingSystem_${campaign.id}" style="padding: 5px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                                            <option value="">-- Chọn hệ thống --</option>
                                            ${DATA.financialIntegrations.filter(i => i.status === 'active').map(i => `
                                                <option value="${i.id}" ${mapping?.systemId === i.id ? 'selected' : ''}>
                                                    ${i.name}
                                                </option>
                                            `).join('')}
                                        </select>
                                    </td>
                                    <td style="padding: 10px;">
                                        <input type="text" id="mappingExtId_${campaign.id}" 
                                               value="${mapping?.externalId || ''}"
                                               placeholder="VD: CAMP-2024-001"
                                               style="padding: 5px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                                    </td>
                                    <td style="padding: 10px;">
                                        <button class="btn btn-primary" onclick="saveCampaignMapping(${campaign.id})" style="padding: 5px 10px; font-size: 13px;">
                                            <i class="fas fa-save"></i> Lưu
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px;">
                <h4 style="color: #1e40af; margin-bottom: 10px;">
                    <i class="fas fa-lightbulb"></i> Hướng dẫn
                </h4>
                <ul style="color: #1e40af; margin-left: 20px;">
                    <li>Chọn hệ thống bên ngoài đã kích hoạt</li>
                    <li>Nhập ID chiến dịch từ hệ thống đó (VD: CAMP-2024-001, campaign_123)</li>
                    <li>Khi đồng bộ, hệ thống sẽ tự động lấy dữ liệu dựa trên ID này</li>
                    <li>Một chiến dịch có thể ánh xạ với nhiều hệ thống khác nhau</li>
                </ul>
            </div>
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('campaignMappingModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'campaignMappingModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1000px; max-height: 90vh;">
                <div class="modal-header">
                    <h2>Ánh xạ Chiến dịch</h2>
                    <button class="close-btn" onclick="closeModal('campaignMappingModal')">&times;</button>
                </div>
                <div id="campaignMappingContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('campaignMappingContent').innerHTML = modalContent;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

// Save campaign mapping
function saveCampaignMapping(campaignId) {
    const systemId = parseInt(document.getElementById(`mappingSystem_${campaignId}`).value);
    const externalId = document.getElementById(`mappingExtId_${campaignId}`).value.trim();
    
    if (!systemId || !externalId) {
        alert('⚠ Vui lòng chọn hệ thống và nhập ID bên ngoài!');
        return;
    }
    
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    const system = DATA.financialIntegrations.find(i => i.id === systemId);
    
    if (!campaign || !system) return;
    
    // Initialize mappings array if not exists
    if (!DATA.campaignMappings) DATA.campaignMappings = [];
    
    // Check if mapping already exists
    const existingMapping = DATA.campaignMappings.find(m => 
        m.campaignId === campaignId && m.systemId === systemId
    );
    
    if (existingMapping) {
        existingMapping.externalId = externalId;
        existingMapping.updatedAt = new Date().toLocaleString('vi-VN');
    } else {
        DATA.campaignMappings.push({
            id: DATA.campaignMappings.length + 1,
            campaignId: campaignId,
            campaignName: campaign.name,
            systemId: systemId,
            systemName: system.name,
            externalId: externalId,
            createdAt: new Date().toLocaleString('vi-VN'),
            updatedAt: new Date().toLocaleString('vi-VN')
        });
    }
    
    alert(`✓ Đã lưu ánh xạ!\n\nChiến dịch: ${campaign.name}\nHệ thống: ${system.name}\nID: ${externalId}`);
    DATA.addAuditLog('SAVE_CAMPAIGN_MAPPING', `Ánh xạ chiến dịch ${campaign.name} với ${system.name}`, AUTH.getCurrentUser().id);
}

// Auto sync financial data (called periodically)
function autoSyncFinancialData() {
    const activeIntegrations = DATA.financialIntegrations.filter(i => 
        i.status === 'active' && i.autoSync
    );
    
    activeIntegrations.forEach(integration => {
        // Check if it's time to sync based on frequency
        const shouldSync = checkSyncSchedule(integration);
        
        if (shouldSync) {
            console.log(`Auto syncing from ${integration.name}...`);
            syncFinancialData(integration.id);
        }
    });
}

// Check if it's time to sync based on frequency
function checkSyncSchedule(integration) {
    if (!integration.lastSync) return true;
    
    const lastSyncTime = new Date(integration.lastSync);
    const now = new Date();
    const diffHours = (now - lastSyncTime) / (1000 * 60 * 60);
    
    switch (integration.syncFrequency) {
        case 'hourly':
            return diffHours >= 1;
        case 'daily':
            return diffHours >= 24;
        case 'weekly':
            return diffHours >= 168;
        default:
            return false;
    }
}

// Initialize auto sync (call this on page load)
function initAutoSync() {
    // Run auto sync every hour
    setInterval(autoSyncFinancialData, 60 * 60 * 1000);
}


// Sync specific campaign from external system
function syncCampaignFromExternal(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    const mappings = DATA.campaignMappings?.filter(m => m.campaignId === campaignId) || [];
    
    if (mappings.length === 0) {
        alert('⚠ Chiến dịch chưa được ánh xạ với hệ thống bên ngoài!');
        return;
    }
    
    // Show loading
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu cho "${campaign.name}"...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        let totalUpdates = 0;
        const updates = [];
        
        mappings.forEach(mapping => {
            const integration = DATA.financialIntegrations.find(i => i.id === mapping.systemId);
            if (integration && integration.status === 'active') {
                const mockData = generateMockFinancialData(integration.type, campaign);
                
                if (mockData) {
                    if (integration.type === 'google_ads' || integration.type === 'facebook_ads') {
                        campaign.actualSpent = mockData.cost;
                        campaign.clicks = mockData.clicks;
                        campaign.impressions = mockData.impressions;
                        campaign.conversions = mockData.conversions;
                        updates.push(`${integration.name}: Chi phí ${formatCurrency(mockData.cost)}, ${mockData.clicks} clicks`);
                    } else if (integration.type === 'erp' || integration.type === 'accounting') {
                        campaign.revenue = mockData.revenue;
                        campaign.actualSpent = mockData.cost;
                        updates.push(`${integration.name}: Doanh thu ${formatCurrency(mockData.revenue)}, Chi phí ${formatCurrency(mockData.cost)}`);
                    }
                    totalUpdates++;
                }
            }
        });
        
        if (totalUpdates > 0) {
            alert(`✓ Đồng bộ thành công cho "${campaign.name}"!\n\n` +
                  `Đã cập nhật từ ${totalUpdates} hệ thống:\n\n` +
                  updates.join('\n'));
            
            // Refresh the metrics modal if it's open
            if (document.getElementById('metricsModal')?.style.display === 'block') {
                updateCampaignMetrics(campaignId);
            }
        } else {
            alert('⚠ Không thể đồng bộ dữ liệu. Vui lòng kiểm tra cấu hình tích hợp.');
        }
    }, 2000);
}
