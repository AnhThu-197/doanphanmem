-- ================================================================
-- HỆ THỐNG QUẢN LÝ KHÁCH HÀNG - BỘ PHẬN MARKETING CÔNG TY PHẦN MỀM
-- Nhóm 8 - Đồ Án Phần Mềm
-- ================================================================
 
-- LỆNH XÓA DATABASE NẾU TỒN TẠI
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'DoAnPhanMem_Nhom8')
BEGIN
    USE master
    ALTER DATABASE DoAnPhanMem_Nhom8 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE DoAnPhanMem_Nhom8
END;
GO
 
-- TẠO CƠ SỞ DỮ LIỆU
CREATE DATABASE DoAnPhanMem_Nhom8;
GO
USE DoAnPhanMem_Nhom8;
GO
 
-- =================================================================
-- PHẦN 1: TẠO BẢNG DỮ LIỆU
-- =================================================================

-- 1. Bảng Tỉnh / Thành Phố
CREATE TABLE TinhThanh (
    maTinhThanh    INT IDENTITY(1,1) PRIMARY KEY,
    tenTinhThanh   NVARCHAR(100) NOT NULL,
    loai           NVARCHAR(30) DEFAULT N'Tỉnh',
    CONSTRAINT CHK_LoaiTinh CHECK (loai IN (N'Tỉnh', N'Thành phố trực thuộc TW'))
);
 
-- 2. Bảng Phường / Xã
CREATE TABLE PhuongXa (
    maPhuongXa     INT IDENTITY(1,1) PRIMARY KEY,
    tenPhuongXa    NVARCHAR(100) NOT NULL,
	maTinhThanh    INT NOT NULL FOREIGN KEY REFERENCES TinhThanh(maTinhThanh),
    loai           NVARCHAR(20) DEFAULT N'Xã',
    CONSTRAINT CHK_LoaiPhuong CHECK (loai IN (N'Phường', N'Xã', N'Thị trấn'))
);

-- 3. Bảng Ngành Nghề
CREATE TABLE NganhNghe (
    maNganhNghe    INT IDENTITY(1,1) PRIMARY KEY,
    tenNganhNghe   NVARCHAR(100) UNIQUE NOT NULL,
    moTa           NVARCHAR(200) NULL
);
 
-- 4. Bảng Nguồn Khách Hàng
CREATE TABLE NguonKhachHang (
    maNguon        INT IDENTITY(1,1) PRIMARY KEY,
    tenNguon       NVARCHAR(100) UNIQUE NOT NULL,
    moTa           NVARCHAR(200) NULL,
    loaiNguon      NVARCHAR(50) DEFAULT N'Khác',
    CONSTRAINT CHK_LoaiNguon CHECK (loaiNguon IN (N'Mạng xã hội', N'Quảng cáo trực tuyến',N'Giới thiệu', N'Sự kiện', N'Website', N'Khác'))
);
 
-- 5. Bảng Vai Trò
CREATE TABLE VaiTro (
    maVaiTro       INT IDENTITY(1,1) PRIMARY KEY,
    tenVaiTro      NVARCHAR(50) UNIQUE NOT NULL,
    moTa           NVARCHAR(200) NULL
);

-- 6. Bảng Tài Khoản (Đã gộp RC01)
CREATE TABLE TaiKhoan (
    maTaiKhoan          INT IDENTITY(1,1) PRIMARY KEY,
    maVaiTro            INT NOT NULL FOREIGN KEY REFERENCES VaiTro(maVaiTro),
    email               VARCHAR(150) UNIQUE NOT NULL,
    matKhau             VARCHAR(255) NOT NULL,         
    maXacThucOTP        VARCHAR(255) NULL,
    thoiHanOTP          DATETIME NULL,
    lanDangNhapSai      INT DEFAULT 0 NOT NULL,
    thoiGianKhoaTam     DATETIME NULL,
    trangThai           NVARCHAR(20) DEFAULT N'Hoạt động' NOT NULL,
    ngayTao             DATETIME DEFAULT GETDATE(),
    ngayCapNhat         DATETIME DEFAULT GETDATE(),
    lanDangNhapCuoi     DATETIME NULL,
    CONSTRAINT CHK_TrangThaiTK CHECK (trangThai IN (N'Hoạt động', N'Bị khóa', N'Chờ kích hoạt')),
    CONSTRAINT CHK_EmailTaiKhoan CHECK (email LIKE '%_@_%._%') -- RC01
);
 
-- 7. Bảng Nhân Viên
CREATE TABLE NhanVien (
    maNhanVien     INT IDENTITY(1,1) PRIMARY KEY,
    maTaiKhoan     INT UNIQUE NOT NULL FOREIGN KEY REFERENCES TaiKhoan(maTaiKhoan),
    hoTen          NVARCHAR(100) NOT NULL,
    soDienThoai    VARCHAR(15) NULL,
    chucVu         NVARCHAR(100) NULL,
    anhDaiDien     VARCHAR(255) NULL,
    maPhuongXa     INT NULL FOREIGN KEY REFERENCES PhuongXa(maPhuongXa),
    diaChiChiTiet  NVARCHAR(255) NULL,
    ngaySinh       DATE NULL,
    gioiTinh       NVARCHAR(10) NULL,
    ngayVaoLam     DATE NULL,
    ghiChu         NVARCHAR(500) NULL,
    ngayTao        DATETIME DEFAULT GETDATE(),
    ngayCapNhat    DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_GioiTinhNV CHECK (gioiTinh IN (N'Nam', N'Nữ', N'Khác', NULL)),
    CONSTRAINT CHK_SoDTNhanVien CHECK (soDienThoai IS NULL OR (soDienThoai NOT LIKE '%[^0-9]%' AND LEN(soDienThoai) BETWEEN 10 AND 11)), 
    CONSTRAINT CHK_NgaySinhNV CHECK (ngaySinh IS NULL OR ngaySinh <= CAST(GETDATE() AS DATE))
);

-- 8. Bảng Khách Hàng
CREATE TABLE KhachHang (
    maKhachHang       INT IDENTITY(1,1) PRIMARY KEY,
    maNguoiPhuTrach   INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    maNganhNghe       INT NULL FOREIGN KEY REFERENCES NganhNghe(maNganhNghe),
    maNguonKH         INT NULL FOREIGN KEY REFERENCES NguonKhachHang(maNguon),
    maPhuongXa        INT NULL FOREIGN KEY REFERENCES PhuongXa(maPhuongXa),
    hoTen             NVARCHAR(100) NOT NULL,
    email             VARCHAR(150) UNIQUE NOT NULL,
    soDienThoai       VARCHAR(15) UNIQUE NOT NULL,
    gioiTinh          NVARCHAR(10) NULL,
    ngaySinh          DATE NULL,
    congTy            NVARCHAR(150) NULL,
    chucVuTaiCongTy   NVARCHAR(100) NULL,
    websiteCongTy     VARCHAR(255) NULL,
    diaChiChiTiet     NVARCHAR(255) NULL,
    trangThaiKhach    NVARCHAR(50) DEFAULT N'Người truy cập' NOT NULL,
    diemTiemNang      INT DEFAULT 0 NOT NULL,
    ngayBatDauDungThu DATE NULL,
    soNgayDungThu     INT DEFAULT 0 NOT NULL,
    trangThaiDungThu  NVARCHAR(30) DEFAULT N'Chưa dùng thử' NOT NULL,
    daXoa             BIT DEFAULT 0 NOT NULL,
    lyDoXoa           NVARCHAR(200) NULL,
    ngayXoa           DATETIME NULL,
    ngayTao           DATETIME DEFAULT GETDATE(),
    ngayCapNhat       DATETIME DEFAULT GETDATE(),
 
    CONSTRAINT CHK_LienHeKH CHECK (email IS NOT NULL OR soDienThoai IS NOT NULL),
    CONSTRAINT CHK_GioiTinhKH CHECK (gioiTinh IN (N'Nam', N'Nữ', N'Khác', NULL)),
    CONSTRAINT CHK_TrangThaiKhach CHECK (trangThaiKhach IN (N'Người truy cập', N'KH tiềm năng mới',N'KH triển vọng', N'KH chính thức', N'KH trung thành')),
    CONSTRAINT CHK_TrangThaiDungThu CHECK (trangThaiDungThu IN (N'Chưa dùng thử', N'Đang dùng thử', N'Hết hạn dùng thử', N'Đã chuyển đổi')),
    CONSTRAINT CHK_EmailKhachHang CHECK (email LIKE '%_@_%._%'),
    CONSTRAINT CHK_SoDTKhachHang CHECK (soDienThoai NOT LIKE '%[^0-9]%' AND LEN(soDienThoai) BETWEEN 10 AND 11),
    CONSTRAINT CHK_NgaySinhKH CHECK (ngaySinh IS NULL OR ngaySinh <= CAST(GETDATE() AS DATE)),
    CONSTRAINT CHK_DiemTiemNang CHECK (diemTiemNang BETWEEN 0 AND 1000),
    CONSTRAINT CHK_SoNgayDungThu CHECK (soNgayDungThu >= 0)
);

-- 9. Bảng Lịch Sử Trạng Thái Khách Hàng
CREATE TABLE LichSuTrangThaiKhachHang (
    maLichSu        INT IDENTITY(1,1) PRIMARY KEY,
    maKhachHang     INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang) ON DELETE CASCADE,
    trangThaiTruoc  NVARCHAR(50) NULL,
    trangThaiSau    NVARCHAR(50) NOT NULL,
    ngayThayDoi     DATETIME DEFAULT GETDATE()
);
 
-- 10. Bảng Thẻ Phân Loại
CREATE TABLE ThePhanLoai (
    maThe          INT IDENTITY(1,1) PRIMARY KEY,
    tenThe         NVARCHAR(50) UNIQUE NOT NULL,
    mauSac         VARCHAR(10) DEFAULT '#cccccc',
    moTa           NVARCHAR(200) NULL,
    ngayTao        DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_MauSacThe CHECK (mauSac LIKE '#%' AND LEN(mauSac) IN (4, 7))
);
 
-- 11. Bảng Gán Thẻ - Khách Hàng
CREATE TABLE GanThe_KhachHang (
    maKhachHang    INT NOT NULL,
    maThe          INT NOT NULL,
    ngayGan        DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (maKhachHang, maThe),
    CONSTRAINT FK_GanThe_KhachHang FOREIGN KEY (maKhachHang)
        REFERENCES KhachHang(maKhachHang) ON DELETE CASCADE,
    CONSTRAINT FK_GanThe_The FOREIGN KEY (maThe)
        REFERENCES ThePhanLoai(maThe) ON DELETE CASCADE
);
 
