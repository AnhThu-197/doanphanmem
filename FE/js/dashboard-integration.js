// ============================================
// TÍCH HỢP CÁC TÍNH NĂNG MỚI VÀO DASHBOARD
// ============================================

// Load trang Hợp đồng - Giao dịch từ dashboard
// ĐỪNG override hàm này - đã có trong script.js
// function loadContracts() {
//     window.location.href = 'contract-management.html';
// }

// Load trang Chi phí Chiến dịch từ dashboard
// ĐỪNG override hàm này - đã có trong script.js
// function loadCampaignExpenses() {
//     window.location.href = 'campaign-expenses.html';
// }

// Hoặc nếu muốn load inline trong dashboard:
function loadContractsInline() {
    const mainContent = document.getElementById('mainContent');
    const contracts = DATA.contracts || [];
    
    const totalContracts = contracts.length;
    const negotiating = contracts.filter(c => c.status === 'Đang thương lượng').length;
    const won = contracts.filter(c => c.status === 'Thắng').length;
    const totalRevenue = contracts
        .filter(c => c.status === 'Thắng')
        .reduce((sum, c) => sum + c.value, 0);
    
    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 class="page-title">Quản lý Hợp đồng - Giao dịch</h2>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="window.location.href='contract-management.html'">
                    <i class="fas fa-external-link-alt"></i> Mở trang đầy đủ
                </button>
                <button class="btn btn-primary" onclick="openContractModalInline()">
                    <i class="fas fa-plus"></i> Thêm Hợp đồng
                </button>
            </div>
        </div>

        <!-- Thống kê tổng quan -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Hợp đồng</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${totalContracts}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Đang thương lượng</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${negotiating}</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Thắng</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${won}</div>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Doanh thu</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalRevenue)}</div>
            </div>
        </div>

        <!-- Danh sách hợp đồng -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 15px;">Hợp đồng gần đây</h3>
            <table>
                <thead>
                    <tr>
                        <th>Mã HĐ</th>
                        <th>Tên Hợp đồng</th>
                        <th>Khách hàng</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    ${contracts.slice(0, 10).map(contract => `
                        <tr>
                            <td><strong>#${contract.id}</strong></td>
                            <td>${contract.name}</td>
                            <td>${contract.customerName}</td>
                            <td><strong style="color: #10b981;">${formatCurrency(contract.value)}</strong></td>
                            <td>
                                <span class="status ${getContractStatusClass(contract.status)}">
                                    ${contract.status}
                                </span>
                            </td>
                            <td>${formatDate(contract.createdDate)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${contracts.length > 10 ? `
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="window.location.href='contract-management.html'">
                        Xem tất cả ${contracts.length} hợp đồng
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function loadCampaignExpensesInline() {
    const mainContent = document.getElementById('mainContent');
    const campaigns = DATA.campaigns.filter(c => !c.deleted) || [];
    const expenses = DATA.campaignExpenses || [];
    
    // Tính tổng chi phí cho từng chiến dịch
    campaigns.forEach(campaign => {
        const totalSpent = expenses
            .filter(e => e.campaignId === campaign.id)
            .reduce((sum, e) => sum + e.amount, 0);
        campaign.actualSpent = totalSpent;
    });
    
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);
    const totalSpent = campaigns.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
    const totalExpenses = expenses.length;
    const remaining = totalBudget - totalSpent;
    
    mainContent.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 class="page-title">Quản lý Chi phí Chiến dịch</h2>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="window.location.href='campaign-expenses.html'">
                    <i class="fas fa-external-link-alt"></i> Mở trang đầy đủ
                </button>
            </div>
        </div>

        <!-- Thống kê tổng quan -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Ngân sách</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalBudget)}</div>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Đã Chi</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalSpent)}</div>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Số Khoản chi</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${totalExpenses}</div>
            </div>
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Còn Lại</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(remaining)}</div>
            </div>
        </div>

        <!-- Danh sách chiến dịch -->
        <h3 style="margin-bottom: 15px;">Tổng quan Chiến dịch</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 40px;">
            ${campaigns.map(campaign => {
                const percentage = campaign.budget > 0 ? (campaign.actualSpent / campaign.budget * 100).toFixed(1) : 0;
                const isOverBudget = campaign.actualSpent > campaign.budget;
                
                return `
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ${isOverBudget ? '#ef4444' : '#3b82f6'};">
                        <h4 style="margin: 0 0 15px 0;">${campaign.name}</h4>
                        
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="font-size: 13px; color: #64748b;">Ngân sách</span>
                                <strong style="font-size: 14px;">${formatCurrency(campaign.budget)}</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span style="font-size: 13px; color: #64748b;">Đã chi</span>
                                <strong style="font-size: 14px; color: ${isOverBudget ? '#ef4444' : '#10b981'};">
                                    ${formatCurrency(campaign.actualSpent)}
                                </strong>
                            </div>
                        </div>
                        
                        <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                            <div style="background: ${isOverBudget ? '#ef4444' : '#3b82f6'}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="text-align: right; font-size: 12px; color: ${isOverBudget ? '#ef4444' : '#64748b'};">
                            ${percentage}% ${isOverBudget ? '(Vượt ngân sách)' : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <!-- Chi phí gần đây -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h3 style="margin-bottom: 15px;">Chi phí gần đây</h3>
            <table>
                <thead>
                    <tr>
                        <th>Chiến dịch</th>
                        <th>Tên Khoản chi</th>
                        <th>Loại</th>
                        <th>Số tiền</th>
                        <th>Ngày</th>
                        <th>Nguồn</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.slice(0, 10).map(expense => `
                        <tr>
                            <td>${expense.campaignName}</td>
                            <td>${expense.name}</td>
                            <td><span class="status lead">${expense.type}</span></td>
                            <td><strong style="color: #ef4444;">${formatCurrency(expense.amount)}</strong></td>
                            <td>${formatDate(expense.date)}</td>
                            <td>
                                <span class="status ${expense.source === 'Nhập thủ công' ? 'suspect' : 'customer'}" style="font-size: 11px;">
                                    ${expense.source}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${expenses.length > 10 ? `
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-secondary" onclick="window.location.href='campaign-expenses.html'">
                        Xem tất cả ${expenses.length} chi phí
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

// Helper functions
function getContractStatusClass(status) {
    const classes = {
        'Đang thương lượng': 'lead',
        'Thắng': 'customer',
        'Thua': 'suspect'
    };
    return classes[status] || '';
}

function formatCurrency(amount) {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Cập nhật dashboard với dữ liệu mới
function updateDashboardWithNewFeatures() {
    const mainContent = document.getElementById('mainContent');
    const user = AUTH.getCurrentUser();
    
    if (!user) return;
    
    // Thêm thống kê mới vào dashboard
    const contracts = DATA.contracts || [];
    const expenses = DATA.campaignExpenses || [];
    
    const totalRevenue = contracts
        .filter(c => c.status === 'Thắng')
        .reduce((sum, c) => sum + c.value, 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalRevenue - totalExpenses;
    
    // Cập nhật card doanh thu
    const revenueCard = document.querySelector('.card:nth-child(4) p');
    if (revenueCard) {
        revenueCard.textContent = formatCurrency(totalRevenue);
    }
    
    // Thêm thông báo về tính năng mới
    const notification = document.createElement('div');
    notification.style.cssText = 'background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;';
    notification.innerHTML = `
        <h4 style="color: #1e40af; margin-bottom: 10px;">
            <i class="fas fa-star"></i> Tính năng Mới
        </h4>
        <p style="color: #1e40af; margin: 0;">
            Hệ thống đã được cập nhật với 2 tính năng mới: 
            <strong>Quản lý Hợp đồng - Giao dịch</strong> và 
            <strong>Quản lý Chi phí Chiến dịch</strong>. 
            Truy cập từ menu bên trái để sử dụng!
        </p>
    `;
    
    const pageTitle = mainContent.querySelector('.page-title');
    if (pageTitle) {
        pageTitle.after(notification);
    }
}

// Khởi tạo khi load trang
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Đợi 1 giây để dashboard load xong
        setTimeout(updateDashboardWithNewFeatures, 1000);
    });
}
