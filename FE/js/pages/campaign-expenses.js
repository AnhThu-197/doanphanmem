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
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 class="page-title">Quản lý Chi phí Chiến dịch</h2>
            <button class="btn btn-primary" onclick="openExpenseModalInline()">
                <i class="fas fa-plus"></i> Thêm Chi phí
            </button>
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

        <!-- Thông báo hướng dẫn -->
        <div style="background: #dbeafe; padding: 20px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #1e40af; margin-bottom: 10px;">
                <i class="fas fa-info-circle"></i> Hướng dẫn Quản lý Chi phí
            </h3>
            <ul style="color: #1e40af; margin-left: 20px; line-height: 1.8;">
                <li>Nhập các khoản chi phí thực tế cho từng chiến dịch</li>
                <li>Hệ thống tự động tổng hợp và cập nhật vào chiến dịch</li>
                <li>Theo dõi ngân sách và cảnh báo khi vượt mức</li>
                <li>Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ</li>
            </ul>
        </div>

        <!-- Danh sách chiến dịch -->
        <h3 style="margin-bottom: 15px;">Chiến dịch đang chạy</h3>
        <div id="campaignExpenseCards" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; margin-bottom: 40px;">
            ${renderCampaignExpenseCards(campaigns)}
        </div>

        <!-- Danh sách chi phí gần đây -->
        <h3 style="margin-bottom: 15px;">Chi phí gần đây</h3>
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <table>
                <thead>
                    <tr>
                        <th>Mã</th>
                        <th>Chiến dịch</th>
                        <th>Tên Khoản chi</th>
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
    `;
}

function renderCampaignExpenseCards(campaigns) {
    if (campaigns.length === 0) {
        return `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">
                <i class="fas fa-bullhorn" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>Chưa có chiến dịch nào</p>
            </div>
        `;
    }
    
    return campaigns.map(campaign => {
        const percentage = campaign.budget > 0 ? (campaign.actualSpent / campaign.budget * 100).toFixed(1) : 0;
        const isOverBudget = campaign.actualSpent > campaign.budget;
        
        return `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ${isOverBudget ? '#ef4444' : '#3b82f6'};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <h3 style="margin: 0 0 5px 0; font-size: 16px;">${campaign.name}</h3>
                        <span class="status ${campaign.status === 'active' ? 'customer' : 'lead'}" style="font-size: 11px;">
                            ${campaign.status === 'active' ? 'Đang chạy' : 'Hoàn thành'}
                        </span>
                    </div>
                    <button class="btn btn-primary" onclick="openExpenseModalInline(${campaign.id})" style="padding: 6px 12px; font-size: 13px;">
                        <i class="fas fa-plus"></i> Thêm chi phí
                    </button>
                </div>
                
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
                    <div style="display: flex; justify-content: space-between;">
                        <span style="font-size: 13px; color: #64748b;">Còn lại</span>
                        <strong style="font-size: 14px; color: ${isOverBudget ? '#ef4444' : '#3b82f6'};">
                            ${formatCurrency(campaign.budget - campaign.actualSpent)}
                        </strong>
                    </div>
                </div>
                
                <div style="background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden; margin-bottom: 5px;">
                    <div style="background: ${isOverBudget ? '#ef4444' : '#3b82f6'}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s;"></div>
                </div>
                <div style="text-align: right; font-size: 12px; color: ${isOverBudget ? '#ef4444' : '#64748b'};">
                    ${percentage}% ${isOverBudget ? '(Vượt ngân sách)' : ''}
                </div>
                
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <button class="btn btn-secondary" onclick="viewCampaignExpensesDetail(${campaign.id})" style="width: 100%; padding: 8px; font-size: 13px;">
                        <i class="fas fa-list"></i> Xem chi tiết chi phí
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
            <td><span class="status lead">${expense.type}</span></td>
            <td><strong style="color: #ef4444;">${formatCurrency(expense.amount)}</strong></td>
            <td>${formatDate(expense.date)}</td>
            <td>
                <span class="status ${expense.source === 'Nhập thủ công' ? 'suspect' : 'customer'}" style="font-size: 11px;">
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

                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <p style="color: #92400e; margin: 0; font-size: 13px;">
                            <i class="fas fa-info-circle"></i> 
                            Chi phí từ API (Facebook Ads, Google Ads) sẽ tự động đồng bộ. 
                            Chỉ nhập thủ công các chi phí khác.
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
