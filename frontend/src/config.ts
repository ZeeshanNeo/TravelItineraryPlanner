/**
 * Application Configuration
 */

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, '');

export const API_ORIGIN = API_BASE_URL.endsWith('/api')
  ? API_BASE_URL.slice(0, -4) || window.location.origin
  : API_BASE_URL.startsWith('http')
    ? API_BASE_URL
    : window.location.origin;

export const getAssetUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${API_ORIGIN}/${normalizedPath}`;
};
