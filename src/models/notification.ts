export type NotificationType = 
  | 'GROUP_JOINED' 
  | 'MEMBER_JOINED' 
  | 'GROUP_FAVORITED' 
  | 'CHECKLIST_ASSIGNED' 
  | 'ACTIVITY_FINALIZED' 
  | 'DEBT_CREATED' 
  | 'DEBT_SETTLED' 
  | 'MEMBER_KICKED'
  | 'AI_SCHEDULE_GENERATED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}
