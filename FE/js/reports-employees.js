// ============================================
// BÁO CÁO & THỐNG KÊ
// ============================================

function loadReports() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Báo cáo & Thống kê</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('report-overview')">Tổng quan</button>
            <button class="tab-btn" onclick="switchTab('report-campaigns')">Chiến dịch</button>
            <button class="tab-btn" onclick="switchTab('report-employees')">Nhân viên</button>
            <button class="tab-btn" onclick="switchTab('report-customers')">Khách hàng</button>
            <button class="tab-btn" onclick="switchTab('report-export')">Xuất báo cáo</button>
        </div>
        
        <!-- Tab Tổng quan -->
        <div id="report-overview" class="tab-content active">
            ${generateOverviewReport()}
        </div>
        
        <!-- Tab Chiến dịch -->
        <div id="report-campaigns" class="tab-content">
            ${generateCampaignReport()}
        </div>
        
        <!-- Tab Nhân viên -->
        <div id="report-employees" class="tab-content">
            ${generateEmployeeReport()}
        </div>
        
        <!-- Tab Khách hàng -->
        <div id="report-customers" class="tab-content">
            ${generateCustomerReport()}
        </div>
        
        <!-- Tab Xuất báo cáo -->
        <div id="report-export" class="tab-content">
            ${generateExportOptions()}
        </div>
    `;
}

// Generate overview report
function generateOverviewReport() {
    const totalCustomers = DATA.customers.filter(c => !c.deleted).length;
    const totalCampaigns = DATA.campaigns.filter(c => !c.deleted).length;
    const totalRevenue = DATA.campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const totalSpent = DATA.campaigns.reduce((sum, c) => sum + (c.actualSpent || 0), 0);
    const totalProfit = totalRevenue - totalSpent;
    const avgROI = totalSpent > 0 ? ((totalProfit / totalSpent) * 100).toFixed(1) : 0;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newCustomersThisMonth = DATA.customers.filter(c => {
        const createdDate = new Date(c.createdDate);
        return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear && !c.deleted;
    }).length;
    
    return `
        <div style="margin-bottom: 30px;">
            <h3 style="margin-bottom: 20px;">Tổng quan Hoạt động</h3>
            <div class="cards-container" style="grid-template-columns: repeat(4, 1fr);">
                <div class="card">
                    <div class="card-info">
                        <h3>Tổng Khách hàng</h3>
                        <p>${totalCustomers}</p>
                        <small style="color: #10b981;">+${newCustomersThisMonth} tháng này</small>
                    </div>
                    <div class="card-icon"><i class="fas fa-users"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>Chiến dịch</h3>
                        <p>${totalCampaigns}</p>
                        <small style="color: #64748b;">${DATA.campaigns.filter(c => c.status === 'active').length} đang chạy</small>
                    </div>
                    <div class="card-icon"><i class="fas fa-bullhorn"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>Doanh thu</h3>
                        <p>${formatCurrency(totalRevenue)}</p>
                        <small style="color: #64748b;">Chi phí: ${formatCurrency(totalSpent)}</small>
                    </div>
                    <div class="card-icon"><i class="fas fa-dollar-sign"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>ROI Trung bình</h3>
                        <p style="color: ${avgROI >= 0 ? '#10b981' : '#ef4444'};">${avgROI}%</p>
                        <small style="color: ${totalProfit >= 0 ? '#10b981' : '#ef4444'};">
                            Lợi nhuận: ${formatCurrency(totalProfit)}
                        </small>
                    </div>
                    <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Khách hàng theo Cấp độ</h4>
                <div style="display: grid; gap: 10px;">
                    ${['suspect', 'lead', 'prospect', 'customer', 'evangelist'].map(status => {
                        const count = DATA.customers.filter(c => c.status === status && !c.deleted).length;
                        const percentage = totalCustomers > 0 ? ((count / totalCustomers) * 100).toFixed(1) : 0;
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                <div>
                                    <strong>${getStatusLabel(status)}</strong>
                                    <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 5px;">
                                        <div style="width: ${percentage}%; height: 100%; background: #3b82f6; border-radius: 4px;"></div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 20px; font-weight: 600;">${count}</div>
                                    <small style="color: #64748b;">${percentage}%</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Khách hàng theo Nguồn</h4>
                <div style="display: grid; gap: 10px;">
                    ${['facebook', 'google', 'direct', 'referral'].map(source => {
                        const count = DATA.customers.filter(c => c.source === source && !c.deleted).length;
                        const percentage = totalCustomers > 0 ? ((count / totalCustomers) * 100).toFixed(1) : 0;
                        return `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f8fafc; border-radius: 5px;">
                                <div>
                                    <strong>${source.charAt(0).toUpperCase() + source.slice(1)}</strong>
                                    <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 5px;">
                                        <div style="width: ${percentage}%; height: 100%; background: #10b981; border-radius: 4px;"></div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 20px; font-weight: 600;">${count}</div>
                                    <small style="color: #64748b;">${percentage}%</small>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}


// Generate campaign report
function generateCampaignReport() {
    const campaigns = DATA.campaigns.filter(c => !c.deleted);
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Hiệu quả Chiến dịch</h3>
            <table>
                <thead>
                    <tr>
                        <th>Chiến dịch</th>
                        <th>Ngân sách</th>
                        <th>Chi phí</th>
                        <th>Doanh thu</th>
                        <th>ROI</th>
                        <th>Leads</th>
                        <th>Conversions</th>
                        <th>Conversion Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${campaigns.map(c => {
                        const roi = (c.actualSpent || 0) > 0 ? (((c.revenue || 0) - (c.actualSpent || 0)) / (c.actualSpent || 0) * 100).toFixed(1) : 0;
                        const convRate = (c.leads || 0) > 0 ? (((c.conversions || 0) / (c.leads || 0)) * 100).toFixed(1) : 0;
                        return `
                            <tr>
                                <td><strong>${c.name}</strong></td>
                                <td>${formatCurrency(c.budget)}</td>
                                <td>${formatCurrency(c.actualSpent || 0)}</td>
                                <td>${formatCurrency(c.revenue || 0)}</td>
                                <td style="color: ${roi >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600;">${roi}%</td>
                                <td>${c.leads || 0}</td>
                                <td>${c.conversions || 0}</td>
                                <td style="color: ${convRate >= 15 ? '#10b981' : '#f59e0b'}; font-weight: 600;">${convRate}%</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Top 5 Chiến dịch theo ROI</h4>
                ${campaigns.sort((a, b) => {
                    const roiA = (a.actualSpent || 0) > 0 ? ((a.revenue || 0) - (a.actualSpent || 0)) / (a.actualSpent || 0) : 0;
                    const roiB = (b.actualSpent || 0) > 0 ? ((b.revenue || 0) - (b.actualSpent || 0)) / (b.actualSpent || 0) : 0;
                    return roiB - roiA;
                }).slice(0, 5).map((c, index) => {
                    const roi = (c.actualSpent || 0) > 0 ? (((c.revenue || 0) - (c.actualSpent || 0)) / (c.actualSpent || 0) * 100).toFixed(1) : 0;
                    return `
                        <div style="padding: 10px; background: #f8fafc; border-radius: 5px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="font-size: 18px; margin-right: 8px;">${index + 1}.</span>
                                    <strong>${c.name}</strong>
                                </div>
                                <span style="color: ${roi >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; font-size: 18px;">${roi}%</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Chiến dịch theo Trạng thái</h4>
                ${['planning', 'active', 'completed'].map(status => {
                    const count = campaigns.filter(c => c.status === status).length;
                    const percentage = campaigns.length > 0 ? ((count / campaigns.length) * 100).toFixed(1) : 0;
                    return `
                        <div style="padding: 10px; background: #f8fafc; border-radius: 5px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${getStatusLabel(status)}</strong>
                                    <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 5px;">
                                        <div style="width: ${percentage}%; height: 100%; background: #3b82f6; border-radius: 4px;"></div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 20px; font-weight: 600;">${count}</div>
                                    <small style="color: #64748b;">${percentage}%</small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}


// Generate employee report
function generateEmployeeReport() {
    // Mock employee data with performance metrics
    const employees = DATA.assignmentConfig.employees.map(emp => {
        const assignedCustomers = DATA.assignmentHistory?.filter(h => h.employeeId === emp.id).length || emp.assignedCount || 0;
        const interactions = DATA.interactions.filter(i => {
            const customer = DATA.customers.find(c => c.id === i.customerId);
            return customer && DATA.assignmentHistory?.some(h => h.customerId === customer.id && h.employeeId === emp.id);
        }).length;
        
        return {
            ...emp,
            assignedCustomers,
            interactions,
            conversions: Math.floor(assignedCustomers * 0.15), // Mock conversion rate
            avgResponseTime: Math.floor(Math.random() * 24) + 1 // Mock response time in hours
        };
    });
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Hiệu suất Nhân viên</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Trạng thái</th>
                        <th>KH được phân</th>
                        <th>Tương tác</th>
                        <th>Chuyển đổi</th>
                        <th>Tỷ lệ chuyển đổi</th>
                        <th>Thời gian phản hồi TB</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
                        const convRate = emp.assignedCustomers > 0 ? ((emp.conversions / emp.assignedCustomers) * 100).toFixed(1) : 0;
                        return `
                            <tr>
                                <td><strong>${emp.name}</strong></td>
                                <td>
                                    <span style="color: ${emp.online ? '#10b981' : '#94a3b8'};">
                                        <i class="fas fa-circle" style="font-size: 8px;"></i>
                                        ${emp.online ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td><strong>${emp.assignedCustomers}</strong></td>
                                <td>${emp.interactions}</td>
                                <td><strong>${emp.conversions}</strong></td>
                                <td style="color: ${convRate >= 15 ? '#10b981' : '#f59e0b'}; font-weight: 600;">${convRate}%</td>
                                <td>${emp.avgResponseTime}h</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Top Nhân viên theo Chuyển đổi</h4>
                ${employees.sort((a, b) => b.conversions - a.conversions).slice(0, 3).map((emp, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    return `
                        <div style="padding: 10px; background: #f8fafc; border-radius: 5px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="font-size: 20px; margin-right: 8px;">${medals[index]}</span>
                                    <strong>${emp.name}</strong>
                                </div>
                                <span style="color: #10b981; font-weight: 600; font-size: 18px;">${emp.conversions} conversions</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Phân bổ Khách hàng</h4>
                ${employees.map(emp => {
                    const totalAssigned = employees.reduce((sum, e) => sum + e.assignedCustomers, 0);
                    const percentage = totalAssigned > 0 ? ((emp.assignedCustomers / totalAssigned) * 100).toFixed(1) : 0;
                    return `
                        <div style="padding: 10px; background: #f8fafc; border-radius: 5px; margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <strong>${emp.name}</strong>
                                    <div style="width: 200px; height: 8px; background: #e2e8f0; border-radius: 4px; margin-top: 5px;">
                                        <div style="width: ${percentage}%; height: 100%; background: #3b82f6; border-radius: 4px;"></div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 18px; font-weight: 600;">${emp.assignedCustomers}</div>
                                    <small style="color: #64748b;">${percentage}%</small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Generate customer report
function generateCustomerReport() {
    const customers = DATA.customers.filter(c => !c.deleted);
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Thống kê Khách hàng theo Cấp độ</h3>
            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px;">
                <div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #64748b; margin-bottom: 5px;">
                        ${customers.filter(c => c.status === 'suspect').length}
                    </div>
                    <div style="color: #64748b; font-size: 13px;">Suspect</div>
                    <small style="color: #94a3b8; font-size: 11px;">Người truy cập</small>
                </div>
                <div style="text-align: center; padding: 20px; background: #dbeafe; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 5px;">
                        ${customers.filter(c => c.status === 'lead').length}
                    </div>
                    <div style="color: #1e40af; font-size: 13px;">Lead</div>
                    <small style="color: #1e40af; font-size: 11px;">KH tiềm năng mới</small>
                </div>
                <div style="text-align: center; padding: 20px; background: #fef3c7; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #92400e; margin-bottom: 5px;">
                        ${customers.filter(c => c.status === 'prospect').length}
                    </div>
                    <div style="color: #92400e; font-size: 13px;">Prospect</div>
                    <small style="color: #92400e; font-size: 11px;">KH triển vọng</small>
                </div>
                <div style="text-align: center; padding: 20px; background: #dcfce7; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #166534; margin-bottom: 5px;">
                        ${customers.filter(c => c.status === 'customer').length}
                    </div>
                    <div style="color: #166534; font-size: 13px;">Customer</div>
                    <small style="color: #166534; font-size: 11px;">KH chính thức</small>
                </div>
                <div style="text-align: center; padding: 20px; background: #fce7f3; border-radius: 8px;">
                    <div style="font-size: 32px; font-weight: 700; color: #9f1239; margin-bottom: 5px;">
                        ${customers.filter(c => c.status === 'evangelist').length}
                    </div>
                    <div style="color: #9f1239; font-size: 13px;">Evangelist</div>
                    <small style="color: #9f1239; font-size: 11px;">KH trung thành</small>
                </div>
            </div>
            
            <h4 style="margin-bottom: 15px;">Top 10 Khách hàng theo Điểm Lead</h4>
            <table>
                <thead>
                    <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Công ty</th>
                        <th>Trạng thái</th>
                        <th>Nguồn</th>
                        <th>Điểm Lead</th>
                    </tr>
                </thead>
                <tbody>
                    ${customers.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10).map(c => `
                        <tr>
                            <td><strong>${c.name}</strong></td>
                            <td>${c.email}</td>
                            <td>${c.company}</td>
                            <td><span class="status ${c.status}">${getStatusLabel(c.status)}</span></td>
                            <td>${c.source}</td>
                            <td><strong style="color: ${c.score >= 70 ? '#10b981' : c.score >= 50 ? '#f59e0b' : '#64748b'};">${c.score}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Generate export options
function generateExportOptions() {
    return `
        <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 20px;">Xuất Báo cáo</h3>
            
            <div style="display: grid; gap: 20px; max-width: 600px;">
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px;">
                        <i class="fas fa-file-excel" style="color: #10b981;"></i> Báo cáo Tổng quan
                    </h4>
                    <p style="color: #64748b; margin-bottom: 15px;">
                        Xuất báo cáo tổng quan về khách hàng, chiến dịch và doanh thu
                    </p>
                    <button class="btn btn-primary" onclick="exportOverviewReport()">
                        <i class="fas fa-download"></i> Xuất Excel
                    </button>
                </div>
                
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px;">
                        <i class="fas fa-chart-bar" style="color: #3b82f6;"></i> Báo cáo Chiến dịch
                    </h4>
                    <p style="color: #64748b; margin-bottom: 15px;">
                        Xuất chi tiết hiệu quả các chiến dịch marketing
                    </p>
                    <button class="btn btn-primary" onclick="exportCampaignReport()">
                        <i class="fas fa-download"></i> Xuất Excel
                    </button>
                </div>
                
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px;">
                        <i class="fas fa-users" style="color: #f59e0b;"></i> Báo cáo Nhân viên
                    </h4>
                    <p style="color: #64748b; margin-bottom: 15px;">
                        Xuất hiệu suất làm việc của từng nhân viên
                    </p>
                    <button class="btn btn-primary" onclick="exportEmployeeReport()">
                        <i class="fas fa-download"></i> Xuất Excel
                    </button>
                </div>
                
                <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-bottom: 10px;">
                        <i class="fas fa-file-pdf" style="color: #ef4444;"></i> Báo cáo Tùy chỉnh
                    </h4>
                    <p style="color: #64748b; margin-bottom: 15px;">
                        Tạo báo cáo theo khoảng thời gian và tiêu chí tùy chỉnh
                    </p>
                    <button class="btn btn-secondary" onclick="openCustomReportModal()">
                        <i class="fas fa-cog"></i> Tùy chỉnh & Xuất
                    </button>
                </div>
            </div>
        </div>
    `;
}


// Export functions
function exportOverviewReport() {
    const customers = DATA.customers.filter(c => !c.deleted);
    const campaigns = DATA.campaigns.filter(c => !c.deleted);
    
    let csv = 'BÁO CÁO TỔNG QUAN\n\n';
    csv += 'Tổng khách hàng,' + customers.length + '\n';
    csv += 'Tổng chiến dịch,' + campaigns.length + '\n';
    csv += 'Tổng doanh thu,' + campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0) + '\n';
    csv += 'Tổng chi phí,' + campaigns.reduce((sum, c) => sum + (c.actualSpent || 0), 0) + '\n\n';
    
    csv += 'KHÁCH HÀNG THEO CẤP ĐỘ\n';
    csv += 'Cấp độ,Số lượng\n';
    csv += 'Suspect (Người truy cập),' + customers.filter(c => c.status === 'suspect').length + '\n';
    csv += 'Lead (KH tiềm năng mới),' + customers.filter(c => c.status === 'lead').length + '\n';
    csv += 'Prospect (KH triển vọng),' + customers.filter(c => c.status === 'prospect').length + '\n';
    csv += 'Customer (KH chính thức),' + customers.filter(c => c.status === 'customer').length + '\n';
    csv += 'Evangelist (KH trung thành),' + customers.filter(c => c.status === 'evangelist').length + '\n';
    
    downloadCSV(csv, 'bao-cao-tong-quan.csv');
}

function exportCampaignReport() {
    const campaigns = DATA.campaigns.filter(c => !c.deleted);
    
    let csv = 'Tên chiến dịch,Ngân sách,Chi phí thực tế,Doanh thu,ROI,Leads,Conversions,Conversion Rate\n';
    campaigns.forEach(c => {
        const roi = (c.actualSpent || 0) > 0 ? (((c.revenue || 0) - (c.actualSpent || 0)) / (c.actualSpent || 0) * 100).toFixed(1) : 0;
        const convRate = (c.leads || 0) > 0 ? (((c.conversions || 0) / (c.leads || 0)) * 100).toFixed(1) : 0;
        csv += `"${c.name}",${c.budget},${c.actualSpent || 0},${c.revenue || 0},${roi}%,${c.leads || 0},${c.conversions || 0},${convRate}%\n`;
    });
    
    downloadCSV(csv, 'bao-cao-chien-dich.csv');
}

function exportEmployeeReport() {
    const employees = DATA.assignmentConfig.employees;
    
    let csv = 'Nhân viên,Trạng thái,Khách hàng được phân,Tỷ lệ phân bổ\n';
    employees.forEach(emp => {
        csv += `"${emp.name}",${emp.online ? 'Online' : 'Offline'},${emp.assignedCount || 0},${emp.ratio || 0}%\n`;
    });
    
    downloadCSV(csv, 'bao-cao-nhan-vien.csv');
}

function downloadCSV(csv, filename) {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('✓ Đã xuất báo cáo thành công!');
}

function openCustomReportModal() {
    alert('Chức năng báo cáo tùy chỉnh đang được phát triển...');
}

// ============================================
// QUẢN LÝ NHÂN VIÊN
// ============================================

function loadManageEmployees() {
    const mainContent = document.getElementById('mainContent');
    
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Nhân viên</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" onclick="switchTab('employee-list')">Danh sách Nhân viên</button>
            <button class="tab-btn" onclick="switchTab('employee-performance')">Hiệu suất</button>
            <button class="tab-btn" onclick="switchTab('employee-assignment')">Phân bổ Công việc</button>
        </div>
        
        <!-- Tab Danh sách -->
        <div id="employee-list" class="tab-content active">
            ${generateEmployeeList()}
        </div>
        
        <!-- Tab Hiệu suất -->
        <div id="employee-performance" class="tab-content">
            ${generateEmployeePerformance()}
        </div>
        
        <!-- Tab Phân bổ -->
        <div id="employee-assignment" class="tab-content">
            ${generateEmployeeAssignment()}
        </div>
    `;
}

function generateEmployeeList() {
    const employees = DATA.assignmentConfig.employees;
    
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Danh sách Nhân viên Marketing</h3>
                <button class="btn-add" onclick="openAddEmployeeModal()">
                    <i class="fas fa-user-plus"></i> Thêm Nhân viên
                </button>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Nhân viên</th>
                        <th>Trạng thái</th>
                        <th>Khách hàng được phân</th>
                        <th>Tỷ lệ phân bổ</th>
                        <th>Tương tác</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.map(emp => {
                        const interactions = DATA.interactions.filter(i => {
                            const customer = DATA.customers.find(c => c.id === i.customerId);
                            return customer && DATA.assignmentHistory?.some(h => h.customerId === customer.id && h.employeeId === emp.id);
                        }).length;
                        
                        return `
                            <tr>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                                            ${emp.name.split(' ').pop().substring(0, 2).toUpperCase()}
                                        </div>
                                        <strong>${emp.name}</strong>
                                    </div>
                                </td>
                                <td>
                                    <span style="color: ${emp.online ? '#10b981' : '#94a3b8'};">
                                        <i class="fas fa-circle" style="font-size: 8px;"></i>
                                        ${emp.online ? 'Online' : 'Offline'}
                                    </span>
                                </td>
                                <td><strong>${emp.assignedCount || 0}</strong> khách hàng</td>
                                <td><strong>${emp.ratio || 0}%</strong></td>
                                <td>${interactions} tương tác</td>
                                <td>
                                    <button class="btn-view" onclick="viewEmployeeDetail(${emp.id})">Xem</button>
                                    <button class="btn-edit" onclick="editEmployee(${emp.id})">Sửa</button>
                                    <button class="btn btn-secondary" onclick="toggleEmployeeStatus(${emp.id})" style="padding: 6px 12px; font-size: 13px;">
                                        <i class="fas fa-${emp.online ? 'pause' : 'play'}"></i>
                                        ${emp.online ? 'Offline' : 'Online'}
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}


function generateEmployeePerformance() {
    const employees = DATA.assignmentConfig.employees.map(emp => {
        const assignedCustomers = DATA.assignmentHistory?.filter(h => h.employeeId === emp.id).length || emp.assignedCount || 0;
        const interactions = DATA.interactions.filter(i => {
            const customer = DATA.customers.find(c => c.id === i.customerId);
            return customer && DATA.assignmentHistory?.some(h => h.customerId === customer.id && h.employeeId === emp.id);
        }).length;
        
        return {
            ...emp,
            assignedCustomers,
            interactions,
            conversions: Math.floor(assignedCustomers * 0.15),
            avgResponseTime: Math.floor(Math.random() * 24) + 1,
            satisfaction: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
        };
    });
    
    return `
        <div style="margin-bottom: 20px;">
            <div class="cards-container" style="grid-template-columns: repeat(4, 1fr);">
                <div class="card">
                    <div class="card-info">
                        <h3>Tổng Nhân viên</h3>
                        <p>${employees.length}</p>
                        <small style="color: #10b981;">${employees.filter(e => e.online).length} đang online</small>
                    </div>
                    <div class="card-icon"><i class="fas fa-users"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>Tổng KH được phân</h3>
                        <p>${employees.reduce((sum, e) => sum + e.assignedCustomers, 0)}</p>
                    </div>
                    <div class="card-icon"><i class="fas fa-user-check"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>Tổng Tương tác</h3>
                        <p>${employees.reduce((sum, e) => sum + e.interactions, 0)}</p>
                    </div>
                    <div class="card-icon"><i class="fas fa-comments"></i></div>
                </div>
                <div class="card">
                    <div class="card-info">
                        <h3>Tổng Chuyển đổi</h3>
                        <p>${employees.reduce((sum, e) => sum + e.conversions, 0)}</p>
                    </div>
                    <div class="card-icon"><i class="fas fa-check-circle"></i></div>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px;">Bảng Xếp hạng Hiệu suất</h3>
            <table>
                <thead>
                    <tr>
                        <th>Xếp hạng</th>
                        <th>Nhân viên</th>
                        <th>KH được phân</th>
                        <th>Tương tác</th>
                        <th>Chuyển đổi</th>
                        <th>Tỷ lệ chuyển đổi</th>
                        <th>Thời gian phản hồi</th>
                        <th>Đánh giá</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.sort((a, b) => b.conversions - a.conversions).map((emp, index) => {
                        const convRate = emp.assignedCustomers > 0 ? ((emp.conversions / emp.assignedCustomers) * 100).toFixed(1) : 0;
                        const medals = ['🥇', '🥈', '🥉'];
                        return `
                            <tr>
                                <td style="text-align: center; font-size: 20px;">
                                    ${index < 3 ? medals[index] : index + 1}
                                </td>
                                <td><strong>${emp.name}</strong></td>
                                <td>${emp.assignedCustomers}</td>
                                <td>${emp.interactions}</td>
                                <td><strong style="color: #10b981;">${emp.conversions}</strong></td>
                                <td style="color: ${convRate >= 15 ? '#10b981' : '#f59e0b'}; font-weight: 600;">${convRate}%</td>
                                <td>${emp.avgResponseTime}h</td>
                                <td>
                                    <div style="display: flex; align-items: center; gap: 5px;">
                                        <span style="color: #f59e0b;">★</span>
                                        <strong>${emp.satisfaction}</strong>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Top 3 Nhân viên Xuất sắc</h4>
                ${employees.sort((a, b) => b.conversions - a.conversions).slice(0, 3).map((emp, index) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const colors = ['#fbbf24', '#94a3b8', '#cd7f32'];
                    return `
                        <div style="padding: 15px; background: linear-gradient(135deg, ${colors[index]}22 0%, ${colors[index]}11 100%); border-radius: 8px; margin-bottom: 10px; border-left: 4px solid ${colors[index]};">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <span style="font-size: 24px; margin-right: 10px;">${medals[index]}</span>
                                    <strong style="font-size: 16px;">${emp.name}</strong>
                                    <div style="margin-top: 5px; color: #64748b; font-size: 14px;">
                                        ${emp.conversions} conversions • ${emp.interactions} tương tác
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 24px; font-weight: 700; color: #10b981;">
                                        ${emp.assignedCustomers > 0 ? ((emp.conversions / emp.assignedCustomers) * 100).toFixed(0) : 0}%
                                    </div>
                                    <small style="color: #64748b;">Tỷ lệ CV</small>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <h4 style="margin-bottom: 15px;">Phân tích Hiệu suất</h4>
                <div style="display: grid; gap: 15px;">
                    <div style="padding: 15px; background: #dcfce7; border-radius: 8px;">
                        <div style="color: #166534; font-size: 14px; margin-bottom: 5px;">Hiệu suất Cao (CV ≥ 15%)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #166534;">
                            ${employees.filter(e => e.assignedCustomers > 0 && (e.conversions / e.assignedCustomers) >= 0.15).length} nhân viên
                        </div>
                    </div>
                    <div style="padding: 15px; background: #fef3c7; border-radius: 8px;">
                        <div style="color: #92400e; font-size: 14px; margin-bottom: 5px;">Hiệu suất Trung bình (10-15%)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #92400e;">
                            ${employees.filter(e => {
                                const rate = e.assignedCustomers > 0 ? (e.conversions / e.assignedCustomers) : 0;
                                return rate >= 0.10 && rate < 0.15;
                            }).length} nhân viên
                        </div>
                    </div>
                    <div style="padding: 15px; background: #fee2e2; border-radius: 8px;">
                        <div style="color: #991b1b; font-size: 14px; margin-bottom: 5px;">Cần Cải thiện (< 10%)</div>
                        <div style="font-size: 24px; font-weight: 700; color: #991b1b;">
                            ${employees.filter(e => e.assignedCustomers > 0 && (e.conversions / e.assignedCustomers) < 0.10).length} nhân viên
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateEmployeeAssignment() {
    return `
        <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h3 style="margin-bottom: 15px;">Lịch sử Phân bổ Khách hàng</h3>
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Được phân cho</th>
                        <th>Phương pháp</th>
                        <th>Ngày phân bổ</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.assignmentHistory && DATA.assignmentHistory.length > 0 ? 
                        DATA.assignmentHistory.slice(0, 20).map(h => {
                            const customer = DATA.customers.find(c => c.id === h.customerId);
                            return `
                                <tr>
                                    <td><strong>${h.customerName}</strong></td>
                                    <td>${h.employeeName}</td>
                                    <td>
                                        <span class="status ${h.method === 'round_robin' ? 'customer' : 'prospect'}">
                                            ${h.method === 'round_robin' ? 'Xoay vòng' : h.method === 'ratio' ? 'Theo tỷ lệ' : 'Thủ công'}
                                        </span>
                                    </td>
                                    <td>${h.date}</td>
                                    <td>
                                        ${customer ? `<span class="status ${customer.status}">${getStatusLabel(customer.status)}</span>` : 'N/A'}
                                    </td>
                                </tr>
                            `;
                        }).join('') 
                    : `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 20px; color: #94a3b8;">
                                Chưa có lịch sử phân bổ
                            </td>
                        </tr>
                    `}
                </tbody>
            </table>
        </div>
    `;
}

// Employee management functions
function openAddEmployeeModal() {
    alert('Chức năng thêm nhân viên sẽ được tích hợp với hệ thống HR/Quản lý người dùng');
}

function viewEmployeeDetail(employeeId) {
    const emp = DATA.assignmentConfig.employees.find(e => e.id === employeeId);
    if (!emp) return;
    
    const assignedCustomers = DATA.assignmentHistory?.filter(h => h.employeeId === employeeId) || [];
    const interactions = DATA.interactions.filter(i => {
        const customer = DATA.customers.find(c => c.id === i.customerId);
        return customer && assignedCustomers.some(h => h.customerId === customer.id);
    });
    
    alert(`Chi tiết Nhân viên: ${emp.name}\n\n` +
          `Trạng thái: ${emp.online ? 'Online' : 'Offline'}\n` +
          `Khách hàng được phân: ${assignedCustomers.length}\n` +
          `Tương tác: ${interactions.length}\n` +
          `Tỷ lệ phân bổ: ${emp.ratio || 0}%`);
}

function editEmployee(employeeId) {
    alert('Chức năng chỉnh sửa thông tin nhân viên đang được phát triển...');
}

function toggleEmployeeStatus(employeeId) {
    const emp = DATA.assignmentConfig.employees.find(e => e.id === employeeId);
    if (!emp) return;
    
    emp.online = !emp.online;
    alert(`✓ Đã chuyển trạng thái ${emp.name} sang ${emp.online ? 'Online' : 'Offline'}`);
    loadManageEmployees();
}
