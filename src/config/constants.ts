// Roles
export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Permissions
export const PERMISSIONS = {
  GROUP_EDIT: 'group:edit',
  GROUP_DELETE: 'group:delete',
  EXPENSE_ADD: 'expense:add',
  EXPENSE_FINALIZE: 'expense:finalize',
  ACTIVITY_PROPOSE: 'activity:propose',
  ACTIVITY_FINALIZE: 'activity:finalize',
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_DELETE: 'document:delete',
  CHECKLIST_EDIT: 'checklist:edit',
  MEMBER_MANAGE: 'member:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Permission Matrix
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.GROUP_EDIT,
    PERMISSIONS.GROUP_DELETE,
    PERMISSIONS.EXPENSE_ADD,
    PERMISSIONS.EXPENSE_FINALIZE,
    PERMISSIONS.ACTIVITY_PROPOSE,
    PERMISSIONS.ACTIVITY_FINALIZE,
    PERMISSIONS.DOCUMENT_UPLOAD,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.CHECKLIST_EDIT,
    PERMISSIONS.MEMBER_MANAGE,
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.EXPENSE_ADD,
    PERMISSIONS.ACTIVITY_PROPOSE,
    PERMISSIONS.DOCUMENT_UPLOAD,
  ],
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  GROUP_DETAIL: '/groups/:groupId',
  ITINERARY: '/groups/:groupId/itinerary',
  EXPENSES: '/groups/:groupId/expenses',
  DOCUMENTS: '/groups/:groupId/documents',
  CHECKLIST: '/groups/:groupId/checklist',
  MEMBERS: '/groups/:groupId/members',
} as const;

// Split types
export const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  CUSTOM: 'custom',
} as const;

export type SplitType = (typeof SPLIT_TYPES)[keyof typeof SPLIT_TYPES];

// Currencies
export const CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'THB', 'SGD'] as const;
export type Currency = (typeof CURRENCIES)[number];