// ============================================
// REVENUE SYNC PAGE
// ============================================

function loadRevenueSync() {
    const mainContent = document.getElementById('mainContent');
    const contracts = DATA.contracts || [];
    
    const totalRevenue = contracts
        .filter(c => c.status === 'Thắng')
        .reduce((sum, c) => sum + c.value, 0);
    
    const wonContracts = contracts.filter(c => c.status === 'Thắng').length;
    const negotiatingContracts = contracts.filter(c => c.status === 'Đang thương lượng').length;
    
    mainContent.innerHTML = `
        <h2 class="page-title">Đồng bộ Dữ liệu Doanh thu</h2>

        <!-- Thông báo quan trọng -->
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Về Dữ liệu Doanh thu
            </h3>
            <ul style="color: #1e40af; margin-left: 20px; line-height: 1.8;">
                <li>Dữ liệu hợp đồng được <strong>đồng bộ tự động</strong> từ phần mềm Sales/Kế toán của công ty</li>
                <li>Bảng này <strong>chỉ đọc (Read-Only)</strong> - không thể thêm/sửa/xóa trực tiếp</li>
                <li>Mục đích: Lấy giá trị hợp đồng để <strong>tính ROI</strong> cho các chiến dịch Marketing</li>
                <li>Để cập nhật dữ liệu, vui lòng sử dụng chức năng <strong>"Đồng bộ Ngay"</strong> hoặc <strong>"Import Excel"</strong></li>
            </ul>
        </div>

        <!-- Thống kê tổng quan -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
            <div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Tổng Doanh thu</div>
                <div style="font-size: 28px; font-weight: bold; margin: 10px 0;">${formatCurrency(totalRevenue)}</div>
                <small style="opacity: 0.8;">Từ hợp đồng đã chốt</small>
            </div>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Hợp đồng Thành công</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${wonContracts}</div>
                <small style="opacity: 0.8;">Đã chốt thành công</small>
            </div>
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Đang thương lượng</div>
                <div style="font-size: 32px; font-weight: bold; margin: 10px 0;">${negotiatingContracts}</div>
                <small style="opacity: 0.8;">Chưa chốt</small>
            </div>
            <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white;">
                <div style="font-size: 14px; opacity: 0.9;">Lần đồng bộ cuối</div>
                <div style="font-size: 18px; font-weight: bold; margin: 10px 0;">Hôm nay, 14:30</div>
                <small style="opacity: 0.8;">Từ hệ thống Sales</small>
            </div>
        </div>

        <!-- Nút đồng bộ -->
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0 0 5px 0;">Đồng bộ Dữ liệu</h3>
                    <p style="margin: 0; color: #64748b; font-size: 14px;">Kết nối với hệ thống Sales/Kế toán để lấy dữ liệu hợp đồng mới nhất</p>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-secondary" onclick="importRevenueExcel()">
                        <i class="fas fa-file-excel"></i> Import Excel
                    </button>
                    <button class="btn btn-primary" onclick="syncRevenueNow()">
                        <i class="fas fa-sync-alt"></i> Đồng bộ Ngay
                    </button>
                </div>
            </div>
        </div>

        <!-- Bộ lọc -->
        <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Trạng thái</label>
                    <select id="filterContractStatus" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="">Tất cả</option>
                        <option value="Đang thương lượng">Đang thương lượng</option>
                        <option value="Thắng">Thắng (Đã chốt)</option>
                        <option value="Thua">Thua</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Chiến dịch</label>
                    <select id="filterContractCampaign" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <option value="">Tất cả</option>
                        ${DATA.campaigns.filter(c => !c.deleted).map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Từ ngày</label>
                    <input type="date" id="filterContractFromDate" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 500;">Đến ngày</label>
                    <input type="date" id="filterContractToDate" onchange="filterRevenueSyncContracts()" style="width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px;">
                </div>
            </div>
        </div>

        <!-- Danh sách hợp đồng (Read-Only) -->
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Danh sách Hợp đồng (Chỉ đọc)</h3>
                <button class="btn btn-secondary" onclick="exportRevenueSyncToExcel()">
                    <i class="fas fa-download"></i> Xuất Excel
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Mã HĐ</th>
                        <th>Tên Hợp đồng</th>
                        <th>Khách hàng</th>
                        <th>Chiến dịch</th>
                        <th>Giá trị</th>
                        <th>Trạng thái</th>
                        <th>Ngày chốt</th>
                        <th>Nguồn</th>
                    </tr>
                </thead>
                <tbody id="revenueSyncContractsTable">
                    ${renderRevenueSyncContractsTable(contracts)}
                </tbody>
            </table>
        </div>
    `;
}

