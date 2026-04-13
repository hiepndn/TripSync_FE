Báo cáo đánh giá DB & Danh sách công việc TripSyncV2

1. Đánh giá các case cũ (Sau khi sửa DB)

✅ [ĐÃ GIẢI QUYẾT] API Tạo Hoạt Động (Manual Activity Creation)
Frontend sẽ được cập nhật để truyền đầy đủ trường `type` và `location`. Backend giữ nguyên `binding:"required"` để đảm bảo tính chặt chẽ của Database.

✅ [ĐÃ GIẢI QUYẾT] API Tạo Nhóm (Create Group)
Đã chuyển sang sử dụng `dto.CreateGroupRequest` với đầy đủ 5 trường cấu hình mới (RouteDestinations, AccommodationPref, ExpectedMembers, BudgetPerPerson, Currency).

2. Danh sách công việc phát sinh (Bổ sung AI & Agoda)

✅ Đã xong: 
- Viết Service Tích hợp Gemini API (AI Planning). Đã sử dụng model `gemini-3-flash-preview` với Prompt Engineering ép kiểu JSON.
- Viết Service Tích hợp Agoda API. Lấy 3-5 khách sạn dựa vào ngân sách của Gemini.
- Thêm cờ `is_ai_generating` vào struct `models.Group`.
- Cập nhật hàm CreateGroup: Bật cờ, chạy Goroutine (Gemini + Agoda -> Insert Activities), tắt cờ.
⏳ **Đang làm: Xây dựng Hybrid Route & Xử lý UX Chạy ngầm:**
- Tích hợp vào giao diện để khi tạo nhóm thì gen luôn lịch trình
- Viết thêm API `POST /groups/:id/regenerate-ai`: Xóa các hoạt động do AI sinh ra lúc trước và chạy lại Goroutine.
- (Frontend) Code màn hình Loading sử dụng cơ chế Polling 3s/lần khi `is_ai_generating = true`.

3. Các API còn lại cần phải làm (Theo TripSyncV2.md)
Dựa trên Blueprint, đây là các Module và API hoàn toàn mới cần được xây dựng bổ sung từ đầu:

3.1. Module Quản lý Chi Tiêu (Smart Bill Splitter)
- CRUD Expenses: Thêm, sửa, xóa khoản chi tiêu (EXPENSES).
- Chia tiền (Split Logic): Thuật toán và API ghi nhận dữ liệu vào bảng EXPENSE_SPLITS (chia đều, chia theo tỷ lệ, hoặc tick chọn từng người).
- Tính toán công nợ: API trả về bảng tóm tắt "Ai nợ ai bao nhiêu tiền".

3.2. Module Chia sẻ Tài Liệu (Document Vault)
- Upload File: API tải tệp (vé máy bay, booking khách sạn) lên Server/Cloud (S3/Cloudinary) và lưu vào bảng DOCUMENTS.
- Download/Get Datalist: Lấy danh sách tài liệu của một hoạt động hoặc toàn nhóm.

3.3. Module Checklist & Task
- CRUD Checklist: API tạo, sửa, xóa các item cần mang/chuẩn bị (CHECKLIST_ITEMS).
- Phân công (Assign): Gắn assignee_id cho thành viên và Toggle trạng thái hoàn thành (is_completed).

3.4. Module System Admin (Tùy chọn)
- Quản trị viên hệ thống: Các API Get All Users, Get All Groups, Thống kê hệ thống dành cho Role Admin tổng.