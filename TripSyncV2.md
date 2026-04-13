# ✈️ Project Context: TripSync (Web Version)

## 1. Technical Stack & Architecture
* **Frontend**: React, TypeScript (Tuyệt đối **không** sử dụng Tailwind CSS).
* **Backend (Go)**: Kiến trúc phân lớp (Clean Architecture style):
    * **Route**: Khai báo các API endpoints.
    * **Controller**: Xử lý Request/Response và Validation.
    * **UseCase**: Chứa Business Logic cốt lõi.
    * **Repository**: Thao tác trực tiếp với Database (PostgreSQL).
* **Platform**: Web Application (Hỗ trợ PWA cho truy cập Offline).
* **Real-time**: Đồng bộ hóa tức thời qua WebSocket hoặc Firebase.
* **External APIs / 3rd Party Integration**: 
    * **Gemini API**: AI tạo đề xuất lịch trình tự động (Tour Guide).
    * **Agoda (Crawl/API)**: Trích xuất dữ liệu phòng khách sạn và giá cả thực tế (Receptionist).

## 2. Core Modules (Business Logic)
### 2.1. Authentication & Group Management
* **Auth**: Đăng nhập (Email/Social), Đăng ký và Quên mật khẩu.
* **Group Dashboard**: 
    * Hiển thị danh sách nhóm.
    * **Tạo nhóm mới (Owner)**: Nhập thông tin chi tiết để cấu hình chuyến đi:
        * Tên nhóm & Mô tả.
        * Ngày bắt đầu & Ngày kết thúc.
        * **Hành trình (Route Destinations)**: Danh sách các điểm đến (VD: Hà Nội, Quảng Bình, Đà Nẵng).
        * **Gu lưu trú (Accommodation Preference)**: Lựa chọn Khách sạn (HOTEL), Cắm trại (CAMPING), hoặc Linh hoạt (MIXED).
        * **Số lượng thành viên dự kiến**.
        * **Ngân sách dự kiến cho 1 người**.
        * *Logic Tích hợp AI (Hybrid - Chạy ngầm)*: Khi submit, hệ thống lưu Group với cờ `is_ai_generating = true` và trả về ngay cho UI. Một Goroutine chạy ngầm gọi **Gemini API** để lên lịch trình. Sau đó gọi **Agoda API** tìm khách sạn thật. Toàn bộ data được insert vào bảng `ACTIVITIES`. Xong xuôi, cập nhật lại `is_ai_generating = false`.
        * Tự động sinh ID nhóm để chia sẻ.
    * Tham gia nhóm (Member) bằng ID được chia sẻ.

### 2.2. Lịch trình cộng tác (Itinerary)
* **Giao diện**: Hiển thị Timeline/Grid theo ngày bằng MUI. Khi `is_ai_generating` đang `true`, hiển thị màn hình Loading (Polling API mỗi 3 giây).
* **Cơ chế Đề xuất & Vote**: 
    * Các đề xuất AI/Agoda sinh ra sẽ nằm ở khu vực "Đang bỏ phiếu" (`PENDING`).
    * Có nút "Gợi ý lại lịch trình" (gọi lại AI và xóa các đề xuất cũ của hệ thống).
    * Mọi thành viên đều có thể vote (👍) hoặc đề xuất thêm hoạt động mới.
    * Hoạt động nhiều vote nhất sẽ được Owner chốt vào lịch chính thức (`APPROVED`).
* **Tính năng bổ trợ**: Tích hợp Google Maps và Drag & Drop để sắp xếp lịch trình.