-- 12. Bảng Lịch Sử Tương Tác
CREATE TABLE LichSuTuongTac (
    maTuongTac     INT IDENTITY(1,1) PRIMARY KEY,
    maKhachHang    INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang) ON DELETE CASCADE,
    maNhanVien     INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    loaiTuongTac   NVARCHAR(50) NOT NULL,
    tieuDe         NVARCHAR(200) NULL,  
    noiDung        NVARCHAR(MAX) NOT NULL,
    kenhLienLac    NVARCHAR(50) NULL,
    ketQua         NVARCHAR(50) NULL,
    thoiGianTao    DATETIME DEFAULT GETDATE(),
    ngayCapNhat    DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_LoaiTuongTac CHECK (loaiTuongTac IN (N'Gọi điện', N'Email', N'Gặp mặt', N'Nhắn tin')),
    CONSTRAINT CHK_KetQuaTuongTac CHECK (ketQua IN (N'Thành công', N'Không liên lạc được', N'Cần theo dõi', N'Khách từ chối', NULL))
);
 
-- 13. Bảng Tệp Đính Kèm
CREATE TABLE TepDinhKem (
    maTep          INT IDENTITY(1,1) PRIMARY KEY,
    tenTep         NVARCHAR(255) NOT NULL,  
    duongDanLuuTru VARCHAR(500) NOT NULL,  
    loaiTep        VARCHAR(20) NULL,  
    dungLuong      BIGINT NULL,      
    ngayTaiLen     DATETIME DEFAULT GETDATE(),
    maNhanVien     INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien)
);

-- 14. Bảng Trung Gian Tương Tác - Tệp Đính Kèm
CREATE TABLE LichSuTuongTac_TepDinhKem (
    maTuongTac     INT NOT NULL,
    maTep          INT NOT NULL,
    ngayGan        DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (maTuongTac, maTep),
    CONSTRAINT FK_TuongTac_Tep FOREIGN KEY (maTuongTac) 
        REFERENCES LichSuTuongTac(maTuongTac) ON DELETE CASCADE,
    CONSTRAINT FK_Tep_TuongTac FOREIGN KEY (maTep) 
        REFERENCES TepDinhKem(maTep) ON DELETE CASCADE
);
 
-- 15. Bảng Nhắc Nhở
CREATE TABLE NhacNho (
    maNhacNho         INT IDENTITY(1,1) PRIMARY KEY,
    maKhachHang       INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang),
    maNhanVien        INT NOT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    tieuDe            NVARCHAR(200) NOT NULL,
    moTa              NVARCHAR(500) NULL,
    loaiNhacNho       NVARCHAR(50) DEFAULT N'Gọi điện',
    thoiGianNhac      DATETIME NOT NULL,
    nhacTruocPhut     INT DEFAULT 30,   
    trangThaiNhacNho  NVARCHAR(50) DEFAULT N'Chờ xử lý' NOT NULL,
    ketQua            NVARCHAR(50) NULL,
    ghiChuKetQua      NVARCHAR(500) NULL,
	ngayTao			  DATETIME DEFAULT GETDATE() NOT NULL,
    ngayCapNhat       DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_TrangThaiNhac CHECK (trangThaiNhacNho IN (N'Chờ xử lý', N'Đã hoàn thành', N'Đã hủy')),
    CONSTRAINT CHK_LoaiNhacNho CHECK (loaiNhacNho IN (N'Gọi điện', N'Email', N'Gặp mặt', N'Nhắn tin')),
    CONSTRAINT CHK_KetQuaNhac CHECK (ketQua IN (N'Thành công', N'Khách bận', N'Khách từ chối', NULL)),
    CONSTRAINT CHK_NhacTruocPhut CHECK (nhacTruocPhut BETWEEN 0 AND 10080)
);

-- 16. Bảng Chiến Dịch Marketing
CREATE TABLE ChienDich (
    maChienDich        INT IDENTITY(1,1) PRIMARY KEY,
    maNguoiQuanLy      INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    tenChienDich       NVARCHAR(200) NOT NULL,
    moTa               NVARCHAR(MAX) NULL,
    mucTieu            NVARCHAR(MAX) NULL,   
    loaiChienDich      NVARCHAR(50) NULL,
    ngayBatDau         DATE NOT NULL,
    ngayKetThuc        DATE NOT NULL,
    nganSach           DECIMAL(15,2) DEFAULT 0 NOT NULL,
    doanhThuThucTe     DECIMAL(15,2) DEFAULT 0 NOT NULL,
    trangThaiChienDich NVARCHAR(50) DEFAULT N'Lên kế hoạch' NOT NULL,
    daXoa              BIT DEFAULT 0 NOT NULL,
    lyDoXoa            NVARCHAR(200) NULL,
    ngayXoa            DATETIME NULL,
    ngayTao            DATETIME DEFAULT GETDATE(),
    ngayCapNhat        DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_ThoiGianCD CHECK (ngayKetThuc >= ngayBatDau),
    CONSTRAINT CHK_NganSach CHECK (nganSach >= 0),
    CONSTRAINT CHK_DoanhThu CHECK (doanhThuThucTe >= 0),
    CONSTRAINT CHK_TrangThaiCD CHECK (trangThaiChienDich IN (N'Lên kế hoạch', N'Đang chạy', N'Tạm dừng', N'Đã kết thúc')),
    CONSTRAINT CHK_LoaiChienDich CHECK (loaiChienDich IN (N'Email', N'SMS', N'Event', N'Online Ads', N'Zalo', N'Khác', NULL))
);

-- 17. Bảng Kênh Truyền Thông
CREATE TABLE KenhTruyenThong (
    maKenh          INT IDENTITY(1,1) PRIMARY KEY,
    maChienDich     INT NOT NULL FOREIGN KEY REFERENCES ChienDich(maChienDich) ON DELETE CASCADE,
    tenKenh         NVARCHAR(100) NOT NULL,
    nganSachDuKien  DECIMAL(15,2) DEFAULT 0,
    ghiChu          NVARCHAR(500) NULL,
    trangThaiKenh   NVARCHAR(50) DEFAULT N'Đang hoạt động',
    CONSTRAINT CHK_TrangThaiKenh CHECK (trangThaiKenh IN (N'Đang hoạt động', N'Tạm dừng', N'Đã kết thúc')),
    CONSTRAINT CHK_NganSachKenh CHECK (nganSachDuKien >= 0)
);
 
-- 18. Bảng Khách Hàng - Chiến Dịch
CREATE TABLE KhachHang_ChienDich (
    maChienDich    INT NOT NULL FOREIGN KEY REFERENCES ChienDich(maChienDich),
    maKhachHang    INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang),
    ngayGan        DATETIME DEFAULT GETDATE(),
    trangThai      NVARCHAR(50) DEFAULT N'Đang tham gia',
    PRIMARY KEY (maChienDich, maKhachHang),
    CONSTRAINT CHK_TrangThaiKHCD CHECK (trangThai IN (N'Đang tham gia', N'Đã chuyển đổi', N'Không quan tâm'))
);
 
-- 19. Bảng Chi Phí Chiến Dịch
CREATE TABLE ChiPhiChienDich (
    maChiPhi       INT IDENTITY(1,1) PRIMARY KEY,
    maChienDich    INT NOT NULL FOREIGN KEY REFERENCES ChienDich(maChienDich),
    tenKhoanChi    NVARCHAR(200) NOT NULL,
    loaiChiPhi     NVARCHAR(100) NOT NULL,
    soTien         DECIMAL(15,2) NOT NULL,
    ghiChu         NVARCHAR(300) NULL,
    nguonGhiNhan   NVARCHAR(50) DEFAULT N'Nhập thủ công' NOT NULL,
    ngayGhiNhan    DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_SoTienChi CHECK (soTien > 0),
    CONSTRAINT CHK_NguonGhiNhan CHECK (nguonGhiNhan IN (N'Nhập thủ công', N'API Facebook Ads', N'API Google Ads'))
);

-- 20. Bảng Hợp Đồng - Giao Dịch
CREATE TABLE HopDong_GiaoDich (
    maHopDong         INT IDENTITY(1,1) PRIMARY KEY,
    maKhachHang       INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang),
    maChienDich       INT NULL FOREIGN KEY REFERENCES ChienDich(maChienDich),
    tenHopDong        NVARCHAR(200) NOT NULL,
    soHopDong         VARCHAR(50) NULL,
    giaTriHopDong     DECIMAL(15,2) DEFAULT 0 NOT NULL,
    trangThaiHopDong  NVARCHAR(50) DEFAULT N'Đang thương lượng' NOT NULL,
    ghiChu            NVARCHAR(MAX) NULL,
    ngayTao           DATETIME DEFAULT GETDATE(),
    ngayCapNhat       DATETIME DEFAULT GETDATE(),
    ngayChotDon       DATE NULL,
    CONSTRAINT CHK_GiaTri CHECK (giaTriHopDong >= 0),
    CONSTRAINT CHK_TrangThaiHD CHECK (trangThaiHopDong IN (N'Đang thương lượng', N'Thắng', N'Thua')),
    CONSTRAINT CHK_NgayChotDon CHECK (ngayChotDon IS NULL OR ngayChotDon >= CAST(ngayTao AS DATE))
);

-- 21. Bảng Mẫu Thông Điệp
CREATE TABLE MauThongDiep (
    maMau            INT IDENTITY(1,1) PRIMARY KEY,
    tieuDe           NVARCHAR(200) UNIQUE NOT NULL,
    noiDung          NVARCHAR(MAX) NOT NULL,
    loaiThongDiep    NVARCHAR(50) NOT NULL,
    maNhanVienTao    INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    luotSuDung       INT DEFAULT 0 NOT NULL,
    ngayTao          DATETIME DEFAULT GETDATE(),
    ngayCapNhat      DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_LoaiThongDiep CHECK (loaiThongDiep IN (N'Email', N'SMS', N'Zalo'))
);
 
