// ============================================
// APP.JS - Entry point, router, init
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    if (!AUTH.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    initializeDashboard();
    setupMenuVisibility();
    setupMenuListeners();
    setupFormListeners();
    setupModalForms();
    loadPage('dashboard');
});

// ---- Khởi tạo header ----
function initializeDashboard() {
    const user = AUTH.getCurrentUser();
    if (!user) return;
    document.getElementById('userName').textContent   = user.name;
    document.getElementById('userRole').textContent   = getRoleLabel(user.role);
    document.getElementById('userAvatar').textContent = user.avatar || user.name.split(' ').pop().substring(0, 2).toUpperCase();
}

// ---- Hiển thị menu theo role ----
function setupMenuVisibility() {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const visiblePages = {
        employee: ['dashboard', 'customers', 'campaigns', 'contracts', 'send-message', 'profile', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates'],
        manager:  ['dashboard', 'customers', 'campaigns', 'contracts', 'campaign-expenses', 'send-message', 'profile', 'reports', 'manage-employees', 'trash', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates', 'api-sync', 'financial-sync'],
        admin:    ['dashboard', 'user-management', 'settings', 'profile']
    };

    const allowedPages = visiblePages[user.role] || visiblePages.employee;
    document.querySelectorAll('.sidebar-menu li[data-page]').forEach(item => {
        item.style.display = allowedPages.includes(item.dataset.page) ? 'block' : 'none';
    });
}

// ---- Menu click listeners ----
function setupMenuListeners() {
    const menuItems = document.querySelectorAll('.sidebar-menu li[data-page]');
    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menuItems.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            loadPage(this.dataset.page);
        });
    });
}

// ---- Prevent default form submit ----
function setupFormListeners() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', e => e.preventDefault());
    });
}

// ---- Attach modal form listeners ----
function setupModalForms() {
    const customerForm    = document.getElementById('customerForm');
    const campaignForm    = document.getElementById('campaignForm');
    const interactionForm = document.getElementById('interactionForm');
    const templateForm    = document.getElementById('templateForm');
    const sendMessageForm = document.getElementById('sendMessageForm');

    if (customerForm)    customerForm.onsubmit = saveCustomer;
    if (campaignForm)    campaignForm.onsubmit = saveCampaign;
    if (interactionForm) interactionForm.onsubmit = saveInteraction;
    if (templateForm)    templateForm.onsubmit = saveTemplate;
    if (sendMessageForm) sendMessageForm.onsubmit = sendMessage;

    setTimeout(() => {
        const searchInput = document.getElementById('searchCustomerInput');
        if (searchInput) searchInput.oninput = applyCustomerFilter;
    }, 500);
}

// ---- Router ----
function loadPage(page) {
    switch (page) {
        case 'dashboard':        loadDashboard();                    break;
        case 'customers':        loadCustomers();                    break;
        case 'campaigns':        loadCampaigns();                    break;
        case 'revenue-sync':     loadRevenueSync();                  break;
        case 'contracts':        loadContracts();                    break;
        case 'campaign-expenses': loadCampaignExpenses();            break;
        case 'send-message':     loadSendMessage();                  break;
        case 'trial-management': loadTrialManagement();              break;
        case 'automation':       loadAutomation();                   break;
        case 'smart-reminders':  loadSmartReminders();               break;
        case 'merge-duplicates': loadMergeDuplicates();              break;
        case 'api-sync':         openApiIntegrationSettings();       break;
        case 'financial-sync':   openFinancialIntegrationSettings(); break;
        case 'profile':          loadProfile();                      break;
        case 'reports':          loadReports();                      break;
        case 'manage-employees': loadManageEmployees();              break;
        case 'trash':            loadTrash();                        break;
        case 'user-management':  loadUserManagement();               break;
        case 'settings':         loadSettings();                     break;
        default:                 loadDashboard();
    }
}