### 2.3. Chia tiền thông minh (Smart Bill Splitter)
* **Chức năng**: Thêm chi tiêu, hỗ trợ đa tiền tệ.
* **Cơ chế chia tiền gốc**: Chia đều, theo tỷ lệ, hoặc **tick chọn từng thành viên cụ thể** tham gia khoản chi (Lưu vào 2 bảng `EXPENSES` và `EXPENSE_SPLITS`).
* **Thuật toán Tối giản hóa công nợ (Debt Simplification)**: Sử dụng **Thuật toán Tham lam (Greedy Algorithm)** để giảm thiểu tối đa số lượng giao dịch chuyển khoản thừa thãi giữa các thành viên. Luồng xử lý gồm 4 bước:
    * **Bước 1: Tính toán Net Balance (Số dư thuần)**: Quét toàn bộ dữ liệu từ `EXPENSES` và `EXPENSE_SPLITS` của nhóm. 
        * Tổng tiền user đã trả hộ (`EXPENSES`) - Tổng tiền user nợ (`EXPENSE_SPLITS`) = `Net Balance`.
        * Nếu `Balance > 0`: Là Chủ nợ (Creditor - Cần thu lại tiền).
        * Nếu `Balance < 0`: Là Con nợ (Debtor - Phải móc ví ra trả).
        * *(Quy luật: Tổng Net Balance của tất cả mọi người trong nhóm luôn luôn bằng 0).*
    * **Bước 2: Phân tách danh sách**: Lọc và tách những người có `Balance > 0` vào mảng `Creditors`, và những người có `Balance < 0` vào mảng `Debtors` (chuyển số âm thành dương để dễ tính). Tối ưu hóa bằng cách sắp xếp 2 mảng này giảm dần theo số tiền.
    * **Bước 3: Khớp nợ (Greedy Matching)**: Dùng 2 con trỏ quét qua 2 mảng. Lấy người nợ nhiều nhất trả thẳng cho người cần nhận nhiều nhất. 
        * Lượng tiền giao dịch = `Min(Debtor_Amount, Creditor_Amount)`.
        * Ghi nhận giao dịch và trừ đi lượng tiền tương ứng ở cả 2 người.
        * Ai về 0 thì tiến con trỏ bỏ qua người đó, lặp lại cho đến khi cả 2 mảng đều về 0.
    * **Output**: Hệ thống trả về danh sách các chỉ thị chuyển khoản cuối cùng (VD: "A chuyển cho B 50k", thay vì A trả C, C trả B rối rắm).

### 2.4. Document Vault & Checklist
* **Tài liệu**: Lưu trữ vé máy bay, xác nhận khách sạn; hỗ trợ xem offline.
* **Checklist**: Danh sách đồ dùng cần mang và phân công nhiệm vụ cho từng người.

## 3. Permissions & Rules
* **Owner (Người tạo)**: Toàn quyền quản lý thành viên, chỉnh sửa thông tin nhóm, và chốt các nội dung (Lịch trình/Chi tiêu).
* **Member (Thành viên)**: Đề xuất, bình chọn, thêm chi tiêu và thực hiện nhiệm vụ được giao.
* **Export**: Có tính năng xuất toàn bộ chuyến đi thành link chia sẻ nhanh.
* **Admin Screen**: Có màn hình quản trị riêng cho các thiết lập nâng cao, như quản lý toàn bộ các nhóm, bảng thống kê, quản lý user.

## 4. Coding Standard
* **Go**: Tuân thủ Error Handling (`if err != nil`) và tối ưu concurrency.
* **React**: Sử dụng Functional Components và Hooks; Type-safe tuyệt đối với TypeScript.
* **UI/UX**: Không dùng Tailwind; sử dụng **MUI (Material-UI)**, ưu tiên tính trực quan, thao tác nhanh và hover tooltips.
* **Grid Layout**: Sử dụng Grid MUI bản mới (không truyền prop `item`).
* **Database**: Sử dụng `*gorm.DB` để tương tác với PostgreSQL.


## 7 database:

---
config:
  layout: elk
  theme: neutral
