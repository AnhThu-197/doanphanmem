// ============================================
// WIDGET ROI CHO DASHBOARD
// ============================================

function loadROIWidget() {
    const contracts = DATA.contracts || [];
    const expenses = DATA.campaignExpenses || [];
    const campaigns = DATA.campaigns.filter(c => !c.deleted) || [];
    
    // Tính tổng doanh thu
    const totalRevenue = contracts
        .filter(c => c.status === 'Thắng')
        .reduce((sum, c) => sum + c.value, 0);
    
    // Tính tổng chi phí
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Tính ROI
    const totalProfit = totalRevenue - totalExpenses;
    const totalROI = totalExpenses > 0 ? ((totalProfit / totalExpenses) * 100).toFixed(1) : 0;
    
    // Tính ROI cho từng chiến dịch
    const campaignROIs = campaigns.map(campaign => {
        const revenue = contracts
            .filter(c => c.campaignId === campaign.id && c.status === 'Thắng')
            .reduce((sum, c) => sum + c.value, 0);
        
        const expense = expenses
            .filter(e => e.campaignId === campaign.id)
            .reduce((sum, e) => sum + e.amount, 0);
        
        const profit = revenue - expense;
        const roi = expense > 0 ? ((profit / expense) * 100).toFixed(1) : 0;
        
        return {
            name: campaign.name,
            revenue: revenue,
            expense: expense,
            profit: profit,
            roi: parseFloat(roi)
        };
    }).sort((a, b) => b.roi - a.roi); // Sắp xếp theo ROI giảm dần
    
    return {
        totalRevenue,
        totalExpenses,
        totalProfit,
        totalROI,
        campaignROIs
    };
}

function renderROIWidget() {
    const data = loadROIWidget();
    const roiColor = data.totalROI >= 0 ? '#10b981' : '#ef4444';
    
    return `
        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0;">
                    <i class="fas fa-chart-line"></i> Tổng quan ROI
                </h3>
                <a href="financial-report.html" style="color: #3b82f6; text-decoration: none; font-weight: 600;">
                    Xem chi tiết <i class="fas fa-arrow-right"></i>
                </a>
            </div>
            
            <!-- Thống kê tổng -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
                <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 12px; opacity: 0.9;">Doanh thu</div>
                    <div style="font-size: 24px; font-weight: bold; margin: 8px 0;">${formatCurrency(data.totalRevenue)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 12px; opacity: 0.9;">Chi phí</div>
                    <div style="font-size: 24px; font-weight: bold; margin: 8px 0;">${formatCurrency(data.totalExpenses)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 12px; opacity: 0.9;">Lợi nhuận</div>
                    <div style="font-size: 24px; font-weight: bold; margin: 8px 0;">${formatCurrency(data.totalProfit)}</div>
                </div>
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 8px; color: white;">
                    <div style="font-size: 12px; opacity: 0.9;">ROI</div>
                    <div style="font-size: 24px; font-weight: bold; margin: 8px 0;">${data.totalROI}%</div>
                </div>
            </div>
            
            <!-- Top chiến dịch -->
            <h4 style="margin-bottom: 15px;">Top Chiến dịch theo ROI</h4>
            <div style="display: grid; gap: 10px;">
                ${data.campaignROIs.slice(0, 5).map((campaign, index) => {
                    const roiColor = campaign.roi >= 100 ? '#10b981' : campaign.roi >= 50 ? '#f59e0b' : '#ef4444';
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                    
                    return `
                        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; margin-bottom: 5px;">
                                    ${medal} ${campaign.name}
                                </div>
                                <div style="font-size: 12px; color: #64748b;">
                                    Doanh thu: ${formatCurrency(campaign.revenue)} | 
                                    Chi phí: ${formatCurrency(campaign.expense)}
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 24px; font-weight: bold; color: ${roiColor};">
                                    ${campaign.roi}%
                                </div>
                                <div style="font-size: 11px; color: #64748b;">ROI</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            ${data.campaignROIs.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: #94a3b8;">
                    <i class="fas fa-chart-line" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có dữ liệu ROI</p>
                    <p style="font-size: 13px;">Vui lòng đồng bộ doanh thu và nhập chi phí</p>
                </div>
            ` : ''}
        </div>
    `;
}

function formatCurrency(amount) {
    if (!amount) return '0đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Thêm widget vào dashboard
function addROIWidgetToDashboard() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;
    
    const pageTitle = mainContent.querySelector('.page-title');
    if (!pageTitle) return;
    
    const widget = document.createElement('div');
    widget.innerHTML = renderROIWidget();
    
    // Chèn sau page title
    pageTitle.after(widget.firstElementChild);
}

// Auto load khi dashboard load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        // Đợi dashboard load xong
        setTimeout(() => {
            if (window.location.pathname.includes('dashboard.html')) {
                addROIWidgetToDashboard();
            }
        }, 1500);
    });
}
