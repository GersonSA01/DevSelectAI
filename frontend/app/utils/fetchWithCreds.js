export const fetchWithCreds = (url, options = {}) =>
  fetch(url, { credentials: 'include', ...options });