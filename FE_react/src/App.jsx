// FE/src/App.jsx
import React, { useState, useEffect } from 'react';
import { API, checkBackendHealth } from './api';

// Extracted Modals
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';
import CustomerModal from './components/modals/CustomerModal';
import TrialModal from './components/modals/TrialModal';
import AppointmentModal from './components/modals/AppointmentModal';
import ApptResultModal from './components/modals/ApptResultModal';
import InteractionModal from './components/modals/InteractionModal';
import TemplateModal from './components/modals/TemplateModal';
import SendMessageModal from './components/modals/SendMessageModal';
import CustomerDetailModal from './components/modals/CustomerDetailModal';

export default function App() {
  // Authentication & Session
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 3-Step Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  // Core Entity States (using 100% English schemas matching FE_vanilla)
  const [customers, setCustomers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [config, setConfig] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active sub-tabs
  const [custActiveSubTab, setCustActiveSubTab] = useState('customers-list');
  const [campaignActiveSubTab, setCampaignActiveSubTab] = useState('campaigns-list');
  const [automationActiveSubTab, setAutomationActiveSubTab] = useState('automation-workflow');
  const [configActiveTab, setConfigActiveTab] = useState(1); // 1: Company, 2: System, 3: Notifications, 4: Security, 5: Backup
  const [profileActiveSubTab, setProfileActiveSubTab] = useState('profile-info');
  const [trashActiveTab, setTrashActiveTab] = useState('customers');

  // Customer Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');

  // Modals & Form States
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCust, setEditingCust] = useState(null);
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '', company: '', status: 'lead', source: 'facebook', industry: 'Công nghệ', score: 50, trialStartDate: '', trialDays: 0 });

  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [interForm, setInterForm] = useState({ customerId: '', type: 'call', content: '', notes: '' });
  const [uploadingFile, setUploadingFile] = useState({});
  const [selectedFilesForInter, setSelectedFilesForInter] = useState([]);
  const [editingInter, setEditingInter] = useState(null);

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [apptForm, setApptForm] = useState({ customerId: '', title: '', type: 'call', date: '', time: '', reminderBefore: 30, notes: '' });

  const [showApptResultModal, setShowApptResultModal] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [apptResultForm, setApptResultForm] = useState({ result: 'success', resultNotes: '' });

  const [showTrialModal, setShowTrialModal] = useState(false);
  const [selectedTrialCust, setSelectedTrialCust] = useState(null);
  const [trialDetails, setTrialDetails] = useState(null);
  const [trialForm, setTrialForm] = useState({
    customerId: '',
    startDate: '',
    durationDays: 30,
    status: 'Đang dùng thử',
    reminderDays: 3,
    reminderEmail: '',
    notes: '',
    feature1: true,
    feature2: true,
    support1: true,
    support2: false
  });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', content: '', type: 'email' });
  const [msgSubTab, setMsgSubTab] = useState('history');
  const [sendingMsg, setSendingMsg] = useState(false);

  const [showSendModal, setShowSendModal] = useState(false);
  const [sendForm, setSendForm] = useState({
    customerId: '',
    templateId: '',
    type: 'email',
    content: '',
    promoTitle: '',
    promoDescription: '',
    promoCode: '',
    promoExpiry: '',
    promoLink: '',
    isScheduled: false,
    scheduleTime: '',
    trackOpen: true,
    notes: ''
  });

  const [showCustDetailModal, setShowCustDetailModal] = useState(false);
  const [selectedDetailCust, setSelectedDetailCust] = useState(null);
  const [custDetailSubTab, setCustDetailSubTab] = useState('detail-info');
  const [detailInterForm, setDetailInterForm] = useState({ type: 'call', date: '', content: '', notes: '' });

  // System Configuration Forms
  const [companyForm, setCompanyForm] = useState({});
  const [systemForm, setSystemForm] = useState({});
  const [notificationForm, setNotificationForm] = useState({});
  const [securityForm, setSecurityForm] = useState({});
  const [backupForm, setBackupForm] = useState({});

  // Static mock arrays kept exactly y chang from original FE_vanilla
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: 'Chiến dịch Xuân 2024', managerId: 2, type: 'Online Ads', description: 'Khuyến mãi mùa xuân', startDate: '2024-03-01', endDate: '2024-03-31', budget: 50000000, status: 'active', actualSpent: 35000000, revenue: 120000000, leads: 450, conversions: 85, clicks: 12500, impressions: 250000, costBreakdown: { advertising: 25000000, content: 5000000, tools: 3000000, other: 2000000 } },
    { id: 2, name: 'Chiến dịch Email Marketing', managerId: 2, type: 'Email', description: 'Gửi email tới khách hàng', startDate: '2024-02-15', endDate: '2024-02-28', budget: 10000000, status: 'completed', actualSpent: 8500000, revenue: 45000000, leads: 320, conversions: 68, clicks: 8500, impressions: 150000, costBreakdown: { advertising: 5000000, content: 2000000, tools: 1000000, other: 500000 } }
  ]);

  const [contracts, setContracts] = useState([
    { id: 1, name: 'Hợp đồng dịch vụ Marketing Q1/2024', customerName: 'Công ty ABC', campaignName: 'Chiến dịch Xuân 2024', value: 50000000, status: 'Thắng', createdDate: '2024-01-15' },
    { id: 2, name: 'Hợp đồng quảng cáo Facebook', customerName: 'Công ty XYZ', campaignName: 'Chiến dịch Email Marketing', value: 30000000, status: 'Đang thương lượng', createdDate: '2024-02-01' }
  ]);

  const [expenses, setExpenses] = useState([
    { id: 1, campaignName: 'Chiến dịch Xuân 2024', name: 'Quảng cáo Facebook', type: 'Quảng cáo trực tuyến', amount: 15000000, date: '2024-03-10', note: 'Chi phí tuần 1' },
    { id: 2, campaignName: 'Chiến dịch Xuân 2024', name: 'Thiết kế banner', type: 'Thiết kế', amount: 5000000, date: '2024-03-05', note: 'Designer Banner' }
  ]);

  const [deleteRequests, setDeleteRequests] = useState([
    { id: 1, customerId: 2, customerName: 'Công ty XYZ', reason: 'Khách hàng không còn hoạt động, SĐT không liên lạc được', requestedBy: 'Trần Minh Chiến', requestedDate: '25/03/2026', status: 'pending' }
  ]);

  const [employees, setEmployees] = useState([
    { id: 1, name: 'Trần Minh Chiến', email: 'haip59621@gmail.com', phone: '0987654321', avatar: 'TC', department: 'Marketing', position: 'Nhân viên marketing', rating: 4.8 },
    { id: 2, name: 'Nguyễn Hoàng Anh Thư', email: 'manager@company.com', phone: '0912345678', avatar: 'AT', department: 'Marketing', position: 'Trưởng phòng', rating: 4.9 }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'LOGIN', message: 'Người dùng Trần Minh Chiến đăng nhập', timestamp: new Date().toLocaleString() }
  ]);

  const [automationWorkflows, setAutomationWorkflows] = useState([
    { id: 1, name: 'Chăm sóc Lead mới', trigger: 'new_lead', status: 'active', actions: ['send_email', 'wait_3_days', 'condition_check'], createdDate: '2024-03-01' },
    { id: 2, name: 'Theo dõi khách hàng không mở email', trigger: 'email_not_opened', status: 'active', actions: ['send_email_reminder'], createdDate: '2024-03-05' }
  ]);

  const [leadScoringRules, setLeadScoringRules] = useState([
    { id: 1, action: 'Khách truy cập trang bảng giá', points: 10, active: true },
    { id: 2, action: 'Khách tải tài liệu', points: 5, active: true },
    { id: 3, action: 'Khách mở Email', points: 3, active: true },
    { id: 4, action: 'Khách click link trong Email', points: 8, active: true },
    { id: 5, action: 'Khách điền form liên hệ', points: 15, active: true },
    { id: 6, action: 'Khách tham gia webinar', points: 20, active: true }
  ]);

  const [leadScoringThresholds, setLeadScoringThresholds] = useState([
    { score: 90, action: 'Chuyển thành Evangelist (Khách hàng trung thành)', status: 'evangelist', active: true },
    { score: 70, action: 'Chuyển thành Customer (Khách hàng chính thức)', status: 'customer', active: true },
    { score: 50, action: 'Chuyển thành Prospect (Khách hàng triển vọng)', status: 'prospect', active: true },
    { score: 30, action: 'Chuyển thành Lead (Khách hàng tiềm năng mới)', status: 'lead', active: true },
    { score: 0, action: 'Suspect (Người truy cập)', status: 'suspect', active: true }
  ]);

  // Load Session and DB values
  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const online = await checkBackendHealth();
    setBackendOnline(online);

    try {
      const custData = await API.getCustomers();
      setCustomers(custData);

      const apptData = await API.getAppointments();
      setAppointments(apptData);

      const interData = await API.getInteractions();
      setInteractions(interData);

      const tempData = await API.getTemplates();
      setTemplates(tempData);

      const configData = await API.getConfig();
      setConfig(configData);
      if (configData) {
        setCompanyForm({ companyName: configData.companyName, email: configData.email, phone: configData.phone, website: configData.website, address: configData.address });
        setSystemForm({ timezone: configData.timezone, dateFormat: configData.dateFormat, currency: configData.currency, language: configData.language });
        setNotificationForm({ emailNotifications: configData.emailNotifications, smsNotifications: configData.smsNotifications, browserNotifications: configData.browserNotifications });
        setSecurityForm({ sessionTimeout: configData.sessionTimeout, maxFailedAttempts: configData.maxFailedAttempts, passwordExpiryDays: configData.passwordExpiryDays, twoFactorAuth: configData.twoFactorAuth });
        setBackupForm({ autoBackup: configData.autoBackup, backupFrequency: configData.backupFrequency });
      }

      const msgHist = await API.getMessageHistory();
      setMessageHistory(msgHist || []);
    } catch (err) {
      console.error('Lỗi nạp dữ liệu từ backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // --- AUTHENTICATION & LOGIN ---
  const handleLogin = async (e, demoUser = null, demoPass = null) => {
    if (e) e.preventDefault();
    setLoginError('');
    const u = demoUser || loginUsername;
    const p = demoPass || loginPassword;
    try {
      const res = await API.login(u, p);
      if (res.success) {
        setUser(res.user);
        loadData();
      } else {
        setLoginError(res.message);
      }
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    API.currentUser = null;
  };

  // Forgot password OTP trigger
  const triggerSendOtp = async (e) => {
    e.preventDefault();
    setForgotStatus('Đang gửi mã OTP qua Gmail...');
    try {
      await API.sendOtp(forgotEmail);
      setForgotStep(2);
      setForgotStatus('Mã OTP đã được gửi! Vui lòng kiểm tra Gmail của bạn.');
    } catch (err) {
      setForgotStatus(`Lỗi: ${err.message}`);
    }
  };

  const triggerVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotStatus('Đang xác thực...');
    try {
      await API.verifyOtp(forgotEmail, forgotOtp);
      setForgotStep(3);
      setForgotStatus('Xác thực thành công! Hãy đổi mật khẩu mới.');
    } catch (err) {
      setForgotStatus(`Lỗi: ${err.message}`);
    }
  };

  const triggerResetPassword = async (e) => {
    e.preventDefault();
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotStatus('Mật khẩu xác nhận không khớp.');
      return;
    }
    setForgotStatus('Đang lưu mật khẩu...');
    try {
      await API.resetPassword(forgotEmail, forgotNewPassword);
      alert('✓ Đặt lại mật khẩu thành công! Bạn có thể tiến hành đăng nhập.');
      setShowForgotModal(false);
      setForgotStep(1);
      setForgotEmail('');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      setForgotStatus('');
    } catch (err) {
      setForgotStatus(`Lỗi: ${err.message}`);
    }
  };

  // --- CUSTOMER ACTIONS ---
  const saveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCust) {
        await API.updateCustomer(editingCust.id, custForm);
      } else {
        await API.createCustomer(custForm);
      }
      setShowCustomerModal(false);
      loadData();
    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const deleteCustomer = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      try {
        await API.deleteCustomer(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- TRASH ACTIONS ---
  const restoreCustomer = async (id) => {
    try {
      const cust = customers.find(c => c.id === id);
      if (cust) {
        await API.updateCustomer(id, { ...cust, deleted: false });
        loadData();
        alert('✓ Khôi phục khách hàng thành công!');
      }
    } catch (err) {
      alert(`Lỗi khôi phục: ${err.message}`);
    }
  };

  const permanentDeleteCustomer = async (id) => {
    if (confirm('⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn khách hàng này?\nHành động này không thể hoàn tác!')) {
      try {
        await API.permanentDeleteCustomer(id);
        loadData();
        alert('✓ Đã xóa vĩnh viễn khách hàng!');
      } catch (err) {
        alert(`Lỗi xóa vĩnh viễn: ${err.message}`);
      }
    }
  };

  const emptyTrash = async (type) => {
    if (confirm(`⚠️ XÓA VĨNH VIỄN TẤT CẢ các mục trong thùng rác?\nHành động này KHÔNG THỂ HOÀN TÁC!`)) {
      try {
        if (type === 'customers') {
          const deletedCusts = customers.filter(c => c.deleted);
          for (const c of deletedCusts) {
            await API.permanentDeleteCustomer(c.id);
          }
          loadData();
          alert('✓ Đã dọn sạch thùng rác khách hàng!');
        } else if (type === 'campaigns') {
          const updatedCampaigns = campaigns.map(c => {
            if (c.deleted) {
              return null;
            }
            return c;
          }).filter(Boolean);
          setCampaigns(updatedCampaigns);
          alert('✓ Đã dọn sạch thùng rác chiến dịch!');
        }
      } catch (err) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  const restoreCampaign = (id) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        return { ...c, deleted: false };
      }
      return c;
    });
    setCampaigns(updated);
    alert('✓ Khôi phục chiến dịch thành công!');
  };

  const permanentDeleteCampaign = (id) => {
    if (confirm('⚠️ Bạn có chắc chắn muốn xóa vĩnh viễn chiến dịch này?\nHành động này không thể hoàn tác!')) {
      const updated = campaigns.filter(c => c.id !== id);
      setCampaigns(updated);
      alert('✓ Đã xóa vĩnh viễn chiến dịch!');
    }
  };

  // --- TRIAL MANAGEMENT ---
  const openTrialDetails = async (cust) => {
    setSelectedTrialCust(cust);
    try {
      const details = await API.getTrialDetails(cust.id);
      setTrialDetails(details);
      
      const storedExtra = localStorage.getItem(`trial_extra_${cust.id}`);
      const extra = storedExtra ? JSON.parse(storedExtra) : {
        reminderDays: 3,
        reminderEmail: '',
        notes: '',
        feature1: true,
        feature2: true,
        support1: true,
        support2: false
      };

      setTrialForm({
        customerId: cust.id,
        startDate: details.startDate || '',
        durationDays: details.durationDays || 30,
        status: details.status || 'Đang dùng thử',
        reminderDays: extra.reminderDays,
        reminderEmail: extra.reminderEmail,
        notes: extra.notes,
        feature1: extra.feature1,
        feature2: extra.feature2,
        support1: extra.support1,
        support2: extra.support2
      });
      setShowTrialModal(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const saveTrial = async (e) => {
    e.preventDefault();
    try {
      const targetId = selectedTrialCust ? selectedTrialCust.id : trialForm.customerId;
      if (!targetId) {
        alert('Vui lòng chọn khách hàng!');
        return;
      }
      await API.updateTrialDetails(targetId, trialForm.startDate, trialForm.durationDays, trialForm.status);
      
      const extra = {
        reminderDays: trialForm.reminderDays,
        reminderEmail: trialForm.reminderEmail,
        notes: trialForm.notes,
        feature1: trialForm.feature1,
        feature2: trialForm.feature2,
        support1: trialForm.support1,
        support2: trialForm.support2
      };
      localStorage.setItem(`trial_extra_${targetId}`, JSON.stringify(extra));

      setShowTrialModal(false);
      loadData();
      alert('✓ Lưu dùng thử thành công! Trigger TRG04 của DB đã chạy đồng bộ để xác định trạng thái.');
    } catch (err) {
      alert(err.message);
    }
  };

  const openNewTrialModal = () => {
    setSelectedTrialCust(null);
    setTrialDetails(null);
    setTrialForm({
      customerId: '',
      startDate: new Date().toISOString().substring(0, 10),
      durationDays: 30,
      status: 'Đang dùng thử',
      reminderDays: 3,
      reminderEmail: '',
      notes: '',
      feature1: true,
      feature2: true,
      support1: true,
      support2: false
    });
    setShowTrialModal(true);
  };

  // --- APPOINTMENTS & SP09 ---
  const saveAppointment = async (e) => {
    e.preventDefault();
    try {
      await API.createAppointment(apptForm);
      setShowAppointmentModal(false);
      loadData();
      alert('✓ Đã tạo nhắc hẹn thành công qua SP09! Trigger TRG03 đã tự động thêm thông báo tương ứng cho nhân viên.');
    } catch (err) {
      alert(err.message);
    }
  };

  const openApptResult = (id) => {
    setSelectedApptId(id);
    setApptResultForm({ result: 'success', resultNotes: '' });
    setShowApptResultModal(true);
  };

  const saveApptResult = async (e) => {
    e.preventDefault();
    try {
      await API.updateAppointmentResult(selectedApptId, apptResultForm.result, apptResultForm.resultNotes);
      setShowApptResultModal(false);
      loadData();
      alert('✓ Ghi nhận kết quả lịch hẹn thành công! Dữ liệu đã tự động đồng bộ sang Lịch sử tương tác.');
    } catch (err) {
      alert(err.message);
    }
  };

  // --- INTERACTION & ATTACHMENT ---
  const saveInteraction = async (e) => {
    e.preventDefault();
    try {
      let saved;
      if (editingInter) {
        saved = await API.updateInteraction(editingInter.id, interForm);
      } else {
        saved = await API.createInteraction(interForm);
      }

      if (selectedFilesForInter.length > 0 && saved && saved.id) {
        for (const file of selectedFilesForInter) {
          await API.uploadAttachment(saved.id, file);
        }
      }

      setShowInteractionModal(false);
      setSelectedFilesForInter([]);
      setEditingInter(null);
      loadData();
      alert(editingInter ? '✓ Đã cập nhật tương tác thành công!' : '✓ Đã lưu tương tác thành công!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUploadFile = async (e, interId) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingFile({ [interId]: true });
    try {
      for (const file of files) {
        await API.uploadAttachment(interId, file);
      }
      loadData();
      alert('✓ Đính kèm các tệp tin thành công!');
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingFile({ [interId]: false });
    }
  };

  const handleDeleteFile = async (interId, fileId) => {
    if (confirm('Bạn có chắc chắn muốn gỡ bỏ tệp đính kèm này?')) {
      try {
        await API.deleteAttachment(interId, fileId);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleStartEditInter = (inter) => {
    setEditingInter(inter);
    setInterForm({
      customerId: inter.customerId,
      type: inter.type || 'call',
      content: inter.content || '',
      notes: inter.notes || ''
    });
    setSelectedFilesForInter([]);
    setShowInteractionModal(true);
  };

  const handleDeleteInter = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa lịch sử tương tác này?')) {
      try {
        await API.deleteInteraction(id);
        loadData();
        alert('✓ Xóa lịch sử tương tác thành công!');
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- CONFIGURATION ---
  const handleSaveConfig = async (e, tabIndex) => {
    e.preventDefault();
    let body = {};
    if (tabIndex === 1) body = companyForm;
    else if (tabIndex === 2) body = systemForm;
    else if (tabIndex === 3) body = notificationForm;
    else if (tabIndex === 4) body = securityForm;
    else if (tabIndex === 5) body = backupForm;

    try {
      await API.updateConfig(body);
      loadData();
      alert('✓ Lưu cấu hình thành công!');
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerBackup = async () => {
    try {
      await API.downloadBackup();
    } catch (err) {
      alert(err.message);
    }
  };

  const triggerRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await API.restoreBackup(file);
      loadData();
      alert('✓ Khôi phục cơ sở dữ liệu hệ thống từ bản sao lưu thành công!');
    } catch (err) {
      alert(err.message);
    }
  };

  // --- MARKETING TEMPLATES & MESSAGES ---
  const saveTemplate = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await API.updateTemplate(editingTemplate.id, templateForm);
      } else {
        await API.createTemplate(templateForm);
      }
      setShowTemplateModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteTemplate = async (id) => {
    if (confirm('Bạn có chắc chắn muốn xóa mẫu thông điệp này?')) {
      try {
        await API.deleteTemplate(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (sendingMsg) return;
    setSendingMsg(true);
    try {
      await API.sendMessage(sendForm);
      setShowSendModal(false);
      loadData();
      alert('✓ Gửi thông điệp chiến dịch thành công qua SP10! Số lượt sử dụng mẫu đã được cộng dồn và lịch sử tự động đồng bộ sang Tương tác.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  // Status mapping
  const getStatusLabel = (status) => {
    const labels = {
      'suspect': 'Suspect',
      'lead': 'Lead',
      'prospect': 'Prospect',
      'customer': 'Customer',
      'evangelist': 'Evangelist'
    };
    return labels[status] || status;
  };

  const getSourceLabel = (src) => {
    const labels = {
      'facebook': 'Facebook',
      'google': 'Google',
      'direct': 'Trực tiếp',
      'referral': 'Giới thiệu',
      'website': 'Website'
    };
    return labels[src] || src;
  };

  // Filter logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) || 
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === '' || c.status === filterStatus;
    const matchesSource = filterSource === '' || c.source === filterSource;

    return matchesSearch && matchesStatus && matchesSource && !c.deleted;
  });

  const openAddCust = () => {
    setEditingCust(null);
    setCustForm({ name: '', email: '', phone: '', company: '', status: 'lead', source: 'facebook', industry: 'Công nghệ', score: 50, trialStartDate: '', trialDays: 0 });
    setShowCustomerModal(true);
  };

  // Render Login view
  if (!user) {
    return (
      <div className="login-body-wrapper">
        <div className="login-container">
          <div className="login-left">
            <h2>Quản lý Khách hàng Hiệu quả &amp; Chuyên nghiệp</h2>
            <p>Hệ thống CRM toàn diện giúp doanh nghiệp quản lý khách hàng, chiến dịch marketing và tối ưu hiệu suất kinh doanh.</p>
            
            <div className="features">
              <div className="feature-item">
                <i className="fas fa-users"></i>
                <span>Quản lý khách hàng tập trung</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-chart-line"></i>
                <span>Phân tích &amp; Báo cáo chi tiết</span>
              </div>
              <div className="feature-item">
                <i className="fas fa-bullhorn"></i>
                <span>Chiến dịch Marketing thông minh</span>
              </div>
            </div>
          </div>
          
          <div className="login-right">
            <div className="login-header">
              <h1>Đăng nhập</h1>
              <p>Chào mừng trở lại với CRM System</p>
            </div>
            
            {loginError && (
              <div className="error-message">
                {loginError}
              </div>
            )}
            
            <form onSubmit={(e) => handleLogin(e)}>
              <div className="form-group">
                <label htmlFor="username">Email đăng nhập</label>
                <input 
                  type="text" id="username" name="username" placeholder="Nhập email đăng nhập" required
                  value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Mật khẩu</label>
                <input 
                  type="password" id="password" name="password" placeholder="Nhập mật khẩu" required
                  value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              
              <div style={{ textAlign: 'right', marginBottom: '14px' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setShowForgotModal(true); setForgotStep(1); setForgotStatus(''); }} style={{ color: '#2B4856', fontSize: '12px', textDecoration: 'none', fontWeight: 500 }}>
                  <i className="fas fa-key"></i> Quên mật khẩu?
                </a>
              </div>
              
              <button type="submit" className="login-btn">
                <i className="fas fa-sign-in-alt"></i> Đăng nhập
              </button>
            </form>
            
            <div className="divider">
              <span>Hoặc dùng tài khoản demo</span>
            </div>
            
            <div className="demo-users">
              <button type="button" className="demo-btn" onClick={() => { setLoginUsername('nhanvien'); setLoginPassword('123'); handleLogin(null, 'nhanvien', '123'); }}>
                <i className="fas fa-user"></i> Nhân viên Marketing
              </button>
              <button type="button" className="demo-btn" onClick={() => { setLoginUsername('truongphong'); setLoginPassword('123'); handleLogin(null, 'truongphong', '123'); }}>
                <i className="fas fa-user-tie"></i> Trưởng phòng Marketing
              </button>
              <button type="button" className="demo-btn" onClick={() => { setLoginUsername('admin'); setLoginPassword('123'); handleLogin(null, 'admin', '123'); }}>
                <i className="fas fa-user-shield"></i> Quản trị viên
              </button>
            </div>
          </div>
        </div>

        {/* Modal Quên mật khẩu */}
        <ForgotPasswordModal
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          forgotStep={forgotStep}
          setForgotStep={setForgotStep}
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          forgotOtp={forgotOtp}
          setForgotOtp={setForgotOtp}
          forgotNewPassword={forgotNewPassword}
          setForgotNewPassword={setForgotNewPassword}
          forgotConfirmPassword={forgotConfirmPassword}
          setForgotConfirmPassword={setForgotConfirmPassword}
          forgotStatus={forgotStatus}
          setForgotStatus={setForgotStatus}
          triggerSendOtp={triggerSendOtp}
          triggerVerifyOtp={triggerVerifyOtp}
          triggerResetPassword={triggerResetPassword}
        />
      </div>
    );
  }

  // Phân quyền Sidebar
  const isPageAllowed = (page) => {
    if (!user) return false;
    const role = user.role || 'employee';
    const visiblePages = {
      'employee': ['dashboard', 'customers', 'campaigns', 'send-message', 'profile', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates'],
      'manager': ['dashboard', 'customers', 'campaigns', 'campaign-expenses', 'send-message', 'profile', 'reports', 'manage-employees', 'trash', 'trial-management', 'automation', 'smart-reminders', 'merge-duplicates', 'api-sync', 'financial-sync'],
      'admin': ['dashboard', 'user-management', 'settings', 'profile']
    };
    const allowed = visiblePages[role] || visiblePages['employee'];
    return allowed.includes(page);
  };

  const getRoleLabel = (role) => {
    const labels = {
      'employee': 'Nhân viên',
      'manager': 'Trưởng phòng',
      'admin': 'Quản trị viên'
    };
    return labels[role] || role;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      {/* 1. SIDEBAR */}
      <div className="sidebar" style={{ minWidth: '260px' }}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <i className="fas fa-chart-network"></i> <span>NHÓM 8 DAPM</span>
        </div>
        <ul className="sidebar-menu">
          {isPageAllowed('dashboard') && <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}><i className="fas fa-home"></i> Tổng quan</li>}
          {isPageAllowed('customers') && <li className={activePage === 'customers' ? 'active' : ''} onClick={() => setActivePage('customers')}><i className="fas fa-users"></i> Quản lý khách hàng</li>}
          {isPageAllowed('campaigns') && <li className={activePage === 'campaigns' ? 'active' : ''} onClick={() => setActivePage('campaigns')}><i className="fas fa-bullhorn"></i> Quản lý chiến dịch</li>}
          {isPageAllowed('campaign-expenses') && <li className={activePage === 'campaign-expenses' ? 'active' : ''} onClick={() => setActivePage('campaign-expenses')}><i className="fas fa-money-bill-wave"></i> Chi phí Chiến dịch</li>}
          {isPageAllowed('send-message') && <li className={activePage === 'send-message' ? 'active' : ''} onClick={() => setActivePage('send-message')}><i className="fas fa-envelope"></i> Thông điệp</li>}
          {isPageAllowed('trial-management') && <li className={activePage === 'trial-management' ? 'active' : ''} onClick={() => setActivePage('trial-management')}><i className="fas fa-hourglass-start"></i> Quản lý dùng thử</li>}
          {isPageAllowed('automation') && <li className={activePage === 'automation' ? 'active' : ''} onClick={() => setActivePage('automation')}><i className="fas fa-robot"></i> Tự động hóa</li>}
          {isPageAllowed('smart-reminders') && <li className={activePage === 'smart-reminders' ? 'active' : ''} onClick={() => setActivePage('smart-reminders')}><i className="fas fa-bell"></i> Nhắc nhở</li>}
          {isPageAllowed('merge-duplicates') && <li className={activePage === 'merge-duplicates' ? 'active' : ''} onClick={() => setActivePage('merge-duplicates')}><i className="fas fa-code-branch"></i> Gộp dữ liệu</li>}
          {isPageAllowed('api-sync') && <li className={activePage === 'api-sync' ? 'active' : ''} onClick={() => setActivePage('api-sync')}><i className="fas fa-sync-alt"></i> Đồng bộ API</li>}
          {isPageAllowed('financial-sync') && <li className={activePage === 'financial-sync' ? 'active' : ''} onClick={() => setActivePage('financial-sync')}><i className="fas fa-dollar-sign"></i> Tích hợp Tài chính</li>}
          {isPageAllowed('advanced') && <li className={activePage === 'advanced' ? 'active' : ''} onClick={() => setActivePage('advanced')}><i className="fas fa-star"></i> Chức năng nâng cao</li>}
          {isPageAllowed('manage-employees') && <li className={activePage === 'manage-employees' ? 'active' : ''} onClick={() => setActivePage('manage-employees')}><i className="fas fa-user-tie"></i> Quản lý nhân viên</li>}
          {isPageAllowed('reports') && <li className={activePage === 'reports' ? 'active' : ''} onClick={() => setActivePage('reports')}><i className="fas fa-chart-pie"></i> Báo cáo &amp; Thống kê</li>}
          {isPageAllowed('trash') && <li className={activePage === 'trash' ? 'active' : ''} onClick={() => setActivePage('trash')}><i className="fas fa-trash"></i> Thùng rác</li>}
          {isPageAllowed('user-management') && <li className={activePage === 'user-management' ? 'active' : ''} onClick={() => setActivePage('user-management')}><i className="fas fa-users-cog"></i> Quản lý người dùng</li>}
          {isPageAllowed('settings') && <li className={activePage === 'settings' ? 'active' : ''} onClick={() => setActivePage('settings')}><i className="fas fa-cog"></i> Cài đặt hệ thống</li>}
          {isPageAllowed('profile') && <li className={activePage === 'profile' ? 'active' : ''} onClick={() => setActivePage('profile')}><i className="fas fa-user"></i> Hồ sơ cá nhân</li>}
        </ul>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="main-content">
        <header style={{ width: '100%' }}>
          <div className="search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Tìm kiếm khách hàng, SĐT..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '11px', color: backendOnline ? '#166534' : '#ef4444', background: backendOnline ? '#dcfce7' : '#fee2e2', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className={`fas fa-${backendOnline ? 'circle' : 'exclamation-circle'}`}></i>
              {backendOnline ? 'DB Connected' : 'Mock Mode (Offline)'}
            </span>
            <div className="user-profile">
              <div className="notification" onClick={() => alert('Thông báo từ hệ thống CRM Nhóm 8')} title="Xem thông báo">
                <i className="fas fa-bell"></i>
                <span className="badge" id="notificationBadge">3</span>
              </div>
              <div className="avatar" id="userAvatar" style={{ cursor: 'pointer' }} onClick={() => setActivePage('profile')} title="Xem thông tin cá nhân">{user.avatar}</div>
              <div className="user-info">
                <strong id="userName">{user.name}</strong><br />
                <small id="userRole" style={{ color: 'var(--text-light)' }}>{getRoleLabel(user.role)}</small>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px' }} title="Đăng xuất">
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </header>

        <main style={{ width: '100%' }}>
          {loading && (
            <div style={{ padding: '10px', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', marginBottom: '14px' }}>
              <i className="fas fa-spinner fa-spin"></i> Đang tải dữ liệu thời gian thực...
            </div>
          )}

          {/* PAGE 1: TỔNG QUAN (DASHBOARD) */}
          {activePage === 'dashboard' && (
            user.role === 'admin' ? (
              <div>
                <h2 className="page-title">Tổng quan Hệ thống</h2>
                
                <div style={{ background: '#2B4856', padding: '30px', borderRadius: '12px', color: 'white', marginBottom: '30px', boxShadow: '0 4px 12px rgba(43,72,86,0.3)' }}>
                  <h3 style={{ marginBottom: '10px', fontSize: '24px', color: 'white' }}>
                    <i className="fas fa-shield-alt"></i> Chào mừng, Admin!
                  </h3>
                  <p style={{ opacity: 0.9, margin: 0 }}>Quản lý và giám sát toàn bộ hệ thống CRM</p>
                </div>
                
                <div className="cards-container">
                  <div className="card" style={{ background: '#2B4856', color: 'white', boxShadow: '0 4px 12px rgba(43,72,86,0.2)' }}>
                    <div className="card-info">
                      <h3 style={{ color: 'rgba(255,255,255,0.7)' }}>Tổng Người dùng</h3>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>3</p>
                      <small style={{ opacity: 0.9 }}>3 hoạt động, 0 bị khóa</small>
                    </div>
                    <div className="card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><i className="fas fa-users"></i></div>
                  </div>
                  
                  <div className="card" style={{ background: '#3d5a6b', color: 'white', boxShadow: '0 4px 12px rgba(61,90,107,0.2)' }}>
                    <div className="card-info">
                      <h3 style={{ color: 'rgba(255,255,255,0.7)' }}>Admin</h3>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>1</p>
                      <small style={{ opacity: 0.9 }}>Quản trị viên</small>
                    </div>
                    <div className="card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><i className="fas fa-user-shield"></i></div>
                  </div>
                  
                  <div className="card" style={{ background: '#4f6f80', color: 'white', boxShadow: '0 4px 12px rgba(79,111,128,0.2)' }}>
                    <div className="card-info">
                      <h3 style={{ color: 'rgba(255,255,255,0.7)' }}>Trưởng phòng</h3>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>1</p>
                      <small style={{ opacity: 0.9 }}>Manager</small>
                    </div>
                    <div className="card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><i className="fas fa-user-tie"></i></div>
                  </div>
                  
                  <div className="card" style={{ background: '#618495', color: 'white', boxShadow: '0 4px 12px rgba(97,132,149,0.2)' }}>
                    <div className="card-info">
                      <h3 style={{ color: 'rgba(255,255,255,0.7)' }}>Nhân viên</h3>
                      <p style={{ fontSize: '36px', fontWeight: 'bold', color: 'white' }}>1</p>
                      <small style={{ opacity: 0.9 }}>Employee</small>
                    </div>
                    <div className="card-icon" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><i className="fas fa-user"></i></div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                  <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fas fa-chart-pie" style={{ color: '#2B4856' }}></i>
                      Phân bổ Vai trò
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span><i className="fas fa-user-shield" style={{ color: '#2B4856' }}></i> Admin</span>
                          <strong>1 (33%)</strong>
                        </div>
                        <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ background: '#2B4856', height: '100%', width: '33.3%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span><i className="fas fa-user-tie" style={{ color: '#3d5a6b' }}></i> Trưởng phòng</span>
                          <strong>1 (33%)</strong>
                        </div>
                        <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ background: '#3d5a6b', height: '100%', width: '33.3%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span><i className="fas fa-user" style={{ color: '#4f6f80' }}></i> Nhân viên</span>
                          <strong>1 (33%)</strong>
                        </div>
                        <div style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                          <div style={{ background: '#4f6f80', height: '100%', width: '33.3%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fas fa-tasks" style={{ color: '#2B4856' }}></i>
                      Truy cập Nhanh
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button className="btn btn-primary" onClick={() => setActivePage('user-management')} style={{ width: '100%', justifyContent: 'flex-start', padding: '15px', background: '#2B4856', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-users-cog"></i> Quản lý Người dùng
                      </button>
                      <button className="btn btn-secondary" onClick={() => setActivePage('settings')} style={{ width: '100%', justifyContent: 'flex-start', padding: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fas fa-cog"></i> Cấu hình Hệ thống
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="page-title">Tổng quan</h2>
                <div className="cards-container">
                  <div className="card">
                    <div className="card-info">
                      <h3>Tổng Khách hàng</h3>
                      <p>{customers.filter(c => !c.deleted).length}</p>
                    </div>
                    <div className="card-icon"><i className="fas fa-users"></i></div>
                  </div>
                  <div className="card">
                    <div className="card-info">
                      <h3>Chiến dịch Hoạt động</h3>
                      <p>{campaigns.filter(c => !c.deleted).length}</p>
                    </div>
                    <div className="card-icon"><i className="fas fa-bullhorn"></i></div>
                  </div>
                  <div className="card">
                    <div className="card-info">
                      <h3>Tương tác</h3>
                      <p>{interactions.length}</p>
                    </div>
                    <div className="card-icon"><i className="fas fa-comments"></i></div>
                  </div>
                  <div className="card">
                    <div className="card-info">
                      <h3>Doanh thu</h3>
                      <p>{contracts.filter(c => c.status === 'Thắng').reduce((sum, c) => sum + c.value, 0).toLocaleString()} VND</p>
                    </div>
                    <div className="card-icon"><i className="fas fa-chart-line"></i></div>
                  </div>
                </div>

                <div className="table-container">
                  <div className="table-header">
                    <h3>Khách hàng Gần đây</h3>
                    <button className="btn-add" onClick={openAddCust}>+ Thêm Khách hàng</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Họ và Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.filter(c => !c.deleted).slice(0, 5).map(cust => (
                        <tr key={cust.id}>
                          <td><strong>{cust.name}</strong></td>
                          <td>{cust.email}</td>
                          <td>{cust.phone}</td>
                          <td><span className={`status ${cust.status}`}>{getStatusLabel(cust.status)}</span></td>
                          <td>
                            <button onClick={() => { setSelectedDetailCust(cust); setCustDetailSubTab('detail-info'); setShowCustDetailModal(true); }} className="btn-view" style={{ background: '#2B4856', color: 'white' }}>Xem chi tiết</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}

          {/* PAGE 2: QUẢN LÝ KHÁCH HÀNG (CUSTOMERS) */}
          {activePage === 'customers' && (
            <div>
              <h2 className="page-title">Quản lý Khách hàng</h2>
              
              <div className="tabs">
                <button className={`tab-btn ${custActiveSubTab === 'customers-list' ? 'active' : ''}`} onClick={() => setCustActiveSubTab('customers-list')}>Danh sách Khách hàng</button>
                <button className={`tab-btn ${custActiveSubTab === 'customers-categorize' ? 'active' : ''}`} onClick={() => setCustActiveSubTab('customers-categorize')}>Phân loại Khách hàng</button>
                {user.role !== 'employee' && <button className={`tab-btn ${custActiveSubTab === 'customers-delete-requests' ? 'active' : ''}`} onClick={() => setCustActiveSubTab('customers-delete-requests')}>Đề nghị Xóa</button>}
                {user.role !== 'employee' && <button className={`tab-btn ${custActiveSubTab === 'customers-assign' ? 'active' : ''}`} onClick={() => setCustActiveSubTab('customers-assign')}>Phân bổ Khách hàng</button>}
              </div>

              {custActiveSubTab === 'customers-list' && (
                <div className="table-container">
                  <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: '#334155' }}>Tìm kiếm</label>
                        <input type="text" placeholder="Tên, email, SĐT, công ty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: '#334155' }}>Trạng thái</label>
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '13px' }}>
                          <option value="">Tất cả</option>
                          <option value="suspect">Suspect</option>
                          <option value="lead">Lead</option>
                          <option value="prospect">Prospect</option>
                          <option value="customer">Customer</option>
                          <option value="evangelist">Evangelist</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '13px', color: '#334155' }}>Nguồn</label>
                        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '13px' }}>
                          <option value="">Tất cả</option>
                          <option value="facebook">Facebook</option>
                          <option value="google">Google</option>
                          <option value="direct">Trực tiếp</option>
                          <option value="referral">Giới thiệu</option>
                          <option value="website">Website</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setSearchQuery(''); setFilterStatus(''); setFilterSource(''); }} style={{ flex: 1, padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                          Đặt lại
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="table-header">
                    <div>Tổng số: <strong>{filteredCustomers.length}</strong> khách hàng</div>
                    <button className="btn-add" onClick={openAddCust}>+ Thêm Khách hàng</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Công ty</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map(cust => (
                        <tr key={cust.id}>
                          <td><strong>{cust.name}</strong></td>
                          <td>{cust.email}</td>
                          <td>{cust.phone}</td>
                          <td>{cust.company}</td>
                          <td><span className={`status ${cust.status}`}>{getStatusLabel(cust.status)}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => { setSelectedDetailCust(cust); setCustDetailSubTab('detail-info'); setShowCustDetailModal(true); }} className="btn-view" style={{ background: '#2B4856', color: 'white' }}>Xem</button>
                              <button onClick={() => { setEditingCust(cust); setCustForm({ name: cust.name, email: cust.email, phone: cust.phone, company: cust.company, status: cust.status, source: cust.source, industry: cust.industry, score: cust.score, trialStartDate: cust.trialStartDate || '', trialDays: cust.trialDays || 0 }); setShowCustomerModal(true); }} className="btn-edit">Sửa</button>
                              <button onClick={() => deleteCustomer(cust.id)} className="btn-delete">Xóa</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {custActiveSubTab === 'customers-categorize' && (
                <div className="table-container">
                  <h3>Cấp độ tiềm năng Khách hàng</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', padding: '15px 0' }}>
                    <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#64748b', fontSize: '13px' }}>Suspect</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{customers.filter(c => c.status === 'suspect' && !c.deleted).length}</p>
                    </div>
                    <div style={{ background: '#dbeafe', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#1e40af', fontSize: '13px' }}>Lead</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{customers.filter(c => c.status === 'lead' && !c.deleted).length}</p>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#92400e', fontSize: '13px' }}>Prospect</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{customers.filter(c => c.status === 'prospect' && !c.deleted).length}</p>
                    </div>
                    <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#166534', fontSize: '13px' }}>Customer</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{customers.filter(c => c.status === 'customer' && !c.deleted).length}</p>
                    </div>
                    <div style={{ background: '#fce7f3', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                      <h4 style={{ color: '#9f1239', fontSize: '13px' }}>Evangelist</h4>
                      <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{customers.filter(c => c.status === 'evangelist' && !c.deleted).length}</p>
                    </div>
                  </div>
                </div>
              )}

              {custActiveSubTab === 'customers-delete-requests' && (
                <div className="table-container">
                  <h3>Đề nghị Xóa từ Nhân viên</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Lý do</th>
                        <th>Người đề nghị</th>
                        <th>Ngày đề nghị</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deleteRequests.map(req => (
                        <tr key={req.id}>
                          <td><strong>{req.customerName}</strong></td>
                          <td>{req.reason}</td>
                          <td>{req.requestedBy}</td>
                          <td>{req.requestedDate}</td>
                          <td>
                            <button className="btn btn-primary" onClick={() => { alert('✓ Đã phê duyệt yêu cầu xóa mềm của khách hàng!'); setDeleteRequests(deleteRequests.filter(r => r.id !== req.id)); }} style={{ padding: '6px 12px', background: '#2B4856', color: 'white' }}>Duyệt xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {custActiveSubTab === 'customers-assign' && (
                <div className="table-container" style={{ padding: '20px' }}>
                  <h4>Cấu hình Phân bổ Khách hàng Tự động</h4>
                  <div className="form-group" style={{ marginTop: '14px' }}>
                    <label>Phương pháp phân bổ:</label>
                    <select className="form-control" style={{ maxWidth: '300px' }} defaultValue="round_robin">
                      <option value="round_robin">Xoay vòng chia đều (Round Robin)</option>
                      <option value="ratio">Chia theo tỷ lệ %</option>
                      <option value="manual">Thủ công</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 3: QUẢN LÝ CHIẾN DỊCH (CAMPAIGNS) */}
          {activePage === 'campaigns' && (
            <div>
              <h2 className="page-title">Quản lý Chiến dịch</h2>
              <div className="tabs">
                <button className={`tab-btn ${campaignActiveSubTab === 'campaigns-list' ? 'active' : ''}`} onClick={() => setCampaignActiveSubTab('campaigns-list')}>Danh sách Chiến dịch</button>
                <button className={`tab-btn ${campaignActiveSubTab === 'campaigns-reports' ? 'active' : ''}`} onClick={() => setCampaignActiveSubTab('campaigns-reports')}>Hiệu quả Chiến dịch</button>
              </div>

              {campaignActiveSubTab === 'campaigns-list' && (
                <div className="table-container">
                  <div className="table-header">
                    <h3>Chiến dịch Marketing</h3>
                    <button className="btn-add" onClick={() => alert('Thêm chiến dịch mới')}>+ Thêm Chiến dịch</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Tên chiến dịch</th>
                        <th>Loại</th>
                        <th>Ngân sách</th>
                        <th>Đã chi</th>
                        <th>Doanh thu</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map(camp => (
                        <tr key={camp.id}>
                          <td><strong>{camp.name}</strong></td>
                          <td>{camp.type}</td>
                          <td>{camp.budget.toLocaleString()} VND</td>
                          <td>{camp.actualSpent.toLocaleString()} VND</td>
                          <td>{camp.revenue.toLocaleString()} VND</td>
                          <td><span className={`status ${camp.status === 'active' ? 'customer' : 'suspect'}`}>{camp.status === 'active' ? 'Đang chạy' : 'Đã hoàn thành'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {campaignActiveSubTab === 'campaigns-reports' && (
                <div className="table-container">
                  <h3>Biểu đồ ROI Marketing (Mock)</h3>
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {campaigns.map(camp => {
                        const roi = ((camp.revenue - camp.actualSpent) / camp.actualSpent * 100).toFixed(0);
                        return (
                          <div key={camp.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                              <span>{camp.name}</span>
                              <strong>ROI: {roi}%</strong>
                            </div>
                            <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                              <div style={{ background: '#2B4856', height: '100%', width: `${Math.min(roi / 3, 100)}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


              {/* PAGE 5: CHI PHÍ CHIẾN DỊCH (CAMP EXPENSES) */}
          {activePage === 'campaign-expenses' && (
            <div>
              <h2 className="page-title">Chi phí Chiến dịch</h2>
              <div className="cards-container">
                <div className="card">
                  <div className="card-info">
                    <h3>Tổng ngân sách</h3>
                    <p>60,000,000 VND</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-info">
                    <h3>Đã chi tiêu thực tế</h3>
                    <p>43,500,000 VND</p>
                  </div>
                </div>
                <div className="card">
                  <div className="card-info">
                    <h3>Ngân sách còn lại</h3>
                    <p>16,500,000 VND</p>
                  </div>
                </div>
              </div>

              <div className="table-container" style={{ marginTop: '20px' }}>
                <div className="table-header">
                  <h3>Nhật ký Chi tiêu</h3>
                  <button className="btn-add" onClick={() => alert('Thêm chi phí')}>+ Thêm Chi phí</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Chiến dịch</th>
                      <th>Khoản chi</th>
                      <th>Loại chi phí</th>
                      <th>Số tiền</th>
                      <th>Ngày chi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map(e => (
                      <tr key={e.id}>
                        <td><strong>{e.campaignName}</strong></td>
                        <td>{e.name}</td>
                        <td>{e.type}</td>
                        <td>{e.amount.toLocaleString()} VND</td>
                        <td>{e.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 6: THÔNG ĐIỆP (SEND MESSAGE) */}
          {activePage === 'send-message' && (
            <div>
              <h2 className="page-title">Quản lý Thông điệp</h2>

              {/* Subtabs - Only shown for Manager */}
              {user?.role === 'manager' && (
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
                  <button 
                    onClick={() => setMsgSubTab('history')} 
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: msgSubTab === 'history' ? '3px solid #2B4856' : '3px solid transparent',
                      color: msgSubTab === 'history' ? '#2B4856' : '#64748b',
                      fontWeight: msgSubTab === 'history' ? 'bold' : 'normal',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="fas fa-history" style={{ marginRight: '6px' }}></i> Lịch sử gửi thông điệp
                  </button>
                  <button 
                    onClick={() => setMsgSubTab('templates')} 
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: msgSubTab === 'templates' ? '3px solid #2B4856' : '3px solid transparent',
                      color: msgSubTab === 'templates' ? '#2B4856' : '#64748b',
                      fontWeight: msgSubTab === 'templates' ? 'bold' : 'normal',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                  >
                    <i className="fas fa-file-alt" style={{ marginRight: '6px' }}></i> Mẫu thông điệp
                  </button>
                </div>
              )}

              {(msgSubTab === 'history' || user?.role !== 'manager') ? (
                <div className="table-container">
                  <div className="table-header">
                    <h3>Gửi Thông điệp cho Khách hàng</h3>
                    <button className="btn-add" onClick={() => {
                      setSendForm({
                        customerId: '',
                        templateId: '',
                        type: 'email',
                        content: '',
                        promoTitle: '',
                        promoDescription: '',
                        promoCode: '',
                        promoExpiry: '',
                        promoLink: '',
                        isScheduled: false,
                        scheduleTime: '',
                        trackOpen: true,
                        notes: ''
                      });
                      setShowSendModal(true);
                    }}>+ Gửi Thông điệp</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Khách hàng</th>
                        <th>Loại</th>
                        <th>Nội dung</th>
                        <th>Ngày gửi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {messageHistory.length > 0 ? (
                        messageHistory.map(hist => (
                          <tr key={hist.id}>
                            <td><strong>{hist.customerName}</strong></td>
                            <td><span className={`status ${hist.channel.toLowerCase()}`}>{hist.channel}</span></td>
                            <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hist.content}</td>
                            <td>{hist.sentTime ? hist.sentTime.substring(0, 19).replace('T', ' ') : 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có thông điệp nào được gửi</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="table-container">
                  <div className="table-header">
                    <h3>Danh sách Mẫu thông điệp</h3>
                    <button className="btn-add" onClick={() => {
                      setEditingTemplate(null);
                      setTemplateForm({ name: '', content: '', type: 'email' });
                      setShowTemplateModal(true);
                    }}>+ Thêm Mẫu mới</button>
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Tên mẫu</th>
                        <th>Loại</th>
                        <th>Nội dung</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.length > 0 ? (
                        templates.map(t => (
                          <tr key={t.id}>
                            <td><strong>{t.name}</strong></td>
                            <td><span className={`status ${t.type.toLowerCase()}`}>{t.type === 'email' ? 'Email' : t.type === 'sms' ? 'SMS' : 'Zalo'}</span></td>
                            <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.content}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => {
                                    setEditingTemplate(t);
                                    setTemplateForm({ name: t.name, content: t.content, type: t.type || 'email' });
                                    setShowTemplateModal(true);
                                  }} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '4px 8px', fontSize: '11px', background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  <i className="fas fa-edit"></i> Sửa
                                </button>
                                <button 
                                  onClick={() => deleteTemplate(t.id)} 
                                  className="btn btn-danger" 
                                  style={{ padding: '4px 8px', fontSize: '11px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  <i className="fas fa-trash"></i> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Chưa có mẫu thông điệp nào</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PAGE 7: QUẢN LÝ DÙNG THỬ (TRIAL) */}
          {activePage === 'trial-management' && (
            <div>
              <h2 className="page-title">Quản lý Dùng thử sản phẩm</h2>

              <div className="table-container">
                <div className="table-header">
                  <h3>Danh sách Dùng thử</h3>
                  <button className="btn-add" onClick={openNewTrialModal}>+ Thêm Dùng thử</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Ngày Bắt đầu</th>
                      <th>Ngày Kết thúc</th>
                      <th>Thời gian Còn lại</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.filter(c => !c.deleted && (c.trialStartDate || c.trialDays > 0 || (c.trialStatus && c.trialStatus !== 'Chưa dùng thử'))).map(cust => {
                      let endDateStr = 'Chưa bắt đầu';
                      let daysLeft = 0;
                      let statusLabel = cust.trialStatus || 'Chưa dùng thử';
                      let statusClass = 'suspect';
                      if (cust.trialStartDate && cust.trialDays > 0) {
                        const start = new Date(cust.trialStartDate);
                        const end = new Date(start.getTime() + cust.trialDays * 24 * 60 * 60 * 1000);
                        endDateStr = end.toISOString().split('T')[0];
                        const today = new Date();
                        const diffTime = end - today;
                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        if (daysLeft < 0) daysLeft = 0;
                      }
                      if (statusLabel === 'Đang dùng thử') statusClass = 'customer';
                      else if (statusLabel === 'Hết hạn dùng thử' || statusLabel === 'Hết hạn') statusClass = 'suspect';
                      else if (statusLabel === 'Đã dừng dùng thử' || statusLabel === 'Đã dừng') statusClass = 'prospect';
                      return (
                        <tr key={cust.id}>
                          <td><strong>{cust.name}</strong></td>
                          <td>{cust.trialStartDate || 'Chưa bắt đầu'}</td>
                          <td>{endDateStr}</td>
                          <td>{daysLeft} ngày</td>
                          <td>
                            <span className={`status ${statusClass}`}>{statusLabel}</span>
                          </td>
                          <td>
                            <button className="btn btn-primary" onClick={() => openTrialDetails(cust)} style={{ background: '#2B4856', color: 'white', padding: '6px 12px', fontSize: '12px' }}><i className="fas fa-cog"></i> Cấu hình dùng thử</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 8: TỰ ĐỘNG HÓA (AUTOMATION) */}
          {activePage === 'automation' && (
            <div>
              <h2 className="page-title">Quy trình Tự động hóa</h2>
              <div className="tabs">
                <button className={`tab-btn ${automationActiveSubTab === 'automation-workflow' ? 'active' : ''}`} onClick={() => setAutomationActiveSubTab('automation-workflow')}>Kế hoạch chăm sóc tự động</button>
                <button className={`tab-btn ${automationActiveSubTab === 'automation-scoring' ? 'active' : ''}`} onClick={() => setAutomationActiveSubTab('automation-scoring')}>Chấm điểm Lead</button>
              </div>

              {automationActiveSubTab === 'automation-workflow' && (
                <div className="table-container">
                  <h3>Luồng Chăm sóc Tự động</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Tên quy trình</th>
                        <th>Trigger hành động</th>
                        <th>Các bước xử lý tiếp theo</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automationWorkflows.map(w => (
                        <tr key={w.id}>
                          <td><strong>{w.name}</strong></td>
                          <td><span className="status lead">{w.trigger}</span></td>
                          <td>
                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px', color: '#64748b' }}>
                              {w.actions.map((act, i) => <li key={i}>{act}</li>)}
                            </ul>
                          </td>
                          <td><span className="status customer">Đang chạy</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {automationActiveSubTab === 'automation-scoring' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="table-container">
                    <h3>Quy tắc chấm điểm Lead</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Hành động của khách</th>
                          <th>Điểm số</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadScoringRules.map(r => (
                          <tr key={r.id}>
                            <td>{r.action}</td>
                            <td><strong style={{ color: '#166534' }}>+{r.points}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-container">
                    <h3>Ngưỡng chuyển đổi tự động</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Điểm tối thiểu</th>
                          <th>Hành động tự động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leadScoringThresholds.map((t, idx) => (
                          <tr key={idx}>
                            <td><strong>{t.score} điểm</strong></td>
                            <td><span className={`status ${t.status}`}>{t.action}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 9: NHẮC NHỞ (SMART REMINDERS) */}
          {activePage === 'smart-reminders' && (
            <div>
              <h2 className="page-title">Nhắc nhở Lịch hẹn &amp; Chăm sóc</h2>
              <div className="table-container">
                <div className="table-header">
                  <h3>Lịch nhắc việc &amp; Chăm sóc</h3>
                  <button className="btn-add" onClick={() => { setApptForm({ customerId: customers[0]?.id || '', title: '', type: 'call', date: '', time: '', reminderBefore: 30, notes: '' }); setShowAppointmentModal(true); }}>+ Thêm Lịch hẹn</button>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Tiêu đề cuộc hẹn</th>
                      <th>Khách hàng</th>
                      <th>Kênh</th>
                      <th>Thời gian</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.filter(a => a.status === 'scheduled').map(appt => (
                      <tr key={appt.id}>
                        <td><strong>{appt.title}</strong></td>
                        <td>{appt.customerName}</td>
                        <td><span className={`status ${appt.type}`}>{appt.type === 'call' ? 'Gọi điện' : appt.type === 'email' ? 'Email' : 'Gặp mặt'}</span></td>
                        <td>{appt.date} lúc {appt.time}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-view" style={{ background: '#10b981', color: 'white', padding: '5px 10px', fontSize: '12px' }} onClick={() => openApptResult(appt.id)}><i className="fas fa-check"></i> Xử lý xong</button>
                            <button className="btn-delete" onClick={() => { if(confirm('Hủy lịch hẹn này?')) API.deleteAppointment(appt.id).then(loadData); }}>Hủy</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 10: GỘP DỮ LIỆU TRÙNG LẶP */}
          {activePage === 'merge-duplicates' && (
            <div className="table-container" style={{ padding: '30px' }}>
              <h2>Gộp dữ liệu khách hàng trùng lặp</h2>
              <div style={{ padding: '15px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginTop: '15px' }}>
                <i className="fas fa-check-circle"></i>
                <span>Hệ thống quét tự động hoàn tất! Không phát hiện bản ghi trùng lặp số điện thoại hoặc email trên cơ sở dữ liệu hiện tại.</span>
              </div>
            </div>
          )}

          {/* PAGE 11: ĐỒNG BỘ API */}
          {activePage === 'api-sync' && (
            <div className="table-container" style={{ padding: '30px' }}>
              <h2>Thiết lập cấu hình Đồng bộ API</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Liên kết hệ thống CRM với Google Calendar, Zalo Cloud Connect, Facebook Ads API để truyền dẫn dữ liệu thời gian thực.</p>
              <button className="btn btn-primary" onClick={() => alert('Kết nối thành công!')} style={{ background: '#2B4856', color: 'white', marginTop: '15px' }}><i className="fab fa-google"></i> Đồng bộ Google Calendar</button>
            </div>
          )}

          {/* PAGE 12: TÍCH HỢP TÀI CHÍNH */}
          {activePage === 'financial-sync' && (
            <div className="table-container" style={{ padding: '30px' }}>
              <h2>Tích hợp Dữ liệu Tài chính &amp; Hóa đơn</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Kết nối dữ liệu hóa đơn từ Fast, MISA để theo dõi công nợ khách hàng trực tiếp trên CRM.</p>
              <button className="btn btn-secondary" onClick={() => alert('Đang kết nối cổng MISA...')} style={{ marginTop: '15px' }}><i className="fas fa-file-invoice-dollar"></i> Kết nối MISA Invoice</button>
            </div>
          )}

          {/* PAGE 13: CHỨC NÀNG NÂNG CAO */}
          {activePage === 'advanced' && (
            <div className="table-container" style={{ padding: '30px' }}>
              <h2>Chức năng Phân tích Nâng cao</h2>
              <p style={{ color: '#64748b', marginTop: '10px' }}>Phân tích xu hướng chuyển dịch phễu khách hàng marketing, dự báo doanh số quý tới.</p>
            </div>
          )}

          {/* PAGE 14: QUẢN LÝ NHÂN VIÊN */}
          {activePage === 'manage-employees' && (
            <div className="table-container">
              <div className="table-header">
                <h3>Danh sách Nhân viên Marketing</h3>
                <button className="btn-add" onClick={() => alert('Thêm nhân viên')}>+ Thêm Nhân viên</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Họ và Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Phòng ban</th>
                    <th>Chức vụ</th>
                    <th>Đánh giá</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id}>
                      <td><strong>{emp.name}</strong></td>
                      <td>{emp.email}</td>
                      <td>{emp.phone}</td>
                      <td>{emp.department}</td>
                      <td>{emp.position}</td>
                      <td><strong style={{ color: '#f59e0b' }}>★ {emp.rating}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGE 15: THÙNG RÁC */}
          {activePage === 'trash' && (
            <div>
              <h2 className="page-title">Thùng rác</h2>
              
              <div className="tabs" style={{ marginBottom: '20px' }}>
                <button className={`tab-btn ${trashActiveTab === 'customers' ? 'active' : ''}`} onClick={() => setTrashActiveTab('customers')}>
                  Khách hàng đã xóa ({customers.filter(c => c.deleted).length})
                </button>
                <button className={`tab-btn ${trashActiveTab === 'campaigns' ? 'active' : ''}`} onClick={() => setTrashActiveTab('campaigns')}>
                  Chiến dịch đã xóa ({campaigns.filter(c => c.deleted).length})
                </button>
              </div>

              {/* Tab Khách hàng đã xóa */}
              {trashActiveTab === 'customers' && (
                <div className="table-container">
                  <div className="table-header">
                    <h3>Khách hàng đã xóa</h3>
                    {customers.filter(c => c.deleted).length > 0 && (
                      <button className="btn-delete" onClick={() => emptyTrash('customers')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-trash-alt"></i> Xóa vĩnh viễn tất cả
                      </button>
                    )}
                  </div>
                  
                  {customers.filter(c => c.deleted).length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Tên</th>
                          <th>Email</th>
                          <th>Số điện thoại</th>
                          <th>Công ty</th>
                          <th>Trạng thái</th>
                          <th>Ngày xóa</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.filter(c => c.deleted).map(c => (
                          <tr key={c.id} style={{ opacity: 0.8 }}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.email}</td>
                            <td>{c.phone}</td>
                            <td>{c.company}</td>
                            <td><span className={`status ${c.status}`}>{c.status === 'customer' ? 'Customer' : c.status === 'lead' ? 'Lead (Mới)' : c.status === 'prospect' ? 'Prospect' : c.status === 'suspect' ? 'Suspect' : 'Evangelist'}</span></td>
                            <td>{c.deletedDate || 'N/A'}</td>
                            <td>
                              <button className="btn-edit" onClick={() => restoreCustomer(c.id)} title="Khôi phục" style={{ marginRight: '8px' }}>
                                <i className="fas fa-undo"></i> Khôi phục
                              </button>
                              <button className="btn-delete" onClick={() => permanentDeleteCustomer(c.id)} title="Xóa vĩnh viễn" style={{ background: '#ef4444', color: 'white' }}>
                                <i className="fas fa-trash-alt"></i> Xóa vĩnh viễn
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <i className="fas fa-trash" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                      <p>Thùng rác trống</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Chiến dịch đã xóa */}
              {trashActiveTab === 'campaigns' && (
                <div className="table-container">
                  <div className="table-header">
                    <h3>Chiến dịch đã xóa</h3>
                    {campaigns.filter(c => c.deleted).length > 0 && (
                      <button className="btn-delete" onClick={() => emptyTrash('campaigns')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <i className="fas fa-trash-alt"></i> Xóa vĩnh viễn tất cả
                      </button>
                    )}
                  </div>
                  
                  {campaigns.filter(c => c.deleted).length > 0 ? (
                    <table>
                      <thead>
                        <tr>
                          <th>Tên chiến dịch</th>
                          <th>Mô tả</th>
                          <th>Ngân sách</th>
                          <th>Thời gian</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.filter(c => c.deleted).map(c => (
                          <tr key={c.id} style={{ opacity: 0.8 }}>
                            <td><strong>{c.name}</strong></td>
                            <td>{c.description}</td>
                            <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.budget)}</td>
                            <td>{c.startDate} - {c.endDate}</td>
                            <td>
                              <button className="btn-edit" onClick={() => restoreCampaign(c.id)} title="Khôi phục" style={{ marginRight: '8px' }}>
                                <i className="fas fa-undo"></i> Khôi phục
                              </button>
                              <button className="btn-delete" onClick={() => permanentDeleteCampaign(c.id)} title="Xóa vĩnh viễn" style={{ background: '#ef4444', color: 'white' }}>
                                <i className="fas fa-trash-alt"></i> Xóa vĩnh viễn
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      <i className="fas fa-trash" style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.5 }}></i>
                      <p>Thùng rác trống</p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', marginTop: '20px', borderLeft: '4px solid #f59e0b' }}>
                <p style={{ color: '#92400e', margin: 0 }}>
                  <i className="fas fa-info-circle"></i> 
                  <strong> Lưu ý:</strong> Các mục trong thùng rác có thể được khôi phục hoặc xóa vĩnh viễn. 
                  Sau khi xóa vĩnh viễn, dữ liệu sẽ không thể khôi phục lại.
                </p>
              </div>
            </div>
          )}

          {/* PAGE 17: QUẢN LÝ NGƯỜI DÙNG (ADMIN) */}
          {activePage === 'user-management' && (
            <div className="table-container">
              <div className="table-header">
                <h3>Quản lý Tài khoản Đăng nhập</h3>
                <button className="btn-add" onClick={() => alert('Thêm tài khoản')}>+ Tạo Tài khoản</button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Tên đăng nhập</th>
                    <th>Họ và Tên</th>
                    <th>Email liên kết</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>nhanvien</strong></td>
                    <td>Trần Minh Chiến</td>
                    <td>chien@company.com</td>
                    <td>Nhân viên marketing</td>
                    <td><span className="status customer">Hoạt động</span></td>
                  </tr>
                  <tr>
                    <td><strong>truongphong</strong></td>
                    <td>Nguyễn Hoàng Anh Thư</td>
                    <td>manager@company.com</td>
                    <td>Trưởng phòng</td>
                    <td><span className="status customer">Hoạt động</span></td>
                  </tr>
                  <tr>
                    <td><strong>admin</strong></td>
                    <td>Admin System</td>
                    <td>admin@company.com</td>
                    <td>Quản trị viên</td>
                    <td><span className="status customer">Hoạt động</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* PAGE 18: CÀI ĐẶT HỆ THỐNG */}
          {activePage === 'settings' && (
            <div>
              <h2 className="page-title">Cấu hình Hệ thống</h2>
              
              <div className="tabs">
                <button className={`tab-btn ${configActiveTab === 1 ? 'active' : ''}`} onClick={() => setConfigActiveTab(1)}>Thông tin Công ty</button>
                <button className={`tab-btn ${configActiveTab === 2 ? 'active' : ''}`} onClick={() => setConfigActiveTab(2)}>Hệ thống</button>
                <button className={`tab-btn ${configActiveTab === 3 ? 'active' : ''}`} onClick={() => setConfigActiveTab(3)}>Thông báo</button>
                <button className={`tab-btn ${configActiveTab === 4 ? 'active' : ''}`} onClick={() => setConfigActiveTab(4)}>Bảo mật</button>
                <button className={`tab-btn ${configActiveTab === 5 ? 'active' : ''}`} onClick={() => setConfigActiveTab(5)}>Sao lưu</button>
              </div>

              {/* Tab Thông tin Công ty */}
              {configActiveTab === 1 && (
                <div id="settings-general" className="tab-content active">
                  <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2B4856' }}>
                      <i className="fas fa-building"></i> Thông tin Công ty
                    </h3>
                    <form id="companyInfoForm" onSubmit={(e) => handleSaveConfig(e, 1)}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label htmlFor="companyName">Tên công ty *</label>
                          <input type="text" id="companyName" value={companyForm.companyName || ''} onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="companyEmail">Email *</label>
                          <input type="email" id="companyEmail" value={companyForm.email || ''} onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="companyPhone">Số điện thoại *</label>
                          <input type="tel" id="companyPhone" value={companyForm.phone || ''} onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})} required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="companyWebsite">Website</label>
                          <input type="url" id="companyWebsite" value={companyForm.website || ''} onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})} placeholder="https://example.com" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="companyAddress">Địa chỉ *</label>
                        <textarea id="companyAddress" rows={2} required value={companyForm.address || ''} onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}></textarea>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save"></i> Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab Hệ thống */}
              {configActiveTab === 2 && (
                <div id="settings-system" className="tab-content active">
                  <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2B4856' }}>
                      <i className="fas fa-cog"></i> Cài đặt Hệ thống
                    </h3>
                    <form id="systemSettingsForm" onSubmit={(e) => handleSaveConfig(e, 2)}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                          <label htmlFor="timezone">Múi giờ</label>
                          <select id="timezone" value={systemForm.timezone || 'Asia/Ho_Chi_Minh'} onChange={(e) => setSystemForm({...systemForm, timezone: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                            <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                            <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                            <option value="Asia/Singapore">Singapore (GMT+8)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="dateFormat">Định dạng ngày</label>
                          <select id="dateFormat" value={systemForm.dateFormat || 'DD/MM/YYYY'} onChange={(e) => setSystemForm({...systemForm, dateFormat: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="currency">Đơn vị tiền tệ</label>
                          <select id="currency" value={systemForm.currency || 'VND'} onChange={(e) => setSystemForm({...systemForm, currency: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                            <option value="VND">VND (₫)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="language">Ngôn ngữ</label>
                          <select id="language" value={systemForm.language || 'vi'} onChange={(e) => setSystemForm({...systemForm, language: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                            <option value="vi">Tiếng Việt</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save"></i> Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab Thông báo */}
              {configActiveTab === 3 && (
                <div id="settings-notifications" className="tab-content active">
                  <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2B4856' }}>
                      <i className="fas fa-bell"></i> Cài đặt Thông báo
                    </h3>
                    <form id="notificationSettingsForm" onSubmit={(e) => handleSaveConfig(e, 3)}>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '5px' }}>Thông báo Email</strong>
                            <small style={{ color: '#64748b' }}>Gửi thông báo qua email khi có sự kiện quan trọng</small>
                          </div>
                          <label className="switch">
                            <input type="checkbox" id="emailNotifications" checked={notificationForm.emailNotifications || false} onChange={(e) => setNotificationForm({...notificationForm, emailNotifications: e.target.checked})} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '5px' }}>Thông báo SMS</strong>
                            <small style={{ color: '#64748b' }}>Gửi thông báo qua SMS (cần cấu hình SMS Gateway)</small>
                          </div>
                          <label className="switch">
                            <input type="checkbox" id="smsNotifications" checked={notificationForm.smsNotifications || false} onChange={(e) => setNotificationForm({...notificationForm, smsNotifications: e.target.checked})} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '5px' }}>Thông báo Trình duyệt</strong>
                            <small style={{ color: '#64748b' }}>Hiển thị thông báo trên trình duyệt</small>
                          </div>
                          <label className="switch">
                            <input type="checkbox" id="browserNotifications" checked={notificationForm.browserNotifications !== false} onChange={(e) => setNotificationForm({...notificationForm, browserNotifications: e.target.checked})} />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save"></i> Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab Bảo mật */}
              {configActiveTab === 4 && (
                <div id="settings-security" className="tab-content active">
                  <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2B4856' }}>
                      <i className="fas fa-shield-alt"></i> Cài đặt Bảo mật
                    </h3>
                    <form id="securitySettingsForm" onSubmit={(e) => handleSaveConfig(e, 4)}>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div className="form-group">
                          <label htmlFor="sessionTimeout">Thời gian hết phiên (phút)</label>
                          <input type="number" id="sessionTimeout" value={securityForm.sessionTimeout || 30} min="5" max="120" onChange={(e) => setSecurityForm({...securityForm, sessionTimeout: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                          <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>Tự động đăng xuất sau khoảng thời gian không hoạt động</small>
                        </div>
                        <div className="form-group">
                          <label htmlFor="maxLoginAttempts">Số lần đăng nhập sai tối đa</label>
                          <input type="number" id="maxLoginAttempts" value={securityForm.maxFailedAttempts || 5} min="3" max="10" onChange={(e) => setSecurityForm({...securityForm, maxFailedAttempts: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                          <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>Khóa tài khoản sau số lần đăng nhập sai</small>
                        </div>
                        <div className="form-group">
                          <label htmlFor="passwordExpiry">Thời hạn mật khẩu (ngày)</label>
                          <input type="number" id="passwordExpiry" value={securityForm.passwordExpiryDays || 90} min="0" max="365" onChange={(e) => setSecurityForm({...securityForm, passwordExpiryDays: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }} />
                          <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>Yêu cầu đổi mật khẩu sau số ngày (0 = không giới hạn)</small>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '5px' }}>Xác thực 2 yếu tố (2FA)</strong>
                            <small style={{ color: '#64748b' }}>Bật xác thực 2 lớp cho tất cả người dùng</small>
                          </div>
                          <label className="switch">
                            <input type="checkbox" id="require2FA" checked={securityForm.twoFactorAuth || false} onChange={(e) => setSecurityForm({...securityForm, twoFactorAuth: e.target.checked})} />
                            <span className="slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save"></i> Lưu thay đổi
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tab Sao lưu */}
              {configActiveTab === 5 && (
                <div id="settings-backup" className="tab-content active">
                  <div style={{ background: 'white', padding: '30px', borderRadius: '8px' }}>
                    <h3 style={{ marginBottom: '20px', color: '#2B4856' }}>
                      <i className="fas fa-database"></i> Sao lưu &amp; Khôi phục
                    </h3>
                    <form id="backupSettingsForm" onSubmit={(e) => handleSaveConfig(e, 5)}>
                      <div style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ display: 'block', marginBottom: '5px' }}>Tự động sao lưu</strong>
                            <small style={{ color: '#64748b' }}>Tự động sao lưu dữ liệu theo lịch</small>
                          </div>
                          <label className="switch">
                            <input type="checkbox" id="autoBackup" checked={backupForm.autoBackup || false} onChange={(e) => setBackupForm({...backupForm, autoBackup: e.target.checked})} />
                            <span className="slider"></span>
                          </label>
                        </div>
                        <div className="form-group">
                          <label htmlFor="backupFrequency">Tần suất sao lưu</label>
                          <select id="backupFrequency" value={backupForm.backupFrequency || 'daily'} onChange={(e) => setBackupForm({...backupForm, backupFrequency: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}>
                            <option value="hourly">Mỗi giờ</option>
                            <option value="daily">Hàng ngày</option>
                            <option value="weekly">Hàng tuần</option>
                            <option value="monthly">Hàng tháng</option>
                          </select>
                        </div>
                        <div style={{ background: '#dbeafe', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                          <h4 style={{ marginBottom: '15px', color: '#1e40af' }}>Sao lưu thủ công</h4>
                          <p style={{ color: '#1e40af', marginBottom: '15px' }}>Tạo bản sao lưu ngay lập tức</p>
                          <button type="button" className="btn btn-primary" onClick={triggerBackup}>
                            <i className="fas fa-download"></i> Tạo bản sao lưu
                          </button>
                        </div>
                        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                          <h4 style={{ marginBottom: '15px', color: '#92400e' }}>Khôi phục dữ liệu</h4>
                          <p style={{ color: '#92400e', marginBottom: '15px' }}>Khôi phục từ file sao lưu</p>
                          <input type="file" id="restoreFile" accept=".json" onChange={triggerRestore} style={{ marginBottom: '10px' }} />
                        </div>
                      </div>
                      <div className="form-actions" style={{ marginTop: '20px' }}>
                        <button type="submit" className="btn btn-primary">
                          <i className="fas fa-save"></i> Lưu cài đặt
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PAGE 19: HỒ SƠ CÁ NHÂN */}
          {activePage === 'profile' && (
            <div>
              <h2 className="page-title">Hồ sơ cá nhân</h2>
              
              <div className="tabs">
                <button className={`tab-btn ${profileActiveSubTab === 'profile-info' ? 'active' : ''}`} onClick={() => setProfileActiveSubTab('profile-info')}>Thông tin cá nhân</button>
                <button className={`tab-btn ${profileActiveSubTab === 'profile-password' ? 'active' : ''}`} onClick={() => setProfileActiveSubTab('profile-password')}>Đổi mật khẩu</button>
              </div>

              {profileActiveSubTab === 'profile-info' && (
                <div className="table-container" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#2B4856', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>{user.avatar}</div>
                    <div>
                      <h3 style={{ margin: 0 }}>{user.name}</h3>
                      <p style={{ color: '#64748b' }}>{user.position} - Phòng {user.department}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>Số điện thoại:</strong> {user.phone}
                    </div>
                  </div>
                </div>
              )}

              {profileActiveSubTab === 'profile-password' && (
                <div className="table-container" style={{ padding: '24px', maxWidth: '500px' }}>
                  <h3>Đổi mật khẩu</h3>
                  <form onSubmit={(e) => { e.preventDefault(); alert('✓ Đổi mật khẩu thành công!'); }} style={{ marginTop: '15px' }}>
                    <div className="form-group">
                      <label>Mật khẩu hiện tại</label>
                      <input type="password" placeholder="Nhập mật khẩu hiện tại" className="form-control" required />
                    </div>
                    <div className="form-group">
                      <label>Mật khẩu mới</label>
                      <input type="password" placeholder="Nhập mật khẩu mới" className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ background: '#2B4856', color: 'white' }}>Đặt mật khẩu mới</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* --- ALL MODALS --- */}
      <div id="all-modals-wrapper">
        <CustomerModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          editingCust={editingCust}
          custForm={custForm}
          setCustForm={setCustForm}
          saveCustomer={saveCustomer}
        />

        <TrialModal
          isOpen={showTrialModal}
          onClose={() => setShowTrialModal(false)}
          customers={customers}
          selectedTrialCust={selectedTrialCust}
          trialForm={trialForm}
          setTrialForm={setTrialForm}
          trialDetails={trialDetails}
          saveTrial={saveTrial}
        />

        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          customers={customers}
          apptForm={apptForm}
          setApptForm={setApptForm}
          saveAppointment={saveAppointment}
        />

        <ApptResultModal
          isOpen={showApptResultModal}
          onClose={() => setShowApptResultModal(false)}
          selectedAppt={selectedAppt}
          apptResultForm={apptResultForm}
          setApptResultForm={setApptResultForm}
          saveApptResult={saveApptResult}
        />

        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          editingTemplate={editingTemplate}
          templateForm={templateForm}
          setTemplateForm={setTemplateForm}
          saveTemplate={saveTemplate}
        />

        <SendMessageModal
          isOpen={showSendModal}
          onClose={() => setShowSendModal(false)}
          customers={customers}
          templates={templates}
          sendForm={sendForm}
          setSendForm={setSendForm}
          sendingMsg={sendingMsg}
          handleSendMessage={handleSendMessage}
        />

        <CustomerDetailModal
          isOpen={showCustDetailModal}
          onClose={() => setShowCustDetailModal(false)}
          selectedDetailCust={selectedDetailCust}
          custDetailSubTab={custDetailSubTab}
          setCustDetailSubTab={setCustDetailSubTab}
          interactions={interactions}
          handleStartEditInter={handleStartEditInter}
          handleDeleteInter={handleDeleteInter}
          handleUploadFile={handleUploadFile}
          handleDeleteFile={handleDeleteFile}
          uploadingFile={uploadingFile}
          setInterForm={setInterForm}
          setSelectedFilesForInter={setSelectedFilesForInter}
          setEditingInter={setEditingInter}
          setShowInteractionModal={setShowInteractionModal}
        />

        <InteractionModal
          isOpen={showInteractionModal}
          onClose={() => { setShowInteractionModal(false); setEditingInter(null); }}
          customers={customers}
          selectedDetailCust={selectedDetailCust}
          editingInter={editingInter}
          interForm={interForm}
          setInterForm={setInterForm}
          selectedFilesForInter={selectedFilesForInter}
          setSelectedFilesForInter={setSelectedFilesForInter}
          saveInteraction={saveInteraction}
        />
      </div>
    </div>
  );
}