-- 22. Bảng Lịch Sử Gửi Thông Điệp
CREATE TABLE LichSuGuiThongDiep (
    maLichSuGui    INT IDENTITY(1,1) PRIMARY KEY,
    maKhachHang    INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang) ON DELETE CASCADE,
    maNhanVien     INT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    maMau          INT NULL FOREIGN KEY REFERENCES MauThongDiep(maMau),
    kenhGui        NVARCHAR(50) NOT NULL,
    tieuDe         NVARCHAR(200) NULL,
    noiDung        NVARCHAR(MAX) NOT NULL,
    trangThaiGui   NVARCHAR(50) DEFAULT N'Đã gửi' NOT NULL,
    lyDoThatBai    NVARCHAR(300) NULL,
    thoiGianGui    DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_KenhGui CHECK (kenhGui IN (N'Email', N'SMS', N'Zalo')),
    CONSTRAINT CHK_TrangThaiGui CHECK (trangThaiGui IN (N'Đã gửi', N'Thất bại', N'Chờ gửi'))
);

-- 23. Bảng Quy Tắc Tự Động Hóa
CREATE TABLE QuyTacTuDongHoa (
    maQuyTac            INT IDENTITY(1,1) PRIMARY KEY,
    tenQuyTac           NVARCHAR(200) NOT NULL,
    loaiQuyTac          NVARCHAR(50) DEFAULT N'Kịch bản' NOT NULL,
    moTa                NVARCHAR(500) NULL,
    dieuKienKichHoat    NVARCHAR(MAX) NOT NULL,
    hanhDongThucHien    NVARCHAR(MAX) NOT NULL,
    giaTriDiemThaydoi   INT NULL,
    maMauThongDiep      INT NULL FOREIGN KEY REFERENCES MauThongDiep(maMau),
    trangThaiQuyTac     BIT DEFAULT 1 NOT NULL,
    soLanThucThi        INT DEFAULT 0 NOT NULL,
    ngayTao             DATETIME DEFAULT GETDATE(),
    ngayCapNhat         DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_LoaiQuyTac CHECK (loaiQuyTac IN (N'Kịch bản', N'Chấm điểm'))
);
 
-- 24. Bảng Lịch Sử Thực Thi Quy Tắc
CREATE TABLE LichSuThucThiQuyTac (
    maLichSuTT     INT IDENTITY(1,1) PRIMARY KEY,
    maQuyTac       INT NOT NULL FOREIGN KEY REFERENCES QuyTacTuDongHoa(maQuyTac),
    maKhachHang    INT NOT NULL FOREIGN KEY REFERENCES KhachHang(maKhachHang),
    thoiGianThucThi DATETIME DEFAULT GETDATE(),
    ketQuaThucThi  NVARCHAR(50) DEFAULT N'Thành công',
    chiTiet        NVARCHAR(500) NULL,   
    CONSTRAINT CHK_KetQuaTT CHECK (ketQuaThucThi IN (N'Thành công', N'Thất bại', N'Bỏ qua'))
);
 
-- 25. Bảng Thông Báo
CREATE TABLE ThongBao (
    maThongBao      INT IDENTITY(1,1) PRIMARY KEY,
    maNhanVien      INT NOT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien) ON DELETE CASCADE,
    tieuDe          NVARCHAR(200) NULL,
    noiDung         NVARCHAR(500) NOT NULL,
    loaiThongBao    NVARCHAR(50) DEFAULT N'Hệ thống' NOT NULL,
    daDoc           BIT DEFAULT 0 NOT NULL,
    duongDanLienKet VARCHAR(255) NULL,
    thoiGianTao     DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_LoaiThongBao CHECK (loaiThongBao IN (N'Hệ thống', N'Nhắc nhở', N'Phân công', N'Chiến dịch', N'Trùng lặp', N'Dùng thử'))
);
 
-- 26. Bảng Lịch Sử Xuất Dữ Liệu
CREATE TABLE LichSuXuatDuLieu (
    maXuat         INT IDENTITY(1,1) PRIMARY KEY,
    maNhanVien     INT NOT NULL FOREIGN KEY REFERENCES NhanVien(maNhanVien),
    loaiXuat       NVARCHAR(50) NOT NULL,
    dinhDang       NVARCHAR(10) NOT NULL,
    soLuongBanGhi  INT DEFAULT 0 NOT NULL,
    duongDanFile   VARCHAR(500) NULL,
    diaChiIP       VARCHAR(45) NULL,
    thoiGianXuat   DATETIME DEFAULT GETDATE(),
    CONSTRAINT CHK_DinhDang CHECK (dinhDang IN (N'Excel', N'CSV', N'PDF'))
);

-- ================================================================
-- KIỂM TRA RÀNG BUỘC
-- ================================================================

-- ----------------------------------------------------------------
-- RC01: Ràng buộc email hợp lệ cho bảng TaiKhoan
-- ----------------------------------------------------------------
--ALTER TABLE TaiKhoan
--ADD CONSTRAINT CHK_EmailTaiKhoan
--    CHECK (email LIKE '%_@_%._%');
--GO

-- ----------------------------------------------------------------
-- RC02: Ràng buộc email hợp lệ cho bảng KhachHang
-- ----------------------------------------------------------------
--ALTER TABLE KhachHang
--ADD CONSTRAINT CHK_EmailKhachHang
--    CHECK (email LIKE '%_@_%._%');
--GO

-- ----------------------------------------------------------------
-- RC03: Ràng buộc số điện thoại (chỉ chứa chữ số, 9-11 ký tự)
-- ----------------------------------------------------------------
--ALTER TABLE KhachHang
--ADD CONSTRAINT CHK_SoDTKhachHang
--    CHECK (soDienThoai NOT LIKE '%[^0-9]%' AND LEN(soDienThoai) BETWEEN 10 AND 11);
--GO

--ALTER TABLE NhanVien
--ADD CONSTRAINT CHK_SoDTNhanVien
--    CHECK (soDienThoai IS NULL OR
--          (soDienThoai NOT LIKE '%[^0-9]%' AND LEN(soDienThoai) BETWEEN 10 AND 11));
--GO

-- ----------------------------------------------------------------
-- RC04: Ràng buộc ngày sinh không được ở tương lai
-- ----------------------------------------------------------------
--ALTER TABLE KhachHang
--ADD CONSTRAINT CHK_NgaySinhKH
--    CHECK (ngaySinh IS NULL OR ngaySinh <= CAST(GETDATE() AS DATE));
--GO

--ALTER TABLE NhanVien
--ADD CONSTRAINT CHK_NgaySinhNV
--    CHECK (ngaySinh IS NULL OR ngaySinh <= CAST(GETDATE() AS DATE));
--GO

-- ----------------------------------------------------------------
-- RC05: Ràng buộc điểm tiềm năng trong khoảng [0, 1000]
-- ----------------------------------------------------------------
--ALTER TABLE KhachHang
--ADD CONSTRAINT CHK_DiemTiemNang
--    CHECK (diemTiemNang BETWEEN 0 AND 1000);
--GO

-- ----------------------------------------------------------------
-- RC06: Ràng buộc nhắc trước số phút hợp lệ [0, 10080] (tối đa 7 ngày)
-- ----------------------------------------------------------------
--ALTER TABLE NhacNho
--ADD CONSTRAINT CHK_NhacTruocPhut
--    CHECK (nhacTruocPhut BETWEEN 0 AND 10080);
--GO

-- ----------------------------------------------------------------
-- RC07: Ràng buộc mã màu sắc thẻ phân loại (hex color)
-- ----------------------------------------------------------------
--ALTER TABLE ThePhanLoai
--ADD CONSTRAINT CHK_MauSacThe
--    CHECK (mauSac LIKE '#%' AND LEN(mauSac) IN (4, 7));
--GO

-- ----------------------------------------------------------------
-- RC08: Ràng buộc ngân sách kênh truyền thông không âm
-- ----------------------------------------------------------------
--ALTER TABLE KenhTruyenThong
--ADD CONSTRAINT CHK_NganSachKenh
--    CHECK (nganSachDuKien >= 0);
--GO

-- ----------------------------------------------------------------
-- RC09: Ràng buộc ngày chốt đơn phải sau ngày tạo hợp đồng
-- ----------------------------------------------------------------
--ALTER TABLE HopDong_GiaoDich
--ADD CONSTRAINT CHK_NgayChotDon
--    CHECK (ngayChotDon IS NULL OR ngayChotDon >= CAST(ngayTao AS DATE));
--GO

-- ----------------------------------------------------------------
-- RC10: Ràng buộc số ngày dùng thử không âm
-- ----------------------------------------------------------------
--ALTER TABLE KhachHang
--ADD CONSTRAINT CHK_SoNgayDungThu
--    CHECK (soNgayDungThu >= 0);
--GO


-- ================================================================
-- PHẦN 2: DỮ LIỆU MẪU
-- ================================================================

-- Dữ liệu Vai Trò
INSERT INTO VaiTro (tenVaiTro, moTa) VALUES
    (N'Admin',               N'Quản trị viên hệ thống'),
    (N'Trưởng phòng',        N'Trưởng phòng Marketing'),
    (N'Nhân viên Marketing', N'Nhân viên Marketing');

-- Dữ liệu Tỉnh Thành
INSERT INTO TinhThanh (tenTinhThanh, loai) VALUES
    (N'Đà Nẵng',    N'Thành phố trực thuộc TW'),
    (N'Hà Nội',     N'Thành phố trực thuộc TW'),
    (N'Hồ Chí Minh',N'Thành phố trực thuộc TW');

-- Dữ liệu Phường Xã
INSERT INTO PhuongXa (tenPhuongXa, maTinhThanh, loai) VALUES
    (N'Hải Châu',   1, N'Phường'),
    (N'Thanh Khê',  1, N'Phường'),
    (N'Hoàn Kiếm',  2, N'Phường');

-- Dữ liệu Ngành Nghề
INSERT INTO NganhNghe (tenNganhNghe, moTa) VALUES
    (N'Công nghệ thông tin', N'Phần mềm, IT Services'),
    (N'Tài chính - Ngân hàng', N'Dịch vụ tài chính'),
    (N'Thương mại điện tử',  N'Bán hàng online'),
    (N'Giáo dục',            N'Trường học, đào tạo'),
    (N'Y tế',                N'Bệnh viện, phòng khám');

-- Dữ liệu Nguồn Khách Hàng
INSERT INTO NguonKhachHang (tenNguon, moTa, loaiNguon) VALUES
    (N'Facebook Ads',   N'Quảng cáo Facebook',     N'Mạng xã hội'),
    (N'Google Ads',     N'Quảng cáo Google',        N'Quảng cáo trực tuyến'),
    (N'Giới thiệu',     N'Khách hàng giới thiệu',   N'Giới thiệu'),
    (N'Sự kiện Tech',   N'Hội thảo công nghệ',      N'Sự kiện'),
    (N'Website',        N'Form đăng ký website',    N'Website');

