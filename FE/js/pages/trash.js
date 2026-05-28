// ============================================
// TRASH PAGE
// ============================================

async function loadTrash() {
    const content = document.getElementById('mainContent');
    if (!content) return;

    // Detect active tab before loading
    const activeTabButton = document.querySelector('.tab-btn.active');
    const activeTab = activeTabButton ? activeTabButton.getAttribute('data-trash-tab') : 'customers';

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';

    if (isApiSession) {
        content.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Thùng rác</h1>
                    <p>Khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa mềm.</p>
                </div>
            </div>
            <div style="text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #3b82f6; margin-bottom: 16px;"></i>
                <p style="color: #64748b;">Đang tải dữ liệu từ thùng rác...</p>
            </div>
        `;
        try {
            const [custRes, campRes] = await Promise.all([
                API_SERVICES.khachHang.trash(),
                API_SERVICES.chienDich.trash()
            ]);
            const customersList = custRes.data || custRes;
            const campaignsList = campRes.data || campRes;

            // Map and store in DATA to stay consistent
            DATA.customers = customersList.map(c => {
                const item = mapBackendCustomerToFrontend(c);
                item.deleted = true; // Mark as deleted so filters catch it
                item.deletedDate = c.ngayXoa ? new Date(c.ngayXoa).toLocaleDateString('vi-VN') : '';
                return item;
            });

            DATA.campaigns = campaignsList.map(c => {
                const item = mapBackendCampaignToFrontend(c);
                item.deleted = true; // Mark as deleted so filters catch it
                item.deletedDate = c.ngayXoa ? new Date(c.ngayXoa).toLocaleDateString('vi-VN') : '';
                return item;
            });
        } catch (error) {
            console.error('Lỗi khi tải thùng rác:', error);
            content.innerHTML = `
                <div class="page-header">
                    <div>
                        <h1>Thùng rác</h1>
                        <p>Khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa mềm.</p>
                    </div>
                </div>
                <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 24px; text-align: center; margin-top: 20px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3 style="color: #991b1b; margin-bottom: 8px;">Không thể kết nối đến hệ thống</h3>
                    <p style="color: #7f1d1d; margin-bottom: 16px;">Đã xảy ra lỗi khi tải thùng rác: ${error.message || 'Lỗi không xác định'}</p>
                    <button class="btn btn-primary" onclick="loadTrash()">Thử lại</button>
                </div>
            `;
            return;
        }
    }

    const deletedCustomers = DATA.customers.filter(customer => customer.deleted);
    const deletedCampaigns = DATA.campaigns.filter(campaign => campaign.deleted);

    content.innerHTML = `
        <div class="page-header">
            <div>
                <h1>Thùng rác</h1>
                <p>Khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa mềm.</p>
            </div>
        </div>

        <div class="tabs">
            <button class="tab-btn active" data-trash-tab="customers" onclick="switchTrashTab('customers', this)">
                Khách hàng (${deletedCustomers.length})
            </button>
            <button class="tab-btn" data-trash-tab="campaigns" onclick="switchTrashTab('campaigns', this)">
                Chiến dịch (${deletedCampaigns.length})
            </button>
        </div>

        <div id="trashCustomersTab" class="tab-content active">
            ${renderTrashCustomers(deletedCustomers)}
        </div>
        <div id="trashCampaignsTab" class="tab-content">
            ${renderTrashCampaigns(deletedCampaigns)}
        </div>
    `;

    // Restore active tab
    if (activeTab && activeTab !== 'customers') {
        const btn = document.querySelector(`[data-trash-tab="${activeTab}"]`);
        if (btn) switchTrashTab(activeTab, btn);
    }
}

function renderTrashCustomers(customers) {
    if (!customers.length) return '<div class="empty-state">Không có khách hàng nào trong thùng rác.</div>';

    return `
        <div class="table-container">
            <div class="table-header">
                <h3>Khách hàng đã xóa</h3>
                <button class="btn-delete" onclick="emptyTrash('customers')">Xóa vĩnh viễn tất cả</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Công ty</th>
                        <th>Ngày xóa</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.map(customer => `
                        <tr>
                            <td><strong>${customer.name}</strong></td>
                            <td>${customer.email || ''}</td>
                            <td>${customer.phone || ''}</td>
                            <td>${customer.company || ''}</td>
                            <td>${customer.deletedDate || ''}</td>
                            <td>
                                <button class="btn-edit" onclick="restoreCustomer(${customer.id})">Khôi phục</button>
                                <button class="btn-delete" onclick="permanentDeleteCustomer(${customer.id})">Xóa hẳn</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderTrashCampaigns(campaigns) {
    if (!campaigns.length) return '<div class="empty-state">Không có chiến dịch nào trong thùng rác.</div>';

    return `
        <div class="table-container">
            <div class="table-header">
                <h3>Chiến dịch đã xóa</h3>
                <button class="btn-delete" onclick="emptyTrash('campaigns')">Xóa vĩnh viễn tất cả</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Loại</th>
                        <th>Thời gian</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${campaigns.map(campaign => `
                        <tr>
                            <td><strong>${campaign.name}</strong></td>
                            <td>${campaign.type || ''}</td>
                            <td>${formatDate(campaign.startDate)} - ${formatDate(campaign.endDate)}</td>
                            <td>${getStatusLabel(campaign.status)}</td>
                            <td>
                                <button class="btn-edit" onclick="restoreCampaign(${campaign.id})">Khôi phục</button>
                                <button class="btn-delete" onclick="permanentDeleteCampaign(${campaign.id})">Xóa hẳn</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function switchTrashTab(tab, button) {
    document.querySelectorAll('[data-trash-tab]').forEach(item => item.classList.remove('active'));
    if (button) button.classList.add('active');

    document.getElementById('trashCustomersTab')?.classList.toggle('active', tab === 'customers');
    document.getElementById('trashCampaignsTab')?.classList.toggle('active', tab === 'campaigns');
}

async function restoreCustomer(customerId) {
    const customer = DATA.customers.find(item => Number(item.id) === Number(customerId));
    if (!customer || !confirm(`Khôi phục khách hàng "${customer.name}"?`)) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        try {
            await API_SERVICES.khachHang.restore(customerId);
            alert('✓ Khôi phục khách hàng thành công!');
        } catch (error) {
            console.error('Lỗi khi khôi phục khách hàng:', error);
            alert('Không thể khôi phục khách hàng: ' + (error.message || 'Lỗi không xác định'));
            return;
        }
    } else {
        customer.deleted = false;
        delete customer.deletedDate;
    }
    DATA.addAuditLog?.('RESTORE_CUSTOMER', `Khôi phục khách hàng: ${customer.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

async function restoreCampaign(campaignId) {
    const campaign = DATA.campaigns.find(item => Number(item.id) === Number(campaignId));
    if (!campaign || !confirm(`Khôi phục chiến dịch "${campaign.name}"?`)) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        try {
            await API_SERVICES.chienDich.restore(campaignId);
            alert('✓ Khôi phục chiến dịch thành công!');
        } catch (error) {
            console.error('Lỗi khi khôi phục chiến dịch:', error);
            alert('Không thể khôi phục chiến dịch: ' + (error.message || 'Lỗi không xác định'));
            return;
        }
    } else {
        campaign.deleted = false;
        delete campaign.deletedDate;
    }
    DATA.addAuditLog?.('RESTORE_CAMPAIGN', `Khôi phục chiến dịch: ${campaign.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

async function permanentDeleteCustomer(customerId) {
    const customer = DATA.customers.find(item => Number(item.id) === Number(customerId));
    if (!customer || !confirm(`Xóa vĩnh viễn khách hàng "${customer.name}"?\nHành động này không thể khôi phục!`)) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        try {
            await API_SERVICES.khachHang.deletePermanently(customerId);
            alert('✓ Xóa vĩnh viễn khách hàng thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa vĩnh viễn khách hàng:', error);
            alert('Không thể xóa vĩnh viễn khách hàng: ' + (error.message || 'Lỗi không xác định'));
            return;
        }
    } else {
        DATA.customers = DATA.customers.filter(item => Number(item.id) !== Number(customerId));
    }
    DATA.addAuditLog?.('PERMANENT_DELETE_CUSTOMER', `Xóa vĩnh viễn khách hàng: ${customer.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

async function permanentDeleteCampaign(campaignId) {
    const campaign = DATA.campaigns.find(item => Number(item.id) === Number(campaignId));
    if (!campaign || !confirm(`Xóa vĩnh viễn chiến dịch "${campaign.name}"?\nHành động này không thể khôi phục!`)) return;

    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';
    if (isApiSession) {
        try {
            await API_SERVICES.chienDich.deletePermanently(campaignId);
            alert('✓ Xóa vĩnh viễn chiến dịch thành công!');
        } catch (error) {
            console.error('Lỗi khi xóa vĩnh viễn chiến dịch:', error);
            alert('Không thể xóa vĩnh viễn chiến dịch: ' + (error.message || 'Lỗi không xác định'));
            return;
        }
    } else {
        DATA.campaigns = DATA.campaigns.filter(item => Number(item.id) !== Number(campaignId));
    }
    DATA.addAuditLog?.('PERMANENT_DELETE_CAMPAIGN', `Xóa vĩnh viễn chiến dịch: ${campaign.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

async function emptyTrash(type) {
    const isApiSession = AUTH.getCurrentUser()?.authSource === 'api';

    if (type === 'customers') {
        const deletedCusts = DATA.customers.filter(item => item.deleted);
        if (!deletedCusts.length) return;
        if (!confirm(`Xóa vĩnh viễn ${deletedCusts.length} khách hàng?\nHành động này không thể khôi phục!`)) return;
        
        if (isApiSession) {
            try {
                // Show loading indicator
                const content = document.getElementById('mainContent');
                if (content) {
                    content.innerHTML = `
                        <div class="page-header">
                            <div>
                                <h1>Thùng rác</h1>
                                <p>Khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa mềm.</p>
                            </div>
                        </div>
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #ef4444; margin-bottom: 16px;"></i>
                            <p style="color: #64748b;">Đang xóa vĩnh viễn tất cả khách hàng...</p>
                        </div>
                    `;
                }
                await Promise.all(deletedCusts.map(cust => API_SERVICES.khachHang.deletePermanently(cust.id)));
                alert('✓ Đã xóa vĩnh viễn tất cả khách hàng thành công!');
            } catch (error) {
                console.error('Lỗi khi xóa vĩnh viễn tất cả khách hàng:', error);
                alert('Lỗi khi xóa vĩnh viễn một số khách hàng: ' + (error.message || 'Lỗi không xác định'));
            }
        } else {
            DATA.customers = DATA.customers.filter(item => !item.deleted);
        }
        DATA.addAuditLog?.('EMPTY_TRASH_CUSTOMERS', `Xóa vĩnh viễn ${deletedCusts.length} khách hàng`, AUTH.getCurrentUser()?.id);
    }

    if (type === 'campaigns') {
        const deletedCamps = DATA.campaigns.filter(item => item.deleted);
        if (!deletedCamps.length) return;
        if (!confirm(`Xóa vĩnh viễn ${deletedCamps.length} chiến dịch?`)) return;

        if (isApiSession) {
            try {
                // Show loading indicator
                const content = document.getElementById('mainContent');
                if (content) {
                    content.innerHTML = `
                        <div class="page-header">
                            <div>
                                <h1>Thùng rác</h1>
                                <p>Khôi phục hoặc xóa vĩnh viễn dữ liệu đã xóa mềm.</p>
                            </div>
                        </div>
                        <div style="text-align: center; padding: 40px;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: #ef4444; margin-bottom: 16px;"></i>
                            <p style="color: #64748b;">Đang xóa vĩnh viễn tất cả chiến dịch...</p>
                        </div>
                    `;
                }
                await Promise.all(deletedCamps.map(camp => API_SERVICES.chienDich.deletePermanently(camp.id)));
                alert('✓ Đã xóa vĩnh viễn tất cả chiến dịch thành công!');
            } catch (error) {
                console.error('Lỗi khi xóa vĩnh viễn tất cả chiến dịch:', error);
                alert('Lỗi khi xóa vĩnh viễn một số chiến dịch: ' + (error.message || 'Lỗi không xác định'));
            }
        } else {
            DATA.campaigns = DATA.campaigns.filter(item => !item.deleted);
        }
        DATA.addAuditLog?.('EMPTY_TRASH_CAMPAIGNS', `Xóa vĩnh viễn ${deletedCamps.length} chiến dịch`, AUTH.getCurrentUser()?.id);
    }

    loadTrash();
}