function renderRevenueSyncContractsTable(contracts) {
    if (contracts.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có dữ liệu hợp đồng</p>
                    <p style="font-size: 13px;">Click "Đồng bộ Ngay" để lấy dữ liệu từ hệ thống Sales</p>
                </td>
            </tr>
        `;
    }
    
    return contracts.map(contract => `
        <tr>
            <td><strong>#${contract.id}</strong></td>
            <td>${contract.name}</td>
            <td>${contract.customerName}</td>
            <td>${contract.campaignName || '<em style="color: #94a3b8;">Không liên kết</em>'}</td>
            <td><strong style="color: #10b981;">${formatCurrency(contract.value)}</strong></td>
            <td>
                <span class="status ${getContractStatusClass(contract.status)}">
                    ${contract.status}
                </span>
            </td>
            <td>${contract.closeDate ? formatDate(contract.closeDate) : '<em style="color: #94a3b8;">Chưa chốt</em>'}</td>
            <td>
                <span class="status suspect" style="font-size: 11px;">
                    <i class="fas fa-sync-alt"></i> Đồng bộ API
                </span>
            </td>
        </tr>
    `).join('');
}

function filterRevenueSyncContracts() {
    const status = document.getElementById('filterContractStatus').value;
    const campaignId = document.getElementById('filterContractCampaign').value;
    const fromDate = document.getElementById('filterContractFromDate').value;
    const toDate = document.getElementById('filterContractToDate').value;
    
    let filtered = DATA.contracts || [];
    
    if (status) {
        filtered = filtered.filter(c => c.status === status);
    }
    
    if (campaignId) {
        filtered = filtered.filter(c => c.campaignId === parseInt(campaignId));
    }
    
    if (fromDate) {
        filtered = filtered.filter(c => new Date(c.createdDate) >= new Date(fromDate));
    }
    
    if (toDate) {
        filtered = filtered.filter(c => new Date(c.createdDate) <= new Date(toDate));
    }
    
    document.getElementById('revenueSyncContractsTable').innerHTML = renderRevenueSyncContractsTable(filtered);
}

function syncRevenueNow() {
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 10000;">
            <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #3b82f6;"></i>
            <p style="margin-top: 15px;">Đang đồng bộ dữ liệu từ hệ thống Sales...</p>
        </div>
    `;
    document.body.appendChild(loadingMsg);
    
    setTimeout(() => {
        document.body.removeChild(loadingMsg);
        
        const newContracts = [
            {
                id: DATA.contracts.length + 1,
                name: 'Hợp đồng dịch vụ Digital Marketing Q2/2024',
                customerId: 1,
                customerName: 'Công ty ABC',
                campaignId: 1,
                campaignName: 'Chiến dịch Xuân 2024',
                value: 80000000,
                status: 'Thắng',
                createdDate: '2024-04-01',
                closeDate: '2024-04-03'
            },
            {
                id: DATA.contracts.length + 2,
                name: 'Hợp đồng tư vấn Marketing',
                customerId: 3,
                customerName: 'Công ty DEF',
                campaignId: 2,
                campaignName: 'Chiến dịch Email Marketing',
                value: 25000000,
                status: 'Đang thương lượng',
                createdDate: '2024-04-02',
                closeDate: null
            }
        ];
        
        DATA.contracts.push(...newContracts);
        
        alert(`✓ Đồng bộ thành công!\n\nĐã nhận ${newContracts.length} hợp đồng mới từ hệ thống Sales.\n\nDữ liệu đã được cập nhật và sẵn sàng để tính ROI.`);
        
        loadRevenueSync();
        DATA.addAuditLog('SYNC_REVENUE', `Đồng bộ ${newContracts.length} hợp đồng từ hệ thống Sales`, 'system');
    }, 2500);
}

function importRevenueExcel() {
    alert('📊 Chức năng Import Excel\n\n' +
          'Để import dữ liệu hợp đồng từ Excel:\n\n' +
          '1. Tải file mẫu Excel\n' +
          '2. Điền dữ liệu theo format\n' +
          '3. Upload file lên hệ thống\n' +
          '4. Hệ thống sẽ tự động import và cập nhật\n\n' +
          'Chức năng đang được phát triển!');
}

function exportRevenueSyncToExcel() {
    alert('📥 Xuất dữ liệu ra Excel\n\nChức năng đang được phát triển!');
}