-- Dữ liệu Tài Khoản & Nhân Viên
INSERT INTO TaiKhoan (maVaiTro, email, matKhau, trangThai) VALUES
    (1, 'admin@gmail.com',  'admin123',  N'Hoạt động'),
    (2, 'anhthu@gmail.com', 'tp123',     N'Hoạt động'),
    (3, 'nv01@crm.vn',		'nv01123',   N'Hoạt động'),
    (3, 'nv02@crm.vn',		'nv02123',   N'Hoạt động');

INSERT INTO NhanVien (maTaiKhoan, hoTen, soDienThoai, chucVu, maPhuongXa) VALUES
    (1, N'Admin',     '0901000001', N'Quản trị viên', 1),
    (2, N'Nguyễn Hoàng Anh Thư',      '0902000002', N'Trưởng phòng Marketing', 1),
    (3, N'Nhân Viên 01',  '0903000003', N'Nhân viên Marketing', 2),
    (4, N'Nhân Viên 02','0904000004', N'Nhân viên Marketing', 2);

-- Dữ liệu Khách Hàng mẫu
INSERT INTO KhachHang (maNguoiPhuTrach, maNganhNghe, maNguonKH, maPhuongXa, hoTen, email, soDienThoai, gioiTinh, ngaySinh, congTy, chucVuTaiCongTy, trangThaiKhach, diemTiemNang, ngayBatDauDungThu, soNgayDungThu, trangThaiDungThu) VALUES 
(3, 1, 1, 1, N'Công ty ABC', 'abc@abc.vn', '0911000001', N'Nam', '1990-05-10', N'Công ty ABC', N'Giám đốc', N'KH tiềm năng mới', 20, GETDATE(), 30, N'Đang dùng thử'), 
(3, 2, 2, 2, N'Nguyễn Văn Bình', 'binh@xyz.vn', '0911000002', N'Nam', '1988-03-15', N'XYZ Corp', N'Kế toán trưởng', N'KH triển vọng', 50, GETDATE(), 14, N'Đang dùng thử'), 
(4, 3, 3, 3, N'Trần Thị Cẩm', 'cam@shop.vn', '0911000003', N'Nữ', '1995-07-20', N'Shop Online', N'Chủ shop', N'KH chính thức', 80, NULL, 0, N'Đã chuyển đổi'), 
(4, 4, 4, 1, N'Lê Hoàng Dũng', 'dung@edu.vn', '0911000004', N'Nam', '1985-11-01', N'Trường ABC', N'Hiệu trưởng', N'KH tiềm năng mới', 10, GETDATE(), 7, N'Đang dùng thử'), 
(3, 5, 5, 2, N'Phạm Thị Em', 'em@clinic.vn', '0911000005', N'Nữ', '1992-09-25', N'Phòng khám', N'Bác sĩ', N'KH triển vọng', 35, GETDATE(), 21, N'Đang dùng thử');

-- Dữ liệu Chiến Dịch
INSERT INTO ChienDich (maNguoiQuanLy, tenChienDich, moTa, loaiChienDich, ngayBatDau, ngayKetThuc, nganSach,doanhThuThucTe, trangThaiChienDich) VALUES
    (2, N'Email Marketing Q1 2025', N'Chiến dịch email quý 1', N'Email',
        '2025-01-01', '2025-03-31', 50000000,150000000, N'Đã kết thúc'),
    (2, N'Facebook Ads T4 2025',    N'Quảng cáo Facebook tháng 4', N'Online Ads',
        '2025-04-01', '2025-04-30', 30000000,60000000, N'Đã kết thúc'),
    (2, N'Zalo CRM Campaign 2025',  N'Chiến dịch Zalo chăm sóc KH', N'Zalo',
        '2025-05-01', '2025-12-31', 20000000,0, N'Đang chạy');

-- Gán khách hàng vào chiến dịch
INSERT INTO KhachHang_ChienDich (maChienDich, maKhachHang, trangThai) VALUES
    (1, 1, N'Đã chuyển đổi'),
    (1, 2, N'Đang tham gia'),
    (2, 3, N'Đã chuyển đổi'),
    (3, 4, N'Đang tham gia'),
    (3, 5, N'Đang tham gia');

-- Dữ liệu Lịch Sử Tương Tác
INSERT INTO LichSuTuongTac (maKhachHang, maNhanVien, loaiTuongTac, tieuDe, noiDung, ketQua) VALUES
    (1, 3, N'Gọi điện', N'Tư vấn sản phẩm', N'Đã tư vấn gói Enterprise cho ABC Corp', N'Thành công'),
    (2, 3, N'Email',    N'Gửi báo giá',      N'Đã gửi email báo giá tháng 4',           N'Cần theo dõi'),
    (3, 4, N'Gặp mặt', N'Demo sản phẩm',    N'Demo trực tiếp tại văn phòng khách',     N'Thành công'),
    (4, 4, N'Nhắn tin', N'Follow up',        N'Nhắn tin qua Zalo hỏi thăm nhu cầu',    N'Cần theo dõi'),
    (5, 3, N'Gọi điện', N'Chào hàng',       N'Giới thiệu giải pháp quản lý phòng khám',N'Thành công');

-- Dữ liệu Hợp Đồng
INSERT INTO HopDong_GiaoDich (maKhachHang, maChienDich, tenHopDong, giaTriHopDong, trangThaiHopDong, ngayChotDon) VALUES
    (1, 1, N'HĐ Phần mềm CRM - ABC Corp', 120000000, N'Thắng',              DATEADD(DAY, 30, CAST(GETDATE() AS DATE))),
    (3, 2, N'HĐ Module Bán hàng - Shop',   45000000,  N'Thắng',             DATEADD(DAY, 7, CAST(GETDATE() AS DATE))),
    (2, 1, N'HĐ Tư vấn - XYZ Corp',        30000000,  N'Đang thương lượng',  NULL);

-- Dữ liệu Chi Phí Chiến Dịch
INSERT INTO ChiPhiChienDich (maChienDich, tenKhoanChi, loaiChiPhi, soTien)
VALUES
(1, N'Email tool', N'Phần mềm', 10000000),
(1, N'Nhân sự', N'Lương', 5000000),
(2, N'Facebook Ads', N'Quảng cáo', 20000000),
(3, N'Zalo Ads', N'Quảng cáo', 10000000);

-- Dữ liệu Nhắc Nhở
INSERT INTO NhacNho (maKhachHang, maNhanVien, tieuDe, loaiNhacNho, thoiGianNhac, trangThaiNhacNho) VALUES
    (2, 3, N'Follow up báo giá XYZ', N'Gọi điện', DATEADD(DAY, 3, GETDATE()),  N'Chờ xử lý'),
    (4, 4, N'Demo sản phẩm Trường', N'Gặp mặt',  DATEADD(DAY, 7, GETDATE()),  N'Chờ xử lý'),
    (5, 3, N'Tư vấn phòng khám',    N'Email',     DATEADD(DAY, 2, GETDATE()),  N'Chờ xử lý');

-- Dữ liệu Mẫu Thông Điệp
INSERT INTO MauThongDiep (tieuDe, noiDung, loaiThongDiep, maNhanVienTao) VALUES
    (N'Chào mừng khách hàng mới',
     N'Xin chào {hoTen}, cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi!',
     N'Email', 2),
    (N'Nhắc nhở dùng thử sắp hết hạn',
     N'Kỳ dùng thử của bạn sẽ hết hạn trong {soNgayConLai} ngày. Hãy nâng cấp để tiếp tục sử dụng!',
     N'SMS', 2),
    (N'Chúc mừng sinh nhật khách hàng',
     N'Kính gửi {hoTen}, nhân dịp sinh nhật, chúng tôi xin gửi tặng bạn ưu đãi đặc biệt 15%!',
     N'Zalo', 2);
GO

-- ================================================================
-- PHẦN 3: FUNCTIONS
-- ================================================================

-- ----------------------------------------------------------------
-- F01: Tính số ngày còn lại trong kỳ dùng thử của khách hàng
-- ----------------------------------------------------------------
CREATE FUNCTION fn_SoNgayConLaiDungThu (@maKhachHang INT)
RETURNS INT
AS
BEGIN
    DECLARE @ngayBatDau DATE, @soNgay INT, @ngayKetThuc DATE, @conLai INT;

    SELECT @ngayBatDau = ngayBatDauDungThu,
           @soNgay     = soNgayDungThu
    FROM   KhachHang
    WHERE  maKhachHang = @maKhachHang;

    IF @ngayBatDau IS NULL OR @soNgay = 0
        RETURN NULL;

    SET @ngayKetThuc = DATEADD(DAY, @soNgay, @ngayBatDau);
    SET @conLai      = DATEDIFF(DAY, CAST(GETDATE() AS DATE), @ngayKetThuc);

    RETURN IIF(@conLai < 0, 0, @conLai);
END;
GO

---TEST F01 fn_SoNgayConLaiDungThu
-- Test với 1 khách hàng cụ thể
SELECT dbo.fn_SoNgayConLaiDungThu(1) AS SoNgayConLai;
-- Test nhiều khách hàng
SELECT maKhachHang,
       dbo.fn_SoNgayConLaiDungThu(maKhachHang) AS SoNgayConLai
FROM KhachHang;
GO


