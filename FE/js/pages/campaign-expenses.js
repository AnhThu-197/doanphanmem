// ============================================
// CAMPAIGN EXPENSES PAGE
// ============================================

function loadCampaignExpenses() {
    loadCampaignExpensesPage();
}

function loadCampaignExpensesPage() {
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
        <div class="page-header">
            <div>
                <h1>Chi phí Chiến dịch</h1>
                <p>Theo dõi và quản lý chi phí thực tế của từng chiến dịch.</p>
            </div>
            <button class="btn btn-primary" onclick="openExpenseModalInline()">
                <i class="fas fa-plus"></i> Thêm Chi phí
            </button>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-wallet"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(totalBudget)}</h3>
                    <p>Tổng ngân sách</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-coins"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(totalSpent)}</h3>
                    <p>Đã chi</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-receipt"></i></div>
                <div class="stat-info">
                    <h3>${totalExpenses}</h3>
                    <p>Số khoản chi</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-piggy-bank"></i></div>
                <div class="stat-info">
                    <h3>${formatCurrency(remaining)}</h3>
                    <p>Còn lại</p>
                </div>
            </div>
        </div>

        <div class="info-box">
            <h4><i class="fas fa-info-circle"></i> Hướng dẫn</h4>
            <ul>
                <li>Nhập các khoản chi phí thực tế cho từng chiến dịch</li>
                <li>Hệ thống tự động tổng hợp và cập nhật vào chiến dịch</li>
                <li>Theo dõi ngân sách và cảnh báo khi vượt mức</li>
                <li>Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ</li>
            </ul>
        </div>

        <div>
            <h3 style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Chiến dịch đang chạy</h3>
            <div id="campaignExpenseCards" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-bottom: 32px;">
                ${renderCampaignExpenseCards(campaigns)}
            </div>
        </div>

        <div class="table-container">
            <div class="table-header">
                <h3>Chi phí gần đây</h3>
            </div>
            <div class="data-table-wrapper">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Mã</th>
                            <th>Chiến dịch</th>
                            <th>Tên khoản chi</th>
                            <th>Loại</th>
                            <th>Số tiền</th>
                            <th>Ngày</th>
                            <th>Nguồn</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="expensesTableInline">
                        ${renderExpensesTableInline(expenses)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}


function renderCampaignExpenseCards(campaigns) {
    if (campaigns.length === 0) {
        return `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fas fa-bullhorn" style="font-size: 36px; margin-bottom: 12px; display: block; opacity: 0.4;"></i>
                <p style="font-size: 13px;">Chưa có chiến dịch nào</p>
            </div>
        `;
    }
    
    return campaigns.map(campaign => {
        const percentage = campaign.budget > 0 ? (campaign.actualSpent / campaign.budget * 100).toFixed(1) : 0;
        const isOverBudget = campaign.actualSpent > campaign.budget;
        
        return `
            <div class="expense-campaign-card ${isOverBudget ? 'over-budget' : ''}">
                <div class="campaign-card-header">
                    <div>
                        <h3>${campaign.name}</h3>
                        <span class="status-badge ${campaign.status === 'active' ? 'active' : 'planning'}">
                            ${campaign.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                        </span>
                    </div>
                    <button class="btn btn-primary" onclick="openExpenseModalInline(${campaign.id})" style="padding: 6px 10px; font-size: 12px;">
                        <i class="fas fa-plus"></i> Thêm
                    </button>
                </div>
                
                <div class="budget-row">
                    <span>Ngân sách</span>
                    <strong>${formatCurrency(campaign.budget)}</strong>
                </div>
                <div class="budget-row">
                    <span>Đã chi</span>
                    <strong class="${isOverBudget ? 'over' : 'ok'}">${formatCurrency(campaign.actualSpent)}</strong>
                </div>
                <div class="budget-row">
                    <span>Còn lại</span>
                    <strong class="${isOverBudget ? 'over' : ''}">${formatCurrency(campaign.budget - campaign.actualSpent)}</strong>
                </div>
                
                <div class="progress-bar-track">
                    <div class="progress-bar-fill ${isOverBudget ? 'over' : ''}" style="width: ${Math.min(percentage, 100)}%;"></div>
                </div>
                <div class="progress-label ${isOverBudget ? 'over' : ''}">
                    ${percentage}%${isOverBudget ? ' · Vượt ngân sách' : ''}
                </div>
                
                <div class="campaign-card-footer">
                    <button class="btn btn-secondary" onclick="viewCampaignExpensesDetail(${campaign.id})" style="width: 100%; font-size: 12px;">
                        <i class="fas fa-list"></i> Xem chi tiết
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


function renderExpensesTableInline(expenses) {
    if (expenses.length === 0) {
        return `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-money-bill-wave" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                    <p>Chưa có chi phí nào</p>
                </td>
            </tr>
        `;
    }
    
    return expenses.slice(0, 10).map(expense => `
        <tr>
            <td><strong>#${expense.id}</strong></td>
            <td>${expense.campaignName}</td>
            <td>${expense.name}</td>
            <td><span class="status-badge planning">${expense.type}</span></td>
            <td><strong class="text-danger">${formatCurrency(expense.amount)}</strong></td>
            <td>${formatDate(expense.date)}</td>
            <td>
                <span class="status-badge ${expense.source === 'Nhập thủ công' ? 'planning' : 'active'}">
                    ${expense.source}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editExpenseInline(${expense.id})" title="Sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteExpenseInline(${expense.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

}

function openExpenseModalInline(campaignId = null) {
    editingExpenseIdInline = null;
    
    const modalHTML = `
        <div id="expenseModalInline" class="modal" style="display: block;">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2>Thêm Chi phí</h2>
                    <button class="close-btn" onclick="closeExpenseModalInline()">&times;</button>
                </div>
                <form id="expenseFormInline" onsubmit="saveExpenseInline(event)">
                    <div class="form-group">
                        <label for="expenseCampaignInline">Chiến dịch *</label>
                        <select id="expenseCampaignInline" required>
                            <option value="">-- Chọn chiến dịch --</option>
                            ${DATA.campaigns.filter(c => !c.deleted).map(c => 
                                `<option value="${c.id}" ${campaignId === c.id ? 'selected' : ''}>${c.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="expenseNameInline">Tên Khoản chi *</label>
                        <input type="text" id="expenseNameInline" required placeholder="VD: Quảng cáo Facebook tuần 1">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div class="form-group">
                            <label for="expenseTypeInline">Loại Chi phí *</label>
                            <select id="expenseTypeInline" required>
                                <option value="">-- Chọn loại --</option>
                                <option value="Quảng cáo trực tuyến">Quảng cáo trực tuyến</option>
                                <option value="Quảng cáo ngoài trời">Quảng cáo ngoài trời</option>
                                <option value="Thiết kế">Thiết kế</option>
                                <option value="Sản xuất nội dung">Sản xuất nội dung</option>
                                <option value="Sự kiện">Sự kiện</option>
                                <option value="In ấn">In ấn</option>
                                <option value="Nhân sự">Nhân sự</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="expenseAmountInline">Số tiền (VND) *</label>
                            <input type="number" id="expenseAmountInline" required min="0" step="1000" placeholder="0">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="expenseDateInline">Ngày ghi nhận *</label>
                        <input type="date" id="expenseDateInline" required>
                    </div>

                    <div class="form-group">
                        <label for="expenseNoteInline">Ghi chú</label>
                        <textarea id="expenseNoteInline" rows="3" placeholder="Mô tả chi tiết về khoản chi..."></textarea>
                    </div>

                    <div class="info-box" style="margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 12px; color: var(--text-secondary);">
                            <i class="fas fa-info-circle"></i>
                            Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ. Chỉ nhập thủ công các chi phí khác.
                        </p>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeExpenseModalInline()">Hủy</button>
                        <button type="submit" class="btn btn-primary">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('expenseModalInline');
    if (existingModal) {
        existingModal.remove();
    }
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
    
    // Set today's date
    document.getElementById('expenseDateInline').valueAsDate = new Date();
}

function closeExpenseModalInline() {
    const modal = document.getElementById('expenseModalInline');
    if (modal) {
        modal.remove();
    }
    document.body.classList.remove('modal-open');
}

function saveExpenseInline(event) {
    event.preventDefault();
    
    const campaignId = parseInt(document.getElementById('expenseCampaignInline').value);
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    
    const formData = {
        campaignId: campaignId,
        campaignName: campaign.name,
        name: document.getElementById('expenseNameInline').value,
        type: document.getElementById('expenseTypeInline').value,
        amount: parseFloat(document.getElementById('expenseAmountInline').value),
        date: document.getElementById('expenseDateInline').value,
        source: 'Nhập thủ công',
        note: document.getElementById('expenseNoteInline').value
    };
    
    if (editingExpenseIdInline) {
        const index = DATA.campaignExpenses.findIndex(e => e.id === editingExpenseIdInline);
        DATA.campaignExpenses[index] = { ...DATA.campaignExpenses[index], ...formData };
        alert('✓ Cập nhật chi phí thành công!');
    } else {
        const newExpense = {
            id: DATA.campaignExpenses.length > 0 ? Math.max(...DATA.campaignExpenses.map(e => e.id)) + 1 : 1,
            ...formData
        };
        DATA.campaignExpenses.push(newExpense);
        alert('✓ Thêm chi phí thành công!');
    }
    
    closeExpenseModalInline();
    loadCampaignExpensesPage();
    DATA.addAuditLog('ADD_EXPENSE', `Thêm chi phí: ${formData.name}`, AUTH.getCurrentUser().id);
}

function editExpenseInline(id) {
    const expense = DATA.campaignExpenses.find(e => e.id === id);
    if (!expense) return;
    
    editingExpenseIdInline = id;
    openExpenseModalInline(expense.campaignId);
    
    setTimeout(() => {
        document.getElementById('expenseNameInline').value = expense.name;
        document.getElementById('expenseTypeInline').value = expense.type;
        document.getElementById('expenseAmountInline').value = expense.amount;
        document.getElementById('expenseDateInline').value = expense.date;
        document.getElementById('expenseNoteInline').value = expense.note || '';
        document.querySelector('#expenseModalInline .modal-header h2').textContent = 'Sửa Chi phí';
    }, 100);
}

function deleteExpenseInline(id) {
    if (!confirm('Bạn có chắc muốn xóa chi phí này?')) return;
    
    DATA.campaignExpenses = DATA.campaignExpenses.filter(e => e.id !== id);
    loadCampaignExpensesPage();
    alert('✓ Đã xóa chi phí!');
    DATA.addAuditLog('DELETE_EXPENSE', `Xóa chi phí ID: ${id}`, AUTH.getCurrentUser().id);
}

function viewCampaignExpensesDetail(campaignId) {
    const campaign = DATA.campaigns.find(c => c.id === campaignId);
    const expenses = DATA.campaignExpenses.filter(e => e.campaignId === campaignId);
    
    alert(`Chi tiết chi phí: ${campaign.name}\n\nTổng: ${expenses.length} khoản chi\nTổng tiền: ${formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}`);
}
