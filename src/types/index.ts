// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: string[];
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splitAmong: ExpenseSplit[];
  category?: string;
  date: string;
  createdAt: string;
}

export interface ExpenseSplit {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface Activity {
  id: string;
  groupId: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  votes: Vote[];
  status: 'proposed' | 'finalized';
  createdBy: string;
  createdAt: string;
}

export interface Vote {
  userId: string;
  timestamp: string;
}

export interface Document {
  id: string;
  groupId: string;
  name: string;
  url: string;
  category: 'ticket' | 'hotel' | 'visa' | 'insurance' | 'other';
  uploadedBy: string;
  uploadedAt: string;
}

export interface ChecklistItem {
  id: string;
  groupId: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
}