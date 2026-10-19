import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones: incluye token si existe en almacenamiento local
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('devboard_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: extrae datos y normaliza errores según formato { error: "mensaje" }
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.error ||
      error.message ||
      'Error de conexión con el servidor';

    // Manejo de desautenticación / sesión expirada
    if (status === 401) {
      localStorage.removeItem('devboard_token');
      localStorage.removeItem('devboard_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const customError = new Error(errorMessage);
    customError.status = status;
    customError.data = error.response?.data;
    customError.response = error.response;

    return Promise.reject(customError);
  }
);

export default apiClient;
