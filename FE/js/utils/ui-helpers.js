// ============================================
// UI HELPERS - Tab, Modal, Dropdown, Upload
// ============================================

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    const selectedTab = document.getElementById(tabId);
    if (selectedTab) selectedTab.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

// Populate dropdown khách hàng
function populateCustomerDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
    DATA.customers.filter(c => !c.deleted).forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = customer.name;
        select.appendChild(option);
    });
}

// Populate dropdown nhân viên (hỗ trợ API session và giữ value được chọn)
function loadEmployeeDropdown(selectId, includeEmpty = true, selectedValue = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const isApiSession = typeof AUTH !== 'undefined' && AUTH.getCurrentUser()?.authSource === 'api';

    if (isApiSession) {
        if (typeof DATA === 'undefined') window.DATA = {};
        
        const renderDropdownOptions = (employees) => {
            let html = includeEmpty ? '<option value="">-- Chọn nhân viên --</option>' : '';
            employees.forEach(emp => {
                const isSelected = selectedValue !== null && Number(emp.id) === Number(selectedValue) ? 'selected' : '';
                html += `<option value="${emp.id}" ${isSelected}>${emp.name} (${emp.position})</option>`;
            });
            select.innerHTML = html;
            if (selectedValue !== null) {
                select.value = selectedValue;
            }
        };

        if (DATA.backendEmployees && DATA.backendEmployees.length > 0) {
            renderDropdownOptions(DATA.backendEmployees);
        } else {
            select.innerHTML = includeEmpty ? '<option value="">-- Đang tải nhân viên... --</option>' : '<option value="">Đang tải...</option>';
            
            if (!DATA.backendEmployeesPromise) {
                DATA.backendEmployeesPromise = API_SERVICES.nhanVien.list()
                    .then(response => {
                        const apiData = Array.isArray(response?.data)
                            ? response.data
                            : Array.isArray(response)
                                ? response
                                : Array.isArray(response?.data?.content)
                                    ? response.data.content
                                    : [];
                        DATA.backendEmployees = apiData.map(nv => ({
                            id: nv.maNhanVien,
                            name: nv.hoTen || nv.email || '',
                            position: nv.chucVu || 'Nhân viên'
                        }));
                        return DATA.backendEmployees;
                    });
            }

            DATA.backendEmployeesPromise
                .then(employees => {
                    renderDropdownOptions(employees);
                })
                .catch(error => {
                    console.error('Lỗi tải nhân viên cho dropdown:', error);
                    select.innerHTML = includeEmpty ? '<option value="">-- Lỗi tải nhân viên --</option>' : '<option value="">Lỗi tải</option>';
                    DATA.backendEmployeesPromise = null;
                });
        }
    } else {
        // Chế độ mock
        let html = includeEmpty ? '<option value="">-- Chọn nhân viên --</option>' : '';
        if (typeof AUTH !== 'undefined' && AUTH.users) {
            AUTH.users.forEach(user => {
                const isSelected = selectedValue !== null && Number(user.id) === Number(selectedValue) ? 'selected' : '';
                html += `<option value="${user.id}" ${isSelected}>${user.name} (${user.position || user.role})</option>`;
            });
        }
        select.innerHTML = html;
        if (selectedValue !== null) {
            select.value = selectedValue;
        }
    }
}

// Populate dropdown mẫu thông điệp
function populateTemplateDropdown(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = '<option value="">-- Chọn mẫu --</option>';
    DATA.messageTemplates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = `${template.name} (${template.type})`;
        select.appendChild(option);
    });
}

// File upload display
function updateFileName(input, displayId) {
    const label   = input.nextElementSibling;
    const display = document.getElementById(displayId);

    if (input.files && input.files.length > 0) {
        const file     = input.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        display.innerHTML = `<i class="fas fa-file-alt"></i> ${file.name} (${fileSize} MB)`;
        if (label) label.classList.add('has-file');
    } else {
        display.textContent = 'Chọn file hoặc kéo thả vào đây';
        if (label) label.classList.remove('has-file');
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function setupFileUploadDragDrop() {
    const fileLabels = document.querySelectorAll('.file-upload-label');
    fileLabels.forEach(label => {
        const input = label.previousElementSibling;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
            label.addEventListener(ev, preventDefaults, false);
            document.body.addEventListener(ev, preventDefaults, false);
        });
        ['dragenter', 'dragover'].forEach(ev => {
            label.addEventListener(ev, () => label.classList.add('drag-over'), false);
        });
        ['dragleave', 'drop'].forEach(ev => {
            label.addEventListener(ev, () => label.classList.remove('drag-over'), false);
        });
        label.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (input && files.length > 0) {
                input.files = files;
                const displayId = label.querySelector('span')?.id;
                if (displayId) updateFileName(input, displayId);
            }
        }, false);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(setupFileUploadDragDrop, 1000);
});
