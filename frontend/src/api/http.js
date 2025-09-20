import axios from "axios";
import { tokenStorage } from "./tokenStorage";

export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const http = axios.create({
  baseURL: API_BASE,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

// Uvek dodaj Bearer token ako postoji
http.interceptors.request.use((config) => {
  const token = tokenStorage.read();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Ako backend vrati 401, očisti lokalni token
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) tokenStorage.clear();
    return Promise.reject(err);
  }
);

export default http;