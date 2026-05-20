// ============================================
// QUẢN LÝ CHỈ SỐ HIỆU QUẢ CHIẾN DỊCH
// ============================================

// Mở modal cập nhật chỉ số chiến dịch
function updateCampaignMetrics(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    const modalContent = `
        <div style="padding: 20px;">
            <h3 style="margin-bottom: 20px;">Cập nhật Chỉ số: ${campaign.name}</h3>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <strong>Ngân sách:</strong> ${formatCurrency(campaign.budget)}
                    </div>
                    <div>
                        <strong>Trạng thái:</strong> <span class="status ${campaign.status}">${getStatusLabel(campaign.status)}</span>
                    </div>
                    <div>
                        <strong>Thời gian:</strong> ${campaign.startDate} → ${campaign.endDate}
                    </div>
                    <div>
                        <strong>ROI hiện tại:</strong> 
                        <span style="color: ${calculateROI(campaign) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">
                            ${calculateROI(campaign)}%
                        </span>
                    </div>
                </div>
            </div>
            
            <form id="metricsForm" onsubmit="saveCampaignMetrics(event, ${campaignId})">
                <div class="tabs" style="margin-bottom: 20px;">
                    <button type="button" class="tab-btn active" onclick="switchMetricsTab('metrics-financial')">Chi phí & Doanh thu</button>
                    <button type="button" class="tab-btn" onclick="switchMetricsTab('metrics-performance')">Hiệu suất</button>
                    <button type="button" class="tab-btn" onclick="switchMetricsTab('metrics-breakdown')">Chi tiết Chi phí</button>
                </div>

                <!-- Tab Chi phí & Doanh thu -->
                <div id="metrics-financial" class="tab-content active">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="actualSpent">Chi phí Thực tế (VND) *</label>
                            <input type="number" id="actualSpent" value="${campaign.actualSpent || 0}" required min="0" 
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Tổng chi phí đã chi cho chiến dịch</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="revenue">Doanh thu (VND) *</label>
                            <input type="number" id="revenue" value="${campaign.revenue || 0}" required min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Doanh thu từ chiến dịch này</small>
                        </div>
                    </div>
                    
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">Tính toán ROI</h4>
                        <div id="roiCalculation" style="color: #1e40af;">
                            <p><strong>ROI = (Doanh thu - Chi phí) / Chi phí × 100%</strong></p>
                            <p id="roiResult" style="font-size: 24px; font-weight: 600; margin-top: 10px;">-</p>
                        </div>
                    </div>
                </div>
                
                <!-- Tab Hiệu suất -->
                <div id="metrics-performance" class="tab-content">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="form-group">
                            <label for="leads">Số Leads *</label>
                            <input type="number" id="leads" value="${campaign.leads || 0}" required min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Tổng số lead thu được</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="conversions">Số Conversions *</label>
                            <input type="number" id="conversions" value="${campaign.conversions || 0}" required min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Số lead chuyển đổi thành công</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="clicks">Số Clicks</label>
                            <input type="number" id="clicks" value="${campaign.clicks || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Tổng số lượt click vào quảng cáo</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="impressions">Số Impressions</label>
                            <input type="number" id="impressions" value="${campaign.impressions || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Tổng số lượt hiển thị</small>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h4 style="color: #92400e; margin-bottom: 10px;">Tính toán Conversion Rate</h4>
                        <div id="conversionCalculation" style="color: #92400e;">
                            <p><strong>Conversion Rate = Conversions / Leads × 100%</strong></p>
                            <p id="conversionResult" style="font-size: 24px; font-weight: 600; margin-top: 10px;">-</p>
                        </div>
                    </div>
                </div>

                <!-- Tab Chi tiết Chi phí -->
                <div id="metrics-breakdown" class="tab-content">
                    <p style="color: #64748b; margin-bottom: 15px;">Phân tích chi tiết các khoản chi phí của chiến dịch</p>
                    
                    <div style="display: grid; gap: 15px;">
                        <div class="form-group">
                            <label for="costAdvertising">Chi phí Quảng cáo (VND)</label>
                            <input type="number" id="costAdvertising" value="${campaign.costBreakdown?.advertising || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Facebook Ads, Google Ads, v.v.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="costContent">Chi phí Nội dung (VND)</label>
                            <input type="number" id="costContent" value="${campaign.costBreakdown?.content || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Thiết kế, copywriting, video, v.v.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="costTools">Chi phí Công cụ (VND)</label>
                            <input type="number" id="costTools" value="${campaign.costBreakdown?.tools || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Phần mềm, tools marketing, v.v.</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="costOther">Chi phí Khác (VND)</label>
                            <input type="number" id="costOther" value="${campaign.costBreakdown?.other || 0}" min="0"
                                   style="padding: 10px; border: 1px solid #e2e8f0; border-radius: 5px; width: 100%;">
                            <small style="color: #64748b;">Các chi phí khác</small>
                        </div>
                    </div>
                    
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h4 style="margin-bottom: 10px;">Tổng Chi phí Chi tiết</h4>
                        <p id="totalBreakdown" style="font-size: 20px; font-weight: 600; color: #0f172a;">-</p>
                        <small style="color: #64748b;">Nên bằng với "Chi phí Thực tế" ở tab đầu tiên</small>
                    </div>
                </div>
                
                <div class="form-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <button type="button" class="btn btn-secondary" onclick="closeModal('metricsModal')">Hủy</button>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Lưu Chỉ số
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('metricsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'metricsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 900px; max-height: 90vh;">
                <div class="modal-header">
                    <h2>Cập nhật Chỉ số Chiến dịch</h2>
                    <button class="close-btn" onclick="closeModal('metricsModal')">&times;</button>
                </div>
                <div id="metricsModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('metricsModalContent').innerHTML = modalContent;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Add event listeners for real-time calculation
    setupMetricsCalculation();
}


// Setup real-time calculation
function setupMetricsCalculation() {
    const actualSpentInput = document.getElementById('actualSpent');
    const revenueInput = document.getElementById('revenue');
    const leadsInput = document.getElementById('leads');
    const conversionsInput = document.getElementById('conversions');
    
    // Cost breakdown inputs
    const costInputs = [
        document.getElementById('costAdvertising'),
        document.getElementById('costContent'),
        document.getElementById('costTools'),
        document.getElementById('costOther')
    ];
    
    // Calculate ROI
    function updateROI() {
        const spent = parseFloat(actualSpentInput.value) || 0;
        const revenue = parseFloat(revenueInput.value) || 0;
        
        if (spent > 0) {
            const roi = ((revenue - spent) / spent * 100).toFixed(1);
            const roiColor = roi >= 0 ? '#10b981' : '#ef4444';
            document.getElementById('roiResult').innerHTML = `
                <span style="color: ${roiColor};">${roi}%</span>
                <br><small style="font-size: 14px;">Lợi nhuận: ${formatCurrency(revenue - spent)}</small>
            `;
        } else {
            document.getElementById('roiResult').textContent = 'Chưa có dữ liệu';
        }
    }
    
    // Calculate Conversion Rate
    function updateConversionRate() {
        const leads = parseFloat(leadsInput.value) || 0;
        const conversions = parseFloat(conversionsInput.value) || 0;
        
        if (leads > 0) {
            const rate = ((conversions / leads) * 100).toFixed(1);
            const rateColor = rate >= 15 ? '#10b981' : rate >= 10 ? '#f59e0b' : '#ef4444';
            document.getElementById('conversionResult').innerHTML = `
                <span style="color: ${rateColor};">${rate}%</span>
                <br><small style="font-size: 14px;">${conversions} / ${leads} leads</small>
            `;
        } else {
            document.getElementById('conversionResult').textContent = 'Chưa có dữ liệu';
        }
    }
    
    // Calculate total breakdown
    function updateBreakdown() {
        let total = 0;
        costInputs.forEach(input => {
            if (input) total += parseFloat(input.value) || 0;
        });
        
        const actualSpent = parseFloat(actualSpentInput.value) || 0;
        const diff = total - actualSpent;
        const diffColor = Math.abs(diff) < 1000 ? '#10b981' : '#f59e0b';
        
        document.getElementById('totalBreakdown').innerHTML = `
            ${formatCurrency(total)}
            ${diff !== 0 ? `<br><small style="color: ${diffColor}; font-size: 14px;">
                ${diff > 0 ? '+' : ''}${formatCurrency(diff)} so với chi phí thực tế
            </small>` : ''}
        `;
    }
    
    // Add event listeners
    if (actualSpentInput && revenueInput) {
        actualSpentInput.addEventListener('input', () => {
            updateROI();
            updateBreakdown();
        });
        revenueInput.addEventListener('input', updateROI);
    }
    
    if (leadsInput && conversionsInput) {
        leadsInput.addEventListener('input', updateConversionRate);
        conversionsInput.addEventListener('input', updateConversionRate);
    }
    
    costInputs.forEach(input => {
        if (input) input.addEventListener('input', updateBreakdown);
    });
    
    // Initial calculation
    updateROI();
    updateConversionRate();
    updateBreakdown();
}

// Switch between metrics tabs
function switchMetricsTab(tabName) {
    const tabs = document.querySelectorAll('#metricsForm .tab-content');
    const buttons = document.querySelectorAll('#metricsForm .tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}


// Save campaign metrics
function saveCampaignMetrics(event, campaignId) {
    event.preventDefault();
    
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Get values
    const actualSpent = parseFloat(document.getElementById('actualSpent').value) || 0;
    const revenue = parseFloat(document.getElementById('revenue').value) || 0;
    const leads = parseInt(document.getElementById('leads').value) || 0;
    const conversions = parseInt(document.getElementById('conversions').value) || 0;
    const clicks = parseInt(document.getElementById('clicks').value) || 0;
    const impressions = parseInt(document.getElementById('impressions').value) || 0;
    
    // Validate
    if (conversions > leads) {
        alert('⚠ Số conversions không thể lớn hơn số leads!');
        return;
    }
    
    if (actualSpent > campaign.budget * 1.5) {
        if (!confirm(`⚠ Chi phí thực tế (${formatCurrency(actualSpent)}) vượt quá 150% ngân sách (${formatCurrency(campaign.budget)}).\n\nBạn có chắc chắn muốn lưu?`)) {
            return;
        }
    }
    
    // Save old values for history
    const oldMetrics = {
        actualSpent: campaign.actualSpent || 0,
        revenue: campaign.revenue || 0,
        leads: campaign.leads || 0,
        conversions: campaign.conversions || 0
    };
    
    // Update campaign
    campaign.actualSpent = actualSpent;
    campaign.revenue = revenue;
    campaign.leads = leads;
    campaign.conversions = conversions;
    campaign.clicks = clicks;
    campaign.impressions = impressions;
    
    // Update cost breakdown
    if (!campaign.costBreakdown) campaign.costBreakdown = {};
    campaign.costBreakdown.advertising = parseFloat(document.getElementById('costAdvertising').value) || 0;
    campaign.costBreakdown.content = parseFloat(document.getElementById('costContent').value) || 0;
    campaign.costBreakdown.tools = parseFloat(document.getElementById('costTools').value) || 0;
    campaign.costBreakdown.other = parseFloat(document.getElementById('costOther').value) || 0;
    
    // Save to history
    DATA.campaignMetricsHistory.push({
        id: DATA.campaignMetricsHistory.length + 1,
        campaignId: campaignId,
        campaignName: campaign.name,
        timestamp: new Date().toLocaleString('vi-VN'),
        updatedBy: AUTH.getCurrentUser().name,
        oldMetrics: oldMetrics,
        newMetrics: {
            actualSpent: actualSpent,
            revenue: revenue,
            leads: leads,
            conversions: conversions
        }
    });
    
    // Calculate metrics
    const roi = actualSpent > 0 ? ((revenue - actualSpent) / actualSpent * 100).toFixed(1) : 0;
    const conversionRate = leads > 0 ? ((conversions / leads) * 100).toFixed(1) : 0;
    
    alert(`✓ Đã cập nhật chỉ số cho chiến dịch "${campaign.name}"!\n\nROI: ${roi}%\nConversion Rate: ${conversionRate}%`);
    
    DATA.addAuditLog('UPDATE_CAMPAIGN_METRICS', `Cập nhật chỉ số chiến dịch ${campaign.name}`, AUTH.getCurrentUser().id);
    
    closeModal('metricsModal');
    loadCampaigns();
}

// Calculate ROI for a campaign
function calculateROI(campaign) {
    const spent = campaign.actualSpent || 0;
    const revenue = campaign.revenue || 0;
    
    if (spent === 0) return 0;
    return ((revenue - spent) / spent * 100).toFixed(1);
}

// Calculate Conversion Rate
function calculateConversionRate(campaign) {
    const leads = campaign.leads || 0;
    const conversions = campaign.conversions || 0;
    
    if (leads === 0) return 0;
    return ((conversions / leads) * 100).toFixed(1);
}


// View detailed campaign analytics
function viewCampaignAnalytics(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    if (!campaign) return;
    
    // Calculate all metrics
    const actualSpent = campaign.actualSpent || 0;
    const revenue = campaign.revenue || 0;
    const profit = revenue - actualSpent;
    const roi = calculateROI(campaign);
    const leads = campaign.leads || 0;
    const conversions = campaign.conversions || 0;
    const conversionRate = calculateConversionRate(campaign);
    const clicks = campaign.clicks || 0;
    const impressions = campaign.impressions || 0;
    const cpc = clicks > 0 ? (actualSpent / clicks) : 0;
    const cpl = leads > 0 ? (actualSpent / leads) : 0;
    const cpa = conversions > 0 ? (actualSpent / conversions) : 0; // Cost per acquisition
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0; // Click-through rate
    
    const modalContent = `
        <div style="padding: 20px; max-height: calc(90vh - 120px); overflow-y: auto;">
            <h3 style="margin-bottom: 20px;">Phân tích Chi tiết: ${campaign.name}</h3>
            
            <!-- Tổng quan -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; color: white; margin-bottom: 25px;">
                <h4 style="margin-bottom: 15px; opacity: 0.9;">Tổng quan Hiệu quả</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div>
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">ROI</div>
                        <div style="font-size: 32px; font-weight: 700;">${roi}%</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Conversion Rate</div>
                        <div style="font-size: 32px; font-weight: 700;">${conversionRate}%</div>
                    </div>
                    <div>
                        <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Lợi nhuận</div>
                        <div style="font-size: 32px; font-weight: 700;">${profit >= 0 ? '+' : ''}${formatCurrency(profit)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Chi phí & Doanh thu -->
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">💰 Chi phí & Doanh thu</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 14px; margin-bottom: 5px;">Ngân sách</div>
                        <div style="font-size: 24px; font-weight: 600; color: #0f172a;">${formatCurrency(campaign.budget)}</div>
                    </div>
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px;">
                        <div style="color: #92400e; font-size: 14px; margin-bottom: 5px;">Chi phí Thực tế</div>
                        <div style="font-size: 24px; font-weight: 600; color: #92400e;">${formatCurrency(actualSpent)}</div>
                        <small style="color: #92400e;">${((actualSpent / campaign.budget) * 100).toFixed(1)}% ngân sách</small>
                    </div>
                    <div style="background: #dcfce7; padding: 15px; border-radius: 8px;">
                        <div style="color: #166534; font-size: 14px; margin-bottom: 5px;">Doanh thu</div>
                        <div style="font-size: 24px; font-weight: 600; color: #166534;">${formatCurrency(revenue)}</div>
                    </div>
                    <div style="background: ${profit >= 0 ? '#dcfce7' : '#fee2e2'}; padding: 15px; border-radius: 8px;">
                        <div style="color: ${profit >= 0 ? '#166534' : '#991b1b'}; font-size: 14px; margin-bottom: 5px;">Lợi nhuận</div>
                        <div style="font-size: 24px; font-weight: 600; color: ${profit >= 0 ? '#166534' : '#991b1b'};">${profit >= 0 ? '+' : ''}${formatCurrency(profit)}</div>
                    </div>
                </div>
            </div>
            
            <!-- Chi tiết Chi phí -->
            ${campaign.costBreakdown ? `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">📊 Phân bổ Chi phí</h4>
                <div style="display: grid; gap: 10px;">
                    ${Object.entries(campaign.costBreakdown).map(([key, value]) => {
                        const labels = {
                            advertising: 'Quảng cáo',
                            content: 'Nội dung',
                            tools: 'Công cụ',
                            other: 'Khác'
                        };
                        const percentage = actualSpent > 0 ? ((value / actualSpent) * 100).toFixed(1) : 0;
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                <div>
                                    <strong>${labels[key] || key}</strong>
                                    <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 5px;">
                                        <div style="width: ${percentage}%; height: 100%; background: #3b82f6; border-radius: 4px;"></div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: 600;">${formatCurrency(value)}</div>
                                    <small style="color: #64748b;">${percentage}%</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Hiệu suất -->
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">📈 Hiệu suất Chiến dịch</h4>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Impressions</div>
                        <div style="font-size: 22px; font-weight: 600; color: #0f172a;">${impressions.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Clicks</div>
                        <div style="font-size: 22px; font-weight: 600; color: #0f172a;">${clicks.toLocaleString()}</div>
                        <small style="color: #64748b;">CTR: ${ctr}%</small>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Leads</div>
                        <div style="font-size: 22px; font-weight: 600; color: #0f172a;">${leads.toLocaleString()}</div>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px;">
                        <div style="color: #64748b; font-size: 13px; margin-bottom: 5px;">Conversions</div>
                        <div style="font-size: 22px; font-weight: 600; color: #10b981;">${conversions.toLocaleString()}</div>
                    </div>
                </div>
            </div>
            
            <!-- Chỉ số Chi phí -->
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">💵 Chỉ số Chi phí</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                    <div style="text-align: center; padding: 15px; background: #dbeafe; border-radius: 8px;">
                        <div style="color: #1e40af; font-size: 13px; margin-bottom: 5px;">CPC</div>
                        <div style="font-size: 20px; font-weight: 600; color: #1e40af;">${formatCurrency(cpc)}</div>
                        <small style="color: #1e40af;">Cost Per Click</small>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px;">
                        <div style="color: #92400e; font-size: 13px; margin-bottom: 5px;">CPL</div>
                        <div style="font-size: 20px; font-weight: 600; color: #92400e;">${formatCurrency(cpl)}</div>
                        <small style="color: #92400e;">Cost Per Lead</small>
                    </div>
                    <div style="text-align: center; padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <div style="color: #166534; font-size: 13px; margin-bottom: 5px;">CPA</div>
                        <div style="font-size: 20px; font-weight: 600; color: #166534;">${formatCurrency(cpa)}</div>
                        <small style="color: #166534;">Cost Per Acquisition</small>
                    </div>
                </div>
            </div>
            
            <!-- Đánh giá -->
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">🎯 Đánh giá & Khuyến nghị</h4>
                <div style="display: grid; gap: 10px;">
                    ${generateRecommendations(campaign, roi, conversionRate, cpl, cpa)}
                </div>
            </div>
            
            ${DATA.campaignMetricsHistory.filter(h => h.campaignId === campaignId).length > 0 ? `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
                <h4 style="margin-bottom: 15px; color: #0f172a;">📜 Lịch sử Cập nhật</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${DATA.campaignMetricsHistory
                        .filter(h => h.campaignId === campaignId)
                        .reverse()
                        .slice(0, 5)
                        .map(h => `
                            <div style="padding: 10px; background: #f8fafc; border-radius: 5px; margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <strong>${h.updatedBy}</strong>
                                    <small style="color: #64748b;">${h.timestamp}</small>
                                </div>
                                <small style="color: #64748b;">
                                    Chi phí: ${formatCurrency(h.oldMetrics.actualSpent)} → ${formatCurrency(h.newMetrics.actualSpent)} |
                                    Doanh thu: ${formatCurrency(h.oldMetrics.revenue)} → ${formatCurrency(h.newMetrics.revenue)}
                                </small>
                            </div>
                        `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    
    // Create or update modal
    let modal = document.getElementById('analyticsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'analyticsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 1100px; max-height: 95vh;">
                <div class="modal-header">
                    <h2>Phân tích Chiến dịch</h2>
                    <button class="close-btn" onclick="closeModal('analyticsModal')">&times;</button>
                </div>
                <div id="analyticsModalContent"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('analyticsModalContent').innerHTML = modalContent;
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

// Generate recommendations based on metrics
function generateRecommendations(campaign, roi, conversionRate, cpl, cpa) {
    const recommendations = [];
    
    // ROI recommendations
    if (roi < 0) {
        recommendations.push({
            type: 'danger',
            icon: '⚠️',
            title: 'ROI âm',
            message: 'Chiến dịch đang thua lỗ. Cần xem xét lại chiến lược hoặc tạm dừng chiến dịch.'
        });
    } else if (roi < 50) {
        recommendations.push({
            type: 'warning',
            icon: '⚡',
            title: 'ROI thấp',
            message: 'ROI dưới 50%. Nên tối ưu targeting, nội dung quảng cáo hoặc giảm chi phí.'
        });
    } else if (roi >= 100) {
        recommendations.push({
            type: 'success',
            icon: '🎉',
            title: 'ROI xuất sắc',
            message: 'Chiến dịch rất hiệu quả! Có thể tăng ngân sách để scale up.'
        });
    }
    
    // Conversion rate recommendations
    if (conversionRate < 5) {
        recommendations.push({
            type: 'danger',
            icon: '📉',
            title: 'Conversion rate rất thấp',
            message: 'Dưới 5%. Cần cải thiện landing page, CTA hoặc chất lượng lead.'
        });
    } else if (conversionRate < 10) {
        recommendations.push({
            type: 'warning',
            icon: '📊',
            title: 'Conversion rate cần cải thiện',
            message: 'Từ 5-10%. Tối ưu quy trình chuyển đổi và nurturing leads.'
        });
    } else if (conversionRate >= 20) {
        recommendations.push({
            type: 'success',
            icon: '🚀',
            title: 'Conversion rate tuyệt vời',
            message: 'Trên 20%! Chiến dịch đang chuyển đổi rất tốt.'
        });
    }
    
    // Budget recommendations
    const budgetUsage = (campaign.actualSpent / campaign.budget) * 100;
    if (budgetUsage > 100) {
        recommendations.push({
            type: 'danger',
            icon: '💸',
            title: 'Vượt ngân sách',
            message: `Đã chi ${budgetUsage.toFixed(0)}% ngân sách. Cần kiểm soát chi phí.`
        });
    } else if (budgetUsage > 80) {
        recommendations.push({
            type: 'warning',
            icon: '💰',
            title: 'Gần hết ngân sách',
            message: `Đã sử dụng ${budgetUsage.toFixed(0)}% ngân sách. Cân nhắc tăng ngân sách nếu hiệu quả tốt.`
        });
    }
    
    // CPL recommendations
    const avgCPL = 100000; // Average CPL benchmark
    if (cpl > avgCPL * 2) {
        recommendations.push({
            type: 'warning',
            icon: '💵',
            title: 'CPL cao',
            message: `CPL ${formatCurrency(cpl)} cao hơn trung bình. Tối ưu targeting và creative.`
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            icon: '✅',
            title: 'Chiến dịch ổn định',
            message: 'Các chỉ số đang ở mức tốt. Tiếp tục theo dõi và tối ưu.'
        });
    }
    
    return recommendations.map(rec => {
        const colors = {
            success: { bg: '#dcfce7', text: '#166534', border: '#10b981' },
            warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
            danger: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' }
        };
        const color = colors[rec.type];
        
        return `
            <div style="padding: 15px; background: ${color.bg}; border-left: 4px solid ${color.border}; border-radius: 5px;">
                <div style="display: flex; align-items: start; gap: 10px;">
                    <span style="font-size: 24px;">${rec.icon}</span>
                    <div>
                        <strong style="color: ${color.text}; display: block; margin-bottom: 5px;">${rec.title}</strong>
                        <p style="color: ${color.text}; margin: 0;">${rec.message}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// View campaign detail (simple view)
// DEPRECATED: Hàm này đã được thay thế bởi viewCampaignDetail trong script.js
// function viewCampaignDetail(campaignId) {
//     viewCampaignAnalytics(campaignId);
// }

