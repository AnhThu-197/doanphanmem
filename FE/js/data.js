// Dữ liệu mock cho CRM
const DATA = {
    customers: [
        { 
            id: 1, 
            name: 'Công ty ABC', 
            email: 'contact@abc.com', 
            phone: '0912345678', 
            company: 'ABC Corp', 
            status: 'customer', 
            source: 'facebook', 
            industry: 'Công nghệ', 
            score: 85, 
            assignedTo: 1, // Nhân viên phụ trách
            trialStartDate: null, // Ngày bắt đầu dùng thử
            trialDays: 0, // Số ngày dùng thử
            createdDate: '2024-01-15', 
            updatedDate: '2024-03-20', // Ngày cập nhật cuối
            lastInteraction: '2024-03-20', 
            deleted: false 
        },
        { 
            id: 2, 
            name: 'Công ty XYZ', 
            email: 'info@xyz.com', 
            phone: '0987654321', 
            company: 'XYZ Ltd', 
            status: 'lead', 
            source: 'google', 
            industry: 'Bán lẻ', 
            score: 45, 
            assignedTo: 1,
            trialStartDate: '2024-03-15',
            trialDays: 30,
            createdDate: '2024-02-10', 
            updatedDate: '2024-03-18',
            lastInteraction: '2024-03-18', 
            deleted: false 
        },
        { 
            id: 3, 
            name: 'Công ty DEF', 
            email: 'sales@def.com', 
            phone: '0901234567', 
            company: 'DEF Inc', 
            status: 'prospect', 
            source: 'direct', 
            industry: 'Dịch vụ', 
            score: 65, 
            assignedTo: 2,
            trialStartDate: null,
            trialDays: 0,
            createdDate: '2024-03-01', 
            updatedDate: '2024-03-22',
            lastInteraction: '2024-03-22', 
            deleted: false 
        },
        { 
            id: 4, 
            name: 'Công ty GHI', 
            email: 'info@ghi.com', 
            phone: '0909876543', 
            company: 'GHI Group', 
            status: 'suspect', 
            source: 'website', 
            industry: 'Thương mại', 
            score: 15, 
            assignedTo: 1,
            trialStartDate: null,
            trialDays: 0,
            createdDate: '2024-03-25', 
            updatedDate: '2024-03-25',
            lastInteraction: '2024-03-25', 
            deleted: false 
        },
        { 
            id: 5, 
            name: 'Công ty JKL', 
            email: 'contact@jkl.com', 
            phone: '0908765432', 
            company: 'JKL Ltd', 
            status: 'evangelist', 
            source: 'referral', 
            industry: 'Công nghệ', 
            score: 95, 
            assignedTo: 2,
            trialStartDate: null,
            trialDays: 0,
            createdDate: '2023-12-01', 
            updatedDate: '2024-03-26',
            lastInteraction: '2024-03-26', 
            deleted: false 
        }
    ],
    
    interactions: [
        { 
            id: 1, 
            customerId: 1, 
            employeeId: 1, // Nhân viên thực hiện
            type: 'call', 
            content: 'Tư vấn sản phẩm', 
            notes: 'Khách hàng quan tâm', 
            date: '2024-03-20', 
            updatedDate: '2024-03-20', // Ngày cập nhật
            file: null 
        },
        { 
            id: 2, 
            customerId: 2, 
            employeeId: 1,
            type: 'email', 
            content: 'Gửi báo giá', 
            notes: 'Chờ phản hồi', 
            date: '2024-03-18', 
            updatedDate: '2024-03-18',
            file: null 
        },
        { 
            id: 3, 
            customerId: 1, 
            employeeId: 2,
            type: 'meeting', 
            content: 'Cuộc họp trực tiếp', 
            notes: 'Thảo luận hợp đồng', 
            date: '2024-03-15', 
            updatedDate: '2024-03-15',
            file: null 
        },
        { 
            id: 4, 
            customerId: 3, 
            employeeId: 1,
            type: 'call', 
            content: 'Gọi theo dõi', 
            notes: 'Khách hàng hỏi về giá', 
            date: '2024-03-22', 
            updatedDate: '2024-03-22',
            file: null 
        },
        { 
            id: 5, 
            customerId: 2, 
            employeeId: 2,
            type: 'message', 
            content: 'Gửi tin nhắn', 
            notes: 'Nhắc nhở về sản phẩm', 
            date: '2024-03-21', 
            updatedDate: '2024-03-21',
            file: null 
        },
        { 
            id: 6, 
            customerId: 1, 
            employeeId: 1,
            type: 'email', 
            content: 'Gửi hóa đơn', 
            notes: 'Hoàn tất giao dịch', 
            date: '2024-03-19', 
            updatedDate: '2024-03-19',
            file: null 
        }
    ],
    
    campaigns: [
        { 
            id: 1, 
            name: 'Chiến dịch Xuân 2024',
            managerId: 2, // Người quản lý (Trưởng phòng)
            type: 'Online Ads', // Loại chiến dịch
            description: 'Khuyến mãi mùa xuân', 
            startDate: '2024-03-01', 
            endDate: '2024-03-31', 
            budget: 50000000, 
            status: 'active',
            createdDate: '2024-02-25', // Ngày tạo
            updatedDate: '2024-03-20', // Ngày cập nhật
            deleted: false,
            // Chỉ số hiệu quả
            actualSpent: 35000000,
            revenue: 120000000,
            leads: 450,
            conversions: 85,
            clicks: 12500,
            impressions: 250000,
            costBreakdown: {
                advertising: 25000000,
                content: 5000000,
                tools: 3000000,
                other: 2000000
            }
        },
        { 
            id: 2, 
            name: 'Chiến dịch Email Marketing',
            managerId: 2,
            type: 'Email',
            description: 'Gửi email tới khách hàng', 
            startDate: '2024-02-15', 
            endDate: '2024-02-28', 
            budget: 10000000, 
            status: 'completed',
            createdDate: '2024-02-10',
            updatedDate: '2024-02-28',
            deleted: false,
            actualSpent: 8500000,
            revenue: 45000000,
            leads: 320,
            conversions: 68,
            clicks: 8500,
            impressions: 150000,
            costBreakdown: {
                advertising: 5000000,
                content: 2000000,
                tools: 1000000,
                other: 500000
            }
        }
    ],
    
    messageTemplates: [
        { 
            id: 1, 
            name: 'Chào mừng khách hàng mới', 
            type: 'email', 
            content: 'Xin chào {customerName}, chúng tôi rất vui được phục vụ bạn!',
            createdDate: '2024-01-10',
            updatedDate: '2024-01-10'
        },
        { 
            id: 2, 
            name: 'Nhắc nhở cuộc họp', 
            type: 'sms', 
            content: 'Nhắc nhở: Cuộc họp vào {date} lúc {time}',
            createdDate: '2024-01-15',
            updatedDate: '2024-01-15'
        },
        { 
            id: 3, 
            name: 'Cảm ơn khách hàng', 
            type: 'email', 
            content: 'Cảm ơn {customerName} đã tin tưởng chúng tôi!',
            createdDate: '2024-01-20',
            updatedDate: '2024-02-10'
        },
        { 
            id: 4, 
            name: 'Giới thiệu sản phẩm mới', 
            type: 'email', 
            content: 'Xin chào {customerName}, chúng tôi vừa ra mắt sản phẩm mới. Bạn có quan tâm không?',
            createdDate: '2024-02-01',
            updatedDate: '2024-02-01'
        },
        { 
            id: 5, 
            name: 'Khuyến mãi đặc biệt', 
            type: 'sms', 
            content: 'Khuyến mãi đặc biệt cho {customerName}: Giảm 20% cho đơn hàng tiếp theo!',
            createdDate: '2024-02-15',
            updatedDate: '2024-02-15'
        },
        { 
            id: 6, 
            name: 'Theo dõi sau bán hàng', 
            type: 'email', 
            content: 'Xin chào {customerName}, chúng tôi muốn biết bạn hài lòng với sản phẩm chưa?',
            createdDate: '2024-03-01',
            updatedDate: '2024-03-01'
        },
        { 
            id: 7, 
            name: 'Mời tham gia sự kiện', 
            type: 'email', 
            content: 'Xin chào {customerName}, chúng tôi mời bạn tham gia sự kiện đặc biệt vào {date}',
            createdDate: '2024-03-10',
            updatedDate: '2024-03-10'
        },
        { 
            id: 8, 
            name: 'Thông báo cập nhật', 
            type: 'sms', 
            content: 'Thông báo: Hệ thống của chúng tôi đã được cập nhật với các tính năng mới!',
            createdDate: '2024-03-15',
            updatedDate: '2024-03-15'
        }
    ],
    
    auditLogs: [],
    
    deleteRequests: [
        { 
            id: 1, 
            customerId: 2, 
            customerName: 'Công ty XYZ', 
            reason: 'Khách hàng không còn hoạt động, email và số điện thoại không liên lạc được', 
            requestedBy: 'Trần Minh Chiến', 
            requestedDate: '25/03/2026', 
            status: 'pending' 
        },
        { 
            id: 2, 
            customerId: 3, 
            customerName: 'Công ty DEF', 
            reason: 'Khách hàng yêu cầu xóa thông tin cá nhân theo quy định GDPR', 
            requestedBy: 'Trần Minh Chiến', 
            requestedDate: '26/03/2026', 
            status: 'pending' 
        }
    ],
    
    trialCustomers: [
        { id: 1, customerId: 1, customerName: 'Công ty ABC', startDate: '2024-03-01', endDate: '2024-03-31', daysAllowed: 30, reminderDays: 3 },
        { id: 2, customerId: 2, customerName: 'Công ty XYZ', startDate: '2024-03-15', endDate: '2024-04-14', daysAllowed: 30, reminderDays: 3 }
    ],
    
    automationWorkflows: [
        { 
            id: 1, 
            name: 'Chăm sóc Lead mới', 
            description: 'Gửi email chào mừng và giới thiệu sản phẩm cho lead mới',
            trigger: 'new_lead', 
            status: 'active', 
            actions: ['send_email', 'wait_3_days', 'condition_check'], 
            createdDate: '2024-03-01' 
        },
        { 
            id: 2, 
            name: 'Theo dõi khách hàng không mở email', 
            description: 'Gửi email nhắc nhở cho khách hàng chưa mở email sau 7 ngày',
            trigger: 'email_not_opened', 
            status: 'active', 
            actions: ['send_email_reminder'], 
            createdDate: '2024-03-05' 
        },
        { 
            id: 3, 
            name: 'Chúc mừng sinh nhật khách hàng', 
            description: 'Gửi lời chúc sinh nhật và mã giảm giá đặc biệt',
            trigger: 'customer_birthday', 
            status: 'active', 
            actions: ['send_email', 'send_sms'], 
            createdDate: '2024-02-15' 
        },
        { 
            id: 4, 
            name: 'Nhắc nhở khách hàng không hoạt động', 
            description: 'Gửi email cho khách hàng không tương tác trong 30 ngày',
            trigger: 'no_interaction', 
            status: 'paused', 
            actions: ['send_email'], 
            createdDate: '2024-01-20' 
        },
        { 
            id: 5, 
            name: 'Onboarding khách hàng mới', 
            description: 'Chuỗi email hướng dẫn sử dụng sản phẩm cho khách hàng mới',
            trigger: 'new_customer', 
            status: 'draft', 
            actions: ['send_email', 'wait_2_days', 'send_email', 'wait_5_days', 'send_email'], 
            createdDate: '2024-03-10' 
        }
    ],
    
    leadScoringRules: [
        { id: 1, action: 'Khách truy cập trang bảng giá', points: 10, active: true },
        { id: 2, action: 'Khách tải tài liệu', points: 5, active: true },
        { id: 3, action: 'Khách mở Email', points: 3, active: true },
        { id: 4, action: 'Khách click link trong Email', points: 8, active: true },
        { id: 5, action: 'Khách điền form liên hệ', points: 15, active: true },
        { id: 6, action: 'Khách tham gia webinar', points: 20, active: true }
    ],
    
    leadScoringThresholds: [
        { score: 90, action: 'Chuyển thành Evangelist (Khách hàng trung thành)', status: 'evangelist', active: true },
        { score: 70, action: 'Chuyển thành Customer (Khách hàng chính thức)', status: 'customer', active: true },
        { score: 50, action: 'Chuyển thành Prospect (Khách hàng triển vọng)', status: 'prospect', active: true },
        { score: 30, action: 'Chuyển thành Lead (Khách hàng tiềm năng mới)', status: 'lead', active: true },
        { score: 0, action: 'Suspect (Người truy cập)', status: 'suspect', active: true }
    ],
    
    appointments: [
        { 
            id: 1, 
            customerId: 1, 
            customerName: 'Công ty ABC',
            employeeId: 1, // Nhân viên được gán
            title: 'Gọi tư vấn', 
            type: 'call', 
            date: '2024-03-28', 
            time: '14:00', 
            reminderBefore: 30, 
            reminderEmployee: true,
            reminderCustomer: true,
            status: 'scheduled',
            result: null, // Kết quả: Thành công/Khách bận/Khách từ chối
            notes: 'Tư vấn về gói dịch vụ',
            updatedDate: '2024-03-26' // Ngày cập nhật
        },
        { 
            id: 2, 
            customerId: 2, 
            customerName: 'Công ty XYZ',
            employeeId: 1,
            title: 'Cuộc họp trực tuyến', 
            type: 'video', 
            date: '2024-03-29', 
            time: '10:00', 
            location: 'https://meet.google.com/abc-defg-hij',
            reminderBefore: 60, 
            reminderEmployee: true,
            reminderCustomer: true,
            reminderMessageTypes: {
                email: true,
                sms: true,
                zalo: false
            },
            status: 'scheduled',
            result: null,
            notes: 'Thảo luận hợp đồng',
            updatedDate: '2024-03-27'
        },
        { 
            id: 3, 
            customerId: 3, 
            customerName: 'Công ty DEF',
            employeeId: 2,
            title: 'Họp trực tiếp tại văn phòng', 
            type: 'meeting', 
            date: '2024-03-30', 
            time: '15:00', 
            location: 'Phòng họp A, Tầng 5, Tòa nhà Landmark',
            reminderBefore: 1440, 
            reminderEmployee: true,
            reminderCustomer: true,
            reminderMessageTypes: {
                email: true,
                sms: false,
                zalo: true
            },
            status: 'scheduled',
            result: null,
            notes: 'Ký hợp đồng và bàn giao tài liệu',
            updatedDate: '2024-03-28'
        }
    ],
    
    duplicateCustomers: [
        { id: 1, customer1: { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0987654321' }, customer2: { id: 4, name: 'Nguyễn A', email: 'nguyena@gmail.com', phone: '0987654321' }, similarity: 95 },
        { id: 2, customer1: { id: 2, name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678' }, customer2: { id: 5, name: 'Trần B', email: 'tranb@gmail.com', phone: '0912345678' }, similarity: 90 }
    ],
    
    notifications: [
        { 
            id: 1, 
            employeeId: 1, // Thông báo cho nhân viên nào
            type: 'Hệ thống', // Loại thông báo
            title: 'Khách hàng mới', 
            message: 'Công ty ABC vừa được thêm vào hệ thống', 
            date: '2024-03-26 10:30', 
            read: false,
            link: '/customers/1' // Đường dẫn liên kết
        },
        { 
            id: 2, 
            employeeId: 2,
            type: 'Chiến dịch',
            title: 'Chiến dịch hoàn thành', 
            message: 'Chiến dịch Xuân 2024 đã hoàn thành', 
            date: '2024-03-25 15:45', 
            read: false,
            link: '/campaigns/1'
        },
        { 
            id: 3, 
            employeeId: 1,
            type: 'Nhắc nhở',
            title: 'Nhắc nhở cuộc họp', 
            message: 'Bạn có cuộc họp với Công ty XYZ lúc 14:00', 
            date: '2024-03-26 09:00', 
            read: true,
            link: '/appointments/2'
        }
    ],
    
    // Cấu hình phân bổ khách hàng
    assignmentConfig: {
        method: 'round_robin', // 'round_robin', 'ratio', 'manual'
        roundRobinIndex: 0,
        employees: [
            { id: 1, name: 'Trần Minh Chiến', online: true, ratio: 60, assignedCount: 0 },
            { id: 2, name: 'Nguyễn Văn B', online: true, ratio: 40, assignedCount: 0 },
            { id: 3, name: 'Lê Thị C', online: false, ratio: 0, assignedCount: 0 }
        ]
    },
    
    // Lịch sử phân bổ
    assignmentHistory: [],
    
    // Cấu hình đồng bộ API
    apiIntegrations: [
        { id: 1, name: 'Facebook Lead Ads', type: 'facebook', apiKey: '', status: 'inactive', lastSync: null },
        { id: 2, name: 'Google Forms', type: 'google', apiKey: '', status: 'inactive', lastSync: null },
        { id: 3, name: 'Webhook Custom', type: 'webhook', apiKey: '', webhookUrl: '', status: 'inactive', lastSync: null }
    ],
    
    // Cấu hình tích hợp hệ thống tài chính (được cấu hình sẵn bởi IT/Admin)
    financialIntegrations: [
        { 
            id: 1, 
            name: 'Hệ thống ERP', 
            type: 'erp', 
            apiKey: '***configured***', 
            apiUrl: 'https://erp.company.com/api/v1',
            status: 'active', 
            lastSync: '27/03/2026 14:30',
            syncFrequency: 'daily',
            autoSync: true
        },
        { 
            id: 2, 
            name: 'Phần mềm Kế toán', 
            type: 'accounting', 
            apiKey: '***configured***', 
            apiUrl: 'https://accounting.company.com/api',
            status: 'active', 
            lastSync: '27/03/2026 14:30',
            syncFrequency: 'daily',
            autoSync: true
        },
        { 
            id: 3, 
            name: 'Google Ads API', 
            type: 'google_ads', 
            apiKey: '***configured***', 
            apiUrl: 'https://googleads.googleapis.com/v14',
            status: 'active', 
            lastSync: '27/03/2026 15:00',
            syncFrequency: 'hourly',
            autoSync: true,
            metrics: ['cost', 'clicks', 'impressions', 'conversions']
        },
        { 
            id: 4, 
            name: 'Facebook Ads API', 
            type: 'facebook_ads', 
            apiKey: '***configured***', 
            apiUrl: 'https://graph.facebook.com/v18.0',
            status: 'active', 
            lastSync: '27/03/2026 15:00',
            syncFrequency: 'hourly',
            autoSync: true,
            metrics: ['spend', 'clicks', 'impressions', 'conversions']
        }
    ],
    
    // Khách hàng được gán cho chiến dịch
    campaignCustomers: [],
    
    // Lịch sử cập nhật chỉ số chiến dịch
    campaignMetricsHistory: [],
    
    // Hợp đồng - Giao dịch (dữ liệu doanh thu từ phòng Sales)
    contracts: [
        {
            id: 1,
            name: 'Hợp đồng dịch vụ Marketing Q1/2024',
            customerId: 1,
            customerName: 'Công ty ABC',
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            employeeId: 1, // Nhân viên phụ trách
            value: 50000000,
            status: 'Thắng',
            createdDate: '2024-01-15',
            updatedDate: '2024-01-20', // Ngày cập nhật
            closeDate: '2024-01-20'
        },
        {
            id: 2,
            name: 'Hợp đồng quảng cáo Facebook',
            customerId: 2,
            customerName: 'Công ty XYZ',
            campaignId: 2,
            campaignName: 'Chiến dịch Email Marketing',
            employeeId: 1,
            value: 30000000,
            status: 'Đang thương lượng',
            createdDate: '2024-02-01',
            updatedDate: '2024-03-15',
            closeDate: null
        },
        {
            id: 3,
            name: 'Hợp đồng thiết kế website',
            customerId: 3,
            customerName: 'Công ty DEF',
            campaignId: null,
            campaignName: null,
            employeeId: 2,
            value: 70000000,
            status: 'Thắng',
            createdDate: '2024-02-15',
            updatedDate: '2024-02-28',
            closeDate: '2024-02-28'
        }
    ],
    
    // Chi phí Chiến dịch (dữ liệu chi phí do Trưởng phòng quản lý)
    campaignExpenses: [
        {
            id: 1,
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            name: 'Quảng cáo Facebook',
            type: 'Quảng cáo trực tuyến',
            amount: 15000000,
            date: '2024-01-15',
            source: 'Nhập thủ công',
            note: 'Chi phí quảng cáo tuần 1'
        },
        {
            id: 2,
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            name: 'Thiết kế banner',
            type: 'Thiết kế',
            amount: 5000000,
            date: '2024-01-10',
            source: 'Nhập thủ công',
            note: 'Thuê designer'
        },
        {
            id: 3,
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            name: 'Google Ads',
            type: 'Quảng cáo trực tuyến',
            amount: 10000000,
            date: '2024-01-20',
            source: 'API Google Ads',
            note: 'Tự động đồng bộ từ Google Ads'
        },
        {
            id: 4,
            campaignId: 2,
            campaignName: 'Chiến dịch Email Marketing',
            name: 'Email Marketing Tool',
            type: 'Công cụ',
            amount: 3000000,
            date: '2024-02-15',
            source: 'Nhập thủ công',
            note: 'Phí sử dụng Mailchimp'
        },
        {
            id: 5,
            campaignId: 2,
            campaignName: 'Chiến dịch Email Marketing',
            name: 'Viết nội dung email',
            type: 'Sản xuất nội dung',
            amount: 5000000,
            date: '2024-02-18',
            source: 'Nhập thủ công',
            note: 'Thuê copywriter'
        }
    ],
    
    // Ánh xạ chiến dịch với hệ thống bên ngoài
    campaignMappings: [
        {
            id: 1,
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            systemId: 3,
            systemName: 'Google Ads API',
            externalId: 'CAMP-2024-001',
            createdAt: '15/01/2024 10:00',
            updatedAt: '15/01/2024 10:00'
        },
        {
            id: 2,
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            systemId: 4,
            systemName: 'Facebook Ads API',
            externalId: 'FB-CAMP-2024-001',
            createdAt: '15/01/2024 10:30',
            updatedAt: '15/01/2024 10:30'
        }
    ],
    
    // Lịch sử đồng bộ tài chính
    financialSyncHistory: [
        {
            id: 1,
            systemName: 'Google Ads API',
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            dataType: 'cost',
            amount: 10000000,
            timestamp: '27/03/2026 15:00',
            status: 'success'
        },
        {
            id: 2,
            systemName: 'Facebook Ads API',
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            dataType: 'cost',
            amount: 8000000,
            timestamp: '27/03/2026 15:00',
            status: 'success'
        },
        {
            id: 3,
            systemName: 'Hệ thống ERP',
            campaignId: 1,
            campaignName: 'Chiến dịch Xuân 2024',
            dataType: 'revenue',
            amount: 120000000,
            timestamp: '27/03/2026 14:30',
            status: 'success'
        }
    ],
    
    // ============================================
    // CÁC BẢNG MỚI - ĐỒNG BỘ VỚI CSDL
    // ============================================
    
    // Vai trò (VaiTro)
    roles: [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Trưởng phòng' },
        { id: 3, name: 'Nhân viên' }
    ],
    
    // Thẻ phân loại (ThePhanLoai)
    tags: [
        { id: 1, name: 'VIP', color: '#FFD700' },
        { id: 2, name: 'Tiềm năng cao', color: '#FF6B6B' },
        { id: 3, name: 'Cần chăm sóc', color: '#4ECDC4' },
        { id: 4, name: 'Đã mua hàng', color: '#95E1D3' },
        { id: 5, name: 'Quan tâm sản phẩm A', color: '#F38181' }
    ],
    
    // Gán thẻ - Khách hàng (GanThe_KhachHang)
    customerTags: [
        { customerId: 1, tagId: 1, assignedDate: '2024-01-20' }, // Công ty ABC - VIP
        { customerId: 1, tagId: 4, assignedDate: '2024-01-25' }, // Công ty ABC - Đã mua hàng
        { customerId: 2, tagId: 2, assignedDate: '2024-02-15' }, // Công ty XYZ - Tiềm năng cao
        { customerId: 3, tagId: 3, assignedDate: '2024-03-05' }, // Công ty DEF - Cần chăm sóc
        { customerId: 5, tagId: 1, assignedDate: '2024-01-10' }  // Công ty JKL - VIP
    ],
    
    // Lịch sử gửi thông điệp (LichSuGuiThongDiep)
    messageHistory: [
        {
            id: 1,
            customerId: 1,
            employeeId: 1,
            templateId: 1, // Mẫu "Chào mừng khách hàng mới"
            channel: 'Email',
            subject: 'Chào mừng bạn đến với chúng tôi',
            content: 'Xin chào Công ty ABC, chúng tôi rất vui được phục vụ bạn!',
            status: 'Đã gửi',
            sentDate: '2024-01-16 10:00'
        },
        {
            id: 2,
            customerId: 2,
            employeeId: 1,
            templateId: 5, // Mẫu "Khuyến mãi đặc biệt"
            channel: 'SMS',
            subject: null,
            content: 'Khuyến mãi đặc biệt cho Công ty XYZ: Giảm 20% cho đơn hàng tiếp theo!',
            status: 'Đã gửi',
            sentDate: '2024-02-20 14:30'
        },
        {
            id: 3,
            customerId: 1,
            employeeId: 2,
            templateId: 3, // Mẫu "Cảm ơn khách hàng"
            channel: 'Email',
            subject: 'Cảm ơn bạn',
            content: 'Cảm ơn Công ty ABC đã tin tưởng chúng tôi!',
            status: 'Đã gửi',
            sentDate: '2024-03-10 09:15'
        },
        {
            id: 4,
            customerId: 3,
            employeeId: 1,
            templateId: 4, // Mẫu "Giới thiệu sản phẩm mới"
            channel: 'Zalo',
            subject: null,
            content: 'Xin chào Công ty DEF, chúng tôi vừa ra mắt sản phẩm mới. Bạn có quan tâm không?',
            status: 'Thất bại',
            sentDate: '2024-03-15 16:00'
        }
    ],
    
    // Cấu hình hệ thống (CauHinhHeThong)
    systemConfig: [
        // Nhóm: Chung
        { 
            id: 1, 
            key: 'company_name', 
            value: 'Công ty TNHH Phần mềm Nhóm 8', 
            description: 'Tên công ty hiển thị trên hệ thống',
            group: 'Chung',
            updatedDate: '2024-01-01'
        },
        { 
            id: 2, 
            key: 'company_logo', 
            value: '/assets/logo.png', 
            description: 'Đường dẫn logo công ty',
            group: 'Chung',
            updatedDate: '2024-01-01'
        },
        { 
            id: 3, 
            key: 'company_phone', 
            value: '0123456789', 
            description: 'Số điện thoại công ty',
            group: 'Chung',
            updatedDate: '2024-01-01'
        },
        { 
            id: 4, 
            key: 'company_email', 
            value: 'contact@nhom8.com', 
            description: 'Email công ty',
            group: 'Chung',
            updatedDate: '2024-01-01'
        },
        { 
            id: 5, 
            key: 'company_address', 
            value: '123 Đường ABC, Quận 1, TP.HCM', 
            description: 'Địa chỉ công ty',
            group: 'Chung',
            updatedDate: '2024-01-01'
        },
        
        // Nhóm: Email
        { 
            id: 6, 
            key: 'smtp_host', 
            value: 'smtp.gmail.com', 
            description: 'SMTP Server',
            group: 'Email',
            updatedDate: '2024-01-05'
        },
        { 
            id: 7, 
            key: 'smtp_port', 
            value: '587', 
            description: 'SMTP Port',
            group: 'Email',
            updatedDate: '2024-01-05'
        },
        { 
            id: 8, 
            key: 'smtp_username', 
            value: 'noreply@nhom8.com', 
            description: 'SMTP Username',
            group: 'Email',
            updatedDate: '2024-01-05'
        },
        { 
            id: 9, 
            key: 'smtp_password', 
            value: '***encrypted***', 
            description: 'SMTP Password (mã hóa)',
            group: 'Email',
            updatedDate: '2024-01-05'
        },
        { 
            id: 10, 
            key: 'email_from_name', 
            value: 'Nhóm 8 CRM', 
            description: 'Tên người gửi email',
            group: 'Email',
            updatedDate: '2024-01-05'
        },
        
        // Nhóm: Giao diện
        { 
            id: 11, 
            key: 'theme_color', 
            value: '#3b82f6', 
            description: 'Màu chủ đạo giao diện',
            group: 'Giao diện',
            updatedDate: '2024-01-10'
        },
        { 
            id: 12, 
            key: 'items_per_page', 
            value: '20', 
            description: 'Số item hiển thị mỗi trang',
            group: 'Giao diện',
            updatedDate: '2024-01-10'
        },
        { 
            id: 13, 
            key: 'date_format', 
            value: 'DD/MM/YYYY', 
            description: 'Định dạng ngày tháng',
            group: 'Giao diện',
            updatedDate: '2024-01-10'
        }
    ],
    
    // Thêm log kiểm toán
    addAuditLog(action, description, userId) {
        this.auditLogs.push({
            id: this.auditLogs.length + 1,
            action: action,
            description: description,
            userId: userId,
            timestamp: new Date().toLocaleString('vi-VN')
        });
    }
};
