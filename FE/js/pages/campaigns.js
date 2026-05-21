// ============================================
// CAMPAIGNS PAGE
// ============================================

function getCampaigns() {
    return (DATA.campaigns || []).filter(campaign => !campaign.deleted);
}

function getCampaignManagerName(managerId) {
    if (!managerId) return 'Chưa phân công';
    const manager = (AUTH.users || []).find(user => Number(user.id) === Number(managerId));
    return manager ? manager.name : 'Chưa phân công';
}

function getCampaignMetric(campaign) {
    const spent = Number(campaign.actualSpent || 0);
    const revenue = Number(campaign.revenue || 0);
    const budget = Number(campaign.budget || 0);
    const clicks = Number(campaign.clicks || 0);
    const leads = Number(campaign.leads || 0);
    const conversions = Number(campaign.conversions || 0);
    const impressions = Number(campaign.impressions || 0);

    return {
        spent,
        revenue,
        budgetUsage: budget > 0 ? Math.round((spent / budget) * 100) : 0,
        roi: spent > 0 ? Math.round(((revenue - spent) / spent) * 100) : 0,
        conversionRate: leads > 0 ? ((conversions / leads) * 100).toFixed(1) : '0.0',
        clickRate: impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : '0.0'
    };
}

function loadCampaigns() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const user = AUTH.getCurrentUser();
    const campaigns = getCampaigns();
    const canManage = user && (user.role === 'manager' || user.role === 'admin');
    const totalBudget = campaigns.reduce((sum, campaign) => sum + Number(campaign.budget || 0), 0);
    const totalSpent = campaigns.reduce((sum, campaign) => sum + Number(campaign.actualSpent || 0), 0);
    const totalRevenue = campaigns.reduce((sum, campaign) => sum + Number(campaign.revenue || 0), 0);

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Chiến dịch</h1>
                <p>Quản lý danh sách chiến dịch và theo dõi hiệu quả cơ bản.</p>
            </div>
            ${canManage ? '<button class="btn btn-primary" onclick="openCampaignModal()"><i class="fas fa-plus"></i> Thêm chiến dịch</button>' : ''}
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-bullhorn"></i></div>
                <div class="stat-info">
                    <h3>${campaigns.length}</h3>
                    <p>Tổng chiến dịch</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-play"></i></div>
                <div class="stat-info">
                    <h3>${campaigns.filter(c => c.status === 'active').length}</h3>
                    <p>Đang chạy</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(totalBudget)}</h3>
                    <p>Tổng ngân sách</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(totalRevenue - totalSpent)}</h3>
                    <p>Lợi nhuận ước tính</p>
                </div>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" onclick="switchTab('campaignListTab')">Danh sách</button>
            <button class="tab-btn" onclick="switchTab('campaignPerformanceTab')">Hiệu quả</button>
        </div>

        <div id="campaignListTab" class="tab-content active">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tên chiến dịch</th>
                            <th>Loại</th>
                            <th>Thời gian</th>
                            <th>Ngân sách</th>
                            <th>Quản lý</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaigns.map(campaign => `
                            <tr>
                                <td>
                                    <strong>${campaign.name || 'Chưa có tên'}</strong>
                                    <small>${campaign.description || ''}</small>
                                </td>
                                <td>${campaign.type || 'Khác'}</td>
                                <td>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</td>
                                <td>${formatCurrency(campaign.budget || 0)}</td>
                                <td>${getCampaignManagerName(campaign.managerId)}</td>
                                <td><span class="status-badge ${campaign.status}">${getStatusLabel(campaign.status)}</span></td>
                                <td>
                                    <button class="btn-icon" title="Xem chi tiết" onclick="viewCampaignDetail(${campaign.id})">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${canManage ? `
                                        <button class="btn-icon" title="Sửa" onclick="editCampaign(${campaign.id})">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-icon danger" title="Xóa" onclick="deleteCampaign(${campaign.id})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="campaignPerformanceTab" class="tab-content">
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Chiến dịch</th>
                            <th>Đã chi</th>
                            <th>Doanh thu</th>
                            <th>ROI</th>
                            <th>Tỷ lệ chuyển đổi</th>
                            <th>CTR</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${campaigns.map(campaign => {
                            const metric = getCampaignMetric(campaign);
                            return `
                                <tr>
                                    <td><strong>${campaign.name || 'Chưa có tên'}</strong></td>
                                    <td>${formatCurrency(metric.spent)}</td>
                                    <td>${formatCurrency(metric.revenue)}</td>
                                    <td><span class="${metric.roi >= 0 ? 'text-success' : 'text-danger'}">${metric.roi}%</span></td>
                                    <td>${metric.conversionRate}%</td>
                                    <td>${metric.clickRate}%</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function openCampaignModal() {
    const modal = document.getElementById('campaignModal');
    const form = document.getElementById('campaignForm');
    if (!modal || !form) return;

    form.reset();
    delete modal.dataset.campaignId;

    const title = document.getElementById('campaignModalTitle');
    if (title) title.textContent = 'Thêm Chiến dịch';

    loadEmployeeDropdown('campaignManager', true);

    const status = document.getElementById('campaignStatus');
    if (status) status.value = 'planning';

    modal.style.display = 'block';
    document.body.classList.add('modal-open');
}

function editCampaign(id) {
    const campaign = getCampaigns().find(item => Number(item.id) === Number(id));
    if (!campaign) {
        alert('Không tìm thấy chiến dịch.');
        return;
    }

    openCampaignModal();

    const modal = document.getElementById('campaignModal');
    const title = document.getElementById('campaignModalTitle');
    if (modal) modal.dataset.campaignId = campaign.id;
    if (title) title.textContent = 'Cập nhật Chiến dịch';

    const fields = {
        campaignName: campaign.name,
        campaignDescription: campaign.description,
        campaignType: campaign.type,
        campaignManager: campaign.managerId,
        campaignStartDate: campaign.startDate,
        campaignEndDate: campaign.endDate,
        campaignBudget: campaign.budget,
        campaignStatus: campaign.status
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) field.value = value || '';
    });
}

function saveCampaign(e) {
    if (e) e.preventDefault();

    const modal = document.getElementById('campaignModal');
    const campaignId = modal ? modal.dataset.campaignId : null;
    const today = new Date().toISOString().split('T')[0];
    const payload = {
        name: document.getElementById('campaignName')?.value.trim(),
        description: document.getElementById('campaignDescription')?.value.trim(),
        type: document.getElementById('campaignType')?.value,
        managerId: Number(document.getElementById('campaignManager')?.value) || null,
        startDate: document.getElementById('campaignStartDate')?.value,
        endDate: document.getElementById('campaignEndDate')?.value,
        budget: Number(document.getElementById('campaignBudget')?.value || 0),
        status: document.getElementById('campaignStatus')?.value || 'planning',
        updatedDate: today
    };

    if (!payload.name || !payload.type || !payload.startDate || !payload.endDate || payload.budget < 0) {
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc.');
        return;
    }

    if (payload.endDate < payload.startDate) {
        alert('Ngày kết thúc phải sau ngày bắt đầu.');
        return;
    }

    if (campaignId) {
        const campaign = DATA.campaigns.find(item => Number(item.id) === Number(campaignId));
        if (campaign) Object.assign(campaign, payload);
        DATA.addAuditLog?.('campaign_update', `Cập nhật chiến dịch: ${payload.name}`);
    } else {
        const nextId = Math.max(0, ...DATA.campaigns.map(item => Number(item.id) || 0)) + 1;
        DATA.campaigns.push({
            id: nextId,
            ...payload,
            createdDate: today,
            deleted: false,
            actualSpent: 0,
            revenue: 0,
            leads: 0,
            conversions: 0,
            clicks: 0,
            impressions: 0,
            costBreakdown: {
                advertising: 0,
                content: 0,
                tools: 0,
                other: 0
            }
        });
        DATA.addAuditLog?.('campaign_create', `Tạo chiến dịch: ${payload.name}`);
    }

    closeModal('campaignModal');
    loadCampaigns();
}

function viewCampaign(id) {
    viewCampaignDetail(id);
}

function viewCampaignDetail(id) {
    const content = document.getElementById('mainContent');
    const campaign = getCampaigns().find(item => Number(item.id) === Number(id));
    if (!content || !campaign) {
        alert('Không tìm thấy chiến dịch.');
        return;
    }

    const metric = getCampaignMetric(campaign);

    content.innerHTML = `
        <div class="page-header">
            <div>
                <button class="btn btn-secondary" onclick="loadCampaigns()">
                    <i class="fas fa-arrow-left"></i> Quay lại
                </button>
                <h1>${campaign.name || 'Chiến dịch'}</h1>
                <p>${campaign.description || 'Chưa có mô tả'}</p>
            </div>
            <button class="btn btn-primary" onclick="editCampaign(${campaign.id})">
                <i class="fas fa-edit"></i> Cập nhật
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(campaign.budget || 0)}</h3>
                    <p>Ngân sách</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-coins"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(metric.spent)}</h3>
                    <p>Đã chi (${metric.budgetUsage}%)</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
                <div class="stat-info">
                    <h3>${metric.roi}%</h3>
                    <p>ROI</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-user-check"></i></div>
                <div class="stat-info">
                    <h3>${metric.conversionRate}%</h3>
                    <p>Tỷ lệ chuyển đổi</p>
                </div>
            </div>
        </div>

        <div class="detail-grid">
            <div class="detail-card">
                <h3>Thông tin chiến dịch</h3>
                <div class="detail-row"><span>Loại</span><strong>${campaign.type || 'Khác'}</strong></div>
                <div class="detail-row"><span>Quản lý</span><strong>${getCampaignManagerName(campaign.managerId)}</strong></div>
                <div class="detail-row"><span>Thời gian</span><strong>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</strong></div>
                <div class="detail-row"><span>Trạng thái</span><strong>${getStatusLabel(campaign.status)}</strong></div>
                <div class="detail-row"><span>Ngày tạo</span><strong>${formatDate(campaign.createdDate)}</strong></div>
                <div class="detail-row"><span>Cập nhật</span><strong>${formatDate(campaign.updatedDate)}</strong></div>
            </div>
            <div class="detail-card">
                <h3>Chỉ số</h3>
                <div class="detail-row"><span>Hiển thị</span><strong>${campaign.impressions || 0}</strong></div>
                <div class="detail-row"><span>Lượt nhấp</span><strong>${campaign.clicks || 0}</strong></div>
                <div class="detail-row"><span>Lead</span><strong>${campaign.leads || 0}</strong></div>
                <div class="detail-row"><span>Chuyển đổi</span><strong>${campaign.conversions || 0}</strong></div>
                <div class="detail-row"><span>Doanh thu</span><strong>${formatCurrency(metric.revenue)}</strong></div>
                <div class="detail-row"><span>CTR</span><strong>${metric.clickRate}%</strong></div>
            </div>
        </div>
    `;
}

function viewCampaignAnalytics(id) {
    viewCampaignDetail(id);
}

function deleteCampaign(id) {
    if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;

    const campaign = DATA.campaigns.find(item => Number(item.id) === Number(id));
    if (!campaign) {
        alert('Không tìm thấy chiến dịch.');
        return;
    }

    campaign.deleted = true;
    campaign.updatedDate = new Date().toISOString().split('T')[0];
    DATA.addAuditLog?.('campaign_delete', `Xóa chiến dịch: ${campaign.name}`);
    loadCampaigns();
}
