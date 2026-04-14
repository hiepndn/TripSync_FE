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
    RATE: (groupId: string | number, activityId: string | number) =>
      `/api/groups/${groupId}/activities/${activityId}/rate`,
    SUGGESTIONS: (groupId: string | number) =>
      `/api/groups/${groupId}/activities/suggestions`,
  },
  USER: {
    GET_PROFILE: '/api/auth/me',
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
};
