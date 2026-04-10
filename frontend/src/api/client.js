import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF token to every mutating request
client.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    // Try to get from cookie first
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='));
    if (cookie) {
      config.headers['X-CSRFToken'] = cookie.split('=')[1];
    } else {
      // Fetch it from Django
      try {
        const resp = await axios.get('/api/auth/csrf/', { withCredentials: true });
        config.headers['X-CSRFToken'] = resp.data.csrfToken;
      } catch {
        // continue without
      }
    }
  }
  return config;
});

export default client;