-- ----------------------------------------------------------------
-- F02: Tính ROI của một chiến dịch
-- ROI = (DoanhThuThucTe - TongChiPhi) / TongChiPhi * 100
-- ----------------------------------------------------------------
CREATE FUNCTION fn_TinhROI (@maChienDich INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @doanhThu   DECIMAL(15,2),
            @tongChiPhi DECIMAL(15,2),
            @roi        DECIMAL(10,2);

    SELECT @doanhThu = doanhThuThucTe FROM ChienDich WHERE maChienDich = @maChienDich;

    SELECT @tongChiPhi = ISNULL(SUM(soTien), 0)
    FROM   ChiPhiChienDich
    WHERE  maChienDich = @maChienDich;

    IF @tongChiPhi = 0
        RETURN NULL;

    SET @roi = (@doanhThu - @tongChiPhi) / @tongChiPhi * 100;
    RETURN @roi;
END;
GO

---TEST F02 fn_TinhROI
-- Test 1 chiến dịch
SELECT dbo.fn_TinhROI(2) AS ROI;
-- Test toàn bộ chiến dịch
SELECT maChienDich,
       dbo.fn_TinhROI(maChienDich) AS ROI
FROM ChienDich;
GO

-- ----------------------------------------------------------------
-- F03: Đếm số tương tác trong N ngày gần nhất của một khách hàng
-- ----------------------------------------------------------------
CREATE FUNCTION fn_SoTuongTacGanDay (@maKhachHang INT, @soNgay INT)
RETURNS INT
AS
BEGIN
    DECLARE @soLuong INT;
    SELECT @soLuong = COUNT(*)
    FROM   LichSuTuongTac
    WHERE  maKhachHang = @maKhachHang
      AND  thoiGianTao >= DATEADD(DAY, -@soNgay, GETDATE());
    RETURN ISNULL(@soLuong, 0);
END;
GO

-----TEST F03 fn_SoTuongTacGanDay
-- Test khách hàng trong 7 ngày gần nhất
SELECT dbo.fn_SoTuongTacGanDay(1, 7) AS SoTuongTac;
-- Test nhiều khách hàng
SELECT maKhachHang,
       dbo.fn_SoTuongTacGanDay(maKhachHang, 30) AS TuongTac30Ngay
FROM KhachHang;
-- Không có tương tác
SELECT dbo.fn_SoTuongTacGanDay(999, 7);
GO

-- ----------------------------------------------------------------
-- F04: Đếm số khách hàng đang được phụ trách bởi một nhân viên
-- ----------------------------------------------------------------
CREATE FUNCTION fn_SoKhachHangPhuTrach (@maNhanVien INT)
RETURNS INT
AS
BEGIN
    DECLARE @soLuong INT;
    SELECT @soLuong = COUNT(*)
    FROM   KhachHang
    WHERE  maNguoiPhuTrach = @maNhanVien
      AND  daXoa = 0;
    RETURN ISNULL(@soLuong, 0);
END;
GO

------TEST F04 fn_SoKhachHangPhuTrach 
-- Test 1 nhân viên
SELECT dbo.fn_SoKhachHangPhuTrach(3) AS SoKhachHang;
-- Test toàn bộ nhân viên
SELECT maNhanVien,
       dbo.fn_SoKhachHangPhuTrach(maNhanVien) AS SoKhachHang
FROM NhanVien;
GO

-- ----------------------------------------------------------------
-- F05 : Tính tỉ lệ chuyển đổi
-- ----------------------------------------------------------------
CREATE FUNCTION fn_TyLeChuyenDoi (@maChienDich INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @tong INT, @chuyenDoi INT;

    SELECT @tong = COUNT(*) 
    FROM KhachHang_ChienDich
    WHERE maChienDich = @maChienDich;

    SELECT @chuyenDoi = COUNT(*)
    FROM KhachHang_ChienDich
    WHERE maChienDich = @maChienDich
      AND trangThai = N'Đã chuyển đổi';

    IF @tong = 0 RETURN 0;

    RETURN @chuyenDoi * 100.0 / @tong;
END;
GO

---TEST F05 fn_TyLeChuyenDoi
SELECT 
    cd.maChienDich,
    cd.tenChienDich,
    dbo.fn_TyLeChuyenDoi(cd.maChienDich) AS TyLeChuyenDoi
FROM ChienDich cd;
GO

-- ----------------------------------------------------------------
-- F06: Kiểm tra trùng email hoặc số điện thoại của khách hàng
-- ----------------------------------------------------------------
CREATE FUNCTION fn_KiemTraTrungLap (
    @email VARCHAR(150),
    @soDienThoai VARCHAR(15),
    @maKhachHangBoQua INT = NULL
)
RETURNS BIT
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM KhachHang
        WHERE daXoa = 0
          AND (@maKhachHangBoQua IS NULL OR maKhachHang <> @maKhachHangBoQua)
          AND (
              (@email IS NOT NULL AND email = @email)
              OR (@soDienThoai IS NOT NULL AND soDienThoai = @soDienThoai)
          )
    )
        RETURN 1;

    RETURN 0;
END;
GO

-- ================================================================
-- PHẦN 4: STORED PROCEDURES
-- ================================================================

-- ----------------------------------------------------------------
-- SP01: Thêm khách hàng mới
--   - Kiểm tra trùng email/SĐT
--   - Tạo thông báo cho nhân viên phụ trách
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_ThemKhachHang
    @maNguoiPhuTrach  INT,
    @maNganhNghe      INT,
    @maNguonKH        INT,
    @maPhuongXa       INT,
    @hoTen            NVARCHAR(100),
    @email            VARCHAR(150),
    @soDienThoai      VARCHAR(15),
    @gioiTinh         NVARCHAR(10)  = NULL,
    @ngaySinh         DATE          = NULL,
    @congTy           NVARCHAR(150) = NULL,
    @chucVuTaiCongTy  NVARCHAR(100) = NULL,
    @diaChiChiTiet    NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra trùng lặp
    IF dbo.fn_KiemTraTrungLap(@email, @soDienThoai, NULL) = 1
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Email hoặc Số điện thoại đã tồn tại trong hệ thống.' AS ThongBao;
        RETURN;
    END

    INSERT INTO KhachHang (
        maNguoiPhuTrach, maNganhNghe, maNguonKH, maPhuongXa,
        hoTen, email, soDienThoai, gioiTinh, ngaySinh,
        congTy, chucVuTaiCongTy, diaChiChiTiet
    )
    VALUES (
        @maNguoiPhuTrach, @maNganhNghe, @maNguonKH, @maPhuongXa,
        @hoTen, @email, @soDienThoai, @gioiTinh, @ngaySinh,
        @congTy, @chucVuTaiCongTy, @diaChiChiTiet
    );

    DECLARE @maKHMoi INT = SCOPE_IDENTITY();

    -- Gửi thông báo cho nhân viên phụ trách
    IF @maNguoiPhuTrach IS NOT NULL
        INSERT INTO ThongBao (maNhanVien, tieuDe, noiDung, loaiThongBao)
        VALUES (@maNguoiPhuTrach,
                N'Khách hàng mới được phân công',
                N'Bạn vừa được phân công phụ trách khách hàng: ' + @hoTen,
                N'Phân công');

    SELECT N'OK' AS KetQua, N'Thêm khách hàng thành công.' AS ThongBao,
           @maKHMoi AS maKhachHang;
END;
GO

-- TEST SP01: sp_ThemKhachHang
PRINT N'===== TEST SP01: sp_ThemKhachHang =====';

EXEC sp_ThemKhachHang
    @maNguoiPhuTrach = 3,
    @maNganhNghe = 1,
    @maNguonKH = 5,
    @maPhuongXa = 1,
    @hoTen = N'Khách Hàng Test SP01',
    @email = 'test_sp01@crm.vn',
    @soDienThoai = '0911999991',
    @gioiTinh = N'Nam',
    @ngaySinh = '1998-01-01',
    @congTy = N'Công ty Test SP01',
    @chucVuTaiCongTy = N'Giám đốc',
    @diaChiChiTiet = N'123 Hải Châu, Đà Nẵng';
GO

-- Kiểm tra khách hàng vừa thêm
SELECT *
FROM KhachHang
WHERE email = 'test_sp01@crm.vn';
GO

-- Kiểm tra thông báo được tạo cho nhân viên phụ trách
SELECT TOP 5 *
FROM ThongBao
WHERE maNhanVien = 3
  AND noiDung LIKE N'%Khách Hàng Test SP01%'
ORDER BY maThongBao DESC;
GO

-- ----------------------------------------------------------------
-- SP02: Cập nhật trạng thái (phân loại) khách hàng
--   - Ghi log vào LichSuTrangThaiKhachHang
--   - Thêm vào LichSuTuongTac
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_CapNhatTrangThaiKhachHang
    @maKhachHang  INT,
    @trangThaiMoi NVARCHAR(50),
    @maNhanVien   INT,
    @ghiChu       NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @trangThaiCu NVARCHAR(50);
    SELECT @trangThaiCu = trangThaiKhach FROM KhachHang WHERE maKhachHang = @maKhachHang;

    IF @trangThaiCu IS NULL
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Khách hàng không tồn tại.' AS ThongBao;
        RETURN;
    END

    IF @trangThaiCu = @trangThaiMoi
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Trạng thái không thay đổi.' AS ThongBao;
        RETURN;
    END

    -- Cập nhật trạng thái
    UPDATE KhachHang
    SET    trangThaiKhach = @trangThaiMoi,
           ngayCapNhat    = GETDATE()
    WHERE  maKhachHang = @maKhachHang;

    -- Ghi lịch sử tương tác
    INSERT INTO LichSuTuongTac (maKhachHang, maNhanVien, loaiTuongTac, tieuDe, noiDung, ketQua)
    VALUES (@maKhachHang, @maNhanVien, N'Gặp mặt',
            N'Phân loại khách hàng',
            N'Chuyển trạng thái từ [' + @trangThaiCu + N'] sang [' + @trangThaiMoi + N']' +
            ISNULL(N'. Ghi chú: ' + @ghiChu, N''),
            N'Thành công');

    SELECT N'OK' AS KetQua, N'Cập nhật trạng thái thành công.' AS ThongBao;
END;
GO

-- TEST SP02: sp_CapNhatTrangThaiKhachHang
PRINT N'===== TEST SP02: sp_CapNhatTrangThaiKhachHang =====';

EXEC sp_CapNhatTrangThaiKhachHang
    @maKhachHang = 1,
    @trangThaiMoi = N'KH triển vọng',
    @maNhanVien = 3,
    @ghiChu = N'Test cập nhật trạng thái từ SP02';
GO

-- Kiểm tra trạng thái khách hàng sau cập nhật
SELECT maKhachHang, hoTen, trangThaiKhach, ngayCapNhat
FROM KhachHang
WHERE maKhachHang = 1;
GO

-- Kiểm tra lịch sử tương tác được thêm
SELECT TOP 5 *
FROM LichSuTuongTac
WHERE maKhachHang = 1
  AND tieuDe = N'Phân loại khách hàng'
ORDER BY maTuongTac DESC;
GO

-- Kiểm tra bảng lịch sử trạng thái (nếu proc có ghi)
SELECT TOP 5 *
FROM LichSuTrangThaiKhachHang
WHERE maKhachHang = 1
ORDER BY maLichSu DESC;
GO

-- ----------------------------------------------------------------
-- SP03: Phân bổ khách hàng cho nhân viên
--   - Hỗ trợ phân bổ thủ công và tự động (xoay vòng)
--   - Gửi thông báo cho nhân viên được phân công
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_PhanBoKhachHang
    @maKhachHang    INT,
    @maNhanVienMoi  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @maNVDuoc INT = @maNhanVienMoi;

    -- Phân bổ tự động: chọn nhân viên đang có ít khách hàng nhất
    IF @maNVDuoc IS NULL
    BEGIN
        SELECT TOP 1 @maNVDuoc = nv.maNhanVien
        FROM NhanVien nv
        JOIN TaiKhoan tk ON nv.maTaiKhoan = tk.maTaiKhoan
        WHERE tk.trangThai = N'Hoạt động'
        ORDER BY dbo.fn_SoKhachHangPhuTrach(nv.maNhanVien) ASC;
    END

    IF @maNVDuoc IS NULL
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Không có nhân viên khả dụng để phân bổ.' AS ThongBao;
        RETURN;
    END

    DECLARE @hoTenKH NVARCHAR(100);
    SELECT @hoTenKH = hoTen FROM KhachHang WHERE maKhachHang = @maKhachHang;

    IF @hoTenKH IS NULL
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Khách hàng không tồn tại.' AS ThongBao;
        RETURN;
    END

    UPDATE KhachHang
    SET    maNguoiPhuTrach = @maNVDuoc,
           ngayCapNhat     = GETDATE()
    WHERE  maKhachHang = @maKhachHang;

    -- chỉ sửa dòng này
    INSERT INTO ThongBao (maNhanVien, tieuDe, noiDung, loaiThongBao)
    VALUES (@maNVDuoc,
            N'Khách hàng mới được phân công',
            N'Bạn được phân công phụ trách khách hàng: ' + ISNULL(@hoTenKH, N'[Không xác định]'),
            N'Phân công');

    SELECT N'OK' AS KetQua, N'Phân bổ thành công.' AS ThongBao,
           @maNVDuoc AS maNhanVienDuocPhanCong;
END;
GO

-- TEST SP03: sp_PhanBoKhachHang
PRINT N'===== TEST SP03: sp_PhanBoKhachHang =====';

EXEC sp_PhanBoKhachHang
    @maKhachHang = 4,
    @maNhanVienMoi = 3;
GO

-- Kiểm tra khách hàng đã được phân bổ
SELECT maKhachHang, hoTen, maNguoiPhuTrach, ngayCapNhat
FROM KhachHang
WHERE maKhachHang = 4;
GO

-- Kiểm tra thông báo phân công
SELECT TOP 5 *
FROM ThongBao
WHERE maNhanVien = 3
  AND noiDung LIKE N'%Lê Hoàng Dũng%'
ORDER BY maThongBao DESC;
GO

-- ----------------------------------------------------------------
-- SP04: Tạo chiến dịch marketing
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_TaoChienDich
    @maNguoiQuanLy  INT,
    @tenChienDich   NVARCHAR(200),
    @moTa           NVARCHAR(MAX)  = NULL,
    @mucTieu        NVARCHAR(MAX)  = NULL,
    @loaiChienDich  NVARCHAR(50)   = NULL,
    @ngayBatDau     DATE,
    @ngayKetThuc    DATE,
    @nganSach       DECIMAL(15,2)  = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF @ngayKetThuc < @ngayBatDau
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.' AS ThongBao;
        RETURN;
    END

    INSERT INTO ChienDich (
        maNguoiQuanLy, tenChienDich, moTa, mucTieu,
        loaiChienDich, ngayBatDau, ngayKetThuc, nganSach
    )
    VALUES (
        @maNguoiQuanLy, @tenChienDich, @moTa, @mucTieu,
        @loaiChienDich, @ngayBatDau, @ngayKetThuc, @nganSach
    );

    DECLARE @maCD INT = SCOPE_IDENTITY();
    SELECT N'OK' AS KetQua, N'Tạo chiến dịch thành công.' AS ThongBao,
           @maCD AS maChienDich;
END;
GO

-- TEST SP04: sp_TaoChienDich
PRINT N'===== TEST SP04: sp_TaoChienDich =====';

EXEC sp_TaoChienDich
    @maNguoiQuanLy = 2,
    @tenChienDich = N'Chiến dịch Test SP04',
    @moTa = N'Chiến dịch dùng để kiểm thử SP04',
    @mucTieu = N'Tăng số lượng khách hàng tiềm năng',
    @loaiChienDich = N'Email',
    @ngayBatDau = '2026-05-01',
    @ngayKetThuc = '2026-05-31',
    @nganSach = 15000000;
GO

-- Kiểm tra chiến dịch vừa tạo
SELECT *
FROM ChienDich
WHERE tenChienDich = N'Chiến dịch Test SP04';
GO

-- ----------------------------------------------------------------
-- SP05: Khôi phục khách hàng đã xóa
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_KhoiPhucKhachHang
    @maKhachHang INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM KhachHang WHERE maKhachHang = @maKhachHang AND daXoa = 1)
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Khách hàng không tồn tại hoặc chưa bị xóa.' AS ThongBao;
        RETURN;
    END

    UPDATE KhachHang
    SET    daXoa       = 0,
           lyDoXoa     = NULL,
           ngayXoa     = NULL,
           ngayCapNhat = GETDATE()
    WHERE  maKhachHang = @maKhachHang;

    SELECT N'OK' AS KetQua, N'Khôi phục khách hàng thành công.' AS ThongBao;
