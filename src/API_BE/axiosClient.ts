import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://eyewearshop-api20260210202657-csdeaweda0brgmev.southeastasia-01.azurewebsites.net/api',
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

// Xử lý phản hồi và Tự động Refresh Token khi lỗi 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu gặp lỗi 401 và request này chưa từng thử refresh (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử refresh để tránh lặp vô hạn
      const refreshToken = localStorage.getItem('refreshToken');

      // Nếu có refreshToken trong máy thì mới tiến hành làm mới
      if (refreshToken) {
        try {
          // Gọi API refresh token theo đúng schema yêu cầu
          const res = await axios.post(
            `${axiosClient.defaults.baseURL}/auth/refresh`, 
            { refreshToken: refreshToken }
          );

          if (res.status === 200 || res.status === 201) {
            // Giả sử API trả về data chứa { accessToken: '...' }
            const newAccessToken = res.data.accessToken;

            // 1. Lưu token mới vào bộ nhớ
            localStorage.setItem('accessToken', newAccessToken);

            // 2. Gắn token mới vào header của request ban đầu bị lỗi
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // 3. Thực thi lại request ban đầu với token mới
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          // Nếu Refresh Token cũng hết hạn (lỗi 403/401 khi gọi API refresh)
          console.error("Phiên đăng nhập đã hết hạn hoàn toàn.");
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // Không có refreshToken thì đẩy về login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;