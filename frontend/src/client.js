import axios from "axios";
import { API_BASE_URL } from "./config";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // Jeśli używasz ciasteczek HTTP-only
});

let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach(callback => callback(newAccessToken));
  refreshSubscribers = [];
};

// Poprawione nazwy kluczy w localStorage (spójność z resztą aplikacji)
const getAccessToken = () => localStorage.getItem("access");
const getRefreshToken = () => localStorage.getItem("refresh");
const clearTokens = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

client.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest.url.includes("login");
    const isRefreshRequest = originalRequest.url.includes("token/refresh");

    // Obsługa tylko błędów 401, z wyjątkiem żądań logowania/refresh
    if (error.response?.status === 401 && !isLoginRequest && !isRefreshRequest) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        if (isRefreshing) {
          return new Promise((resolve) => {
            addRefreshSubscriber((newToken) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(client(originalRequest));
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (!refreshToken) throw new Error("No refresh token available");

          const response = await axios.post(
            `${API_BASE_URL}token/refresh/`,
            { refresh: refreshToken },
            { _skipAuthRefresh: true } // Flaga aby uniknąć rekurencji
          );

          const newAccessToken = response.data.access;
          localStorage.setItem("access", newAccessToken);

          client.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          onRefreshed(newAccessToken);

          return client(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          clearTokens();

          // Unikaj pętli przekierowań
          if (!window.location.pathname.includes("login")) {
            window.location.assign("/login?sessionExpired=true");
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Obsługa innych błędów
    if (error.response?.status === 403) {
      console.warn("Forbidden access - insufficient permissions");
    }

    return Promise.reject(error);
  }
);

// Dodatkowe metody pomocnicze
client.setAuthTokens = ({ access, refresh }) => {
  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  client.defaults.headers.Authorization = `Bearer ${access}`;
};

client.clearAuthTokens = () => {
  clearTokens();
  delete client.defaults.headers.Authorization;
};

export default client;