END;
GO

-- TEST SP05: sp_KhoiPhucKhachHang
PRINT N'===== TEST SP05: sp_KhoiPhucKhachHang =====';

-- Chuẩn bị dữ liệu test: xóa mềm khách hàng mã 5
UPDATE KhachHang
SET daXoa = 1,
    lyDoXoa = N'Test xóa mềm để kiểm thử SP05',
    ngayXoa = GETDATE(),
    ngayCapNhat = GETDATE()
WHERE maKhachHang = 5;
GO

-- Kiểm tra trước khi khôi phục
SELECT maKhachHang, hoTen, daXoa, lyDoXoa, ngayXoa
FROM KhachHang
WHERE maKhachHang = 5;
GO

-- Gọi proc khôi phục
EXEC sp_KhoiPhucKhachHang
    @maKhachHang = 5;
GO

-- Kiểm tra sau khi khôi phục
SELECT maKhachHang, hoTen, daXoa, lyDoXoa, ngayXoa, ngayCapNhat
FROM KhachHang
WHERE maKhachHang = 5;
GO

-- ----------------------------------------------------------------
-- SP06: Gộp dữ liệu khách hàng trùng lặp
--   - Chuyển toàn bộ tương tác, nhắc nhở, hợp đồng sang bản ghi chính
--   - Xóa mềm bản ghi phụ
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_GopKhachHang
    @maKhachHangChinh INT,
    @maKhachHangPhu   INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;

    BEGIN TRY
        IF @maKhachHangChinh = @maKhachHangPhu
        BEGIN
            SELECT N'Lỗi' AS KetQua, N'Không thể gộp cùng một khách hàng.' AS ThongBao;
            ROLLBACK; RETURN;
        END

        -- Chuyển lịch sử tương tác
        UPDATE LichSuTuongTac
        SET    maKhachHang = @maKhachHangChinh
        WHERE  maKhachHang = @maKhachHangPhu;

        -- Chuyển nhắc nhở
        UPDATE NhacNho
        SET    maKhachHang = @maKhachHangChinh
        WHERE  maKhachHang = @maKhachHangPhu;

        -- Chuyển hợp đồng / giao dịch
        UPDATE HopDong_GiaoDich
        SET    maKhachHang = @maKhachHangChinh
        WHERE  maKhachHang = @maKhachHangPhu;

        -- Chuyển gửi thông điệp
        UPDATE LichSuGuiThongDiep
        SET    maKhachHang = @maKhachHangChinh
        WHERE  maKhachHang = @maKhachHangPhu;

        -- Xóa mềm bản ghi phụ
        UPDATE KhachHang
        SET    daXoa       = 1,
               lyDoXoa     = N'Gộp vào khách hàng #' + CAST(@maKhachHangChinh AS NVARCHAR),
               ngayXoa     = GETDATE(),
               ngayCapNhat = GETDATE()
        WHERE  maKhachHang = @maKhachHangPhu;

        COMMIT;
        SELECT N'OK' AS KetQua, N'Gộp dữ liệu khách hàng thành công.' AS ThongBao;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SELECT N'Lỗi' AS KetQua, ERROR_MESSAGE() AS ThongBao;
    END CATCH
END;
GO

-- TEST SP6: Gộp Khách hàng 4 (Phụ) vào Khách hàng 1 (Chính)
EXEC sp_GopKhachHang 
    @maKhachHangChinh = 1, 
    @maKhachHangPhu = 4;

-- Xem KH số 4 đã bị đánh dấu xóa (daXoa = 1) và có lý do chưa?
select maKhachHang, hoTen, daXoa, lyDoXoa from KhachHang where maKhachHang IN (1, 4);
-- 2. Xem các tương tác, nhắc nhở của KH 4 (nếu có) đã chuyển sang KH 1 chưa?
select * from LichSuTuongTac where maKhachHang = 1;
select * from NhacNho where maKhachHang = 1;
GO

-- ----------------------------------------------------------------
-- SP07: Xem thống kê tổng quan hệ thống
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_ThongKeTongQuan
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM KhachHang WHERE daXoa = 0)	AS TongKhachHang,
        (SELECT COUNT(*) FROM KhachHang WHERE daXoa = 0
            AND trangThaiKhach = N'KH tiềm năng mới')		AS KHTiemNangMoi,
        (SELECT COUNT(*) FROM KhachHang WHERE daXoa = 0
            AND trangThaiKhach = N'KH chính thức')          AS KHChinhThuc,
        (SELECT COUNT(*) FROM KhachHang WHERE daXoa = 0
            AND trangThaiDungThu = N'Đang dùng thử')        AS KHDangDungThu,
        (SELECT COUNT(*) FROM ChienDich WHERE daXoa = 0
            AND trangThaiChienDich = N'Đang chạy')          AS ChienDichDangChay,
        (SELECT COUNT(*) FROM NhacNho
            WHERE trangThaiNhacNho = N'Chờ xử lý'
            AND thoiGianNhac <= DATEADD(DAY, 1, GETDATE()))	AS NhacNhoSapDen,
        (SELECT ISNULL(SUM(giaTriHopDong),0) FROM HopDong_GiaoDich
            WHERE trangThaiHopDong = N'Thắng')	AS TongDoanhThuDatDuoc;
