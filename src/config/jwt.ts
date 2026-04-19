/**
 * Decode JWT payload (không verify signature — chỉ dùng ở FE để đọc claims)
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const base64Payload = token.split('.')[1];
    const payload = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getTokenRole(): string | null {
  const token = localStorage.getItem('jwt');
  if (!token) return null;
  const claims = decodeJWT(token);
  return claims?.role ?? null;
}
