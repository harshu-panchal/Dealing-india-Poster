/**
 * useReturnUrl
 * Captures `?return_url=...` from the query string on first mount and
 * persists it in localStorage so refreshes don't lose the origin address.
 *
 * Usage:
 *   Call `captureReturnUrl()` once at app root mount.
 *   Call `getReturnUrl()` anywhere to get the destination URL.
 */

const STORAGE_KEY = 'dealing_india_return_url';
const FALLBACK_URL = 'https://dealingindia.com/b2b/catalog';

/**
 * Call this once when the app mounts (e.g., inside a useEffect in AppContent).
 * Reads `?return_url` from the current address bar and saves it to localStorage.
 */
export function captureReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('return_url');
  if (returnUrl) {
    localStorage.setItem(STORAGE_KEY, returnUrl);
  }
}

/**
 * Returns the stored return URL, or the fallback if none exists.
 */
export function getReturnUrl() {
  return localStorage.getItem(STORAGE_KEY) || FALLBACK_URL;
}

/**
 * Returns true if a return_url is stored (i.e. user came from Dealing India).
 */
export function hasReturnUrl() {
  return !!localStorage.getItem(STORAGE_KEY);
}