END;
GO

-- TEST SP7: và xem kết quả thống kê tổng quan
EXEC sp_ThongKeTongQuan;
GO

-- ----------------------------------------------------------------
-- SP08: Tạo tài khoản người dùng mới (Admin dùng)
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_TaoTaiKhoan
    @maVaiTro    INT,
    @email       VARCHAR(150),
    @matKhau     VARCHAR(255),
    @hoTen       NVARCHAR(100),
    @soDienThoai VARCHAR(15) = NULL,
    @chucVu      NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM TaiKhoan WHERE email = @email)
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Email này đã được sử dụng.' AS ThongBao;
        RETURN;
    END

    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO TaiKhoan (maVaiTro, email, matKhau, trangThai)
        VALUES (@maVaiTro, @email, @matKhau, N'Hoạt động');

        DECLARE @maTK INT = SCOPE_IDENTITY();

        INSERT INTO NhanVien (maTaiKhoan, hoTen, soDienThoai, chucVu)
        VALUES (@maTK, @hoTen, @soDienThoai, @chucVu);

        COMMIT;
        SELECT N'OK' AS KetQua, N'Tạo tài khoản thành công.' AS ThongBao,
               @maTK AS maTaiKhoan, SCOPE_IDENTITY() AS maNhanVien;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SELECT N'Lỗi' AS KetQua, ERROR_MESSAGE() AS ThongBao;
    END CATCH
END;
GO

-- TEST SP8:  Tạo mới thành công một nhân viên Marketing (maVaiTro = 3)
EXEC sp_TaoTaiKhoan 
    @maVaiTro = 3, 
    @email = 'minhchien123@gmail.vn', 
    @matKhau = 'matkhau123', 
    @hoTen = N'Trần Minh Chiến', 
    @soDienThoai = '0911222333', 
    @chucVu = N'Nhân viên Part-time';

-- Test bắt lỗi trùng Email
EXEC sp_TaoTaiKhoan 
    @maVaiTro = 3, @email = 'minhchien123@gmail.vn', @matKhau = '123', @hoTen = N'Lỗi Trùng';
	--check kết quả
select * from TaiKhoan;
select * from NhanVien;
GO

-- ----------------------------------------------------------------
-- SP09: Thêm nhắc nhở thông minh cho khách hàng
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_ThemNhacNho
    @maKhachHang   INT,
    @maNhanVien    INT,
    @tieuDe        NVARCHAR(200),
    @loaiNhacNho   NVARCHAR(50),
    @thoiGianNhac  DATETIME,
    @nhacTruocPhut INT          = 30,
    @moTa          NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF @thoiGianNhac <= GETDATE()
    BEGIN
        SELECT N'Lỗi' AS KetQua, N'Thời gian nhắc phải ở tương lai.' AS ThongBao;
        RETURN;
    END

    INSERT INTO NhacNho (maKhachHang, maNhanVien, tieuDe, moTa, loaiNhacNho, thoiGianNhac, nhacTruocPhut)
    VALUES (@maKhachHang, @maNhanVien, @tieuDe, @moTa, @loaiNhacNho, @thoiGianNhac, @nhacTruocPhut);

    SELECT N'OK' AS KetQua, N'Tạo nhắc nhở thành công.' AS ThongBao,
           SCOPE_IDENTITY() AS maNhacNho;
END;
GO

-- TEST SP9: Thêm nhắc nhở gọi điện vào tháng sau
DECLARE @thoiGianNhacTest DATETIME = DATEADD(DAY, 30, GETDATE());

EXEC sp_ThemNhacNho 
    @maKhachHang = 1, 
    @maNhanVien = 3, 
    @tieuDe = N'Gọi chốt deal gia hạn hợp đồng', 
    @loaiNhacNho = N'Gọi điện', 
    @thoiGianNhac = @thoiGianNhacTest, 
    @nhacTruocPhut = 30, 
    @moTa = N'Hỏi xem hệ thống chạy ổn định không';

-- Kiểm tra kết quả:
-- 1. Xem nhắc nhở đã được tạo chưa
select * from NhacNho;
-- 2. Kiểm tra Trigger TRG03 đã đẩy thông báo cho nhân viên số 3 chưa
select * from ThongBao where maNhanVien = 3;
GO

-- ----------------------------------------------------------------
-- SP10: Gửi thông điệp cho khách hàng và cập nhật lượt sử dụng mẫu
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_GuiThongDiep
    @maKhachHang INT,
    @maNhanVien  INT,
    @maMau       INT,
    @kenhGui     NVARCHAR(50),
    @tieuDe      NVARCHAR(200) = NULL,
    @noiDung     NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO LichSuGuiThongDiep (maKhachHang, maNhanVien, maMau, kenhGui, tieuDe, noiDung, trangThaiGui)
    VALUES (@maKhachHang, @maNhanVien, @maMau, @kenhGui, @tieuDe, @noiDung, N'Đã gửi');

    -- Cập nhật lượt sử dụng mẫu (nếu có)
    IF @maMau IS NOT NULL
        UPDATE MauThongDiep
        SET    luotSuDung  = luotSuDung + 1,
               ngayCapNhat = GETDATE()
        WHERE  maMau = @maMau;

    SELECT N'OK' AS KetQua, N'Gửi thông điệp thành công.' AS ThongBao;
END;
GO

-- TEST SP10: Gửi email dựa trên mẫu thông điệp số 1
EXEC sp_GuiThongDiep 
    @maKhachHang = 2, 
    @maNhanVien = 3, 
    @maMau = 1, 
    @kenhGui = N'Email', 
    @tieuDe = N'Chào mừng bạn mới', 
    @noiDung = N'Xin chào anh, cảm ơn anh đã quan tâm...';

-- Lịch sử đã được ghi nhận?
select * from LichSuGuiThongDiep;
-- Kiểm tra Cột luotSuDung của maMau = 1 trong bảng MauThongDiep
select maMau, tieuDe, luotSuDung from MauThongDiep where maMau = 1;
GO

-- ----------------------------------------------------------------
-- SP11: Xem báo cáo hiệu suất nhân viên theo tháng
-- ----------------------------------------------------------------
CREATE PROCEDURE sp_BaoCaoHieuSuatNhanVien
    @thang INT,
    @nam   INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        nv.maNhanVien,
        nv.hoTen,
        COUNT(DISTINCT kh.maKhachHang)      AS SoKhachPhuTrach,
        COUNT(DISTINCT lst.maTuongTac)       AS SoTuongTac,
        COUNT(DISTINCT nn.maNhacNho)         AS SoNhacNho,
        COUNT(DISTINCT hd.maHopDong)         AS SoHopDong,
        ISNULL(SUM(hd.giaTriHopDong), 0)    AS TongGiaTriHopDong
    FROM NhanVien nv
    LEFT JOIN KhachHang kh
           ON kh.maNguoiPhuTrach = nv.maNhanVien AND kh.daXoa = 0
    LEFT JOIN LichSuTuongTac lst
           ON lst.maNhanVien = nv.maNhanVien
          AND MONTH(lst.thoiGianTao) = @thang AND YEAR(lst.thoiGianTao) = @nam
    LEFT JOIN NhacNho nn
           ON nn.maNhanVien = nv.maNhanVien
          AND MONTH(nn.ngayTao) = @thang AND YEAR(nn.ngayTao) = @nam
    LEFT JOIN HopDong_GiaoDich hd
           ON hd.maKhachHang IN (
               SELECT maKhachHang FROM KhachHang WHERE maNguoiPhuTrach = nv.maNhanVien
           )
          AND MONTH(hd.ngayTao) = @thang AND YEAR(hd.ngayTao) = @nam
    GROUP BY nv.maNhanVien, nv.hoTen
    ORDER BY TongGiaTriHopDong DESC;
END;
GO

-- TEST SP11: Lấy báo cáo hiệu suất của tháng 4 năm 2026
EXEC sp_BaoCaoHieuSuatNhanVien 
    @thang = 4, 
    @nam = 2026;
-- SP11: Lấy báo cáo hiệu suất của tháng 3 năm 2026
EXEC sp_BaoCaoHieuSuatNhanVien 
    @thang = 3, 
    @nam = 2026;
GO

-- ================================================================
-- PHẦN 5: TRIGGERS
-- ================================================================

-- ----------------------------------------------------------------
-- TRG01: Tự động ghi log lịch sử trạng thái khi UPDATE KhachHang
-- ----------------------------------------------------------------
CREATE TRIGGER trg_KhachHang_LogTrangThai
ON KhachHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO LichSuTrangThaiKhachHang (maKhachHang, trangThaiTruoc, trangThaiSau)
    SELECT
        i.maKhachHang,
        d.trangThaiKhach,
        i.trangThaiKhach
    FROM inserted i
    JOIN deleted  d ON i.maKhachHang = d.maKhachHang
    WHERE i.trangThaiKhach <> d.trangThaiKhach;
END;
GO

-- TEST TRG01: trg_KhachHang_LogTrangThai
 
-- Xem trạng thái ban đầu của khách hàng mã 1
SELECT maKhachHang, hoTen, trangThaiKhach
FROM KhachHang
WHERE maKhachHang = 1;
 
-- Thực hiện thay đổi trạng thái khách hàng
UPDATE KhachHang
SET trangThaiKhach = N'KH triển vọng'
WHERE maKhachHang = 1;
 
-- Kiểm tra: Bảng LichSuTrangThaiKhachHang phải có 1 bản ghi mới
SELECT maLichSu, maKhachHang, trangThaiTruoc, trangThaiSau, ngayThayDoi
FROM LichSuTrangThaiKhachHang
WHERE maKhachHang = 1
ORDER BY ngayThayDoi DESC;
 
GO

-- ----------------------------------------------------------------
-- TRG02: Tự động tạo thông báo cho nhân viên khi được
--        phân công phụ trách khách hàng mới
-- ----------------------------------------------------------------
CREATE TRIGGER trg_KhachHang_ThongBaoPhanCong
ON KhachHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ khi maNguoiPhuTrach thực sự thay đổi
    INSERT INTO ThongBao (maNhanVien, tieuDe, noiDung, loaiThongBao)
    SELECT
        i.maNguoiPhuTrach,
        N'Khách hàng mới được phân công',
        N'Bạn được phân công phụ trách khách hàng: ' + i.hoTen,
        N'Phân công'
    FROM inserted i
    JOIN deleted  d ON i.maKhachHang = d.maKhachHang
    WHERE i.maNguoiPhuTrach IS NOT NULL
      AND (d.maNguoiPhuTrach IS NULL OR i.maNguoiPhuTrach <> d.maNguoiPhuTrach);
