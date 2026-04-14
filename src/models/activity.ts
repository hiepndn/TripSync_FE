export interface Activity {
  id: number;
  group_id: number;
  name: string;
  type: 'HOTEL' | 'ATTRACTION' | 'RESTAURANT' | 'CAMPING' | '';
  location: string;
  description: string;
  start_time: string;   // ISO string, VD: "2026-03-09T15:30:00+07:00"
  end_time: string;
  status: 'PENDING' | 'APPROVED';
  created_by: number;
  is_ai_generated: boolean;
  // ⚠️ BE trả về camelCase cho các trường này
  estimatedCost: number;
  currency: string;
  imageURL: string;     // Thumbnail Agoda
  rating: number;
  externalLink: string;
  // Vote
  votes: any[] | null;
  vote_count: number;
  has_voted: boolean;
  // Ratings
  average_user_rating: number;
  my_rating: number;
  // Timestamps
  lat: number;
  lng: number;
  place_id: string;
}
