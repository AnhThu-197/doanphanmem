// ============================================
// TRASH PAGE
// ============================================

function loadTrash() {
    const content = document.getElementById('mainContent');
    if (!content) return;

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

function restoreCustomer(customerId) {
    const customer = DATA.customers.find(item => Number(item.id) === Number(customerId));
    if (!customer || !confirm(`Khôi phục khách hàng "${customer.name}"?`)) return;

    customer.deleted = false;
    delete customer.deletedDate;
    DATA.addAuditLog?.('RESTORE_CUSTOMER', `Khôi phục khách hàng: ${customer.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

function restoreCampaign(campaignId) {
    const campaign = DATA.campaigns.find(item => Number(item.id) === Number(campaignId));
    if (!campaign || !confirm(`Khôi phục chiến dịch "${campaign.name}"?`)) return;

    campaign.deleted = false;
    delete campaign.deletedDate;
    DATA.addAuditLog?.('RESTORE_CAMPAIGN', `Khôi phục chiến dịch: ${campaign.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

function permanentDeleteCustomer(customerId) {
    const customer = DATA.customers.find(item => Number(item.id) === Number(customerId));
    if (!customer || !confirm(`Xóa vĩnh viễn khách hàng "${customer.name}"?`)) return;

    DATA.customers = DATA.customers.filter(item => Number(item.id) !== Number(customerId));
    DATA.addAuditLog?.('PERMANENT_DELETE_CUSTOMER', `Xóa vĩnh viễn khách hàng: ${customer.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

function permanentDeleteCampaign(campaignId) {
    const campaign = DATA.campaigns.find(item => Number(item.id) === Number(campaignId));
    if (!campaign || !confirm(`Xóa vĩnh viễn chiến dịch "${campaign.name}"?`)) return;

    DATA.campaigns = DATA.campaigns.filter(item => Number(item.id) !== Number(campaignId));
    DATA.addAuditLog?.('PERMANENT_DELETE_CAMPAIGN', `Xóa vĩnh viễn chiến dịch: ${campaign.name}`, AUTH.getCurrentUser()?.id);
    loadTrash();
}

function emptyTrash(type) {
    if (type === 'customers') {
        const count = DATA.customers.filter(item => item.deleted).length;
        if (!count || !confirm(`Xóa vĩnh viễn ${count} khách hàng?`)) return;

        DATA.customers = DATA.customers.filter(item => !item.deleted);
        DATA.addAuditLog?.('EMPTY_TRASH_CUSTOMERS', `Xóa vĩnh viễn ${count} khách hàng`, AUTH.getCurrentUser()?.id);
    }

    if (type === 'campaigns') {
        const count = DATA.campaigns.filter(item => item.deleted).length;
        if (!count || !confirm(`Xóa vĩnh viễn ${count} chiến dịch?`)) return;

        DATA.campaigns = DATA.campaigns.filter(item => !item.deleted);
        DATA.addAuditLog?.('EMPTY_TRASH_CAMPAIGNS', `Xóa vĩnh viễn ${count} chiến dịch`, AUTH.getCurrentUser()?.id);
    }

    loadTrash();
}
