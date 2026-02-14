import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://eyewearshop-api20260210202657-csdeaweda0brgmev.southeastasia-01.azurewebsites.net/api',
  // Thêm Header mặc định để tránh một số lỗi Preflight không đáng có
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Tự động gắn Token vào header nếu đã đăng nhập
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// THÊM: Interceptor để xử lý phản hồi và lỗi hệ thống
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Nếu gặp lỗi 401 (Hết hạn token) thì có thể đẩy người dùng về trang Login
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;