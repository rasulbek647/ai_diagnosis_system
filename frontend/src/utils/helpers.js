// helpers.js — Common utility functions

/**
 * Format ISO date string to local readable format
 */
export function formatDate(isoString, locale = 'uz-UZ') {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleDateString(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Clamp number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Truncate string to maxLen, adding ellipsis
 */
export function truncate(str, maxLen = 50) {
  if (!str || str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '…';
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}