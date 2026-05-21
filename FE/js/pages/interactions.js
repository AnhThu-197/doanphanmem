// ============================================
// INTERACTIONS PAGE
// ============================================

function loadInteractions() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <h2 class="page-title">Quản lý Tương tác</h2>
        <div class="table-container">
            <div class="table-header">
                <h3>Danh sách Tương tác</h3>
                <button class="btn-add" onclick="openInteractionModal()">+ Thêm Tương tác</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Khách hàng</th>
                        <th>Loại</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    ${DATA.interactions.map(i => `
                        <tr>
                            <td>${DATA.customers.find(c => c.id === i.customerId)?.name || 'N/A'}</td>
                            <td>${getInteractionTypeLabel(i.type)}</td>
                            <td>${i.content}</td>
                            <td>${i.date}</td>
                            <td>
                                <button class="btn-edit" onclick="editInteraction(${i.id})">Sửa</button>
                                <button class="btn-delete" onclick="deleteInteraction(${i.id})">Xóa</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function openInteractionModal() {
    document.getElementById('interactionModal').style.display = 'block';
    document.body.classList.add('modal-open');
    populateCustomerDropdown('interactionCustomer');
    loadEmployeeDropdown('interactionEmployee', true);
    
    // Set default employee to current user
    const currentUser = AUTH.getCurrentUser();
    if (currentUser) {
        document.getElementById('interactionEmployee').value = currentUser.id;
    }
}

function editInteraction(id) {
    updateInteraction(id);
}

function deleteInteraction(id) {
    if (confirm('Bạn có chắc muốn xóa?')) {
        const index = DATA.interactions.findIndex(i => i.id === id);
        if (index > -1) DATA.interactions.splice(index, 1);
        loadInteractions();
    }
}

function updateInteraction(interactionId) {
    const interaction = DATA.interactions.find(i => i.id === interactionId);
    if (!interaction) return;
    
    populateCustomerDropdown('interactionCustomer');
    loadEmployeeDropdown('interactionEmployee', true);
    
    document.getElementById('interactionCustomer').value = interaction.customerId;
    document.getElementById('interactionEmployee').value = interaction.employeeId || '';
    document.getElementById('interactionType').value = interaction.type;
    document.getElementById('interactionContent').value = interaction.content;
    document.getElementById('interactionNotes').value = interaction.notes || '';
    
    document.getElementById('interactionModal').dataset.interactionId = interactionId;
    document.getElementById('interactionModal').style.display = 'block';
}

function saveInteraction(e) {
    e.preventDefault();
    const interactionId = document.getElementById('interactionModal').dataset.interactionId;
    const currentUser = AUTH.getCurrentUser();
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    const interactionData = {
        customerId: parseInt(document.getElementById('interactionCustomer').value),
        employeeId: parseInt(document.getElementById('interactionEmployee').value) || null,
        type: document.getElementById('interactionType').value,
        content: document.getElementById('interactionContent').value,
        notes: document.getElementById('interactionNotes').value,
        updatedDate: now
    };
    
    if (interactionId) {
        // Cập nhật
        const interaction = DATA.interactions.find(i => i.id === parseInt(interactionId));
        if (interaction) {
            Object.assign(interaction, interactionData);
            alert('✓ Cập nhật tương tác thành công!');
            DATA.addAuditLog('UPDATE_INTERACTION', `Cập nhật tương tác: ${interactionData.content}`, currentUser.id);
        }
    } else {
        // Thêm mới
        const newId = Math.max(...DATA.interactions.map(i => i.id), 0) + 1;
        DATA.interactions.push({
            id: newId,
            ...interactionData,
            date: now,
            file: null
        });
        alert('✓ Thêm tương tác thành công!');
        DATA.addAuditLog('ADD_INTERACTION', `Thêm tương tác: ${interactionData.content}`, currentUser.id);
    }
    
    closeModal('interactionModal');
    loadInteractions();
}
