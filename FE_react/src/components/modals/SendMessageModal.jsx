import React from 'react';

const SendMessageModal = ({
  isOpen,
  onClose,
  customers,
  templates,
  sendForm,
  setSendForm,
  sendingMsg,
  handleSendMessage
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal" style={{ display: 'block' }}>
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Gửi Thông điệp</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
        </div>
        <form onSubmit={handleSendMessage}>
          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Khách hàng nhận *</label>
                <select 
                  className="form-control" 
                  required 
                  value={sendForm.customerId || ''} 
                  onChange={(e) => {
                    const custId = e.target.value;
                    const selectedCust = customers.find(c => c.id === parseInt(custId));
                    
                    let nextContent = sendForm.content || '';
                    if (sendForm.rawContent) {
                      nextContent = sendForm.rawContent;
                    }
                    
                    let nextTitle = sendForm.promoTitle || '';
                    if (sendForm.rawTitle) {
                      nextTitle = sendForm.rawTitle;
                    }

                    if (selectedCust) {
                      let remainingDays = 0;
                      if (selectedCust.trialStartDate && selectedCust.trialDays > 0) {
                        const start = new Date(selectedCust.trialStartDate);
                        const end = new Date(start.getTime() + selectedCust.trialDays * 24 * 60 * 60 * 1000);
                        const diff = end - new Date();
                        remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        if (remainingDays < 0) remainingDays = 0;
                      }
                      
                      nextContent = nextContent
                        .replace(/{customerName}/g, selectedCust.name || '')
                        .replace(/{hoTen}/g, selectedCust.name || '')
                        .replace(/{soNgayConLai}/g, remainingDays.toString());

                      nextTitle = nextTitle
                        .replace(/{customerName}/g, selectedCust.name || '')
                        .replace(/{hoTen}/g, selectedCust.name || '')
                        .replace(/{soNgayConLai}/g, remainingDays.toString());
                    }

                    setSendForm({
                      ...sendForm,
                      customerId: custId,
                      content: nextContent,
                      promoTitle: nextTitle
                    });
                  }}
                >
                  <option value="">-- Chọn khách hàng nhận --</option>
                  {customers.filter(c => !c.deleted).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Kênh gửi thông điệp *</label>
                <select className="form-control" value={sendForm.type || 'email'} onChange={(e) => setSendForm({...sendForm, type: e.target.value})}>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="zalo">Zalo</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Chọn mẫu thông điệp (Tùy chọn)</label>
              <select 
                className="form-control" 
                value={sendForm.templateId || ''} 
                onChange={(e) => {
                  const tId = e.target.value;
                  const selectedTemp = templates.find(t => t.id === parseInt(tId));
                  if (selectedTemp) {
                    const selectedCust = customers.find(c => c.id === parseInt(sendForm.customerId));
                    let compiledContent = selectedTemp.content || '';
                    let compiledTitle = selectedTemp.name || '';
                    
                    if (selectedCust) {
                      let remainingDays = 0;
                      if (selectedCust.trialStartDate && selectedCust.trialDays > 0) {
                        const start = new Date(selectedCust.trialStartDate);
                        const end = new Date(start.getTime() + selectedCust.trialDays * 24 * 60 * 60 * 1000);
                        const diff = end - new Date();
                        remainingDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
                        if (remainingDays < 0) remainingDays = 0;
                      }
                      
                      compiledContent = compiledContent
                        .replace(/{customerName}/g, selectedCust.name || '')
                        .replace(/{hoTen}/g, selectedCust.name || '')
                        .replace(/{soNgayConLai}/g, remainingDays.toString());

                      compiledTitle = compiledTitle
                        .replace(/{customerName}/g, selectedCust.name || '')
                        .replace(/{hoTen}/g, selectedCust.name || '')
                        .replace(/{soNgayConLai}/g, remainingDays.toString());
                    }

                    setSendForm({
                      ...sendForm,
                      templateId: tId,
                      type: selectedTemp.type ? selectedTemp.type.trim().toLowerCase() : 'email',
                      content: compiledContent,
                      rawContent: selectedTemp.content || '',
                      promoTitle: compiledTitle,
                      rawTitle: selectedTemp.name || ''
                    });
                  } else {
                    setSendForm({
                      ...sendForm,
                      templateId: '',
                      rawContent: '',
                      rawTitle: '',
                      type: sendForm.type || 'email'
                    });
                  }
                }}
              >
                <option value="">-- Không sử dụng mẫu --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <small style={{ color: '#64748b', display: 'block', marginTop: '5px' }}>
                Chọn mẫu để tự động điền nội dung và kênh gửi mặc định
              </small>
            </div>

            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Nội dung thông điệp *</label>
              <textarea 
                className="form-control" 
                rows="5" 
                required 
                value={sendForm.content || ''} 
                onChange={(e) => setSendForm({...sendForm, content: e.target.value})} 
                placeholder="Nhập nội dung thông điệp hoặc sử dụng {hoTen}, {soNgayConLai}..."
              ></textarea>
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1', marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}><i className="fas fa-percentage"></i> Danh sách khuyến mãi</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Tiêu đề chương trình KM</label>
                  <input type="text" className="form-control" placeholder="VD: Tri ân khách hàng tháng 5" value={sendForm.promoTitle || ''} onChange={(e) => setSendForm({...sendForm, promoTitle: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Mã Khuyến mãi (Voucher)</label>
                  <input type="text" className="form-control" placeholder="VD: CRMVOUCHER10" value={sendForm.promoCode || ''} onChange={(e) => setSendForm({...sendForm, promoCode: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả Khuyến mãi</label>
                <textarea className="form-control" rows="2" placeholder="Mô tả chi tiết về khuyến mãi..." value={sendForm.promoDescription || ''} onChange={(e) => setSendForm({...sendForm, promoDescription: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Ngày hết hạn KM</label>
                  <input type="date" className="form-control" value={sendForm.promoExpiry || ''} onChange={(e) => setSendForm({...sendForm, promoExpiry: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Liên kết (URL)</label>
                  <input type="url" className="form-control" placeholder="https://example.com" value={sendForm.promoLink || ''} onChange={(e) => setSendForm({...sendForm, promoLink: e.target.value})} />
                </div>
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '8px', marginTop: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#475569' }}><i className="fas fa-cog"></i> Tùy chọn Gửi</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                  <input type="checkbox" checked={sendForm.isScheduled || false} onChange={(e) => setSendForm({...sendForm, isScheduled: e.target.checked})} />
                  <span>Lên lịch gửi</span>
                </label>
                {sendForm.isScheduled && (
                  <div>
                    <input type="datetime-local" className="form-control" value={sendForm.scheduleTime || ''} onChange={(e) => setSendForm({...sendForm, scheduleTime: e.target.value})} />
                  </div>
                )}
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={sendForm.trackOpen || false} onChange={(e) => setSendForm({...sendForm, trackOpen: e.target.checked})} />
                <span>Theo dõi mở thư</span>
              </label>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" disabled={sendingMsg} onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={sendingMsg} style={{ background: '#2B4856', color: 'white', opacity: sendingMsg ? 0.7 : 1, cursor: sendingMsg ? 'not-allowed' : 'pointer' }}>
              {sendingMsg ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Đang gửi...</> : 'Tiến hành gửi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendMessageModal;