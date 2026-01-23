import { ROLE_PERMISSIONS, Role, Permission } from '@/config/constants';

export const checkPermission = (userRole: Role, permission: Permission): boolean => {
  if (!userRole || !permission) return false;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
};

export const isAdmin = (userRole: Role): boolean => userRole === 'admin';

export const isMember = (userRole: Role): boolean => userRole === 'member';