END;
GO

-- TEST TRG02: trg_KhachHang_ThongBaoPhanCong
 
-- Xem trạng thái ban đầu: KH mã 2, chưa có người phụ trách (hoặc phụ trách khác)
SELECT maKhachHang, hoTen, maNguoiPhuTrach
FROM KhachHang
WHERE maKhachHang = 2;
 
-- Đếm thông báo của nhân viên mã 1 trước khi test
SELECT COUNT(*) AS SoThongBaoTruoc
FROM ThongBao
WHERE maNhanVien = 1 AND loaiThongBao = N'Phân công';
 
-- Phân công nhân viên mã 1 phụ trách khách hàng mã 2
UPDATE KhachHang
SET maNguoiPhuTrach = 1
WHERE maKhachHang = 2;
 
-- Kiểm tra: Bảng ThongBao phải có thông báo mới cho nhân viên mã 1
SELECT maThongBao, maNhanVien, tieuDe, noiDung, loaiThongBao, thoiGianTao
FROM ThongBao
WHERE maNhanVien = 1 AND loaiThongBao = N'Phân công'
ORDER BY thoiGianTao DESC;
GO

-- ----------------------------------------------------------------
-- TRG03: Khi thêm nhắc nhở, tự động tạo thông báo cho nhân viên
-- ----------------------------------------------------------------
CREATE TRIGGER trg_NhacNho_TaoThongBao
ON NhacNho
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ThongBao (maNhanVien, tieuDe, noiDung, loaiThongBao, duongDanLienKet)
    SELECT
        i.maNhanVien,
        N'Nhắc nhở mới: ' + i.tieuDe,
        N'Bạn có nhắc nhở lúc ' + CONVERT(NVARCHAR, i.thoiGianNhac, 120) +
        N' - Loại: ' + i.loaiNhacNho,
        N'Nhắc nhở',
        N'/nhac-nho/' + CAST(i.maNhacNho AS NVARCHAR)
    FROM inserted i;
END;
GO

-- TEST TRG03: trg_NhacNho_TaoThongBao
 
-- Đếm thông báo loại 'Nhắc nhở' trước khi test
SELECT COUNT(*) AS SoThongBaoNhacNhoTruoc
FROM ThongBao
WHERE loaiThongBao = N'Nhắc nhở';
 
-- Thêm một nhắc nhở mới cho nhân viên mã 1, khách hàng mã 1
INSERT INTO NhacNho (maKhachHang, maNhanVien, tieuDe, loaiNhacNho, thoiGianNhac, nhacTruocPhut)
VALUES (1, 1, N'Gọi điện tư vấn', N'Gọi điện', DATEADD(DAY, 1, GETDATE()), 30);
 
-- Kiểm tra: ThongBao phải có bản ghi mới loại 'Nhắc nhở' cho nhân viên mã 1
SELECT TOP 3 maThongBao, maNhanVien, tieuDe, noiDung, loaiThongBao, thoiGianTao
FROM ThongBao
WHERE maNhanVien = 1 AND loaiThongBao = N'Nhắc nhở'
ORDER BY thoiGianTao DESC;
 
-- Kết quả mong đợi: Tiêu đề bắt đầu bằng 'Nhắc nhở mới: Gọi điện tư vấn'
PRINT N'>> TRG03: Kiểm tra ThongBao vừa có bản ghi loại Nhắc nhở.';
GO

-- ----------------------------------------------------------------
-- TRG04: Tự động cập nhật trangThaiDungThu khi ngày dùng thử hết hạn
--        (kích hoạt khi UPDATE cột ngayBatDauDungThu hoặc soNgayDungThu)
-- ----------------------------------------------------------------
CREATE TRIGGER trg_KhachHang_KiemTraHanDungThu
ON KhachHang
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật sang "Hết hạn dùng thử" nếu đã qua ngày kết thúc
    UPDATE KhachHang
    SET    trangThaiDungThu = N'Hết hạn dùng thử',
           ngayCapNhat      = GETDATE()
    WHERE  maKhachHang IN (SELECT maKhachHang FROM inserted)
      AND  trangThaiDungThu = N'Đang dùng thử'
      AND  ngayBatDauDungThu IS NOT NULL
      AND  DATEADD(DAY, soNgayDungThu, ngayBatDauDungThu) < CAST(GETDATE() AS DATE);
END;
GO

-- TEST TRG05: trg_KhachHang_KiemTraHanDungThu
 
-- 1. Set ngày dùng thử về quá khứ
UPDATE KhachHang
SET trangThaiDungThu  = N'Đang dùng thử',
    ngayBatDauDungThu = DATEADD(DAY, -40, CAST(GETDATE() AS DATE)),
    soNgayDungThu     = 30
WHERE maKhachHang = 3;
GO
SELECT maKhachHang, hoTen, trangThaiDungThu 
FROM KhachHang WHERE maKhachHang = 3;

-- 2. Cập nhật trường 
UPDATE KhachHang SET ngayCapNhat = GETDATE() WHERE maKhachHang = 3;

-- 3. Kiểm tra kết quả (trangThaiDungThu tự động nhảy thành 'Hết hạn dùng thử')
SELECT maKhachHang, hoTen, trangThaiDungThu 
FROM KhachHang WHERE maKhachHang = 3;
GO

-- ----------------------------------------------------------------
-- TRG06: Khi hợp đồng chuyển sang trạng thái 'Thắng',
--        tự động cập nhật khách hàng thành 'KH chính thức'
--        và cộng doanh thu thực tế vào chiến dịch liên quan
-- ----------------------------------------------------------------
CREATE TRIGGER trg_HopDong_ThangHopDong
ON HopDong_GiaoDich
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật trạng thái khách hàng
    UPDATE KhachHang
    SET    trangThaiKhach = N'KH chính thức',
           ngayCapNhat    = GETDATE()
    FROM   KhachHang kh
    JOIN   inserted  i ON kh.maKhachHang = i.maKhachHang
    JOIN   deleted   d ON i.maHopDong    = d.maHopDong
    WHERE  i.trangThaiHopDong = N'Thắng'
      AND  d.trangThaiHopDong <> N'Thắng';

    -- Cộng doanh thu vào chiến dịch
    UPDATE ChienDich
    SET    doanhThuThucTe = doanhThuThucTe + i.giaTriHopDong,
           ngayCapNhat    = GETDATE()
    FROM   ChienDich cd
    JOIN   inserted  i ON cd.maChienDich = i.maChienDich
    JOIN   deleted   d ON i.maHopDong    = d.maHopDong
    WHERE  i.trangThaiHopDong = N'Thắng'
      AND  d.trangThaiHopDong <> N'Thắng'
      AND  i.maChienDich IS NOT NULL;
END;
GO

-- TEST TRG06: trg_HopDong_ThangHopDong
 
-- Xem doanh thu chiến dịch mã 2 và trạng thái khách hàng trước test
SELECT maChienDich, tenChienDich, doanhThuThucTe FROM ChienDich WHERE maChienDich = 2;
SELECT maKhachHang, hoTen, trangThaiKhach FROM KhachHang WHERE maKhachHang = 3;
 
-- Thêm hợp đồng mới (đang thương lượng) cho KH mã 3, chiến dịch mã 2
INSERT INTO HopDong_GiaoDich (maKhachHang, maChienDich, tenHopDong, giaTriHopDong, trangThaiHopDong)
VALUES (3, 2, N'Hợp đồng Test TRG06', 50000000, N'Đang thương lượng');
 
DECLARE @maHD INT = SCOPE_IDENTITY();
PRINT N'Hợp đồng vừa tạo có mã: ' + CAST(@maHD AS NVARCHAR);
 
-- Cập nhật trạng thái hợp đồng → 'Thắng' để kích hoạt trigger
UPDATE HopDong_GiaoDich
SET trangThaiHopDong = N'Thắng'
WHERE maHopDong = 4;
 
-- Kiểm tra 1: KhachHang mã 3 phải là 'KH chính thức'
SELECT maKhachHang, hoTen, trangThaiKhach
FROM KhachHang
WHERE maKhachHang = 3;
 
-- Kiểm tra 2: doanhThuThucTe chiến dịch mã 2 phải tăng thêm 50,000,000
SELECT maChienDich, tenChienDich, doanhThuThucTe
FROM ChienDich
WHERE maChienDich = 2;
 
-- Kết quả mong đợi:
-- KH mã 3: trangThaiKhach = 'KH chính thức'
-- ChienDich mã 2: doanhThuThucTe tăng thêm 50,000,000

-- ================================================================
-- PHẦN 6: INDEX HỖ TRỢ HIỆU NĂNG TRUY VẤN
-- ================================================================

-- Index cho tìm kiếm khách hàng theo email, SĐT, trạng thái
CREATE INDEX IDX_KhachHang_Email        ON KhachHang (email)        WHERE daXoa = 0;
CREATE INDEX IDX_KhachHang_SoDT         ON KhachHang (soDienThoai)  WHERE daXoa = 0;
CREATE INDEX IDX_KhachHang_TrangThai    ON KhachHang (trangThaiKhach) WHERE daXoa = 0;
CREATE INDEX IDX_KhachHang_PhuTrach     ON KhachHang (maNguoiPhuTrach) WHERE daXoa = 0;

-- Index cho lịch sử tương tác
CREATE INDEX IDX_LichSuTuongTac_KH      ON LichSuTuongTac (maKhachHang, thoiGianTao DESC);
CREATE INDEX IDX_LichSuTuongTac_NV      ON LichSuTuongTac (maNhanVien,  thoiGianTao DESC);

-- Index cho nhắc nhở theo thời gian
CREATE INDEX IDX_NhacNho_ThoiGian       ON NhacNho (thoiGianNhac, trangThaiNhacNho);

-- Index cho thông báo chưa đọc
CREATE INDEX IDX_ThongBao_ChuaDoc       ON ThongBao (maNhanVien, daDoc) WHERE daDoc = 0;

-- Index cho chiến dịch đang chạy
CREATE INDEX IDX_ChienDich_TrangThai    ON ChienDich (trangThaiChienDich) WHERE daXoa = 0;
GO
