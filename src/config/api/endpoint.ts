export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
  },
  GROUP: {
    CREATE: '/api/groups',
    JOIN: '/api/groups/join',
    GET_DETAIL: (id: string | number) => `/api/groups/${id}`,
    REGENERATE_AI: (groupId: string | number) => `/api/groups/${groupId}/regenerate-ai`,
    UPDATE: (id: string | number) => `/api/groups/${id}`,
    KICK_MEMBER: (groupId: string | number, userId: string | number) => `/api/groups/${groupId}/members/${userId}`,
    DELETE: (id: string | number) => `/api/groups/${id}`,
    UPDATE_VISIBILITY: (id: string | number) => `/api/groups/${id}/visibility`,
    PUBLIC_LIST: '/api/groups/public',
    PUBLIC_DETAIL: (id: string | number) => `/api/groups/public/${id}`,
  },
  ACTIVITY: {
    LIST: (groupId: string | number) => `/api/groups/${groupId}/activity`,
    CREATE: (groupId: string | number) => `/api/groups/${groupId}/activity`,
    FINALIZE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}/finalize`,
    VOTE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}/vote`,
    UPDATE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}`,
    DELETE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}`,
    DELETE_ALL: (groupId: string | number) => `/api/groups/${groupId}/activities`,
    RATE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}/rate`,
    SUGGESTIONS: (groupId: string | number) =>
      `/api/groups/${groupId}/activities/suggestions`,
    EXPORT: (groupId: string | number) => `/api/groups/${groupId}/export`,
    IMPORT: (groupId: string | number) => `/api/groups/${groupId}/import`,
    IMPORT_JSON: (groupId: string | number) => `/api/groups/${groupId}/import-json`,
  },
  USER: {
    GET_PROFILE: '/api/auth/me',
  },
  FAVORITE: {
    TOGGLE: (groupId: string | number) => `/api/groups/${groupId}/favorite`,
    LIST: '/api/favorites',
  },
  EXPENSE: {
    CREATE: (groupId: string | number) => `/api/groups/${groupId}/expenses`,
    GET_LIST: (groupId: string | number) => `/api/groups/${groupId}/expenses`,
    GET_DEBTS: (groupId: string | number) => `/api/groups/${groupId}/debts`,
    SETTLE: (groupId: string | number) => `/api/groups/${groupId}/debts/settle`,
    GET_SUMMARY: (groupId: string | number) => `/api/groups/${groupId}/expenses/summary`,
  },
  CHECKLIST: {
    GET_ALL: (groupId: string | number) => `/api/groups/${groupId}/checklist/`,
    CREATE: (groupId: string | number) => `/api/groups/${groupId}/checklist/`,
    TOGGLE: (groupId: string | number, itemId: string | number) => `/api/groups/${groupId}/checklist/${itemId}/toggle`,
    ASSIGN: (groupId: string | number, itemId: string | number) => `/api/groups/${groupId}/checklist/${itemId}/assign`,
    DELETE: (groupId: string | number, itemId: string | number) => `/api/groups/${groupId}/checklist/${itemId}`,
  },
  DOCUMENT: {
    LIST: (groupId: string | number) => `/api/groups/${groupId}/documents`,
    CREATE: (groupId: string | number) => `/api/groups/${groupId}/documents`,
    DELETE: (groupId: string | number, docId: string | number) => `/api/groups/${groupId}/documents/${docId}`,
  },
};
