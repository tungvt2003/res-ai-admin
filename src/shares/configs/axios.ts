import axios, { AxiosInstance } from "axios";
import { store } from "../stores";
import { clearTokens, setTokens } from "../stores/authSlice";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:9999",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ---------------- Request Interceptor ----------------
// Thêm token nếu có
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ---------------- Response Interceptor ----------------
// Xử lý lỗi chung hoặc logout nếu 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    return Promise.reject(error);
  },
);

export default api;
