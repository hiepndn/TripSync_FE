export interface Group {
  id?: number | string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  invite_code?: string;
  // ... thêm các trường khác trả về từ DB nếu cần
  route_destinations?: string;       // Ví dụ: "Hà Nội, Sóc Sơn, Huế"
  accommodation_pref?: 'HOTEL' | 'CAMPING' | 'MIXED';
  expected_members?: number;
  budget_per_person?: number;
  currency?: string;                 // "VND" hoặc "USD"
  is_ai_generating?: boolean;
}