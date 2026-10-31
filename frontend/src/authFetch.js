const API = 'http://localhost:5000';
const originalFetch = window.fetch.bind(window);

window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  const isApi = url.startsWith(API + '/api/');
  const isLogin = url === API + '/api/auth/login';
  if (!isApi || isLogin) return originalFetch(input, init);

  const token = localStorage.getItem('sw_token');
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', 'Bearer ' + token);

  const res = await originalFetch(input, { ...init, headers });
  if (res.status === 401) {
    localStorage.removeItem('sw_token');
    window.location.reload();
  }
  return res;
};