---
erDiagram
	direction LR
	USERS {
		id int PK ""  
		full_name string  ""  
		email string  ""  
		password string  ""  
		avatar string  ""  
		role string  ""  
	}

	GROUP_MEMBERS {
		group_id int PK,FK ""  
		user_id int PK,FK ""  
		role string  "ADMIN / MEMBER"  
		joined_at datetime  ""  
	}

	GROUPS {
		id int PK ""  
		name string  ""  
		description string  ""  
		start_date datetime  ""  
		end_date datetime  ""  
		invite_code string  ""  
		is_public boolean  ""  
		share_token string  ""  
		route_destinations string  "Danh sách điểm đến (VD: Hà Nội, Huế)"  
		accommodation_pref string  "Gu lưu trú (HOTEL / CAMPING / MIXED)"  
		expected_members int  "Số người dự kiến"  
		budget_per_person decimal  "Ngân sách/người"  
		currency string  "Loại tiền tệ (VND)"  
		is_ai_generating boolean "Cờ báo hiệu AI đang lên lịch trình"
	}

	ACTIVITIES {
		id int PK ""  
		group_id int FK ""  
		name string  ""  
		type string  "HOTEL / ATTRACTION / RESTAURANT / CAMPING"  
		location string  ""  
		description string  ""  
		start_time datetime  ""  
		end_time datetime  ""  
		status string  "PENDING / APPROVED"  
		created_by int FK "Null nếu là AI tạo"  
		lat float  ""  
		lng float  ""  
		place_id int  ""  
		is_ai_generated boolean  "Đánh dấu AI/Agoda tạo"  
		estimated_cost decimal  "Chi phí dự kiến"  
		currency string  "VND, USD"  
		image_url string  "Thumbnail Agoda"  
		rating float  "Số sao"  
		external_link string  "Link affiliate booking"  
	}

	ACTIVITY_VOTES {
		activity_id int PK,FK ""  
		user_id int PK,FK ""  
		vote_type string  ""  
	}

	EXPENSES {
		id int PK ""  
		group_id int FK ""  
		payer_id int FK ""  
		amount decimal  ""  
		currency string  ""  
		description string  ""  
		split_type string  ""  
	}

	EXPENSE_SPLITS {
		expense_id int PK,FK ""  
		user_id int PK,FK ""  
		amount_owed decimal  ""  
	}

	CHECKLIST_ITEMS {
		id int PK ""  
		group_id int FK ""  
		title string  ""  
		category string  ""  
		assignee_id int FK ""  
		is_completed boolean  ""  
		completed_by_id int  ""  
	}

	DOCUMENTS {
		id int PK ""  
		activity_id int FK ""  
		group_id int FK ""  
		uploaded_by_id int FK ""  
		file_url string  ""  
		file_type string  ""  
		file_name string  ""  
		file_size float  ""  
		category string  ""  
	}

	USERS||--o{GROUP_MEMBERS:"tham gia"
	USERS||--o{GROUPS:"tạo (owner)"
	USERS||--o{ACTIVITIES:"đề xuất"
	USERS||--o{ACTIVITY_VOTES:"bình chọn"
	USERS||--o{EXPENSES:"thanh toán (payer)"
	USERS||--o{EXPENSE_SPLITS:"nợ tiền (debtor)"
	USERS||--o{CHECKLIST_ITEMS:"được phân công"
    USERS ||--o{ DOCUMENTS : "tải lên"
	GROUPS||--o{GROUP_MEMBERS:"chứa"
	GROUPS||--o{ACTIVITIES:"thuộc về"
	GROUPS||--o{EXPENSES:"chi tiêu của"
	GROUPS||--o{DOCUMENTS:"tài liệu của"
	GROUPS||--o{CHECKLIST_ITEMS:"công việc của"
	ACTIVITIES||--o{ACTIVITY_VOTES:"nhận"
	ACTIVITIES||--o{DOCUMENTS:"có tài liệu đính kèm"
	EXPENSES||--o{EXPENSE_SPLITS:"được chia nhỏ"

	## 📁 Cấu trúc FE

```
src/
├── app/
│   └── store.ts                  # Redux store (auth, groups, tripDetail)
├── config/
│   └── api/
│       ├── index.ts              # apiCall() wrapper (axios + JWT header)
│       └── endpoint.ts           # Tất cả URL endpoints
├── models/
│   ├── group.ts                  # Group interface
│   └── activity.ts               # Activity interface
├── features/
│   ├── auth/                     # Login / Register (DONE)
│   │   ├── redux/                # action, reducer, types
│   │   └── index.tsx
│   ├── dashboard/                # Màn hình chính sau đăng nhập (DONE)
│   │   ├── redux/                # fetchGroupsAction, createGroupAction
│   │   ├── tabs/
│   │   │   ├── overViewTab.tsx   # Grid cards nhóm
│   │   │   └── components/
│   │   │       ├── addGroupDialog.tsx   # Form tạo nhóm (có 5 field AI)
│   │   │       └── joinGroupDialog.tsx  # Form nhập invite code
│   │   └── index.tsx
│   └── trip-detail/              # Màn hình chi tiết chuyến đi (DONE một phần)
│       ├── redux/
│       │   ├── types.ts
│       │   ├── action.ts         # fetch, finalize, add activity
│       │   └── reducer.ts        # groupDetail, members, myRole, activities
│       ├── components/
│       │   ├── tripHeader.tsx    # Banner ảnh + tên nhóm + members
│       │   ├── tripNavigation.tsx # Tabs: Lịch trình, Chi phí, Thảo luận, Tệp tin
│       │   ├── aiGeneratingBanner.tsx  # Loading khi AI đang chạy
│       │   └── tabs/
│       │       ├── itineraryTab/
│       │       │   ├── index.tsx        # Orchestrator: fetch, lọc ngày
│       │       │   ├── daySelector.tsx  # Row chọn ngày
│       │       │   ├── timeline/
│       │       │   │   └── timelineItem.tsx  # Timeline MUI, render activities
│       │       │   └── widgets/
│       │       │       ├── mapWidget.tsx
│       │       │       └── pendingVoteWidget.tsx
│       │       ├── costTab/      # ⚠️ CHƯA IMPLEMENT
│       │       ├── checklistTab/ # ⚠️ CHƯA IMPLEMENT
│       │       └── documentsTab/ # ⚠️ CHƯA IMPLEMENT
│       └── index.tsx             # Route /groups/:id, polling is_ai_generating
└── components/                   # Shared UI components
```

---