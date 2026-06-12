import axios from "axios";

const rawUrl = import.meta.env.VITE_API_URL || "";
const baseURL = rawUrl
  ? rawUrl.replace(/\/api\/?$/, "") + "/api"
  : "/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticacion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
    }
    return Promise.reject(error);
  },
);

export default api;
