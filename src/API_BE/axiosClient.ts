import axios from 'axios';

const axiosClient = axios.create({
  baseURL:
    'https://eyewearshop-api20260210202657-csdeaweda0brgmev.southeastasia-01.azurewebsites.net/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ⚠️ Biến toàn cục chống redirect lặp
let isRedirecting = false;

// ===== REQUEST INTERCEPTOR =====
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
axiosClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ❌ Không xử lý nếu không phải 401
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // ❌ Không refresh cho auth API
    if (originalRequest.url?.includes('/auth/')) {
      return Promise.reject(error);
    }

    // ❌ Nếu đã retry rồi → logout luôn
    if (originalRequest._retry) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      logoutAndRedirect();
      return Promise.reject(error);
    }

    try {
      // ===== CALL REFRESH API =====
      const res = await axios.post(
        `${axiosClient.defaults.baseURL}/auth/refresh`,
        { refreshToken }
      );

      const newAccessToken = res.data.accessToken;

      // Lưu token mới
      localStorage.setItem('accessToken', newAccessToken);

      // Gắn vào request cũ
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Gọi lại request ban đầu
      return axiosClient(originalRequest);

    } catch (refreshError) {
      console.error('Refresh token hết hạn.');
      logoutAndRedirect();
      return Promise.reject(refreshError);
    }
  }
);

// ===== HÀM LOGOUT CHUẨN =====
function logoutAndRedirect() {
  if (isRedirecting) return;

  // Xóa toàn bộ LocalStorage
  localStorage.clear();

  // Xoá Cookie Session hiện tại ở Frontend
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  // Thông báo cho Header cập nhật
  window.dispatchEvent(new Event('authChanged'));

  const publicPaths = ['/login', '/register'];

  if (!publicPaths.includes(window.location.pathname)) {
    window.location.replace('/login');
  }
}

export default axiosClient;