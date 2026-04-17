export interface Group {
  id?: number | string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  invite_code?: string;
  departure_location?: string;
  route_destinations?: string;
  accommodation_pref?: 'HOTEL' | 'CAMPING' | 'MIXED';
  expected_members?: number;
  budget_per_person?: number;
  currency?: string;
  is_ai_generating?: boolean;
  role?: 'ADMIN' | 'MEMBER';
}